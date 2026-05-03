# QUEUE.md

## ACTIVE

- N=004 — Distribution and trust layer (shareable URLs + sources panel + post-result email capture). Awaiting Commander.

## DONE

- N=001 — Apex Protocol scaffold (PASS).
- N=002 — Differentiation pass: evidence ledger + OG sharing + conflict promotion (PASS).
- N=003 — Styling recovery: PostCSS config + visual regression test (PASS).

## STANDING JUDGE PRIMITIVES

- **Visual baseline regression test (`tests/visual.spec.ts`)** is now part of the standard Judge phase as of N=003. Every future cycle that touches CSS, the build pipeline, or layout must keep its three computed-style assertions green: hero `h1` font-size > 32px, `body.backgroundColor === rgb(10, 10, 10)`, primary CTA `backgroundColor === rgb(212, 255, 58)`. This is the styling tripwire — it caught the N=001 silent CSS pipeline failure after the fact and exists to prevent a recurrence.

## PENDING (future cycles — not part of N=003)

- Stripe checkout for "Pro Protocol" deeper plan PDF
- Apify-based supplement price comparison

These are queued for cycles beyond N=004.
