# S1_LOCKED_019.md

**N:** 019 **Hat:** ARCHITECT **Status:** LOCKED — NO DRIFT ALLOWED **Predecessors:** S1_LOCKED.md · S1_LOCKED_002..S1_LOCKED_018.md (all still binding) · `AUDIT_TRAIL_PROTOCOL.md` (binding since N=013) · honest connection state pattern (binding since N=018)

This document is *additive*. Prior locked contracts remain in force.

---

## SCOPE

Ship Oura as the sixth registered plugin and the **fourth signal plugin / third wearable signal source**. Four new files (tokenAuth, normalizer, plugin index, OuraConnect component) + one new API route. Three surgical modifications (`pluginRegistry.ts` registers Oura, `AssessmentForm.tsx` mounts the card + threads tagged inputs through submit, `lib/types.ts` adds additive types). The locked engine, Signal Stack core, and N=014–N=018 plugins are FROZEN.

## NEW FILES ALLOWED THIS CYCLE (no others)

```
lib/plugins/oura/tokenAuth.ts                      paste-token validation + Oura API client
lib/plugins/oura/normalizer.ts                     sleep + readiness → TaggedUserInput[]
lib/plugins/oura/index.ts                          PluginNormalization at wearable layer
components/OuraConnect.tsx                         paste-token UI card (mirrors WhoopConnect pattern)
app/api/plugins/oura/route.ts                      POST endpoint: validate + fetch + normalize
agent_state/CURRENT_019.md
agent_state/S1_LOCKED_019.md
agent_state/A1_OUTPUT_019.md
agent_state/TRUTH_RESULT_019.md
agent_state/NEXT_020.md                            written by the Judge if all criteria PASS
```

The new `app/api/plugins/oura/route.ts` slot is required (every plugin so far has its own route at `/api/plugins/<name>`).

No new runtime dependencies. No new components beyond `OuraConnect`. No new lib modules outside `lib/plugins/oura/`. No new Supabase migrations.

## FILES MODIFIED THIS CYCLE (only these)

```
lib/types.ts                  additive: OuraToken + OuraMetrics. UserInput, TaggedUserInput,
                              and every prior type byte-identical.

lib/pluginRegistry.ts         seed `[appleHealth, amazon, telehealth, labPlaceholder,
                              whoop, oura]` in that order, preserving the N=014/N=015/
                              N=016/N=017/N=018 first-five-entry invariants.

components/AssessmentForm.tsx mount <OuraConnect onTagged={setOuraTaggedInputs} />
                              immediately AFTER <WhoopConnect>. Hold a 4th state slot
                              for Oura tagged inputs; concatenate all four arrays
                              [apple, lab, whoop, oura] on submit. Existing form
                              behavior byte-identical when the user skips all four
                              plugin cards.

agent_state/SESSION_LOG.md   append N=019 cycle entries
```

## FROZEN — DO NOT TOUCH

- `lib/engine.ts` (recommend signature locked at N=012)
- `lib/signalLayers.ts`, `lib/signalPriority.ts`, `lib/pluginContract.ts` (Signal Stack core)
- `lib/plugins/appleHealth/*` (N=014, including the N=018 bug fix)
- `lib/plugins/amazon/*` (N=015), `lib/plugins/telehealth/*` (N=016), `lib/plugins/labPlaceholder/*` (N=017), `lib/plugins/whoop/*` (N=018)
- `components/AppleHealthUpload.tsx` (N=014/N=018), `components/FulfillButton.tsx` (N=015), `components/SpeakToDoctorButton.tsx` (N=016), `components/LabValuesEntry.tsx` (N=017), `components/WhoopConnect.tsx` (N=018)
- All other `lib/*` (`supplements`, `conflicts`, `variation`, `confidence`, `units`, `slug`, `timeline`, `timelineData`, `labParser`, `labMapping`, `scanner`, `voice`, `voiceParser`, `bodySystems`, `svgPositions`, `subscription`, `spearCopy`, `feedback`, `stripe`, `proAccess`, `supabase`, `email`, `nutrition`, `verdict`)
- Every API route except the new `/api/plugins/oura` (every other route — recommend, og, checkout, webhooks, subscription, email/result, labs/parse, labs/recompute, scanner/identify, feedback/submit, fulfillment/click, plugins/apple-health, plugins/lab-placeholder, plugins/whoop — byte-identical)
- Every component except `AssessmentForm.tsx` (mount-only modification) and the new `OuraConnect.tsx`
- App pages, `tailwind.config.ts`, `app/globals.css`, `postcss.config.js`, `next.config.js`, `tsconfig.json`, `middleware.ts`, `vercel.json`, `package.json`, `package-lock.json`, `.env.example`
- All Supabase migrations + Python files
- N=013 audit-trail infrastructure

