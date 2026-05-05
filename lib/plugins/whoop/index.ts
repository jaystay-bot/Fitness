// N=018: Whoop wearable plugin. Fifth plugin overall, third signal
// plugin (after N=014 Apple Health and N=017 lab placeholder), second
// wearable signal source (after N=014 Apple Health).
//
// Reuses the PluginNormalization<TRaw> generic from N=012 with
// TRaw = WhoopMetricsInput. The plugin emits TaggedUserInput entries at
// layer="wearable" with confidence=0.85 — Whoop's continuous-wear band
// produces denser, more reliable wearable signals than Apple Health's
// passive iOS export, so confidence is set higher than Apple Health's
// behavior-layer 0.7 (matching the established "wearable layer is more
// reliable than self-reported behavior" pattern).
//
// Fail-silently rule (locked since N=014): malformed input → empty array.

import type { PluginNormalization } from "@/lib/pluginContract";

import {
  normalizeWhoopMetrics,
  type WhoopMetricsInput,
} from "./normalizer";

// 7-day window — Whoop's daily summaries become stale fast since strain
// + recovery are by definition same-day measurements. Older data should
// be re-fetched.
const RECENCY_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;

function normalize(raw: WhoopMetricsInput): ReturnType<typeof normalizeWhoopMetrics> {
  if (!raw || typeof raw !== "object") return [];
  try {
    return normalizeWhoopMetrics(raw);
  } catch {
    return [];
  }
}

function calibrateConfidence(raw: WhoopMetricsInput): number {
  if (!raw || typeof raw !== "object") return 0;
  const hasRecovery = typeof raw.recoveryScore === "number" && Number.isFinite(raw.recoveryScore);
  const hasStrain = typeof raw.dayStrain === "number" && Number.isFinite(raw.dayStrain);
  if (!hasRecovery && !hasStrain) return 0;
  return 0.85;
}

export const whoopPlugin: PluginNormalization<WhoopMetricsInput> = {
  name: "whoop",
  layer: "wearable",
  normalize,
  calibrateConfidence,
  recencyThresholdMs: RECENCY_THRESHOLD_MS,
};
