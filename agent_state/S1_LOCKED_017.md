# S1_LOCKED_017.md

**N:** 017 **Hat:** ARCHITECT **Status:** LOCKED — NO DRIFT ALLOWED **Predecessors:** S1_LOCKED.md · S1_LOCKED_002..S1_LOCKED_016.md (all still binding) · `AUDIT_TRAIL_PROTOCOL.md` (binding since N=013)

This document is *additive*. Prior locked contracts remain in force.

---

## SCOPE

Ship lab placeholder as the fourth registered plugin and the **second signal plugin** against the locked Signal Stack contract. Four new files (manual-entry parser, plugin index, LabValuesEntry card, API route). Three surgical modifications (`lib/pluginRegistry.ts` registers lab-placeholder, `components/AssessmentForm.tsx` mounts the card + threads tagged inputs through submit, `lib/types.ts` adds additive types). Zero new dependencies. No new migrations.

## NEW FILES ALLOWED THIS CYCLE (no others)

```
lib/plugins/labPlaceholder/manualEntry.ts          pure parser + range validator
lib/plugins/labPlaceholder/index.ts                PluginNormalization implementation
components/LabValuesEntry.tsx                      opt-in lab-entry card UI
app/api/plugins/lab-placeholder/route.ts           POST endpoint with range validation
agent_state/CURRENT_017.md
agent_state/S1_LOCKED_017.md
agent_state/A1_OUTPUT_017.md
agent_state/TRUTH_RESULT_017.md
agent_state/NEXT_018.md                            written by the Judge if all criteria PASS
```

No new components beyond `LabValuesEntry`. No new lib modules outside `lib/plugins/labPlaceholder/`. No new Supabase migrations. No new dependencies.

## FILES MODIFIED THIS CYCLE (only these)

```
lib/types.ts                 additive: ManualLabValue + LabPlaceholderInput.
                             UserInput, TaggedUserInput, Recommendation, all
                             prior types byte-identical.

lib/pluginRegistry.ts        seed `registered` with [appleHealthPlugin,
                             amazonPlugin, telehealthPlugin, labPlaceholderPlugin]
                             in that order. RegisteredPlugin union from N=015
                             unchanged; lab-placeholder satisfies the same
                             PluginNormalization interface as Apple Health.

components/AssessmentForm.tsx   mount <LabValuesEntry onTagged={setLabTaggedInputs} />
                                BELOW the existing <AppleHealthUpload> card.
                                Hold lab-layer tagged inputs in separate state;
                                concatenate with Apple Health tagged inputs on
                                submission so both feed into the same /api/recommend
                                POST body. Existing form behavior byte-identical
                                when neither card is used.

agent_state/SESSION_LOG.md   append N=017 cycle entries
```

## FROZEN — DO NOT TOUCH

- `lib/engine.ts` (recommend signature locked at N=012)
- `lib/signalLayers.ts`, `lib/signalPriority.ts`, `lib/pluginContract.ts` (Signal Stack core)
- `lib/plugins/appleHealth/parser.ts`, `lib/plugins/appleHealth/normalizer.ts`, `lib/plugins/appleHealth/index.ts` (N=014 plugin)
- `lib/plugins/amazon/affiliateUrl.ts`, `lib/plugins/amazon/index.ts` (N=015 plugin)
- `lib/plugins/telehealth/deepLink.ts`, `lib/plugins/telehealth/index.ts` (N=016 plugin)
- `lib/labParser.ts`, `lib/labMapping.ts` (N=007 — read as reference data, NOT modified)
- `components/LabUpload.tsx` (N=007 PDF flow — preserved unchanged)
- `components/FulfillButton.tsx`, `components/SpeakToDoctorButton.tsx`, `components/AppleHealthUpload.tsx`
- All other `lib/*` and all other `components/`
- Every API route except the new `/api/plugins/lab-placeholder` (Apple Health, fulfillment, recommend, og, checkout, webhooks, subscription, email/result, labs/parse, labs/recompute, scanner/identify, feedback/submit — all byte-identical)
- App pages (`app/page.tsx`, `app/layout.tsx`, `app/r/[slug]/page.tsx`, `app/pricing/page.tsx`, `app/account/page.tsx`, `app/admin/feedback/page.tsx`, sign-in / sign-up)
- `tailwind.config.ts`, `app/globals.css`, `postcss.config.js`, `next.config.js`, `tsconfig.json`, `middleware.ts`, `vercel.json`, `package.json`, `package-lock.json`
- All Supabase migrations (0001 + 0002 + 0003 + 0004 + 0005) + Python files
- N=013 audit-trail infrastructure (`scripts/verify-audit-trail.sh`, `agent_state/AUDIT_TRAIL_PROTOCOL.md`)

