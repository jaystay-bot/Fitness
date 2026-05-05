# S1_LOCKED_011.md

**N:** 011 **Hat:** ARCHITECT **Status:** LOCKED — NO DRIFT ALLOWED **Predecessors:** S1_LOCKED.md · S1_LOCKED_002..S1_LOCKED_010.md (all still binding)

This document is *additive*. Prior locked contracts remain in force, except where this document explicitly unfreezes a single file for surgical edit.

---

## SCOPE

Two coordinated changes against the N=010 head:

1. **Chart legibility pass.** Rewrite `components/InteractiveTimeline.tsx` and `components/TimelineDayDetail.tsx` so the day-by-day projection auto-traverses day 1 → day 30 in ≥ 30 seconds, exposes Play / Pause / Rewind / Scrub controls, displays a single-day callout, and renders every visible string in plain language. Rewrite the `noteForDay` function in `lib/timeline.ts` so its emitted notes use plain-English vocabulary. The pure projection math (`projectTimeline`, `effectAtDay`, `onsetFraction`, `ONSET_CURVES`) is FROZEN.
2. **DEV MODE comment update.** Replace the existing comment block above `isProUser` in `lib/subscription.ts` with the literal contract string (single-line `NOTE` comment). The function body remains `return true;`. No other line in the file moves.

Strictly additive otherwise. The recommendation engine, supplements, conflicts, all other prior cycle components, the Spear positioning sections, the homepage layout, the feedback widget, and the admin route are FROZEN.

## NEW FILES ALLOWED THIS CYCLE (no others)

```
agent_state/CURRENT_011.md
agent_state/S1_LOCKED_011.md
agent_state/A1_OUTPUT_011.md
agent_state/TRUTH_RESULT_011.md
```

No new components. No new routes. No new lib modules. No new migrations. No new dependencies.

## FILES MODIFIED THIS CYCLE (only these)

```
components/InteractiveTimeline.tsx     full rewrite for slow scrubber + day-by-day callout
components/TimelineDayDetail.tsx       full rewrite for plain-language labels + per-pick why
lib/timeline.ts                        noteForDay only (plain-language strings); other
                                       exports + projectTimeline math byte-identical
lib/subscription.ts                    comment block above isProUser only; function body
                                       and every other line byte-identical
agent_state/SESSION_LOG.md             append N=011 entries
```

## FROZEN — DO NOT TOUCH

- `lib/engine.ts`, `lib/supplements.ts`, `lib/conflicts.ts`, `lib/variation.ts`, `lib/confidence.ts`, `lib/units.ts`, `lib/slug.ts`, `lib/timelineData.ts`, `lib/labParser.ts`, `lib/labMapping.ts`, `lib/scanner.ts`, `lib/voice.ts`, `lib/voiceParser.ts`, `lib/bodySystems.ts`, `lib/svgPositions.ts`, `lib/supabase.ts`, `lib/stripe.ts`, `lib/email.ts`, `lib/nutrition.ts`, `lib/verdict.ts`, `lib/spearCopy.ts`, `lib/feedback.ts`, `lib/types.ts`
- The `projectTimeline`, `effectAtDay`, `onsetFraction`, `clamp01`, and exported `TimelinePoint` interface inside `lib/timeline.ts` (only `noteForDay` may change)
- All API routes from N=001..N=010
- `tailwind.config.ts`, `app/globals.css`, `postcss.config.js`, `next.config.js`, `tsconfig.json`, `middleware.ts`, `vercel.json`, `package.json`
- `app/page.tsx`, `app/r/[slug]/page.tsx`, `app/pricing/page.tsx`, `app/account/page.tsx`, `app/admin/feedback/page.tsx`, `app/layout.tsx`, sign-in/sign-up
- All N=001..N=010 components except `InteractiveTimeline` and `TimelineDayDetail`. The recharts-based `TimelineProjection.tsx` is FROZEN — it is no longer mounted but stays in the tree
- All Supabase migrations 0001 + 0002 + 0003, all Python files

## DEV MODE COMMENT — `lib/subscription.ts`

Replace the existing six-line comment block (lines 9–15) with the single-line literal:

