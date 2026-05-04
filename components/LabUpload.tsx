"use client";

import { useState } from "react";
import { Upload } from "lucide-react";

import type { LabValues, Recommendation } from "@/lib/types";

import { LabComparison } from "./LabComparison";

interface RecomputeResponse {
  original: Recommendation;
  adjusted: Recommendation;
  overrides: string[];
  deltas: {
    addedSupplements: string[];
    removedSupplements: string[];
    confidenceDeltas: { name: string; before: number; after: number }[];
  };
}

export function LabUpload({ slug }: { slug: string }) {
  const [stage, setStage] = useState<"idle" | "uploading" | "parsed" | "recomputing" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<LabValues | null>(null);
  const [comparison, setComparison] = useState<RecomputeResponse | null>(null);

  async function uploadFile(file: File) {
    setStage("uploading");
    setError(null);
    setValues(null);
    setComparison(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/labs/parse", { method: "POST", body: fd });
      if (res.status === 503) throw new Error("Lab parser is not configured on this deployment.");
      if (res.status === 422) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(
          data.error === "format_not_recognized"
            ? "We could not recognize this lab format. Quest, LabCorp, and ZRT are supported today."
            : data.error ?? "Lab parse failed.",
        );
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `Upload failed (${res.status}).`);
      }
      const data = (await res.json()) as { ok: true; values: LabValues };
      setValues(data.values);
      setStage("recomputing");

      const recRes = await fetch("/api/labs/recompute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, labValues: data.values }),
      });
      if (!recRes.ok) {
        const d = (await recRes.json().catch(() => ({}))) as { error?: string };
        throw new Error(d.error ?? `Recompute failed (${recRes.status}).`);
      }
      const recData = (await recRes.json()) as RecomputeResponse;
      setComparison(recData);
      setStage("done");
    } catch (err) {
      setStage("error");
      setError(err instanceof Error ? err.message : "Lab parse failed.");
    }
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void uploadFile(file);
  }

  return (
    <section
      aria-label="Lab result upload"
      className="border border-paper/15 rounded-lg p-5 sm:p-6 flex flex-col gap-4"
    >
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <h3 className="font-serif text-xl sm:text-2xl text-paper leading-tight">
          Upload bloodwork. Re-run the engine on measured values.
        </h3>
        <span className="font-mono text-[11px] uppercase tracking-wider text-paper/60">
          Pro · Lab integration
        </span>
      </div>
      <p className="text-sm text-paper/75 leading-snug">
        Quest, LabCorp, or ZRT PDF. Ferritin, vitamin D, B12, magnesium, lipids,
        glucose, and HbA1c are extracted. The raw file is never stored.
      </p>

      <label
        htmlFor="lab-pdf"
        className="flex items-center gap-3 border border-dashed border-paper/30 rounded-md px-4 py-3 cursor-pointer hover:border-lime"
      >
        <Upload className="w-4 h-4 text-lime" aria-hidden="true" />
        <span className="font-mono text-[11px] uppercase tracking-wider text-paper/70">
          {stage === "uploading"
            ? "Parsing PDF…"
            : stage === "recomputing"
            ? "Re-running engine on measured values…"
            : "Choose lab PDF"}
        </span>
        <input
          id="lab-pdf"
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={onChange}
          disabled={stage === "uploading" || stage === "recomputing"}
        />
      </label>

      {error ? (
        <p
          role="alert"
          className="text-[11px] font-mono uppercase tracking-wider text-clinical"
        >
          {error}
        </p>
      ) : null}

      {comparison ? (
        <LabComparison
          values={values ?? {}}
          original={comparison.original}
          adjusted={comparison.adjusted}
          overrides={comparison.overrides}
          deltas={comparison.deltas}
        />
      ) : null}
    </section>
  );
}
