# RECONSTRUCTED FROM GIT HISTORY
# This cycle did not run through the full six-hat loop. State reconstructed post-hoc from commit hash 89780428988132cc3d6c02954d54fc7685c5a513 on 2026-05-04.

---

# S1_LOCKED_010.md

**N:** 010 **Hat:** ARCHITECT (reconstructed) **Date:** 2026-05-04

---

## SCOPE

### NEW FILES
None.

### MODIFIED FILES

- `middleware.ts` — add `/api/checkout` and `/api/subscription` to the Clerk public matcher so Clerk passes requests through to the routes' own auth guards.

### FROZEN FILES

All other files. No engine changes. No type changes. No component changes. No new dependencies.

## ACCEPTANCE CRITERIA (reconstructed)

1. npm run build passes with zero errors.
2. POST /api/checkout from an anonymous session returns 401 (not 404 or silent failure).
3. GET /api/subscription from an anonymous session returns 401.
4. Authenticated user can reach Stripe Checkout via UpgradeButton without middleware interception.
5. All N=009 and earlier acceptance criteria remain met.
