import type {
  EvidenceTier,
  PrimaryGoal,
  SupplementEntry,
  SupplementPick,
  Symptom,
  UserInput,
} from "./types";

interface VariationCandidate {
  id: string;
  name: string;
  defaultDose: string;
  defaultTiming: string;
  evidenceTier: EvidenceTier;
  studyCount: number;
  goals: PrimaryGoal[];
  symptoms: Symptom[];
  whyForYou: (input: UserInput) => string;
}

const HMB: VariationCandidate = {
  id: "hmb",
  name: "HMB (β-hydroxy β-methylbutyrate)",
  defaultDose: "3 g",
  defaultTiming: "split across the day with food",
  evidenceTier: "Moderate",
  studyCount: 35,
  goals: ["muscle"],
  symptoms: ["low-strength"],
  whyForYou: () =>
    "Helps blunt training-induced muscle breakdown when stimulus is high.",
};

const BETA_ALANINE: VariationCandidate = {
  id: "beta-alanine",
  name: "Beta-alanine",
  defaultDose: "3.2 g (split into 4 × 800 mg)",
  defaultTiming: "with meals to reduce paresthesia",
  evidenceTier: "Moderate",
  studyCount: 50,
  goals: ["muscle"],
  symptoms: ["low-strength"],
  whyForYou: () =>
    "Buffers muscle acidity in 1–4 minute efforts; reliable endurance bump.",
};

const CITRULLINE_MALATE: VariationCandidate = {
  id: "citrulline-malate",
  name: "Citrulline malate",
  defaultDose: "6–8 g",
  defaultTiming: "30–45 minutes pre-training",
  evidenceTier: "Moderate",
  studyCount: 25,
  goals: ["muscle"],
  symptoms: ["low-strength"],
  whyForYou: () =>
    "Improves training volume on hard sets; modest pump effect.",
};

const TYROSINE: VariationCandidate = {
  id: "tyrosine",
  name: "L-tyrosine",
  defaultDose: "500–2000 mg",
  defaultTiming: "30–60 minutes before demanding cognitive work",
  evidenceTier: "Moderate",
  studyCount: 20,
  goals: ["focus"],
  symptoms: ["brain-fog"],
  whyForYou: () =>
    "Supports working memory under stress, sleep deprivation, or cold.",
};

const MUSCLE_MODERATE_HELPERS: VariationCandidate[] = [
  HMB,
  BETA_ALANINE,
  CITRULLINE_MALATE,
];

const FOCUS_MODERATE_ADAPTOGENS: VariationCandidate[] = [
  // Rhodiola is represented by id only here; when the seed picks
  // index 0 the engine keeps the existing rhodiola pick unchanged.
  // When the seed picks index 1, it is swapped for tyrosine.
  { ...TYROSINE, id: "__rhodiola_keep__" },
  TYROSINE,
];

export function hashInput(input: UserInput): number {
  const canonical = [
    input.age,
    input.sex,
    input.heightCm,
    input.weightKg,
    input.activityLevel,
    input.sleepHours,
    input.primaryGoal,
    input.dietPattern,
    input.caffeineCupsPerDay,
    input.alcoholDrinksPerWeek,
    input.symptomToFix,
  ].join("|");
  let sum = 0;
  for (let i = 0; i < canonical.length; i++) {
    sum += canonical.charCodeAt(i);
  }
  return sum % 1000;
}

function candidateToPick(
  candidate: VariationCandidate,
  input: UserInput,
): SupplementPick {
  return {
    name: candidate.name,
    dose: candidate.defaultDose,
    timing: candidate.defaultTiming,
    evidenceTier: candidate.evidenceTier,
    studyCount: candidate.studyCount,
    whyForYou: candidate.whyForYou(input),
  } as SupplementPick;
}

export function applyVariation(
  picks: SupplementPick[],
  seed: number,
  input: UserInput,
): SupplementPick[] {
  const next = [...picks];

  // Equivalence class 1: focus-moderate-adaptogen.
  // If a Rhodiola pick exists, the seed decides whether to keep it
  // or swap to tyrosine. Both are Moderate-tier focus picks.
  const rhodiolaIndex = next.findIndex((p) => /Rhodiola/i.test(p.name));
  if (rhodiolaIndex !== -1) {
    const choice = seed % FOCUS_MODERATE_ADAPTOGENS.length;
    const selection = FOCUS_MODERATE_ADAPTOGENS[choice];
    if (selection.id !== "__rhodiola_keep__") {
      next[rhodiolaIndex] = candidateToPick(selection, input);
    }
  }

  // Equivalence class 2: muscle-moderate-helper.
  // For muscle goal with a free slot, append the seeded helper.
  if (input.primaryGoal === "muscle" && next.length < 7) {
    const choice = seed % MUSCLE_MODERATE_HELPERS.length;
    next.push(candidateToPick(MUSCLE_MODERATE_HELPERS[choice], input));
  }

  return next;
}

export const VARIATION_GOAL_FIT: Record<string, PrimaryGoal[]> = {
  hmb: HMB.goals,
  "beta-alanine": BETA_ALANINE.goals,
  "citrulline-malate": CITRULLINE_MALATE.goals,
  tyrosine: TYROSINE.goals,
};

export const VARIATION_SYMPTOM_FIT: Record<string, Symptom[]> = {
  hmb: HMB.symptoms,
  "beta-alanine": BETA_ALANINE.symptoms,
  "citrulline-malate": CITRULLINE_MALATE.symptoms,
  tyrosine: TYROSINE.symptoms,
};
