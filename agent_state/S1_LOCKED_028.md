# S1_LOCKED_028

N_ID: N_028

Intent:
Commerce data foundation for the vitamin buy-box system. Pure types + data +
deterministic logic that future agents extend without touching UI. Covers the
buy-box spec's N1 (data model + seed), N2 (image metadata/attribution), N3
(retailer outbound search-URL builders, "Check price" — no scraping, no fake
prices), and N5 (compliance copy + blocked-claim guard). No UI this cycle.

Safe defaults (per Commander spec):
- Outbound links are RETAILER SEARCH URLs (real, always-valid), not invented SKUs.
- price_cents = null → UI shows "Check price". Never a fabricated price.
- Images default to placeholder; real licensed refs stored as metadata with
  attribution + last_verified_at=null (cannot verify in a no-egress sandbox).
- Copy uses allowed phrasing ("commonly used for", "label says"); a guard rejects
  blocked medical-claim phrasing.

Scope / Allowed files (all NEW):
- lib/commerce/types.ts
- lib/commerce/retailers.ts
- lib/commerce/products.ts
- lib/commerce/images.ts
- lib/commerce/compliance.ts
- agent_state/* (trail)

Forbidden files:
- any existing lib/component/route; package.json/lock (no dependency)

Deliverables:
- VitaminProduct / RetailOffer / ProductImage / HealthComplianceNote types.
- Retailer registry + deterministic buildOffers() for Amazon, Walmart, Walgreens,
  CVS, Target, Costco, iHerb, GNC.
- 5 seed vitamins (no fake brand/price), each with compliance + image refs.
- compliance guard: containsMedicalClaim() + standard disclaimers.

Verify command:
```bash
npx tsc --noEmit && npm run build
```
(`next lint` is unconfigured/interactive — not usable as a gate.)

Parallel safe: false (new shared lib module). Stop: tsc/build non-zero; forbidden edit.
