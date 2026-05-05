# S1_LOCKED_018.md

**N:** 018 **Hat:** ARCHITECT **Status:** LOCKED — NO DRIFT ALLOWED **Predecessors:** S1_LOCKED.md · S1_LOCKED_002..S1_LOCKED_017.md (all still binding) · `AUDIT_TRAIL_PROTOCOL.md` (binding since N=013)

This document is *additive*. Prior locked contracts remain in force. The N=014 Apple Health files are explicitly unfrozen this cycle for the bug fix; all other prior plugin code stays FROZEN.

---

## SCOPE

A coordinated **bug-fix + feature** cycle. Two objectives:

1. **Apple Health bug fix** — fix the false-Connected behaviour Jay reported on `fitness-iota-azure.vercel.app`. Targeted edits to parser, normalizer, AppleHealthUpload, and route.
2. **Whoop plugin integration** — the fifth plugin overall, the third signal plugin, the second wearable. Paste-the-token, no OAuth.

## NEW FILES ALLOWED THIS CYCLE (no others)

```
lib/plugins/whoop/tokenAuth.ts                paste-token validation + Whoop API client
lib/plugins/whoop/normalizer.ts               recovery + strain → TaggedUserInput[]
lib/plugins/whoop/index.ts                    PluginNormalization at wearable layer
components/WhoopConnect.tsx                   paste-token UI card
app/api/plugins/whoop/route.ts                POST endpoint: validate + fetch + normalize
agent_state/CURRENT_018.md
agent_state/S1_LOCKED_018.md
agent_state/A1_OUTPUT_018.md
agent_state/TRUTH_RESULT_018.md
agent_state/NEXT_019.md                       written by the Judge if all criteria PASS
```

The architect's contract listed only "tokenAuth.ts, normalizer.ts, index.ts, WhoopConnect.tsx" but the route file is implicit: every plugin so far has its own `app/api/plugins/<name>/route.ts`. Adding `app/api/plugins/whoop/route.ts` is a contract-spirit-honoring addition documented in `A1_OUTPUT_018.md`.

No new runtime dependencies. No new components beyond `WhoopConnect`. No new lib modules outside `lib/plugins/whoop/`. No new Supabase migrations.

## FILES MODIFIED THIS CYCLE (only these)

```
# Apple Health bug fix (UNFROZEN this cycle for surgical correction):
lib/plugins/appleHealth/parser.ts                  hardening: regex tolerance for case
                                                   variation + minor child-tag handling
lib/plugins/appleHealth/normalizer.ts              critical fix: anchor 7-day window to
                                                   most-recent-record date, not now;
                                                   fall back to 30-day average when
                                                   sparse; emit explicit empty signal
                                                   when no records
components/AppleHealthUpload.tsx                   gate "Connected" on tagged.length > 0;
                                                   add "No recent data found" branch
                                                   with AlertCircle icon
app/api/plugins/apple-health/route.ts              add server-side console.log of parser
                                                   record counts for Vercel log inspection

# Whoop registration (additive):
lib/pluginRegistry.ts                              seed [..., whoopPlugin] as 5th entry
components/AssessmentForm.tsx                      mount <WhoopConnect /> below <LabValuesEntry>
                                                   + thread tagged inputs through submit
lib/types.ts                                       additive: WhoopToken, WhoopMetrics types

agent_state/SESSION_LOG.md                         append N=018 cycle entries
```

## FROZEN — DO NOT TOUCH

