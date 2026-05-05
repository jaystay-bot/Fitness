// N=018: Whoop wearable-layer normalizer. Pure deterministic. Maps the
// most-recent Whoop recovery score and day strain to TaggedUserInput
// entries on UserInput fields the engine actually consumes.
//
// Whoop's scoring bands (publicly documented):
//   recovery_score 0..100  — % readiness; the band split is 0–33 red,
//                            34–66 yellow, 67–100 green.
//   strain 0..21           — daily cardio load; the band split is
//                            0–9 light, 10–13 moderate, 14–17 high,
//                            18–21 all-out.
//
// Mapping rules:
//   recovery < 34   → symptomToFix = "fatigue"   (sustained red recovery
//                                                 implies under-recovery /
//                                                 fatigue worth surfacing
//                                                 in the recommendation)
//   recovery 34..66 → no override                 (yellow confirms behavior)
//   recovery >= 67  → no override                 (green confirms behavior)
//   strain < 10     → activityLevel = "light"
//   strain 10..13   → activityLevel = "moderate"
//   strain 14..17   → activityLevel = "moderate"  (high-moderate band)
//   strain >= 18    → activityLevel = "high"
//
// Both emitted entries carry layer="wearable", confidence=0.85, and the
// `asOf` timestamp from the upstream API.

import type { TaggedUserInput } from "@/lib/types";

export interface WhoopMetricsInput {
  recoveryScore: number | null;
  dayStrain: number | null;
  asOf: string;
}

const WEARABLE_CONFIDENCE = 0.85;

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function activityLevelFromStrain(strain: number): "light" | "moderate" | "high" {
  if (strain >= 18) return "high";
  if (strain >= 10) return "moderate";
  return "light";
}

export function normalizeWhoopMetrics(
  input: WhoopMetricsInput,
): TaggedUserInput[] {
  if (!input || typeof input !== "object") return [];
  const ts = typeof input.asOf === "string" && input.asOf.length > 0
    ? input.asOf
    : new Date().toISOString();
  const out: TaggedUserInput[] = [];

  if (isFiniteNumber(input.recoveryScore) && input.recoveryScore < 34) {
    out.push({
      field: "symptomToFix",
      value: "fatigue",
      layer: "wearable",
      confidence: WEARABLE_CONFIDENCE,
      timestamp: ts,
    });
  }

  if (isFiniteNumber(input.dayStrain)) {
    const bucket = activityLevelFromStrain(input.dayStrain);
    out.push({
      field: "activityLevel",
      value: bucket,
      layer: "wearable",
      confidence: WEARABLE_CONFIDENCE,
      timestamp: ts,
    });
  }

  return out;
}

// Helper used by the Whoop API route to build the route's `summary`
// field. Pure passthrough of the API metrics with no normalization.
export function summarizeWhoopMetrics(input: WhoopMetricsInput | null): {
  recoveryScore: number | null;
  dayStrain: number | null;
  asOf: string | null;
} {
  if (!input) return { recoveryScore: null, dayStrain: null, asOf: null };
  return {
    recoveryScore: isFiniteNumber(input.recoveryScore) ? input.recoveryScore : null,
    dayStrain: isFiniteNumber(input.dayStrain) ? input.dayStrain : null,
    asOf: typeof input.asOf === "string" && input.asOf.length > 0 ? input.asOf : null,
  };
}
