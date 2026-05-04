# QUEUE.md

## ACTIVE

- N=009 — Either re-enable Pro gating with Stripe/Clerk test-mode validation (Track A), or pull two more interactive features (Track B). Awaiting Commander.

## DONE

- N=001 — Apex Protocol scaffold (PASS).
- N=002 — Differentiation pass: evidence ledger + OG sharing + conflict promotion (PASS).
- N=003 — Styling recovery: PostCSS config + visual regression test (PASS).
- N=004 — US-first unit toggle: imperial default + metric toggle, engine unchanged (PASS).
- N=005 — Depth and authority pass: input-driven variation + per-pick confidence + editorial motion + 3D supplement bottle (PASS).
- N=006 — Launch-readiness commercial layer: Clerk auth + Stripe subscription + Supabase subscriptions table + shareable URLs + post-result email capture + pricing page with explicit "coming soon" labels (PASS).
- N=007 — Clinical companion pass: 30-day timeline projection (recharts) + lab result PDF parser (Python via spawn) + supplement bottle scanner (Python OCR), all Pro-tier gated. Privacy posture: raw uploads never persist (PASS).
- N=008 — Interactive expansion: voice-reactive form (Web Speech API + deterministic regex parser) + body-systems SVG visualization + interactive 30-day timeline with play-through + temporary `isProUser` DEV MODE relaxation (PASS).

## STANDING REMINDERS

- **DEV MODE on `isProUser`** — the verbatim comment block in `lib/subscription.ts` flags that Pro tier gating is currently disabled for testing. Re-enable before commercial launch by reverting the function body to `return tier === "pro";` and removing the comment block.

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
