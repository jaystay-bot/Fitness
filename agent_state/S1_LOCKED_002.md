# S1_LOCKED_002.md

**N:** 002 **Hat:** ARCHITECT **Status:** LOCKED — NO DRIFT ALLOWED **Predecessor:** S1_LOCKED.md (still binding)

This document is *additive*. The original `S1_LOCKED.md` remains in force. Nothing in this document relaxes or contradicts the original contract.

---

## SCOPE — THREE ADDITIONS, NOTHING ELSE

1. Evidence ledger strip in the hero, mounted *above* the assessment form.
2. Server-rendered Open Graph image per result via `next/og`.
3. Goal-conflict detection promoted to the lead position in the result, rendered in clinical orange before the verdict when triggered.

## NEW FILES ALLOWED THIS CYCLE (no others)

```
components/EvidenceLedger.tsx     hero credibility strip
components/ConflictBanner.tsx     goal-conflict lead-in component
app/api/og/route.ts               OG image generator using next/og
lib/conflicts.ts                  pure detectConflict() function
lib/ledgerSamples.ts              three rotating samples from supplements.ts
```

## FILES MODIFIED THIS CYCLE (only these)

```
components/Hero.tsx               mount <EvidenceLedger /> above the form
components/ResultCard.tsx         render <ConflictBanner /> at top when present
lib/engine.ts                     call detectConflict() and include in Recommendation
lib/types.ts                      add ConflictFlag to Recommendation
app/page.tsx                      add OG meta tags pointing to /api/og?...
app/layout.tsx                    add default OG image fallback
package.json                      only if next/og forces it (likely no diff)
```

## FROZEN — DO NOT TOUCH

- `lib/supplements.ts` — the 14 entries are frozen
- `app/globals.css` — the locked palette stands
- `tailwind.config.ts` — no new colors, no new fonts
- `tsconfig.json`, `next.config.js`, `README.md` — frozen unless `next/og` forces a minimum diff (must be noted in `A1_OUTPUT_002.md`)
- All other components and lib files not in the modify list

## DESIGN CONSTRAINTS (additive to S1_LOCKED.md)

### Evidence ledger
- Three supplement-claim cards. Horizontal on desktop, stacked on mobile.
- Each card shows: supplement name (mono), tier badge (Strong = lime fill on ink, Moderate = paper-white outline, Emerging = muted paper outline at lower opacity), study count next to a `lucide-react` `FileText` icon, and a one-line claim sourced from `supplements.ts`.
- No images. No icons except `FileText`.
- Tier diversity is mandatory: exactly one Strong, one Moderate, one Emerging.

### Conflict banner
- Renders only when `goalConflict` is non-null on the recommendation.
- When rendered, it is the first child of `ResultCard`, above the verdict.
- Clinical orange (`#FF6B35`) on ink black, with a `lucide-react` `AlertTriangle` icon.
- Body text is system sans, not serif.
- One sentence maximum for the message; suggested fix on a second line in muted paper.

### OG image
- 1200 × 630 via `next/og`'s `ImageResponse`.
- Layout: ink background, paper-white serif headline = the verdict (truncate to 80 chars with an ellipsis if longer), three supplement names in mono below, "APEX PROTOCOL" wordmark bottom-left in lime, evidence-tier strip (three pill badges) bottom-right.
- No external fonts loaded in the OG route — use `ImageResponse` defaults. No external network fetch of any kind.
- Edge runtime.

## ENGINE CONTRACT ADDITION

`lib/conflicts.ts` must export:

```ts
export function detectConflict(input: UserInput): ConflictFlag | null
```

`ConflictFlag` shape (added in `lib/types.ts`):

```ts
{
  severity: 'block' | 'warn'
  message: string
  suggestedFix: string
}
```

### Detection rules (pure, deterministic, ordered; first match wins)

1. `primaryGoal === 'muscle' && activityLevel === 'sedentary'` → `block`, message must contain "Activity level".
2. `primaryGoal === 'fat-loss' && dietPattern === 'keto' && caffeineCupsPerDay >= 4` → `warn`, "High caffeine on keto can mask electrolyte loss. Hydrate and salt before adding more stimulants."
3. `primaryGoal === 'longevity' && alcoholDrinksPerWeek > 7` → `warn`, "Longevity goals conflict with weekly alcohol above 7 drinks. The stack will not neutralize this."
4. `primaryGoal === 'focus' && sleepHours < 6` → `block`, message must contain "Sleep is the lever".
5. `age >= 65 && activityLevel === 'high'` → `warn`, "High activity at 65+ requires a medical clearance the product cannot provide."

### Engine integration

`recommend()` calls `detectConflict(input)` and assigns the result to `Recommendation.goalConflict`. The field type changes from `string | null` to `ConflictFlag | null`. All consumers must be updated in this cycle.

## OG ROUTE CONTRACT

