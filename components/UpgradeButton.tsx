"use client";

import { useState } from "react";
import Link from "next/link";

type Variant = "subtle" | "primary";
type Interval = "month" | "quarter" | "year";

const DEFAULT_LABELS: Record<Interval, string> = {
  month: "Start Monthly",
  quarter: "Get Smart Stack",
  year: "Go Yearly",
};

export function UpgradeButton({
  variant = "subtle",
  interval = "month",
  label,
}: {
  variant?: Variant;
  interval?: Interval;
  label?: string;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (variant === "subtle") {
    return (
      <Link
        href="/pricing"
        className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-lime border border-lime/40 rounded-md px-3 py-2 hover:border-lime"
      >
        Save your protocol to your account — from $4.99/mo
      </Link>
    );
  }

  async function startCheckout() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval }),
      });
      if (res.status === 401) {
        window.location.href = "/sign-in?redirect_url=/pricing";
        return;
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error ?? `Checkout failed (${res.status}).`);
      }
      const { url } = (await res.json()) as { url?: string };
      if (url) {
        window.location.href = url;
        return;
      }
      throw new Error("Stripe did not return a checkout URL.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
    } finally {
      setSubmitting(false);
    }
  }

  const buttonLabel = submitting
    ? "Starting checkout…"
    : (label ?? DEFAULT_LABELS[interval]);

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        aria-label={buttonLabel}
        onClick={startCheckout}
        disabled={submitting}
        className="inline-flex items-center justify-center bg-lime text-ink font-semibold uppercase tracking-wider text-sm rounded-md px-4 py-3 hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {buttonLabel}
      </button>
      {error ? (
        <p
          role="alert"
          className="text-[11px] font-mono uppercase tracking-wider text-clinical"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
