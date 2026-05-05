# S1_LOCKED_014.md

**N:** 014 **Hat:** ARCHITECT **Status:** LOCKED — NO DRIFT ALLOWED **Predecessors:** S1_LOCKED.md · S1_LOCKED_002..S1_LOCKED_013.md (all still binding) · `AUDIT_TRAIL_PROTOCOL.md` (binding since N=013)

This document is *additive*. Prior locked contracts remain in force, except where this document explicitly unfreezes a single file for surgical edit.

---

## SCOPE

Ship Apple Health as the first registered plugin against the N=012 Signal Stack contract. Five new files (parser, normalizer, plugin index, API route, upload component). Two surgical modifications (`pluginRegistry.ts` seed registration, `AssessmentForm.tsx` upload-card mount + tagged-inputs submission). One contract-spirit-honoring micro-extension to `app/api/recommend/route.ts` so the form's existing POST flow can ride the new tagged inputs through to `recommend()` without bypassing the API. Strictly additive. The locked engine, signal-stack core, and plugin contract are FROZEN.

## NEW FILES ALLOWED THIS CYCLE (no others)

```
lib/plugins/appleHealth/parser.ts          regex-only XML extractor for steps + sleep + resting HR
lib/plugins/appleHealth/normalizer.ts      pure normalizer: parsed records → TaggedUserInput[]
lib/plugins/appleHealth/index.ts           PluginNormalization implementation (name="apple-health")
app/api/plugins/apple-health/route.ts      POST endpoint accepting multipart/form-data XML upload
components/AppleHealthUpload.tsx           opt-in upload card mounted above the assessment form
agent_state/CURRENT_014.md
agent_state/S1_LOCKED_014.md
agent_state/A1_OUTPUT_014.md
agent_state/TRUTH_RESULT_014.md
agent_state/NEXT_015.md                    written by the Judge if all 11 criteria PASS
```

No new components beyond `AppleHealthUpload`. No new lib modules outside `lib/plugins/appleHealth/`. No new migrations. No new Python files. No new dependencies.

## FILES MODIFIED THIS CYCLE (only these)

```
lib/pluginRegistry.ts        seed `registered` with the appleHealth plugin so
                             getActivePlugins() returns it as the first entry.
                             registerPlugin / clearRegistry exports byte-identical.

components/AssessmentForm.tsx  mount AppleHealthUpload above the existing form
                               fields, hold the returned TaggedUserInput[] in
                               component state, include it in the /api/recommend
                               POST body when non-empty. Existing form behavior
                               byte-identical when no upload occurs.

app/api/recommend/route.ts   contract-spirit-honoring micro-extension. ADDITIVELY
                             accept an optional `taggedInputs` field in the
                             request body. Pass it through to recommend(input,
                             taggedInputs). When the field is absent, the route
                             behavior + response shape is byte-identical to N=013.
                             This is the ONLY way to honor the contract spec
                             "the assessment form passes both UserInput and
                             TaggedValue array to the recommend function" while
                             keeping the form's POST flow intact (acceptance #11).

agent_state/SESSION_LOG.md    append the N=014 cycle entries
```

## FROZEN — DO NOT TOUCH

- `lib/engine.ts` (the recommend signature locked at N=012; this cycle does NOT touch it)
- `lib/signalLayers.ts`, `lib/signalPriority.ts`, `lib/pluginContract.ts` (Signal Stack core, immutable)
- `lib/types.ts` (UserInput unchanged; TaggedUserInput interface unchanged)
- All other `lib/*` (`supplements`, `conflicts`, `variation`, `confidence`, `units`, `slug`, `timeline`, `timelineData`, `labParser`, `labMapping`, `scanner`, `voice`, `voiceParser`, `bodySystems`, `svgPositions`, `subscription`, `spearCopy`, `feedback`, `stripe`, `proAccess`, `supabase`, `email`, `nutrition`, `verdict`)
- Every API route except `app/api/recommend/route.ts` (the only one explicitly modified, additively, this cycle)
- Every component except `AssessmentForm.tsx` (and the new `AppleHealthUpload.tsx`)
- App pages (`app/page.tsx`, `app/layout.tsx`, `app/r/[slug]/page.tsx`, `app/pricing/page.tsx`, `app/account/page.tsx`, `app/admin/feedback/page.tsx`, sign-in / sign-up)
- `tailwind.config.ts`, `app/globals.css`, `postcss.config.js`, `next.config.js`, `tsconfig.json`, `middleware.ts`, `vercel.json`, `package.json`, `package-lock.json`
- All Supabase migrations + Python files
- N=013 audit-trail infrastructure (`scripts/verify-audit-trail.sh`, `agent_state/AUDIT_TRAIL_PROTOCOL.md`)