```ts
// NOTE: DEV MODE ACTIVE, ALL USERS GRANTED PRO ACCESS FOR TESTING, REVERT BEFORE COMMERCIAL LAUNCH
```

The `isProUser`, `canAccess`, `PRICE_MONTHLY_USD_CENTS`, `PRICE_ANNUAL_USD_CENTS`, and `formatUsdCents` exports remain byte-identical. The intra-function `void tier;` and `return true;` lines remain.

## PLAIN-LANGUAGE BAN LIST (visible surface only)

The following terms must NOT appear in any visible string emitted by `InteractiveTimeline`, `TimelineDayDetail`, or the runtime output of `noteForDay`:

```
ferritin, methylcobalamin, mitochondrial, cortisol, serum 25-OH, saturation,
plateau, t50, tmax, bisglycinate, adaptogen, compounding, loading dose,
half-life, baseline (as a metric), substrate, normalized, deficiency,
clinical, pharmacokinetic
```

Replace with plain-language alternatives:

| Banned                  | Use instead                                  |
|-------------------------|----------------------------------------------|
| ferritin                | iron stores                                  |
| methylcobalamin         | the active form of vitamin B12               |
| mitochondrial function  | how your cells make energy                   |
| cortisol                | stress hormone                               |
| serum 25-OH             | vitamin D level in your blood                |
| saturation              | full effect                                  |
| plateau                 | leveled off                                  |
| t50 / tmax              | half-effect day / full-effect day            |
| bisglycinate            | gentle form                                  |
| adaptogen               | stress-resilience herb                       |
| compounding             | building up                                  |
| loading dose            | starter dose                                 |
| half-life               | how long it lasts in your body               |
| substrate               | building block                               |

Internal-only comments (e.g., the docblock in `lib/timelineData.ts`) may keep clinical vocabulary because they are never rendered. The runtime output of `noteForDay` is the only `lib/timeline.ts` change in scope.

## INTERACTIVETIMELINE CONTRACT — `components/InteractiveTimeline.tsx`

- `'use client'`.
- Constants: `HORIZON = 30`, `PLAY_DURATION_MS = 30_000` (≥ 30s mandatory). The previous `5_000` value is gone.
- View: SVG aggregate-effect chart (preserve viewBox/dimensions) + a prominent **single-day callout** above the chart that names the current day in plain English: e.g. `Day 7 — your first full week is in the books.` The callout updates every animation tick.
- Controls (always visible, even when paused or before first play):
  - **Play** (lucide `Play`): starts auto-advance from the current day (default day 1 if not yet started). Auto-advance increments the day by 1 every `PLAY_DURATION_MS / 29` ≈ 1034 ms so each day sits on screen for ~1s.
  - **Pause** (lucide `Pause`): freezes the scrubber on the current day. The Play button replaces Pause when paused.
  - **Rewind** (lucide `RotateCcw`): jumps the scrubber back to day 1 and pauses.
  - **Step Back / Step Forward** (lucide `ChevronLeft` / `ChevronRight`): nudges the scrubber by one day. Disabled at day 1 / day 30 respectively.
  - **Scrub bar**: an HTML `<input type="range" min="1" max="30" step="1" value={day}>` styled with the locked palette. Dragging snaps to any day; releases pause auto-play if it was running.
- Per-supplement filter pills remain (carried from N=008) so the user can still hide/show individual lines.
- The aggregate average line (dashed faint) and per-pick energy lines remain.
- The active-day vertical scrubber line is always visible (not gated behind hover).
- `prefersReducedMotion()` continues to suppress auto-play but Step / Scrub / Rewind remain available so the user can still walk through the 30 days manually.
- Below the chart, the existing `<TimelineDayDetail>` panel always renders for the current day (no longer requires hover).

## TIMELINEDAYDETAIL CONTRACT — `components/TimelineDayDetail.tsx`

- Server-component-safe. No `'use client'`.
- Plain-language metric labels:
  - `energy` → `Energy`
  - `focus` → `Focus & clarity`
  - `sleep` → `Sleep quality`
  - `strength` → `Workout strength`
