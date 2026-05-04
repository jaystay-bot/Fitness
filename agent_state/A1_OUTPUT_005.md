# A1_OUTPUT_005.md

**N:** 005 **Hat:** OPERATOR **Status:** EMITTED

## New files

- `lib/variation.ts` — pure `hashInput(input) → 0..999` + `applyVariation(picks, seed, input)`. Defines 4 internal variation candidates (HMB, beta-alanine, citrulline-malate, tyrosine) plus two equivalence classes: `muscle-moderate-helper` (HMB / beta-alanine / citrulline-malate) and `focus-moderate-adaptogen` (rhodiola-keep / tyrosine). Strong-tier picks are never swapped to a lower tier.
- `lib/confidence.ts` — pure `computeConfidence(pick, input, warnings) → [60, 99]`. Tier base + goal-fit + symptom-fit + diet-forced bonuses, minus warning penalty.
- `components/VerdictReveal.tsx` — `'use client'` typewriter at 35 ms/char with `prefers-reduced-motion` instant-render fallback. No cursor blink.
- `components/EvidenceBar.tsx` — `'use client'` animated horizontal bar; width = `log10(studyCount + 1) / log10(1000) * 100` clamped to `[2, 100]`%; 600 ms `width` transition; lime / paper / paper/30 fill by tier; reduced-motion renders final width without transition.
- `components/ConfidenceBadge.tsx` — server-safe text badge, mono 11 px, paper-white-70%.
- `components/ParallaxLedger.tsx` — `'use client'` IntersectionObserver-gated rAF translation at 60 % scroll speed. Scroll listener throttled by rAF; transform cleared on unmount; reduced-motion → no transform.
- `components/SupplementBottle3D.tsx` — `'use client'` `three.js` scene: cylinder body (paper-white) + cap (lime / clinical / ink by tier); single directional + ambient light; transparent renderer; 200×240 mobile / 280×320 desktop; rotation 0.3 rad/s on Y; pauses outside viewport via IntersectionObserver; reduced-motion renders one static frame; full geometry / material / renderer disposal on unmount.

## Modified files

- `lib/types.ts` — `SupplementPick` gains `confidence: number`; `Recommendation` gains `variationSeed: number`. `UserInput` unchanged.
- `lib/engine.ts` — `recommend()` now computes `variationSeed = hashInput(input)`, passes the base stack through `applyVariation`, slices to 7, builds warnings, then attaches `confidence` per pick via `computeConfidence`. Pure synchronous. Determinism preserved.
- `components/ResultCard.tsx` — replaces `<Verdict />` with `<VerdictReveal />`; replaces `<EvidenceTier />` with `<EvidenceBar />`; mounts `<SupplementBottle3D />` (code-split via `next/dynamic({ ssr: false })`) above the supplement grid; mounts `<ConfidenceBadge />` inside each supplement card. ResultCard itself is now `'use client'` since it consumes client-only children.
- `components/Hero.tsx` — wraps `<EvidenceLedger />` with `<ParallaxLedger>`.
- `package.json` — `three: ^0.160.0` added to `dependencies` (resolved to 0.160.1). No other dep changes.

## Frozen — untouched this cycle

- `lib/supplements.ts`, `lib/conflicts.ts`, `lib/units.ts`, `lib/nutrition.ts`, `lib/verdict.ts`
- `app/api/recommend/route.ts`, `app/api/og/route.ts`
- `app/page.tsx`, `app/layout.tsx`, `app/globals.css`
- `components/UnitToggle.tsx`, `components/AssessmentForm.tsx`, `components/EvidenceLedger.tsx`, `components/ConflictBanner.tsx`, `components/Footer.tsx`, `components/HowItWorks.tsx`, `components/Differentiators.tsx`, `components/Verdict.tsx`, `components/EvidenceTier.tsx`
- `tailwind.config.ts`, `postcss.config.js`, `next.config.js`, `tsconfig.json`, `README.md`, `.env.example`
- `tests/visual.spec.ts` (still runs the N=003 + N=004 baselines)

## Notes

- `three` v0.160 ships JavaScript without bundled type declarations. `SupplementBottle3D.tsx` uses a single `// @ts-expect-error` on the import and a local `ThreeNS` type shim covering only the surfaces touched. No `@types/three` was added.
- Determinism verified against the same input — `JSON.stringify(recommend(input))` is byte-identical across calls.
- Variation verified: muscle/male/age=28 yields beta-alanine as the moderate helper; age=47 yields citrulline-malate; tier sequence preserved (`Strong, Strong, Strong, Strong, Strong, Moderate` in both).
- Vegan B12 confidence = 91 (≥ 90) on the standard sample input.
- N=006 distribution work (`/r/[slug]`, `SourcesPanel`, `EmailCapture`, `/api/subscribe`) remains absent.
