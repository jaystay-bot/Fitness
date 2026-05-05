# S1_LOCKED_010.md

**N:** 010 **Hat:** ARCHITECT **Status:** LOCKED — NO DRIFT ALLOWED **Predecessors:** S1_LOCKED.md · S1_LOCKED_002..S1_LOCKED_009.md (all still binding)

This document is *additive*. Prior locked contracts remain in force.

---

## SCOPE

Add a floating feedback widget on every page, the form panel it opens, an `/api/feedback/submit` endpoint that persists to a new `feedback_submissions` Supabase table, and a minimal env-password-gated `/admin/feedback` route. Strictly additive. The recommendation engine, supplements, conflicts, all prior cycle components, the Spear positioning sections, and the homepage layout are FROZEN.

## NEW FILES ALLOWED THIS CYCLE (no others)

```
components/FeedbackWidget.tsx          floating button + slide-in panel
components/FeedbackForm.tsx            form inside the panel
app/api/feedback/submit/route.ts       POST endpoint (anon-allowed)
app/admin/feedback/page.tsx            env-password-gated admin view
lib/feedback.ts                        types + validation helpers
supabase/migrations/0003_feedback.sql  new table migration
```

## FILES MODIFIED THIS CYCLE (only these)

```
app/layout.tsx        mount <FeedbackWidget /> at the root inside <body>
                      so it appears on every page
lib/types.ts          add FeedbackSubmission type (additive)
.env.example          add ADMIN_PASSWORD placeholder
```

## FROZEN — DO NOT TOUCH

- `lib/engine.ts`, `lib/supplements.ts`, all other `lib/*` (`conflicts`, `variation`, `confidence`, `units`, `slug`, `timeline`, `timelineData`, `labParser`, `labMapping`, `scanner`, `voice`, `voiceParser`, `bodySystems`, `svgPositions`, `subscription`, `supabase`, `stripe`, `email`, `nutrition`, `verdict`, `spearCopy`)
- All API routes from N=001..N=009 (recommend / og / checkout / webhooks / subscription / email/result / labs/parse / labs/recompute / scanner/identify)
- `tailwind.config.ts`, `app/globals.css`, `postcss.config.js`, `next.config.js`, `tsconfig.json`, `middleware.ts`, `vercel.json`
- `app/page.tsx`, `app/r/[slug]/page.tsx`, `app/pricing/page.tsx`, `app/account/page.tsx`, sign-in/sign-up
- All N=001..N=009 components (Hero, AssessmentForm, ResultCard, EvidenceLedger, ConflictBanner, EmailCapture, UpgradeButton, AccountMenu, ProGate, UnitToggle, all motion components, all N=007 lab/scanner components, all N=008 voice/body/timeline components, SpearHero/SymptomEntry/VaultDashboard/UninsuranceThesis)
- All Supabase migrations 0001 + 0002, all Python files

## DATABASE SCHEMA — `supabase/migrations/0003_feedback.sql`

```sql
CREATE TABLE feedback_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  user_email text,
  page_url text,
  user_agent text,
  submitted_at timestamptz DEFAULT now()
);

ALTER TABLE feedback_submissions ENABLE ROW LEVEL SECURITY;

-- Anonymous (anon role) inserts allowed; the route handler uses the
-- service role server-side, so this policy makes either role acceptable.
CREATE POLICY "Anyone can insert feedback"
  ON feedback_submissions FOR INSERT
  WITH CHECK (true);

-- Reads only via service role (the admin page calls getSupabaseAdmin()).
-- No public select policy → anon clients cannot enumerate feedback.
```

## TYPE EXTENSIONS — `lib/types.ts`

```ts
export interface FeedbackSubmission {
  message: string;
  userEmail?: string | null;
  pageUrl?: string | null;
  userAgent?: string | null;
}
```

## FEEDBACK LIB — `lib/feedback.ts`

```ts
export const FEEDBACK_MAX_CHARS = 500;
export const FEEDBACK_MIN_CHARS = 1;
export function isValidFeedback(message: unknown): message is string;
export function isValidEmail(email: unknown): boolean;  // basic regex
```

Pure synchronous validation. No I/O.

## WIDGET CONTRACT — `components/FeedbackWidget.tsx`

