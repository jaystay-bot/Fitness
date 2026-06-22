# Commerce Expansion Loop (for future agents)

This module (`lib/commerce/`) maps users to the cheapest **verified** purchase
options for the vitamins the app recommends. It does **not** sell anything. Any
agent may extend it autonomously by following the recipes below. Make the safe
default decision and keep going — only stop to ask Jay on the escalation
triggers at the bottom.

## The pieces

| File | Role |
|---|---|
| `types.ts` | Data contracts (VitaminProduct, RetailOffer, ProductImage, HealthComplianceNote). |
| `retailers.ts` | Retailer registry + deterministic outbound **search-URL** builders + `buildOffers` / `rankOffers`. |
| `products.ts` | Seed products + `resolveProduct` (offers + image + compliance). Build-time compliance guard. |
| `images.ts` | Image metadata + attribution + safe placeholder resolution. |
| `compliance.ts` | Disclaimers + blocked-claim guard (`auditCopy`). |
| `components/commerce/*` | Buy-box UI (BottleVisual, BuyBox, ProductCard, AttributionFooter). |
| `app/shop/page.tsx` | Demo route. |

## Recipe — add a product

1. Append a `product({ ... })` entry to `SEED_PRODUCTS` in `products.ts`.
2. `brand` is usually `null` (we route to a brand-agnostic search). Only set a
   brand when linking to a specific, verified SKU.
3. Copy MUST be structure-function safe. The module-load guard (`auditCopy`)
   fails the build on blocked claims — write "commonly used to support …",
   "label says …", never "cures/treats/prevents disease".
4. Set `engineSupplementId` when the product matches an engine pick (ties in the
   real evidence tier + PMID).
5. `npm run build` — green means the copy passed the guard.

## Recipe — add a retailer

1. Add an entry to `RETAILERS` in `retailers.ts` with a real `searchUrl(query)`
   builder (the retailer's own search endpoint) and a `priorityRank`.
2. Add its id to `DEFAULT_RETAILERS` if it should appear by default.
3. Never scrape or deep-link a guessed product path — search URLs only until a
   verified product URL / affiliate feed exists.

## Recipe — add a real product image (replace the illustration)

1. Source ONLY from license-clear places: Wikimedia Commons, Unsplash, Pexels,
   Pixabay, or an official brand/retailer asset whose terms permit display.
2. Verify the file + license with network access, then add a `ProductImage` with
   `imageType: "bottle"`, the raw `imageUrl` (or downloaded `localPath`),
   `licenseType`, `attributionRequired`, `attributionText`, and a real
   `lastVerifiedAt`. `resolveProductImage` will then prefer it over the placeholder.
3. If you cannot verify it, leave the placeholder. Never imply an unverified
   image is the real bottle.

## Pricing rule (non-negotiable)

Never write a fabricated price. `priceCents` stays `null` (UI shows "Check
price") until a live price is verified via a retailer API / affiliate feed, at
which point set `priceCents` **and** `lastVerifiedAt`. `rankOffers` only badges
"Best price" on a verified cheapest offer.

## Default decisions (don't ask — just do)

- Outbound retailer link over any checkout.
- "Check price" over a guessed price.
- Placeholder over an unverified/copyright-risky image.
- Exact label copy over any health claim.
- Clean premium UI over clutter; no fake urgency.

## Escalation triggers (DO ask Jay)

- Adding live pricing, affiliate tags, or anything that touches money/revenue.
- Anything resembling a real checkout, cart, or direct sale ("are we selling?").
- A medical/legal claim question, a regulated-ingredient question, or pregnancy/
  pediatric dosing.
- Using a specific brand's product photo whose license you cannot confirm.
- Dropshipping / fulfillment (explicitly out of scope for now).

## Not built yet (future N)

- Live price + exact-SKU resolution (retailer APIs / affiliate feeds; needs egress).
- Real bottle photography (needs egress to verify/download + attribution).
- Nav link to `/shop` and per-recommendation "where to buy" deep links from the
  result card.
