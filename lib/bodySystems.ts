import type { BodySystem } from "./types";

export interface BodySystemMapping {
  systems: BodySystem[];
  notes: Partial<Record<BodySystem, string>>;
}

// Hand-curated mapping from canonical supplement id (mirroring
// `lib/supplements.ts` ids + the variation candidates from `lib/variation.ts`)
// to the body systems each supplement primarily targets, with a one-line
// explanatory note per system. Static data — never generated.
export const BODY_SYSTEMS: Record<string, BodySystemMapping> = {
  creatine: {
    systems: ["muscles", "brain"],
    notes: {
      muscles: "Saturates muscle phosphocreatine; most-studied performance aid.",
      brain: "Increases brain creatine; supports cognition under stress.",
    },
  },
  "vitamin-d3": {
    systems: ["bones", "immune", "muscles"],
    notes: {
      bones: "Supports calcium absorption and bone density.",
      immune: "Modulates immune response; insufficiency raises infection risk.",
      muscles: "Adequate D status correlates with muscle function.",
    },
  },
  "magnesium-glycinate": {
    systems: ["brain", "muscles"],
    notes: {
      brain: "Calms the nervous system; supports sleep onset.",
      muscles: "Backstops recovery and reduces cramping.",
    },
  },
  "omega-3": {
    systems: ["brain", "heart"],
    notes: {
      brain: "EPA/DHA are structural to neuronal membranes.",
      heart: "Lowers triglycerides; anti-inflammatory baseline.",
    },
  },
  protein: {
    systems: ["muscles"],
    notes: {
      muscles: "Substrate for muscle protein synthesis at ~1.6 g/kg/day.",
    },
  },
  "caffeine-theanine": {
    systems: ["brain"],
    notes: {
      brain: "Smoother focus than caffeine alone — same alertness, less jitter.",
    },
  },
  rhodiola: {
    systems: ["brain"],
    notes: {
      brain: "Adaptogen with the cleanest evidence for stress-related fatigue.",
    },
  },
  ashwagandha: {
    systems: ["brain", "muscles"],
    notes: {
      brain: "Lowers cortisol; supports sleep without next-day grogginess.",
      muscles: "Modest strength benefit at consistent KSM-66 doses.",
    },
  },
  zinc: {
    systems: ["immune", "skin"],
    notes: {
      immune: "Cofactor for immune function; replenishes deficient states.",
      skin: "Skin integrity and wound healing.",
    },
  },
  b12: {
    systems: ["brain", "immune"],
    notes: {
      brain: "Cofactor for myelin synthesis and nerve function.",
      immune: "Supports red blood cell formation; deficiency causes fatigue.",
    },
  },
  iron: {
    systems: ["heart", "muscles"],
    notes: {
      heart: "Iron is required for oxygen-carrying hemoglobin.",
      muscles: "Endurance capacity drops with low ferritin.",
    },
  },
  probiotic: {
    systems: ["gut", "immune"],
    notes: {
      gut: "Multi-strain support for GI homeostasis.",
      immune: "70% of immune tissue is gut-associated; cross-talks via vagus nerve.",
    },
  },
  electrolytes: {
    systems: ["muscles", "heart"],
    notes: {
      muscles: "Sodium + potassium prevent cramps and headaches around training.",
      heart: "Cardiac rhythm depends on potassium and magnesium balance.",
    },
  },
  melatonin: {
    systems: ["brain"],
    notes: {
      brain: "Pineal hormone; cues sleep onset at low doses (0.3–1 mg).",
    },
  },
  hmb: {
    systems: ["muscles"],
    notes: {
      muscles: "Reduces training-induced muscle protein breakdown.",
    },
  },
  "beta-alanine": {
    systems: ["muscles"],
    notes: {
      muscles: "Buffers muscle acidity in 1–4 minute efforts.",
    },
  },
  "citrulline-malate": {
    systems: ["muscles", "heart"],
    notes: {
      muscles: "Supports training volume on hard sets.",
      heart: "Modest nitric-oxide-mediated vasodilation.",
    },
  },
  tyrosine: {
    systems: ["brain"],
    notes: {
      brain: "Supports working memory under stress, cold, or sleep deprivation.",
    },
  },
};

// Same name-to-id mapper used in lib/timelineData.ts (kept local to avoid
// importing across cycles' frozen modules).
export function nameToBodyKey(name: string): string {
  const lower = name.toLowerCase();
  if (lower.startsWith("creatine")) return "creatine";
  if (lower.startsWith("vitamin d3")) return "vitamin-d3";
  if (lower.startsWith("magnesium")) return "magnesium-glycinate";
  if (lower.startsWith("omega-3")) return "omega-3";
  if (lower.startsWith("whey") || lower.startsWith("plant protein")) return "protein";
  if (lower.includes("caffeine") && lower.includes("theanine")) return "caffeine-theanine";
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