## PARSER CONTRACT — `lib/plugins/appleHealth/parser.ts`

```ts
export interface AppleHealthStepRecord {
  date: string;        // ISO 8601 startDate from the export
  count: number;       // step count for the day
}
export interface AppleHealthSleepRecord {
  date: string;        // ISO 8601 startDate
  durationMinutes: number;
}
export interface AppleHealthHeartRateRecord {
  date: string;        // ISO 8601 startDate
  bpm: number;
}
export interface AppleHealthExport {
  steps: AppleHealthStepRecord[];
  sleep: AppleHealthSleepRecord[];
  restingHeartRate: AppleHealthHeartRateRecord[];
}

export function parseAppleHealthExport(xml: string): AppleHealthExport;
```

Pure synchronous function. Uses regex extraction targeting:

- `type="HKQuantityTypeIdentifierStepCount"` → step count records (`value` is integer steps)
- `type="HKCategoryTypeIdentifierSleepAnalysis"` → sleep duration computed from `startDate` to `endDate` minute delta (or, if `value="HKCategoryValueSleepAnalysisAsleep*"`, count it as actual sleep)
- `type="HKQuantityTypeIdentifierRestingHeartRate"` → bpm reading

Returns empty arrays if no records match; never throws. Ignores any other record types.

## NORMALIZER CONTRACT — `lib/plugins/appleHealth/normalizer.ts`

```ts
import type { TaggedUserInput } from "@/lib/types";
import type { AppleHealthExport } from "./parser";

export function normalizeAppleHealthRecords(
  parsed: AppleHealthExport,
  now?: Date,           // defaults to new Date() at call time; injectable for tests
): TaggedUserInput[];
```

Logic:

1. **Steps** — average daily count over the most recent 7 days. Map to `activityLevel`:
   - `< 5000` → `"sedentary"`
   - `5000..7499` → `"light"`
   - `7500..9999` → `"moderate"`
   - `>= 10000` → `"high"`
   Emit `{ field: "activityLevel", value: <bucket>, layer: "behavior", confidence: 0.7, timestamp: <most-recent-step-date> }`. Skip if no step records.
2. **Sleep** — average daily total minutes over the most recent 7 days, converted to hours and clamped to UserInput's `sleepHours` range `[3, 12]`. Emit `{ field: "sleepHours", value: <hours>, layer: "behavior", confidence: 0.7, timestamp: <most-recent-sleep-date> }`. Skip if no sleep records.
3. **Resting heart rate** — most recent reading, mapped to `activityLevel`:
   - `< 60` → `"high"` (athletic baseline)
   - `60..69` → `"moderate"`
   - `70..79` → `"light"`
   - `>= 80` → `"sedentary"`
   Emit `{ field: "activityLevel", value: <bucket>, layer: "wearable", confidence: 0.85, timestamp: <reading-date> }`. Skip if no HR records.
4. **Recency filter** — drop any source record with a timestamp older than `recencyThresholdMs` (30 days) before emitting.

The function is pure: no I/O, no `fetch`, no `localStorage`, no `console.log`. The `now` parameter is injectable so tests can pin the recency window deterministically.

## PLUGIN CONTRACT — `lib/plugins/appleHealth/index.ts`

```ts
import type { PluginNormalization } from "@/lib/pluginContract";

export const appleHealthPlugin: PluginNormalization<string> = {
  name: "apple-health",
  layer: "wearable",                       // dominant layer (per-entry layers from normalize)
  normalize(rawXml: string): TaggedUserInput[] { ... },     // calls parser + normalizer
  calibrateConfidence(rawXml: string): number { ... },      // returns [0, 1]
  recencyThresholdMs: 30 * 24 * 60 * 60 * 1000,             // 30 days
};
```

