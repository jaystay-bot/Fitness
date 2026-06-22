# NEXT_023.md

**Proposed by:** Judge of N=022 **Date:** 2026-06-22

## INTENT

Real data research. Replace the hand-typed round `studyCount` values in
lib/supplements.ts (500, 300, 250, …) — the main "made-up numbers" tell — with
real counts pulled from PubMed via NCBI E-utilities at BUILD TIME, keeping the
runtime engine pure (no runtime external calls, per the app's design).

## SHAPE (Architect will lock)

- `scripts/fetch-pubmed-counts.mjs` — queries E-utilities esearch for each
  supplement's term, writes `lib/data/studyCounts.json` (id → count, fetched-at).
- lib/supplements.ts reads the generated counts with the current hand value as a
  fallback when the JSON is absent (offline/CI without network).
- Honest labeling: counts are "PubMed results", not "RCTs" — adjust copy if the
  EvidenceLedger/Result claim says RCTs.
- Optional: pull a real representative PMID per supplement.

## CONSTRAINTS

- No runtime network calls; fetch is build-time/manual only.
- Network may be unavailable in this environment → script must degrade to the
  committed fallback and the build must stay green offline.
- Verify: `node scripts/fetch-pubmed-counts.mjs` (or a dry-run flag) + tsc + build.

## AFTER N=023

- N=024 — Minimal-input mode (fewest questions).
- N=025 — Rework the insurance/vault positioning to the supplement mission
  (Commander content decision).
