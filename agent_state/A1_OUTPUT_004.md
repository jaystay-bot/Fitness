# A1_OUTPUT_004.md

**N:** 004 **Hat:** OPERATOR **Status:** EMITTED

## New files

- `lib/units.ts` — pure conversion functions: `imperialToCm`, `imperialToKg`, `cmToImperial`, `kgToPounds`, plus `UnitSystem` type. No side effects.
- `components/UnitToggle.tsx` — `'use client'` segmented control. Stateless. `aria-pressed` reflects active system. Locked palette only.

## Modified files

- `components/AssessmentForm.tsx` — added `unitSystem`, `feet`, `inches`, `pounds` state; mounted `<UnitToggle />` above height/weight; conditional FT/IN + LB inputs vs CM + KG inputs; submit derives `heightCm`/`weightKg` from imperial via converters; inline clinical-orange validation when out-of-range; submit button disabled while invalid; toggle preserves entry across systems with default fallback when cross-conversion exceeds bounds.
- `tests/visual.spec.ts` — added two assertions: `imperialDefaultRendersFtInLb` (FT/IN/LB inputs present, CM/KG hidden, FT/LB `aria-pressed="true"`) and `metricRendersCmKgAfterToggle` (after CM/KG click, CM/KG inputs present, FT/IN/LB gone, CM/KG `aria-pressed="true"`). Saves `form_imperial_390.png` and `form_metric_390.png` alongside the existing N=003 baselines.

## Frozen — untouched this cycle

- `lib/engine.ts`, `lib/types.ts`, `lib/supplements.ts`, `lib/conflicts.ts`, `lib/ledgerSamples.ts`, `lib/nutrition.ts`, `lib/verdict.ts`
- `app/api/recommend/route.ts`, `app/api/og/route.ts`
- `components/Hero.tsx`, `components/ResultCard.tsx`, `components/EvidenceLedger.tsx`, `components/ConflictBanner.tsx`, `components/EvidenceTier.tsx`, `components/Verdict.tsx`, `components/HowItWorks.tsx`, `components/Differentiators.tsx`, `components/Footer.tsx`
- `app/page.tsx`, `app/layout.tsx`, `app/globals.css`
- `tailwind.config.ts`, `postcss.config.js`, `next.config.js`, `tsconfig.json`, `package.json`, `README.md`, `.env.example`

## Notes

- Engine signature (`recommend(input: UserInput): Recommendation`) and `UserInput` shape (numeric `heightCm`/`weightKg`) are unchanged. Conversion happens at the form boundary.
- Zero new dependencies. No `localStorage`, `sessionStorage`, or cookie usage. Toggle resets on reload.
- N=005 distribution work (`/r/[slug]`, `SourcesPanel`, `EmailCapture`, `/api/subscribe`) is still absent.
