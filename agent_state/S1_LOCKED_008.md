# S1_LOCKED_008.md

**N:** 008 **Hat:** ARCHITECT **Status:** LOCKED — NO DRIFT ALLOWED **Predecessors:** S1_LOCKED.md · S1_LOCKED_002..S1_LOCKED_007.md (all still binding except the explicit Pro-gate relaxation defined below)

This document is *additive* except for one explicit, surgical change to `lib/subscription.ts` that temporarily disables Pro-tier gating for development. All other prior locks remain in force.

---

## SCOPE

1. **Voice-reactive form** — browser-native Web Speech API + deterministic regex parser produces a `UserInput` from natural-language speech.
2. **Body-systems visualization** — hand-coded SVG silhouette with labels positioned per a curated supplement-to-system map.
3. **Interactive timeline** — replaces the static `TimelineProjection` with a per-supplement filterable, hover-detail, play-through chart that uses the *unchanged* `projectTimeline` function from N=007.
4. **Pro-gate relaxation** — `isProUser` in `lib/subscription.ts` returns `true` unconditionally with a mandatory `DEV MODE` comment block. **No other change to the file.**

The contract's reference to "isUserPro" is a typo for the actual function name `isProUser` shipped in N=006. The function targeted for relaxation is the existing `isProUser` — the only function in `lib/subscription.ts` that gates Pro access.

## NEW FILES ALLOWED THIS CYCLE (no others)

```
lib/voice.ts                          Web Speech API wrapper (client-only)
lib/voiceParser.ts                    deterministic NL → UserInput parser
lib/bodySystems.ts                    supplement id → body system[] map
lib/svgPositions.ts                   anatomical SVG coordinate map
components/VoiceInput.tsx             speech-to-form modal/inline UI
components/BodyVisualization.tsx      anatomical SVG with labels
components/InteractiveTimeline.tsx    play-through, filter, hover detail
components/TimelineDayDetail.tsx      hover popup for a single day
```

## FILES MODIFIED THIS CYCLE (only these)

```
lib/subscription.ts            isProUser → returns true with DEV MODE block
components/AssessmentForm.tsx  add Voice button at top of form
components/ResultCard.tsx      replace TimelineProjection with InteractiveTimeline; mount BodyVisualization above the supplement grid
lib/types.ts                   add VoiceParseResult, BodySystem, TimelineDayDetail
package.json                   no diff (no new deps)
```

## FROZEN — DO NOT TOUCH

- `lib/engine.ts`, `lib/supplements.ts`, `lib/conflicts.ts`, `lib/variation.ts`, `lib/confidence.ts`, `lib/units.ts`, `lib/slug.ts`, `lib/timeline.ts`, `lib/timelineData.ts`, `lib/labParser.ts`, `lib/labMapping.ts`, `lib/scanner.ts`, `lib/supabase.ts`, `lib/stripe.ts`, `lib/email.ts`, `lib/nutrition.ts`, `lib/verdict.ts`
- All N=001..N=007 API routes (every file under `app/api/`)
- `tailwind.config.ts`, `app/globals.css`, `postcss.config.js`, `next.config.js`, `tsconfig.json`, `middleware.ts`, `.env.example`
- `app/page.tsx`, `app/layout.tsx`, `app/r/[slug]/page.tsx`, `app/pricing/page.tsx`, `app/account/page.tsx`, sign-in/sign-up pages
- `supabase/migrations/0001_subscriptions.sql`, `supabase/migrations/0002_lab_results_and_scans.sql`
- `components/Hero.tsx`, `components/EvidenceLedger.tsx`, `components/ConflictBanner.tsx`, `components/EmailCapture.tsx`, `components/UpgradeButton.tsx`, `components/AccountMenu.tsx`, `components/UnitToggle.tsx`, `components/ProGate.tsx`, `components/VerdictReveal.tsx`, `components/EvidenceBar.tsx`, `components/ParallaxLedger.tsx`, `components/SupplementBottle3D.tsx`, `components/ConfidenceBadge.tsx`, `components/Footer.tsx`, `components/HowItWorks.tsx`, `components/Differentiators.tsx`, `components/Verdict.tsx`, `components/EvidenceTier.tsx`, `components/TimelineProjection.tsx`, `components/LabUpload.tsx`, `components/LabComparison.tsx`, `components/BottleScanner.tsx`, `components/ScanResult.tsx`
- `python/parse_labs.py`, `python/scan_bottle.py`, `python/requirements.txt`, `vercel.json`

## VOICE INPUT CONTRACT

`lib/voice.ts`:
- Pure browser-side wrapper around `window.SpeechRecognition` / `window.webkitSpeechRecognition`. No imports from any package — Web Speech API is global.
- `isVoiceSupported()` returns `boolean`.
- `createRecognizer({ onTranscript, onEnd, onError })` returns `{ start(), stop() }`. Type the recognizer locally; do not depend on `@types/dom-speech-recognition`.

