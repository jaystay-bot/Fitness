# RECONSTRUCTED FROM GIT HISTORY
# This cycle did not run through the full six-hat loop. State reconstructed post-hoc from commit hash cb5daa04fc6f7701af73441f5a49afa0b6c409d6 on 2026-05-04.

---

# CURRENT_011.md

**N:** 011 **Hat:** COMMANDER (reconstructed) **Date:** 2026-05-04 **Status:** PASS (post-hoc)

---

## INTENT

Overhaul the pricing page to a 3-tier paid plan structure with correct Stripe price routing.

**Problem with N=006 pricing:** The pricing page shipped with two tiers (monthly / annual). The intended commercial structure has three paid tiers at different price points with different billing intervals. The Stripe routing in `/api/checkout` only supported monthly and annual intervals; a quarterly interval was missing.

**Changes:**

1. `lib/stripe.ts` — export `STRIPE_PRICE_QUARTERLY` constant for the quarterly price ID env var.
2. `app/api/checkout/route.ts` — add `quarter` interval branch routing to `STRIPE_PRICE_ID_QUARTERLY`.
3. `components/UpgradeButton.tsx` — add `quarter` interval type to the component's interval prop; add per-plan default labels so each pricing card gets correct button copy.
4. `app/pricing/page.tsx` — rewrite to four-tier layout: Free (always free) + Monthly ($4.99/mo) + Smart Stack ($9.99/3mo, labeled MOST POPULAR) + Full Year ($29.99/yr) with correct button-to-price routing per tier.

## DELIVERABLE FOR THIS N

Four-file patch. No new files. No new dependencies. No engine changes.

## CONSTRAINTS

All files other than the four listed are frozen. No new deps. Engine untouched.

## SUCCESS DEFINITION

Pricing page displays all four tiers. Smart Stack marked MOST POPULAR. Each Upgrade button routes to the correct Stripe price ID for its interval.

## HANDOFF

→ N=012 Signal Stack and Plugin Layer foundation cycle.
