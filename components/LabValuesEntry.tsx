"use client";

// N=017: opt-in lab values entry card. Mounts BELOW AppleHealthUpload
// on the assessment form. Users type bloodwork values from a printed
// lab report; submission produces TaggedUserInput entries at layer="lab"
// (the highest priority weight in the Signal Stack) with confidence
// 0.95.
//
// Locked palette only — no hex literals. Card matches the visual
// language of N=014's AppleHealthUpload card.

import { useState } from "react";
import { Check, Loader2, TestTube } from "lucide-react";

import type { ManualLabValue, TaggedUserInput } from "@/lib/types";

interface LabValuesEntryProps {
  onTagged?: (entries: TaggedUserInput[]) => void;
}

interface PostResponse {
  tagged: TaggedUserInput[];
  error?: string;
}

interface DraftValues {
  ferritin_ng_ml: string;
  vitamin_d_25oh_ng_ml: string;
  b12_pg_ml: string;
  magnesium_mg_dl: string;
  tsh_uiu_ml: string;
}

const EMPTY_DRAFT: DraftValues = {
  ferritin_ng_ml: "",
  vitamin_d_25oh_ng_ml: "",
  b12_pg_ml: "",
  magnesium_mg_dl: "",
  tsh_uiu_ml: "",
};

interface FieldDescriptor {
  key: keyof DraftValues;
  label: string;
  unit: string;
  placeholder: string;
  step: string;
}

const FIELDS: ReadonlyArray<FieldDescriptor> = [
  { key: "ferritin_ng_ml",      label: "Ferritin",         unit: "ng/mL",  placeholder: "30–250",  step: "1" },
  { key: "vitamin_d_25oh_ng_ml", label: "Vitamin D 25-OH", unit: "ng/mL",  placeholder: "30–80",   step: "1" },
  { key: "b12_pg_ml",            label: "Vitamin B12",     unit: "pg/mL",  placeholder: "300–900", step: "1" },
  { key: "magnesium_mg_dl",      label: "Magnesium",       unit: "mg/dL",  placeholder: "1.7–2.4", step: "0.1" },
  { key: "tsh_uiu_ml",           label: "TSH",             unit: "µIU/mL", placeholder: "0.4–4.5", step: "0.1" },
];

const HUMAN_LABEL: Record<keyof DraftValues, string> = {
  ferritin_ng_ml: "Ferritin (ng/mL)",
  vitamin_d_25oh_ng_ml: "Vitamin D 25-OH (ng/mL)",
  b12_pg_ml: "Vitamin B12 (pg/mL)",
  magnesium_mg_dl: "Magnesium (mg/dL)",
  tsh_uiu_ml: "TSH (µIU/mL)",
};

function draftToManual(draft: DraftValues): ManualLabValue {
  const out: ManualLabValue = {};
  for (const f of FIELDS) {
    const raw = draft[f.key];
    if (raw === "") continue;
    const n = Number(raw);
    if (Number.isFinite(n)) (out as Record<string, number>)[f.key] = n;
  }
  return out;
}

function appliedSummary(draft: DraftValues): string[] {
  const out: string[] = [];
  for (const f of FIELDS) {
    const raw = draft[f.key];
    if (raw === "") continue;
    const n = Number(raw);
    if (Number.isFinite(n)) out.push(`${HUMAN_LABEL[f.key]} = ${n}`);
  }
  return out;
}

export function LabValuesEntry({ onTagged }: LabValuesEntryProps) {
  const [draft, setDraft] = useState<DraftValues>(EMPTY_DRAFT);
  const [submitting, setSubmitting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [appliedLabels, setAppliedLabels] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  function update(key: keyof DraftValues, raw: string) {
    // Allow empty + decimal-friendly numeric input.
    const cleaned = raw.replace(/[^0-9.]/g, "");
    setDraft((d) => ({ ...d, [key]: cleaned }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    const manual = draftToManual(draft);
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/plugins/lab-placeholder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(manual),
      });
      const data = (await res.json().catch(() => ({}))) as PostResponse;
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not apply lab values.");
        return;
      }
      const tagged = Array.isArray(data.tagged) ? data.tagged : [];
      onTagged?.(tagged);
      setAppliedLabels(appliedSummary(draft));
      setConnected(true);
    } catch {
      setError("Could not apply lab values.");
    } finally {
      setSubmitting(false);
    }
  }

  if (connected) {
    return (
      <section
        data-testid="lab-values-entry"
        aria-label="Lab values applied"
        className="w-full max-w-md bg-ink border border-paper/15 rounded-lg p-4 sm:p-5 flex flex-col gap-3"
      >
        <header className="flex items-center gap-2">
          <Check className="w-4 h-4 text-lime" aria-hidden="true" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-lime">
            Connected · Lab values
          </span>
        </header>
        {appliedLabels.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {appliedLabels.map((label, i) => (
              <li
                key={i}
                className="font-mono text-[11px] uppercase tracking-wider text-paper/75 border border-paper/10 rounded-md px-3 py-1.5"
              >
                {label}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-paper/70">No values entered.</p>
        )}
        <p className="text-[11px] font-mono uppercase tracking-wider text-paper/45">
          Lab inputs override the assessment form on conflicting fields.
        </p>
      </section>
    );
  }

  return (
    <section
      data-testid="lab-values-entry"
      aria-label="Enter lab values"
      className="w-full max-w-md bg-ink border border-paper/15 rounded-lg p-4 sm:p-5 flex flex-col gap-3"
    >
      <header className="flex items-center gap-2">
        <TestTube className="w-4 h-4 text-lime" aria-hidden="true" />
        <span className="font-mono text-[11px] uppercase tracking-wider text-lime">
          Enter lab values
        </span>
      </header>
      <p className="text-sm text-paper/80 leading-snug">
        Type bloodwork values from a printed lab report. The protocol prioritizes lab inputs over self-reported behavior.
      </p>
      <form onSubmit={submit} className="flex flex-col gap-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {FIELDS.map((f) => (
            <label
              key={f.key}
              htmlFor={`lab-${f.key}`}
              className="flex flex-col gap-1"
            >
              <span className="font-mono text-[10px] uppercase tracking-wider text-paper/55">
                {f.label} ({f.unit})
              </span>
              <input
                id={`lab-${f.key}`}
                type="number"
                inputMode="decimal"
                step={f.step}
                placeholder={f.placeholder}
                value={draft[f.key]}
                onChange={(e) => update(f.key, e.target.value)}
                aria-label={`${f.label} (${f.unit})`}
                className="bg-ink border border-paper/20 rounded-md px-2.5 py-1.5 text-sm text-paper placeholder:text-paper/30 focus:outline-none focus:border-lime"
              />
            </label>
          ))}
        </div>
        {error ? (
          <p
            role="alert"
            className="text-[11px] font-mono uppercase tracking-wider text-clinical leading-snug"
          >
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <button
            type="submit"
            disabled={submitting}
            aria-label="Apply lab values"
            className="inline-flex items-center gap-1.5 bg-lime text-ink font-mono text-[11px] font-semibold uppercase tracking-wider rounded-md px-3 py-2 hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                Applying
              </>
            ) : (
              <>
                <TestTube className="w-3.5 h-3.5" aria-hidden="true" />
                Apply lab values
              </>
            )}
          </button>
          <span className="font-mono text-[10px] uppercase tracking-wider text-paper/45">
            Optional — fill in only what you have
          </span>
        </div>
      </form>
    </section>
  );
}
