# CURRENT_031.md

**N:** 031 **Hat:** COMMANDER (Jay) **Date:** 2026-06-22 **Status:** PASS

Mandatory read order honored: AUDIT_TRAIL_PROTOCOL.md (binding since N=013).

## INTENT
Connect the engine's recommendations to the buy-box system: a "Where to buy" link
per recommended supplement that deep-links to its /shop product, plus a footer
link to /shop.

## SUCCESS DEFINITION
- Matched supplement cards show "Where to buy" → /shop#product-<slug>.
- Footer links to /shop. tsc + build green; live result shows the links.

## HANDOFF
→ S1_LOCKED_031 → A1_OUTPUT_031 → TRUTH_RESULT_031 (PASS).
