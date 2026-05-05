// N=017: pure deterministic parser + range validator for manually
// entered lab values. No I/O, no `'use client'`, no dependencies beyond
// types. Identical inputs always produce identical outputs.
//
// Mapping rules mirror the N=007 applyLabOverrides logic so PDF-parsed
// values and manually-entered values converge on the same engine
// signal. The plugin emits TaggedUserInput entries on the symptomToFix
// field at layer="lab" with confidence=0.95 — manually transcribed
// values from a printed report are highly reliable.

import type { ManualLabValue, TaggedUserInput } from "@/lib/types";

// Physiological plausibility ranges. Values outside these are typos
// (negative numbers, off-by-three errors) and the route rejects them
// with 400. Re-uses N=007's PHYSIOLOGICAL_RANGES values where applicable;
// adds tsh_uiu_ml for the new TSH input.
export const MANUAL_LAB_RANGES: Readonly<
  Record<keyof ManualLabValue, readonly [number, number]>
> = Object.freeze({
  ferritin_ng_ml: [1, 2000],
  vitamin_d_25oh_ng_ml: [1, 200],
  b12_pg_ml: [50, 4000],
  magnesium_mg_dl: [0.5, 5],
  tsh_uiu_ml: [0.1, 50],
} as const);

const KNOWN_FIELDS: ReadonlyArray<keyof ManualLabValue> = Object.freeze([
  "ferritin_ng_ml",
  "vitamin_d_25oh_ng_ml",
  "b12_pg_ml",
  "magnesium_mg_dl",
  "tsh_uiu_ml",
]);

const HUMAN_LABELS: Readonly<Record<keyof ManualLabValue, string>> = {
  ferritin_ng_ml: "Ferritin (ng/mL)",
  vitamin_d_25oh_ng_ml: "Vitamin D 25-OH (ng/mL)",
  b12_pg_ml: "Vitamin B12 (pg/mL)",
  magnesium_mg_dl: "Magnesium (mg/dL)",
  tsh_uiu_ml: "TSH (µIU/mL)",
};

export type ValidateResult =
  | { ok: true }
  | { ok: false; outOfRange: keyof ManualLabValue; message: string };

export function validateManualLabValues(values: ManualLabValue): ValidateResult {
  if (!values || typeof values !== "object") return { ok: true };
  for (const field of KNOWN_FIELDS) {
    const v = values[field];
    if (v === undefined || v === null) continue;
    if (typeof v !== "number" || !Number.isFinite(v)) {
      return {
        ok: false,
        outOfRange: field,
        message: `${HUMAN_LABELS[field]} must be a number.`,
      };
    }
    const [min, max] = MANUAL_LAB_RANGES[field];
    if (v < min || v > max) {
      return {
        ok: false,
        outOfRange: field,
        message: `${HUMAN_LABELS[field]} must be between ${min} and ${max}.`,
      };
    }
  }
  return { ok: true };
}

// Apply the same N=007 applyLabOverrides logic — but emit
// TaggedUserInput entries at the lab layer instead of mutating UserInput
// directly. The Signal Stack priority resolver merges these over any
// behavior-layer or wearable-layer entry on the same field.
export function parseManualLabValues(
  values: ManualLabValue,
  now: Date = new Date(),
): TaggedUserInput[] {
  if (!values || typeof values !== "object") return [];
  const ts = now.toISOString();
  const out: TaggedUserInput[] = [];

  if (
    typeof values.ferritin_ng_ml === "number" &&
    Number.isFinite(values.ferritin_ng_ml) &&
    values.ferritin_ng_ml < 30
  ) {
    out.push({
      field: "symptomToFix",
      value: "fatigue",
      layer: "lab",
      confidence: 0.95,
      timestamp: ts,
    });
  }

  if (
    typeof values.vitamin_d_25oh_ng_ml === "number" &&
    Number.isFinite(values.vitamin_d_25oh_ng_ml) &&
    values.vitamin_d_25oh_ng_ml < 30
  ) {
    out.push({
      field: "symptomToFix",
      value: "fatigue",
      layer: "lab",
      confidence: 0.95,
      timestamp: ts,
    });
  }

  if (
    typeof values.b12_pg_ml === "number" &&
    Number.isFinite(values.b12_pg_ml) &&
    values.b12_pg_ml < 300
  ) {
    out.push({
      field: "symptomToFix",
      value: "brain-fog",
      layer: "lab",
      confidence: 0.95,
      timestamp: ts,
    });
  }

  if (
    typeof values.magnesium_mg_dl === "number" &&
    Number.isFinite(values.magnesium_mg_dl) &&
    values.magnesium_mg_dl < 1.7
  ) {
    out.push({
      field: "symptomToFix",
      value: "poor-sleep",
      layer: "lab",
      confidence: 0.95,
      timestamp: ts,
    });
  }

  if (
    typeof values.tsh_uiu_ml === "number" &&
    Number.isFinite(values.tsh_uiu_ml) &&
    values.tsh_uiu_ml > 4.5
  ) {
    out.push({
      field: "symptomToFix",
      value: "fatigue",
      layer: "lab",
      confidence: 0.95,
      timestamp: ts,
    });
  }

  return out;
}

// Returns the list of human-readable labels for biomarkers the user
// actually entered. Used by LabValuesEntry's "Connected" state.
export function summarizeApplied(values: ManualLabValue): string[] {
  if (!values || typeof values !== "object") return [];
  const applied: string[] = [];
  for (const field of KNOWN_FIELDS) {
    const v = values[field];
    if (typeof v === "number" && Number.isFinite(v)) {
      applied.push(`${HUMAN_LABELS[field]} = ${v}`);
    }
  }
  return applied;
}
