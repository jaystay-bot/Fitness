// N=012: plugin normalization contract. Every external plugin (Apple
// Health, Oura, Whoop, LabCorp, Quest, telehealth, …) must implement
// this exact interface before its data may flow into the engine.
//
// All required fields are non-optional so a TypeScript registration
// missing any field produces a compile-time error. This is intentional:
// downstream cycles must conform to the contract this cycle establishes.

import { isValidLayer, type SignalLayer } from "./signalLayers";
import type { TaggedUserInput } from "./types";

export interface PluginNormalization<TRaw = unknown> {
  /** Stable identifier, e.g. "apple-health", "oura", "labcorp". */
  readonly name: string;

  /** Which layer this plugin's data is tagged with at ingestion time. */
  readonly layer: SignalLayer;

  /**
   * Pure function. Maps the plugin's raw output (whatever shape the
   * upstream service emits) into a list of TaggedUserInput entries
   * binding UserInput fields to their tagged values. Implementations
   * MUST NOT call `fetch`, read files, or touch any network.
   */
  normalize(raw: TRaw): TaggedUserInput[];

  /** Pure function. Returns confidence in [0, 1] for a given raw payload. */
  calibrateConfidence(raw: TRaw): number;

  /**
   * Maximum age, in milliseconds, that the upstream payload's own
   * timestamp may have before it is treated as stale. Plugins use this
   * to drop wearable data older than the configured window.
   */
  readonly recencyThresholdMs: number;
}

export function isPluginNormalization(
  value: unknown,
): value is PluginNormalization {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.name === "string" &&
    v.name.length > 0 &&
    isValidLayer(v.layer) &&
    typeof v.normalize === "function" &&
    typeof v.calibrateConfidence === "function" &&
    typeof v.recencyThresholdMs === "number" &&
    Number.isFinite(v.recencyThresholdMs) &&
    v.recencyThresholdMs >= 0
  );
}
