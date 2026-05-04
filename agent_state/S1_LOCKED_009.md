# S1_LOCKED_009.md

**N:** 009 **Hat:** ARCHITECT **Status:** LOCKED — NO DRIFT ALLOWED **Predecessors:** S1_LOCKED.md · S1_LOCKED_002..S1_LOCKED_008.md (all still binding)

This document is *additive*. Prior locked contracts remain in force.

---

## SCOPE

First cycle of **Project Spear** — pivot from supplement recommendation to insurance replacement, established at the homepage layer only. Three new sections plus one copy module:

1. `SpearHero` replaces the prior `Hero` mount in `app/page.tsx` (the `Hero.tsx` file is preserved for rollback).
2. `SymptomEntry` adds a three-button front door that scrolls to the existing assessment form.
3. `VaultDashboard` shows four placeholder numbers with a mandatory clinical-orange disclosure that vault funding ships in N=010.
4. `UninsuranceThesis` renders the three-line wedge messaging plus the closer copy.

The recommendation engine, the assessment form, the result card, the lab parser, the bottle scanner, the voice input, the body visualization, the interactive timeline — every shipped surface from N=001..N=008 — remain functional and untouched.

## NEW FILES ALLOWED THIS CYCLE (no others)

```
components/SpearHero.tsx           new hero with un-insurance positioning
components/SymptomEntry.tsx        three-button entry flow
components/VaultDashboard.tsx      four-number vault preview
components/UninsuranceThesis.tsx   wedge messaging block
lib/spearCopy.ts                   locked copy constants
```

## FILES MODIFIED THIS CYCLE (only these)

```
app/page.tsx        replace <Hero/> mount with SpearHero + SymptomEntry +
                    VaultDashboard + UninsuranceThesis above the existing
                    AssessmentForm flow
lib/types.ts        add SpearEntryPath, VaultPreview, UninsuranceCopy
package.json        no diff (no new deps)
```

## FROZEN — DO NOT TOUCH

- `lib/engine.ts`, `lib/supplements.ts`, `lib/conflicts.ts`, `lib/variation.ts`, `lib/confidence.ts`, `lib/units.ts`, `lib/slug.ts`, `lib/timeline.ts`, `lib/timelineData.ts`, `lib/labParser.ts`, `lib/labMapping.ts`, `lib/scanner.ts`, `lib/voice.ts`, `lib/voiceParser.ts`, `lib/bodySystems.ts`, `lib/svgPositions.ts`, `lib/subscription.ts`, `lib/supabase.ts`, `lib/stripe.ts`, `lib/email.ts`, `lib/nutrition.ts`, `lib/verdict.ts`
- All API routes (everything under `app/api/`)
- `tailwind.config.ts`, `app/globals.css`, `postcss.config.js`, `next.config.js`, `tsconfig.json`, `middleware.ts`, `.env.example`, `vercel.json`
- All N=001..N=008 components except `app/page.tsx` modification — specifically `Hero.tsx` is preserved unchanged but no longer mounted by the page
- `app/layout.tsx`, `app/r/[slug]/page.tsx`, `app/pricing/page.tsx`, `app/account/page.tsx`, sign-in/sign-up
- All Supabase migrations
- All Python files

## POSITIONING COPY CONTRACT — `lib/spearCopy.ts`

```ts
export const SPEAR_COPY = {
  heroEyebrow: "PROJECT SPEAR",
  heroHeadline: "This is not insurance. This is ownership.",
  heroSubhead:
    "Insurance hopes you get sick and do not use it. We hope you stay healthy and keep your money.",
  threeButtons: {
    whatHurts: "What hurts",
    whatDoINeed: "What do I need",
    iKnowProduct: "I know the product",
  },
  buttonCaptions: {
    whatHurts: "Tell us a symptom and we will route you",
    whatDoINeed: "Personalized protocol from your inputs",
    iKnowProduct: "Skip to recommendation",
  },
  vaultLabels: {
    balance: "Vault Balance",
    savedThisMonth: "This Month Saved",
    healthScore: "Health Score",
    findCare: "Find Care",
  },
  vaultMath: {
    monthlyContribution: 200,
    yearOneKept: 2400,
    yearTwoKept: 4800,
    traditionalKept: 0,
  },
  vaultCaptions: {
    balance: "after 12 months at $200/mo",
    savedThisMonth: "kept by you",
    healthScore: "verified by your activity",
    findCare: "Browse",
  },
  vaultDisclosure:
    "Preview only. Vault funding ships in N=010. Provider marketplace ships in N=011.",
  thesisBullets: ["Find care yourself.", "Pay yourself.", "Own yourself."] as const,
  closer: "No co-pays. No denials. No leakage.",
} as const;
```

