# NEXT_003.md

**Previous N:** 002 — PASS (differentiation pass: evidence ledger, OG image, conflict banner promoted).

## Top of QUEUE for N=003

A bug was discovered during the N=002 Judge phase and recorded in `QUEUE.md` as the highest-priority candidate:

- **CSS pipeline bug** — Tailwind utility classes are not being compiled into the production CSS bundle because no PostCSS configuration is loaded. The hero and result render correct DOM order but unstyled. The N=001 locked file tree omitted `postcss.config.js`. Recovery should add a minimal PostCSS config (Tailwind + autoprefixer) and re-screenshot the hero, result, and conflict banner to confirm palette and layout are visually correct.

## Other QUEUE candidates (Commander to prioritize)

- Email capture *after* result is shown (never before).
- Stripe checkout for "Pro Protocol" deeper plan PDF.
- Apify-based supplement price comparison.

Commander to pick one (recommend the CSS bug) and run a fresh six-hat cycle starting at `CURRENT_003.md`.
