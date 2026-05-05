"use client";

// N=018: Whoop paste-token card. Mounts on the assessment form between
// LabValuesEntry (N=017) and the form fields. Honest connection state
// (the pattern locked in this cycle): the "Connected" visual is gated
// on tagged.length > 0; empty results render an explicit "No data" or
// "Invalid token" state with a clinical-orange AlertCircle icon, never
// the false-Connected blank-dash state Jay reported in N=014's pre-fix
// AppleHealthUpload.
//
// Locked palette only — no hex literals. Card visual language matches
// the existing AppleHealthUpload + LabValuesEntry cards.

import { useState } from "react";
import { Activity, AlertCircle, Check, Loader2 } from "lucide-react";

import type { TaggedUserInput } from "@/lib/types";

interface PostResponse {
  tagged: TaggedUserInput[];
  summary?: {
    recoveryScore: number | null;
    dayStrain: number | null;
    asOf: string | null;
  };
  error?: string;
}

type CardState = "idle" | "loading" | "connected" | "empty" | "invalid";

export function WhoopConnect({
  onTagged,
}: {
  onTagged?: (entries: TaggedUserInput[]) => void;
}) {
  const [token, setToken] = useState("");
  const [state, setState] = useState<CardState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [summary, setSummary] = useState<PostResponse["summary"]>(null);

  function reset() {
    setState("idle");
    setErrorMessage(null);
    setSummary(null);
    setToken("");
    onTagged?.([]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/plugins/whoop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = (await res.json().catch(() => ({
        tagged: [],
        summary: null,
        error: "Network error.",
      }))) as PostResponse;
      const tagged = Array.isArray(data.tagged) ? data.tagged : [];
      setSummary(data.summary ?? null);
      // N=018 honest connection state: gate Connected on actual data.
      if (tagged.length > 0) {
        setState("connected");
        setErrorMessage(null);
      } else if (typeof data.error === "string" && /token/i.test(data.error)) {
        setState("invalid");
        setErrorMessage(data.error);
      } else {
        setState("empty");
        setErrorMessage(typeof data.error === "string" ? data.error : null);
      }
      onTagged?.(tagged);
    } catch {
      setState("invalid");
      setErrorMessage("Network error. Try again.");
      onTagged?.([]);
    }
  }

  if (state === "connected" && summary) {
    return (
      <section
        data-testid="whoop-connect"
        aria-label="Whoop connected"
        className="w-full max-w-md bg-ink border border-paper/15 rounded-lg p-4 sm:p-5 flex flex-col gap-3"
      >
        <header className="flex items-center gap-2">
          <Check className="w-4 h-4 text-lime" aria-hidden="true" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-lime">
            Connected · Whoop
          </span>
        </header>
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <li className="flex flex-col gap-0.5 border border-paper/10 rounded-md px-3 py-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-paper/55">
              Recovery
            </span>
            <span className="font-serif text-base text-paper leading-tight">
              {summary.recoveryScore != null ? `${summary.recoveryScore}%` : "—"}
            </span>
          </li>
          <li className="flex flex-col gap-0.5 border border-paper/10 rounded-md px-3 py-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-paper/55">
              Day strain
            </span>
            <span className="font-serif text-base text-paper leading-tight">
              {summary.dayStrain != null ? summary.dayStrain.toFixed(1) : "—"}
            </span>
          </li>
          <li className="flex flex-col gap-0.5 border border-paper/10 rounded-md px-3 py-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-paper/55">
              As of
            </span>
            <span className="font-serif text-sm text-paper leading-tight">
              {summary.asOf ? new Date(summary.asOf).toLocaleDateString() : "—"}
            </span>
          </li>
        </ul>
        <p className="text-[11px] font-mono uppercase tracking-wider text-paper/45">
          Whoop signals contribute to your recommendation alongside the form below.
        </p>
      </section>
    );
  }

  if (state === "empty") {
    return (
      <section
        data-testid="whoop-connect"
        aria-label="Whoop no recent data"
        className="w-full max-w-md bg-ink border border-paper/15 rounded-lg p-4 sm:p-5 flex flex-col gap-3"
      >
        <header className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-clinical" aria-hidden="true" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-clinical">
            No Whoop data · last 7 days
          </span>
        </header>
        <p className="text-sm text-paper/80 leading-snug">
          {errorMessage ?? "No recent recovery or strain data was found in the last 7 days."}
        </p>
        <div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 border border-paper/30 text-paper font-mono text-[11px] uppercase tracking-wider rounded-md px-3 py-2 hover:border-lime"
          >
            Try another token
          </button>
        </div>
      </section>
    );
  }

  if (state === "invalid") {
    return (
      <section
        data-testid="whoop-connect"
        aria-label="Whoop invalid token"
        className="w-full max-w-md bg-ink border border-paper/15 rounded-lg p-4 sm:p-5 flex flex-col gap-3"
      >
        <header className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-clinical" aria-hidden="true" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-clinical">
            Invalid token · Whoop
          </span>
        </header>
        <p className="text-sm text-paper/80 leading-snug">
          {errorMessage ?? "Token validation failed. Please check your Whoop developer portal."}
        </p>
        <div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 border border-paper/30 text-paper font-mono text-[11px] uppercase tracking-wider rounded-md px-3 py-2 hover:border-lime"
          >
            Try another token
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      data-testid="whoop-connect"
      aria-label="Connect Whoop"
      className="w-full max-w-md bg-ink border border-paper/15 rounded-lg p-4 sm:p-5 flex flex-col gap-3"
    >
      <header className="flex items-center gap-2">
        <Activity className="w-4 h-4 text-lime" aria-hidden="true" />
        <span className="font-mono text-[11px] uppercase tracking-wider text-lime">
          Connect Whoop
        </span>
      </header>
      <p className="text-sm text-paper/80 leading-snug">
        Paste your Whoop personal access token. The protocol pulls recent recovery and strain to refine your stack.
      </p>
      <form onSubmit={submit} className="flex flex-col gap-2">
        <label htmlFor="whoop-token" className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-wider text-paper/55">
            Personal access token
          </span>
          <input
            id="whoop-token"
            type="text"
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            placeholder="eyJhbGciOiJIUzI1NiJ9..."
            value={token}
            onChange={(e) => setToken(e.target.value)}
            aria-label="Whoop personal access token"
            className="bg-ink border border-paper/20 rounded-md px-2.5 py-1.5 text-sm text-paper placeholder:text-paper/30 focus:outline-none focus:border-lime"
          />
        </label>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <button
            type="submit"
            disabled={state === "loading" || token.length === 0}
            aria-label="Connect Whoop"
            className="inline-flex items-center gap-1.5 bg-lime text-ink font-mono text-[11px] font-semibold uppercase tracking-wider rounded-md px-3 py-2 hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {state === "loading" ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                Connecting
              </>
            ) : (
              <>
                <Activity className="w-3.5 h-3.5" aria-hidden="true" />
                Connect Whoop
              </>
            )}
          </button>
          <a
            href="https://developer.whoop.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] uppercase tracking-wider text-paper/55 hover:text-lime"
          >
            Get a token →
          </a>
        </div>
      </form>
    </section>
  );
}
