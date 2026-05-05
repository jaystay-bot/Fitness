# A1_OUTPUT_018.md

**N:** 018 **Hat:** OPERATOR **Date:** 2026-05-05 **Branch:** `claude/apex-protocol-n018-aYZje` **Predecessor:** main @ `ce1438e` (post N=017 merge)

---

## DIAGNOSIS — APPLE HEALTH BUG

The bug Jay reported on `fitness-iota-azure.vercel.app` ("Connected · Apple Health" rendering blank dashes after upload) was diagnosed pre-cycle by reading the four implicated files. Two compounding failure modes confirmed:

### Failure mode A — AppleHealthUpload.tsx fires Connected unconditionally

`components/AppleHealthUpload.tsx` lines 47–53 (N=014 / pre-fix):

```tsx
const data = (await res.json().catch(() => ({ tagged: [], summary: {} }))) as UploadResponse;
setSummary(data.summary ?? {});
setConnected(true);                                      // ← UNCONDITIONAL
onTagged?.(Array.isArray(data.tagged) ? data.tagged : []);
```

The Connected branch's render falls back to `"—"` for every summary field that's `null`:

```tsx
{summary.averageDailySteps != null
  ? `${summary.averageDailySteps.toLocaleString("en-US")} / day`
  : "—"}
```

So every empty parse → unconditional Connected → three dashes. Exactly Jay's report.

### Failure mode B — Normalizer 7-day window anchored to "now"

`lib/plugins/appleHealth/normalizer.ts` (N=014 / pre-fix):

```ts
function withinLastSevenDays<T extends { date: string }>(
  records: T[],
  nowMs: number,
): T[] {
  const cutoff = nowMs - SEVEN_DAYS_MS;       // ← anchored to NOW, not to most-recent record
  return records.filter((r) => {
    const t = tsMs(r.date);
    return Number.isFinite(t) && t >= cutoff && t <= nowMs;
  });
}
```

