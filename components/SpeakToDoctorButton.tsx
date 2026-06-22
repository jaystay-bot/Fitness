"use client";

// N=016: clinical-orange escalation button. Renders inside ResultCard
// above the supplement list when telehealthPlugin.shouldRender(rec) is
// true. The button is purely a routing action — the user lands on the
// configured telehealth provider's landing page where they complete
// their own intake. The product never replaces a clinician; it offers
// a route to one when warranted.
//
// Locked palette: clinical orange (#E11D48) is the only new color use
// permitted in this cycle, and it is already in the palette.
//
// Click flow follows the N=015 popup-blocker-safe pattern: synchronous
// window.open("about:blank") to allocate the new tab, then async POST
// to /api/fulfillment/click with `pluginName: "telehealth"`, then set
// the new tab's location.href to the URL the server returned. On any
// failure, the new tab is closed silently (fail-silently rule).

import { useState } from "react";
import { Stethoscope } from "lucide-react";

interface FulfillmentClickResponse {
  ok: boolean;
  url?: string;
}

export function SpeakToDoctorButton() {
  const [submitting, setSubmitting] = useState(false);

  function onClick() {
    if (submitting) return;
    setSubmitting(true);

    const newTab =
      typeof window !== "undefined"
        ? window.open("about:blank", "_blank", "noopener,noreferrer")
        : null;

    void (async () => {
      try {
        const res = await fetch("/api/fulfillment/click", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pluginName: "telehealth",
            supplementName: "escalation",
          }),
        });
        const data = (await res.json().catch(() => ({}))) as FulfillmentClickResponse;
        if (
          newTab &&
          data?.ok &&
          typeof data.url === "string" &&
          data.url.length > 0
        ) {
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
      data-testid="speak-to-doctor-button"
      onClick={onClick}
      disabled={submitting}
      aria-label="Speak to a doctor"
      className="inline-flex items-center gap-2 bg-clinical text-paper font-mono text-xs sm:text-sm uppercase tracking-wider rounded-md px-4 py-2.5 hover:brightness-110 disabled:opacity-50"
    >
      <Stethoscope className="w-4 h-4" aria-hidden="true" />
      Speak to a doctor
    </button>
  );
}
