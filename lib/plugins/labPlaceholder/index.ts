// N=017: lab placeholder plugin. Fourth plugin to register against the
// locked Plugin Layer contract; second signal plugin (after N=014 Apple
// Health) and the FIRST plugin operating at the lab layer — the highest
// priority weight in the Signal Stack.
//
// Reuses the PluginNormalization<TRaw> generic from N=012 with TRaw =
// ManualLabValue. The plugin emits TaggedUserInput entries at layer="lab"
// with confidence=0.95 — manually transcribed values from a printed
// report are highly reliable, distinct from the wearable layer's
// algorithmically-derived signals (Apple Health steps → activityLevel).
//
// Fail-silently rule (locked since N=014): the plugin returns an empty
// TaggedUserInput[] for any input that fails to parse, contains no
// recognized markers, or throws unexpectedly.

import type { PluginNormalization } from "@/lib/pluginContract";
import type { ManualLabValue, TaggedUserInput } from "@/lib/types";

import {
  parseManualLabValues,
  validateManualLabValues,
} from "./manualEntry";

// 90-day window — lab values are typically considered current within
// this range. Older data should be re-tested before driving the engine.
const RECENCY_THRESHOLD_MS = 90 * 24 * 60 * 60 * 1000;

function normalize(raw: ManualLabValue): TaggedUserInput[] {
  if (!raw || typeof raw !== "object") return [];
  try {
    const validated = validateManualLabValues(raw);
    if (!validated.ok) return [];
    return parseManualLabValues(raw);
  } catch {
    return [];
  }
}

function calibrateConfidence(raw: ManualLabValue): number {
  if (!raw || typeof raw !== "object") return 0;
  const fields: Array<keyof ManualLabValue> = [
    "ferritin_ng_ml",
    "vitamin_d_25oh_ng_ml",
    "b12_pg_ml",
    "magnesium_mg_dl",
    "tsh_uiu_ml",
  ];
  const entered = fields.filter(
    (f) => typeof raw[f] === "number" && Number.isFinite(raw[f] as number),
  ).length;
  if (entered === 0) return 0;
  return 0.95;
}

export const labPlaceholderPlugin: PluginNormalization<ManualLabValue> = {
  name: "lab-placeholder",
  layer: "lab",
  normalize,
  calibrateConfidence,
  recencyThresholdMs: RECENCY_THRESHOLD_MS,
};
