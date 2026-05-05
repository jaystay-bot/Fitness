"use client";

// N=015: per-supplement Fulfill button. Renders inside ResultCard on
// every supplement card. On tap, opens a new tab AND posts to the
// click-tracking endpoint, then redirects the new tab to the
// affiliate URL returned by the server.
//
// The synchronous window.open with "about:blank" plus a deferred
// location.href update is the standard pattern for popping a new tab
// alongside an async fetch without triggering popup blockers.

import { useState } from "react";
import { ExternalLink } from "lucide-react";

interface FulfillButtonProps {
  supplementName: string;
}

interface FulfillmentClickResponse {
  ok: boolean;
  url?: string;
}

export function FulfillButton({ supplementName }: FulfillButtonProps) {
  const [submitting, setSubmitting] = useState(false);

  function onClick() {
    if (submitting) return;
    setSubmitting(true);

    // Open the new tab synchronously to avoid popup-blocker rejection.
    // The new tab will be redirected to the real URL once the server
    // returns it; on failure we close the placeholder.
    const newTab = typeof window !== "undefined"
      ? window.open("about:blank", "_blank", "noopener,noreferrer")
      : null;

    void (async () => {
      try {
        const res = await fetch("/api/fulfillment/click", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ supplementName }),
        });
        const data = (await res.json().catch(() => ({}))) as FulfillmentClickResponse;
        if (newTab && data?.ok && typeof data.url === "string" && data.url.length > 0) {
          newTab.location.href = data.url;
        } else {
          newTab?.close();
        }
      } catch {
        newTab?.close();
      } finally {
        setSubmitting(false);
      }
    })();
  }

  return (
    <button
      type="button"
      data-testid="fulfill-button"
      onClick={onClick}
      disabled={submitting}
      aria-label={`Fulfill ${supplementName} on Amazon`}
      className="inline-flex items-center gap-1.5 border border-paper/20 text-paper/85 font-mono text-[11px] uppercase tracking-wider rounded-md px-2.5 py-1.5 hover:border-lime hover:text-paper disabled:opacity-50"
    >
      <ExternalLink className="w-3 h-3" aria-hidden="true" />
      Fulfill on Amazon
    </button>
  );
}
