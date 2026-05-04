# QUEUE.md

## ACTIVE

- N=007 — Pro feature unlock cycle (account history + 30-day check-in + clinician PDF export + engine-update notifications). Awaiting Commander. Two-week deadline to honor `/pricing` "coming soon" disclosure.

## DONE

- N=001 — Apex Protocol scaffold (PASS).
- N=002 — Differentiation pass: evidence ledger + OG sharing + conflict promotion (PASS).
- N=003 — Styling recovery: PostCSS config + visual regression test (PASS).
- N=004 — US-first unit toggle: imperial default + metric toggle, engine unchanged (PASS).
- N=005 — Depth and authority pass: input-driven variation + per-pick confidence + editorial motion + 3D supplement bottle (PASS).
- N=006 — Launch-readiness commercial layer: Clerk auth + Stripe subscription + Supabase subscriptions table + shareable URLs + post-result email capture + pricing page with explicit "coming soon" labels (PASS).

## STANDING JUDGE PRIMITIVES

- **Visual baseline regression test (`tests/visual.spec.ts`)** is part of the standard Judge phase. Three N=003 computed-style assertions: hero `h1` font-size > 32px, `body.backgroundColor === rgb(10, 10, 10)`, primary CTA `backgroundColor === rgb(212, 255, 58)`. As of N=004, the same file also asserts the unit-toggle invariants: imperial-default mode (`#feet`, `#inches`, `#pounds` visible; FT/LB `aria-pressed="true"`) and metric-after-toggle mode (`#heightCm`, `#weightKg` visible; CM/KG `aria-pressed="true"`).
- **Positioning tripwire** (added N=005): every Judge phase re-runs a rendered-HTML banned-pattern check against `streak`, `unlock`, `achievement`, `level up`, `limited time`, `people viewing`, `earn xp/points/rewards`, and any `\d+:\d{2}` countdown timer. The Watcher's source-grep mirrors this list (`earn xp`, etc.).
- **Engine determinism**: `recommend(input)` must remain pure synchronous and `JSON.stringify`-identical across calls with the same input, including `variationSeed` and every `SupplementPick.confidence`.

## PENDING (future cycles — not part of N=006)

- Apify-based supplement price comparison
- Wearable integration (Oura OAuth + Apple Health XML import) — Pro feature; unlocks measurably different recommendations
- Open-source release of the engine + supplement table + conflict logic under MIT license
- WCAG 2.2 AAA accessibility remediation pass
- Award-surface positioning packets (Webby, FastCo IxD, Communication Arts)

These are queued for cycles beyond N=007.
