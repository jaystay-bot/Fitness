# NEXT_005.md

**Previous N:** 004 — PASS (US-first unit toggle: imperial default + metric toggle, engine unchanged).

## N=005

N=005 = the original distribution + trust layer plan, now ready to ship on top of the US-friendly form. Pull the contract from `agent_state/QUEUE.md` entry titled **"Distribution and trust layer (shareable URLs + sources panel + post-result email capture)"**.

## Standing posture going forward

- Visual baseline regression test (`tests/visual.spec.ts`) is still part of the standard Judge phase. As of N=004 it also asserts the unit-toggle invariants (`form_imperial_390.png` + `form_metric_390.png`). Future cycles must keep those assertions green.
- Engine signature (`recommend(input: UserInput): Recommendation`) and `UserInput` shape are inviolate. Conversion stays at the form boundary.

## Other QUEUE candidates (Commander to consider after N=005)

- Stripe checkout for "Pro Protocol" deeper plan PDF.
- Apify-based supplement price comparison.
