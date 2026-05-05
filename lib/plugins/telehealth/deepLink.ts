// N=016: pure deterministic telehealth deep-link generator. No I/O, no
// `'use client'`, no dependencies beyond URLSearchParams (a Web standard).
// Identical inputs always produce identical URLs.
//
// URL form:
//   <providerUrl>?reason=<escalation reason>
//
// When the recommendation context provides no escalation indicator, the
// `reason` query is omitted entirely. When the providerUrl is empty or
// whitespace, the function falls back to a hardcoded generic landing
// page so the redirect always works for the user — but no provider
// attribution accrues until the env var is configured.

import type {
  Recommendation,
  TelehealthEscalationReason,
} from "@/lib/types";

const FALLBACK_LANDING_PAGE = "https://www.sesamecare.com/";

const CLINICIAN_OVERSIGHT_KEYS: ReadonlyArray<string> = ["iron", "melatonin"];
const MEDICAL_CLEARANCE_PATTERN = /(medical|clinic|clearance)/i;

export function chooseEscalationReason(
  recommendation: Recommendation | null,
): TelehealthEscalationReason | null {
  if (!recommendation) return null;
  if (recommendation.goalConflict) {
    if (
      MEDICAL_CLEARANCE_PATTERN.test(recommendation.goalConflict.message) ||
      MEDICAL_CLEARANCE_PATTERN.test(recommendation.goalConflict.suggestedFix)
    ) {
      return "medical-clearance";
    }
    return "goal-conflict";
  }
  for (const supplement of recommendation.supplements ?? []) {
    const lower = supplement.name.toLowerCase();
    if (CLINICIAN_OVERSIGHT_KEYS.some((k) => lower.startsWith(k))) {
      return "clinician-oversight-supplement";
    }
  }
  return null;
}

function ensureTrailingPath(raw: string): { base: string; sep: string } {
  // If the URL already contains a query string, append with `&`.
  // Otherwise, append the first query param with `?`.
  if (raw.includes("?")) {
    return { base: raw.replace(/[?&]+$/, ""), sep: "&" };
  }
  return { base: raw.replace(/[/]+$/, "") + "/", sep: "?" };
}

export function generateTelehealthDeepLink(
  recommendation: Recommendation | null,
  providerUrl: string,
): string {
  const trimmed = typeof providerUrl === "string" ? providerUrl.trim() : "";
  const baseUrl = trimmed.length === 0 ? FALLBACK_LANDING_PAGE : trimmed;

  const reason = chooseEscalationReason(recommendation);
  if (!reason) {
    // No escalation context — return the bare provider URL as-is.
    return baseUrl;
  }

  const { base, sep } = ensureTrailingPath(baseUrl);
  const params = new URLSearchParams();
  params.set("reason", reason);
  return `${base}${sep}${params.toString()}`;
}
