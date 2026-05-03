# S1_LOCKED_004.md

**N:** 004 **Hat:** ARCHITECT **Status:** LOCKED — NO DRIFT ALLOWED **Predecessors:** S1_LOCKED.md · S1_LOCKED_002.md · S1_LOCKED_003.md (all still binding)

This document is *additive*. Prior locked contracts remain in force.

---

## SCOPE

Insert a US-first unit-system toggle into the Assessment Form. Convert imperial inputs to metric at the form boundary. The engine signature does not change.

## NEW FILES ALLOWED THIS CYCLE (no others)

```
components/UnitToggle.tsx        segmented control for FT/LB ↔ CM/KG
lib/units.ts                     pure conversion functions
```

## FILES MODIFIED THIS CYCLE (only these)

```
components/AssessmentForm.tsx    add UnitToggle + conditional inputs + boundary conversion
tests/visual.spec.ts             add imperial + metric assertions and screenshots
```

## FROZEN — DO NOT TOUCH

- `lib/engine.ts` — engine still receives `heightCm` and `weightKg`.
- `lib/types.ts` — `UserInput` shape unchanged.
- `lib/supplements.ts`, `lib/conflicts.ts`, `lib/ledgerSamples.ts`, `lib/nutrition.ts`, `lib/verdict.ts` — all frozen.
- `app/api/recommend/route.ts` — frozen.
- `app/api/og/route.ts` — frozen.
- `components/Hero.tsx`, `components/ResultCard.tsx`, `components/EvidenceLedger.tsx`, `components/ConflictBanner.tsx`, `components/EvidenceTier.tsx`, `components/Verdict.tsx`, `components/HowItWorks.tsx`, `components/Differentiators.tsx`, `components/Footer.tsx` — all frozen.
- `app/page.tsx`, `app/layout.tsx`, `app/globals.css` — frozen.
- `tailwind.config.ts`, `postcss.config.js`, `next.config.js`, `tsconfig.json`, `package.json`, `README.md`, `.env.example` — frozen.

## UNIT CONVERSION CONTRACT — `lib/units.ts`

```ts
export type UnitSystem = 'imperial' | 'metric';

export function imperialToCm(feet: number, inches: number): number;
export function imperialToKg(pounds: number): number;
export function cmToImperial(cm: number): { feet: number; inches: number };
export function kgToPounds(kg: number): number;
```

Implementation rules:

- `imperialToCm(feet, inches)` → `Math.round((feet * 12 + inches) * 2.54)`
- `imperialToKg(pounds)` → `Math.round(pounds * 0.453592)`
- `cmToImperial(cm)`:
  - `totalInches = Math.round(cm / 2.54)`
  - `feet = Math.floor(totalInches / 12)`
  - `inches = totalInches % 12`
- `kgToPounds(kg)` → `Math.round(kg / 0.453592)`

All four are pure synchronous functions. No side effects, no async, no fetch, no network.

The engine bounds (`heightCm` ∈ [140, 220], `weightKg` ∈ [40, 200]) still apply on the converted values. The form must not silently clamp; it must surface an inline validation error and disable submit.

Imperial input bounds enforced at the input layer:
- feet ∈ [4, 7]
- inches ∈ [0, 11]
- pounds ∈ [88, 440]

## UNIT TOGGLE CONTRACT — `components/UnitToggle.tsx`

Props:

```ts
{ system: UnitSystem; onChange: (next: UnitSystem) => void }
```

- `'use client'` directive at the top.
- Stateless. Parent owns the `unitSystem` state.
- Renders a two-button segmented control with labels `FT / LB` and `CM / KG`.
- Active button: `bg-lime` (locked `#D4FF3A`), `text-ink` black, mono font.
- Inactive button: `bg-transparent`, `text-paper/60`, mono font, `border border-paper/20` 1px.
- Container: `inline-flex`, `rounded-md`, mono font.
- Each button has `aria-pressed` reflecting active state and a descriptive `aria-label`.
- Position in `AssessmentForm`: above the height/weight input row.

## ASSESSMENT FORM MODIFICATIONS — `components/AssessmentForm.tsx`

Add the following local state at the top of the component:

```ts
const [unitSystem, setUnitSystem] = useState<UnitSystem>('imperial');
const [feet, setFeet] = useState<number>(5);
const [inches, setInches] = useState<number>(10);
const [pounds, setPounds] = useState<number>(180);
// Existing input.heightCm and input.weightKg state remains for metric mode.
```

Default `DEFAULTS` on the `UserInput` constant remains `heightCm: 178, weightKg: 82` so the metric mode is pre-populated correctly when a user toggles into it.

Render the `UnitToggle` immediately above the height/weight input pair, full-width inside the form column.

When `unitSystem === 'imperial'`:
- Height row: a label `HEIGHT` over a two-column subgrid containing `FT` (4–7) and `IN` (0–11) numeric inputs.
- Weight row: a label `WEIGHT` over a `LB` (88–440) numeric input.

When `unitSystem === 'metric'`:
- Height row: existing `HEIGHT (CM)` input (140–220).
- Weight row: existing `WEIGHT (KG)` input (40–200).

