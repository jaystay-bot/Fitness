# S1_LOCKED_029

N_ID: N_029

Intent:
Premium buy-box UI + demo page (spec N4 + N6). Render the N=028 commerce data as
elite product cards with a bottle visual, retailer comparison, best-visible-price
logic, outbound "Buy at [Retailer]" CTAs, and compliance copy. No fake prices, no
medical claims, no fake checkout — outbound retailer links only.

Scope / Allowed files (all NEW):
- components/commerce/BottleVisual.tsx   (SVG placeholder bottle, clearly labeled)
- components/commerce/BuyBox.tsx          (offers, best-price badge, compare <details>, disclaimer)
- components/commerce/ProductCard.tsx     (bottle + summary + BuyBox)
- components/commerce/AttributionFooter.tsx
- app/shop/page.tsx                       (demo route rendering seed products)
- agent_state/* (trail)

Forbidden files:
- lib/** (consume N=028 only, no edits) ; existing components/routes ;
  package.json/lock (no dependency)

Requirements honored:
- price null → "Check price"; best-price badge only on a VERIFIED cheapest offer.
- outbound links target=_blank rel="noopener noreferrer nofollow sponsored".
- routing disclosure ("we don't sell these; we route you") + price + standard
  disclaimers present.
- bottle visual labeled "Illustration" so it never implies a real product photo.
- zero-JS where possible (<details> for compare) — server components.

Deliverables:
- /shop renders 5 product cards with buy boxes + attribution + disclaimers.
- Build + typecheck green; screenshot of /shop.

Verify command:
```bash
npx tsc --noEmit && npm run build
```
Plus desktop + mobile screenshots of /shop.

Parallel safe: false. Stop: tsc/build non-zero; forbidden edit; any fake price/claim.
