# RECONSTRUCTED FROM GIT HISTORY
# This cycle did not run through the full six-hat loop. State reconstructed post-hoc from commit hash e00095f45abd2c8372aa175c1e1022892d918386 on 2026-05-04.

---

# CURRENT_009.md

**N:** 009 **Hat:** COMMANDER (reconstructed) **Date:** 2026-05-04 **Status:** PASS (post-hoc)

---

## INTENT

UI polish pass addressing three discovered issues after N=008 merged:

1. **BodyVisualization SVG label clipping** — the SVG was using the default `overflow=hidden`, clipping labels that extended to the edge of the viewBox. Fix: add `overflow="visible"` to the SVG element.

2. **BottleScanner raw error exposure** — when `/api/scanner/identify` returned 401 or 403 (Pro gate), the component surfaced the raw HTTP status string rather than a user-readable message. Fix: intercept 401/403 and render specific strings ("Sign in to use the scanner" / "Upgrade to Pro to use the scanner").

3. **ResultCard progressive reveal and trust copy** — body map, food protocol, and 30-day plan sections were expanded by default, overwhelming the page. Fix: collapse all three by default with expand-on-demand. Add trust/value copy block above the supplement stack. Change UpgradeButton to primary style. Add sticky CTA bar for free users.

## DELIVERABLE FOR THIS N

Three component patches shipped atomically in a single commit. No new files. No new dependencies. No engine changes. No type changes.

## CONSTRAINTS

- Frozen: engine, types, lib/*, all API routes, tailwind.config.ts, supabase.
- Component changes limited to BodyVisualization.tsx, BottleScanner.tsx, ResultCard.tsx.
- No new deps. No localStorage. No gamification copy.

## SUCCESS DEFINITION

BodyVisualization labels fully visible. BottleScanner surfaces readable error strings for auth failures. ResultCard loads with sections collapsed; trust copy visible above the stack; sticky CTA present for free users.

## HANDOFF

→ N=010 hotfix for middleware public-route gap discovered immediately after.
