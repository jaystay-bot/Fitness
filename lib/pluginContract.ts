import type { SignalLayer } from "./signalLayers";
import type { TaggedUserInput } from "./signalPriority";
import type { UserInput } from "./types";

/**
 * Contract that every plugin must implement before it may submit data
 * to the recommendation engine.
 *
 * Plugins are either signal feeders or action executors.
 * They do not add features — they feed normalized data into the engine.
 */
export interface PluginNormalization {
  /** Unique human-readable identifier for this plugin. */
  readonly name: string;

  /** The signal layer this plugin operates at. */
  readonly layer: SignalLayer;

  /**
   * Convert the plugin's raw output into TaggedValue objects keyed by
   * UserInput field. Fields the plugin cannot supply are omitted.
   */
  mapFields(rawOutput: unknown): Partial<TaggedUserInput>;

  /**
   * Return a confidence score [0, 1] for this plugin's reliability
   * on the given UserInput field.
   */
  calibrate(field: keyof UserInput): number;

  /**
   * Return the maximum age in milliseconds that a reading from this
   * plugin is considered fresh for the given field. Data older than
   * this threshold should be discarded by the caller before submission.
   */
  maxAgeMs(field: keyof UserInput): number;
}

export interface PluginRegistration {
  readonly plugin:       PluginNormalization;
  readonly registeredAt: string;  // ISO 8601
}