## MANUAL ENTRY CONTRACT — `lib/plugins/labPlaceholder/manualEntry.ts`

```ts
export interface ManualLabValue {
  ferritin_ng_ml?: number;
  vitamin_d_25oh_ng_ml?: number;
  b12_pg_ml?: number;
  magnesium_mg_dl?: number;
  tsh_uiu_ml?: number;
}

// Physiological plausibility ranges. Re-uses the N=007 PHYSIOLOGICAL_RANGES
// values where applicable; adds tsh_uiu_ml for the new TSH input.
export const MANUAL_LAB_RANGES: Readonly<Record<keyof ManualLabValue, readonly [number, number]>>;

export function validateManualLabValues(values: ManualLabValue): {
  ok: true;
} | {
  ok: false;
  outOfRange: keyof ManualLabValue;
  message: string;
};

// Pure deterministic. Maps validated biomarkers to TaggedUserInput entries
// at layer="lab" with confidence=0.95. The `now` parameter is injectable for
// deterministic tests. Mapping rules:
//   ferritin_ng_ml < 30                   → symptomToFix = "fatigue"
//   vitamin_d_25oh_ng_ml < 30             → symptomToFix = "fatigue"
//   b12_pg_ml < 300                       → symptomToFix = "brain-fog"
//   magnesium_mg_dl < 1.7                 → symptomToFix = "poor-sleep"
//   tsh_uiu_ml > 4.5                      → symptomToFix = "fatigue"
// Each emitted entry's timestamp is now.toISOString().
export function parseManualLabValues(
  values: ManualLabValue,
  now?: Date,
): TaggedUserInput[];
```

Pure module. No I/O, no `'use client'`, no imports beyond types. Zero deps.

## PLUGIN CONTRACT — `lib/plugins/labPlaceholder/index.ts`

```ts
import type { PluginNormalization } from "@/lib/pluginContract";
import type { ManualLabValue } from "@/lib/types";
import { parseManualLabValues, validateManualLabValues } from "./manualEntry";

const RECENCY_THRESHOLD_MS = 90 * 24 * 60 * 60 * 1000;  // 90 days

export const labPlaceholderPlugin: PluginNormalization<ManualLabValue> = {
  name: "lab-placeholder",
  layer: "lab",
  normalize(raw: ManualLabValue): TaggedUserInput[] {
    if (!raw || typeof raw !== "object") return [];
    try {
      const validated = validateManualLabValues(raw);
      if (!validated.ok) return [];
      return parseManualLabValues(raw);
    } catch {
      return [];
    }
  },
  calibrateConfidence(raw: ManualLabValue): number {
    if (!raw || typeof raw !== "object") return 0;
    let entered = 0;
    if (typeof raw.ferritin_ng_ml === "number") entered++;
    if (typeof raw.vitamin_d_25oh_ng_ml === "number") entered++;
    if (typeof raw.b12_pg_ml === "number") entered++;
    if (typeof raw.magnesium_mg_dl === "number") entered++;
    if (typeof raw.tsh_uiu_ml === "number") entered++;
    if (entered === 0) return 0;
    return 0.95;            // hardcoded — manually entered values from a printed report are highly reliable
  },
  recencyThresholdMs: RECENCY_THRESHOLD_MS,
};
```

`layer: "lab"` (the highest priority weight in the Signal Stack). The plugin reuses the `PluginNormalization<TRaw>` generic from N=012 with `TRaw = ManualLabValue`. The fail-silently rule applies: malformed input → empty array.

## TYPES EXTENSION — `lib/types.ts`

Append at the bottom:

```ts
// N=017: lab placeholder (manual entry) types — additive only.

export interface ManualLabValue {
  ferritin_ng_ml?: number;
  vitamin_d_25oh_ng_ml?: number;
  b12_pg_ml?: number;
  magnesium_mg_dl?: number;
  tsh_uiu_ml?: number;
}

export interface LabPlaceholderInput {
  values: ManualLabValue;
}
```

