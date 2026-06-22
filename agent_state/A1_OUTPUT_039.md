# A1_OUTPUT_039
N_ID: N_039
Files changed (new unless noted):
- lib/research/studies.ts — 6 curated StudyBreakdown entries (design/population/
  outcome/qualitative magnitude/takeaway, cited via the card's PMID) + modelForCompound()
  reusing lib/timeline; build-time compliance guard over the copy.
- components/research/StudyChart.tsx — pure inline-SVG chart of the 30-day onset
  model (server-safe, no recharts); plots active metrics; labeled.
- components/research/ResearchCard.tsx — expandable "See the data" when a breakdown
  exists: model chart + "illustrative, not a study result" label + design/who/
  measured/finding + takeaway.
Commands run: tsc 0; build 0 (compliance guard passed → breakdown copy clean).
Live verify: 6 "See the data" expanders; screenshot (studybreakdown.png) shows the
Creatine breakdown — model curve, labeled, with cited structured facts + PMID.
Notes: NO fabricated study statistics; magnitudes are qualitative + cited; the
chart is our deterministic model, explicitly labeled. Curated subset (6), not all.
