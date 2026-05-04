# S1_LOCKED_006.md

**N:** 006 **Hat:** ARCHITECT **Status:** LOCKED — NO DRIFT ALLOWED **Predecessors:** S1_LOCKED.md · S1_LOCKED_002.md · S1_LOCKED_003.md · S1_LOCKED_004.md · S1_LOCKED_005.md (all still binding)

This document is *additive*. Prior locked contracts remain in force.

---

## SCOPE — SIX LAUNCH-READINESS ADDITIONS

1. Shareable result at `/r/[slug]`, base64url-encoded `UserInput`. No DB lookup.
2. Clerk email-only sign-up and sign-in.
3. Stripe Checkout for $5/month or $48/year.
4. Minimal Supabase `subscriptions` table.
5. Post-result email capture (Resend).
6. `/pricing` page with explicit "coming soon" labels for unshipped Pro features.

The free recommendation experience is **unchanged**.

## NEW FILES ALLOWED THIS CYCLE (no others)

```
lib/slug.ts                            base64url encode/decode UserInput
lib/supabase.ts                        admin + browser client factories
lib/stripe.ts                          server-side Stripe client
lib/subscription.ts                    pure tier-gating helpers
lib/email.ts                           Resend transactional sender
app/r/[slug]/page.tsx                  shareable result page (server component)
app/sign-in/[[...sign-in]]/page.tsx    Clerk sign-in page
app/sign-up/[[...sign-up]]/page.tsx    Clerk sign-up page
app/pricing/page.tsx                   public pricing page
app/account/page.tsx                   minimal account dashboard
app/api/checkout/route.ts              Stripe Checkout session creator
app/api/webhooks/stripe/route.ts       Stripe webhook handler
app/api/webhooks/clerk/route.ts        Clerk user.created handler
app/api/subscription/route.ts          GET current subscription
app/api/email/result/route.ts          send result link via Resend
components/EmailCapture.tsx            post-result email form
components/UpgradeButton.tsx           subtle Pro upgrade CTA
components/ProGate.tsx                 conditional render wrapper
components/AccountMenu.tsx             header sign-in / UserButton toggle
middleware.ts                          Clerk auth middleware
supabase/migrations/0001_subscriptions.sql
```

## FILES MODIFIED THIS CYCLE (only these)

```
components/ResultCard.tsx       mount EmailCapture below warnings; UpgradeButton below 30-day plan
components/Hero.tsx             mount AccountMenu top-right; on result, replace URL via window.history with /r/[slug]
app/page.tsx                    add OG metadata fallback (no other change; ClerkProvider lives in layout.tsx)
app/layout.tsx                  wrap children with ClerkProvider (conditional on Clerk env present); add default OG fallback
lib/types.ts                    add SubscriptionTier, SubscriptionStatus, ShareableResult, EmailCapturePayload
package.json                    add @clerk/nextjs, stripe, @supabase/supabase-js, resend
.env.example                    add CLERK / STRIPE / SUPABASE / RESEND placeholder vars
README.md                       append "Deploying to production" env-var checklist
```

The contract's literal phrasing for `app/page.tsx` ("on form submit, update window.history with /r/[slug] URL") is not implementable in a server component; the equivalent client behavior lives in `Hero.tsx` (which is in the modify-allowed list and already manages submission state). This is a faithful interpretation, not scope drift.

## FROZEN — DO NOT TOUCH

- `lib/engine.ts`, `lib/supplements.ts`, `lib/conflicts.ts`, `lib/variation.ts`, `lib/confidence.ts`, `lib/units.ts`, `lib/nutrition.ts`, `lib/verdict.ts`
- `app/api/recommend/route.ts`, `app/api/og/route.ts`
- `tailwind.config.ts`, `app/globals.css`, `postcss.config.js`
- `components/AssessmentForm.tsx`, `components/UnitToggle.tsx`, `components/EvidenceLedger.tsx`, `components/ConflictBanner.tsx`, `components/VerdictReveal.tsx`, `components/EvidenceBar.tsx`, `components/ParallaxLedger.tsx`, `components/SupplementBottle3D.tsx`, `components/ConfidenceBadge.tsx`, `components/Footer.tsx`, `components/HowItWorks.tsx`, `components/Differentiators.tsx`, `components/Verdict.tsx`, `components/EvidenceTier.tsx`
- `next.config.js`, `tsconfig.json`, `.env.example` is touched but additively only

## SLUG CONTRACT — `lib/slug.ts`

```ts
export function encodeInput(input: UserInput): string;
export function decodeSlug(slug: string): UserInput | null;
```

- `encodeInput`: `Buffer.from(JSON.stringify(input)).toString('base64url')` (Node ≥18 supports `base64url` natively).
- `decodeSlug`: `Buffer.from(slug, 'base64url').toString('utf-8')` → `JSON.parse` inside `try/catch`. After parse, validate every field against the union types and numeric ranges from `lib/types.ts`. Return `null` on any mismatch. Pure synchronous.

## SHAREABLE PAGE CONTRACT — `app/r/[slug]/page.tsx`

