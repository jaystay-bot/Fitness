# CURRENT_003.md

**N:** 003 **Hat:** COMMANDER (Jay) **Date:** 2026-05-03 **Status:** ACTIVE **Predecessor:** N=002 PASS (with latent N=001 styling bug discovered)

---

## INTENT

N=003 is a targeted recovery cycle. Tailwind utilities are not compiled into production CSS due to a missing `postcss.config.js`. Two atomic additions: (1) add the minimum config required to compile Tailwind in the existing Next.js 14 App Router build, (2) add a visual baseline test that asserts a known Tailwind utility class actually applies its computed style at runtime, so this class of silent failure is caught by the Judge in every future cycle. Scope is strictly limited to these two additions. The previously planned distribution + trust layer is resequenced to N=004 and remains in `QUEUE.md`.

## SCOPE BOUNDARY

Two atomic additions only:

1. `postcss.config.js` (with autoprefixer added to devDependencies if absent).
2. `tests/visual.spec.ts` — Playwright computed-style assertions + two screenshots.

No distribution work. No `/r/[slug]`. No `SourcesPanel`. No `EmailCapture`. No engine changes. No palette or font edits. Anything else discovered goes to `QUEUE.md`.

## SUCCESS DEFINITION

- Production build compiles Tailwind utilities into the bundled CSS.
- A test asserts (a) hero H1 font-size > 32px, (b) `body` background `rgb(10, 10, 10)`, (c) primary CTA background `rgb(212, 255, 58)` — fails loudly if Tailwind silently no-ops again.
- Screenshots `visual_baseline_390.png` and `visual_baseline_1280.png` show the styled product, with the 390 image larger in bytes than the unstyled `hero_390.png` from N=002.

## CONSTRAINTS (Commander level)

- Distribution + trust work resequenced to N=004; do not pull forward.
- Only `autoprefixer` may be added; only as a devDependency.
- All component, lib, app, and config files (other than `package.json` for the autoprefixer entry, if needed) are frozen.

## HANDOFF

→ Architect writes `/agent_state/S1_LOCKED_003.md`. The original `S1_LOCKED.md` and `S1_LOCKED_002.md` remain binding for everything they cover.
