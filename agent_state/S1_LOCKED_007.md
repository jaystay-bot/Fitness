# S1_LOCKED_007.md

**N:** 007 **Hat:** ARCHITECT **Status:** LOCKED — NO DRIFT ALLOWED **Predecessors:** S1_LOCKED.md · S1_LOCKED_002..S1_LOCKED_006.md (all still binding)

This document is *additive*. Prior locked contracts remain in force.

---

## SCOPE — THREE PRO-TIER ADDITIONS, NOTHING ELSE

1. **Timeline projection** — pure TS, deterministic per-day expected effects across 30 days driven by an onset-of-effect table.
2. **Lab result parser + recompute** — Python PDF parser invoked from Node, mapped to engine input overrides, side-by-side recommendation comparison.
3. **Supplement bottle scanner** — Python OCR + fuzzy match against the existing supplement table, camera-or-file capture, match/mismatch/unknown result.

All three features gate on the Pro tier via the existing `<ProGate>` component shipped in N=006. The free experience is unchanged.

## NEW FILES ALLOWED THIS CYCLE (no others)

```
lib/timeline.ts                        pure projection function
lib/timelineData.ts                    onset-of-effect table per supplement id
lib/labParser.ts                       TS binding to Python parser via spawn
lib/labMapping.ts                      lab values → UserInput overrides
lib/scanner.ts                         TS binding to Python scanner via spawn
python/parse_labs.py                   PDF text extraction + format-aware regex
python/scan_bottle.py                  OCR + fuzzy match against supplement table
python/requirements.txt                pdfplumber + rapidfuzz + pytesseract + pillow
app/api/labs/parse/route.ts            POST multipart upload → parse → JSON
app/api/labs/recompute/route.ts        POST { slug, labValues } → side-by-side
app/api/scanner/identify/route.ts      POST multipart image → identify → JSON
components/TimelineProjection.tsx      30-day chart (recharts)
components/LabUpload.tsx               drag-drop + comparison trigger
components/LabComparison.tsx           side-by-side recommendation diff
components/BottleScanner.tsx           camera + file fallback capture
components/ScanResult.tsx              match / mismatch / unknown render
supabase/migrations/0002_lab_results_and_scans.sql
vercel.json                            Vercel Python runtime config
```

## FILES MODIFIED THIS CYCLE (only these)

```
components/ResultCard.tsx       mount three ProGate-wrapped components below the existing stack
lib/engine.ts                   accept optional labValues parameter that overrides
                                corresponding self-reported fields when present
lib/types.ts                    add LabValues, TimelinePoint, ScanResult, BottleMatch
package.json                    add recharts and pdf-parse only
README.md                       append "Pro Features" section, ≤ 15 lines
```

## FROZEN — DO NOT TOUCH

- `lib/supplements.ts`, `lib/conflicts.ts`, `lib/variation.ts`, `lib/confidence.ts`, `lib/units.ts`, `lib/slug.ts`, `lib/subscription.ts`, `lib/nutrition.ts`, `lib/verdict.ts`, `lib/supabase.ts`, `lib/stripe.ts`, `lib/email.ts`
- `app/api/recommend/route.ts`, `app/api/og/route.ts`, `app/api/checkout/route.ts`, `app/api/webhooks/stripe/route.ts`, `app/api/webhooks/clerk/route.ts`, `app/api/subscription/route.ts`, `app/api/email/result/route.ts`
- `tailwind.config.ts`, `app/globals.css`, `postcss.config.js`, `next.config.js`, `tsconfig.json`, `middleware.ts`, `.env.example`
- `components/Hero.tsx`, `components/AssessmentForm.tsx`, `components/EvidenceLedger.tsx`, `components/ConflictBanner.tsx`, `components/EmailCapture.tsx`, `components/UpgradeButton.tsx`, `components/AccountMenu.tsx`, `components/ProGate.tsx`, `components/VerdictReveal.tsx`, `components/EvidenceBar.tsx`, `components/ParallaxLedger.tsx`, `components/SupplementBottle3D.tsx`, `components/ConfidenceBadge.tsx`, `components/Footer.tsx`, `components/HowItWorks.tsx`, `components/Differentiators.tsx`, `components/Verdict.tsx`, `components/EvidenceTier.tsx`, `components/UnitToggle.tsx`
- `app/page.tsx`, `app/layout.tsx`, `app/r/[slug]/page.tsx`, `app/pricing/page.tsx`, `app/account/page.tsx`, `app/sign-in/[[...sign-in]]/page.tsx`, `app/sign-up/[[...sign-up]]/page.tsx`
- `supabase/migrations/0001_subscriptions.sql`

