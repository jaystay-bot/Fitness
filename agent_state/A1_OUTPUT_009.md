# A1_OUTPUT_009.md

**N:** 009 **Hat:** OPERATOR **Status:** EMITTED

## New files

- `lib/spearCopy.ts` — `SPEAR_COPY` const containing every locked Project Spear string (eyebrow, headline, subhead, three-button labels and captions, vault labels, vault math, vault captions, mandatory disclosure, three thesis bullets, closer). Also exports `ASSESSMENT_FORM_ANCHOR = "assessment-form"` so `SymptomEntry` and `app/page.tsx` agree on the in-page anchor target.
- `components/SpearHero.tsx` — server-component-safe. Asymmetric grid (`lg:grid-cols-[2fr_1fr]`), eyebrow + serif headline + subhead in the left column, vault math preview in the right column. Lime `$2,400` you-keep number above a clinical-orange strikethrough `$0` traditional-insurance number. Locked palette only.
- `components/SymptomEntry.tsx` — server-component-safe. Three `<a href="#assessment-form">` buttons rendered as a `grid-cols-1 md:grid-cols-3` list. Each button carries `data-spear-path` (`what-hurts | what-do-i-need | i-know-product`) for future cycles to pre-configure the form. Mono labels in paper-white, captions below in paper-white-60% mono.
- `components/VaultDashboard.tsx` — server-component-safe. Four cards in `grid-cols-2 sm:grid-cols-4`: Vault Balance ($2,400), This Month Saved ($200), Health Score (87), Find Care (Browse). The Find Care value is rendered in lime to suggest interactivity without yet being a link target. Below the grid, the literal `vaultDisclosure` string in `text-clinical` 11px mono — the mandatory honest preview disclosure.
- `components/UninsuranceThesis.tsx` — server-component-safe. Three serif lines (`text-3xl sm:text-4xl lg:text-5xl`), each prefixed by a small mono ordinal (`01`, `02`, `03`) in lime. Single mono closer line below: `"No co-pays. No denials. No leakage."`

## Modified files

- `app/page.tsx` — page composition replaced. New top-to-bottom order: `SpearHero` → `SymptomEntry` → `VaultDashboard` → `UninsuranceThesis` → `<section id="assessment-form">{<Hero />}</section>` → `HowItWorks` → `Differentiators` → `Footer`. The `Hero` component (which owns the live `<AssessmentForm />` and the `<ResultCard />`-on-submit flow from N=001..N=008) is preserved unmodified and continues to drive the recommendation experience. The wrapping `<section id="assessment-form" className="scroll-mt-8">` is the target for the three SymptomEntry buttons. `metadata` updated to lead with the Project Spear positioning.
- `lib/types.ts` — added `SpearEntryPath`, `VaultPreview`, `UninsuranceCopy`. `UserInput`, `Recommendation`, all prior shapes unchanged.
- `package.json` — **no diff**. Zero new dependencies; positioning and visual structure only.

## Frozen — untouched this cycle

- `lib/engine.ts`, `lib/supplements.ts`, `lib/conflicts.ts`, `lib/variation.ts`, `lib/confidence.ts`, `lib/units.ts`, `lib/slug.ts`, `lib/timeline.ts`, `lib/timelineData.ts`, `lib/labParser.ts`, `lib/labMapping.ts`, `lib/scanner.ts`, `lib/voice.ts`, `lib/voiceParser.ts`, `lib/bodySystems.ts`, `lib/svgPositions.ts`, `lib/subscription.ts`, `lib/supabase.ts`, `lib/stripe.ts`, `lib/email.ts`, `lib/nutrition.ts`, `lib/verdict.ts`
- All API routes
- `tailwind.config.ts`, `app/globals.css`, `postcss.config.js`, `next.config.js`, `tsconfig.json`, `middleware.ts`, `.env.example`, `vercel.json`
- `components/Hero.tsx` (preserved unchanged for rollback; still mounted by `app/page.tsx` inside the `#assessment-form` wrapper)
- `components/AssessmentForm.tsx` and every other N=001..N=008 component
- `app/layout.tsx`, `app/r/[slug]/page.tsx`, `app/pricing/page.tsx`, `app/account/page.tsx`, sign-in/sign-up
- All Supabase migrations, all Python files

## Notes

- The clinical-orange disclosure on `VaultDashboard` is rendered via the literal `SPEAR_COPY.vaultDisclosure` string (`"Preview only. Vault funding ships in N=010. Provider marketplace ships in N=011."`). It is non-negotiable and protects against any user assuming the vault is currently funded.
- `SymptomEntry` does not yet pre-configure the form per path; all three buttons currently scroll to the same `#assessment-form` anchor. `data-spear-path` carries the intended path so a later cycle can wire up form pre-fill without re-touching the front door.
- The locked palette is preserved exactly: `#0A0A0A` ink, `#FAFAF7` paper, `#D4FF3A` lime, `#FF6B35` clinical. No new colors. No new fonts.
- Build clean: home `/` first-load JS unchanged in shared chunks (87.3 kB); the four new sections render server-side and emit pure markup, contributing only to the route's static payload.
