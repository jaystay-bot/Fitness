# NEXT_004.md

**Previous N:** 003 — PASS (styling recovery: PostCSS config + visual regression test).

## N=004

N=004 = the original distribution and trust layer plan from the prior `NEXT_003.md`, now safe to ship because styling renders correctly. Pull the locked contract from `QUEUE.md` entry titled **"Distribution and trust layer (shareable URLs + sources panel + post-result email capture)"**. Do not redefine — re-use the prior plan verbatim.

## Standing posture going forward

- Visual baseline test (`tests/visual.spec.ts`) is now part of the standard Judge phase. Every future cycle that touches CSS, build pipeline, or layout must keep its three computed-style assertions green.
- The locked palette and typography are non-negotiable; the test enforces them at runtime.

## Other QUEUE candidates (Commander to consider after N=004)

- Email capture *after* result is shown (folded into the N=004 distribution layer per `QUEUE.md`).
- Stripe checkout for "Pro Protocol" deeper plan PDF.
- Apify-based supplement price comparison.
