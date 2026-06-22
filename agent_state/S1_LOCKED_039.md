# S1_LOCKED_039

N_ID: N_039

Intent:
Let users read/understand the data IN-APP instead of clicking out. For a curated
set of compounds, add an expandable "See the data" breakdown to the research card
with (a) OUR own chart — the deterministic 30-day onset model, clearly labeled as
an illustrative model (not a study result), drawn as pure inline SVG — and (b)
real, cited, qualitative study facts (design, population, outcome, qualitative
magnitude, takeaway). Curated subset only, not every study.

Honesty (hard rules):
- NO fabricated study statistics. Magnitudes are qualitative ("moderate effect",
  "corrects deficiency"), drawn from well-established literature and cited (PMID).
- The chart is explicitly labeled "Apex model · illustrative, not a study result".
- Breakdown copy is checked by auditCopy at module load (build fails on a claim).

Scope / Allowed files (new unless noted):
- lib/research/studies.ts          (curated StudyBreakdown map + modelForCompound())
- components/research/StudyChart.tsx (pure inline-SVG model chart — server-safe, no deps)
- components/research/ResearchCard.tsx (expandable "See the data" when a breakdown exists)
- agent_state/* (trail)

Forbidden files:
- lib/** except new studies.ts (timeline + compliance imported read-only) ;
  app/api/** ; package.json/lock

Deliverables:
- Curated compounds show an in-app "See the data" with a model chart + cited facts.
- Build + typecheck green; screenshot of an opened breakdown.

Verify command:
```bash
npx tsc --noEmit && npm run build
```
Plus a screenshot of a research card with the breakdown expanded.

Parallel safe: false (shared ResearchCard). Stop: tsc/build non-zero; forbidden edit; any fabricated stat.