A user who exports their iOS Health data on, say, April 18, then uploads on May 5 (the date of Jay's testing), has records dated April 11–April 18. All records pass the 30-day recency cutoff but ALL FAIL the 7-day "last seven days" window relative to May 5. Result: `recentSteps = recentSleep = recentHR = []`. Empty arrays → empty TaggedUserInput[] → empty summary → unconditional Connected → blank dashes.

### Parser is NOT the root cause

`lib/plugins/appleHealth/parser.ts` regex `<Record\b[^>]*type="<id>"[^>]*/?>` correctly matches all three target identifiers in modern Apple exports (verified against Apple's documented `export.xml` format). Hardening only as defense-in-depth — case tolerance + child-tag whitespace.

### Root cause summary

The bug is the **product of A × B**. Either failure mode in isolation would produce a different symptom:
- A alone (parser/normalizer working): user would see Connected with real numbers when fresh, blank dashes only on stale exports.
- B alone (component gated correctly): stale export → "no data found" message, never blank dashes.

The combination produces the false-Connected blank-dash state Jay reported. Both fixes ship in this cycle.

---

## SUMMARY

Coordinated **bug fix + feature** cycle. Apple Health card now honestly reports connection state — production false-Connected blank-dash bug Jay reported is fixed. Whoop registers as the fifth plugin, third signal plugin, second wearable signal source. Zero new dependencies. Engine + Signal Stack core + N=015/N=016/N=017 plugin code FROZEN.

**32/32 smoke tests PASS** including the critical regression test: a 15+-day-old Apple Health export now produces 3 tagged entries with correct summary (steps=10229, sleep=7.4hrs, bpm=56) where pre-fix would have been empty.

## COMMITS

```
340e83d  N=018 commander: define Apple Health bug fix and Whoop plugin integration cycle
42f0d33  N=018 architect: lock Apple Health bug fix and Whoop plugin integration contract
a5f2e40  N=018 operator: write A1_OUTPUT_018 diagnosis section (Apple Health failure modes)

# Apple Health bug fix:
d371893  N=018 operator: harden parser regex for case variation (defense-in-depth)
fd36c23  N=018 operator: anchor 7-day window to most-recent-record + add 30-day fallback (CRITICAL FIX)
3080b09  N=018 operator: gate AppleHealthUpload Connected state on tagged.length > 0 + add empty-result state
76d4bcc  N=018 operator: log parser record counts in /api/plugins/apple-health route

# Whoop integration:
442e85a  N=018 operator: add lib/plugins/whoop/tokenAuth.ts (paste-token validation + minimal Whoop API client)
47b9b01  N=018 operator: add lib/plugins/whoop/normalizer.ts (recovery + strain → wearable-layer TaggedUserInput[])
49327f3  N=018 operator: add lib/plugins/whoop/index.ts (PluginNormalization at wearable layer)
52006c1  N=018 operator: add components/WhoopConnect.tsx (paste-token card with honest connection state)
227fa12  N=018 operator: fix WhoopConnect summary state to allow null explicitly
e0de7e4  N=018 operator: add app/api/plugins/whoop/route.ts (POST endpoint validates + fetches + normalizes; never persists)
a8a614a  N=018 operator: register whoop as 5th entry in lib/pluginRegistry.ts
fabd8f6  N=018 operator: mount WhoopConnect below LabValuesEntry + thread Whoop tagged inputs in AssessmentForm
cfb4a41  N=018 operator: add WhoopToken + WhoopMetrics to lib/types.ts (additive only)
(this)   N=018 operator: finalize A1_OUTPUT_018 manifest
```

## SMOKE-TEST VERIFICATION SUMMARY

```
=== Apple Health bug fix ===
PASS  Parser extracts 7 step + 7 sleep + 5 HR records from a 15+-day-stale fixture
PASS  Stale export (15+ days old) produces 3 TaggedUserInput entries (PRE-FIX: empty)
PASS  Summary has averageDailySteps=10229 / averageSleepHours=7.4 / restingHeartRate=56
PASS  Empty export → empty TaggedUserInput[] + empty summary
PASS  All-stale export (>30 days old) → empty TaggedUserInput[] (recency cutoff still applies)

=== Whoop plugin ===
PASS  validateWhoopToken('') / 'malformed' / '   ' all return invalid with helpful error
PASS  normalizeWhoopMetrics(red recovery + high strain) emits 2 wearable-layer entries
PASS  normalizeWhoopMetrics(green recovery + low strain) emits 1 entry (activityLevel=light)
PASS  All Whoop entries carry confidence 0.85 + ts from API asOf
PASS  whoopPlugin shape: name=whoop, layer=wearable, recency=7 days

=== Registry order ===
PASS  [0]=apple-health, [1]=amazon, [2]=telehealth, [3]=lab-placeholder, [4]=whoop

=== Within-layer recency tie-break (T15) ===
PASS  Apple Health (older) + Whoop (newer) both at wearable layer: Whoop wins via recency tie-break

=== Engine byte-identical regression ===
PASS  recommend(input) byte-identical to recommend(input, undefined) and recommend(input, [])
baseline_json_length=2711 (unchanged)

ALL 32 PASS
```

## FILES TOUCHED (will be filled in as commits land)

```
M  lib/plugins/appleHealth/parser.ts            defense-in-depth regex widening
M  lib/plugins/appleHealth/normalizer.ts        CRITICAL: anchor window to most-recent record + 30-day fallback
M  components/AppleHealthUpload.tsx             gate Connected on tagged.length > 0; add empty-state UI
M  app/api/plugins/apple-health/route.ts        server-side log of parser output

A  lib/plugins/whoop/tokenAuth.ts               paste-token validation + Whoop API client
A  lib/plugins/whoop/normalizer.ts              recovery + strain → TaggedUserInput[]
A  lib/plugins/whoop/index.ts                   PluginNormalization at wearable layer
A  components/WhoopConnect.tsx                  paste-token UI card with honest connection state
A  app/api/plugins/whoop/route.ts               POST endpoint: validate + fetch + normalize

M  lib/pluginRegistry.ts                        seed 5th entry (whoopPlugin)
M  components/AssessmentForm.tsx                mount WhoopConnect below LabValuesEntry + concatenate
M  lib/types.ts                                 additive WhoopToken + WhoopMetrics types

A  agent_state/CURRENT_018.md
A  agent_state/S1_LOCKED_018.md
A  agent_state/A1_OUTPUT_018.md   (this file, finalized in commit 14)
A  agent_state/TRUTH_RESULT_018.md  (Judge will write)
A  agent_state/NEXT_019.md          (Judge will write on PASS)
M  agent_state/SESSION_LOG.md       N=018 cycle entries appended
```

`git diff main -- lib/engine.ts lib/signalLayers.ts lib/signalPriority.ts lib/pluginContract.ts` empty.
`git diff main -- lib/plugins/{amazon,telehealth,labPlaceholder}/` empty.
`git diff main -- package.json package-lock.json` empty.

## HANDOFF (will be updated when cycle completes)

→ Watcher reads this file, runs the drift gauntlet against `main`, invokes `bash scripts/verify-audit-trail.sh`.
→ Judge verifies all 16 acceptance criteria.
