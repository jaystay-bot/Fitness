# A1_OUTPUT_031

N_ID: N_031

Files changed:
- lib/commerce/match.ts (new) — shopSlugForSupplement / shopHrefForSupplement;
  static keyword→slug map (no products import → lean client bundle).
- components/ResultCard.tsx — per supplement, render a "Where to buy" link next
  to the existing Fulfill button when a commerce product matches.
- components/Footer.tsx — "Compare prices" nav link to /shop.
- components/commerce/ProductCard.tsx — id={`product-<slug>`} + scroll-mt + a
  target: highlight so deep links land on the right card.

Commands run:
- npx tsc --noEmit → 0 ; npm run build → 0
- Live: submitted the assessment form; result rendered 4 "Where to buy" links
  with correct hrefs (/shop#product-vitamin-d3, -vitamin-b12-methylcobalamin,
  -creatine-monohydrate, -magnesium-glycinate). Unmatched picks (protein,
  beta-alanine) correctly show only the Fulfill button.

Notes:
- Only matched supplements get the link (5 commerce products today); others rely
  on the existing Amazon Fulfill button.
- No new external links, no price claims, no dependency.
