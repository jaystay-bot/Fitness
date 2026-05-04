"use client";

import { useState } from "react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailCapture({
  verdict,
  slug,
}: {
  verdict: string;
  slug: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  if (!verdict || !slug) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_REGEX.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/email/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, slug, verdict }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error ?? `Request failed (${res.status}).`);
      }
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Send failed.");
    }
  }

  if (status === "sent") {
    return (
      <aside
        aria-live="polite"
        className="border border-paper/15 rounded-lg p-5 sm:p-6 flex flex-col gap-2"
      >
        <span className="font-mono text-[11px] uppercase tracking-wider text-lime">
          Email capture
        </span>
        <p className="font-serif text-xl text-paper">Sent. Check your inbox.</p>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Email capture"
      className="border border-paper/15 rounded-lg p-5 sm:p-6 flex flex-col gap-3"
    >
      <span className="font-mono text-[11px] uppercase tracking-wider text-paper/60">
        Take this with you
      </span>
      <h3 className="font-serif text-xl sm:text-2xl text-paper leading-tight">
        Want this protocol in your inbox?
      </h3>
      <p className="text-sm text-paper/75 leading-snug">
        We send your shareable result link and a one-time summary. No newsletter.
      </p>
      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
        <label htmlFor="email-capture" className="sr-only">
          Email address
        </label>
        <input
          id="email-capture"
          type="email"
          required
          inputMode="email"
          autoComplete="email"
          placeholder="you@domain.com"
          className="flex-1 bg-ink border border-paper/20 rounded-md px-3 py-2 text-sm text-paper placeholder:text-paper/40 focus:outline-none focus:border-lime"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "submitting"}
        />
        <button
          type="submit"
          aria-label="Email me my protocol"
          disabled={status === "submitting"}
          className="inline-flex items-center justify-center bg-lime text-ink font-semibold uppercase tracking-wider text-sm rounded-md px-4 py-2.5 hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === "submitting" ? "Sending…" : "Email me my protocol"}
        </button>
      </form>
      <p className="text-[11px] font-mono uppercase tracking-wider text-paper/60">
        We send one email then delete your address unless you create an account.
      </p>
      {error ? (
        <p
          role="alert"
          className="text-[11px] font-mono uppercase tracking-wider text-clinical"
        >
          {error}
        </p>
      ) : null}
    </aside>
  );
}
