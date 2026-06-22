import { computeConfidence } from "./confidence";
import { detectConflict } from "./conflicts";
import {
  DIET_OVERRIDES,
  GOAL_NUTRITION,
  INFLAMMATION_OVERRIDE,
  SYMPTOM_OVERRIDES,
} from "./nutrition";
import { resolveTaggedInputs } from "./signalPriority";
import { SUPPLEMENTS, getSupplement } from "./supplements";
import type {
  EvidenceTier,
  PrimaryGoal,
  Recommendation,
  SupplementEntry,
  SupplementPick,
  Symptom,
  TaggedUserInput,
  UserInput,
} from "./types";
import { applyVariation, hashInput } from "./variation";
import { buildVerdict } from "./verdict";

const TIER_RANK: Record<EvidenceTier, number> = {
  Strong: 0,
  Moderate: 1,
  Emerging: 2,
};

const GOAL_CORE: Record<PrimaryGoal, string[]> = {
  muscle: ["creatine", "protein", "vitamin-d3", "magnesium-glycinate"],
  "fat-loss": ["caffeine-theanine", "protein", "omega-3", "electrolytes"],
  energy: ["b12", "vitamin-d3", "magnesium-glycinate"],
  longevity: ["omega-3", "vitamin-d3", "magnesium-glycinate", "creatine"],
  focus: [
    "caffeine-theanine",
    "omega-3",
    "rhodiola",
    "magnesium-glycinate",
  ],
  // Healthy weight gain — whole-food calorie surplus plus the two compounds
  // with the strongest evidence for adding lean mass. Deliberately NO peptides
  // or hormones; this is food-first, supplements-second.
  "gain-weight": ["protein", "creatine", "vitamin-d3", "magnesium-glycinate"],
};

// Clinical underweight threshold (WHO). Below this we surface weight-gain
// support regardless of the chosen goal.
const UNDERWEIGHT_BMI = 18.5;

function isUnderweight(input: UserInput): boolean {
  return bmi(input) < UNDERWEIGHT_BMI;
}

// Single source of truth for the daily protein target so the supplement card,
// the daily-target readout, and the 30-day plan can never disagree. Higher when
// building/gaining or underweight, and bumped further when inflammation is
// elevated (recovery raises protein needs).
function proteinTargetGrams(input: UserInput): number {
  let perKg = 1.4;
  if (input.primaryGoal === "muscle" || input.primaryGoal === "gain-weight") {
    perKg = 1.8;
  }
  if (isUnderweight(input)) perKg = Math.max(perKg, 1.8);
  if (input.inflammation === "elevated") perKg += 0.2;
  if (input.inflammation === "high") perKg += 0.4;
  perKg = Math.min(perKg, 2.4);
  return Math.round(input.weightKg * perKg);
}

const SYMPTOM_ADDONS: Record<Symptom, string[]> = {
  "poor-sleep": ["magnesium-glycinate", "melatonin"],
  "brain-fog": ["omega-3", "b12", "rhodiola"],
  bloating: ["probiotic"],
  fatigue: ["b12", "vitamin-d3"],
  "low-strength": ["creatine", "protein"],
  none: [],
};

interface PendingPick {
  entry: SupplementEntry;
  priority: number;
  reason: string;
}

function bmi(input: UserInput): number {
  const m = input.heightCm / 100;
  return Math.round((input.weightKg / (m * m)) * 10) / 10;
}

function dosageFor(entry: SupplementEntry, input: UserInput): string {
  if (entry.id === "protein") {
    const target = proteinTargetGrams(input);
    return `${target} g protein/day total — supplement to fill the gap (typical scoop 25–40 g)`;
  }
  if (entry.id === "melatonin") {
    return "0.3 mg (start low; only raise if needed)";
  }
  return entry.defaultDose;
}

function timingFor(entry: SupplementEntry, input: UserInput): string {
  if (entry.id === "magnesium-glycinate" && input.caffeineCupsPerDay > 0) {
    return "evening, at least 4 hours after your last caffeine";
  }
  if (entry.id === "iron") {
    return "morning, away from coffee, tea, and calcium by 2+ hours";
  }
  return entry.defaultTiming;
}

