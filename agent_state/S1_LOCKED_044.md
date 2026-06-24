# S1_LOCKED_044

N_ID: N_044

Intent:
Evidence depth — give every recommendation visible receipts. Expand the curated
STUDY_BREAKDOWNS in The Wire from 6 compounds to all 14, so every card can open
an in-app "See the data" with design / population / outcome / qualitative
magnitude / takeaway. Refine the default-feed curation: now that nearly every
compound carries a breakdown, the default vs "lighter evidence" split is driven
purely by evidence TIER (Strong shows by default; Moderate is one click away,
still with its own receipts on expand).

Honesty (hard rules, unchanged from N=039):
- No fabricated study statistics. Magnitudes are qualitative and textbook-
  defensible. Copy is checked by auditCopy at module load (build fails on a claim).

Scope / Allowed files:
- lib/research/studies.ts          (+8 breakdowns: magnesium-glycinate, protein,
  zinc, b12, iron, rhodiola, probiotic, electrolytes)
- components/research/ResearchFeed.tsx (isGood = Strong-tier; drop now-unused import)
- agent_state/* (trail)

Forbidden files:
- engine/route/types/package.json. No fabricated stats.

Deliverables:
- All 14 compounds have a curated breakdown; tier-driven default split; tsc/build green.

Verify command:
```bash
npx tsc --noEmit && npm run build
```
(Build success also confirms the compliance audit passed all new copy. Screenshot
N/A — sandbox blocks Playwright browser download.)

Parallel safe: false (shared feed). Stop: tsc/build non-zero; any blocked claim.
