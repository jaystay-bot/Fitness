// N=019: Oura wearable-layer normalizer. Pure deterministic. Maps the
// most-recent Oura daily_sleep score and daily_readiness score to
// TaggedUserInput entries on UserInput fields the engine consumes.
//
// Oura's documented score bands:
//   sleep 0..100      — daily Sleep Score; bands per Oura support:
//                       0–59 poor, 60–69 fair, 70–84 good, 85–100 excellent.
//   readiness 0..100  — daily Readiness Score; bands per Oura support:
//                       0–59 low, 60–79 moderate, 80–100 high.
//
// Mapping rules (mirror Whoop's wearable-layer pattern from N=018):
//   sleep < 60      → symptomToFix = "poor-sleep"  (poor sleep, sustained)
//   sleep >= 60     → no override                  (fair / good / excellent
//                                                   confirms self-report)
//   readiness < 60  → symptomToFix = "fatigue"     (low readiness)
//   readiness >= 60 → no override                  (moderate / high confirms
//                                                   self-report)
//
// Both emitted entries carry layer="wearable", confidence=0.85 (matching
// Whoop), and the `asOf` timestamp from the upstream API.

import type { TaggedUserInput } from "@/lib/types";

export interface OuraMetricsInput {
  sleepScore: number | null;
  readinessScore: number | null;
  asOf: string;
}

const WEARABLE_CONFIDENCE = 0.85;

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

export function normalizeOuraMetrics(
  input: OuraMetricsInput,
): TaggedUserInput[] {
  if (!input || typeof input !== "object") return [];
  const ts = typeof input.asOf === "string" && input.asOf.length > 0
    ? input.asOf
    : new Date().toISOString();
  const out: TaggedUserInput[] = [];

  if (isFiniteNumber(input.sleepScore) && input.sleepScore < 60) {
    out.push({
      field: "symptomToFix",
      value: "poor-sleep",
      layer: "wearable",
      confidence: WEARABLE_CONFIDENCE,
      timestamp: ts,
    });
  }

  if (isFiniteNumber(input.readinessScore) && input.readinessScore < 60) {
    out.push({
      field: "symptomToFix",
      value: "fatigue",
      layer: "wearable",
      confidence: WEARABLE_CONFIDENCE,
      timestamp: ts,
    });
  }

  return out;
}

// Helper used by the Oura API route to build the route's `summary`
// field. Pure passthrough of the API metrics with no normalization.
export function summarizeOuraMetrics(input: OuraMetricsInput | null): {
  sleepScore: number | null;
  readinessScore: number | null;
  asOf: string | null;
} {
  if (!input) return { sleepScore: null, readinessScore: null, asOf: null };
  return {
    sleepScore: isFiniteNumber(input.sleepScore) ? input.sleepScore : null,
    readinessScore: isFiniteNumber(input.readinessScore) ? input.readinessScore : null,
    asOf: typeof input.asOf === "string" && input.asOf.length > 0 ? input.asOf : null,
  };
}