`lib/voiceParser.ts`:
- Pure deterministic. No async, no fetch, no LLM.
- `parseVoiceInput(transcript: string): VoiceParseResult` returns `{ partial: Partial<UserInput>; matched: (keyof UserInput)[]; missing: (keyof UserInput)[] }`.
- Patterns:
  - **Age** — digits 18–90 followed by `year(s)?` / `yo` / `y/o`, or standalone bare digit in that range.
  - **Sex** — `\bmale\b` / `\bfemale\b` / `\bman\b` / `\bwoman\b` / `\bm\b` / `\bf\b`.
  - **Height** — feet+inches like `5'10"`, `5 10`, `five ten`, `six feet two`; metric `178 cm`, `1\.78 m`. Result clamped to `[140, 220]` cm.
  - **Weight** — `190 lbs?`, `190 pounds`, `82 kg`, `82 kilos`. Convert imperial to kg with the same constant as `lib/units.ts` (0.453592). Result clamped to `[40, 200]` kg.
  - **Goal** — synonyms: muscle: `muscle|build|gain|bulk`; fat-loss: `fat loss|lose weight|cut|lean`; energy: `energy|tired|fatigue` (energy goal); longevity: `longevity|long life|healthspan`; focus: `focus|concentrate|cognitive|brain`.
  - **Diet** — exact match `omnivore|vegetarian|vegan|keto|mediterranean`.
  - **Caffeine** — `\d+\s*(cups?|coffees?|espressos?)`. Cap to 0–8.
  - **Alcohol** — `\d+\s*(drinks?|beers?|wines?|cocktails?)\s*(per|a)\s*(week|wk|day|nightly)?`. Convert to drinks/week (×7 if day-frequency).
  - **Symptom** — synonyms: fatigue: `tired|fatigue|low energy|exhausted|wiped`; brain-fog: `brain fog|foggy|hazy|cloudy`; poor-sleep: `can'?t sleep|insomnia|poor sleep|trouble sleeping`; low-strength: `weak|low strength|no power`; bloating: `bloated|bloating|gas`. Default `none`.
- For any field that cannot be confidently extracted, the parser returns `undefined` for that field. **Never fabricate.**

`components/VoiceInput.tsx`:
- `'use client'`. Renders a microphone button. On click → `createRecognizer().start()`.
- Real-time transcript displayed as the user speaks.
- On end of speech, call `parseVoiceInput(transcript)` and render the extracted fields with inline confirmation. Each field has a small Edit affordance that returns the user to the standard form for that field with everything else pre-filled.
- A "Submit protocol" button submits when at least the required minimum (`age, sex, heightCm, weightKg, primaryGoal, dietPattern`) was extracted; otherwise the button is disabled and the missing fields are listed.
- If `isVoiceSupported() === false`, render a clearly-worded notice and a button that returns the user to the standard form.

## BODY SYSTEMS CONTRACT

`lib/bodySystems.ts`:
- Hand-curated `Record<string, BodySystem[]>` keyed by supplement id (matching `lib/supplements.ts` ids + variation candidates from `lib/variation.ts`). The mapping is data, not generated.
- Body systems: `'brain' | 'heart' | 'liver' | 'gut' | 'muscles' | 'bones' | 'immune' | 'skin'`.
- Per-supplement one-line `note` explaining why that supplement targets each system.

`lib/svgPositions.ts`:
- `Record<BodySystem, { cx: number; cy: number }>` SVG coordinates for label placement. The silhouette is in a `0..400` × `0..640` viewBox.

`components/BodyVisualization.tsx`:
- Server-component-safe (no client hooks needed). Pure SVG.
- Hand-coded silhouette using basic shapes (`<ellipse>`, `<rect>`, `<path>`). No designer asset.
- Renders a labeled tag near each system that has at least one matched supplement in the recommendation. Tag fill: lime for clean, clinical-orange when the supplement appears in any `result.warnings` entry.
- A small below-canvas legend lists each tag with the supplement name, dose, and the system note.

## INTERACTIVE TIMELINE CONTRACT

`components/InteractiveTimeline.tsx`:
- `'use client'`.
- Uses `projectTimeline` from `lib/timeline.ts` **unchanged**.
- Renders one cumulative-effect line per supplement (color rotation derived from the locked palette: `lime`, `paper`, `clinical`, `paper-50`, `paper-30`, `lime-60`, `clinical-60`).
- Toggle row above the chart: one button per supplement; clicking toggles its line off/on. Active by default.
- Below the chart: a Play button. On click, animates a vertical scrubber from day 1 to day 30 over 5000 ms via `requestAnimationFrame`. The day under the scrubber updates a `TimelineDayDetail` popup in real time.
- Hover (or tap) a day on the chart → the same `TimelineDayDetail` popup is anchored to that day.
- `prefers-reduced-motion: reduce` → Play button is hidden and the chart renders in its final state immediately. No rAF loop is started.
- The chart itself is built with inline SVG (no recharts; recharts is for the static N=007 `TimelineProjection`). Lines are computed from the `TimelinePoint[]` returned by `projectTimeline`. Per-supplement lines are derived by re-running the timeline with each supplement isolated.

