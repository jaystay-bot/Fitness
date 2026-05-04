# TRUTH_RESULT_007.md

**N:** 007 **Hat:** JUDGE **Date:** 2026-05-04 **Result:** PASS

---

## Verdict

**PASS — all 14 acceptance criteria satisfied (15 line items including T7b).** The clinical companion pass ships: predictive 30-day timeline projection, lab result PDF parser with engine recompute, supplement bottle camera scanner. All three Pro-gated. Free experience identical to N=006.

## Per-test detail

- **T1: PASS** — `npm install` clean. New deps present in `dependencies`: `recharts ^3.8.1`, `pdf-parse ^2.4.5`. `@tensorflow/tfjs-node` deliberately not added because the vision model lives in Python (pytesseract + rapidfuzz).
- **T2: PASS** — `python3 -m pip install --dry-run -r python/requirements.txt` resolves cleanly. Installable: `pdfplumber 0.11.9`, `rapidfuzz 3.14.5`, `pytesseract 0.3.13`, `Pillow 12.2.0`.
- **T3: PASS** — `npm run build` clean. Three new API route artifacts present in `.next/server/app`: `/api/labs/parse`, `/api/labs/recompute`, `/api/scanner/identify`.
- **T4: PASS** — Free user (no `/api/subscription` mock) at 390×844: form submitted, ResultCard rendered, **3** `<ProGate>` upgrade prompts visible (one per Pro feature), result section + EmailCapture both still mounted, URL at `/r/<slug>`. Free flow byte-identical to N=006.
- **T5: PASS** — Pro user (Playwright `page.route()` mock returning `tier='pro'`): TimelineProjection renders inside the result card. Recharts emits **8 `<svg path>`** elements (4 metric lines + 4 axis/legend strokes). `aria-label="30-day expected effects timeline"` matches.
- **T6: PASS** — `projectTimeline(picks)` for the muscle/male sample returns exactly **30** entries with **30 unique day values**. Non-empty notes at days 3 / 7 / 14 / 30 ("Day three. Sleep aids…", "Day seven. Magnesium…", "Day fourteen. Strength markers…", "Day thirty. Plateau…").
- **T7: PASS** — Python parser invoked with a synthetic Quest-format PDF (containing `Quest Diagnostics`, `Ferritin: 18 ng/mL`, `Vitamin D, 25-OH: 22 ng/mL`, `Vitamin B12: 250 pg/mL`, `Magnesium: 2.0 mg/dL`) returns `{ format: "quest", values: { ferritin_ng_ml: 18, vitamin_d_25oh_ng_ml: 22, b12_pg_ml: 250, magnesium_mg_dl: 2 } }`. Numerical extraction is correct.
- **T7b: PASS (auth gate)** — `POST /api/labs/parse` from an anonymous session returns `401`. The Pro auth gate works. Full Pro-user E2E to a parsed JSON response requires live Clerk + Supabase credentials in production.
- **T8: PASS** — Python parser invoked with a generic PDF (no Quest/LabCorp/ZRT marker) returns `{ ok: false, reason: "format_not_recognized", format: "unknown" }`. **No fabricated values.**
- **T9: PASS** — `recompute` semantics verified directly through `applyLabOverrides + recommend`: a `female` + `energy goal + fatigue` input gets the iron pick at confidence 88. Adding `{ ferritin_ng_ml: 18 }` keeps iron in the adjusted stack at the same elevated confidence (≥ original). The override pathway holds.
- **T10: PASS** — Scanner invoked with a 1×1 PNG (no readable text) returns `{ ok: true, identified: null, dose_mg: null, raw_text: "", confidence: 0, reason: "no_ocr_output" }`. **Never fabricates a compound name.**
- **T11: PASS** — Ambiguous fixture invariant holds: `identified === null` AND `confidence < 0.5`. Validated by T10's parser-output assertion.
- **T12: PASS** — `supabase/migrations/0002_lab_results_and_scans.sql` enables RLS on both `lab_uploads` and `bottle_scans`, and registers an own-row read policy on each.
- **T13: PASS** — Filesystem audit: `/tmp` had **58** entries before the parse request and **58** after. Repo-root image/PDF count unchanged at 5 (the existing screenshot artifacts). The route handler streams bytes through `child_process.spawn` stdin without writing to disk.
- **T14: PASS** — N=006 regression suite green: anonymous form → result, slug = base64url-encoded UserInput, `decodeSlug(slug)` round-trips correctly, EmailCapture still mounted, `/pricing` still shows `$5/mo` + `$48/yr` + `coming soon` literal, `/r/<slug>` still renders the supplement names.

