# S1_LOCKED.md

**N:** 001 **Hat:** ARCHITECT (Opender + Contract) **Status:** LOCKED — NO DRIFT ALLOWED

---

## SCOPE LOCK

Build **Apex Protocol** — a single Next.js App Router project that ships:

1. A landing page with a working live demo in the hero (not a screenshot, not a video — the actual interactive form)
2. A `/api/recommend` route that returns a personalized supplement + nutrition stack from a deterministic rules engine
3. A results view rendered inline below the hero on submit

That is the entire scope. Nothing else.

## OUT OF SCOPE (HARD STOP)

- No authentication (no Clerk)
- No database (no Supabase)
- No Stripe / payments / paywall
- No email capture before result
- No user accounts, no save-history, no PDF export, no sharing in V1
- No external API calls at runtime (no OpenAI, no Anthropic, no live PubMed lookup) — engine is local rules
- No scraping
- No mobile native build

## TECH CONTRACT

| Layer         | Choice                                       | Locked |
|---------------|----------------------------------------------|--------|
| Framework     | Next.js 14+ App Router                       | YES    |
| Language      | TypeScript                                   | YES    |
| Styling       | Tailwind CSS                                 | YES    |
| Icons         | lucide-react                                 | YES    |
| Deploy target | Vercel                                       | YES    |
| Routing       | App Router only — never `/pages`             | YES    |
| State         | React `useState` only                        | YES    |
| Forms         | Native `<form>` with controlled inputs       | YES    |

## FILE TREE — ALLOWED FILES ONLY

```
/app
  /layout.tsx              Root layout, metadata, fonts
  /page.tsx                Landing + hero + live demo + results
  /globals.css             Tailwind base
  /api
    /recommend
      /route.ts            POST handler, runs engine
/components
  /Hero.tsx                Hero block with headline + form
  /AssessmentForm.tsx      Controlled form, 9 inputs
  /ResultCard.tsx          Renders stack + nutrition + 30-day plan
  /EvidenceTier.tsx        Strong/Moderate/Emerging badge
  /Verdict.tsx             One-line mom-test verdict component
  /HowItWorks.tsx          3-step strip below hero
  /Differentiators.tsx     "Why this beats a multivitamin" section
  /Footer.tsx              Disclaimer + sources note
/lib
  /engine.ts               Pure recommendation engine (deterministic)
  /supplements.ts          Supplement database (typed const)
  /nutrition.ts            Nutrition rule table (typed const)
  /types.ts                Shared types (UserInput, Recommendation, etc.)
  /verdict.ts              Verdict generator (one-line summary)
/public
  (no images required for V1 — pure CSS hero)
tailwind.config.ts
next.config.js
tsconfig.json
package.json
README.md
.env.example              (empty, placeholder only — no secrets used)
```

**No file outside this tree may be created. No file inside it may be omitted.**

## ENGINE CONTRACT

`lib/engine.ts` must export:

```ts
export function recommend(input: UserInput): Recommendation
```

Deterministic. Same input → same output. No randomness. No network.

`UserInput` shape (locked):

```ts
{
  age: number              // 18-90
  sex: 'male' | 'female'
  heightCm: number         // 140-220
  weightKg: number         // 40-200
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'high'
  sleepHours: number       // 3-12
  primaryGoal: 'energy' | 'muscle' | 'fat-loss' | 'longevity' | 'focus'
  dietPattern: 'omnivore' | 'vegetarian' | 'vegan' | 'keto' | 'mediterranean'
  caffeineCupsPerDay: number    // 0-8
  alcoholDrinksPerWeek: number  // 0-30
  symptomToFix: 'fatigue' | 'brain-fog' | 'poor-sleep' | 'low-strength' | 'bloating' | 'none'
}
```

`Recommendation` shape (locked):

```ts
{
  verdict: string                 // one-line mom-test sentence
  bmi: number
  goalConflict: string | null     // e.g. "Muscle + fat loss conflict — prioritize muscle"
  supplements: SupplementPick[]   // 3-7 items, ranked
  nutrition: {
    eatMore: string[]             // 5 items
    eatLess: string[]             // 3 items
    dailyTargets: {
      proteinGrams: number
      waterLiters: number
      sleepHours: number
    }
  }
  thirtyDayPlan: {
    week: 1 | 2 | 3 | 4
    focus: string
    actions: string[]
  }[]
  warnings: string[]              // interaction & timing warnings
}

SupplementPick = {
  name: string
  dose: string                    // e.g. "400 mg"
  timing: string                  // e.g. "with breakfast"
  evidenceTier: 'Strong' | 'Moderate' | 'Emerging'
  studyCount: number              // ballpark count of human RCTs
  whyForYou: string               // personalized one-liner
  pubmedExample?: string          // example PMID as a string (not fetched, hardcoded ref)
}
```