`components/TimelineDayDetail.tsx`:
- Hover popup. Renders day number, the per-supplement contribution to the cumulative metrics on that day, and the day's `note` from the `TimelinePoint`. Uses the locked palette only.

## PRO GATE RELAXATION CONTRACT

`lib/subscription.ts`:

The function targeted for relaxation is `isProUser`. The new body returns `true` unconditionally. Above the function, the following exact comment block must be present (verbatim, including the equals-sign banner):

```
// ============================================================
// DEV MODE: Pro tier gating temporarily disabled for testing.
// All Pro features are accessible to every user, including 
// anonymous users, until production Stripe and Clerk are 
// configured. Re-enable gating in a future cycle by reverting 
// this function to its prior implementation.
// ============================================================
```

The function signature is unchanged: `(tier: SubscriptionTier | null | undefined) => boolean`. `canAccess`, `PRICE_*` exports, and `formatUsdCents` are unchanged. **No other modification to `lib/subscription.ts` is permitted.**

`<ProGate>` source code is unchanged. The relaxation flows entirely through `isProUser` returning `true` and `canAccess` (which calls `isProUser`) inheriting that.

## ACCEPTANCE CRITERIA (Judge will verify all 12)

1. `npm install` succeeds. Zero new dependencies.
2. `npm run build` succeeds with zero errors.
3. Anonymous user (no Clerk env) can access voice input, body visualization, and interactive timeline without signing in. Verified via Playwright at 390×844 — all three features visible after submitting the standard form.
4. `parseVoiceInput("thirty one year old male six feet tall one ninety pounds training for muscle omnivore two coffees three drinks fatigue")` returns a `VoiceParseResult` with `age=31, sex='male', heightCm≈183, weightKg≈86, primaryGoal='muscle', dietPattern='omnivore', caffeineCupsPerDay=2, alcoholDrinksPerWeek=3, symptomToFix='fatigue'` (sleepHours and activityLevel may be undefined; both are listed in `missing`).
5. `parseVoiceInput("uhh i'm a person and i feel kinda whatever")` returns mostly `undefined` fields and a non-empty `missing` array. **No fabricated values.**
6. Browsers without Web Speech API render the fallback notice. Verified via Playwright with `await context.addInitScript(() => { delete (window as any).SpeechRecognition; delete (window as any).webkitSpeechRecognition; });`.
7. `BodyVisualization` renders an SVG silhouette with at least one labeled supplement element when the result contains supplements. Screenshot saved to `agent_state/screenshots/body_viz_390.png`.
8. `InteractiveTimeline` renders 30 days of data with multiple lines and a working Play button. Screenshot saved to `agent_state/screenshots/timeline_interactive_390.png`.
9. Hovering a day on the timeline shows `TimelineDayDetail` with the supplement contributions for that day.
10. With Playwright `emulateMedia({ reducedMotion: 'reduce' })`, the Play button is hidden and the chart renders in its final state.
11. `lib/subscription.ts` diff: only the `isProUser` function changes; the verbatim DEV MODE comment block is present; no other function is modified.
12. N=007 acceptance tests pass as regression: timeline projection (function-level), lab parser, bottle scanner, ProGate visibility (Pro mock OR DEV MODE), and earlier-cycle behaviors all work identically.

## BANNED THIS CYCLE

1. Any modification to a frozen file.
2. Any new runtime dependency.
3. Any external speech recognition or LLM service.
4. Any modification to the `subscriptions` table or Stripe integration.
5. Any modification to `<ProGate>` component code (only `isProUser` evaluation changes).
6. `localStorage`, `sessionStorage`, `document.cookie` outside library internals.
7. The string `"AI-powered"`.
8. `from-purple-` / `to-purple-` Tailwind classes.
9. Any new color outside the locked palette in any new file.
10. Any change to the engine signature.
11. Any analytics SDK.

## OPERATOR INSTRUCTIONS — Eleven atomic commits

```
1.  N=008 operator: relax isUserPro for development testing
2.  N=008 operator: add lib/voice.ts and voiceParser.ts
3.  N=008 operator: add VoiceInput component
4.  N=008 operator: integrate voice input button into AssessmentForm
5.  N=008 operator: add lib/bodySystems.ts mapping
6.  N=008 operator: add lib/svgPositions.ts coordinate map
7.  N=008 operator: add BodyVisualization component
8.  N=008 operator: add InteractiveTimeline component
9.  N=008 operator: add TimelineDayDetail component
10. N=008 operator: integrate body viz and interactive timeline into ResultCard
11. N=008 operator: write A1_OUTPUT_008.md manifest
```

## HANDOFF

→ Sentinel reads this file and emits GATE: OPEN or GATE: BLOCK.