- `lib/engine.ts` (recommend signature locked at N=012)
- `lib/signalLayers.ts`, `lib/signalPriority.ts`, `lib/pluginContract.ts` (Signal Stack core)
- `lib/plugins/amazon/*` (N=015), `lib/plugins/telehealth/*` (N=016), `lib/plugins/labPlaceholder/*` (N=017)
- `components/FulfillButton.tsx` (N=015), `components/SpeakToDoctorButton.tsx` (N=016), `components/LabValuesEntry.tsx` (N=017)
- All other `lib/*` (`supplements`, `conflicts`, `variation`, `confidence`, `units`, `slug`, `timeline`, `timelineData`, `labParser`, `labMapping`, `scanner`, `voice`, `voiceParser`, `bodySystems`, `svgPositions`, `subscription`, `spearCopy`, `feedback`, `stripe`, `proAccess`, `supabase`, `email`, `nutrition`, `verdict`)
- Every API route except the modified `/api/plugins/apple-health` (logging only) and the new `/api/plugins/whoop` (every other route — recommend, og, checkout, webhooks, subscription, email/result, labs/parse, labs/recompute, scanner/identify, feedback/submit, fulfillment/click, plugins/lab-placeholder — byte-identical)
- Every component except `AppleHealthUpload.tsx` (bug fix only) and `AssessmentForm.tsx` (mount-only modification) and the new `WhoopConnect.tsx`
- App pages (`app/page.tsx`, `app/layout.tsx`, `app/r/[slug]/page.tsx`, `app/pricing/page.tsx`, `app/account/page.tsx`, `app/admin/feedback/page.tsx`, sign-in / sign-up)
- `tailwind.config.ts`, `app/globals.css`, `postcss.config.js`, `next.config.js`, `tsconfig.json`, `middleware.ts`, `vercel.json`, `package.json`, `package-lock.json`, `.env.example`
- All Supabase migrations (0001 + 0002 + 0003 + 0004 + 0005) + Python files
- N=013 audit-trail infrastructure

## APPLE HEALTH FIX CONTRACT

### Parser (`lib/plugins/appleHealth/parser.ts`)

Defense-in-depth widening only. The existing regex correctly identifies Apple's three target identifiers in modern exports; the bug Jay reported is NOT in the parser. Changes:

- Add `i` (case-insensitive) flag to the type-name regex match so future Apple naming variations don't silently drop records.
- Tolerate a possible whitespace gap before the `/>` self-close.
- The TypeScript signature, the `AppleHealthExport` interface, and the three record interfaces are byte-identical.

The parser remains pure synchronous. No I/O. No `'use client'`. Zero deps.

### Normalizer (`lib/plugins/appleHealth/normalizer.ts`) — CRITICAL FIX

Replace the `nowMs`-anchored 7-day window with a **most-recent-record-anchored** 7-day window. Add a 30-day fallback when the 7-day window is empty.

```ts
function pickWindow<T extends { date: string }>(
  records: T[],
  windowMs: number,
): T[] {
  if (records.length === 0) return [];
  // Anchor the window to the MOST RECENT record's date, not "now".
  // Users export their data and may not upload it for weeks; anchoring
  // to "now" silently drops every record from a stale export.
  let mostRecentMs = -Infinity;
  for (const r of records) {
    const t = tsMs(r.date);
    if (Number.isFinite(t) && t > mostRecentMs) mostRecentMs = t;
  }
  if (!Number.isFinite(mostRecentMs)) return [];
  const cutoff = mostRecentMs - windowMs;
  return records.filter((r) => {
    const t = tsMs(r.date);
    return Number.isFinite(t) && t >= cutoff && t <= mostRecentMs;
  });
}
```

Selection cascade for steps / sleep:
1. Last 30 days (recency filter unchanged) — discard everything older.
2. Anchor a 7-day window on the most-recent record. If non-empty, use it.
3. If the 7-day window is empty (sparse data), fall back to all records within the 30-day recency cutoff.
4. If the recency-filtered set is also empty, emit no `TaggedUserInput` for that signal type.

`normalizeAppleHealthRecords(parsed, now?)` continues to accept the optional `now` parameter for deterministic tests, but it is no longer used as the window anchor. It is kept for API compatibility with N=014 callers.

`summarizeAppleHealth(parsed, now?)` follows the same cascade so the upload card's three displayed numbers reflect the same data set as the engine signals.

### AppleHealthUpload component (`components/AppleHealthUpload.tsx`)

Honest connection state:

```tsx
async function upload() {
  if (!file || loading) return;
  setLoading(true);
  try {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/plugins/apple-health", { method: "POST", body: form });
    const data = (await res.json().catch(() => ({ tagged: [], summary: {} }))) as UploadResponse;
    const tagged = Array.isArray(data.tagged) ? data.tagged : [];
    const summary = data.summary ?? {};
    setSummary(summary);
    // GATE: only mark Connected if at least one signal was extracted.
    if (tagged.length > 0) {
      setConnected(true);
      setEmptyResult(false);
    } else {
      setConnected(false);
      setEmptyResult(true);
    }
    onTagged?.(tagged);
  } catch {
    setConnected(false);
    setEmptyResult(true);
  } finally {
    setLoading(false);
  }
}
```

When `emptyResult === true`, render a third state distinct from idle and connected:

```tsx
<section data-testid="apple-health-upload" aria-label="Apple Health no data found" ...>
  <header className="flex items-center gap-2">
    <AlertCircle className="w-4 h-4 text-clinical" aria-hidden="true" />
    <span className="font-mono text-[11px] uppercase tracking-wider text-clinical">
      No recent data found · Apple Health
    </span>
  </header>
  <p className="text-sm text-paper/80 leading-snug">
    The export contains no step, sleep, or resting-heart-rate records within the last 30 days.
    Re-export from iOS Health (Health → profile → Export All Health Data) and try again.
  </p>
  <button type="button" onClick={resetToIdle} ...>Try another export</button>
</section>
```

The third state uses the existing locked palette: `text-clinical` (orange) for the failure indicator, matching the same intent as the N=016 `SpeakToDoctorButton`.

### Apple Health route (`app/api/plugins/apple-health/route.ts`)

Surgical addition: log parser output server-side after `appleHealthPlugin.normalize(xml)` returns:

```ts
const tagged = appleHealthPlugin.normalize(xml);
const summary = summarizeAppleHealth(parseAppleHealthExport(xml));

// N=018: server-side log of parser output for Vercel log inspection.
// No PII — only counts of records by type. Helps debug future "Connected
// but empty" reports.
console.log(JSON.stringify({
  event: "apple_health_normalize",
  taggedCount: tagged.length,
  summary,
  xmlBytes: xml.length,
}));

return NextResponse.json({ tagged, summary });
```

Every other line in the route is byte-identical.

## WHOOP PLUGIN CONTRACT

### Token-auth (`lib/plugins/whoop/tokenAuth.ts`)

```ts
export const WHOOP_API_BASE = "https://api.prod.whoop.com/developer/v1";

export interface WhoopValidationResult {
  valid: boolean;
  error?: string;        // human-readable when invalid
}

// Validates a paste-token by calling Whoop's GET /user/profile/basic.
// Returns valid=false on empty/malformed tokens without making a network
// call. On network errors / 4xx / 5xx, returns valid=false with a
// human-readable error. Never throws.
export async function validateWhoopToken(
  token: string,
): Promise<WhoopValidationResult>;

// Fetches the most recent recovery + cycle (strain) data points. Returns
// null on any error. Caller is responsible for fail-silently downstream.
export interface WhoopRecentMetrics {
  recoveryScore: number | null;       // 0..100 (Whoop "%")
  dayStrain: number | null;           // 0..21 (Whoop strain scale)
  asOf: string;                       // ISO 8601, most recent reading timestamp
}
export async function fetchRecentWhoopMetrics(
  token: string,
): Promise<WhoopRecentMetrics | null>;
```

Both functions use `fetch` with `Authorization: Bearer <token>`, a 10-second timeout, and never throw. Network errors → `null` / `valid: false`.

### Normalizer (`lib/plugins/whoop/normalizer.ts`)

```ts
export interface WhoopMetricsInput {
  recoveryScore: number | null;
  dayStrain: number | null;
  asOf: string;
}

// Pure deterministic. Maps recent recovery + strain to TaggedUserInput[]
// at layer="wearable" with confidence=0.85.
//
// Rules (mirror Whoop's own scoring bands):
//   recovery < 34   → symptomToFix = "fatigue"           (red recovery, sustained)
//   recovery 34..66 → no override                        (yellow — confirms self-report)
//   recovery >= 67  → no override                        (green — confirms self-report)
//   strain < 10     → activityLevel = "light"
//   strain 10..13   → activityLevel = "moderate"
//   strain 14..17   → activityLevel = "moderate"         (high-moderate band)
//   strain >= 18    → activityLevel = "high"
export function normalizeWhoopMetrics(
  input: WhoopMetricsInput,
): TaggedUserInput[];
```

Pure module. No I/O. No `'use client'`. Zero deps.

### Plugin registration (`lib/plugins/whoop/index.ts`)

```ts
import type { PluginNormalization } from "@/lib/pluginContract";
import type { WhoopMetricsInput } from "./normalizer";
import { normalizeWhoopMetrics } from "./normalizer";

const RECENCY_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;     // 7 days

export const whoopPlugin: PluginNormalization<WhoopMetricsInput> = {
  name: "whoop",
  layer: "wearable",
  normalize(raw) {
    if (!raw || typeof raw !== "object") return [];
    try { return normalizeWhoopMetrics(raw); } catch { return []; }
  },
  calibrateConfidence(raw) {
    if (!raw || typeof raw !== "object") return 0;
    return 0.85;
  },
  recencyThresholdMs: RECENCY_THRESHOLD_MS,
};
```

