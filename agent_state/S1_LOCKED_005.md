# S1_LOCKED_005.md

**N:** 005 **Hat:** ARCHITECT **Status:** LOCKED — NO DRIFT ALLOWED **Predecessors:** S1_LOCKED.md · S1_LOCKED_002.md · S1_LOCKED_003.md · S1_LOCKED_004.md (all still binding)

This document is *additive*. Prior locked contracts remain in force.

---

## SCOPE

Three atomic additions:

1. Engine depth: deterministic input-driven variation among scientifically equivalent supplements + per-pick confidence score.
2. Editorial motion: typewriter verdict reveal, animated evidence bars, scroll-linked parallax ledger, confidence badges.
3. 3D anchor: rotating supplement bottle in the result card via `three`.

## POSITIONING TRIPWIRE — NON-NEGOTIABLE

The product's market position is the credible alternative to engagement-optimized supplement apps. This cycle MUST NOT introduce ANY of the following, even adjacent or label-shifted variants:

- streak counters, daily-login rewards
- lootbox / slot-machine / confetti / particle-burst reveal animations
- push-notification opt-ins, browser notification permission prompts
- fake "people viewing" counters, fake testimonials, fake recent-activity feeds
- scarcity timers, countdown clocks, "limited time" copy
- achievements, badges, levels, points, XP
- progress bars that artificially slow the result reveal
- blocking modals between user and result
- gamification copy ("unlock," "earn," "level up," "achievement")

The Watcher greps for these strings; the Judge re-confirms in rendered HTML.

## NEW FILES ALLOWED THIS CYCLE (no others)

```
lib/variation.ts                     deterministic input hash + applyVariation + 4 internal candidates
lib/confidence.ts                    per-pick confidence scoring
components/VerdictReveal.tsx         typewriter reveal of verdict
components/EvidenceBar.tsx           animated horizontal bar tied to studyCount
components/ParallaxLedger.tsx        scroll-linked parallax wrapper for EvidenceLedger
components/SupplementBottle3D.tsx    three.js rotating bottle (client, code-split)
components/ConfidenceBadge.tsx       small confidence indicator per supplement card
```

## FILES MODIFIED THIS CYCLE (only these)

```
lib/engine.ts            call hashInput + applyVariation + computeConfidence; emit variationSeed; attach confidence per pick
lib/types.ts             add `confidence: number` to SupplementPick; add `variationSeed: number` to Recommendation
components/ResultCard.tsx replace <Verdict> with <VerdictReveal>; replace <EvidenceTier> with <EvidenceBar>; mount <SupplementBottle3D> above grid; mount <ConfidenceBadge> in each pick card
components/Hero.tsx      wrap <EvidenceLedger /> with <ParallaxLedger />
package.json             add `three: ^0.160.0` to dependencies (only)
```

## FROZEN — DO NOT TOUCH

- `lib/supplements.ts` (the 14 entries are inviolate)
- `lib/conflicts.ts`
- `lib/units.ts`, `lib/nutrition.ts`, `lib/verdict.ts`
- `components/UnitToggle.tsx`, `components/AssessmentForm.tsx`
- `components/EvidenceLedger.tsx` (wrapped externally only)
- `components/ConflictBanner.tsx`, `components/Footer.tsx`, `components/HowItWorks.tsx`, `components/Differentiators.tsx`, `components/Verdict.tsx`, `components/EvidenceTier.tsx`
- `app/api/recommend/route.ts` (route unchanged; the engine it calls may change as specified)
- `app/api/og/route.ts`
- `app/page.tsx`, `app/layout.tsx`, `app/globals.css`
- `tailwind.config.ts`, `postcss.config.js`, `next.config.js`, `tsconfig.json`, `README.md`, `.env.example`
- `tests/visual.spec.ts` is allowed to remain unchanged this cycle; the new Judge tests run in a separate harness file under `tests/`

## DETERMINISTIC VARIATION CONTRACT — `lib/variation.ts`

```ts
export function hashInput(input: UserInput): number;
export function applyVariation(picks: SupplementPick[], seed: number, input: UserInput): SupplementPick[];
```

Implementation rules:

- `hashInput`: compute a stable integer in `[0, 999]`. Concatenate field values in a fixed order (`age|sex|heightCm|weightKg|activityLevel|sleepHours|primaryGoal|dietPattern|caffeineCupsPerDay|alcoholDrinksPerWeek|symptomToFix`) and sum char codes mod 1000. Pure synchronous. No crypto. No randomness.
- 4 internal candidates declared inline in `lib/variation.ts` (NOT added to `lib/supplements.ts`):
  - `hmb` — Moderate, muscle-fit
  - `beta-alanine` — Moderate, muscle-fit
  - `citrulline-malate` — Moderate, muscle-fit
  - `tyrosine` — Moderate, focus-fit
  These are pure local data with the same shape as `SupplementEntry`. The 14 entries in `lib/supplements.ts` remain frozen.
