# NEXT_014.md

**Proposed by:** Judge of N=013 **Date:** 2026-05-05 **Predecessors:** N=012 (signal stack foundation), N=013 (audit trail infrastructure)

---

## INTENT

N=014 is the **first plugin integration cycle**: Apple Health. This cycle ships the first concrete `PluginNormalization` implementation against the contract locked in N=012, plus the audit-trail guard from N=013 begins enforcing committed state files for every cycle from this point forward.

Three objectives:

**A — Apple Health plugin module.**
A new `lib/plugins/appleHealth.ts` (or equivalent) that implements `PluginNormalization`. The plugin's `normalize(raw)` reads Apple Health's HKWorkoutSession + HKQuantitySample export shape (XML or JSON depending on the import format Apple Health provides) and emits `TaggedUserInput[]` mapping to the engine's UserInput fields where possible:

- Heart-rate-derived activity intensity → `activityLevel` (`sedentary` / `light` / `moderate` / `high`).
- Step count + active calories → confidence boost on `activityLevel`.
- Sleep analysis (HKCategoryTypeIdentifierSleepAnalysis) → `sleepHours` (mean over the import window).
- Body mass + height samples → `weightKg`, `heightCm` (most recent within recency threshold).
- Tagged with `layer: "wearable"`, `confidence` calibrated from sample count + recency, `timestamp` from the sample's effective timestamp.

**B — Plugin ingestion route.**
`app/api/plugins/apple-health/route.ts` (POST) accepts an Apple Health export payload, validates schema, calls `appleHealth.normalize(raw)`, and persists the resulting `TaggedUserInput[]` into a new `apple_health_imports` Supabase table (additive migration). Per-row RLS, owned by the importing Clerk user. The route does NOT call `recommend` — recommendation continues to flow through `/api/recommend` and `/r/[slug]`. The persisted tagged inputs are read on subsequent recommendation calls.

**C — Recommendation pipeline integration.**
`/api/recommend` (and `/r/[slug]/page.tsx`) gain an optional code path that, when the user is signed in via Clerk and has rows in `apple_health_imports`, fetches the most recent tagged inputs (within the plugin's recency threshold) and passes them as the second argument to `recommend(input, taggedInputs)`. Anonymous flow remains untouched.

## SCOPE BOUNDARY

One new plugin module. One new API route. One additive Supabase migration. Surgical extensions to `/api/recommend` and `/r/[slug]/page.tsx` to pull tagged inputs for signed-in users with imports. No other product code moves. Engine purity preserved (the engine still receives explicit tagged inputs; it does NOT learn about the registry directly).

## SUCCESS DEFINITION (Judge-binding for N=014)

- Apple Health export fixture parses into the expected `TaggedUserInput[]`.
- The plugin's `confidence` and `recencyThresholdMs` are calibrated to plausible values (e.g., 30-day threshold for fitness data, sample-count-weighted confidence in `[0.4, 0.95]`).
- `recommend(input, taggedInputsFromApple)` produces a different recommendation than `recommend(input)` when the imports contradict the user's stated activity level (e.g., user said "moderate", Apple Health says "high" → wearable layer wins, recommendation reflects high activity).
- Anonymous user flow remains byte-identical (no Apple Health code path fires unless the user is signed in AND has rows).
- All N=012 + N=013 behaviors regress green.
- The N=014 Watcher invokes `bash scripts/verify-audit-trail.sh` per the N=013 protocol and the script exits 0.

## CONSTRAINTS (Commander level)

- No engine modification (`lib/engine.ts`).
- No frozen file modification (signal-stack core, plugin contract, plugin registry).
- One new Supabase table: `apple_health_imports`.
- Plugin runs as pure server-side TypeScript; raw Apple Health exports are streamed through `child_process` if needed but must NOT persist to disk.
- The plugin honors the privacy posture established in N=007: raw uploads never persist.
- The verify-audit-trail script must be invoked in the Watcher phase per `agent_state/AUDIT_TRAIL_PROTOCOL.md`.

## HANDOFF

→ N=014 Commander reads:
  1. `/agent_state/CURRENT_N.md` through `CURRENT_013.md`
  2. `/agent_state/S1_LOCKED.md` through `S1_LOCKED_013.md`
  3. `/agent_state/AUDIT_TRAIL_PROTOCOL.md` *(binding since N=013)*
  4. `/agent_state/TRUTH_RESULT_013.md`
  5. `/agent_state/QUEUE.md` and `/agent_state/SESSION_LOG.md`
  6. The signal stack core (`/lib/engine.ts`, `/lib/signalLayers.ts`, `/lib/signalPriority.ts`, `/lib/pluginContract.ts`, `/lib/pluginRegistry.ts`)
  7. The recommendation API route (`/app/api/recommend/route.ts`)
  8. `/lib/types.ts`, `/package.json`

If any file is missing, STOP and report.
