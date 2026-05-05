// N=014: Apple Health plugin registration. The first plugin to satisfy
// the locked PluginNormalization contract from N=012.
//
// The plugin's `layer` field is set to "wearable" — the dominant layer
// of the signals this plugin emits. Per-entry layer tags come from the
// normalizer and may be either "behavior" (steps, sleep) or "wearable"
// (resting heart rate). The Signal Stack priority resolver in
// lib/signalPriority.ts honors the per-entry layer when merging.
//
// Fail-silently rule (locked): the plugin returns an empty
// TaggedUserInput[] for any input that fails to parse, contains no
// records of interest, or throws unexpectedly. The upload card and
// upstream UI continue to function without surfacing complexity to
// the user.

import type { PluginNormalization } from "@/lib/pluginContract";
import type { TaggedUserInput } from "@/lib/types";

import { parseAppleHealthExport } from "./parser";
import { normalizeAppleHealthRecords } from "./normalizer";

const RECENCY_THRESHOLD_MS = 30 * 24 * 60 * 60 * 1000;     // 30 days

// Confidence calibration based on how many of the three target record
// types matched. Plugin-level confidence is distinct from per-entry
// confidence (which is set inside normalizeAppleHealthRecords per the
// locked normalizer contract).
function calibrateConfidence(rawXml: string): number {
  if (typeof rawXml !== "string" || rawXml.length === 0) return 0;
  let matched = 0;
  if (/HKQuantityTypeIdentifierStepCount/.test(rawXml)) matched += 1;
  if (/HKCategoryTypeIdentifierSleepAnalysis/.test(rawXml)) matched += 1;
  if (/HKQuantityTypeIdentifierRestingHeartRate/.test(rawXml)) matched += 1;
  if (matched === 0) return 0.4;
  if (matched === 1) return 0.6;
  if (matched === 2) return 0.8;
  return 0.9;
}

function normalize(rawXml: string): TaggedUserInput[] {
  if (typeof rawXml !== "string" || rawXml.length === 0) return [];
  try {
    const parsed = parseAppleHealthExport(rawXml);
    return normalizeAppleHealthRecords(parsed);
  } catch {
    return [];
  }
}

export const appleHealthPlugin: PluginNormalization<string> = {
  name: "apple-health",
  layer: "wearable",
  normalize,
  calibrateConfidence,
  recencyThresholdMs: RECENCY_THRESHOLD_MS,
};
