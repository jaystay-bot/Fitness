// N=045: honest cost ESTIMATES — deliberately distinct from the verified-price
// system in ./types.ts (RetailOffer.priceCents, which stays null → "Check price"
// until a real price is verified). These are typical RETAIL RANGES for a daily
// dose, drawn from general market familiarity — never a live or per-retailer
// price. Always rendered with the "typical range, not a live price" label so a
// user is never misled into thinking an estimate is a current quoted price.

import { SUPPLEMENTS } from "../supplements";

export interface DailyCostRange {
  lowCents: number; // typical low end for one day's dose
  highCents: number; // typical high end for one day's dose
}

// Per-DAY cost of the typical dose, in cents. Conservative, wide ranges that
// reflect store-brand-to-premium spread. Keyed by engine supplement id.
export const DAILY_COST_CENTS: Record<string, DailyCostRange> = {
  creatine: { lowCents: 8, highCents: 20 },
  "vitamin-d3": { lowCents: 3, highCents: 10 },
  "magnesium-glycinate": { lowCents: 10, highCents: 25 },
  "omega-3": { lowCents: 15, highCents: 40 },
  protein: { lowCents: 60, highCents: 150 },
  "caffeine-theanine": { lowCents: 10, highCents: 30 },
  rhodiola: { lowCents: 15, highCents: 40 },
  ashwagandha: { lowCents: 15, highCents: 40 },
  zinc: { lowCents: 3, highCents: 10 },
  b12: { lowCents: 3, highCents: 12 },
  iron: { lowCents: 4, highCents: 12 },
  probiotic: { lowCents: 20, highCents: 60 },
  electrolytes: { lowCents: 20, highCents: 50 },
  melatonin: { lowCents: 2, highCents: 8 },
};

// Where these categories are usually cheapest — general, honest guidance, not a
// live price comparison.
export const CHEAPEST_CHANNEL_NOTE =
  "Store-brand, bulk, and online (warehouse clubs, iHerb, Amazon) are usually cheapest; single-bottle pharmacy retail is usually priciest.";

const NAME_TO_ID = new Map(SUPPLEMENTS.map((s) => [s.name, s.id]));

function rangeForName(name: string): DailyCostRange | null {
  const id = NAME_TO_ID.get(name);
  return id ? DAILY_COST_CENTS[id] ?? null : null;
}

export interface MonthlyCostEstimate {
  lowDollars: number;
  highDollars: number;
  covered: number; // how many picks had an estimate
  total: number; // total picks considered
}

// Estimate a stack's monthly cost range (30 days) from supplement display names.
// Returns null if nothing could be estimated. Rounds to whole dollars.
export function monthlyStackCost(names: string[]): MonthlyCostEstimate | null {
  let low = 0;
  let high = 0;
  let covered = 0;
  for (const name of names) {
    const r = rangeForName(name);
    if (!r) continue;
    low += r.lowCents;
    high += r.highCents;
    covered += 1;
  }
  if (covered === 0) return null;
  return {
    lowDollars: Math.round((low * 30) / 100),
    highDollars: Math.round((high * 30) / 100),
    covered,
    total: names.length,
  };
}
