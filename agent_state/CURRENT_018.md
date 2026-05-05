# CURRENT_018.md

**N:** 018 **Hat:** COMMANDER (Jay) **Date:** 2026-05-05 **Status:** ACTIVE **Predecessor:** N=017 (PASS, merged via PR #26)

---

## INTENT

N=018 is a **coordinated bug-fix + feature cycle**. Two objectives ship in one PR because they touch overlapping surfaces (`AppleHealthUpload`, `AssessmentForm`, the wearable layer in the priority resolver) and splitting them would create unnecessary merge complexity.

Four objectives:

**A — Diagnose the production Apple Health bug.**
Jay tested live at `fitness-iota-azure.vercel.app` and reported: the Apple Health upload card on `/r/<slug>` shows "Connected · Apple Health" after upload but renders the three values (steps, sleep, resting HR) as blank dashes instead of numbers. Pre-cycle code inspection (parser.ts, normalizer.ts, AppleHealthUpload.tsx, route.ts) identifies **two compounding failure modes**:

1. **`AppleHealthUpload.tsx` lines 47–53:** `setConnected(true)` fires unconditionally after the POST resolves, regardless of whether `data.summary` is populated. The connected render falls back to `"—"` when summary fields are `null` — producing the blank-dashes Jay reported.
2. **`lib/plugins/appleHealth/normalizer.ts`:** the 7-day "last seven days" window is computed relative to `nowMs` (current upload time), not relative to the most recent record in the export. Users who exported their data 1–4 weeks ago — common, since exports often sit in Files for a while — pass the 30-day recency filter but fail the 7-day window. Result: empty arrays, empty summary, falsely-Connected card.

The parser regex (`<Record\b[^>]*type="..."[^>]*/?>`) handles modern Apple exports correctly for the three target identifiers. We will harden it for case variation and child-tagged sleep records as a defense-in-depth precaution, but the parser is not the root cause.

**B — Fix the bug with minimum scope.**
- **Normalizer:** anchor the 7-day window to the most-recent-record date in the export (not "now"), so an export pulled 3 weeks ago still produces non-empty signals. Fall back to a 30-day average when the most-recent-7-days window is sparse. Keep the 30-day recency cutoff.
- **Component:** gate the "Connected" visual on `tagged.length > 0`. When the array is empty, render "No recent data found in this export" with a `lucide-react` `AlertCircle` icon instead of the false-Connected state.
- **Route:** add a server-side `console.log` of parser output (record counts per type) so future debugging can read Vercel logs to see what the parser actually extracted.
- **Parser:** widen the regex to handle the three known Apple variants without breaking existing fixture matches.

**C — Implement the Whoop wearable plugin.**
Per the locked priority build order from `NEXT_018.md`, the fifth integration is Whoop — the third signal plugin and the second wearable. Paste-the-token integration (no OAuth flow). The user copies their Whoop personal access token from `developer.whoop.com`; the plugin POSTs the token server-side, hits `https://api.prod.whoop.com/developer/v1/recovery` and `/cycle`, and returns `TaggedUserInput[]` at `layer="wearable"` with `confidence=0.85`. The token never persists.

**D — Register Whoop as the fifth plugin entry.**
`lib/pluginRegistry.ts` extended to seed `[appleHealth, amazon, telehealth, lab-placeholder, whoop]`. The N=014/N=015/N=016/N=017 first-four-entry invariants are preserved.

The "honest connection state" pattern established by the Apple Health fix applies to the new Whoop card from day one: the Connected visual is gated on actual data, not the paste event.

## SCOPE BOUNDARY

Four new files for Whoop (tokenAuth, normalizer, plugin index, WhoopConnect component) plus one new API route under `/api/plugins/whoop`. Targeted modifications to four Apple Health files (parser, normalizer, AppleHealthUpload, API route) for the bug fix. Three surgical modifications for Whoop registration: `pluginRegistry.ts`, `AssessmentForm.tsx`, `lib/types.ts`. Zero new dependencies. No new Supabase migrations. No engine modification. No Signal Stack core modification.

## SUCCESS DEFINITION

- Apple Health card shows real numbers when the export has records anywhere in the last 30 days (most-recent-7-days preferred, 30-day fallback).
- Apple Health card shows "No recent data found" with `AlertCircle` icon when the export is empty or has only stale (>30 days) records.
- Apple Health route logs parser record counts to stderr/stdout for Vercel log inspection.
- `getActivePlugins()` returns `[apple-health, amazon, telehealth, lab-placeholder, whoop]`; length 5.
- `validateWhoopToken("")` and `validateWhoopToken("malformed")` return `{ valid: false, error: "..." }`.
- `normalizeWhoopMetrics({recoveryScore, dayStrain, asOf})` returns `TaggedUserInput[]` at wearable layer.
- `<WhoopConnect>` renders BELOW `<LabValuesEntry>` on the assessment form.
- N=017 regression intact (lab placeholder, Amazon FulfillButton, telehealth conditional, recommend byte-identical without plugin tagged inputs).
- N=013 `verify-audit-trail.sh` exits 0.

## CONSTRAINTS (Commander level)

- Engine purity preserved (`lib/engine.ts` byte-identical).
- Signal Stack core (`lib/signalLayers.ts`, `lib/signalPriority.ts`, `lib/pluginContract.ts`) FROZEN.
- N=015 Amazon, N=016 telehealth, N=017 lab-placeholder plugins FROZEN (their plugin code, registry order, and components).
- N=015 `FulfillButton`, N=016 `SpeakToDoctorButton`, N=017 `LabValuesEntry` components FROZEN.
- N=014 Apple Health: parser + normalizer + AppleHealthUpload + route are UNFROZEN this cycle for the bug fix only. The fix is minimum-scope; no new features added.
- Zero new runtime dependencies.
- No persistence of Whoop tokens. No `localStorage` / `sessionStorage` of any plugin data.
- No new env vars (Whoop API base URL is constant + publicly documented).
- Locked palette only.
- Honest connection state on both Apple Health and Whoop cards.
- No medical-advice or AI-assistant framing.

## HANDOFF

→ Architect writes `/agent_state/S1_LOCKED_018.md`. All prior locked contracts remain binding. The N=013 `AUDIT_TRAIL_PROTOCOL.md` Watcher-phase amendment is binding for this cycle.