- Equivalence classes (preserve evidence quality — Strong-tier picks NEVER swap to Moderate):
  - `muscle-moderate-helper`: { hmb, beta-alanine, citrulline-malate }
  - `focus-moderate-adaptogen`: { rhodiola (existing), tyrosine }
- `applyVariation`:
  - If `input.primaryGoal === "muscle"` and the current stack has fewer than 7 picks, append the seeded selection from `muscle-moderate-helper` as a new Moderate-tier pick.
  - If the existing stack contains `rhodiola` (id), replace it with the seeded selection from `focus-moderate-adaptogen` (which may pick rhodiola again — a 1-in-2 outcome).
  - All other picks pass through untouched.
- Determinism: same `seed` → same selection. No randomness.

## CONFIDENCE SCORING CONTRACT — `lib/confidence.ts`

```ts
export function computeConfidence(pick: SupplementPick, input: UserInput, warnings: string[]): number;
```

- Base by tier: `Strong=85`, `Moderate=75`, `Emerging=65`.
- `+5` if the pick's primary goal-fit matches `input.primaryGoal` (use the engine's existing `GOAL_CORE` map plus the variation equivalence classes).
- `+3` if the pick addresses `input.symptomToFix` (use `SYMPTOM_ADDONS`).
- `+3` if `input.dietPattern` forces this pick (e.g., `vegan` → B12).
- `-5` if any string in `warnings` mentions the pick's name (case-insensitive).
- Clamp to `[60, 99]`.
- Confidence is a transparency feature, not a filter; engine never drops a pick based on confidence.

## ENGINE INTEGRATION — `lib/engine.ts`

`recommend(input)` now:

1. `seed = hashInput(input)`
2. Build the candidate stack via the existing `buildStack(input)` logic.
3. `varied = applyVariation(stack, seed, input)`
4. Build warnings from `varied`.
5. Attach `confidence` to each pick via `computeConfidence`.
6. Return `Recommendation` with `variationSeed: seed` and supplements carrying `confidence`.

`UserInput` shape is **unchanged**. Engine is still pure and deterministic.

## TYPE EXTENSIONS — `lib/types.ts`

```ts
export interface SupplementPick {
  // …existing fields…
  confidence: number;        // 60–99 (added in N=005)
}

export interface Recommendation {
  // …existing fields…
  variationSeed: number;     // 0–999 (added in N=005)
}
```

`UserInput` unchanged.

## EDITORIAL MOTION CONTRACTS

### `components/VerdictReveal.tsx`

- `'use client'`.
- Props: `{ text: string }`.
- Reveal characters at 35 ms per character with `setTimeout`. No cursor blink, no caret element.
- Once revealed, the text is static and selectable.
- The reveal runs once per page load; subsequent re-mounts also reveal (no global flag).
- If `window.matchMedia('(prefers-reduced-motion: reduce)').matches`, render the full text immediately.

### `components/EvidenceBar.tsx`

- `'use client'`.
- Props: `{ tier: EvidenceTier; studyCount: number }`.
- Renders the tier label, an animated horizontal bar, and the study count in mono.
- Bar width: `Math.min(100, (Math.log10(studyCount + 1) / Math.log10(1000)) * 100)` percent.
- Fill animation runs over 600 ms on mount via CSS `transition` on `width`.
- Color: lime for Strong, paper-white for Moderate, paper-white-30% (`bg-paper/30`) for Emerging.
- Under reduced-motion, the bar is rendered at the final width without transition.

### `components/ParallaxLedger.tsx`

- `'use client'`.
- Wraps `EvidenceLedger` (no internal modification of the wrapped component).
- Translates the wrapper on the Y axis at 60% of scroll speed using `IntersectionObserver` for visibility gating and `requestAnimationFrame` for the actual transform updates.
- No third-party scroll library. No `scroll` listener at the global level outside rAF throttling.
- Disabled when `prefers-reduced-motion: reduce` matches — the wrapper renders children inline with no transform.

### `components/SupplementBottle3D.tsx`

- `'use client'`. Imports `three` directly.
- Props: `{ name: string; tier: 'Strong' | 'Moderate' | 'Emerging' }`.
- Scene: one `CylinderGeometry` (body) + one smaller `CylinderGeometry` (cap), grouped.
- Materials: `MeshStandardMaterial`. Body color `#FAFAF7`. Cap color: `#D4FF3A` (Strong) / `#FF6B35` (Moderate) / `#FAFAF7` at 0.3 opacity equivalent — the spec's "ink-grey for Emerging" maps to ink black `#0A0A0A` since the only allowed neutrals are ink and paper.

  **Resolution**: cap color is `#D4FF3A` (Strong), `#FF6B35` (Moderate), `#0A0A0A` (Emerging). Only the locked palette is used.
