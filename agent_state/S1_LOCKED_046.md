# S1_LOCKED_046

N_ID: N_046

Intent:
Result clarity & mobile polish. Replace the cramped wrapped summary line (a row
of mono spans for BMI / calories / protein / water / sleep that wraps awkwardly
on a phone) with a clean, responsive stat-tile grid (2 cols mobile → 3 sm → 5
lg). Each tile: serif value + unit + small label, with the calorie tile showing
the maintenance sub-line. Premium, glanceable, mobile-first.

Scope / Allowed files:
- components/ResultCard.tsx  (new Stat sub-component + stat grid)
- agent_state/* (trail)

Forbidden files:
- engine/route/types/data. Presentation only — no data or numbers change.

Deliverables:
- Result summary renders as a stat-tile grid; tsc/build green.

Verify command:
```bash
npx tsc --noEmit && npm run build
```
(Screenshot N/A — sandbox blocks Playwright browser download.)

Parallel safe: false (shared ResultCard). Stop: tsc/build non-zero.
