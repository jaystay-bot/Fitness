# TRUTH_RESULT_031

N_ID: N_031
Verify command: `npx tsc --noEmit && npm run build`
Exit code: 0
Result: PASS
Cost: < $1.00

Evidence:
- tsc 0; build 0.
- Live submit flow: result card rendered 4 "Where to buy" links with correct
  deep-link hrefs (vitamin-d3, b12, creatine, magnesium). Screenshot
  n031_result_buylinks.png shows Fulfill + Where-to-buy on matched cards and
  Fulfill-only on unmatched cards (protein, beta-alanine).
- Footer "Compare prices" → /shop present.

Files changed: 1 new (match.ts) + 3 edited (ResultCard, Footer, ProductCard).
No engine/route/theme/dependency change.
