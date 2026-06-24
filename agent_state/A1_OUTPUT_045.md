# A1_OUTPUT_045
N_ID: N_045
Files changed:
- lib/commerce/priceEstimates.ts (new) — DAILY_COST_CENTS (per-day typical retail
  range, cents, keyed by engine id, all 14 compounds); monthlyStackCost(names)
  → {lowDollars, highDollars, covered, total} over 30 days; CHEAPEST_CHANNEL_NOTE.
  Deliberately separate from the verified-price path; nothing here is a live price.
- components/ResultCard.tsx — computes monthlyStackCost over the stack and renders
  "Est. cost ~$X–Y/month · typical retail · not a live price" + the cheapest-
  channel note, directly under the Stack header.
Commands run: tsc 0; build 0.
Verify: gain-weight stack (protein/creatine/d3/magnesium) ≈ $24–62/month.
Notes: honesty preserved — estimates are wide ranges, clearly labeled, never a
per-retailer or live price; RetailOffer.priceCents path untouched.