### Whoop API route (`app/api/plugins/whoop/route.ts`)

POST. Body: `{ token: string }`. Flow:
1. Validate `token` is non-empty string. Empty/missing → `200 { tagged: [], summary: {}, error: "Invalid token. Please paste your Whoop personal access token from developer.whoop.com." }`.
2. `validateWhoopToken(token)`. Failure → `200 { tagged: [], summary: {}, error: "..." }`.
3. `fetchRecentWhoopMetrics(token)`. Failure → `200 { tagged: [], summary: {}, error: "Could not fetch Whoop metrics. Please try again." }`.
4. `whoopPlugin.normalize(metrics)`. Empty array → `200 { tagged: [], summary: {recoveryScore, dayStrain, asOf}, error: "No recent metrics within the last 7 days." }`.
5. Success → `200 { tagged, summary: {recoveryScore, dayStrain, asOf} }`.

The token is read from the request body, used for the upstream calls, and discarded. No persistence. The route never returns 500 — fail-silently rule applies.

### WhoopConnect component (`components/WhoopConnect.tsx`)

`'use client'`. Three states:

- **Idle:** `Activity` icon (lucide), heading `Connect Whoop`, caption + textarea + `Connect Whoop` lime button. Footer help text: `Get your token at developer.whoop.com → Authorize a developer app → Personal Access Token.`
- **Loading:** spinner + button disabled.
- **Connected (gated on `tagged.length > 0`):** `Check` icon (lime), heading `Connected · Whoop`, three rows showing `Recovery: <score>%`, `Day strain: <strain>`, `As of: <local datetime>`.
- **Empty / error:** `AlertCircle` icon (clinical orange), heading `No Whoop data` or `Invalid token`, error message verbatim from the API response, `Try another token` reset button. Mirrors the Apple Health honest-connection pattern.

`data-testid="whoop-connect"` on the outer container.

## REGISTRY MODIFICATION (`lib/pluginRegistry.ts`)

Import `whoopPlugin` and seed `[appleHealthPlugin, amazonPlugin, telehealthPlugin, labPlaceholderPlugin, whoopPlugin]`.

## TYPES EXTENSION (`lib/types.ts`)

```ts
// N=018: Whoop wearable plugin types — additive only.
export interface WhoopToken {
  token: string;
}
export interface WhoopMetrics {
  recoveryScore: number | null;
  dayStrain: number | null;
  asOf: string;
}
```

## ASSESSMENT FORM INTEGRATION (`components/AssessmentForm.tsx`)

Mount `<WhoopConnect onTagged={setWhoopTaggedInputs} />` immediately AFTER the existing `<LabValuesEntry>` mount. Hold `whoopTaggedInputs` in a third state slot. On submit, concatenate: `[...taggedInputs, ...labTaggedInputs, ...whoopTaggedInputs]` and include in the `/api/recommend` body when non-empty. Existing form behavior byte-identical when the user skips all three plugin cards.

## ACCEPTANCE CRITERIA (Judge will verify all 16)

