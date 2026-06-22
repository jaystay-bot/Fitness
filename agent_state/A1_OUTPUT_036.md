# A1_OUTPUT_036
N_ID: N_036
Files changed (new unless noted):
- lib/research/feed.ts — ResearchItem[] from SUPPLEMENTS (tier, study count, PMID,
  goals, safe finding); PubMed URLs; aggregate stats; build-time compliance guard.
- components/research/Sparkline.tsx — VolumeBar + TierMeter (real values only).
- components/research/ResearchCard.tsx — feed card (tags, tier, finding, meters, PubMed link).
- components/research/StatStrip.tsx — 4 stat tiles + "research density by compound" bar chart.
- components/research/ResearchFeed.tsx — client feed with goal + evidence-tier filter chips.
- app/research/page.tsx — "The Wire" page (header, stats, feed, disclaimers).
- components/SpearHero.tsx + components/Footer.tsx — nav links to /research.
Commands run: tsc 0; build 0 (/research static, compliance guard passed → findings clean).
Screenshots: wire_desktop, wire_filtered, wire_mobile.
Notes: NO fabricated effect sizes/statistics — only real tier/study-count/PMID data,
study counts labeled "bucketed estimate"; every card links to the primary source.
This is the honest, no-egress foundation of THE WIRE (live auto-feed needs egress).