These strings must appear in the rendered UI verbatim. The wedge positioning depends on the exact phrasing.

## SPEAR HERO CONTRACT — `components/SpearHero.tsx`

- Server-component-safe. Pure markup; no event handlers.
- Replaces the previous `<Hero />` mount in `app/page.tsx`.
- Asymmetric layout: eyebrow + headline + subhead occupy the **left two-thirds** on desktop (`lg:grid-cols-[2fr_1fr]`), stacked on mobile.
- The right third on desktop holds a single number rendered in mono showing `$2,400` in the locked **lime** color, with caption *"kept by you, not the insurer"* in mono paper-white-60%.
- Below the lime number, a strikethrough `$0` rendered in **clinical orange** with caption *"kept under traditional insurance"* in mono paper-white-50% — establishing the contrast.
- Locked palette: ink background, paper white serif headline, lime accent on the vault number, clinical orange on the strikethrough zero. **No new colors. No new fonts.**

## SYMPTOM ENTRY CONTRACT — `components/SymptomEntry.tsx`

- Server-component-safe. Three `<a href="#assessment-form">` anchors.
- Horizontal `grid-cols-3` on desktop, stacked on mobile.
- Each button is large, mono-labeled, full-width on its container, locked-palette only.
- Smooth-scroll behavior is achieved via the platform default (`html { scroll-behavior: smooth }` is not in `globals.css`, so we use `scroll-margin-top` on the form anchor and add `scroll-smooth` Tailwind class on `html` via the `<main>` parent — actually `app/page.tsx` cannot affect `<html>`; so the anchor target gets the standard browser scroll behavior, which is sufficient).
- Each button caption sits below it in 11px paper-white-60% mono.

## VAULT DASHBOARD CONTRACT — `components/VaultDashboard.tsx`

- Server-component-safe.
- Four cards: `grid-cols-2` on mobile (`<sm`), `grid-cols-4` on `sm` and up.
- Each card: mono label at top, large numeric value below, small mono caption.
- Values pulled from `SPEAR_COPY.vaultMath` and `SPEAR_COPY.vaultCaptions`:
  - Vault Balance: `$2,400` · *"after 12 months at $200/mo"*
  - This Month Saved: `$200` · *"kept by you"*
  - Health Score: `87` · *"verified by your activity"*
  - Find Care: `Browse` (rendered as a `<span>` styled as a link, no actual link target this cycle)
- Below the grid, the literal `SPEAR_COPY.vaultDisclosure` string in clinical orange.

## UNINSURANCE THESIS CONTRACT — `components/UninsuranceThesis.tsx`

- Server-component-safe.
- Three lines of `font-serif` at large size (`text-3xl sm:text-4xl`), each from `SPEAR_COPY.thesisBullets`.
- Below the three lines, a single mono line with `SPEAR_COPY.closer`.
- Sits between `SymptomEntry` / `VaultDashboard` and the existing `AssessmentForm`, serving as the conceptual bridge.

## PAGE INTEGRATION — `app/page.tsx`

New page order, top to bottom:

