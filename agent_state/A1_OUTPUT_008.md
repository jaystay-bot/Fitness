# A1_OUTPUT_008.md

**N:** 008 **Hat:** OPERATOR **Status:** EMITTED

## New files

- `lib/voice.ts` — pure browser-side wrapper around `window.SpeechRecognition` / `webkitSpeechRecognition`. Locally-typed (`SpeechRecognition` interface), no `@types/dom-speech-recognition` dependency. Exports `isVoiceSupported()` and `createRecognizer({ onTranscript, onEnd, onError, lang? })`.
- `lib/voiceParser.ts` — pure deterministic regex parser. `parseVoiceInput(transcript)` returns `{ partial, matched, missing }`. Handles digit + word numbers (including the colloquial "X Y" concatenation form like "one ninety" → 190). Imperial → metric conversion uses the same constant as `lib/units.ts` (0.453592). All field-extractors return `undefined` rather than fabricate.
- `lib/bodySystems.ts` — hand-curated `Record<id, BodySystemMapping>` mapping every supplement id (14 from `lib/supplements.ts` + 4 variation candidates from `lib/variation.ts`) to one or more body systems with one-line per-system notes. Local `nameToBodyKey` mirrors the canonicalization used elsewhere.
- `lib/svgPositions.ts` — `Record<BodySystem, { cx, cy }>` of SVG label-anchor coordinates inside the 0..400 × 0..640 viewBox + the dimensions themselves.
- `components/VoiceInput.tsx` — `'use client'` modal-style panel. Mic button starts/stops recognition; live transcript + interim text; on stop, `parseVoiceInput` produces an extracted-fields summary; submit only enables when the six core fields (`age, sex, heightCm, weightKg, primaryGoal, dietPattern`) are present. Renders the unsupported-browser fallback when `isVoiceSupported() === false`.
- `components/BodyVisualization.tsx` — server-component-safe (pure SVG). Hand-coded silhouette using `<ellipse>`, `<rect>`, `<path>`. Each body system that has at least one matched supplement gets a tag at the locked-position; tags color-code lime (clean) or clinical (warning if the supplement appears in any `result.warnings` entry). Side legend lists picks per system with dose + system note.
- `components/InteractiveTimeline.tsx` — `'use client'`. Pure inline SVG (no recharts; that lives in the frozen N=007 `TimelineProjection` only). Aggregate average line plus per-supplement energy lines, each color-rotated through palette-derived strokes. Per-supplement toggle row; Play button drives a 5-second `requestAnimationFrame` scrubber from day 1 to day 30; hover updates the day-detail. Disables Play and renders final state under `prefers-reduced-motion`.
- `components/TimelineDayDetail.tsx` — server-component-safe popup. Day number, four metric values, the day's `note`, and per-supplement breakdown.

## Modified files

- `lib/subscription.ts` — **only** the `isProUser` function is modified. New body returns `true` unconditionally. The verbatim `DEV MODE` comment block sits above it. `canAccess`, `PRICE_*` exports, `formatUsdCents` — all unchanged.

  > Architect contract referenced "isUserPro" but the function shipped in N=006 is `isProUser`. The contract typo is documented here; the function with that semantic role is `isProUser` and is the only one this cycle modifies.

- `components/AssessmentForm.tsx` — adds a "Speak protocol" voice button at the top of the form (above the Age row). When opened, mounts `<VoiceInput />` inline. The voice-extracted partial seeds the existing `input` state via `applyVoicePartial`; the imperial unit fields (`feet`, `inches`, `pounds`) are kept in sync via the existing converters. All other form behavior is unchanged.
- `components/ResultCard.tsx` — replaces `<TimelineProjection />` with `<InteractiveTimeline />` (still under the same `<ProGate userTier={tier} feature="checkin">`). Mounts `<BodyVisualization />` immediately above the supplement grid as a new section. The `TimelineProjection.tsx` file itself is **not** touched.
- `lib/types.ts` — added `BodySystem`, `VoiceParseResult`, `TimelineDayDetailEntry`. `UserInput`, `Recommendation`, `SupplementPick` shapes unchanged.
- `package.json` — **no diff**. Web Speech API is browser-native; SVG is pure markup; no animation library required.

## Frozen — untouched this cycle

- `lib/engine.ts`, `lib/supplements.ts`, `lib/conflicts.ts`, `lib/variation.ts`, `lib/confidence.ts`, `lib/units.ts`, `lib/slug.ts`, `lib/timeline.ts`, `lib/timelineData.ts`, `lib/labParser.ts`, `lib/labMapping.ts`, `lib/scanner.ts`, `lib/supabase.ts`, `lib/stripe.ts`, `lib/email.ts`, `lib/nutrition.ts`, `lib/verdict.ts`
- All N=001..N=007 API routes
- `tailwind.config.ts`, `app/globals.css`, `postcss.config.js`, `next.config.js`, `tsconfig.json`, `middleware.ts`, `.env.example`, `vercel.json`
- `app/page.tsx`, `app/layout.tsx`, `app/r/[slug]/page.tsx`, `app/pricing/page.tsx`, `app/account/page.tsx`, sign-in/sign-up
- `supabase/migrations/0001_subscriptions.sql`, `supabase/migrations/0002_lab_results_and_scans.sql`
- `python/parse_labs.py`, `python/scan_bottle.py`, `python/requirements.txt`
- All N=001..N=007 components except `ResultCard.tsx` and `AssessmentForm.tsx`

## Notes

- The `DEV MODE` comment block is the only mark of the gate relaxation. Re-enabling Pro gating in a future cycle is a one-function revert.
- The voice parser and body-systems mapping are both fully data-driven and deterministic. No LLM, no external service.
- The `InteractiveTimeline` builds entirely from `projectTimeline` — the function from N=007 is unchanged. Per-supplement lines are produced by re-running `projectTimeline` on a single-pick array, which is cheap (small fixed-size loop) and preserves all of `lib/timeline.ts`'s onset-curve semantics.
- Bundle: home `/` first-load grows slightly (the new `BodyVisualization` and `InteractiveTimeline` are dynamically imported with `next/dynamic({ ssr: false })` so heavy code never enters the initial chunk for users who do not see Pro features).
