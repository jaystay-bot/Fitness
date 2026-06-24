# S1_LOCKED_045

N_ID: N_045

Intent:
Answer "how much is it gonna be / where's it cheapest" honestly. The existing
commerce system (N=028) deliberately never fabricates a price — RetailOffer
priceCents stays null → "Check price" until verified. This N adds a clearly
DISTINCT estimate layer: typical retail cost RANGES for a daily dose, used to
show a monthly cost estimate for the user's own recommended stack, always
labeled "typical retail · not a live price". Plus an honest, general note on
where these categories are usually cheapest (store-brand/bulk/online).

Honesty (hard rules):
- Estimates are wide ranges, never a specific per-retailer or live price.
- Always rendered with the "typical range, not a live price" label.
- Does NOT touch the verified-price path (priceCents stays null → "Check price").

Scope / Allowed files:
- lib/commerce/priceEstimates.ts   (new — DAILY_COST_CENTS, monthlyStackCost,
  CHEAPEST_CHANNEL_NOTE)
- components/ResultCard.tsx         (render the stack monthly estimate)
- agent_state/* (trail)

Forbidden files:
- lib/commerce/types.ts, products.ts, retailers.ts (verified-price path untouched);
  engine/route/package.json.

Deliverables:
- Result shows "Est. cost ~$X–Y/month (typical retail · not a live price)" + the
  cheapest-channel note; tsc/build green.

Verify command:
```bash
npx tsc --noEmit && npm run build
```
(Screenshot N/A — sandbox blocks Playwright browser download. Estimate math
sanity-checked: gain-weight stack ≈ $24–62/month.)

Parallel safe: false (shared ResultCard). Stop: tsc/build non-zero; any fabricated live price.
