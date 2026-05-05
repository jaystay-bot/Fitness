// N=012: signal-stack foundation. Pure module — no I/O, no client-side
// concerns, no dependencies outside TypeScript built-ins.
//
// Three closed enum values name the source layer of any value flowing
// into the engine. Higher-priority layers override lower-priority layers
// when multiple sources provide the same field. Within a single layer,
// the more recent ISO timestamp wins (resolved in lib/signalPriority.ts).

export type SignalLayer = "behavior" | "wearable" | "lab";

// Higher number wins when two layers provide the same field. The values
// are stable; downstream plugin cycles must conform to this ordering.
export const LAYER_WEIGHT: Readonly<Record<SignalLayer, number>> = Object.freeze({
  behavior: 1,
  wearable: 2,
  lab: 3,
});

// Generic wrapper. Composes against any field shape (number, string,
// enum value). The four fields together describe both the value and the
// trust + freshness metadata the resolver needs.
export interface TaggedValue<T = unknown> {
  value: T;
  layer: SignalLayer;
  confidence: number;     // [0, 1] inclusive
  timestamp: string;      // ISO 8601, e.g. "2026-05-05T12:00:00Z"
}

const VALID_LAYERS: ReadonlySet<SignalLayer> = new Set<SignalLayer>([
  "behavior",
  "wearable",
  "lab",
]);

export function isValidLayer(value: unknown): value is SignalLayer {
  return typeof value === "string" && VALID_LAYERS.has(value as SignalLayer);
}

export function isValidConfidence(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 1
  );
}

// Lightweight ISO 8601 sanity check. Accepts strings parseable by
// `Date.parse` that produce a finite epoch. Plugin authors are expected
// to emit RFC 3339 / ISO 8601 timestamps.
export function isValidTimestamp(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0) return false;
  const ms = Date.parse(value);
  return Number.isFinite(ms);
}