function whyFor(entry: SupplementEntry, input: UserInput): string {
  switch (entry.id) {
    case "creatine":
      return `Most-studied performance aid; matches your ${input.primaryGoal} goal and helps strength + cognition.`;
    case "vitamin-d3":
      return "Most adults run low; supports bone, muscle, and immune function year-round.";
    case "magnesium-glycinate":
      return input.symptomToFix === "poor-sleep"
        ? "Glycinate form calms the nervous system and improves sleep onset."
        : "Backstops sleep, recovery, and stress when intake from food is inconsistent.";
    case "omega-3":
      return input.dietPattern === "vegan"
        ? "Pick an algae-derived EPA/DHA — covers the gap from no fish in your diet."
        : "Anti-inflammatory baseline; most diets fall short of EPA+DHA.";
    case "protein":
      return `At ${input.weightKg} kg, you need around ${proteinTargetGrams(input)} g/day — a shake plugs the gap on busy days.`;
    case "caffeine-theanine":
      return "Theanine smooths the caffeine peak — same focus, less jitter, fewer crashes.";
    case "rhodiola":
      return "Adaptogen with the cleanest evidence for stress-related fatigue and mental endurance.";
    case "ashwagandha":
      return "Lowers cortisol and improves sleep quality without next-day grogginess.";
    case "zinc":
      return "Often low in restrictive diets; supports immunity and testosterone in deficiency.";
    case "b12":
      return input.dietPattern === "vegan" || input.dietPattern === "vegetarian"
        ? "Plant diets are the #1 risk factor for B12 deficiency — non-negotiable for you."
        : "Pulls fatigue and brain-fog up fast when levels are even mildly low.";
    case "iron":
      return "Common cause of fatigue in menstruating women — get ferritin tested and supplement only if low.";
    case "probiotic":
      return "Multi-strain support for bloating; pair with a 14-day food-trigger test.";
    case "electrolytes":
      return input.dietPattern === "keto"
        ? "Keto flushes sodium hard — daily electrolytes prevent the keto-flu wall."
        : "Useful around training, fasting, and heat; cheap insurance against cramps and headaches.";
    case "melatonin":
      return "Low-dose only — bigger doses do not work better and can disrupt sleep architecture.";
    default:
      return `Selected for your ${input.primaryGoal} goal.`;
  }
}

function ensure(
  picks: Map<string, PendingPick>,
  id: string,
  priority: number,
  reason: string,
): void {
  const entry = getSupplement(id);
  const existing = picks.get(id);
  if (!existing) {
    picks.set(id, { entry, priority, reason });
    return;
  }
  if (priority < existing.priority) {
    existing.priority = priority;
    existing.reason = reason;
  }
}

function buildStack(input: UserInput): SupplementPick[] {
  const picks = new Map<string, PendingPick>();

  // 1. Goal core (priority 2)
  for (const id of GOAL_CORE[input.primaryGoal]) {
    ensure(picks, id, 2, `core for ${input.primaryGoal}`);
  }

  // 2. Symptom add-ons (priority 1 — usually more user-felt than goal core)
  for (const id of SYMPTOM_ADDONS[input.symptomToFix]) {
    ensure(picks, id, 1, `addresses ${input.symptomToFix}`);
  }

  // 2b. Iron special-case: only for females with fatigue symptom
  if (input.sex === "female" && input.symptomToFix === "fatigue") {
    ensure(picks, "iron", 1, "female + fatigue → iron consideration");
  }

  // 3. Diet adjustments
  if (input.dietPattern === "vegan") {
    ensure(picks, "b12", 0, "vegan diet — B12 is mandatory");
    ensure(picks, "iron", 1, "vegan diet — iron consideration");
    ensure(picks, "omega-3", 1, "vegan diet — algae-based EPA/DHA needed");
  }
  if (input.dietPattern === "vegetarian") {
    ensure(picks, "b12", 1, "vegetarian diet — B12 emphasis");
    ensure(picks, "creatine", 1, "vegetarian diet — creatine emphasis");
  }
  if (input.dietPattern === "keto") {
    ensure(picks, "electrolytes", 0, "keto — electrolytes mandatory");
  }

  // 4. Underweight (BMI < 18.5) or explicit weight-gain goal — protein floor +
  // creatine for lean mass. Food-first; no peptides or hormones.
  if (isUnderweight(input) || input.primaryGoal === "gain-weight") {
    ensure(picks, "protein", 0, "underweight / weight-gain — protein floor for a healthy surplus");
    ensure(picks, "creatine", 1, "underweight / weight-gain — creatine supports lean mass + strength");
  }

  // 5. Elevated inflammation — omega-3 for its anti-inflammatory baseline.
  if (input.inflammation === "elevated" || input.inflammation === "high") {
    ensure(picks, "omega-3", 1, "elevated inflammation — omega-3 anti-inflammatory support");
  }

  // Convert and rank
  const all = Array.from(picks.values());
  all.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return TIER_RANK[a.entry.evidenceTier] - TIER_RANK[b.entry.evidenceTier];
  });

  // Cap at 7
  const capped = all.slice(0, 7);

  return capped.map((p) => buildPick(p.entry, input));
}

