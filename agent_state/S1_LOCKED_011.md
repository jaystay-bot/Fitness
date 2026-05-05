# RECONSTRUCTED FROM GIT HISTORY
# This cycle did not run through the full six-hat loop. State reconstructed post-hoc from commit hash cb5daa04fc6f7701af73441f5a49afa0b6c409d6 on 2026-05-04.

---

# S1_LOCKED_011.md

**N:** 011 **Hat:** ARCHITECT (reconstructed) **Date:** 2026-05-04

---

## SCOPE

### NEW FILES
None.

### MODIFIED FILES

- `lib/stripe.ts` — add `STRIPE_PRICE_QUARTERLY` export (env var reference for quarterly price ID).
- `app/api/checkout/route.ts` — add `quarter` interval branch → `STRIPE_PRICE_ID_QUARTERLY`.
- `components/UpgradeButton.tsx` — add `quarter` to interval union type; add per-plan default label logic.
- `app/pricing/page.tsx` — rewrite to 4-tier layout (Free / Monthly $4.99 / Smart Stack $9.99/3mo MOST POPULAR / Full Year $29.99).

### FROZEN FILES

All other files. Engine unchanged. Types unchanged. All lib/* other than stripe.ts unchanged. All components other than UpgradeButton.tsx unchanged. All API routes other than checkout unchanged. No new deps.

## ACCEPTANCE CRITERIA (reconstructed)

1. npm run build passes with zero errors.
2. Pricing page renders four tiers.
3. Smart Stack tier labeled MOST POPULAR.
4. Monthly button routes to STRIPE_PRICE_ID (monthly).
5. Smart Stack button routes to STRIPE_PRICE_ID_QUARTERLY.
6. Full Year button routes to STRIPE_PRICE_ID_ANNUAL.
7. Free tier has no Upgrade button / routes to sign-up only.
8. No engine or type changes.
9. All N=010 and earlier acceptance criteria remain met.
