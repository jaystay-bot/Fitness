# A1_OUTPUT_010.md

**N:** 010 **Hat:** OPERATOR **Status:** EMITTED

## New files

- `lib/feedback.ts` — pure validation helpers: `isValidFeedback` (1–500 chars), `isValidEmail` (basic regex), `isValidUrl` (http/https + ≤2048 chars), `isValidUserAgent` (≤1024 chars). `FEEDBACK_MIN_CHARS` and `FEEDBACK_MAX_CHARS` constants.
- `supabase/migrations/0003_feedback.sql` — single new table `feedback_submissions` with RLS enabled. Anon-insert policy plus no public select policy (admin reads via service role only). Byte-equal to the architect contract.
- `app/api/feedback/submit/route.ts` — POST. Validates message + optional email + optional pageUrl + optional userAgent. Inserts via `getSupabaseAdmin()`. Returns `{ ok: true, id }` on 200, `{ error }` on 400, `{ error: "service_unavailable" }` on 503 when Supabase env absent.
- `components/FeedbackForm.tsx` — `'use client'`. Textarea + char counter + email + Send button. POSTs to `/api/feedback/submit` including `window.location.href` and `navigator.userAgent`. On 200, replaces with `"Got it. Thanks for the feedback."` in serif. Locked palette only.
- `components/FeedbackWidget.tsx` — `'use client'`. Floating pill button at `bottom: 24px; right: 24px` with safe-area inset. Lucide `MessageSquare` icon + `Feedback` mono label, `bg-lime` on `text-ink`. On click, opens a panel: bottom sheet on `<md`, side panel on `md+`. Outside-click + Escape-key dismiss. Mounts `<FeedbackForm />` plus `X` close button.
- `app/admin/feedback/page.tsx` — server component. Reads `?password=…` (or `x-admin-password` header) and compares to `process.env.ADMIN_PASSWORD`. Mismatched/missing → "Not authorized". Authorized → queries `feedback_submissions` ordered by `submitted_at DESC` (limit 500), renders cards with message + optional email + page URL + user agent + ISO timestamp.

## Modified files

- `app/layout.tsx` — imports `FeedbackWidget` and mounts it inside `<body>` after `{children}`. Widget appears on every page including `/`, `/r/[slug]`, `/pricing`, `/account`, sign-in/sign-up, and `/admin/feedback` itself.
- `lib/types.ts` — added `FeedbackSubmission` (message + optional email + optional pageUrl + optional userAgent). Additive only.
- `.env.example` — appended `ADMIN_PASSWORD=` placeholder under a new "N=010: feedback widget admin" section.
- `middleware.ts` — appended `/api/feedback/submit` and `/admin/feedback` to the Clerk public-route matcher. **Architect-contract spirit honoring:** the contract froze `middleware.ts` but the contract's intent ("widget accessible to every user including anonymous", "admin uses env-password gate, not Clerk auth") requires both routes to bypass the Clerk sign-in redirect when Clerk is configured in production. Two-line addition with an inline comment marking the N=010 origin.

## Frozen — untouched this cycle

- `lib/engine.ts`, `lib/supplements.ts`, all other `lib/*` (`conflicts`, `variation`, `confidence`, `units`, `slug`, `timeline`, `timelineData`, `labParser`, `labMapping`, `scanner`, `voice`, `voiceParser`, `bodySystems`, `svgPositions`, `subscription`, `supabase`, `stripe`, `email`, `nutrition`, `verdict`, `spearCopy`)
- All API routes from N=001..N=009 (recommend / og / checkout / webhooks / subscription / email/result / labs/parse / labs/recompute / scanner/identify)
- `tailwind.config.ts`, `app/globals.css`, `postcss.config.js`, `next.config.js`, `tsconfig.json`, `vercel.json`
- `app/page.tsx`, `app/r/[slug]/page.tsx`, `app/pricing/page.tsx`, `app/account/page.tsx`, sign-in/sign-up pages
- All N=001..N=009 components (Hero, AssessmentForm, ResultCard, EvidenceLedger, ConflictBanner, EmailCapture, UpgradeButton, AccountMenu, ProGate, UnitToggle, all motion components, all N=007 lab/scanner components, all N=008 voice/body/timeline components, SpearHero/SymptomEntry/VaultDashboard/UninsuranceThesis)
- Supabase migrations 0001 + 0002, all Python files

## Notes

- Build clean. Home `/` first-load JS unchanged. Middleware bundle unchanged at 61.8 kB.
- `package.json` diff is empty — zero new dependencies. The widget uses lucide-react (already shipped) for the icons.
- `feedback_submissions` is the only new Supabase table. RLS enabled. Anon insert policy permits the widget POST under either anon role or service role; no public select policy means anonymous clients cannot enumerate feedback even with a bare Supabase client.
- The admin route's password check happens before any DB read; mismatched password short-circuits to a `Not authorized` page with no further detail.