## DATABASE SCHEMA ADDITIONS — `supabase/migrations/0002_lab_results_and_scans.sql`

```sql
CREATE TABLE lab_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id text NOT NULL REFERENCES subscriptions(clerk_user_id),
  upload_date timestamptz DEFAULT now(),
  extracted_values jsonb NOT NULL,
  file_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lab_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own lab uploads"
  ON lab_uploads FOR SELECT
  USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE TABLE bottle_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id text NOT NULL REFERENCES subscriptions(clerk_user_id),
  scan_date timestamptz DEFAULT now(),
  identified_compound text,
  identified_dose_mg integer,
  matched_protocol_pick boolean,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bottle_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own bottle scans"
  ON bottle_scans FOR SELECT
  USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');
```

**Privacy posture:** raw PDFs and raw images NEVER persist. Only structured `extracted_values` and `identified_compound`/`identified_dose_mg` are stored, and only for Pro users. Files are deleted (or never written) immediately after processing.

## TIMELINE PROJECTION CONTRACT — `lib/timeline.ts`

```ts
export interface TimelinePoint {
  day: number;       // 1..30
  energy: number;    // 0..100 cumulative effect
  focus: number;
  sleep: number;
  strength: number;
  note: string;      // one-line, what to expect by this day
}

export function projectTimeline(picks: SupplementPick[]): TimelinePoint[];
```

Pure synchronous function. No randomness. No fetch. Returns exactly 30 entries (day 1..30). Per-supplement onset-of-effect curves come from `lib/timelineData.ts`. The 4 metrics are summed across active supplements at each day, normalized to a 0..100 scale, and the `note` is generated by template based on which metrics changed most that day.

`lib/timelineData.ts` exports `ONSET_CURVES: Record<string, OnsetCurve>` keyed by supplement id (matching `lib/supplements.ts` ids plus the variation candidates). Each curve declares per-metric `t50` (days to half-max effect), `tmax` (days to plateau), and the four metric magnitudes at plateau. Reference doses literature inline as comments only — no fabricated PMIDs.

## LAB PARSING CONTRACT

`python/parse_labs.py`:
- Reads PDF bytes from stdin (so the Node spawn can pipe an in-memory upload without writing to disk).
- Uses `pdfplumber` to extract text.
- Format-aware regex extraction for Quest, LabCorp, ZRT label patterns.
- Targets these markers: `ferritin_ng_ml`, `vitamin_d_25oh_ng_ml`, `b12_pg_ml`, `magnesium_mg_dl`, `total_cholesterol_mg_dl`, `hdl_mg_dl`, `ldl_mg_dl`, `triglycerides_mg_dl`, `glucose_fasting_mg_dl`, `hba1c_pct`.
- Outputs JSON to stdout: `{ format: "quest"|"labcorp"|"zrt"|"unknown", values: { … }, units: { … }, ranges: { … }, ok: bool, reason?: string }`.
- On unrecognized format: `{ ok: false, reason: "format_not_recognized" }`. **Never fabricates values.**

`lib/labParser.ts` invokes the Python script via `child_process.spawn`, pipes the PDF bytes via stdin, parses stdout JSON. Validates each numeric value against physiological plausibility ranges and rejects out-of-range as parse errors.

