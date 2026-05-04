// Onset-of-effect curves per supplement id. Magnitudes are normalized
// 0..1 expected effect at plateau; t50 is days to half-max; tmax is days
// to plateau. The four metrics align with `TimelinePoint`: energy, focus,
// sleep, strength.
//
// References (literature-grounded; no fabricated PMIDs):
//  - Creatine: ~21d to saturation w/o loading; primarily strength + cognition.
//  - Vitamin D3: serum 25-OH stabilizes 6–8 weeks; mood/energy effects 2–4 weeks at clinical doses.
//  - Magnesium glycinate: sleep effects in 3–7 days; mild energy support.
//  - Omega-3 EPA/DHA: cognitive/anti-inflammatory effects 4–8 weeks.
//  - Whey/plant protein: strength/recovery effects coupled to training, ~14d.
//  - Caffeine + L-theanine: acute focus/energy from day 1.
//  - Rhodiola rosea: stress-related fatigue/focus 1–2 weeks.
//  - Ashwagandha (KSM-66): sleep/strength 2–4 weeks.
//  - Zinc: replenishment in deficient states ~14–28 days.
//  - B12 (methylcobalamin): energy / brain-fog 1–4 weeks (faster if deficient).
//  - Iron (ferrous bisglycinate): ferritin shifts in 4–12 weeks; symptom improvement 2–6 weeks.
//  - Multi-strain probiotic: GI/bloating effects 7–14 days.
//  - Electrolytes: acute support same day; sustained ~7 days for keto adaptation.
//  - Melatonin (low-dose): sleep onset effects 1–3 days.
//  - Variation candidates (HMB, beta-alanine, citrulline malate, tyrosine): 14–28d for measurable strength/endurance/focus.

export interface OnsetCurve {
  t50: { energy?: number; focus?: number; sleep?: number; strength?: number };
  tmax: { energy?: number; focus?: number; sleep?: number; strength?: number };
  plateau: { energy: number; focus: number; sleep: number; strength: number };
}

export const ONSET_CURVES: Record<string, OnsetCurve> = {
  creatine: {
    t50: { strength: 10, focus: 14 },
    tmax: { strength: 21, focus: 28 },
    plateau: { energy: 0.05, focus: 0.25, sleep: 0, strength: 0.5 },
  },
  "vitamin-d3": {
    t50: { energy: 14 },
    tmax: { energy: 42 },
    plateau: { energy: 0.3, focus: 0.1, sleep: 0.1, strength: 0.15 },
  },
  "magnesium-glycinate": {
    t50: { sleep: 3, energy: 7 },
    tmax: { sleep: 7, energy: 14 },
    plateau: { energy: 0.15, focus: 0.05, sleep: 0.5, strength: 0.05 },
  },
  "omega-3": {
    t50: { focus: 21 },
    tmax: { focus: 42 },
    plateau: { energy: 0.05, focus: 0.3, sleep: 0.05, strength: 0.05 },
  },
  protein: {
    t50: { strength: 7 },
    tmax: { strength: 21 },
    plateau: { energy: 0.05, focus: 0, sleep: 0, strength: 0.4 },
  },
  "caffeine-theanine": {
    t50: { energy: 1, focus: 1 },
    tmax: { energy: 1, focus: 1 },
    plateau: { energy: 0.45, focus: 0.55, sleep: -0.1, strength: 0 },
  },
  rhodiola: {
    t50: { focus: 7, energy: 7 },
    tmax: { focus: 14, energy: 14 },
    plateau: { energy: 0.3, focus: 0.3, sleep: 0, strength: 0 },
  },
  ashwagandha: {
    t50: { sleep: 10, strength: 14 },
    tmax: { sleep: 21, strength: 28 },
    plateau: { energy: 0.15, focus: 0.1, sleep: 0.4, strength: 0.2 },
  },
  zinc: {
    t50: { energy: 14 },
    tmax: { energy: 28 },
    plateau: { energy: 0.15, focus: 0.05, sleep: 0, strength: 0.05 },
  },
  b12: {
    t50: { energy: 7, focus: 10 },
    tmax: { energy: 21, focus: 21 },
    plateau: { energy: 0.4, focus: 0.3, sleep: 0, strength: 0.05 },
  },
  iron: {
    t50: { energy: 21 },
    tmax: { energy: 42 },
    plateau: { energy: 0.5, focus: 0.2, sleep: 0.05, strength: 0.1 },
  },
  probiotic: {
    t50: { energy: 7 },
    tmax: { energy: 14 },
    plateau: { energy: 0.15, focus: 0.05, sleep: 0.05, strength: 0 },
  },
  electrolytes: {
    t50: { energy: 1 },
    tmax: { energy: 7 },
    plateau: { energy: 0.25, focus: 0.05, sleep: 0, strength: 0.05 },
  },
  melatonin: {
    t50: { sleep: 1 },
    tmax: { sleep: 3 },
    plateau: { energy: 0, focus: 0, sleep: 0.5, strength: 0 },
  },
  hmb: {
    t50: { strength: 14 },
    tmax: { strength: 28 },
    plateau: { energy: 0, focus: 0, sleep: 0, strength: 0.2 },
  },
  "beta-alanine": {
    t50: { strength: 14 },
    tmax: { strength: 28 },
    plateau: { energy: 0.1, focus: 0, sleep: 0, strength: 0.25 },
  },
  "citrulline-malate": {
    t50: { strength: 7 },
    tmax: { strength: 21 },
    plateau: { energy: 0.05, focus: 0, sleep: 0, strength: 0.2 },
  },
  tyrosine: {
    t50: { focus: 1 },
    tmax: { focus: 7 },
    plateau: { energy: 0.1, focus: 0.35, sleep: 0, strength: 0 },
  },
};

// Fuzzy mapping from a SupplementPick.name back to its canonical id so the
// timeline projection doesn't need to import the engine's internal pickToId
// (which lives in lib/confidence.ts and is frozen this cycle).
export function nameToId(name: string): string {
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
