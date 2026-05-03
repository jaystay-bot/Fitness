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

## Disclaimer

Educational only. Not medical advice. Consult a clinician before any supplement.