`calibrateConfidence` returns:
- `0` for empty / non-string input
- `0.4` if zero record types matched
- `0.6` if one record type matched
- `0.8` if two record types matched
- `0.9` if all three record types matched

`normalize` returns `[]` on empty input or unparseable XML — fail silently per the locked plugin layer rule.

## REGISTRY MODIFICATION — `lib/pluginRegistry.ts`

Add an import of `appleHealthPlugin` and seed the `registered` array literal with it. The change is two lines:

```diff
+import { appleHealthPlugin } from "./plugins/appleHealth";
 ...
-const registered: PluginNormalization[] = [];
+const registered: PluginNormalization[] = [appleHealthPlugin];
```

`registerPlugin`, `getActivePlugins`, `clearRegistry` exports are byte-identical.

## API ROUTE CONTRACT — `app/api/plugins/apple-health/route.ts`

- POST handler. `runtime: "nodejs"`. `dynamic: "force-dynamic"`.
- Accepts `multipart/form-data` with a single file field. Reads the file as text (UTF-8).
- Calls `appleHealthPlugin.normalize(xmlString)`.
- Returns `200 { tagged: TaggedUserInput[], summary: { steps?: number, sleepHours?: number, restingHeartRate?: number } }`.
- Returns `200 { tagged: [], summary: {} }` for empty bodies, missing files, or unparseable XML — fail silently.
- Never throws or returns 500.
- Does NOT persist any data. The raw XML is read into memory, parsed, normalized, and discarded.

## UPLOAD COMPONENT CONTRACT — `components/AppleHealthUpload.tsx`

- `'use client'`.
- Opt-in card: bordered container, locked palette, `lucide-react` `Upload` icon, heading `Connect Apple Health`, one-line caption explaining iOS Health export, file `<input type="file" accept=".xml">`, and a `Upload export` button.
- On file selection + button tap: POST the file as `multipart/form-data` to `/api/plugins/apple-health`, await JSON response.
- On success (any non-error response — empty array still counts as "uploaded"): card transforms to a "Connected" state with `lucide-react` `Check` icon and three rows displaying:
  - `Steps` — average daily count rounded to nearest hundred (`8,400 / day`)
  - `Sleep` — average duration in hours (`7.4 hrs / night`)
  - `Resting heart rate` — most recent reading (`62 bpm`)
- Optional `onTagged` callback prop: fires with the returned `TaggedUserInput[]` so the parent (`AssessmentForm`) can hold it.
- Uses ONLY the locked palette (no hex literals; Tailwind classes from N=011 set).
- Does NOT block or reset the form on upload failure.

## ASSESSMENT FORM MODIFICATION — `components/AssessmentForm.tsx`

- Import `AppleHealthUpload` and `TaggedUserInput`.
- Add `taggedInputs` state, initialized to `[]`.
- Mount `<AppleHealthUpload onTagged={setTaggedInputs} />` ABOVE the existing "Quick start / Speak protocol" header.
- In the existing `submit()` function, when `taggedInputs.length > 0`, include `taggedInputs` in the POST body to `/api/recommend`. When empty, the POST body is byte-identical to N=013.
- The form's existing fields, validation, voice integration, and unit-toggle behavior are unchanged.

## RECOMMEND ROUTE MICRO-EXTENSION — `app/api/recommend/route.ts`

The contract requires "the assessment form passes both the existing UserInput and the TaggedValue array to the recommend function". The form submits via fetch to `/api/recommend`. To honor the contract without bypassing the API, the route gains an optional `taggedInputs` body field:

```diff
 const input = parseInput(body);
-const result = recommend(input);
+const tagged = parseTaggedInputs(body);   // returns ReadonlyArray<TaggedUserInput> | undefined
+const result = recommend(input, tagged);
 return NextResponse.json(result);
```

