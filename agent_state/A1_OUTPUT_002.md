# A1_OUTPUT_002.md

**N:** 002 **Hat:** OPERATOR **Status:** EMITTED

## New files

- `lib/conflicts.ts` — pure `detectConflict(input)` returning `ConflictFlag | null` with the five locked rules.
- `lib/ledgerSamples.ts` — three ledger samples (Strong/Moderate/Emerging) sourced from `SUPPLEMENTS`.
- `components/ConflictBanner.tsx` — clinical-orange alert with `AlertTriangle`, severity tag, message, suggested fix.
- `components/EvidenceLedger.tsx` — three-card horizontal ledger strip with tier badges and `FileText` study-count icon.
- `app/api/og/route.ts` — Edge-runtime `next/og` image generator, 1200×630, base64url verdict + comma list of supplements.

## Modified files

- `lib/types.ts` — added `ConflictSeverity`, `ConflictFlag`; changed `Recommendation.goalConflict` to `ConflictFlag | null`.
- `lib/engine.ts` — replaced inline `detectGoalConflict` with imported `detectConflict`; assigns its result to the recommendation.
- `components/ResultCard.tsx` — replaced inline conflict text with `<ConflictBanner />` rendered before the verdict; removed redundant inline conflict copy.
- `components/Hero.tsx` — mounted `<EvidenceLedger />` in the form column above `<AssessmentForm />`.
- `app/layout.tsx` — added Open Graph + Twitter card metadata pointing to `/api/og`.
- `app/page.tsx` — added route-level Open Graph + Twitter card metadata pointing to `/api/og`.
- `package.json` — no diff (no new runtime deps required by `next/og`; it ships with `next@14`).

## Notes

- `next/og` JSX rendering is implemented via `React.createElement` in `app/api/og/route.ts` because the locked filename ends in `.ts`, not `.tsx`. No tsconfig change required.
- Frozen files untouched: `lib/supplements.ts`, `app/globals.css`, `tailwind.config.ts`, `tsconfig.json`, `next.config.js`, `README.md`, `.env.example`.