- Each metric value renders as `Energy · 64 / 100` (suffix `/ 100` so the user understands the scale) accompanied by a one-line plain-English interpretation:
  - 0–24 → `barely moving yet`
  - 25–49 → `starting to lift`
  - 50–74 → `clearly working`
  - 75–100 → `near full effect`
- The day-note string (from `point.note`) renders as a paragraph in `text-paper/85`.
- Per-supplement breakdown gains a `why` line: each row shows the supplement name and a plain-language sentence explaining what it is doing on that day. The sentence comes from a small in-component `whyForPickAtDay(name, day, point)` lookup (pure function, no I/O) covering the 18 supplement ids in `ONSET_CURVES`. Each lookup returns one ≤120-char sentence using only banlist-clean vocabulary.
- The per-pick row renders as `<name> — <plain-language why>` (no `e f s st` shorthand).

## LIB/TIMELINE.TS CONTRACT — `noteForDay` only

- Replace every clinical phrase in the day-1, day-3, day-7, day-14, day-21, day-30, and per-metric branch strings with plain-language equivalents from the table above.
- The function signature, parameter list, return type, and every other top-level export (`projectTimeline`, `effectAtDay`, `onsetFraction`, `clamp01`, `TimelinePoint`, `HORIZON_DAYS`) is byte-identical.
- The function remains pure, deterministic, no I/O, no async.
- Forbidden in any returned string: every term on the ban list.

## ACCEPTANCE CRITERIA (Judge will verify all 9)

1. `npm install` succeeds. Zero new dependencies.
2. `npm run build` succeeds with zero errors.
3. `lib/subscription.ts` contains the literal comment line `// NOTE: DEV MODE ACTIVE, ALL USERS GRANTED PRO ACCESS FOR TESTING, REVERT BEFORE COMMERCIAL LAUNCH` immediately above `export function isProUser`. The function body returns `true`. The exports `canAccess`, `PRICE_MONTHLY_USD_CENTS`, `PRICE_ANNUAL_USD_CENTS`, `formatUsdCents` are byte-identical to N=010.
4. `components/InteractiveTimeline.tsx` defines `PLAY_DURATION_MS = 30_000` (or any value ≥ 30000) and renders Play, Pause, Rewind, Step-back, Step-forward, and a `<input type="range">` scrub bar.
5. The current-day callout (e.g. `Day 7 — …`) is mounted above the chart and updates as the scrubber moves.
6. `components/TimelineDayDetail.tsx` renders the four metrics with `/ 100` suffix and a plain-English bucket label, and a per-pick `why` sentence for at least one demo supplement.
7. The runtime output of `noteForDay` for days 1, 3, 7, 14, 21, 30 contains zero ban-list terms (case-insensitive grep).
8. Visiting `/` and submitting a default form (Pro features visible because DEV MODE is active) renders the InteractiveTimeline with controls visible at viewport widths 390 and 1280.
9. `/pricing` still renders with the existing copy. The Upgrade button on `/r/[slug]` still POSTs to `/api/checkout` (404 in sandbox without Stripe env is acceptable; the route handler must remain present and reachable).

## BANNED THIS CYCLE

- Modifying any frozen file beyond the surgical changes specified
- Any new runtime dependency
- Any change to engine, supplements, conflicts, scoring, or `projectTimeline` math
- `localStorage`, `sessionStorage`, `document.cookie`
- The string `"AI-powered"`
- `from-purple-` / `to-purple-` Tailwind classes
- Any new color outside the locked palette
- Removing the `whyForYou` line from any supplement card
- Removing the upgrade button, pricing copy, or `/api/checkout` route

## OPERATOR INSTRUCTIONS — Atomic commits per file group

```
1.  N=011 operator: update isProUser DEV MODE comment to contract literal
2.  N=011 operator: rewrite noteForDay in lib/timeline.ts with plain-language strings
3.  N=011 operator: rewrite InteractiveTimeline with 30s scrubber + Play/Pause/Rewind/Step controls
4.  N=011 operator: rewrite TimelineDayDetail with plain-language metric labels + per-pick why
5.  N=011 operator: write A1_OUTPUT_011.md manifest
```

## HANDOFF

→ Sentinel reads this file and emits GATE: OPEN or GATE: BLOCK.