function buildPick(entry: SupplementEntry, input: UserInput): SupplementPick {
  const pick: SupplementPick = {
    name: entry.name,
    dose: dosageFor(entry, input),
    timing: timingFor(entry, input),
    evidenceTier: entry.evidenceTier,
    studyCount: entry.studyCount,
    whyForYou: whyFor(entry, input),
    confidence: 0,
  };
  if (entry.pubmedExample) {
    pick.pubmedExample = entry.pubmedExample;
  }
  return pick;
}

function buildWarnings(
  input: UserInput,
  supplements: SupplementPick[],
): string[] {
  const warnings: string[] = [];
  const has = (name: string) =>
    supplements.some((s) => s.name.toLowerCase().includes(name));

  if (has("zinc")) {
    warnings.push(
      "Zinc blocks copper absorption — if you supplement zinc daily for more than a month, add 1–2 mg copper or cycle the zinc.",
    );
  }
  if (has("magnesium") && input.caffeineCupsPerDay > 0) {
    warnings.push(
      "Keep magnesium at least 4 hours from caffeine — caffeine briefly increases magnesium loss.",
    );
  }
  if (has("iron")) {
    warnings.push(
      "Take iron away from coffee, tea, and calcium-rich foods by at least 2 hours — they cut absorption sharply.",
    );
  }
  if (has("melatonin")) {
    warnings.push(
      "Stay at the low dose. More than 1 mg of melatonin does not improve sleep and can leave you groggy.",
    );
  }
  if (has("caffeine") && input.sleepHours < 7) {
    warnings.push(
      "You are already short on sleep — keep caffeine before 2pm and below 200 mg/day.",
    );
  }
  if (input.alcoholDrinksPerWeek >= 14) {
    warnings.push(
      "Alcohol intake at this level blunts sleep, training adaptation, and any supplement you stack on top.",
    );
  }
  if (isUnderweight(input) || input.primaryGoal === "gain-weight") {
    warnings.push(
      "Weight gain is food-first: aim for a 300–500 kcal daily surplus from whole foods (nuts, olive oil, dairy, rice, oats) plus the protein target below. No peptides or hormones — they are not needed and are out of scope here. If you stay underweight despite eating more, see a clinician to rule out an underlying cause.",
    );
  }
  if (input.inflammation === "elevated" || input.inflammation === "high") {
    const target = proteinTargetGrams(input);
    warnings.push(
      `Inflammation raises protein needs and recovery cost — your target is bumped to about ${target} g/day, and an anti-inflammatory pattern (fatty fish, olive oil, berries, leafy greens; less added sugar, refined seed-oil fried food, and alcohol) does more than any single supplement.`,
    );
  }

  if (warnings.length === 0) {
    warnings.push(
      "Take fat-soluble picks (vitamin D, omega-3) with a meal that contains fat for absorption.",
    );
  }
  return warnings;
}

function buildNutrition(input: UserInput): Recommendation["nutrition"] {
  const base = GOAL_NUTRITION[input.primaryGoal];
  const dietExtra = DIET_OVERRIDES[input.dietPattern] ?? {
    eatMore: [],
    eatLess: [],
  };
  const symptomExtra = SYMPTOM_OVERRIDES[input.symptomToFix] ?? {
    eatMore: [],
    eatLess: [],
  };
  // Anti-inflammatory food emphasis, surfaced ahead of the goal baseline when
  // inflammation is elevated/high.
  const inflammationExtra =
    input.inflammation === "elevated" || input.inflammation === "high"
      ? INFLAMMATION_OVERRIDE
      : { eatMore: [], eatLess: [] };

  const eatMore = uniq(
    [
      ...inflammationExtra.eatMore,
      ...dietExtra.eatMore,
      ...symptomExtra.eatMore,
      ...base.eatMore,
    ].slice(0, 5),
  );
  // Pad to 5 if short
  while (eatMore.length < 5) eatMore.push(base.eatMore[eatMore.length] ?? "Whole, minimally processed food first");
  const eatLess = uniq(
    [
      ...inflammationExtra.eatLess,
      ...symptomExtra.eatLess,
      ...dietExtra.eatLess,
      ...base.eatLess,
    ].slice(0, 3),
  );
  while (eatLess.length < 3) eatLess.push(base.eatLess[eatLess.length] ?? "Ultra-processed snack foods");

  const proteinTarget = proteinTargetGrams(input);
  const waterLiters = Math.round(input.weightKg * 0.033 * 10) / 10;

  return {
    eatMore: eatMore.slice(0, 5),
    eatLess: eatLess.slice(0, 3),
    dailyTargets: {
      proteinGrams: proteinTarget,
      waterLiters,
      sleepHours: input.primaryGoal === "muscle" ? 8 : 7.5,
    },
  };
}