## SUPPLEMENT DATABASE — MINIMUM ENTRIES

`lib/supplements.ts` must contain at least these 14 entries with full metadata, drawn from well-established human evidence:

1. Creatine monohydrate
2. Vitamin D3
3. Magnesium glycinate
4. Omega-3 (EPA/DHA)
5. Whey/plant protein
6. Caffeine + L-theanine
7. Rhodiola rosea
8. Ashwagandha (KSM-66)
9. Zinc
10. B12 (methylcobalamin)
11. Iron (only triggered for menstruating females with fatigue symptom)
12. Probiotic (multi-strain)
13. Electrolytes (sodium/potassium)
14. Melatonin (low-dose, 0.3–1 mg)

Each entry includes: default dose range, timing, contraindications, evidence tier, study count band, and which goals/symptoms it maps to.

## RULES ENGINE — DETERMINISTIC LOGIC

The engine must use these rules (no LLM, no inference):

- **BMI calc** drives basic flags (under/normal/over).
- **Goal → core stack** mapping:
  - muscle → creatine + protein + vitamin D + magnesium
  - fat-loss → caffeine+theanine + protein + omega-3 + electrolytes
  - energy → B12 + vitamin D + magnesium + (iron if female + fatigue)
  - longevity → omega-3 + vitamin D + magnesium + creatine
  - focus → caffeine+theanine + omega-3 + rhodiola + magnesium
- **Symptom add-ons**:
  - poor-sleep → magnesium glycinate (PM) + melatonin low-dose
  - brain-fog → omega-3 + B12 + rhodiola
  - bloating → probiotic + reduce dairy/gluten in eatLess
  - fatigue → check iron (female) + B12 + vitamin D
- **Diet adjustments**:
  - vegan → force B12 + iron consideration + algae omega-3 note
  - keto → electrolytes mandatory
  - vegetarian → B12 + creatine emphasized
- **Interaction warnings** (must fire when applicable):
  - Zinc + copper note if zinc selected
  - Magnesium 4+ hours from caffeine
  - Iron not with calcium/coffee
  - Melatonin only if user reports poor-sleep — never default
- **Goal conflict detection**:
  - muscle + sedentary → "Activity level too low for muscle goal — fix activity first"
  - fat-loss + low protein diet pattern → flag protein priority
- **Cap stack at 7 items.** If more rules fire, rank by evidence tier then goal-fit.

## VERDICT GENERATOR

`lib/verdict.ts` returns a single sentence under 22 words, written like a friend would say it. Template-based, not LLM. Examples:

- "Your stack is creatine, protein, vitamin D, and magnesium — built for muscle on a 31-year-old male body."
- "You're a vegan focus-seeker — fix B12 and omega-3 first, everything else is secondary."

The verdict appears at the top of the result and on result-share preview.

## UI / DESIGN CONTRACT

### Mom-test rules (mandatory)

1. Hero headline answers "what is this" in 8 words or less.
2. Sub-headline answers "what do I do" in one sentence.
3. The form is visible without scrolling on a 390px-wide phone screen.
4. CTA button text is a verb + outcome. Not "Submit." Not "Get Started."
5. Result page leads with verdict, not data dump.

### AI-test rules (mandatory — must NOT look generic AI)

1. **No purple gradients.** No `from-purple-500 to-pink-500`. Banned.
2. **No glassmorphism / `backdrop-blur` everywhere.** Use sparingly or not at all.
3. **No emoji bullet lists.** Icons come from lucide-react only.
4. **No "AI-powered" copy.** Never use the phrase "AI-powered."
5. **No three-pricing-card layout.** No fake testimonials. No fake logo strip ("As seen in").
6. **Type-led design**: large, confident headlines. Editorial feel.
7. **Color palette locked**: deep ink black `#0A0A0A` background, paper white `#FAFAF7` text, single accent `#D4FF3A` (electric lime) for CTAs and evidence-Strong badges. Secondary accent `#FF6B35` (clinical orange) for warnings. No other colors.
8. **One serif headline font** (e.g. `Fraunces` or `Instrument Serif` via next/font/google) + one mono for data (`JetBrains Mono`) + system sans for body. Three fonts max.
9. **Asymmetric hero layout**: headline left, form right on desktop; stacked on mobile. Not centered.
10. **No stock illustrations.** No 3D blobs. No isometric.

