// N=019: Oura wearable plugin. Sixth plugin overall, fourth signal
// plugin (after N=014 Apple Health, N=017 lab placeholder, N=018
// Whoop), third wearable signal source (after N=014 Apple Health
// and N=018 Whoop). Completes the wearable layer expansion per the
// locked priority build order.
//
// Reuses the PluginNormalization<TRaw> generic from N=012 with
// TRaw = OuraMetricsInput. The plugin emits TaggedUserInput entries
// at layer="wearable" with confidence=0.85 — matching Whoop's
// confidence calibration since both plugins read continuous-wear-band
// data (Oura ring vs Whoop strap) of similar reliability.
//
// Fail-silently rule (locked since N=014): malformed input → empty array.

import type { PluginNormalization } from "@/lib/pluginContract";

import {
  normalizeOuraMetrics,
  type OuraMetricsInput,
} from "./normalizer";

// 7-day window — matches Whoop. Oura's daily summaries become stale
// quickly since sleep + readiness are by definition same-day measurements.
// Older data should be re-fetched.
const RECENCY_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;

function normalize(raw: OuraMetricsInput): ReturnType<typeof normalizeOuraMetrics> {
  if (!raw || typeof raw !== "object") return [];
  try {
    return normalizeOuraMetrics(raw);
  } catch {
    return [];
  }
}

function calibrateConfidence(raw: OuraMetricsInput): number {
  if (!raw || typeof raw !== "object") return 0;
  const hasSleep = typeof raw.sleepScore === "number" && Number.isFinite(raw.sleepScore);
  const hasReadiness = typeof raw.readinessScore === "number" && Number.isFinite(raw.readinessScore);
  if (!hasSleep && !hasReadiness) return 0;
  return 0.85;
}

export const ouraPlugin: PluginNormalization<OuraMetricsInput> = {
  name: "oura",
  layer: "wearable",
  normalize,
  calibrateConfidence,
  recencyThresholdMs: RECENCY_THRESHOLD_MS,
};
