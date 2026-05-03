# S1_LOCKED_003.md

**N:** 003 **Hat:** ARCHITECT **Status:** LOCKED — NO DRIFT ALLOWED **Predecessors:** S1_LOCKED.md (still binding) · S1_LOCKED_002.md (still binding)

This document is *additive*. Prior locked contracts remain in force.

---

## SCOPE — RECOVERY ONLY

Two atomic additions to fix the silent CSS pipeline failure surfaced during N=002:

1. `postcss.config.js` at the repo root — minimum Tailwind + autoprefixer wiring.
2. `tests/visual.spec.ts` — Playwright visual baseline regression test.

The N=004 distribution + trust layer (shareable URLs, sources panel, post-result email capture) is **explicitly out of scope** here and remains in `QUEUE.md` for the next cycle.

## NEW FILES ALLOWED THIS CYCLE (no others)

```
postcss.config.js        Tailwind + autoprefixer wiring
tests/visual.spec.ts     Playwright visual regression test
```

## FILES MODIFIED THIS CYCLE (only these)

```
package.json             only if autoprefixer is missing from devDependencies
agent_state/QUEUE.md     append note that the visual baseline test joins
                         the standard Judge phase
```

## FROZEN — DO NOT TOUCH

- `tailwind.config.ts` — the existing config is correct; the PostCSS entry was the only missing piece.
- `app/globals.css` — `@tailwind` directives stand.
- `app/layout.tsx`, `app/page.tsx` — frozen.
- All `components/*` — frozen.
- All `lib/*` — frozen.
- `app/api/recommend/route.ts`, `app/api/og/route.ts` — frozen.
- `tsconfig.json`, `next.config.js`, `README.md`, `.env.example` — frozen.

## POSTCSS CONFIG CONTRACT

`postcss.config.js` must export, exactly:

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

CommonJS `module.exports`. No ESM. No additional plugins. This is the minimum diff that fixes the bug.

If `autoprefixer` is not already in `devDependencies`, add it as `^10.4.0` (or the highest patch in the 10.4.x line). No other dependency changes are permitted in this cycle.

## VISUAL REGRESSION TEST CONTRACT

`tests/visual.spec.ts` must:

1. Boot the production build (`npm run build && npm run start`) on a known port (recommend 3470 to avoid collision with prior runs).
2. Open the home page at 390 × 844 viewport.
3. Locate the hero H1 element by its serif headline copy.
4. Assert `getComputedStyle(h1).fontSize` parses to a value strictly greater than `32px`. Tailwind compiles `text-4xl` (and up) into 36px+; if Tailwind silently no-ops, the H1 falls back to user-agent default and this assertion fails.
5. Assert `getComputedStyle(document.body).backgroundColor === "rgb(10, 10, 10)"` — locked ink black. Globals.css must be loaded.
6. Assert the primary CTA button's `getComputedStyle(...).backgroundColor === "rgb(212, 255, 58)"` — locked electric lime. The `bg-lime` utility must compile.
7. Take a full-page screenshot at 390 × 844 and save to `agent_state/screenshots/visual_baseline_390.png`. Commit it.
8. Take a full-page screenshot at 1280 × 800 and save to `agent_state/screenshots/visual_baseline_1280.png`. Commit it.

The three computed-style assertions are the styling tripwire. Any future cycle that breaks the build pipeline, removes a config, or silently drops a class fails this test loudly in the Judge phase.

The test runner is plain Node ESM driving Playwright (already in devDependencies from N=002). No Jest, no Vitest, no Playwright Test runner config — the `tests/` directory is the only addition. The file is written so it can be executed as `node tests/visual.spec.ts` (with `tsx` shimming if necessary) **or** by the Judge harness wrapping it. The Judge phase is the entity that runs it.

## ACCEPTANCE CRITERIA (Judge will verify all 6)

1. `postcss.config.js` exists at the repo root with the exact contents specified.
2. `autoprefixer` is present in `devDependencies` (added or already present).
3. `npm run build` succeeds with zero errors.
4. `npm run start` serves the production build, and the visual test passes all three computed-style assertions (font-size > 32px on H1, body bg `rgb(10, 10, 10)`, CTA bg `rgb(212, 255, 58)`) plus saves two screenshots.
5. `visual_baseline_390.png` is strictly larger in bytes than `hero_390.png` from N=002 — proxy for "the page now has visual structure that didn't exist before." Both byte counts must be documented in `TRUTH_RESULT_003.md`.
6. The original N=002 acceptance tests still pass: hitting `/api/recommend` with the muscle/sedentary input returns the conflict block; `/api/og` default returns image/png > 10000 bytes; `/api/og?v=…&s=…` returns an image. Re-run these as a regression check.

## BANNED THIS CYCLE (Watcher will check)

- Modification of `tailwind.config.ts`, `app/globals.css`, `app/layout.tsx`, `app/page.tsx`, any file under `components/`, any file under `lib/`, or any file under `app/api/`.
- Any new runtime dependency in `package.json`. Only `autoprefixer` (devDependency) is allowed.
- Any pulling-forward of N=004 distribution work. Specifically, none of the following may exist on disk: `app/r/`, `components/SourcesPanel.tsx`, `components/EmailCapture.tsx`, `app/api/subscribe/`. Watcher greps for these.
- The string `"AI-powered"` (still banned).
- `from-purple-` / `to-purple-` Tailwind classes (still banned).

## OPERATOR INSTRUCTIONS

Three atomic commits, in order:

1. `N=003 operator: add postcss.config.js + autoprefixer dep`
2. `N=003 operator: add visual baseline regression test`
3. `N=003 operator: write A1_OUTPUT_003.md manifest`

`A1_OUTPUT_003.md` is a manifest only — file path + one-line description per file. No prose.

## HANDOFF

→ Sentinel reads this file and emits GATE: OPEN or GATE: BLOCK.
