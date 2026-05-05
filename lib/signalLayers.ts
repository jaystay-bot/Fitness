export const SignalLayer = {
  behavior: "behavior",
  wearable: "wearable",
  lab:      "lab",
} as const;

export type SignalLayer = (typeof SignalLayer)[keyof typeof SignalLayer];

export const LAYER_WEIGHT: Record<SignalLayer, number> = {
  behavior: 1,
  wearable: 2,
  lab:      3,
};

export interface TaggedValue<T> {
  value:      T;
  layer:      SignalLayer;
  confidence: number;  // [0, 1]
  timestamp:  string;  // ISO 8601
}