`parseTaggedInputs` is purely additive: returns `undefined` when the body lacks the field, validates the array entries when present (drops any malformed entry; never throws). When `tagged` is `undefined`, `recommend(input, undefined)` is byte-identical to `recommend(input)` per the N=012 contract.

This is the ONLY route modification this cycle and is documented as a contract-spirit-honoring micro-extension in `A1_OUTPUT_014.md`.

## ACCEPTANCE CRITERIA (Judge will verify all 11)

1. `npm install` succeeds. Zero new dependencies. `git diff main -- package.json package-lock.json` empty.
2. `npm run build` succeeds with zero errors.
3. `bash scripts/verify-audit-trail.sh` exits 0 against this cycle's state files (the N=013 audit-trail guard succeeds).
4. `parseAppleHealthExport(<fixture xml>)` returns the expected three arrays for a fixture containing 7 step records, 7 sleep records, and 5 resting-heart-rate records.
5. `normalizeAppleHealthRecords(<parsed>, now)` produces the three expected `TaggedUserInput` entries with the contracted layers (`behavior` for steps + sleep, `wearable` for restingHR) and confidences (`0.7 / 0.7 / 0.85`).
6. `getActivePlugins()` returns an array of length 1 whose first entry is `appleHealthPlugin`.
7. `POST /api/plugins/apple-health` with a valid XML body returns `200 { tagged: [...], summary: {...} }` with at least one TaggedUserInput entry.
8. `POST /api/plugins/apple-health` with malformed input (empty body, garbage text, non-XML) returns `200 { tagged: [], summary: {} }` — NOT 500.
9. The home page (`/`) renders the `AppleHealthUpload` card above the existing assessment form fields. Verified via DOM inspection: the `[data-testid="apple-health-upload"]` element appears before any `<input>` inside the form.
10. `recommend(userInput, taggedFromAppleHealth)` with a `wearable`-layer `activityLevel: "high"` entry produces a recommendation that differs from `recommend(userInput)` when the user-supplied `activityLevel` is `"sedentary"` — proving the wearable signal flows into the engine. Verified via JSON-string inequality.
11. **N=013 regression intact:**
    - Anonymous user submitting the form WITHOUT uploading an Apple Health export receives a recommendation byte-identical to N=013 for the same `UserInput`.
    - `/pricing` three-tier copy intact.
    - `InteractiveTimeline` still mounts with `PLAY_DURATION_MS = 30_000`.
    - `lib/subscription.ts` DEV MODE comment unchanged.
    - The N=012 byte-identical engine regression still holds.

## BANNED THIS CYCLE

- New runtime dependencies (no `xml2js`, no `fast-xml-parser`, etc.)
- Modifications to `lib/engine.ts`, `lib/signalLayers.ts`, `lib/signalPriority.ts`, `lib/pluginContract.ts`, `lib/types.ts`
- Persistence of uploaded Apple Health data to Supabase or any disk write
- External API calls to Apple servers, OAuth flows, or any network beyond the upload itself
- The string `"AI-powered"`, `from-purple-` / `to-purple-` Tailwind classes
- Any new color outside the locked palette
- `localStorage`, `sessionStorage`, `document.cookie`
- Forcing the upload card on iOS users (it must be skippable)
- Any change that breaks regression #11

## OPERATOR INSTRUCTIONS — Atomic commits per file group

```
1.  N=014 operator: add lib/plugins/appleHealth/parser.ts
2.  N=014 operator: add lib/plugins/appleHealth/normalizer.ts
3.  N=014 operator: add lib/plugins/appleHealth/index.ts
4.  N=014 operator: add app/api/plugins/apple-health/route.ts
5.  N=014 operator: add components/AppleHealthUpload.tsx
6.  N=014 operator: mount AppleHealthUpload + thread tagged inputs in AssessmentForm
7.  N=014 operator: register appleHealth plugin in lib/pluginRegistry.ts
                    + accept taggedInputs in app/api/recommend/route.ts
8.  N=014 operator: write A1_OUTPUT_014.md manifest
```

## HANDOFF

→ Sentinel reads this file and emits GATE: OPEN or GATE: BLOCK.
→ Watcher invokes `bash scripts/verify-audit-trail.sh` per the N=013 protocol.