UserInput, TaggedUserInput, Recommendation, FulfillmentClick, ActionPluginNormalization, TelehealthDeepLink, every prior type — byte-identical.

## REGISTRY MODIFICATION — `lib/pluginRegistry.ts`

Import `labPlaceholderPlugin` and seed `registered` with `[appleHealthPlugin, amazonPlugin, telehealthPlugin, labPlaceholderPlugin]`. The N=014/N=015/N=016 first-three-entry invariants are preserved. The `RegisteredPlugin` union from N=015 already covers `PluginNormalization | ActionPluginNormalization`; lab-placeholder satisfies the signal variant.

## API ROUTE CONTRACT — `app/api/plugins/lab-placeholder/route.ts`

- POST. `runtime: "nodejs"`. `dynamic: "force-dynamic"`.
- Accepts JSON body shaped like `{ values: ManualLabValue }` or directly `ManualLabValue` (route accepts both for ergonomic clients). Coerces non-object body → `{}`.
- Calls `validateManualLabValues(values)`:
  - Out-of-range → `400 { error: "<field> is outside physiologically plausible range" }`.
- On valid: calls `parseManualLabValues(values)` → returns `200 { tagged: TaggedUserInput[] }`.
- Empty / unknown markers → `200 { tagged: [] }` (silent skip).
- Internal exception → `200 { tagged: [] }` (fail-silently rule).
- No persistence. Values flow only into the active session's recommend call.

## LAB VALUES ENTRY COMPONENT CONTRACT — `components/LabValuesEntry.tsx`

- `'use client'`.
- Mounts as an opt-in card BELOW `<AppleHealthUpload>` on the assessment form.
- Locked palette only — Tailwind classes drawn from the same palette as `AppleHealthUpload` (`bg-ink`, `border-paper/15`, `text-paper`, `text-lime` accents).
- `lucide-react` `TestTube` icon + heading `Enter lab values` + caption `Type bloodwork values from a printed lab report. The protocol prioritizes lab inputs over self-reported behavior.`.
- Five numeric inputs (each with optimal-range placeholder):
  - Ferritin (ng/mL) — placeholder `"30–250"`.
  - Vitamin D 25-OH (ng/mL) — placeholder `"30–80"`.
  - Vitamin B12 (pg/mL) — placeholder `"300–900"`.
  - Magnesium (mg/dL) — placeholder `"1.7–2.4"`.
  - TSH (µIU/mL) — placeholder `"0.4–4.5"`.