1. `npm install` succeeds. Zero new dependencies.
2. `npm run build` succeeds with zero errors.
3. `bash scripts/verify-audit-trail.sh` exits 0 against this cycle's state files.
4. The Apple Health diagnosis is documented in `CURRENT_018.md` and `A1_OUTPUT_018.md` identifying the two compounding failure modes.
5. With a fixture export whose most-recent record is 14 days old, `normalizeAppleHealthRecords` returns non-empty `TaggedUserInput[]` (the most-recent-record-anchored 7-day window is exercised).
6. With a fixture export whose records are all older than 30 days, `normalizeAppleHealthRecords` returns `[]` and the upload card renders the "No recent data found" state with `AlertCircle` icon.
7. `<AppleHealthUpload>` only renders the "Connected" state when the API response's `tagged` array is non-empty (DOM verification: `data-testid="apple-health-upload"` with `aria-label="Apple Health connected"` is absent on empty result).
8. `POST /api/plugins/apple-health` emits a `console.log` line containing `apple_health_normalize` + `taggedCount` + `summary` after each request.
9. `validateWhoopToken("")` returns `{ valid: false, error: ... }`. `validateWhoopToken("malformed")` returns `{ valid: false, error: ... }` (network-error path on the unreachable Whoop API in this sandbox).
10. `normalizeWhoopMetrics({recoveryScore: 30, dayStrain: 18, asOf: ...})` returns at least 2 `TaggedUserInput` entries: one on `symptomToFix` (red recovery → fatigue) and one on `activityLevel` (high strain → high), both at `layer: "wearable"`, `confidence: 0.85`.
11. `getActivePlugins()` returns `[apple-health, amazon, telehealth, lab-placeholder, whoop]` in that order; length 5.
12. `<WhoopConnect>` renders BELOW `<LabValuesEntry>` on the assessment form. DOM offset: `whoop-connect` > `lab-values-entry` > `apple-health-upload`.
13. `POST /api/plugins/whoop { token: "..." }` with a syntactically-valid token shape calls the validate path and returns the contracted JSON shape (in this sandbox the upstream is unreachable, so the response surfaces an error string in the `error` field — but the route never returns 500).
14. `POST /api/plugins/whoop { token: "" }` returns `200 { tagged: [], summary: {}, error: "Invalid token. ..." }`.
15. `recommend(input, [appleHealthTag_at_2026-05-01, whoopTag_at_2026-05-04])` where both target the same UserInput field at the wearable layer resolves to the more-recent (Whoop) value via `resolveTaggedInputs`'s within-layer recency tie-break.
16. **N=017 regression intact:**
    - `recommend(input)` byte-identical to N=017 (engine pipeline untouched).
    - `<LabValuesEntry>` still renders below `<AppleHealthUpload>`.
    - Amazon `<FulfillButton>` still renders on each supplement card.
    - `<SpeakToDoctorButton>` conditional rendering still works (escalation true, routine false).
    - `lib/subscription.ts` DEV MODE comment unchanged.
    - `lib/plugins/{amazon,telehealth,labPlaceholder}/*` diffs against `main` empty.
    - `bash scripts/verify-audit-trail.sh` exits 0.

## BANNED THIS CYCLE

- New runtime dependencies
- Modifications to `lib/engine.ts`, `lib/signalLayers.ts`, `lib/signalPriority.ts`, `lib/pluginContract.ts`
- Modifications to N=015 / N=016 / N=017 plugin code
- OAuth flow for Whoop (paste-token only)
- Persistence of Whoop tokens or user metrics beyond the active session
- Transmission of Whoop data beyond recovery + strain to non-Whoop hosts
- False "Connected" state on either Apple Health or Whoop
- Medical-advice or AI-assistant framing
- The string `"AI-powered"`, `from-purple-` / `to-purple-` Tailwind classes
- New colors outside the locked palette (clinical orange usage on the empty-state indicator is already in the palette)
- `localStorage`, `sessionStorage`, `document.cookie`
- Emoji as UI markers
- Any change that breaks regression #16

## OPERATOR INSTRUCTIONS — Atomic commits

```
1.   N=018 operator: write A1_OUTPUT_018 diagnosis section (Apple Health failure modes)
2.   N=018 operator: harden parser regex for case variation (defense-in-depth)
3.   N=018 operator: anchor 7-day window to most-recent-record + add 30-day fallback
4.   N=018 operator: gate AppleHealthUpload Connected state on tagged.length > 0
5.   N=018 operator: log parser record counts in /api/plugins/apple-health route
6.   N=018 operator: add lib/plugins/whoop/tokenAuth.ts
7.   N=018 operator: add lib/plugins/whoop/normalizer.ts
8.   N=018 operator: add lib/plugins/whoop/index.ts
9.   N=018 operator: add components/WhoopConnect.tsx
10.  N=018 operator: add app/api/plugins/whoop/route.ts (contract-spirit-honoring)
11.  N=018 operator: register whoop as 5th entry in lib/pluginRegistry.ts
12.  N=018 operator: mount WhoopConnect below LabValuesEntry + thread tagged inputs
13.  N=018 operator: add WhoopToken + WhoopMetrics to lib/types.ts
14.  N=018 operator: finalize A1_OUTPUT_018.md manifest
```

## HANDOFF

→ Sentinel reads this file and emits GATE: OPEN or GATE: BLOCK.
→ Watcher invokes `bash scripts/verify-audit-trail.sh` per the N=013 protocol.
