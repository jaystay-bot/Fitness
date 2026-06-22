# CURRENT_025.md

**N:** 025 **Hat:** COMMANDER (Jay) **Date:** 2026-06-22 **Status:** PASS

Mandatory read order honored: AUDIT_TRAIL_PROTOCOL.md (binding since N=013).

## INTENT

Minimal-input mode. "Least amount of information in." Keep only the essentials
visible; collapse the rest into an optional "Fine-tune" block that still submits
by default.

## SUCCESS DEFINITION

- Core form short (age, sex, height, weight, goal + units visible).
- activity/sleep/diet/coffee/alcohol/symptom/inflammation collapsed but defaulted.
- Unit fields stay visible (visual tripwire safe). tsc + build green.

## HANDOFF

→ S1_LOCKED_025 → A1_OUTPUT_025 → TRUTH_RESULT_025 (PASS).
Remaining: N=023 PubMed real data (blocked on network egress — Commander to
allowlist eutils.ncbi.nlm.nih.gov).
