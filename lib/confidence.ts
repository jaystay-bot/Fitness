import type { EvidenceTier, SupplementPick, UserInput } from "./types";
import {
  VARIATION_GOAL_FIT,
  VARIATION_SYMPTOM_FIT,
} from "./variation";

const TIER_BASE: Record<EvidenceTier, number> = {
  Strong: 85,
  Moderate: 75,
  Emerging: 65,
};

// Goal-fit map for the 14 entries in lib/supplements.ts.
// Mirrors the engine's GOAL_CORE without importing it (kept independent
// to avoid coupling and to keep this module purely additive).
const SUPPLEMENT_GOAL_FIT: Record<string, string[]> = {
  creatine: ["muscle", "longevity", "focus"],
  "vitamin-d3": ["energy", "muscle", "longevity"],
  "magnesium-glycinate": ["energy", "muscle", "longevity", "focus"],
  "omega-3": ["fat-loss", "longevity", "focus"],
  protein: ["muscle", "fat-loss"],
  "caffeine-theanine": ["focus", "fat-loss", "energy"],
  rhodiola: ["focus", "energy"],
  ashwagandha: ["muscle", "focus", "longevity"],
  zinc: ["energy", "longevity"],
  b12: ["energy", "focus"],
  iron: ["energy"],
  probiotic: ["longevity"],
  electrolytes: ["fat-loss", "energy"],
  melatonin: [],
};

const SUPPLEMENT_SYMPTOM_FIT: Record<string, string[]> = {
  creatine: ["low-strength", "brain-fog"],
  "vitamin-d3": ["fatigue", "low-strength"],
  "magnesium-glycinate": ["poor-sleep", "fatigue"],
  "omega-3": ["brain-fog"],
  protein: ["low-strength"],
  "caffeine-theanine": ["brain-fog", "fatigue"],
  rhodiola: ["brain-fog", "fatigue"],
  ashwagandha: ["poor-sleep", "low-strength"],
  zinc: ["fatigue"],
  b12: ["fatigue", "brain-fog"],
  iron: ["fatigue"],
  probiotic: ["bloating"],
  electrolytes: ["fatigue"],
  melatonin: ["poor-sleep"],
};

// Map a pick's display name back to its canonical id for fit lookups.
function pickToId(name: string): string {
  const lower = name.toLowerCase();
  if (lower.startsWith("creatine")) return "creatine";
  if (lower.startsWith("vitamin d3")) return "vitamin-d3";
  if (lower.startsWith("magnesium")) return "magnesium-glycinate";
  if (lower.startsWith("omega-3")) return "omega-3";
  if (lower.startsWith("whey") || lower.startsWith("plant protein")) {
    return "protein";
  }
  if (lower.includes("caffeine") && lower.includes("theanine")) {
    return "caffeine-theanine";
  }
  if (lower.startsWith("rhodiola")) return "rhodiola";
  if (lower.startsWith("ashwagandha")) return "ashwagandha";
  if (lower.startsWith("zinc")) return "zinc";
  if (lower.startsWith("b12")) return "b12";
  if (lower.startsWith("iron")) return "iron";
  if (lower.includes("probiotic")) return "probiotic";
  if (lower.startsWith("electrolytes")) return "electrolytes";
  if (lower.startsWith("melatonin")) return "melatonin";
  if (lower.startsWith("hmb")) return "hmb";
  if (lower.startsWith("beta-alanine")) return "beta-alanine";
  if (lower.startsWith("citrulline")) return "citrulline-malate";
  if (lower.startsWith("l-tyrosine")) return "tyrosine";
  return "";
}

function dietForcesPick(id: string, input: UserInput): boolean {
  if (input.dietPattern === "vegan") {
    return id === "b12" || id === "iron" || id === "omega-3";
  }
  if (input.dietPattern === "vegetarian") {
    return id === "b12" || id === "creatine";
  }
  if (input.dietPattern === "keto") {
    return id === "electrolytes";
  }
  return false;
}

export function computeConfidence(
  pick: SupplementPick,
  input: UserInput,
  warnings: string[],
): number {
  let score = TIER_BASE[pick.evidenceTier];
  const id = pickToId(pick.name);
  const goalFit =
    SUPPLEMENT_GOAL_FIT[id] ?? VARIATION_GOAL_FIT[id] ?? [];
  const symptomFit =
    SUPPLEMENT_SYMPTOM_FIT[id] ?? VARIATION_SYMPTOM_FIT[id] ?? [];

  if (goalFit.includes(input.primaryGoal)) score += 5;
  if (symptomFit.includes(input.symptomToFix)) score += 3;
  if (dietForcesPick(id, input)) score += 3;

  const lowerName = pick.name.toLowerCase();
  for (const w of warnings) {
    if (w.toLowerCase().includes(lowerName.split(/[\s(]/)[0])) {
      score -= 5;
      break;
    }
  }

  if (score < 60) score = 60;
  if (score > 99) score = 99;
  return score;
}