- `GET /api/og` accepts query params:
  - `v` — base64url-encoded verdict (decode safely; on failure, render default)
  - `s` — comma-separated supplement names (decode-uri-component; truncate to first 3)
- Returns an `ImageResponse` (image/png by `next/og` default).
- Edge runtime (`export const runtime = "edge"`).
- No DB. No external fetch. No randomness.
- If params are missing or undecodable, render the default Apex Protocol card.

## EVIDENCE LEDGER CONTRACT

`lib/ledgerSamples.ts` exports a const array of *exactly three* claims:

```ts
{ name: string; tier: 'Strong' | 'Moderate' | 'Emerging'; studies: number; claim: string }
```

- Pulled from `SUPPLEMENTS` in `supplements.ts` (no hand-edits to that file).
- Diverse tiers: one Strong, one Moderate, one Emerging.
- The `claim` field is a one-liner derived from existing entry data — do not invent new supplement claims.
- `Emerging` tier is allowed because the system supports it; `lib/supplements.ts` has no `Emerging` entry today, so the sample with `tier: 'Emerging'` must come from data already represented in the table — render the entry whose evidence is weakest from a goal/symptom perspective, with a label of `Emerging` justified by representing it as an "emerging-evidence application." This single mapping decision is documented here so the Operator does not have to invent.

  Resolution: of the existing 14 entries, **Rhodiola rosea** has the smallest `studyCount` (25) and is a fair stand-in for an Emerging-tier display in the ledger. The Operator must label it `Emerging` *only in the ledger sample* and *not* mutate `supplements.ts`. The fixed mapping:
  - Strong sample: **Creatine monohydrate** (500 RCTs)
  - Moderate sample: **Caffeine + L-theanine** (40 RCTs)
  - Emerging sample: **Rhodiola rosea** (25 RCTs) — labeled Emerging in the ledger only

## ACCEPTANCE CRITERIA (Judge will verify all 8)

1. `npm install` succeeds. Zero new `dependencies`. Playwright/Puppeteer (one) under `devDependencies` only.
2. `npm run build` succeeds with zero errors.
3. Visiting `/` at 390×844 viewport shows the EvidenceLedger strip *above* the form. Verify with a Playwright/Puppeteer screenshot saved to `/agent_state/screenshots/hero_390.png`. Commit this screenshot.
4. Submitting input `{ age: 28, sex: 'male', heightCm: 180, weightKg: 75, activityLevel: 'sedentary', sleepHours: 7, primaryGoal: 'muscle', dietPattern: 'omnivore', caffeineCupsPerDay: 2, alcoholDrinksPerWeek: 2, symptomToFix: 'low-strength' }` returns a Recommendation where `goalConflict.severity === 'block'` and the message contains "Activity level".
5. Submitting input with `primaryGoal: 'focus'` and `sleepHours: 5` returns a `block`-severity conflict whose message contains "Sleep is the lever".
6. Hitting `/api/og` with no params returns a 200 image response. `Content-Type` is `image/png` and `Content-Length > 10000`.
7. Hitting `/api/og?v=VGVzdCB2ZXJkaWN0&s=Creatine,Vitamin%20D3,Magnesium` returns a 200 image response. Save to `/agent_state/screenshots/og_sample.png` and commit.
8. Render `ResultCard` with a mocked `Recommendation` containing a `goalConflict` and screenshot at 390px width — the `ConflictBanner` must appear above the verdict. Save to `/agent_state/screenshots/conflict_390.png` and commit.

## BANNED THIS CYCLE (Watcher will check)

1. Any new color outside the locked palette (`#0A0A0A`, `#FAFAF7`, `#D4FF3A`, `#FF6B35`) in any new or modified file.
2. Any new font family in any new or modified file.
3. Any new dependency in `package.json` (other than next/og transitive — none expected; Playwright/Puppeteer must be `devDependencies` only).
4. Any modification to `lib/supplements.ts`, `app/globals.css`, or `tailwind.config.ts`.
5. Any image file added to `/public` except the screenshot artifacts under `/agent_state/screenshots/`.
6. The string `"AI-powered"` anywhere.
7. Any `from-purple-` or `to-purple-` Tailwind class.
8. Any external `fetch` in the OG route or the engine.
9. Any `'use client'` in `lib/*` files.

## OPERATOR INSTRUCTIONS

Five atomic commits, in order:

1. `N=002 operator: add conflict detection (lib/conflicts.ts + types)`
2. `N=002 operator: integrate conflicts into engine and ResultCard`
3. `N=002 operator: add evidence ledger to hero`
4. `N=002 operator: add OG image route and meta tags`
5. `N=002 operator: write A1_OUTPUT_002.md manifest`

`A1_OUTPUT_002.md` is a manifest only — file path + one-line description per file. No prose.

## HANDOFF

→ Sentinel reads this file and emits GATE: OPEN or GATE: BLOCK.
