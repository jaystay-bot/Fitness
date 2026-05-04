# CURRENT_005.md

**N:** 005 **Hat:** COMMANDER (Jay) **Date:** 2026-05-03 **Status:** ACTIVE **Predecessor:** N=004 PASS

---

## INTENT

N=005 deepens Apex Protocol's personalization and visual authority without compromising its evidence-led positioning. Three atomic additions: (1) expand the rules engine with deterministic input-driven variation so similar inputs produce meaningfully different stacks, plus a per-pick confidence score derived from the engine's rule weights; (2) add an editorial motion layer including a typewriter verdict reveal, evidence-bar fill animations tied to actual study counts, and scroll-linked parallax on the evidence ledger; (3) add a slow-rotating 3D supplement-bottle visualization in the result card using three.js that displays the user's top-tier pick. All additions must reinforce the product's authority and must not introduce retention-engineering patterns banned by contract. Distribution and trust layer remains queued as N=006.

## SCOPE BOUNDARY

Three pillars, no fourth:

1. Engine depth: `lib/variation.ts` + `lib/confidence.ts`, plumbed into `lib/engine.ts`. Engine remains pure and deterministic. Same input → same output.
2. Editorial motion: `components/VerdictReveal.tsx`, `components/EvidenceBar.tsx`, `components/ParallaxLedger.tsx`, `components/ConfidenceBadge.tsx`. Every animation respects `prefers-reduced-motion`.
3. 3D anchor: `components/SupplementBottle3D.tsx` via `three`, code-split so three.js does not enter the initial page bundle.

The N=006 distribution + trust layer (`/r/[slug]`, `SourcesPanel`, `EmailCapture`, `/api/subscribe`) stays in the queue.

## NON-GOALS — POSITIONING TRIPWIRES

This cycle MUST NOT introduce streak counters, lootbox-style reveal animations, push-notification opt-ins, social-proof injection, scarcity timers, achievement badges/levels, blocking modals, FOMO copy, or gamification language. The Watcher and Judge greps for these explicitly. If a feature feels like it might be on the banned list, it is.

## SUCCESS DEFINITION

- Determinism preserved: `recommend(input)` called twice with the same input yields byte-identical results.
- Variation visible: two inputs differing only in age (28 vs 47, muscle goal) produce stacks that differ in at least one pick while every pick's evidence tier is preserved.
- Every `SupplementPick` carries a `confidence: number` in `[60, 99]`.
- Verdict reveals via typewriter at 35ms per character (instant under reduced-motion).
- Evidence bar fills over 600ms on mount with a logarithmic width derived from the actual `studyCount`.
- Parallax ledger translates at 60% scroll speed (no transform under reduced-motion).
- 3D bottle renders in the result card and pauses outside the viewport; reduced-motion replaces the live canvas with a single static frame.
- Bundle: client JS for the result page increases by less than 200 KB gzipped.

## CONSTRAINTS (Commander level)

- Only one new dependency: `three`. No test-framework adds.
- `lib/supplements.ts`, `lib/conflicts.ts`, `lib/units.ts`, `app/globals.css`, `tailwind.config.ts`, `postcss.config.js` and the existing routes are frozen.
- No `localStorage` / `sessionStorage` / cookies.
- Zero retention-engineering patterns.

## HANDOFF

→ Architect writes `/agent_state/S1_LOCKED_005.md`. Prior locked contracts remain binding.
