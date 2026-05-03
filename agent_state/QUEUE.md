# QUEUE.md

## ACTIVE

- N=005 — Distribution and trust layer (shareable URLs + sources panel + post-result email capture). Awaiting Commander.

## DONE

- N=001 — Apex Protocol scaffold (PASS).
- N=002 — Differentiation pass: evidence ledger + OG sharing + conflict promotion (PASS).
- N=003 — Styling recovery: PostCSS config + visual regression test (PASS).
- N=004 — US-first unit toggle: imperial default + metric toggle, engine unchanged (PASS).

## STANDING JUDGE PRIMITIVES

- **Visual baseline regression test (`tests/visual.spec.ts`)** is part of the standard Judge phase. Three N=003 computed-style assertions: hero `h1` font-size > 32px, `body.backgroundColor === rgb(10, 10, 10)`, primary CTA `backgroundColor === rgb(212, 255, 58)`. As of N=004, the same file also asserts the unit-toggle invariants: imperial-default mode (`#feet`, `#inches`, `#pounds` visible; FT/LB `aria-pressed="true"`) and metric-after-toggle mode (`#heightCm`, `#weightKg` visible; CM/KG `aria-pressed="true"`). Five assertions total — every future cycle must keep them green.

## PENDING (future cycles — not part of N=004)

- Stripe checkout for "Pro Protocol" deeper plan PDF
- Apify-based supplement price comparison

These are queued for cycles beyond N=005.