- Each input has `type="number"`, `step="0.1"` (TSH/magnesium need decimals), `inputMode="decimal"`, `aria-label` matching the visible label, and an empty default state (the user fills in only what they have).
- Submit button: `Apply lab values`, `bg-lime text-ink` (matching N=014's `Upload export` button).
- On submit, `POST /api/plugins/lab-placeholder` with the populated `ManualLabValue` JSON.
- On `200 { tagged }`, transform the card to a "Connected" state with `lucide-react` `Check` icon + a list of which biomarkers were applied. Emit `onTagged(tagged)` so `AssessmentForm` can store the array.
- On `400 { error }`, render the error in `text-clinical` below the form, leave the card editable.
- Carries `data-testid="lab-values-entry"` on the outer container for Judge DOM verification.

## ASSESSMENT FORM INTEGRATION — `components/AssessmentForm.tsx`

- Import `LabValuesEntry` and add a second tagged-input state slot (`labTaggedInputs`).
- Mount `<LabValuesEntry onTagged={setLabTaggedInputs} />` immediately AFTER the existing `<AppleHealthUpload>` mount in the wrapper above the form.
- On submit, build the full tagged-inputs array as `[...taggedInputs, ...labTaggedInputs]` (Apple Health first, lab second; the priority resolver handles ordering by layer weight, so commit order is informational only). Include only when non-empty in the `/api/recommend` POST body.
- Existing fields, validation, voice integration, unit toggle, and Apple Health flow are unchanged.

## ACCEPTANCE CRITERIA (Judge will verify all 12)

1. `npm install` succeeds. Zero new dependencies.
2. `npm run build` succeeds with zero errors.
3. `bash scripts/verify-audit-trail.sh` exits 0 against this cycle's state files.
4. `parseManualLabValues({ ferritin_ng_ml: 18 })` returns one `TaggedUserInput` with `field: "symptomToFix"`, `value: "fatigue"`, `layer: "lab"`, `confidence: 0.95`.
5. `validateManualLabValues({ ferritin_ng_ml: 99999 })` returns `{ ok: false, outOfRange: "ferritin_ng_ml" }`. `validateManualLabValues({ irrelevant: 42 })` returns `{ ok: true }` (unknown ignored).
6. `parseManualLabValues({ heart_rate: 80 })` returns `[]` (unknown markers skipped).
7. `getActivePlugins()` returns an array of length 4 with `[apple-health, amazon, telehealth, lab-placeholder]` in that order.
8. `<LabValuesEntry>` renders BELOW `<AppleHealthUpload>` on the assessment form. Verified by DOM offset: `[data-testid="lab-values-entry"]` offset > `[data-testid="apple-health-upload"]` offset on `/`.
9. `POST /api/plugins/lab-placeholder { ferritin_ng_ml: 18 }` returns `200 { tagged: [<one entry>] }` with `tagged[0].layer === "lab"`.
10. `POST` with an out-of-range value (e.g. `ferritin_ng_ml: 99999`) returns `400 { error: "..." }` naming the offending field.
11. **Three-layer priority hierarchy.** `recommend(input, [behaviorTag, wearableTag, labTag])` where each tag targets `symptomToFix` with different values produces a recommendation that uses the **lab** value. `resolveTaggedInputs([lab, wearable, behavior])` returns `{ symptomToFix: <lab value> }`. The byte-identical regression `recommend(input)` vs `main` still holds.
12. **N=016 regression intact:**
    - `recommend(input)` byte-identical to N=016 (engine unchanged).
    - Amazon `<FulfillButton>` still renders on each supplement card.
    - `<SpeakToDoctorButton>` still renders conditionally on escalation pages and is hidden on routine pages.
    - `<AppleHealthUpload>` still mounts above the assessment form.
    - `<LabUpload>` (N=007 PDF flow) still mounts inside the Pro section of `ResultCard`.
    - `/pricing` three-tier copy intact.
    - `lib/subscription.ts` DEV MODE comment unchanged.
    - `bash scripts/verify-audit-trail.sh` exits 0.

## BANNED THIS CYCLE

- New runtime dependencies
- Modifications to `lib/engine.ts`, `lib/signalLayers.ts`, `lib/signalPriority.ts`, `lib/pluginContract.ts`
- Modifications to N=014/N=015/N=016 plugin code (`lib/plugins/appleHealth/*`, `lib/plugins/amazon/*`, `lib/plugins/telehealth/*`)
- Modifications to N=015 `FulfillButton.tsx` or N=016 `SpeakToDoctorButton.tsx`
- Modifications to N=007 `lib/labParser.ts`, `lib/labMapping.ts`, or `components/LabUpload.tsx`
- LabCorp / Quest API integration
- PDF parsing logic in this cycle
- HIPAA-protected data persistence (no Supabase row, no disk write, no logged PII)
- The string `"AI-powered"`, `from-purple-` / `to-purple-` Tailwind classes
- Any new color outside the locked palette
- `localStorage`, `sessionStorage`, `document.cookie`
- Chatbot or AI-assistant framing of the entry card
- Any change that breaks regression #12

## OPERATOR INSTRUCTIONS — Atomic commits per file group

Per the architect's order. Note that `types.ts` runs early in the actual ladder because subsequent files import the additive types; the end-state diff is identical regardless of ladder order.

```
1.  N=017 operator: add ManualLabValue + LabPlaceholderInput to lib/types.ts
2.  N=017 operator: add lib/plugins/labPlaceholder/manualEntry.ts (pure parser + range validator)
3.  N=017 operator: add lib/plugins/labPlaceholder/index.ts (PluginNormalization at lab layer)
4.  N=017 operator: add components/LabValuesEntry.tsx (opt-in lab-entry card)
5.  N=017 operator: add app/api/plugins/lab-placeholder/route.ts
6.  N=017 operator: register lab-placeholder as 4th entry in lib/pluginRegistry.ts
7.  N=017 operator: mount LabValuesEntry below AppleHealthUpload + thread tagged inputs in AssessmentForm
8.  N=017 operator: write A1_OUTPUT_017.md manifest
```

## HANDOFF

→ Sentinel reads this file and emits GATE: OPEN or GATE: BLOCK.
→ Watcher invokes `bash scripts/verify-audit-trail.sh` per the N=013 protocol.
