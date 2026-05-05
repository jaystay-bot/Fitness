# NEXT_017.md

**Proposed by:** Judge of N=016 **Date:** 2026-05-05 **Predecessors:** N=012 (signal stack), N=013 (audit-trail), N=014 (Apple Health), N=015 (Amazon action), N=016 (telehealth action)

---

## INTENT

N=017 is the **fourth plugin integration** and the **second signal plugin** (after Apple Health, N=014): a **lab placeholder plugin**. Where Apple Health emitted wearable-layer signals (steps, sleep, resting HR) into `recommend(input, taggedInputs)`, the lab plugin emits **lab-layer** signals (ferritin, vitamin D, B12, magnesium, lipid panel markers) — proving the highest-priority layer in the Signal Stack flows through the priority resolver correctly when it conflicts with behavior or wearable signals.

This cycle is a *placeholder* in the sense that no real lab integration ships yet. The plugin reads from a **typed mock-data fixture** (`lib/plugins/lab/fixture.ts`) seeded with realistic-but-non-PII values. A future cycle can swap the fixture with LabCorp or Quest API integration, an XML/CSV upload, or a manual user-entry flow without touching the plugin's `normalize` contract or the signal flow.

Three objectives:

**A — Lab catalog + normalizer.**
A new `lib/plugins/lab/parser.ts` exports a `LabReport` interface mirroring the existing `LabValues` type from N=007 (`ferritin_ng_ml`, `vitamin_d_25oh_ng_ml`, `b12_pg_ml`, `magnesium_mg_dl`, lipid panel, glucose). A pure normalizer (`lib/plugins/lab/normalizer.ts`) maps the report into `TaggedUserInput[]` entries:
- `ferritin_ng_ml < 30` → boosts `symptomToFix` toward `"fatigue"` at lab layer (highest priority)
- `vitamin_d_25oh_ng_ml < 30` → boosts general energy / mood signal (mapped to `activityLevel` or a future field)
- Others remain inert pending future field additions

**B — Plugin registration as fourth entry, second signal variant.**
A new `lib/plugins/lab/index.ts` registers a `LabPlugin` against the existing `PluginNormalization` interface from N=012 (no contract change required). `lib/pluginRegistry.ts` is extended to seed `[appleHealthPlugin, amazonPlugin, telehealthPlugin, labPlugin]`. `getActivePlugins()` now returns four plugins. The N=014/N=015/N=016 first/second/third entry invariants are preserved.

**C — Lab fixture upload card.**
A new `components/LabFixtureUpload.tsx` mounts BELOW the existing Apple Health upload card on the assessment form. The card lists the supported lab markers and offers a "Use sample lab values" button that loads the typed fixture. On click, the parsed `TaggedUserInput[]` flows into `AssessmentForm` state and rides alongside the existing UserInput + Apple Health tagged inputs to `/api/recommend`. The card is purely opt-in; users who skip it experience the form byte-identically to N=016.

The lab signals flow through the same `recommend(input, taggedInputs)` second-parameter wired in N=012, exercising the priority resolver across three layers (behavior < wearable < lab) for the first time.

## SCOPE BOUNDARY

Three new plugin files (`parser.ts`, `normalizer.ts`, `index.ts`), one new component (`LabFixtureUpload.tsx`), a typed fixture file (`lib/plugins/lab/fixture.ts`). Surgical modifications to `pluginRegistry.ts` (fourth entry seed) and `AssessmentForm.tsx` (mount fixture card + thread tagged inputs through submit, identical pattern to N=014's Apple Health integration). No engine modification. No Signal Stack core modification. No new dependencies. No persistence to Supabase — the fixture lives in source.

## SUCCESS DEFINITION (Judge-binding for N=017)

- `getActivePlugins()` returns `[appleHealthPlugin, amazonPlugin, telehealthPlugin, labPlugin]` in that order; length 4.
- `parseLabReport(<fixture>)` returns the expected `LabReport` shape.
- `normalizeLabReport(<report>)` produces `TaggedUserInput[]` with `layer === "lab"` for every emitted entry.
- `recommend(input, [...appleHealth, ...lab])` shows lab values winning over behavior values when both target the same field (priority weight 3 > 1).
- `<LabFixtureUpload>` renders on the assessment form; tapping the sample button loads the fixture and the resulting recommendation reflects the lab signals.
- All N=016 behaviors regress green: telehealth button conditional rendering, Amazon FulfillButton on each pick, Apple Health upload card mount, `recommend(input)` byte-identical for users who skip both upload cards.
- The N=013 `verify-audit-trail.sh` exits 0.
- The N=012 byte-identical engine regression still holds.

## CONSTRAINTS

- No engine modification.
- No `lib/pluginContract.ts` modification (the existing `PluginNormalization` from N=012 covers signal plugins; this is the second signal plugin).
- No `lib/types.ts` modification beyond optional additive types (e.g., `LabReport` if not already present in N=007's `LabValues`).
- No new runtime dependencies.
- No persistence to Supabase. The fixture is a typed source file.
- No PII in the fixture — values are synthetic.
- Locked palette only.
- No changes to N=014 / N=015 / N=016 plugin code or tests.

## HANDOFF

→ N=017 Commander reads:
  1. `agent_state/CURRENT_N.md` through `CURRENT_016.md`
  2. `agent_state/S1_LOCKED.md` through `S1_LOCKED_016.md`
  3. `agent_state/AUDIT_TRAIL_PROTOCOL.md` (binding since N=013)
  4. `agent_state/TRUTH_RESULT_016.md`
  5. `agent_state/QUEUE.md` and `SESSION_LOG.md`
  6. `lib/engine.ts`, `lib/signalLayers.ts`, `lib/signalPriority.ts`, `lib/pluginContract.ts`, `lib/pluginRegistry.ts`
  7. `lib/plugins/appleHealth/index.ts` (reference pattern for signal plugin)
  8. `lib/plugins/amazon/index.ts`, `lib/plugins/telehealth/index.ts` (reference patterns for action plugins)
  9. `components/AppleHealthUpload.tsx`, `components/AssessmentForm.tsx` (mount + click pattern)
  10. `lib/types.ts` (LabValues already present from N=007), `package.json`

If any file is missing, STOP and report.

The locked priority build order continues:
- N=017 — Lab placeholder signal plugin (this proposal)
- N=018+ — Additional wearables (Whoop, Oura, Garmin) with progressive integration depth
- Beyond — Telehealth API integration with HIPAA review, Amazon partner approval with cart building