- `'use client'`.
- `position: fixed` at `bottom: 24px; right: 24px` (with mobile-safe-area fallback).
- Closed state: small pill button with `lucide-react` `MessageSquare` icon and the text `Feedback` in mono. Background `bg-lime`, text `text-ink`. Locked palette only.
- Open state: panel mounted via React state. On mobile (`max-md`), panel slides up from the bottom (`fixed inset-x-4 bottom-4 max-h-[85vh] overflow-y-auto`). On desktop (`md`), panel slides in from the right (`fixed bottom-6 right-6 w-[360px]`). Inside the panel: `<FeedbackForm />` plus a Close button (lucide `X`).
- Panel dismiss: Close button OR outside click (capture on a backdrop or document-click handler that ignores clicks inside the panel).
- The widget mounts at the root inside `<body>` via `app/layout.tsx`, so it appears on every page including `/`, `/r/[slug]`, `/pricing`, `/account`, `/admin/feedback`, sign-in, sign-up.

## FORM CONTRACT — `components/FeedbackForm.tsx`

- `'use client'`.
- Three fields:
  - `<textarea>` labeled `What would you like to see added or changed?`, `maxLength={500}`, with a live char counter `{n}/500`.
  - `<input type="email">` labeled `Email (optional, only if you want a response)`.
  - `<button type="submit">` labeled `Send feedback`, `bg-lime text-ink`.
- On submit, POST `{ message, userEmail, pageUrl, userAgent }` to `/api/feedback/submit`. `pageUrl` from `window.location.href`, `userAgent` from `navigator.userAgent`.
- On 200, replace form with `<p class="font-serif text-xl">Got it. Thanks for the feedback.</p>`.
- On 400, render the server's error message in clinical-orange below the form.

## API CONTRACT — `app/api/feedback/submit/route.ts`

- POST. `runtime: "nodejs"`. `dynamic: "force-dynamic"`.
- Reads JSON body. Validates message (1–500 chars), optional email, optional pageUrl/userAgent strings.
- Inserts row into `feedback_submissions` via `getSupabaseAdmin()` from `lib/supabase.ts` (service role; bypasses RLS for the insert).
- Returns `{ ok: true, id: <uuid> }` on success, `{ error: "..." }` with 400 on validation failure, `{ error: "service_unavailable" }` with 503 if Supabase env is absent.
- No auth required. The widget is anonymous-friendly by design.

## ADMIN ROUTE — `app/admin/feedback/page.tsx`

- Server component.
- Reads `?password=...` from the URL search params (also accepts `x-admin-password` request header for non-browser access; URL is the primary path).
- Compares to `process.env.ADMIN_PASSWORD`. If absent or mismatched, renders a simple `Not authorized` page with no further detail.
- If authorized, queries `feedback_submissions` via `getSupabaseAdmin()` ordered by `submitted_at DESC`, renders each entry as a card showing message, optional email, page URL, and submission timestamp.

This is intentionally minimal admin auth for the user-testing phase. A full auth layer can ship later.

## ENV — `.env.example`

Append:

```
ADMIN_PASSWORD=
```

## ACCEPTANCE CRITERIA (Judge will verify all 8)

1. `npm install` succeeds. Zero new dependencies.
2. `npm run build` succeeds with zero errors.
3. `supabase/migrations/0003_feedback.sql` matches the contract spec byte-for-byte (CREATE TABLE + ENABLE RLS + INSERT policy).
4. Visiting `/` shows the floating Feedback button at bottom-right.
5. Tapping the Feedback button opens the FeedbackForm panel.
6. `POST /api/feedback/submit` with `{ message: "test feedback" }` returns `200 { ok: true }` (or `503` when Supabase env absent — the in-sandbox graceful path).
7. `POST /api/feedback/submit` with empty message returns `400`.
8. `GET /admin/feedback?password=<correct>` renders submitted feedback or an empty-state when no rows; `GET /admin/feedback` (no password) renders `Not authorized`.

## BANNED THIS CYCLE

- Any modification to a frozen file
- Any new runtime dependency
- Any change to engine, supplements, conflicts, scoring
- Any additional Supabase table beyond `feedback_submissions`
- `localStorage`, `sessionStorage`, `document.cookie`
- The string `"AI-powered"`
- `from-purple-` / `to-purple-` Tailwind classes
- Any new color outside the locked palette

## OPERATOR INSTRUCTIONS — Atomic commits per file group

```
1.  N=010 operator: add lib/feedback.ts validation helpers + types
2.  N=010 operator: add migration 0003_feedback + .env.example update
3.  N=010 operator: add /api/feedback/submit route
4.  N=010 operator: add FeedbackForm component
5.  N=010 operator: add FeedbackWidget floating button + panel
6.  N=010 operator: mount FeedbackWidget in app/layout.tsx
7.  N=010 operator: add /admin/feedback env-password-gated page
8.  N=010 operator: write A1_OUTPUT_010.md manifest
```

## HANDOFF

→ Sentinel reads this file and emits GATE: OPEN or GATE: BLOCK.