## TOKEN-AUTH CONTRACT — `lib/plugins/oura/tokenAuth.ts`

```ts
export const OURA_API_BASE = "https://api.ouraring.com/v2";

export interface OuraValidationResult {
  valid: boolean;
  error?: string;
}

export interface OuraRecentMetrics {
  sleepScore: number | null;       // 0..100 (Oura daily_sleep.score)
  readinessScore: number | null;   // 0..100 (Oura daily_readiness.score)
  asOf: string;                    // ISO 8601, most recent reading day
}

// Empty/malformed tokens reject without making a network call. Network
// errors / 4xx / 5xx return invalid with human-readable error. Never
// throws.
export async function validateOuraToken(token: string): Promise<OuraValidationResult>;

// Fetches the most recent daily_sleep + daily_readiness data points.
// Returns null on any error. Caller is responsible for fail-silently.
export async function fetchOuraMetrics(token: string): Promise<OuraRecentMetrics | null>;
```

`validateOuraToken` calls `GET /v2/usercollection/personal_info` with `Authorization: Bearer <token>` to confirm the token authenticates against Oura. 10-second `fetch` timeout. Empty / non-string / whitespace-only tokens reject before any network call. Tokens that fail a basic length sanity check (Oura tokens are typically 32+ characters) reject before network call.

`fetchOuraMetrics` calls `GET /v2/usercollection/daily_sleep?start_date=<7-days-ago>` and `GET /v2/usercollection/daily_readiness?start_date=<7-days-ago>` in parallel. Picks the most recent record from each list. Returns `{sleepScore, readinessScore, asOf}` where `asOf` is the more-recent of the two timestamps, or `null` if both endpoints failed.

## NORMALIZER CONTRACT — `lib/plugins/oura/normalizer.ts`

```ts
export interface OuraMetricsInput {
  sleepScore: number | null;
  readinessScore: number | null;
  asOf: string;
}

// Pure deterministic. Maps recent sleep + readiness to TaggedUserInput[]
// at layer="wearable" with confidence=0.85.
//
// Mapping rules (mirror Oura's documented score bands):
//   sleep < 60      → symptomToFix = "poor-sleep"  (poor sleep)
//   sleep 60..69    → no override                  (fair confirms behavior)
//   sleep 70..84    → no override                  (good confirms behavior)
//   sleep 85..100   → no override                  (excellent confirms behavior)
//   readiness < 60  → symptomToFix = "fatigue"     (low readiness)
//   readiness 60..79 → no override                 (moderate)
//   readiness >= 80 → no override                  (high)
export function normalizeOuraMetrics(input: OuraMetricsInput): TaggedUserInput[];

// Helper for the OuraConnect "Connected" state — passes through the API
// metrics with no normalization.
export function summarizeOuraMetrics(input: OuraMetricsInput | null): {
  sleepScore: number | null;
  readinessScore: number | null;
  asOf: string | null;
};
```

Pure module. Zero deps.

## PLUGIN CONTRACT — `lib/plugins/oura/index.ts`