`lib/labMapping.ts` maps validated lab values to engine input overrides:
- Ferritin < 30 ng/ml AND `sex === 'female'` → `symptomToFix = 'fatigue'` and the iron consideration becomes mandatory regardless of self-report.
- Vitamin D 25-OH < 30 ng/ml → `symptomToFix = 'fatigue'` (if currently 'none') and Vitamin D priority elevates.
- B12 < 300 pg/ml → `symptomToFix = 'brain-fog'` (if currently 'none' or 'fatigue') and B12 forces into the stack.

`app/api/labs/parse/route.ts`:
- POST multipart `file` field. Auth required via Clerk `auth()`.
- Pro-only: checks `subscriptions.tier === 'pro'`; returns 403 otherwise.
- Reads file into memory (no disk write).
- Computes SHA-256 hash for dedup / replay reference.
- Spawns Python parser, pipes bytes via stdin, awaits stdout JSON.
- Validates physiological plausibility; returns 422 with `{error: "values_implausible"}` on fail.
- Returns parsed values JSON.
- Optional persistence: if Supabase configured, inserts into `lab_uploads` with the file hash and extracted values.

`app/api/labs/recompute/route.ts`:
- POST `{ slug, labValues }`.
- Decodes slug via `decodeSlug` from `lib/slug.ts`.
- Calls `recommend(decoded)` → `original`.
- Calls `recommend(decoded, labValues)` → `adjusted` (engine accepts the new optional second parameter).
- Returns `{ original, adjusted, deltas: { addedSupplements: [...], removedSupplements: [...], confidenceDeltas: [...] } }`.

## BOTTLE SCANNER CONTRACT

`python/scan_bottle.py`:
- Reads image bytes from stdin.
- Uses `pytesseract` for OCR.
- Fuzzy-matches the OCR output against a hard-coded list of supplement names (mirroring `lib/supplements.ts` ids + the variation candidates) using `rapidfuzz`.
- Extracts dose by regex `(\d+(?:\.\d+)?)\s*(mg|mcg|g|iu|IU)`.
- Returns `{ ok: true, identified: "creatine"|"vitamin-d3"|…|null, dose_mg: int|null, raw_text: string, confidence: 0..1 }`.
- Returns `{ ok: true, identified: null, confidence: <0.5 }` when no compound matches above threshold (do not guess).

`lib/scanner.ts` invokes the Python via `child_process.spawn` with image bytes piped through stdin.

`app/api/scanner/identify/route.ts`:
- POST multipart `file` field. Auth required. Pro-only.
- Reads image bytes into memory (no disk write).
- Spawns Python scanner.
- Returns the structured identification.
- Optional persistence to `bottle_scans` for Pro users with `matched_protocol_pick: bool`.

`components/BottleScanner.tsx`:
- `'use client'`. Requests `getUserMedia` for camera with `facingMode: 'environment'`.
- Single-tap capture (no continuous streaming). On tap, draws the current video frame to a canvas, converts to a `File`, posts to `/api/scanner/identify`.
- File-input fallback (`<input type="file" accept="image/*" capture="environment" />`) for users who decline camera.
- Renders `<ScanResult />` when a response arrives.

`components/ScanResult.tsx`:
- Three states by `match` value: lime (match), clinical-orange (mismatch), paper-white-50 (unknown).
- Shows the identified compound and dose, the protocol pick it was compared against, and a one-line recommendation. No emojis. lucide-react `Check`/`AlertTriangle`/`HelpCircle` icons only.

## PRO GATING

All three new components mount in `ResultCard.tsx` wrapped in `<ProGate userTier={…} feature="…">…</ProGate>`. ResultCard fetches the current user's tier via `/api/subscription` on mount (returns `tier: 'free'` if anonymous or unconfigured Clerk). Free users see the existing inline upgrade prompt from `ProGate`; Pro users see the actual feature.

The N=006 `<ProGate>` is unchanged.

## ENGINE EXTENSION — `lib/engine.ts`

Signature change:
```ts
export function recommend(input: UserInput, labValues?: LabValues): Recommendation;
```

When `labValues` is undefined, behavior is byte-identical to N=005/N=006. When provided, `labValues` is passed through `applyLabOverrides(input, labValues)` from `lib/labMapping.ts` to derive an effective `UserInput`, and `recommend` runs on that. **Determinism is preserved**: the same `(input, labValues)` produces the same `Recommendation`.

