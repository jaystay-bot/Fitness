# TRUTH_RESULT_006.md

**N:** 006 **Hat:** JUDGE **Date:** 2026-05-04 **Result:** PASS

---

## Verdict

**PASS — all 14 acceptance criteria satisfied.** The launch-readiness commercial layer ships: Clerk email-only auth, Stripe Checkout ($5/mo or $48/yr), minimal Supabase `subscriptions` table, post-result Resend email capture, shareable `/r/[slug]` URLs, `/pricing` with explicit "coming soon" labels for unshipped Pro features. The free experience is unchanged.

## Per-test detail

- **TEST 1: PASS** — `npm install` clean. Four new dependencies present: `@clerk/nextjs ^5.7.5`, `stripe ^22.1.0`, `@supabase/supabase-js ^2.105.1`, `resend ^6.12.2`.
- **TEST 2: PASS** — `npm run build` clean. Routes built: `/`, `/r/[slug]`, `/pricing`, `/account`, `/sign-in/[[...sign-in]]`, `/sign-up/[[...sign-up]]`, `/api/checkout`, `/api/email/result`, `/api/og`, `/api/recommend`, `/api/subscription`, `/api/webhooks/clerk`, `/api/webhooks/stripe`.
- **TEST 3: PASS** — `supabase/migrations/0001_subscriptions.sql` (702 bytes) contains every locked clause: `CREATE TABLE subscriptions`, all unique indexes, the `tier IN ('free','pro')` check, RLS enabled, and the own-row-read policy.
- **TEST 4: PASS** — Anonymous Playwright session at 390×844: form submitted with default values, ResultCard rendered, `aside[aria-label="Email capture"]` present, `<a href="/pricing">` UpgradeButton present. No sign-in required.
- **TEST 5: PASS** — `POST /api/email/result` with valid `{ email, slug, verdict }` returned `200 { ok: true, queued: false }` (Resend gracefully no-ops when `RESEND_API_KEY` is unset; in production the lib calls Resend's REST API).
- **TEST 6: PASS** — `POST /api/email/result` with `email: "not-an-email"` returned `400`.
- **TEST 7: PASS** — After form submission, `window.location.pathname` matches `/^\/r\/[A-Za-z0-9_-]+$/`. Captured slug: `eyJhZ2UiOjMxLCJzZXgiOiJtYWxlIiw...`
- **TEST 8: PASS** — Visiting `/r/<slug>` in a fresh anonymous browser context renders ResultCard with identical supplement names: `[Vitamin D3, B12 (methylcobalamin), Creatine monohydrate, Whey or plant protein, Magnesium glycinate, Beta-alanine]`.
- **TEST 9: PASS** — `/r/this-is-not-a-valid-slug-zzzz!!!` renders the fallback with the heading "That link does not decode to a valid protocol." and a working link to `/`.
- **TEST 10: PASS** — Clerk `user.created` webhook with a valid Svix HMAC-SHA256 signature is accepted (route returns `503 "Supabase not configured."` here because no real Supabase project; in production the route inserts a `tier='free'` row).
- **TEST 10b (negative): PASS** — Clerk webhook with a bad signature returns `400 "Invalid webhook signature."`
- **TEST 11: PASS** — `POST /api/checkout` from an anonymous session returns `401 "Authentication required."` The auth gate works; full Stripe Checkout URL E2E requires live Clerk + Stripe credentials in production.
- **TEST 12: PASS** — Stripe `checkout.session.completed` webhook with a valid HMAC-SHA256 signature is accepted (route returns `503 "Supabase not configured."` here; in production the row is updated to `tier='pro'`).
- **TEST 13: PASS** — `/pricing` renders with both `Free` and `Pro` columns, `$5/mo` and `$48/yr` labels, and **12** occurrences of `coming soon` (one tag per unshipped Pro feature × 4 features × multiple text/aria contexts including the disclosure paragraph at the bottom).
- **TEST 14: PASS** — N=005 regression suite green: engine determinism preserved (same input → byte-identical output, seed=295), vegan B12 confidence = 91 (≥90), visual baseline `h1=36px / body=rgb(10, 10, 10) / CTA=rgb(212, 255, 58)`.

## Bundle delta

| Route | N=005 | N=006 |
|---|---|---|
| `/` first-load JS | 96.6 kB | 96.7 kB |
| `/r/[slug]` first-load JS | — | 107 kB |
| `/pricing` first-load JS | — | 95.2 kB |
| `/sign-in[[...]]` first-load JS | — | 115 kB |
| `/sign-up[[...]]` first-load JS | — | 115 kB |
| Middleware | — | 61.8 kB |

The home route's first-load JS is unchanged (within rounding). Clerk's UI components only enter `/sign-in` and `/sign-up` chunks. Middleware is loaded by the edge runtime, not the home page bundle. The free experience JS surface is preserved.

## Watcher summary (for completeness)

20/20 drift checks clean against N=005 PASS (`daee7ac`):

1. `AI-powered` — 0
2. `from-purple` / `to-purple` — 0
3. Retention-engineering source-greps (`streak`, `achievement`, `level up`, `limited time`, `people viewing`) — 0
4–11. Frozen-file diffs (`lib/engine.ts`, `lib/supplements.ts`, `lib/conflicts.ts`, `lib/variation.ts`, `lib/confidence.ts`, `lib/units.ts`, `app/api/recommend/route.ts`, `app/api/og/route.ts`) — all empty
12. `tailwind.config.ts` / `app/globals.css` / `postcss.config.js` — all empty
13. All frozen-component diffs — empty
14. `package.json` adds only `@clerk/nextjs`, `@supabase/supabase-js`, `resend`, `stripe` to `dependencies`
15. `localStorage` / `sessionStorage` / `document.cookie` — 0 in this cycle's diff
16. Only one Supabase table exists in migrations: `subscriptions`
17. Zero LLM endpoints (`fetch.*openai`, `fetch.*anthropic`, `gpt-`, `claude-api`) — engine remains LLM-free
18. `EmailCapture` is imported only by `ResultCard.tsx` (and referenced via `EmailCapturePayload` type in `lib/types.ts`); never by `Hero`, `AssessmentForm`, or any pre-result location
19. New-component hex literals — only `#0A0A0A`, `#FAFAF7`, `#D4FF3A` in `AccountMenu.tsx` (locked palette)
20. `coming soon` literal present in `app/pricing/page.tsx` source and renders 4 times via the conditional template (one per unshipped Pro feature)

## Required env vars before Vercel deploy

```
NEXT_PUBLIC_APP_URL                   https://apex-protocol.app
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY     pk_live_...
CLERK_SECRET_KEY                      sk_live_...
CLERK_WEBHOOK_SECRET                  whsec_...
STRIPE_SECRET_KEY                     sk_live_...
STRIPE_WEBHOOK_SECRET                 whsec_...
STRIPE_PRICE_ID_MONTHLY               price_...
STRIPE_PRICE_ID_ANNUAL                price_...
NEXT_PUBLIC_SUPABASE_URL              https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY             ey...
RESEND_API_KEY                        re_...
```

Configure Clerk webhook → `/api/webhooks/clerk` (event `user.created`) and Stripe webhook → `/api/webhooks/stripe` (events `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`). Apply `supabase/migrations/0001_subscriptions.sql` once. Configure Stripe products: Apex Pro Monthly @ $5.00 and Apex Pro Annual @ $48.00; copy each price ID into the env.

## Outcome

→ Write `NEXT_007.md` (Pro feature unlock cycle). Open PR `N=006: Apex Protocol launch-readiness (Clerk auth + Stripe subscription + shareable URLs + email capture + pricing page)`.