function uniq(arr: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of arr) {
    if (!seen.has(v)) {
      seen.add(v);
      out.push(v);
    }
  }
  return out;
}

function buildPlan(
  input: UserInput,
  supplements: SupplementPick[],
): Recommendation["thirtyDayPlan"] {
  const top = supplements.slice(0, 3).map((s) => s.name).join(", ");
  return [
    {
      week: 1,
      focus: "Establish the floor",
      actions: [
        `Start the three highest-priority supplements: ${top}.`,
        "Lock a wake time and a sleep time within a 30-minute window all seven days.",
        `Hit a protein target of about ${proteinTargetGrams(input)} g/day.`,
      ],
    },
    {
      week: 2,
      focus: "Add the rest of the stack",
      actions: [
        "Layer in any remaining supplements one per day so you can spot side effects.",
        "Bring training to three sessions this week (walking counts if you are starting from sedentary).",
        "Cap caffeine at 2pm.",
      ],
    },
    {
      week: 3,
      focus: "Tune timing",
      actions: [
        "Take stimulants (caffeine, rhodiola) only AM. Take calming picks (magnesium, melatonin if used) only PM.",
        "Take fat-soluble picks (D3, omega-3) with the largest fat-containing meal.",
        "Re-check sleep average — if under 7 hours, prioritize that before adding anything new.",
      ],
    },
    {
      week: 4,
      focus: "Measure and adjust",
      actions: [
        "Note what changed: energy, mood, training, sleep, digestion. Be specific.",
        "Drop anything with no felt benefit and no Strong evidence.",
        "If goals shifted, rerun the protocol — the stack should follow the goal, not the other way around.",
      ],
    },
  ];
}

// N=012: optional `taggedInputs` parameter accepts an array of
// TaggedUserInput entries from any registered plugin (Apple Health,
// Oura, Whoop, LabCorp, Quest, telehealth, …). When present, the
// pure resolver in lib/signalPriority.ts merges higher-priority
// values over the user's behavior-layer input before the rest of the
// recommendation pipeline runs.
//
// Backward compatibility: when `taggedInputs` is undefined OR an empty
// array, `effective === input` by reference and every downstream
// computation is byte-identical to N=011. This replaces the never-called
// `labValues?` no-op parameter that N=007 introduced as a reserved hook;
// `applyLabOverrides` already runs on the input BEFORE recommend is
// invoked, so removing the unused parameter is safe (zero callers in
// the codebase passed it).
export function recommend(
  input: UserInput,
  taggedInputs?: ReadonlyArray<TaggedUserInput>,
): Recommendation {
  const effective: UserInput =
    taggedInputs && taggedInputs.length > 0
      ? { ...input, ...resolveTaggedInputs(taggedInputs) }
      : input;
  const variationSeed = hashInput(effective);
  const baseStack = buildStack(effective);
  const variedStack = applyVariation(baseStack, variationSeed, effective);
  const supplements = variedStack.slice(0, 7);
  const warnings = buildWarnings(effective, supplements);
  for (const pick of supplements) {
    pick.confidence = computeConfidence(pick, effective, warnings);
  }
  const verdict = buildVerdict(effective, supplements);
  const goalConflict = detectConflict(effective);
  const nutrition = buildNutrition(effective);
  const thirtyDayPlan = buildPlan(effective, supplements);

  return {
    verdict,
    bmi: bmi(effective),
    goalConflict,
    supplements,
    nutrition,
    thirtyDayPlan,
    warnings,
    variationSeed,
  };
}

export const ALL_SUPPLEMENT_IDS = SUPPLEMENTS.map((s) => s.id);
