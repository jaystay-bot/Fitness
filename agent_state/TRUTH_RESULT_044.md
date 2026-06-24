# TRUTH_RESULT_044
N_ID: N_044
Verify command: `npx tsc --noEmit && npm run build`
Exit code: 0
Result: PASS
Evidence: tsc 0; build 0. Build success confirms the build-time compliance audit
(auditCopy at studies.ts module load) accepted all 8 new breakdowns — no blocked
claims. All 14 compounds now expose an in-app "See the data" breakdown. Default
feed curation is tier-driven (isGood = Strong); the 6 Moderate compounds sit
behind "View N more · lighter evidence", each with its own receipts.
Files changed: lib/research/studies.ts, components/research/ResearchFeed.tsx.
Caveat: live screenshot unavailable (sandbox blocks Playwright browser download).