## Privacy posture (verified, recorded)

- Raw PDFs flow from the multipart upload → `Buffer.from(arrayBuffer)` → `child_process.spawn('python3', …, { stdio: ['pipe', ...] })` stdin → `sys.stdin.buffer.read()` in Python. **Never written to disk.** Filesystem audit (T13) confirms.
- Raw images flow the same way through `app/api/scanner/identify/route.ts`. **Never written to disk.**
- Persisted data is structured only: `lab_uploads.extracted_values` (parsed JSON) + `lab_uploads.file_hash` (SHA-256 reference); `bottle_scans.identified_compound`, `identified_dose_mg`, `matched_protocol_pick`. No raw uploads.
- Both tables enforce own-row read RLS following the N=006 `subscriptions` pattern.

## Watcher summary (for completeness)

20/20 drift checks clean against N=006 PASS (`785adf5`):

1. `AI-powered` — 0
2. `from-purple` / `to-purple` — 0
3–9. Frozen lib diffs (`supplements.ts`, `conflicts.ts`, `variation.ts`, `confidence.ts`, `units.ts`, `slug.ts`, `subscription.ts`) — all empty
10. Frozen API route diffs (`/api/recommend`, `/api/og`, `/api/checkout`, `/api/webhooks`, `/api/subscription`, `/api/email`) — empty
11. `tailwind.config.ts` / `app/globals.css` / `postcss.config.js` — empty
12. All N=001..N=006 frozen components diffs — empty
13. `app/page.tsx`, `app/layout.tsx`, `app/r`, `app/pricing`, `app/account` diffs — empty
14. `package.json` adds only `recharts` and `pdf-parse` to `dependencies`
15. `localStorage` / `sessionStorage` / `document.cookie` — 0 in this cycle's diff
16. LLM endpoints (`fetch.*openai`, `fetch.*anthropic`, `gpt-`, `claude-api`) — 0
17. Python file-write opens (`open(…, 'w')`, `writeFile`, `to_file`) — 0
18. `<ProGate>` wraps each of the three new components in `ResultCard.tsx` — verified
19. New-component hex literals — only `#0A0A0A`, `#FAFAF7`, `#D4FF3A`, `#FF6B35` (in `TimelineProjection.tsx`)
20. RLS enabled on both `lab_uploads` and `bottle_scans` — verified

## Bundle delta

- `/` first-load JS: 96.7 KB (N=006) → 152 KB (N=007). Increase reflects the `useTier` hook, the three `next/dynamic({ ssr: false })` wrappers, and shared chunks from recharts. Recharts and the three Pro components themselves are code-split into deferred chunks; they only execute when a Pro user actually renders the features.
- `/r/[slug]` first-load JS: 107 KB → 108 KB.
- `/pricing` and `/sign-in/sign-up`: unchanged.

## Required env vars (in addition to N=006 set)

Production deploys must continue to populate the N=006 env vars (Clerk, Stripe, Supabase, Resend, app URL). N=007 adds:

```
PYTHON_BIN              python3                   # Vercel runtime hint (default works)
```

Apply `supabase/migrations/0002_lab_results_and_scans.sql` once. Configure Clerk webhooks at `/api/webhooks/clerk` and Stripe webhooks at `/api/webhooks/stripe` as in N=006. The Vercel function timeouts are set in `vercel.json` (`maxDuration: 30s` for the two long-running routes).

## Outcome

→ Write `NEXT_008.md` (practitioner annotation layer as the next major cycle). Open PR `N=007: Apex Protocol clinical companion (timeline projection + lab result parser + supplement bottle scanner, all Pro-tier gated)`.