On submit:

```ts
let heightCm: number;
let weightKg: number;
if (unitSystem === 'imperial') {
  heightCm = imperialToCm(feet, inches);
  weightKg = imperialToKg(pounds);
} else {
  heightCm = input.heightCm;
  weightKg = input.weightKg;
}
if (heightCm < 140 || heightCm > 220 || weightKg < 40 || weightKg > 200) {
  // surface inline error, do not call /api/recommend
  return;
}
// fetch /api/recommend with { ...input, heightCm, weightKg }
```

When the toggle flips:
- `imperial → metric`: derive `heightCm` and `weightKg` from `(feet, inches, pounds)` using the converters; if the result is outside bounds, fall back to defaults `heightCm: 178, weightKg: 82`.
- `metric → imperial`: derive `(feet, inches)` from `heightCm` and `pounds` from `weightKg`; if either is outside imperial bounds, fall back to defaults `feet: 5, inches: 10, pounds: 180`.

Inline validation message rendering (clinical-orange, 11px, system sans, single line, below the height/weight row):
- `Height must be between 4'7" and 7'2".` when converted `heightCm` ∉ [140, 220].
- `Weight must be between 88 lb and 440 lb.` when converted `weightKg` ∉ [40, 200].

The submit button must be `disabled` whenever the validation message is active.

## TEST FILE MODIFICATIONS — `tests/visual.spec.ts`

Extend the existing visual test suite. Add two new exported steps that:

1. **Imperial mode (default)**: at 390×844, after page load, assert that the form has visible inputs with `id="feet"`, `id="inches"`, `id="pounds"`, that no input with `id="heightCm"` or `id="weightKg"` is visible, and that the FT/LB segmented button has `aria-pressed="true"`. Save full-page screenshot to `agent_state/screenshots/form_imperial_390.png`.
2. **Metric mode**: click the CM/KG segmented button. Assert that `id="heightCm"` and `id="weightKg"` are visible, that no input with `id="feet"`/`id="inches"`/`id="pounds"` is visible, and that the CM/KG segmented button has `aria-pressed="true"`. Save full-page screenshot to `agent_state/screenshots/form_metric_390.png`.

Existing N=003 baseline assertions (h1 font-size, body bg, CTA bg) remain in the same file and are still asserted.

## ACCEPTANCE CRITERIA (Judge will verify all 7)

1. `npm install` succeeds. Zero dependency changes.
2. `npm run build` succeeds with zero errors.
3. The N=003 visual baseline still passes — body bg `rgb(10, 10, 10)`, CTA bg `rgb(212, 255, 58)`, H1 font-size > 32px.
4. `form_imperial_390.png`: at 390×844 on first load, FT/IN/LB inputs are present and FT/LB toggle has `aria-pressed="true"`.
5. `form_metric_390.png`: after clicking CM/KG, only CM and KG inputs are present and CM/KG toggle has `aria-pressed="true"`.
6. End-to-end imperial submission test: with `feet=5, inches=10, pounds=180` and the muscle/male sample for everything else, intercept the request to `/api/recommend` with Playwright `page.route()` and assert the request body contains `heightCm === 178` and `weightKg === 82`. The proxied response (forwarded to the real handler via `route.continue()`) must include 3–7 supplements.
7. Pure-function unit tests on `lib/units.ts` (executed via plain Node — no new test framework added):
   - `imperialToCm(5, 10) === 178`
   - `imperialToKg(180) === 82`
   - `cmToImperial(178)` deep-equals `{ feet: 5, inches: 10 }`
   - `kgToPounds(82) === 181` (rounding asymmetry; 82 kg back-converts to 180.78 lb → 181 lb)

## BANNED THIS CYCLE (Watcher will check)

1. Any modification to a frozen file listed above.
2. Any new dependency in `package.json`.
3. Any use of `localStorage`, `sessionStorage`, or `document.cookie` anywhere in this cycle's diff.
4. Any change to the `UserInput` type in `lib/types.ts`. The engine signature is fixed.
5. Pulling forward N=005 distribution work: `app/r/`, `components/SourcesPanel.tsx`, `components/EmailCapture.tsx`, `app/api/subscribe/` — none may exist on disk.
6. The string `"AI-powered"` (still banned).
7. Any `from-purple-` / `to-purple-` Tailwind class.
8. Any hex color in `components/UnitToggle.tsx` outside `#0A0A0A`, `#FAFAF7`, `#D4FF3A`, `#FF6B35`.

## OPERATOR INSTRUCTIONS — Five atomic commits

1. `N=004 operator: add lib/units.ts pure conversion functions`
2. `N=004 operator: add UnitToggle component`
3. `N=004 operator: integrate toggle and conditional inputs into AssessmentForm`
4. `N=004 operator: extend visual.spec.ts with imperial/metric assertions`
5. `N=004 operator: write A1_OUTPUT_004.md manifest`

`A1_OUTPUT_004.md` is a manifest only — file path + one-line description per file. No prose.

## HANDOFF

→ Sentinel reads this file and emits GATE: OPEN or GATE: BLOCK.
