// N=036: research feed data. Built ONLY from data we actually have in the
// engine (evidence tier, approx study count, PMID, goals/symptoms). No
// fabricated effect sizes or invented statistics. Per-item "finding" copy is
// structure-function safe and checked by the compliance guard at module load.

import { auditCopy } from "../commerce/compliance";
import { SUPPLEMENTS } from "../supplements";
import type { EvidenceTier, PrimaryGoal, Symptom } from "../types";

export interface ResearchItem {
  id: string;
  name: string;
  tier: EvidenceTier;
  studyCount: number;
  pmid: string | null;
  pubmedUrl: string;
  finding: string; // safe, structure-function phrasing only
  goals: PrimaryGoal[];
  symptoms: Symptom[];
}

// Curated, claim-safe one-line summaries. No disease/cure/prevent language.
const FINDING: Record<string, string> = {
  creatine:
    "Among the most-studied performance compounds; commonly studied for strength, power, and cognition.",
  "vitamin-d3":
    "Widely studied; commonly examined for bone, muscle, and immune support, especially where sun exposure is low.",
  "magnesium-glycinate":
    "Commonly studied for sleep quality, relaxation, and recovery; the glycinate form is gentle on digestion.",
  "omega-3":
    "Heavily studied EPA/DHA; commonly examined for heart, brain, and inflammatory markers.",
  protein:
    "Extensively studied for muscle protein synthesis and satiety; total daily intake matters more than timing.",
  "caffeine-theanine":
    "Commonly studied as a pairing for alertness with less jitter than caffeine alone.",
  rhodiola:
    "Adaptogen studied for stress-related fatigue and mental endurance; the evidence base is moderate.",
  ashwagandha:
    "Studied for stress, cortisol, and sleep; moderate evidence that is formulation-dependent.",
  zinc:
    "Commonly studied for immune function and, in deficiency, hormonal markers.",
  b12:
    "Well studied for energy and nervous-system support; a priority where dietary intake is low.",
  iron:
    "Studied for fatigue tied to low iron status; testing before supplementing is the norm.",
  probiotic:
    "Strain-specific research; commonly studied for digestive comfort and regularity.",
  electrolytes:
    "Studied around training, heat, fasting, and low-carb diets for hydration balance.",
  melatonin:
    "Well studied for sleep onset and circadian timing; low doses are the focus of the research.",
};

function pmidNumber(pmidExample?: string): string | null {
  if (!pmidExample) return null;
  const m = pmidExample.match(/(\d{5,9})/);
  return m ? m[1] : null;
}

export const RESEARCH_ITEMS: ResearchItem[] = SUPPLEMENTS.map((s) => {
  const pmid = pmidNumber(s.pubmedExample);
  const finding = FINDING[s.id] ?? `Commonly studied within ${s.goals.join(", ") || "general health"} research.`;
  return {
    id: s.id,
    name: s.name,
    tier: s.evidenceTier,
    studyCount: s.studyCount,
    pmid,
    // Link to the specific record when we have a PMID, else a clean PubMed search.
    pubmedUrl: pmid
      ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
      : `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(s.name + " supplementation")}`,
    finding,
    goals: s.goals,
    symptoms: s.symptoms,
  };
});

// Build-time compliance guard — unsafe finding copy fails the build.
const ISSUES = RESEARCH_ITEMS.flatMap((r) =>
  auditCopy({ [`${r.id}.finding`]: r.finding }),
);
if (ISSUES.length > 0) {
  throw new Error(`Research feed copy contains blocked claims: ${JSON.stringify(ISSUES)}`);
}

export const MAX_STUDY_COUNT = Math.max(...RESEARCH_ITEMS.map((r) => r.studyCount));

export interface FeedStats {
  compounds: number;
  totalStudies: number;
  strong: number;
  moderate: number;
  emerging: number;
}

export function getFeedStats(): FeedStats {
  return {
    compounds: RESEARCH_ITEMS.length,
    totalStudies: RESEARCH_ITEMS.reduce((a, r) => a + r.studyCount, 0),
    strong: RESEARCH_ITEMS.filter((r) => r.tier === "Strong").length,
    moderate: RESEARCH_ITEMS.filter((r) => r.tier === "Moderate").length,
    emerging: RESEARCH_ITEMS.filter((r) => r.tier === "Emerging").length,
  };
}

export const GOAL_FILTERS: { id: PrimaryGoal | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "muscle", label: "Muscle" },
  { id: "energy", label: "Energy" },
  { id: "fat-loss", label: "Fat loss" },
  { id: "focus", label: "Focus" },
  { id: "longevity", label: "Longevity" },
  { id: "gain-weight", label: "Weight gain" },
];