- Server component. `decodeSlug(params.slug)`; if null, render fallback with link to `/`. Otherwise call `recommend(decoded)` and render `<ResultCardWithProvider />` (a thin client wrapper that supplies the user input alongside the result so the existing client `<ResultCard />` props match).
- Sets `metadata.openGraph.images` to `/api/og?v=<base64-verdict>&s=<top3-names>`.
- Renders identical content for anonymous and signed-in users.

## CLERK INTEGRATION

- Email-only authentication. Configure in Clerk dashboard.
- `app/layout.tsx` wraps children with `<ClerkProvider>` only when `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is present. When absent (local dev / build without Clerk), the layout renders without the provider so the free experience continues to work.
- `app/sign-in/[[...sign-in]]/page.tsx` and `app/sign-up/[[...sign-up]]/page.tsx` render Clerk's `<SignIn />` / `<SignUp />` with the locked palette via `appearance` prop.
- `middleware.ts` calls Clerk's `clerkMiddleware()` with public matchers for `/`, `/r/:path*`, `/pricing`, `/api/recommend`, `/api/og`, `/api/email/result`, `/api/webhooks/(.*)`. All other routes require auth.
- `/api/webhooks/clerk` listens for `user.created`, verifies the Svix signature using `CLERK_WEBHOOK_SECRET`, and inserts a `subscriptions` row with `tier='free'`.

## STRIPE INTEGRATION

- Two products configured in Stripe dashboard:
  - Apex Pro Monthly: $5.00/month → `STRIPE_PRICE_ID_MONTHLY`
  - Apex Pro Annual: $48.00/year → `STRIPE_PRICE_ID_ANNUAL`
- `/api/checkout` (POST) requires Clerk auth, reads body `{ interval: 'month' | 'year' }`, calls `stripe.checkout.sessions.create` with the appropriate price ID, `success_url=${origin}/account?upgraded=true`, `cancel_url=${origin}/pricing`. Returns `{ url }`.
- `/api/webhooks/stripe` reads raw body, verifies signature with `STRIPE_WEBHOOK_SECRET`, handles:
  - `checkout.session.completed` → upgrade row to `tier='pro'`, set `stripe_customer_id`, `stripe_subscription_id`, `status='active'`, `current_period_end`.
  - `customer.subscription.updated` → update `status` and `current_period_end`.
  - `customer.subscription.deleted` → downgrade row to `tier='free'`, `status='canceled'`.

## DATABASE — `supabase/migrations/0001_subscriptions.sql`

```sql
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id text UNIQUE NOT NULL,
  user_email text UNIQUE NOT NULL,
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  tier text NOT NULL DEFAULT 'free' CHECK (tier IN ('free','pro')),
  status text CHECK (status IN ('active','past_due','canceled','trialing')),
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscription"
  ON subscriptions FOR SELECT
  USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');