## ACCEPTANCE CRITERIA (Judge will verify all 14)

1. `npm install` succeeds. New deps: `recharts`, `pdf-parse`. (`@tensorflow/tfjs-node` optional and **not added** because the vision model lives in Python — explicitly noted in A1_OUTPUT_007.md.)
2. `python/requirements.txt` is installable (verified via `python3 -m pip install --dry-run -r python/requirements.txt` or equivalent).
3. `npm run build` succeeds with zero errors.
4. Free user sees the standard ResultCard plus three inline `<ProGate>` upgrade prompts where Timeline / LabUpload / BottleScanner would otherwise render. Existing free flow unchanged.
5. Mocked Pro user (subscription mock) sees `<TimelineProjection />` rendering 30 days of data via recharts.
6. `projectTimeline(picks)` for the muscle/male sample returns 30 entries with non-empty `note` at days 3, 7, 14, 30.
7. POST `/api/labs/parse` with a fixture Quest-format PDF returns extracted values for `ferritin_ng_ml`, `vitamin_d_25oh_ng_ml`, `b12_pg_ml`. (In sandbox: Python service may not be installed; the route returns a structured `service_unavailable` response and the test asserts that path; in production the route returns parsed values.)
8. POST `/api/labs/parse` with an unrecognized format returns `{error: "format_not_recognized"}` (or `service_unavailable` in sandbox without Python deps).
9. POST `/api/labs/recompute` with `labValues = { ferritin_ng_ml: 18 }` and a `slug` for a menstruating-female + fatigue input forces iron into the adjusted stack with elevated confidence.
10. POST `/api/scanner/identify` with a fixture image returns the correct compound for known fixtures (or `service_unavailable` when Python is not installed in sandbox).
11. POST `/api/scanner/identify` with an ambiguous fixture returns `{ identified: null, confidence: < 0.5 }`.
12. Both new tables in migration `0002` have `ENABLE ROW LEVEL SECURITY` and an own-row policy.
13. Filesystem audit: after invoking the parse and identify routes, no PDF or image file persists in `/tmp` or in the repo root (verified by `find` before/after).
14. N=006 acceptance suite passes as regression: anonymous flow → result, slug history, EmailCapture, `/pricing`, Stripe checkout auth gate, all the way through.

## BANNED THIS CYCLE (Watcher will check)

1. Any modification to a frozen file.
2. Any persistent storage of raw uploaded files.
3. Any external paid API (OpenAI, Anthropic, Google Vision, AWS Textract, etc.).
4. Any new Pro feature that gates currently-free functionality.
5. Any change to the engine signature beyond the documented optional `labValues` parameter.
6. `localStorage`, `sessionStorage`, `document.cookie` outside library internals.
7. The string `"AI-powered"`.
8. `from-purple-` / `to-purple-` Tailwind classes.
9. Any new color outside the locked palette in any new component.
10. Any analytics SDK.
11. Any modification to `lib/supplements.ts`.

## OPERATOR INSTRUCTIONS — Thirteen atomic commits

```
1.  N=007 operator: add timelineData onset-of-effect table
2.  N=007 operator: add lib/timeline.ts pure projection function
3.  N=007 operator: add Python lab parser with format detection
4.  N=007 operator: add lab parser API routes and TS bindings
5.  N=007 operator: add Python bottle scanner service
6.  N=007 operator: add scanner API route and TS bindings
7.  N=007 operator: add database migration 0002 for labs and scans
8.  N=007 operator: add TimelineProjection, LabUpload, LabComparison components
9.  N=007 operator: add BottleScanner and ScanResult components
10. N=007 operator: integrate three components into ResultCard via ProGate
11. N=007 operator: extend engine with optional labValues parameter
12. N=007 operator: configure Vercel Python runtime
13. N=007 operator: write A1_OUTPUT_007.md manifest
```

## HANDOFF

→ Sentinel reads this file and emits GATE: OPEN or GATE: BLOCK.