- Lighting: one `DirectionalLight` from upper-left + one low `AmbientLight`.
- Rotation: 0.3 rad/sec on the Y axis.
- Renderer: `WebGLRenderer({ alpha: true, antialias: true })`. Background transparent.
- Canvas size: 200 × 240 px on mobile, 280 × 320 px on desktop (use a Tailwind responsive switch, not a window-listener).
- Pauses animation when canvas is outside viewport via `IntersectionObserver`.
- Disposes geometries, materials, and the renderer on unmount.
- Reduced-motion fallback: no rAF loop. Render exactly one frame at mount and stop. The supplement name is rendered below the canvas in serif type regardless of motion preference.
- Code-splitting: `ResultCard.tsx` imports `SupplementBottle3D` via `next/dynamic` with `ssr: false` so `three` is only loaded after the user submits.

### `components/ConfidenceBadge.tsx`

- Server-component-safe (no `'use client'` required; no animation, no events).
- Props: `{ confidence: number }`.
- Renders `"{n}% confidence"` in `font-mono`, `text-paper/70`, `text-[11px]`.
- Positioned bottom-right of each supplement card via flex.

## ACCEPTANCE CRITERIA (Judge will verify all 9)

1. `npm install` succeeds with `three` added; total `node_modules` size increase ≤ 30 MB.
2. `npm run build` succeeds with zero errors.
3. Bundle delta: client first-load JS for `/` increases by < 200 KB **gzipped**, measured against the N=004 PASS build. Document both numbers in `TRUTH_RESULT_005.md`.
4. **Determinism**: `recommend(input)` called twice with the same input is `JSON.stringify`-identical, including `variationSeed` and every `confidence`.
5. **Variation**: two inputs differing only in `age` (28 vs 47, all else equal, muscle goal) produce stacks that differ in at least one pick name, AND every pick's `evidenceTier` in both lists is preserved (no Strong-tier pick swapped for a lower-tier pick).
6. **Confidence**: every `SupplementPick.confidence ∈ [60, 99]`; for a vegan input, the B12 pick has `confidence ≥ 90`.
7. **Visual 3D**: a screenshot at `agent_state/screenshots/result_3d_390.png` shows the rotating bottle inside the result card at 390 px viewport.
8. **Reduced-motion**: with Playwright `emulateMedia({ reducedMotion: 'reduce' })`, the typewriter renders the full verdict immediately (entire text visible after one frame), the parallax wrapper applies no transform, and `SupplementBottle3D` renders a static (non-rotating) frame. Screenshot saved to `agent_state/screenshots/result_reduced_motion_390.png`.
9. **Banned-pattern HTML check**: render the full result page HTML; assert zero occurrences of: `streak`, `unlock`, `earn`, `achievement`, `level up`, `limited time`, `people viewing`. Assert zero countdown timer elements (no element whose text content matches `/\d+:\d{2}/` outside `pubmedExample` references).

## BANNED THIS CYCLE (Watcher will check)

1. All retention-engineering patterns above.
2. Source-grep: `streak`, `unlock`, `earn xp`, `achievement`, `level up`, `limited time`, `people viewing`, `people are viewing`, `Notification.requestPermission`, `setInterval.*countdown` — all must return zero matches in source code.
3. Any modification to a frozen file.
4. Any new dependency other than `three`.
5. `localStorage`, `sessionStorage`, `document.cookie`.
6. Any pulling-forward of N=006 distribution work (`app/r/`, `components/SourcesPanel.tsx`, `components/EmailCapture.tsx`, `app/api/subscribe/`).
7. The string `"AI-powered"`.
8. Any `from-purple-` / `to-purple-` Tailwind class.
9. Any new color outside the locked palette (`#0A0A0A`, `#FAFAF7`, `#D4FF3A`, `#FF6B35`) in any new file.
10. Modification of `lib/supplements.ts` or `lib/conflicts.ts`.
11. Any change to `UserInput` in `lib/types.ts`. Only `SupplementPick.confidence` and `Recommendation.variationSeed` may be added.

## OPERATOR INSTRUCTIONS — Eight atomic commits

1. `N=005 operator: add lib/variation.ts with input hash and 4 candidate supplements`
2. `N=005 operator: add lib/confidence.ts with deterministic scoring`
3. `N=005 operator: integrate variation and confidence into engine; extend types`
4. `N=005 operator: add VerdictReveal, EvidenceBar, ConfidenceBadge components`
5. `N=005 operator: add ParallaxLedger and wrap EvidenceLedger in Hero`
6. `N=005 operator: add SupplementBottle3D with three.js, prefers-reduced-motion fallback`
7. `N=005 operator: integrate motion components into ResultCard`
8. `N=005 operator: write A1_OUTPUT_005.md manifest`

`A1_OUTPUT_005.md` is a manifest only — file path + one-line description per file.

## HANDOFF

→ Sentinel reads this file and emits GATE: OPEN or GATE: BLOCK.
