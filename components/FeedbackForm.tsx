"use client";

import { useState } from "react";

import { FEEDBACK_MAX_CHARS } from "@/lib/feedback";

export function FeedbackForm() {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  const trimmedLength = message.trim().length;
  const canSubmit =
    trimmedLength >= 1 &&
    trimmedLength <= FEEDBACK_MAX_CHARS &&
    status !== "submitting";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus("submitting");
    setError(null);
    try {
      const pageUrl =
        typeof window !== "undefined" ? window.location.href : "";
      const userAgent =
        typeof navigator !== "undefined" ? navigator.userAgent : "";
      const res = await fetch("/api/feedback/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          userEmail: email.trim() || null,
          pageUrl,
          userAgent,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `Send failed (${res.status}).`);
      }
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Send failed.");
    }
  }

  if (status === "sent") {
    return (
      <p className="font-serif text-xl text-paper">
        Got it. Thanks for the feedback.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3" aria-label="Feedback form">
      <label htmlFor="feedback-message" className="flex flex-col gap-1">
        <span className="font-mono text-[11px] uppercase tracking-wider text-paper/60">
          What would you like to see added or changed?
        </span>
        <textarea
          id="feedback-message"
          maxLength={FEEDBACK_MAX_CHARS}
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full bg-ink border border-paper/20 rounded-md px-3 py-2 text-sm text-paper placeholder:text-paper/40 focus:outline-none focus:border-lime resize-none"
          placeholder="A change, an idea, a bug, anything…"
          disabled={status === "submitting"}
        />
        <span className="font-mono text-[10px] uppercase tracking-wider text-paper/50 self-end">
          {trimmedLength}/{FEEDBACK_MAX_CHARS}
        </span>
      </label>

      <label htmlFor="feedback-email" className="flex flex-col gap-1">
        <span className="font-mono text-[11px] uppercase tracking-wider text-paper/60">
          Email (optional, only if you want a response)
        </span>
        <input
          id="feedback-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-ink border border-paper/20 rounded-md px-3 py-2 text-sm text-paper placeholder:text-paper/40 focus:outline-none focus:border-lime"
          placeholder="you@domain.com"
          disabled={status === "submitting"}
        />
      </label>

      <button
        type="submit"
        disabled={!canSubmit}
        aria-label="Send feedback"
        className="inline-flex items-center justify-center bg-lime text-ink font-semibold uppercase tracking-wider text-sm rounded-md px-4 py-2.5 hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "submitting" ? "Sending…" : "Send feedback"}
      </button>

      {error ? (
        <p
          role="alert"
          className="text-[11px] font-mono uppercase tracking-wider text-clinical"
        >
          {error}
        </p>
      ) : null}
    </form>
  );
}
