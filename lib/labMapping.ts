import type { LabValues, UserInput } from "./types";

/**
 * Apply lab-value-driven overrides on top of a self-reported UserInput.
 * Returns a NEW UserInput; never mutates the caller's value.
 *
 * Rules (deterministic, ordered; do not change without contract update):
 *   1. Ferritin < 30 ng/ml AND sex === 'female'  →  symptomToFix = 'fatigue'
 *   2. Vitamin D 25-OH < 30 ng/ml                →  symptomToFix = 'fatigue' (if currently 'none')
 *   3. B12 < 300 pg/ml                           →  symptomToFix = 'brain-fog'
 *                                                    (if currently 'none' or 'fatigue')
 *
 * The engine itself remains unchanged; lab values are translated to the
 * existing `UserInput` enum surface so all downstream logic (variation,
 * confidence, conflicts) flows naturally.
 */
export function applyLabOverrides(
  input: UserInput,
  labs: LabValues,
): UserInput {
  let next: UserInput = { ...input };

  if (
    typeof labs.ferritin_ng_ml === "number" &&
    labs.ferritin_ng_ml < 30 &&
    input.sex === "female"
  ) {
    next = { ...next, symptomToFix: "fatigue" };
  }

  if (
    typeof labs.vitamin_d_25oh_ng_ml === "number" &&
    labs.vitamin_d_25oh_ng_ml < 30 &&
    next.symptomToFix === "none"
  ) {
    next = { ...next, symptomToFix: "fatigue" };
  }

  if (
    typeof labs.b12_pg_ml === "number" &&
    labs.b12_pg_ml < 300 &&
    (next.symptomToFix === "none" || next.symptomToFix === "fatigue")
  ) {
    next = { ...next, symptomToFix: "brain-fog" };
  }

  return next;
}

export function describeOverrides(
  input: UserInput,
  labs: LabValues,
): string[] {
  const notes: string[] = [];
  if (
    typeof labs.ferritin_ng_ml === "number" &&
    labs.ferritin_ng_ml < 30 &&
    input.sex === "female"
  ) {
    notes.push(
      `Ferritin ${labs.ferritin_ng_ml} ng/ml is below the 30 ng/ml threshold for menstruating women — iron consideration becomes mandatory regardless of self-reported symptoms.`,
    );
  }
  if (
    typeof labs.vitamin_d_25oh_ng_ml === "number" &&
    labs.vitamin_d_25oh_ng_ml < 30
  ) {
    notes.push(
      `Vitamin D 25-OH ${labs.vitamin_d_25oh_ng_ml} ng/ml is below the 30 ng/ml insufficiency threshold — vitamin D priority elevates and fatigue is treated as the active symptom.`,
    );
  }
  if (typeof labs.b12_pg_ml === "number" && labs.b12_pg_ml < 300) {
    notes.push(
      `B12 ${labs.b12_pg_ml} pg/ml is below 300 pg/ml — methylcobalamin forces into the stack and brain-fog becomes the active symptom.`,
    );
  }
  return notes;
}