```

This is the **only** table this cycle. No supplement, input, or recommendation rows.

## EMAIL CAPTURE CONTRACT — `components/EmailCapture.tsx`

- `'use client'`. Props: `{ verdict: string; slug: string }`.
- Renders only when both `verdict` and `slug` are truthy. No internal `show` toggle; the parent controls mounting by mounting only after a recommendation exists.
- Headline (serif): "Want this protocol in your inbox?"
- Body (sans, single line): "We send your shareable result link and a one-time summary. No newsletter."
- One `<input type="email" required>` plus a button labeled "Email me my protocol" in lime.
- Below the button (11 px paper-white-60%): "We send one email then delete your address unless you create an account."
- POSTs `{ email, slug, verdict }` to `/api/email/result`. On 200 success, replaces the form with: "Sent. Check your inbox."

EmailCapture is **banned** from import in `Hero.tsx`, `AssessmentForm.tsx`, `app/page.tsx`, or any pre-result location. Watcher verifies it is imported only by `ResultCard.tsx`.

## EMAIL ROUTE CONTRACT — `app/api/email/result/route.ts`

- POST. Validates email with a strict regex. Returns 400 on bad email.
- Calls `sendResultEmail(email, verdict, slug)` from `lib/email.ts` which calls Resend's API via `fetch` (no SDK needed; Resend exposes a simple REST). The `lib/email.ts` keeps Resend usage server-only and behind an env-check that no-ops gracefully when `RESEND_API_KEY` is absent (returning `{ ok: false, reason: "missing-key" }`).
- Returns `{ ok: true }` on success.
- Email address is **not** stored anywhere this cycle.

## PRICING PAGE CONTRACT — `app/pricing/page.tsx`

Server component. Two columns side-by-side on desktop, stacked on mobile.

**Free** — currently shipped:
- Full personalized recommendation
- Evidence tier on every pick
- Confidence score on every pick
- Goal-conflict detection
- Shareable URL
- Email-to-self

**Pro** — $5/month or $48/year:
- Everything in Free
- Account history with unlimited recommendations across visits — **coming soon**
- 30-day protocol check-in — **coming soon**
- Clinician PDF export — **coming soon**
- Priority engine update notifications — **coming soon**

Every feature label that is not in this cycle's PR scope must be followed by the literal string `coming soon` in a clinical-orange tag. Watcher verifies this.

CTAs:
- Free column → "Start free" → links to `/`.
- Pro column → "Upgrade to Pro" button. If unauthenticated, button links to `/sign-in?redirect_url=/pricing`. If authenticated, button posts to `/api/checkout` with `interval`.

## ACCOUNT PAGE CONTRACT — `app/account/page.tsx`

- Authenticated route (middleware enforces). Renders the user's Clerk email, current `tier` from the `subscriptions` table, `current_period_end` if present, and a "Manage subscription" link to a Stripe Customer Portal session URL (created on demand by a small server action).

## PRO GATE — `components/ProGate.tsx`

```tsx
<ProGate userTier="free|pro" feature="checkin|history|pdf|notifications">{children}</ProGate>
```

If `userTier === "pro"` (or the feature is unrestricted), render children. Otherwise render an inline `UpgradeButton` with the gating reason. **No** Pro feature is gated this cycle; the component is shipped but unused, ready for N=007.

## UPGRADE BUTTON — `components/UpgradeButton.tsx`

Subtle CTA mounted below the 30-day plan in `ResultCard`. Mono font, lime accent. Copy: "Save your protocol to your account — $5/mo or $48/yr." Links to `/pricing`. Not a banner, not a popup, not above the result.

## ACCEPTANCE CRITERIA (Judge will verify all 14)

1. `npm install` succeeds with `@clerk/nextjs`, `stripe`, `@supabase/supabase-js`, `resend` added.
2. `npm run build` succeeds with zero errors (with placeholder env vars supplied).
3. `supabase/migrations/0001_subscriptions.sql` is byte-equal to the contract spec and parses as valid PostgreSQL.
4. Anonymous Playwright session at 390×844: complete the form, see ResultCard, see EmailCapture, see UpgradeButton — all without sign-in.
5. POST `/api/email/result` with valid payload returns 200 (Resend mocked; assert call shape).
6. POST `/api/email/result` with invalid email returns 400.
7. After form submission, `window.location.pathname` matches `/^\/r\/[A-Za-z0-9_-]+$/`.
8. Visiting `/r/<known-good-slug>` in fresh anonymous browser context renders ResultCard with identical supplements (compared to a parallel `recommend(input)` call).
9. Visiting `/r/garbage` renders the fallback with a working link to `/`.
10. Sign-up flow (mocked Clerk webhook) creates a `subscriptions` row with `tier='free'`.
11. POST `/api/checkout` for an authenticated user (mocked) returns a Stripe session URL.
12. Stripe webhook test event for `checkout.session.completed` updates the row to `tier='pro'`.
13. `/pricing` renders with both tiers visible AND the literal text `"coming soon"` next to every Pro feature not yet shipped (history, check-in, PDF, notifications).
14. N=005 acceptance tests pass as regression: visual baseline (`h1>32`, body `rgb(10, 10, 10)`, CTA `rgb(212, 255, 58)`); engine determinism for the muscle/male sample; vegan B12 confidence ≥ 90.

## BANNED THIS CYCLE (Watcher will check)

1. Any modification to engine / supplements / conflicts / variation / confidence / units / nutrition / verdict modules.
2. Any modification to `app/api/recommend/route.ts` or `app/api/og/route.ts`.
3. Any modification to `tailwind.config.ts`, `app/globals.css`, `postcss.config.js`.
4. Any analytics SDK (PostHog / Mixpanel / Segment / GA / Plausible).
5. Any storage of user inputs or recommendations server-side. Only the `subscriptions` table.
6. Any popup or modal blocking the result.
7. Any social auth provider in Clerk (email-only).
8. Any Pro feature that gates currently-free functionality.
9. The string `"AI-powered"`.
10. `from-purple-` / `to-purple-` Tailwind classes.
11. Any new color outside the locked palette in any new component.
12. Any feature claim on `/pricing` that is not actually shipped this cycle (must carry the `coming soon` label).
13. `localStorage`, `sessionStorage`, `document.cookie` outside of Clerk / Stripe / Supabase library internals.

## OPERATOR INSTRUCTIONS — Thirteen atomic commits

```
1.  N=006 operator: add lib/slug.ts pure encoding
2.  N=006 operator: add lib/supabase.ts and migration 0001
3.  N=006 operator: add lib/stripe.ts and lib/subscription.ts
4.  N=006 operator: add Clerk integration and sign-in/sign-up pages
5.  N=006 operator: add Stripe checkout and webhook routes
6.  N=006 operator: add Clerk webhook for free-tier provisioning
7.  N=006 operator: add /pricing and /account pages
8.  N=006 operator: add EmailCapture, UpgradeButton, AccountMenu, ProGate
9.  N=006 operator: add /r/[slug] shareable route
10. N=006 operator: integrate components into ResultCard and Hero
11. N=006 operator: add lib/email.ts and /api/email/result route
12. N=006 operator: update README with deployment env var checklist
13. N=006 operator: write A1_OUTPUT_006.md manifest
```

## HANDOFF

→ Sentinel reads this file and emits GATE: OPEN or GATE: BLOCK.
