# CURRENT_007.md

**N:** 007 **Hat:** COMMANDER (Jay) **Date:** 2026-05-04 **Status:** ACTIVE **Predecessor:** N=006 PASS

---

## INTENT

N=007 ships three Pro-tier features that ground the recommendation in measured rather than estimated data. First, a predictive symptom timeline that projects day-by-day expected effects of each supplement based on published onset-of-effect research, rendered as an interactive thirty-day visualization in the result card. Second, a lab result parser that accepts PDF bloodwork uploads, extracts ferritin, vitamin D, B12, magnesium, and basic lipid markers using a deterministic Python parsing layer, and re-runs the engine using actual measured values with a comparison view showing how the recommendation shifted. Third, a supplement bottle camera scanner that uses the device camera plus a self-hosted vision model to identify the compound, dose, and form on any supplement bottle, then compares against the user's current protocol and warns of conflicts or mismatches. All three features are gated to the Pro tier through the existing `ProGate` component. The free recommendation experience is unchanged.

## SCOPE BOUNDARY

Three Pro-only feature pillars. No fourth feature this cycle.

1. Timeline projection — pure TypeScript onset-of-effect curves; no Python.
2. Lab parser + engine recompute — Python PDF parser called from a Node API route; lab values become engine input overrides through a strict mapping.
3. Bottle scanner — Python OCR + fuzzy match against the existing supplement table; camera + file-upload UI; match / mismatch / unknown render states.

Each Pro feature is wrapped in `<ProGate>`. Free users see an inline upgrade prompt where the Pro feature would render. The recommendation flow they see is byte-identical to N=006.

## SUCCESS DEFINITION

- Free user submits the form, sees the recommendation, sees inline ProGate prompts where Timeline / LabUpload / BottleScanner would render.
- Pro user sees the same recommendation plus the three new tools — Timeline as a 30-day chart, LabUpload as a drag-drop with side-by-side comparison after upload, BottleScanner as a camera-or-file flow with match/mismatch result.
- Engine signature gains an optional `labValues` parameter only. Without it, behavior is unchanged. With it, the corresponding self-reported fields are overridden and downstream logic (variation, confidence, conflicts) flows naturally.
- Two new tables in Supabase (`lab_uploads`, `bottle_scans`) — additive only, RLS enabled with the same own-row pattern as `subscriptions`. **No raw PDFs or images persist on disk.**

## CONSTRAINTS (Commander level)

- No paid third-party lab parsing or vision API. Self-hosted Python only.
- No persistent storage of raw uploaded files. Only the structured extracted values.
- The free experience is sacred. No regression on N=006 acceptance.
- Engine, supplements, conflicts, variation, confidence, units, slug, subscription modules — all frozen. Engine signature accepts optional `labValues` only.
- Honor the "coming soon" disclosure on `/pricing` from N=006 by shipping the first wave of Pro features.

## HANDOFF

→ Architect writes `/agent_state/S1_LOCKED_007.md`. Prior locked contracts remain binding.
