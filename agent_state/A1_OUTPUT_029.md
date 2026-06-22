# A1_OUTPUT_029

N_ID: N_029

Files changed (all new):
- components/commerce/BottleVisual.tsx — SVG bottle illustration (mint/gold,
  label band shows strength + form), labeled "Illustration"; renders a real
  <img> only when a verified bottle image exists.
- components/commerce/BuyBox.tsx — primary "Buy at [Retailer]" CTA + zero-JS
  <details> "Compare N retailers" with per-offer rows (price/"Check price",
  ship/pickup chips, best-price badge, Buy link rel="noopener noreferrer nofollow
  sponsored"); routing + price disclaimers.
- components/commerce/ProductCard.tsx — bottle + brand ("Multiple brands") +
  name + form/strength/count chips + description + evidence note + BuyBox.
- components/commerce/AttributionFooter.tsx — states visuals are illustrations
  and lists licensed-imagery sources with verification status.
- app/shop/page.tsx — /shop demo: hero, routing disclosure, product grid,
  empty-state branch, attribution footer, standard disclaimer.

Commands run:
- npx tsc --noEmit → 0 ; npm run build → 0 (/shop is a static route).
- Screenshots: n029_shop_desktop / _compare (drawer open) / _mobile.

Notes:
- Server components only; compare drawer is zero-JS via <details>.
- Consumes lib/commerce (N=028) read-only; no existing file or dependency changed.

Out-of-scope noticed:
- No nav link to /shop yet (would edit existing components) — add in a later cycle.
- Live prices / real bottle photos need egress + retailer APIs — future.