```ts
export const ouraPlugin: PluginNormalization<OuraMetricsInput> = {
  name: "oura",
  layer: "wearable",
  normalize(raw) { ... },
  calibrateConfidence(raw) { return 0.85; },     // matches Whoop
  recencyThresholdMs: 7 * 24 * 60 * 60 * 1000,   // 7 days, matches Whoop
};
```

## API ROUTE CONTRACT — `app/api/plugins/oura/route.ts`

POST. Body: `{ token: string }`. Mirrors the Whoop route's flow:

1. Validate `token` is non-empty string. Empty/missing → `200 { tagged: [], summary: null, error: "Invalid token. Please paste your Oura personal access token from cloud.ouraring.com." }`.
2. `validateOuraToken(token)`. Failure → `200 { tagged: [], summary: null, error: "..." }`.
3. `fetchOuraMetrics(token)`. Failure → `200 { tagged: [], summary: null, error: "Could not fetch Oura metrics. Please try again." }`.
4. `ouraPlugin.normalize(metrics)`. If empty → `200 { tagged: [], summary: {sleep, readiness, asOf}, error: "No recent data found in your Oura account." }`.
5. Success → `200 { tagged, summary }`.

Token never persists. The route never returns 500.

## OURA CONNECT COMPONENT CONTRACT — `components/OuraConnect.tsx`

`'use client'`. Mirrors the N=018 `WhoopConnect` honest connection state pattern verbatim:

- **Idle:** `lucide-react` `Circle` icon, heading `Connect Oura`, caption with help text linking to `cloud.ouraring.com`, `<input type="text">` for the token, lime `Connect Oura` button.
- **Loading:** spinner + button disabled.
- **Connected (gated on `tagged.length > 0`):** `Check` icon (lime), `Connected · Oura`, three rows: `Sleep score: N`, `Readiness: N`, `As of: <date>`.
- **Empty data state (valid token, no recent data):** `AlertCircle` icon (clinical orange), `No Oura data`, the API's verbatim error string, `Try another token` reset button.
- **Invalid token state:** `AlertCircle` icon (clinical orange), `Invalid token`, the API's verbatim error string, `Try another token` reset button.

`data-testid="oura-connect"` on the outer container.

Component MUST gate "Connected" on `tagged.length > 0` per the N=018 binding pattern. Empty / invalid responses never render the Connected state.

## TYPES EXTENSION — `lib/types.ts`

Append:

```ts
// N=019: Oura wearable plugin types — additive only.
export interface OuraToken {
  token: string;
}
export interface OuraMetrics {
  sleepScore: number | null;
  readinessScore: number | null;
  asOf: string;
}
```

## ASSESSMENT FORM INTEGRATION — `components/AssessmentForm.tsx`

Add a fourth state slot for Oura tagged inputs (`ouraTaggedInputs`). Mount `<OuraConnect onTagged={setOuraTaggedInputs} />` immediately AFTER the existing `<WhoopConnect>`. On submit, concatenate `[...taggedInputs, ...labTaggedInputs, ...whoopTaggedInputs, ...ouraTaggedInputs]`. Existing form behavior byte-identical when all four cards are skipped.

## ACCEPTANCE CRITERIA (Judge will verify all 14)

