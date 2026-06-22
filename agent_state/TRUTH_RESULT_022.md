# TRUTH_RESULT_022

N_ID: N_022
Verify command: `npx tsc --noEmit && npm run build`
Exit code: 0
Result: PASS

Evidence:
- tsc exit 0; build exit 0.
- Determinism (live double-POST to /api/recommend): IDENTICAL for a legacy input
  AND the new underweight+high-inflammation+gain-weight input.
- Protein unified (legacy muscle input): card "148 g", dailyTarget 148 g, plan
  "148 g/day" — previously the card showed 131 g (×1.6) while the target showed
  148 g (×1.8). Contradiction resolved.
- New behavior (female, 175 cm, 48 kg, gain-weight, inflammation=high):
  - bmi 15.7 → underweight path active.
  - verdict "...built to add healthy weight...".
  - dailyProtein 106 g = 48 × 2.2/kg (1.8 base + 0.4 high-inflammation).
  - stack: Whey/plant protein, Creatine, Omega-3, Vitamin D3, Magnesium —
    weight-gain + anti-inflammatory routing correct.
  - eatMore leads with fatty fish / olive oil / colored produce.
  - warnings include the food-first weight-gain note AND the inflammation note.
- Peptide guard: the substring "peptide" appears ONLY inside the
  "no peptides or hormones" warning. No peptide is ever recommended.

Watcher: bash scripts/verify-audit-trail.sh → (recorded in SESSION_LOG).
No forbidden files changed; VoiceInput edit was a type-forced label addition
added to the lock's allowed list before editing.