1. `SpearHero`
2. `SymptomEntry`
3. `VaultDashboard`
4. `UninsuranceThesis`
5. `<Hero />` is **no longer mounted**; instead, the page renders the assessment form via a new wrapper (or imports `Hero` to keep its result-render behavior). Per the contract spirit ("the assessment form remains in place and functional, the existing supplement recommendation flow continues to function identically"), the page must still expose the live assessment form + result-card flow that the `Hero` client component owns. The cleanest path that preserves N=008 behavior without modifying `Hero.tsx` is to keep `<Hero />` mounted **below** the four new Spear sections — the `Hero` already includes its own headline + form; `SpearHero` is the new top-of-page positioning, and `Hero`'s legacy headline is acceptable to ship below the Spear block as the "live demo" section heading. The architect explicitly authorizes this interpretation: keep the existing supplement recommendation flow intact by retaining the `Hero` mount further down the page, with the SpearHero / SymptomEntry / VaultDashboard / UninsuranceThesis sections sitting above it as the new front door.
6. `<HowItWorks />`, `<Differentiators />`, `<Footer />` — unchanged.

The `SymptomEntry` `<a>` anchors target `#assessment-form`, which is added as an `id` on the `<section>` wrapping the `Hero` mount in the page (the wrapper is part of `app/page.tsx`, not a `Hero.tsx` modification).

## ACCEPTANCE CRITERIA (Judge will verify all 12)

1. `npm install` succeeds. Zero new dependencies.
2. `npm run build` succeeds with zero errors.
3. Visiting `/` renders `SpearHero` with the verbatim headline `"This is not insurance. This is ownership."` and the verbatim subhead about insurance hoping you get sick.
4. Visiting `/` shows the three buttons `What hurts`, `What do I need`, `I know the product`, all clickable, all targeting `#assessment-form`.
5. `VaultDashboard` renders with four cards using the locked labels and placeholder values, plus the clinical-orange disclosure that vault funding ships in N=010.
6. `UninsuranceThesis` renders the three serif lines and the mono closer copy verbatim from `spearCopy.ts`.
7. `AssessmentForm` continues to function identically to N=008. Submitting a sample muscle/male input still returns a recommendation with 3–7 supplements and at least one Strong-tier pick.
8. The shareable URL pattern from N=006 still works. Submitting the form updates `window.location` to `/r/[slug]` and a fresh visit renders the same recommendation.
9. Mobile layout at 390px: `SpearHero` stacks, `SymptomEntry` buttons stack, `VaultDashboard` cards in 2×2, `UninsuranceThesis` clean. Screenshot saved to `/agent_state/screenshots/spear_mobile_390.png`.
10. Desktop layout at 1280px: `SpearHero` shows asymmetric two-thirds layout with vault number on the right, `SymptomEntry` shows three buttons in a row, `VaultDashboard` shows four cards in a row. Screenshot saved to `/agent_state/screenshots/spear_desktop_1280.png`.
11. Rendered HTML contains all three exact strings: `Insurance hopes you get sick`, `This is not insurance`, `No co-pays. No denials. No leakage.`
12. All N=008 acceptance tests pass as regression: voice input, body visualization, interactive timeline, all prior cycle behavior continues to work identically.

## BANNED THIS CYCLE

- Any modification to a frozen file
- Any new runtime dependency
- Any change to the recommendation engine, supplements, conflicts, or scoring logic
- Any actual payment processing, vault funding, Stripe Treasury, IOTA Tangle hashing, Amazon PA-API integration, or LabCorp partnership
- Any claim in copy that the vault is currently funded or that the marketplace is functional (the clinical-orange disclosure is mandatory)
- Any medical-diagnostic language
- `localStorage`, `sessionStorage`, `document.cookie`
- The string `"AI-powered"`
- `from-purple-` / `to-purple-` Tailwind classes
- Any new color outside the locked palette
- Chatbot bubble UI, stethoscope iconography, clinical-blue-and-white scheme
- Emojis as bullet markers (lucide-react icons only)

## OPERATOR INSTRUCTIONS — Seven atomic commits

```
1.  N=009 operator: add lib/spearCopy.ts with locked positioning constants
2.  N=009 operator: add SpearHero with un-insurance thesis
3.  N=009 operator: add SymptomEntry three-button front door
4.  N=009 operator: add VaultDashboard preview with four numbers
5.  N=009 operator: add UninsuranceThesis wedge messaging
6.  N=009 operator: integrate Spear sections into app/page.tsx
7.  N=009 operator: write A1_OUTPUT_009.md manifest
```

## HANDOFF

→ Sentinel reads this file and emits GATE: OPEN or GATE: BLOCK.
