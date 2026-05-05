"use client";

// N=019: Oura paste-token UI card. Mirrors the N=018 WhoopConnect pattern
// verbatim — honest connection state pattern is binding for all plugin
// connection UIs. Connected state is gated on tagged.length > 0; empty
// and invalid responses render distinct AlertCircle states with reset
// buttons. Token never persists.

import { useState } from "react";
import { AlertCircle, Check, Circle, Loader2 } from "lucide-react";

import type { TaggedUserInput } from "@/lib/types";

interface OuraSummary {
  sleepScore: number | null;
  readinessScore: number | null;
  asOf: string | null;
}

interface PostResponse {
  tagged: TaggedUserInput[];
  summary?: OuraSummary;
  error?: string;
}

type CardState = "idle" | "loading" | "connected" | "empty" | "invalid";

export function OuraConnect({
  onTagged,
}: {
  onTagged?: (entries: TaggedUserInput[]) => void;
}) {
  const [token, setToken] = useState("");
  const [state, setState] = useState<CardState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [summary, setSummary] = useState<OuraSummary | null>(null);

  function reset() {
    setToken("");
    setState("idle");
    setErrorMessage(null);
    setSummary(null);
    onTagged?.([]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/plugins/oura", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = (await res.json().catch(() => ({
        tagged: [],
        summary: null,
        error: "Could not parse response.",
      }))) as PostResponse;
      const tagged = Array.isArray(data.tagged) ? data.tagged : [];
      const next = data.summary ?? null;
      setSummary(next);
      // Honest connection state pattern: gate Connected on tagged.length > 0.
      if (tagged.length > 0) {
        setState("connected");
        setErrorMessage(null);
        onTagged?.(tagged);
      } else {
        // Distinguish "invalid token" from "valid token but no recent data".
        // The route returns null summary on validation/network failure but a
        // populated summary when the token was good but data was empty.
        if (next && (next.sleepScore !== null || next.readinessScore !== null || next.asOf !== null)) {
          setState("empty");
        } else {
          setState("invalid");
        }
        setErrorMessage(typeof data.error === "string" ? data.error : "Could not connect Oura.");
        onTagged?.([]);
      }
    } catch {
      setState("invalid");
      setErrorMessage("Network error. Please try again.");
      onTagged?.([]);
    }
  }

  if (state === "connected" && summary) {
    return (
      <section
        data-testid="oura-connect"
        aria-label="Oura connected"
        className="w-full max-w-md bg-ink border border-paper/15 rounded-lg p-4 sm:p-5 flex flex-col gap-3"
      >
        <header className="flex items-center gap-2">
          <Check className="w-4 h-4 text-lime" aria-hidden="true" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-lime">
            Connected · Oura
          </span>
        </header>
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <li className="flex flex-col gap-0.5 border border-paper/10 rounded-md px-3 py-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-paper/55">
              Sleep score
            </span>
            <span className="font-serif text-base text-paper leading-tight">
              {summary.sleepScore != null ? `${summary.sleepScore} / 100` : "—"}
            </span>
          </li>
          <li className="flex flex-col gap-0.5 border border-paper/10 rounded-md px-3 py-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-paper/55">
              Readiness
            </span>
            <span className="font-serif text-base text-paper leading-tight">
              {summary.readinessScore != null ? `${summary.readinessScore} / 100` : "—"}
            </span>
          </li>
          <li className="flex flex-col gap-0.5 border border-paper/10 rounded-md px-3 py-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-paper/55">
              As of
            </span>
            <span className="font-serif text-base text-paper leading-tight">
              {summary.asOf ? summary.asOf.slice(0, 10) : "—"}
            </span>
          </li>
        </ul>
        <p className="text-[11px] font-mono uppercase tracking-wider text-paper/45">
          Your stack will use these wearable signals on top of the form below.
        </p>
      </section>
    );
  }

  if (state === "empty") {
    return (
      <section
        data-testid="oura-connect"
        aria-label="Oura no recent data"
        className="w-full max-w-md bg-ink border border-paper/15 rounded-lg p-4 sm:p-5 flex flex-col gap-3"
      >
        <header className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-clinical" aria-hidden="true" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-clinical">
            No Oura data · Last 7 days
          </span>
        </header>
        <p className="text-sm text-paper/80 leading-snug">
          {errorMessage ?? "No recent data found in your Oura account."}
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
        data-testid="oura-connect"
        aria-label="Oura invalid token"
        className="w-full max-w-md bg-ink border border-paper/15 rounded-lg p-4 sm:p-5 flex flex-col gap-3"
      >
        <header className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-clinical" aria-hidden="true" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-clinical">
            Invalid token · Oura
          </span>
        </header>
        <p className="text-sm text-paper/80 leading-snug">
          {errorMessage ?? "Could not connect Oura."}
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
      data-testid="oura-connect"
      aria-label="Connect Oura"
      className="w-full max-w-md bg-ink border border-paper/15 rounded-lg p-4 sm:p-5 flex flex-col gap-3"
    >
      <header className="flex items-center gap-2">
        <Circle className="w-4 h-4 text-lime" aria-hidden="true" />
        <span className="font-mono text-[11px] uppercase tracking-wider text-lime">
          Connect Oura
        </span>
      </header>
      <p className="text-sm text-paper/80 leading-snug">
        Paste your Oura personal access token to feed sleep score and readiness into your stack. Generate one at{" "}
        <a
          href="https://cloud.ouraring.com/personal-access-tokens"
          target="_blank"
          rel="noopener noreferrer"
          className="text-lime underline hover:brightness-110"
        >
          cloud.ouraring.com
        </a>
        .
      </p>
      <form onSubmit={submit} className="flex flex-col gap-2">
        <label htmlFor="oura-token" className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-wider text-paper/55">
            Personal access token
          </span>
          <input
            id="oura-token"
            type="text"
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            placeholder="paste here"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            aria-label="Oura personal access token"
            className="bg-ink border border-paper/20 rounded-md px-2.5 py-1.5 text-sm text-paper placeholder:text-paper/30 focus:outline-none focus:border-lime font-mono"
          />
        </label>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <button
            type="submit"
            disabled={state === "loading" || token.trim().length === 0}
            aria-label="Connect Oura"
            className="inline-flex items-center gap-1.5 bg-lime text-ink font-mono text-[11px] font-semibold uppercase tracking-wider rounded-md px-3 py-2 hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {state === "loading" ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                Connecting
              </>
            ) : (
              <>
                <Circle className="w-3.5 h-3.5" aria-hidden="true" />
                Connect Oura
              </>
            )}
          </button>
          <span className="font-mono text-[10px] uppercase tracking-wider text-paper/45">
            Optional · Token never stored
          </span>
        </div>
      </form>
    </section>
  );
}
