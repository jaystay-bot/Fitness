# A1_OUTPUT_038
N_ID: N_038
Files changed:
- lib/research/live.ts (new) — getLiveResearchItems(): chunked, timeout-guarded
  NCBI esearch fetch of real study counts; per-compound + total fallback to the
  curated feed; returns {items, live, fetchedAt}.
- components/research/ResearchFeed.tsx — accepts items prop; computes max from items.
- components/research/StatStrip.tsx — accepts items + live + fetchedAt; shows
  "Live · PubMed · <date>" when live, "approx." otherwise; live counts drop the "~".
- app/research/page.tsx — async server component; export const revalidate=21600
  (6h ISR); fetches live items and passes them down.
Commands run: tsc 0; build 0 (/research ISR; sandbox fell back to estimates).
Live verify: density label "APPROX. PUBMED-INDEXED STUDIES" + 15 cards + 0 page
errors in sandbox (fallback). Production reaches PubMed → live counts on deploy.
Notes: no fabricated data (live=real counts, fallback=labeled estimates); no
dependency; robust to NCBI failure/rate-limit (keeps estimates per compound).
