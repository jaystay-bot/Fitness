# CONTEXT_PACKET.md

**N:** 001 **Status:** ACTIVE

---

## PROJECT

Apex Protocol — personalized supplement + nutrition stack engine.

## STACK (locked by Architect, matches Jay's defaults)

- Next.js 14+ App Router, TypeScript, Tailwind CSS
- Deploy target: Vercel
- No auth, no DB, no payments, no external API calls at runtime
- lucide-react for icons
- next/font/google for typography

## ENGINE TYPE

Deterministic pure-function rules engine. Same input → same output. No LLM at runtime.

## CRITICAL CONSTRAINTS

**Banned in source:**

- The string `"AI-powered"`
- Class fragment `from-purple`
- Pages Router (`pages/`, `getServerSideProps`, `getStaticProps`)
- External API calls in the recommendation route
- Auth libraries, DB libraries, payment libraries
- Emoji as bullet/list markers
- Fake/invented citation IDs

**Required in source:**

- `app/api/recommend/route.ts` POST handler
- `lib/engine.ts` exporting `recommend(input: UserInput): Recommendation`
- 14 supplement entries minimum in `lib/supplements.ts`
- Disclaimer in footer
- Mobile-first hero (form visible at 390×844)

## COLOR PALETTE (locked)

- Background: `#0A0A0A` (deep ink)
- Text: `#FAFAF7` (paper white)
- Primary accent: `#D4FF3A` (electric lime) — CTAs, Strong-tier badges
- Warning accent: `#FF6B35` (clinical orange) — warnings, interactions
- No other colors permitted

## TYPOGRAPHY (locked)

- Serif headlines: `Fraunces` or `Instrument Serif` (next/font/google)
- Mono for data: `JetBrains Mono`
- Body: system sans
- Three font families maximum

## FILE TREE (full list — no additions, no omissions)

```
app/layout.tsx
app/page.tsx
app/globals.css
app/api/recommend/route.ts
components/Hero.tsx
components/AssessmentForm.tsx
components/ResultCard.tsx
components/EvidenceTier.tsx
components/Verdict.tsx
components/HowItWorks.tsx
components/Differentiators.tsx
components/Footer.tsx
lib/engine.ts
lib/supplements.ts
lib/nutrition.ts
lib/types.ts
lib/verdict.ts
tailwind.config.ts
next.config.js
tsconfig.json
package.json
README.md
.env.example
```

## OPERATOR OUTPUT FORMAT

Every file written to `A1_OUTPUT.md` using the delimiter:

```
=== FILE: <relative-path> ===
```

followed by a fenced code block with the file contents. End with a manifest of files emitted.

## ACCEPTANCE TESTS (Judge will run)

1. `npm install` succeeds
2. `npm run build` succeeds with zero errors
3. Sample muscle/male input → 3–7 supplements, ≥1 Strong tier, verdict ≤22 words
4. Vegan input → B12 forced into stack
5. `poor-sleep` symptom → magnesium + melatonin appear
6. Female + fatigue → iron consideration appears
7. Source contains zero matches for `"AI-powered"`
8. Source contains zero matches for `from-purple`
9. Page is responsive at 390px width
10. Footer disclaimer present

## NO PRIOR FAILURES

This is the first cycle. No recovery context needed.

## DOWNSTREAM

- Sentinel reads S1_LOCKED.md and gates the system
- Operator reads S1_LOCKED.md + this packet and writes A1_OUTPUT.md
- Watcher diff-checks A1_OUTPUT.md against S1_LOCKED.md
- Judge runs the acceptance tests and writes TRUTH_RESULT.md
