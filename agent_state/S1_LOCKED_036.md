# S1_LOCKED_036

N_ID: N_036

Intent:
Build the /research page — a social-feed-style, READ-ONLY stream of evidence
cards for every supplement/health compound, with charts/data/stats and outbound
links to the primary source (PubMed). The honest, no-egress foundation of "THE
WIRE": no posting, no engagement metrics; you scroll and read the science.

Honesty rules (reuse N=028 compliance):
- Build ONLY from data we actually have: evidence tier, approx study count
  (labeled "bucketed estimate"), PMID, goals/symptoms. NO fabricated effect
  sizes or invented statistics.
- Per-card "finding" copy is structure-function safe and checked by auditCopy at
  module load (build fails on a blocked claim).
- Every card links to the real PubMed record/search; data viz uses only real
  values (tier strength, study volume) — labeled as estimates.

Scope / Allowed files (new unless noted):
- lib/research/feed.ts                  (ResearchItem[] from SUPPLEMENTS + safe findings + aggregates)
- components/research/Sparkline.tsx      (tiny inline-SVG study-volume meter)
- components/research/ResearchCard.tsx
- components/research/StatStrip.tsx       (aggregate stats + tier distribution)
- components/research/ResearchFeed.tsx    (client; filter chips by goal + tier)
- app/research/page.tsx                   (the feed page)
- components/SpearHero.tsx                (nav link to /research)
- components/Footer.tsx                   (link to /research)
- agent_state/* (trail)

Forbidden files:
- lib/** except new lib/research/* ; lib/supplements + lib/compliance imported read-only
- app/api/** ; package.json/lock (recharts already present)

Deliverables:
- /research renders a feed of evidence cards (tier, study count, finding, data
  meter, PubMed link), filter chips, an aggregate stat strip, disclaimers.
- Build + typecheck green; screenshots.

Verify command:
```bash
npx tsc --noEmit && npm run build
```
Plus desktop + mobile screenshots of /research.

Parallel safe: false (touches shared nav). Stop: tsc/build non-zero; forbidden edit; any fabricated stat.