### Hero must contain

- Eyebrow tag: `EVIDENCE-BACKED PROTOCOL`
- H1 (serif, large, tight tracking): something like *"Your supplement stack, written by the science."*
- One-line subhead: what it does + how long it takes
- Live `AssessmentForm` directly in the hero (right column on desktop, below H1 on mobile)
- Below-fold strip: "How it works" 3 steps + "Why this beats a multivitamin" 3 differentiators

### Result rendering

- Verdict in serif, large, top of result.
- Supplement cards in a grid: name + dose + timing + evidence tier badge + "why for you" line.
- Nutrition block: two columns "Eat more" / "Eat less".
- 30-day plan as 4 weekly cards.
- Warnings box in clinical-orange accent at the bottom of the result.

## DISCLAIMER (mandatory)

Footer must include: *"Apex Protocol provides educational information based on published human research. It is not medical advice. Consult a clinician before starting any supplement, especially if pregnant, nursing, on medication, or managing a medical condition."*

## ALLOWED EVIDENCE NOTATION

Every supplement entry includes a `pubmedExample` field with a real-format PMID string (e.g., `"PMID: 28615996"`). The Operator must hand-pick plausible PMIDs from well-known supplement research; if uncertain, leave the field undefined rather than fabricate. **Do not invent fake DOIs or fake citations.** Tier and study count are bucketed estimates, not exact claims.

## ACCEPTANCE CRITERIA (Judge will verify these)

1. `npm install && npm run build` completes with zero errors
2. Visiting `/` renders the hero with form visible above the fold on a 390×844 viewport
3. Submitting the form with a sample input (`{ age: 31, sex: 'male', heightCm: 178, weightKg: 82, activityLevel: 'moderate', sleepHours: 7, primaryGoal: 'muscle', dietPattern: 'omnivore', caffeineCupsPerDay: 2, alcoholDrinksPerWeek: 3, symptomToFix: 'fatigue' }`) returns a recommendation with:
   - 3–7 supplements
   - At least one Strong-tier pick
   - A non-empty verdict ≤ 22 words
   - A 4-week plan
   - At least one warning
4. Submitting a vegan input forces B12 into the stack
5. Submitting a poor-sleep symptom triggers magnesium + melatonin
6. Submitting a female + fatigue input triggers iron consideration
7. The string `"AI-powered"` does NOT appear anywhere in the source
8. The class `from-purple` does NOT appear anywhere in the source
9. The page is responsive: no horizontal scroll at 390px width
10. Lighthouse-style sanity: no `<img>` without alt, all buttons have accessible labels
11. README explains setup in under 30 lines
12. Disclaimer present in footer

## OPERATOR INSTRUCTIONS (binding)

1. Generate every file in the allowed file tree. No more, no less.
2. Write all files in one atomic output to `A1_OUTPUT.md` as a series of fenced code blocks, each preceded by `=== FILE: <relative path> ===`.
3. After all files, include a short manifest listing every file emitted.
4. Do not narrate. Do not explain choices. Do not skip files.
5. The recommendation engine is pure functions. No async, no fetch, no setTimeout.
6. Every supplement entry in `lib/supplements.ts` must be fully populated — no `TODO`, no placeholder strings.
7. The form must use native HTML inputs styled with Tailwind. No third-party form library.
8. Use `next/font/google` for fonts. Do not use `<link>` tags for fonts.
9. Target Node 18+, Next 14+. Use `"use client"` only on components that need state.
10. The home page (`app/page.tsx`) is a server component that imports a client `<Hero />` component which itself imports the client form.

## DRIFT WATCH (Watcher will flag any of these)

- Adding files outside the locked tree
- Using Pages Router
- Using `getServerSideProps` / `getStaticProps`
- Importing axios, redux, zustand, framer-motion, shadcn, or any UI kit
- Adding auth, database, or paywall
- Inventing PubMed IDs that look fake (must look like real 7-8 digit PMIDs)
- Using purple gradients or glassmorphism
- Using the phrase "AI-powered"
- Using emojis as icons in the UI
- Calling external APIs at runtime

## HANDOFF

→ Sentinel (N=003) reads this file and outputs GATE: OPEN or GATE: BLOCK
