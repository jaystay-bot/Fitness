# S1_LOCKED_031

N_ID: N_031

Intent:
Connect the engine's recommendations to the buy-box system. Add a "Where to buy"
link on each recommended supplement card that deep-links to its product on /shop
(when a commerce product exists), and surface /shop from the footer. Outbound to
our own /shop only; no new external links, no price claims.

Scope / Allowed files:
- lib/commerce/match.ts            (new — supplement display name → /shop slug, static map, no products import to keep client bundle lean)
- components/ResultCard.tsx        (add "Where to buy" link per supplement when matched)
- components/Footer.tsx            (add "Compare prices" link to /shop)
- components/commerce/ProductCard.tsx (add id anchor for deep-linking)
- agent_state/* (trail)

Forbidden files:
- lib/** except the new match.ts ; app/** ; package.json/lock

Deliverables:
- Result card supplements that have a product show "Where to buy" → /shop#product-<slug>.
- Footer links to /shop.
- Build + typecheck green; screenshot of a result card with the link + /shop anchor scroll.

Verify command:
```bash
npx tsc --noEmit && npm run build
```
Plus screenshot evidence.

Parallel safe: false (edits shared ResultCard/Footer). Stop: tsc/build non-zero; forbidden edit.