1. `npm install` succeeds. Zero new dependencies.
2. `npm run build` succeeds with zero errors.
3. `bash scripts/verify-audit-trail.sh` exits 0 against this cycle's state files.
4. `validateOuraToken("")` and `validateOuraToken("malformed")` and `validateOuraToken("   ")` return `{ valid: false, error: ... }`.
5. `fetchOuraMetrics("<malformed>")` returns `null` (network failure path in this sandbox).
6. `normalizeOuraMetrics({sleepScore: 50, readinessScore: 55, asOf: ...})` returns 2 `TaggedUserInput` entries, both at `layer: "wearable"`, both `confidence: 0.85`. Sleep < 60 → symptomToFix="poor-sleep"; readiness < 60 → symptomToFix="fatigue".
7. `getActivePlugins()` returns 6 plugins in order `[apple-health, amazon, telehealth, lab-placeholder, whoop, oura]`. The N=014/N=015/N=016/N=017/N=018 first-five-entry invariants are preserved.
8. `<OuraConnect>` renders BELOW `<WhoopConnect>` on the assessment form. DOM offset: `oura-connect` > `whoop-connect`.
9. `POST /api/plugins/oura { token: "<jwt-shaped>" }` with a syntactically-plausible token shape calls the validate path and returns the contracted JSON shape.
10. `POST /api/plugins/oura { token: "" }` returns `200 { tagged: [], summary: null, error: "Invalid token. ..." }`. The OuraConnect card renders the invalid-token state with `AlertCircle` icon and `Try another token` reset button (mirrors N=018 WhoopConnect pattern).
11. A `POST` that returns `tagged: []` with a valid token (no recent data scenario) renders the no-data state with `AlertCircle` icon, never falsely Connected.
12. **Three-way recency resolution within the wearable layer.** `resolveTaggedInputs` with three wearable-layer entries on the same field with three different timestamps returns the most-recent value. `recommend(input, [...]_3way)` produces output reflecting that resolution.
13. `recommend(input)` byte-identical to N=018 (engine pipeline untouched). `POST /api/recommend` without `taggedInputs` byte-identical.
14. **N=018 regression intact:**
    - `<AppleHealthUpload>` still gates "Connected" on `tagged.length > 0` (N=018 bug fix preserved).
    - `<WhoopConnect>` still renders correctly with all five states.
    - `<LabValuesEntry>` still renders.
    - Amazon `<FulfillButton>` still renders on each supplement card.
    - `<SpeakToDoctorButton>` still conditional.
    - `lib/subscription.ts` DEV MODE comment unchanged.
    - All N=014–N=018 plugin code byte-identical against the N=018 head.
    - `bash scripts/verify-audit-trail.sh` exits 0.

## BANNED THIS CYCLE

- New runtime dependencies
- Modifications to `lib/engine.ts`, `lib/signalLayers.ts`, `lib/signalPriority.ts`, `lib/pluginContract.ts`
- Modifications to N=014–N=018 plugin code or their components
- OAuth flow for Oura (paste-token only)
- Persistence of Oura tokens or user metrics
- Transmission of Oura data beyond sleep + readiness scores
- False "Connected" state on any path
- Medical-advice or AI-assistant framing
- The string `"AI-powered"`, `from-purple-` / `to-purple-` Tailwind classes
- New colors outside the locked palette
- `localStorage`, `sessionStorage`, `document.cookie`
- Emoji as UI markers
- Any change that breaks regression #14

## OPERATOR INSTRUCTIONS — Atomic commits per file group

```
1.   N=019 operator: add lib/plugins/oura/tokenAuth.ts (paste-token validation + minimal Oura API client)
2.   N=019 operator: add lib/plugins/oura/normalizer.ts (sleep + readiness → wearable-layer TaggedUserInput[])
3.   N=019 operator: add lib/plugins/oura/index.ts (PluginNormalization at wearable layer)
4.   N=019 operator: add components/OuraConnect.tsx (paste-token card with honest connection state)
5.   N=019 operator: add app/api/plugins/oura/route.ts (POST endpoint validates + fetches + normalizes)
6.   N=019 operator: register oura as 6th entry in lib/pluginRegistry.ts
7.   N=019 operator: mount OuraConnect below WhoopConnect + thread Oura tagged inputs in AssessmentForm
8.   N=019 operator: add OuraToken + OuraMetrics to lib/types.ts (additive)
9.   N=019 operator: write A1_OUTPUT_019.md manifest
```

## HANDOFF

→ Sentinel reads this file and emits GATE: OPEN or GATE: BLOCK.
→ Watcher invokes `bash scripts/verify-audit-trail.sh` per the N=013 protocol.
