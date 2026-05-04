# A1_OUTPUT_006.md

**N:** 006 **Hat:** OPERATOR **Status:** EMITTED

## New files

- `lib/slug.ts` — pure `encodeInput` / `decodeSlug` over `Buffer.from(...).toString('base64url')`. Decode validates every UserInput field against the locked enums and numeric ranges; returns `null` on any mismatch.
- `lib/supabase.ts` — singleton admin client factory backed by `SUPABASE_SERVICE_ROLE_KEY`; returns `null` when env is incomplete so build/dev tolerate absent backend.
- `lib/stripe.ts` — server-side Stripe singleton (`apiVersion: "2026-04-22.dahlia"`); helpers for monthly / annual price IDs.
- `lib/subscription.ts` — pure `isProUser`, `canAccess(tier, feature)`, dollar formatter, monthly/annual price constants. No I/O.
- `lib/email.ts` — Resend sender behind env-check; `sendResultEmail(email, verdict, slug)` returns `{ ok, reason?, id? }`. HTML uses only locked-palette colors; gracefully reports `missing-key` when env absent.
- `app/r/[slug]/page.tsx` — server component. `decodeSlug` → `recommend()` → `<ResultCard shareSlug=... />`. Sets OG metadata pointing to `/api/og`. Renders fallback for invalid slugs.
- `app/sign-in/[[...sign-in]]/page.tsx` — Clerk `<SignIn />` themed to locked palette.
- `app/sign-up/[[...sign-up]]/page.tsx` — Clerk `<SignUp />` themed to locked palette.
- `app/pricing/page.tsx` — Free vs Pro columns. Pro features marked `coming soon` in clinical-orange tags except "Everything in Free". `<UpgradeButton variant="primary" />` triggers Stripe checkout for authenticated users; redirects to `/sign-in` for anonymous.
- `app/account/page.tsx` — authenticated route showing email, tier, status, period end, and links to `/` and `/pricing`.
- `app/api/checkout/route.ts` — POST. Reads `{ interval: 'month'|'year' }`. Auth required. Returns `{ url }` for Stripe Checkout session.
- `app/api/webhooks/stripe/route.ts` — POST. Verifies `stripe-signature` against `STRIPE_WEBHOOK_SECRET`. Handles `checkout.session.completed` (upgrades to Pro), `customer.subscription.updated` (status + period end), `customer.subscription.deleted` (downgrades to Free).
- `app/api/webhooks/clerk/route.ts` — POST. Verifies Svix signature via base64-decoded `CLERK_WEBHOOK_SECRET` and HMAC-SHA256. On `user.created`, upserts a `subscriptions` row with `tier='free'`.
- `app/api/subscription/route.ts` — GET. Auth required. Returns `{ tier, status, currentPeriodEnd }` for the current user.
- `app/api/email/result/route.ts` — POST. Validates email, slug, verdict; calls `sendResultEmail`; returns 200 on success or `{ ok: true, queued: false }` when Resend env absent (graceful degradation).
- `components/EmailCapture.tsx` — `'use client'` post-result email capture. Renders `null` when `verdict` or `slug` empty. POSTs to `/api/email/result`. Replaces with "Sent. Check your inbox." on success. Locked palette only.
- `components/UpgradeButton.tsx` — `'use client'`. `variant="subtle"` (small lime-bordered link to `/pricing`) for ResultCard. `variant="primary"` (full-width button posting to `/api/checkout`) for `/pricing`.
- `components/AccountMenu.tsx` — `'use client'`. Returns `null` when Clerk env absent. Renders Clerk `<SignedIn>` / `<SignedOut>` segments with locked-palette-themed `<UserButton />`.
- `components/ProGate.tsx` — server-safe wrapper. Calls `canAccess(tier, feature)`; renders children if accessible, otherwise an inline upgrade prompt. Shipped but unused this cycle (no Pro features yet to gate).
- `middleware.ts` — Clerk middleware with `/`, `/r/:path*`, `/pricing`, `/sign-in`, `/sign-up`, `/api/recommend`, `/api/og`, `/api/email/result`, `/api/webhooks/(.*)` declared public.
- `supabase/migrations/0001_subscriptions.sql` — exact schema from S1_LOCKED_006: `subscriptions` table with `clerk_user_id`, `user_email`, `stripe_customer_id`, `stripe_subscription_id`, `tier`, `status`, `current_period_end`, timestamps. RLS enabled with own-row-read policy.

## Modified files

- `components/ResultCard.tsx` — accepts optional `shareSlug` prop; mounts `<UpgradeButton variant="subtle" />` below the warnings, then `<EmailCapture verdict slug>` below that. Slug derived via `encodeInput(input)` if not provided.
- `components/Hero.tsx` — added `<AccountMenu />` to the top-right header. After a recommendation lands, the existing `useEffect` now also calls `window.history.replaceState(null, '', '/r/${slug}')`. This is the client-side equivalent of the architect's "/app/page.tsx — on form submit, update window.history" wording, since `app/page.tsx` is a server component.
- `app/layout.tsx` — wraps the html tree in `<ClerkProvider>` only when `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is present. When absent, the original tree renders as-is, preserving the free-experience build/dev path.
- `lib/types.ts` — added `SubscriptionTier`, `SubscriptionStatus`, `ShareableResult`, `EmailCapturePayload`. `UserInput`, `Recommendation`, `SupplementPick` shapes unchanged.
- `package.json` — added `@clerk/nextjs ^5.7.5`, `stripe ^22.1.0`, `@supabase/supabase-js ^2.x`, `resend ^x.x`. No removals.
- `.env.example` — replaced placeholder with the full env-var checklist for Clerk, Stripe, Supabase, Resend, and the public app URL.
- `README.md` — appended a "Deploying to production" section enumerating the env var groups and Clerk/Stripe webhook endpoints.

## Frozen — untouched this cycle

- `lib/engine.ts`, `lib/supplements.ts`, `lib/conflicts.ts`, `lib/variation.ts`, `lib/confidence.ts`, `lib/units.ts`, `lib/nutrition.ts`, `lib/verdict.ts`, `lib/ledgerSamples.ts`
- `app/api/recommend/route.ts`, `app/api/og/route.ts`
- `tailwind.config.ts`, `app/globals.css`, `postcss.config.js`
- `app/page.tsx` (no diff this cycle; ClerkProvider lives in layout.tsx)
- All components except `ResultCard.tsx` and `Hero.tsx`

## Notes

- The free experience is unchanged: anonymous users complete the form, see the recommendation, see the EmailCapture, see the UpgradeButton, and never encounter a sign-up wall.
- "Coming soon" labels are mandatory on `/pricing` for every Pro feature not in this cycle's scope. The pricing page renders the literal string `coming soon` next to: account history, 30-day check-in, clinician PDF export, priority engine notifications.
- `lib/email.ts` and `app/api/email/result/route.ts` no-op gracefully (returning `{ ok: true, queued: false }`) when `RESEND_API_KEY` is absent so production deploys without email configured do not break the form.
- Webhook signature verification uses Stripe's `webhooks.constructEvent` (Stripe) and base64-key + HMAC-SHA256 (Clerk/Svix); both reject unsigned or mismatched payloads.
- Bundle: `/` first-load JS unchanged at ~96.7 kB. `/sign-in` and `/sign-up` add ~115 kB Clerk surface to those routes only. Middleware is 61.8 kB. None of this enters the home or `/r/[slug]` route.
