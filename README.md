# Apex Protocol

The supplement & nutrition stack the science actually supports for your body. A deterministic, evidence-tier-aware engine. No auth, no DB, no external APIs at runtime.

## Stack

Next.js 14 App Router · TypeScript · Tailwind CSS · lucide-react · next/font/google. Deploys to Vercel as-is.

## Run / Build

```
npm install
npm run dev   # http://localhost:3000
npm run build && npm start
```

## Layout

`app/` — App Router pages and `/api/recommend`. `components/` — Hero, form, result, footer. `lib/` — pure engine, supplement table, types. `recommend(input) → recommendation` is a single pure function.

## Deploying to production

The free recommendation works without any env vars. Auth, payment, and email require:

- **Clerk** — `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`
- **Stripe** — `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_MONTHLY`, `STRIPE_PRICE_ID_ANNUAL`
- **Supabase** — `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (run `supabase/migrations/0001_subscriptions.sql` once)
- **Resend** — `RESEND_API_KEY`, optional `RESEND_FROM`
- **App** — `NEXT_PUBLIC_APP_URL` for absolute share/email links

Configure Clerk webhooks pointing at `/api/webhooks/clerk` (event `user.created`) and Stripe webhooks at `/api/webhooks/stripe` (`checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`).

## Pro features (N=007)

The Pro tier unlocks three clinical companion tools, all rendered inside the result card behind `<ProGate>`:

- **30-day timeline projection** — deterministic onset-of-effect curves for the active stack, charted via `recharts`.
- **Lab result parser** — drag-drop PDF upload, format-aware extraction (Quest / LabCorp / ZRT) via the Python service in `python/parse_labs.py`, side-by-side recommendation diff.
- **Bottle scanner** — camera or file capture, OCR + fuzzy match via `python/scan_bottle.py`. Identifies compound + dose and compares to your protocol.

The Python services run on the Vercel Python runtime (configured in `vercel.json`). Install Python deps locally with `pip install -r python/requirements.txt`. Raw uploaded files are never persisted; only structured extracted values are stored, and only for Pro users.

## Disclaimer

Educational only. Not medical advice. Consult a clinician before any supplement.
