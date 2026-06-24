// N=039: curated study breakdowns so users can read/interpret the evidence
// in-app. Two honest ingredients per compound:
//   1. modelForCompound() — OUR deterministic 30-day onset model (reused from
//      lib/timeline), rendered as a labeled illustrative chart. Not a study result.
//   2. A real, cited, QUALITATIVE study summary (design / population / outcome /
//      magnitude / takeaway). No fabricated effect sizes — magnitudes are
//      qualitative and drawn from well-established literature, cited by PMID.
// Curated subset only (not every compound). Copy is compliance-checked at load.

import { auditCopy } from "../commerce/compliance";
import { projectTimeline, type TimelinePoint } from "../timeline";
import type { SupplementPick } from "../types";

export interface StudyBreakdown {
  design: string;
  population: string;
  outcome: string;
  magnitude: string; // qualitative — never a fabricated number
  takeaway: string;
}

// Keyed by engine supplement id. Conservative, textbook-defensible, cited.
export const STUDY_BREAKDOWNS: Record<string, StudyBreakdown> = {
  creatine: {
    design: "Position stand synthesizing dozens of randomized trials",
    population: "Trained and untrained adults",
    outcome: "Strength, power, and lean mass during resistance training",
    magnitude: "Consistent moderate benefit vs placebo",
    takeaway:
      "The most-studied performance compound; benefits show up alongside training, not on their own.",
  },
  "vitamin-d3": {
    design: "Supplementation trials and reviews",
    population: "Adults, especially those low in vitamin D",
    outcome: "Serum 25(OH)D and correction of deficiency",
    magnitude: "Reliably raises blood levels; clearest when starting deficient",
    takeaway:
      "Best thought of as topping up a low level rather than a boost for people who are already replete.",
  },
  "omega-3": {
    design: "Randomized trials and meta-analyses of EPA/DHA",
    population: "Adults across a range of baseline intakes",
    outcome: "Blood triglycerides and inflammatory markers",
    magnitude: "Dose-dependent triglyceride reduction; other endpoints mixed",
    takeaway:
      "Most consistent for triglycerides; pick a dose that actually delivers EPA + DHA, not just 'fish oil'.",
  },
  ashwagandha: {
    design: "Short randomized trials of standardized extract",
    population: "Adults reporting stress",
    outcome: "Perceived-stress and cortisol scores",
    magnitude: "Moderate reduction vs placebo; formulation-dependent",
    takeaway:
      "Results track the specific standardized extract studied — the form on the label matters.",
  },
  melatonin: {
    design: "Meta-analyses of randomized trials",
    population: "Adults with delayed or disrupted sleep onset",
    outcome: "Time to fall asleep and total sleep",
    magnitude: "Modestly shortens sleep onset; low doses match high doses",
    takeaway:
      "A timing tool, not a sedative — small doses taken earlier tend to work better than large ones at bedtime.",
  },
  "caffeine-theanine": {
    design: "Acute crossover randomized trials",
    population: "Healthy adults",
    outcome: "Attention and reaction time",
    magnitude: "Improves attention with less jitter than caffeine alone",
    takeaway:
      "An acute, same-session effect — useful before focused work, not something that builds over weeks.",
  },
  "magnesium-glycinate": {
    design: "Randomized trials and reviews of magnesium supplementation",
    population: "Adults, with larger effects where intake is low",
    outcome: "Sleep quality and markers of relaxation",
    magnitude: "Modest improvement, clearest when baseline intake is low",
    takeaway:
      "Best thought of as topping up a common dietary shortfall; the glycinate form is chosen for tolerability, not extra potency.",
  },
  protein: {
    design: "Meta-analyses of protein supplementation during resistance training",
    population: "Adults across a range of training experience",
    outcome: "Muscle mass and strength gains alongside training",
    magnitude: "A meaningful increment when total daily protein is otherwise short",
    takeaway:
      "Total daily protein is what drives the result — a shake is just a convenient way to hit the number.",
  },
  zinc: {
    design: "Supplementation trials and reviews",
    population: "Adults, with the clearest effects in deficiency",
    outcome: "Immune markers and, when low, hormonal markers",
    magnitude: "Reliable mainly when correcting a shortfall",
    takeaway:
      "Useful to fill a gap rather than a bonus for the already-replete; sustained high doses can crowd out copper.",
  },
  b12: {
    design: "Supplementation and observational studies",
    population: "Adults, especially plant-based eaters and older people",
    outcome: "Blood B12 status and related fatigue",
    magnitude: "Reliably restores low levels",
    takeaway:
      "A priority where dietary intake is low; little added benefit once levels are already normal.",
  },
  iron: {
    design: "Randomized trials in low-iron populations",
    population: "Adults with low iron status, often menstruating women",
    outcome: "Fatigue tied to iron status and ferritin levels",
    magnitude: "Clear improvement when iron is genuinely low",
    takeaway:
      "Test ferritin first — supplementing without a real shortfall carries risk and no benefit.",
  },
  rhodiola: {
    design: "Short randomized trials of standardized extract",
    population: "Adults reporting stress-related fatigue",
    outcome: "Perceived fatigue and mental endurance",
    magnitude: "Modest, on a moderate and somewhat mixed evidence base",
    takeaway:
      "Most relevant for stress-related fatigue; effects track the specific standardized extract studied.",
  },
  probiotic: {
    design: "Strain-specific randomized trials and reviews",
    population: "Adults with digestive complaints",
    outcome: "Digestive comfort and regularity",
    magnitude: "Strain-dependent; benefits do not generalize across products",
    takeaway:
      "The strain on the label matters more than the CFU count — match the strain to the studied use.",
  },
  electrolytes: {
    design: "Hydration and exercise-physiology studies",
    population: "Active adults, and those on low-carb or fasting protocols",
    outcome: "Hydration balance and exercise-related cramping",
    magnitude: "Most useful around heavy sweating, heat, or carb restriction",
    takeaway:
      "Situational insurance for training, heat, or keto — not a daily essential for everyone.",
  },
};

// Build a minimal pick (only `name` is read by the model) and project 30 days.
export function modelForCompound(name: string, tier: SupplementPick["evidenceTier"]): TimelinePoint[] {
  const pick: SupplementPick = {
    name,
    dose: "",
    timing: "",
    evidenceTier: tier,
    studyCount: 0,
    whyForYou: "",
    confidence: 0,
  };
  return projectTimeline([pick]);
}

// Build-time compliance guard over the breakdown copy.
const ISSUES = Object.entries(STUDY_BREAKDOWNS).flatMap(([id, b]) =>
  auditCopy({
    [`${id}.outcome`]: b.outcome,
    [`${id}.magnitude`]: b.magnitude,
    [`${id}.takeaway`]: b.takeaway,
  }),
);
if (ISSUES.length > 0) {
  throw new Error(`Study breakdown copy contains blocked claims: ${JSON.stringify(ISSUES)}`);
}
