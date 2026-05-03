# CURRENT_002.md

**N:** 002 **Hat:** COMMANDER (Jay) **Date:** 2026-05-03 **Status:** ACTIVE **Predecessor:** N=001 PASS

---

## INTENT

N=002 converts Apex Protocol from a working tool into a differentiated product. Three atomic additions: (1) an evidence ledger strip in the hero that proves credibility before the form is filled, (2) a server-rendered Open Graph image per result so every share is distribution, (3) goal-conflict detection promoted to the lead position in the result, rendered in clinical orange before any stack appears when triggered. Success is measured by visual proof at 390px viewport plus functional tests on the OG endpoint and the conflict-promotion logic. Scope is limited to these three additions. No new dependencies beyond `next/og` (which ships with Next 14).

## SCOPE BOUNDARY

Three atomic additions. No fourth feature. No N=001 refactor. No palette change, no font change, no engine rebuild. Bugs found in N=001 code go to QUEUE.md as new N candidates, not into this cycle.

## SUCCESS DEFINITION

- Hero at 390×844 shows the evidence ledger above the form with three diverse-tier supplement cards.
- `/api/og` returns a 1200×630 image (default and parameterized) without external fetch and without leaving the Edge runtime.
- A submission whose input fires a conflict rule renders the conflict banner *above* the verdict in clinical orange, with a one-sentence message and a suggested fix.

## CONSTRAINTS (Commander level)

- No new dependencies in `dependencies` other than what `next/og` transitively provides; Playwright/Puppeteer for Judge screenshots only as `devDependencies`.
- Locked palette and typography from N=001 still bind. No exceptions.
- `lib/supplements.ts`, `app/globals.css`, and `tailwind.config.ts` are frozen.
- One PR for the cycle, opened only on Judge PASS.

## HANDOFF

→ Architect writes `/agent_state/S1_LOCKED_002.md`. The original `S1_LOCKED.md` remains binding for everything it covers.
