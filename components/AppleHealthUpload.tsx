"use client";

// N=014: opt-in upload card for the Apple Health plugin. Mounts above
// the assessment form's existing fields. Users who do not own an iOS
// device, or who choose not to upload, can ignore this card entirely
// and the assessment form behaves byte-identically to N=013.
//
// Locked palette only — no hex literals.

import { useRef, useState } from "react";
import { Check, Loader2, Upload } from "lucide-react";

import type { TaggedUserInput } from "@/lib/types";

interface AppleHealthSummary {
  averageDailySteps?: number;
  averageSleepHours?: number;
  restingHeartRate?: number;
}

interface UploadResponse {
  tagged: TaggedUserInput[];
  summary: AppleHealthSummary;
}

export function AppleHealthUpload({
  onTagged,
}: {
  onTagged?: (entries: TaggedUserInput[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [summary, setSummary] = useState<AppleHealthSummary>({});

  function pickFile() {
    inputRef.current?.click();
  }

  async function upload() {
    if (!file || loading) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/plugins/apple-health", {
        method: "POST",
        body: form,
      });
      // Per the locked fail-silently rule, the API never returns an error
      // status; we still defensively guard against malformed JSON.
      const data = (await res.json().catch(() => ({
        tagged: [],
        summary: {},
      }))) as UploadResponse;
      setSummary(data.summary ?? {});
      setConnected(true);
      onTagged?.(Array.isArray(data.tagged) ? data.tagged : []);
    } catch {
      // Fail silently — leave the card in its idle state.
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }

  if (connected) {
    return (
      <section
        data-testid="apple-health-upload"
        aria-label="Apple Health connected"
        className="w-full max-w-md bg-ink border border-paper/15 rounded-lg p-4 sm:p-5 flex flex-col gap-3"
      >
        <header className="flex items-center gap-2">
          <Check className="w-4 h-4 text-lime" aria-hidden="true" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-lime">
            Connected · Apple Health
          </span>
        </header>
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <li className="flex flex-col gap-0.5 border border-paper/10 rounded-md px-3 py-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-paper/55">
              Steps
            </span>
            <span className="font-serif text-base text-paper leading-tight">
              {summary.averageDailySteps != null
                ? `${summary.averageDailySteps.toLocaleString("en-US")} / day`
                : "—"}
            </span>
          </li>
          <li className="flex flex-col gap-0.5 border border-paper/10 rounded-md px-3 py-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-paper/55">
              Sleep
            </span>
            <span className="font-serif text-base text-paper leading-tight">
              {summary.averageSleepHours != null
                ? `${summary.averageSleepHours} hrs / night`
                : "—"}
            </span>
          </li>
          <li className="flex flex-col gap-0.5 border border-paper/10 rounded-md px-3 py-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-paper/55">
              Resting HR
            </span>
            <span className="font-serif text-base text-paper leading-tight">
              {summary.restingHeartRate != null
                ? `${summary.restingHeartRate} bpm`
                : "—"}
            </span>
          </li>
        </ul>
        <p className="text-[11px] font-mono uppercase tracking-wider text-paper/45">
          Your stack will use these signals on top of the form below.
        </p>
      </section>
    );
  }

  return (
    <section
      data-testid="apple-health-upload"
      aria-label="Connect Apple Health"
      className="w-full max-w-md bg-ink border border-paper/15 rounded-lg p-4 sm:p-5 flex flex-col gap-3"
    >
      <header className="flex items-center gap-2">
        <Upload className="w-4 h-4 text-lime" aria-hidden="true" />
        <span className="font-mono text-[11px] uppercase tracking-wider text-lime">
          Connect Apple Health
        </span>
      </header>
      <p className="text-sm text-paper/80 leading-snug">
        Upload your iOS Health export to feed real steps, sleep, and resting heart rate into your stack. Optional — skip if you do not have one.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept=".xml,application/xml,text/xml"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          setFile(f);
        }}
      />
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={pickFile}
          className="inline-flex items-center gap-1.5 border border-paper/30 text-paper font-mono text-[11px] uppercase tracking-wider rounded-md px-3 py-2 hover:border-lime"
        >
          {file ? "Change file" : "Choose .xml file"}
        </button>
        <button
          type="button"
          onClick={upload}
          disabled={!file || loading}
          aria-label="Upload Apple Health export"
          className="inline-flex items-center gap-1.5 bg-lime text-ink font-mono text-[11px] font-semibold uppercase tracking-wider rounded-md px-3 py-2 hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
              Uploading
            </>
          ) : (
            <>
              <Upload className="w-3.5 h-3.5" aria-hidden="true" />
              Upload export
            </>
          )}
        </button>
        {file ? (
          <span className="font-mono text-[10px] uppercase tracking-wider text-paper/55 truncate max-w-[160px]">
            {file.name}
          </span>
        ) : null}
      </div>
    </section>
  );
}
