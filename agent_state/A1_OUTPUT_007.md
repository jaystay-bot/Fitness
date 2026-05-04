# A1_OUTPUT_007.md

**N:** 007 **Hat:** OPERATOR **Status:** EMITTED

## New files

- `lib/timelineData.ts` — onset-of-effect curves keyed by supplement id (matching `lib/supplements.ts` ids + the 4 variation candidates from N=005). Per-metric `t50` / `tmax` / `plateau` plus a `nameToId` mapper that mirrors the engine's internal canonicalization.
- `lib/timeline.ts` — pure `projectTimeline(picks)` returning 30 daily points across 4 metrics (energy / focus / sleep / strength) using a logistic onset curve (f(t50)=0.5, f(tmax)≈0.95). Generates a per-day `note` from the metric with the largest delta.
- `python/parse_labs.py` — stdin-fed PDF parser (no disk writes). Format-aware (Quest / LabCorp / ZRT). Targets ferritin, vitamin D 25-OH, B12, magnesium, total cholesterol, HDL, LDL, triglycerides, fasting glucose, HbA1c. Returns `{ ok, format, values, reason? }` JSON. Refuses to fabricate values when format is unknown.
- `python/scan_bottle.py` — stdin-fed image OCR + fuzzy match against the supplement id list. Returns `{ ok, identified, dose_mg, raw_text, confidence }`. Returns `{ identified: null, confidence < 0.5 }` when no match clears threshold.
- `python/requirements.txt` — `pdfplumber`, `rapidfuzz`, `pytesseract`, `Pillow`.
- `lib/labParser.ts` — `parseLabPdf(bytes)` → spawns the Python parser via `child_process.spawn`, pipes bytes via stdin, validates each numeric value against physiological plausibility ranges (rejects out-of-range as parse errors). Graceful `service_unavailable` when Python is not installed.
- `lib/labMapping.ts` — `applyLabOverrides(input, labs)` translates lab values into `UserInput` enum overrides (ferritin < 30 ng/ml + female → `symptomToFix='fatigue'`, vit D < 30 → `'fatigue'` if currently `'none'`, B12 < 300 → `'brain-fog'`). Plus `describeOverrides` for UI messaging.
- `lib/scanner.ts` — `scanBottleImage(bytes)` → spawns `python/scan_bottle.py` via stdin pipe.
- `app/api/labs/parse/route.ts` — POST multipart `file`. Auth required. Pro-only. SHA-256 hash for dedup reference. Optional persistence to `lab_uploads` (Supabase). Returns 503 if Python is not installed; 422 if format unrecognized; 200 with structured values on success. **Raw PDF bytes never written to disk.**
- `app/api/labs/recompute/route.ts` — POST `{ slug, labValues }`. Auth + Pro-only. Calls `applyLabOverrides` + `recommend` to produce both original and lab-adjusted recommendations, returns side-by-side `{ original, adjusted, overrides[], deltas }`.
- `app/api/scanner/identify/route.ts` — POST multipart `file`. Auth + Pro-only. Spawns scanner, optionally compares against an uploaded `protocol` JSON list to mark `matched_protocol_pick`. Optional persistence to `bottle_scans`. **Raw image bytes never written to disk.**
- `components/TimelineProjection.tsx` — `'use client'`. `recharts` `LineChart` rendering 30 daily points with hover tooltips and a live note paragraph that reflects the active day. Uses only locked-palette colors via inline strokes.
- `components/LabUpload.tsx` — `'use client'`. PDF drag-drop / file picker. Posts to `/api/labs/parse` then `/api/labs/recompute`. Surfaces parse errors clearly and renders `<LabComparison />` on success.
- `components/LabComparison.tsx` — server-component-safe side-by-side recommendation diff with extracted lab values, override notes, and added/removed/confidence-shift summary.
- `components/BottleScanner.tsx` — `'use client'`. `getUserMedia` for camera + `<input type="file" capture="environment">` fallback. Single-tap capture, draws current frame to a canvas, posts to `/api/scanner/identify`. Renders `<ScanResult />`.
- `components/ScanResult.tsx` — three render states (`match`/`mismatch`/`unknown`) with lucide-react `Check` / `AlertTriangle` / `HelpCircle` icons in lime / clinical / paper-50 respectively.
- `supabase/migrations/0002_lab_results_and_scans.sql` — adds `lab_uploads` and `bottle_scans` tables. Both have `ENABLE ROW LEVEL SECURITY` and an own-row read policy following the N=006 `subscriptions` pattern.
- `vercel.json` — function maxDuration overrides for the three new long-running Python-backed routes; `PYTHON_BIN=python3` build env hint.

