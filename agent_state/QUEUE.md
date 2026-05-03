# QUEUE.md

## ACTIVE

- N=002 — Differentiation pass (evidence ledger + OG sharing + conflict promotion). Operator + Watcher complete. Judge running.

## DONE

- N=001 — Apex Protocol scaffold (PASS).

## BUGS DISCOVERED (recorded per guardrail — NOT fixed in current cycle)

- **N=003 candidate (bug)** — Tailwind utility classes are not being compiled into the production CSS bundle. The CSS output at `.next/static/css/*.css` contains only `@font-face` declarations from `next/font/google`; zero utility classes. Root cause: no PostCSS configuration is loaded. Next.js' CSS pipeline reads `postcss.config.js` (or `postcss.config.mjs`) at the project root and applies Tailwind through it; the repo currently has no such file because the N=001 locked file tree did not list one. As a result, every page renders with raw HTML order but no Tailwind styling. Inline styles (e.g. `next/og`) are unaffected; that's why the OG image renders correctly while the hero and result screenshots look unstyled. Recovery: add a minimal `postcss.config.js` (or amend the locked tree to include it) and rebuild. Acceptance: a styled hero screenshot at 390×844, with palette colors visible, ledger borders, form fields styled, conflict banner visibly clinical-orange.

## PENDING (future cycles — not part of N=002)

- Email capture *after* result is shown (never before)
- Stripe checkout for "Pro Protocol" deeper plan PDF
- Apify-based supplement price comparison

These are queued for future cycles. They are not in scope for N=002.
