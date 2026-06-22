# Apex Protocol

**A deterministic, evidence-graded supplement & nutrition engine — the stack the science actually supports for your body, with the peer-reviewed receipts shown on every pick.**

🔗 **Live:** https://fitness-iota-azure.vercel.app

Apex Protocol turns a short profile (age, sex, body metrics, activity, sleep, goal, diet, health flags, and the one symptom you want fixed) into a ranked supplement stack with dosing and timing, a goal-matched food protocol, and a 30-day plan — and it shows the **evidence tier and study volume behind every recommendation**, with a one-click link to the primary source on PubMed. No email gate on the first result.

---

## Why it's not another quiz-to-affiliate-link app

The wedge is honesty and transparency that most supplement tools skip:

- **Evidence tier on every pick** — Strong / Moderate / Emerging, with study counts, so users can weigh recommendations instead of trusting a black box.
- **Stack-interaction warnings** — e.g. zinc blocking copper absorption, magnesium timing vs. caffeine — surfaced automatically.
- **Goal-conflict detection** — if a user wants muscle *and* fat loss, the engine says which to prioritize and why, rather than pretending both happen at once.
- **No fabricated data** — study summaries are qualitative and cited by PMID; the only charts derived in-app are explicitly labeled as the project's own illustrative model, not study results. Marketing copy is run through a build-time compliance audit that fails the build on a blocked claim.
- **No login wall** on the first result; the recommendation is shown instantly.

## The engineering story

The heart of the product is a **single pure function**:

```ts
recommend(input: UserInput, taggedInputs?): Recommendation
```

It's synchronous, dependency-free, and `JSON.stringify`-identical across calls with the same input (a determinism invariant covered by tests). Given a profile it:

1. Builds a goal-core stack, then layers symptom/diet/inflammation overrides via a typed signal-priority resolver (`lib/signalPriority.ts`).
2. Applies a deterministic, input-seeded variation pass so two different people get genuinely different stacks — without any randomness that would break reproducibility (`lib/variation.ts`, `hashInput`).
3. Scores per-pick **confidence**, detects goal conflicts, builds the nutrition protocol and a 30-day plan, and attaches interaction warnings.

Because the engine is pure and deterministic, the same input always yields the same shareable result — which is what makes the `/r/[slug]` share links and OG-image generation reliable.

### The Wire — a read-only evidence feed

`/research` is a feed you *read*, not post to. It pulls **live PubMed-indexed study counts** (ISR-cached every 6 hours, with a graceful fallback to curated estimates when egress is unavailable), grades each compound on the evidence tiers, and links every card to its primary source. Curated compounds also expand to an in-app "See the data" breakdown — design, population, outcome, qualitative magnitude, takeaway — with no invented effect sizes.

### Clinical companion tools (Pro)

Rendered behind a Pro gate inside the result card:

- **30-day timeline projection** — deterministic onset-of-effect curves for the active stack (`recharts`).
- **Lab result parser** — drag-drop PDF, format-aware extraction (Quest / LabCorp / ZRT) via a Python service, with a side-by-side recommendation diff.
- **Bottle scanner** — camera/file capture, OCR + fuzzy match to identify compound and dose. Raw uploads are never persisted — only structured extracted values are stored, and only for Pro users.

## Stack

**Frontend / framework:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · lucide-react · `three` (3D supplement bottle) · `recharts`
**Auth / payments / data:** Clerk · Stripe (subscription + webhooks) · Supabase · Resend (transactional email)
**Data / services:** live PubMed integration · Python microservices (`pdf-parse` + OCR) on the Vercel Python runtime
**Testing:** Playwright visual-regression suite (`tests/visual.spec.ts`) — asserts the locked color palette, hero typography, and unit-toggle invariants on every run.
**Deploys to Vercel as-is.**

## Run / build

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

The free recommendation flow works with **no environment variables**. Auth, payments, email, and the Pro tools require configuration — see `.env.example`.

### Demo mode

For a public demo where every Pro feature should be visible, set:

```bash
NEXT_PUBLIC_DEMO_MODE=true
```

This grants Pro access to all users so reviewers can see the full product without a subscription. Leave it unset (or `false`) for the real `tier === "pro"` gating.

## Project layout

| Path | What |
|---|---|
| `app/` | App Router pages, `/api/recommend`, share routes (`/r/[slug]`), OG image, The Wire (`/research`) |
| `lib/engine.ts` | The pure `recommend()` engine — stack building, variation, confidence, conflicts |
| `lib/research/` | The Wire: live PubMed feed, curated study breakdowns, personalization |
| `lib/` | Supplement table, conflict logic, nutrition, timeline model, compliance audit, types |
| `components/` | Hero, input form, result card, The Wire feed, clinical tools |
| `python/` | Lab PDF parser + bottle OCR services (Vercel Python runtime) |
| `tests/` | Playwright visual-regression spec |

## Production configuration

Auth, payment, and email require:

- **Clerk** — `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET` (webhook → `/api/webhooks/clerk`, event `user.created`)
- **Stripe** — `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_MONTHLY`, `STRIPE_PRICE_ID_ANNUAL` (webhook → `/api/webhooks/stripe`)
- **Supabase** — `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (run `supabase/migrations/0001_subscriptions.sql` once)
- **Resend** — `RESEND_API_KEY`, optional `RESEND_FROM`
- **App** — `NEXT_PUBLIC_APP_URL` for absolute share/email links

Python deps for the Pro tools: `pip install -r python/requirements.txt`.

## Disclaimer

Educational only. Not medical advice. Consult a clinician before starting any supplement.