## Modified files

- `lib/types.ts` — added `LabValues`, `ParsedLabResponse`, `ScanIdentification`, `ScanMatch`, `BottleMatch`. `UserInput`, `Recommendation`, `SupplementPick` shapes unchanged.
- `lib/engine.ts` — `recommend` signature gains optional `labValues?: LabValues` parameter. The parameter is currently unused inside the function (semantic overrides happen via `applyLabOverrides` before calling `recommend`); the parameter is reserved for downstream auditing. Behavior is byte-identical to N=006 when called as `recommend(input)`.
- `components/ResultCard.tsx` — adds three Pro features below the existing stack section, each wrapped in `<ProGate userTier={tier} feature="…">…</ProGate>`. Internal `useTier()` hook fetches `/api/subscription`; defaults to `'free'` for anonymous and unconfigured environments. All three Pro components use `next/dynamic({ ssr: false })` so their code lazy-loads.
- `package.json` — added `recharts ^3.8.1` and `pdf-parse ^2.4.5` as dependencies. `@tensorflow/tfjs-node` was explicitly **not** added because the vision model lives in Python (pytesseract + rapidfuzz), not on the Node side; keeping the Node bundle small.
- `README.md` — appended a "Pro features (N=007)" section documenting the three additions and the Python-runtime install command.

## Frozen — untouched this cycle

- `lib/supplements.ts`, `lib/conflicts.ts`, `lib/variation.ts`, `lib/confidence.ts`, `lib/units.ts`, `lib/slug.ts`, `lib/subscription.ts`, `lib/nutrition.ts`, `lib/verdict.ts`, `lib/supabase.ts`, `lib/stripe.ts`, `lib/email.ts`
- `app/api/recommend/route.ts`, `app/api/og/route.ts`, `app/api/checkout/route.ts`, `app/api/webhooks/stripe/route.ts`, `app/api/webhooks/clerk/route.ts`, `app/api/subscription/route.ts`, `app/api/email/result/route.ts`
- `tailwind.config.ts`, `app/globals.css`, `postcss.config.js`, `next.config.js`, `tsconfig.json`, `middleware.ts`, `.env.example`
- `app/page.tsx`, `app/layout.tsx`, `app/r/[slug]/page.tsx`, `app/pricing/page.tsx`, `app/account/page.tsx`, `app/sign-in/[[...sign-in]]/page.tsx`, `app/sign-up/[[...sign-up]]/page.tsx`
- All N=001..N=006 components except `ResultCard.tsx`
- `supabase/migrations/0001_subscriptions.sql`

## Privacy posture

- Raw PDF bytes flow from the multipart upload directly into `child_process.spawn`'s stdin and are discarded when the Python process exits. **No `fs.writeFile` to `/tmp` or anywhere else in the route handlers.**
- Raw image bytes flow the same way. The `<canvas>` capture in `BottleScanner.tsx` produces a `Blob` that becomes a `File` in the FormData upload — no IndexedDB, no localStorage, no disk write.
- Persisted data is structured only: `lab_uploads.extracted_values` (the parsed JSON) + `lab_uploads.file_hash` (SHA-256 reference); `bottle_scans.identified_compound`, `identified_dose_mg`, `matched_protocol_pick`. No raw uploads.

## Notes

- The Python services use `child_process.spawn` invocation rather than the `@vercel/python` builds-config pattern. This keeps the App Router build clean and avoids the `vercel.json builds` legacy config that disables Vercel's automatic detection. On Vercel Node lambdas, `python3` is available; production deploys should set `PYTHON_BIN` if the runtime image uses a different name.
- TypeScript build is clean. The home page first-load JS grows from 96.7 KB → 152 KB this cycle because the home `/` route's React tree now includes the `useTier` hook and the dynamic-import wrappers for the three Pro components. The Pro component code itself is in deferred chunks (`next/dynamic({ ssr: false })`) so it's only fetched if/when a user actually has Pro features rendering. The N=005 200 KB cap was a one-time measurement, not a cycle-over-cycle invariant.
- The engine's `labValues` parameter is intentionally inert; it documents the override entry-point and lets future cycles add audit metadata without another signature change.
