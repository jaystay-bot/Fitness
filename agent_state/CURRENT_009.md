# CURRENT_009.md

**N:** 009 **Hat:** COMMANDER (Jay) **Date:** 2026-05-04 **Status:** ACTIVE **Predecessor:** N=008 PASS

---

## INTENT

N=009 is the first cycle of Project Spear, the strategic pivot from supplement recommendation to insurance replacement. Three atomic objectives. First, rebuild the homepage hero with new positioning copy that establishes the un-insurance thesis using the locked statement *"Insurance hopes you get sick and do not use it. We hope you stay healthy and keep your money."* Second, add a three-button symptom entry flow as a new section below the hero with the buttons **What hurts**, **What do I need**, and **I know the product**, where each button routes the user to the existing assessment form pre-configured for that path. Third, add a vault dashboard mockup component that displays four numbers labeled **Vault Balance**, **This Month Saved**, **Health Score**, and **Find Care**, shown as a static preview at this stage with placeholder values that demonstrate the math from the mission file: $200/month × 12 = $2,400 kept versus $0 kept under traditional insurance. The supplement recommendation engine remains fully functional and unchanged. Subsequent cycles will wire the vault to real Stripe Treasury, build the provider marketplace, add lab integration, and ship the Amazon fulfillment loop.

## SCOPE BOUNDARY

Positioning, copy, and visual structure only. No payment infrastructure. No IOTA hashing. No Amazon integration. No lab partnership. No provider marketplace functionality. The mandatory clinical-orange disclosure on `VaultDashboard` ("Vault funding ships in N=010") is non-negotiable; shipping a vault dashboard without that disclosure would mislead users.

## SUCCESS DEFINITION

- Homepage `/` opens with the new `SpearHero` carrying the verbatim un-insurance thesis copy.
- Three-button entry flow visible below the hero, each button scrolls smoothly to the existing assessment form.
- Vault dashboard renders four cards with the locked labels and placeholder values, plus the disclosure.
- The existing supplement recommendation flow continues to work identically: form submit → recommendation → `/r/[slug]` → email capture → all N=001..N=008 behavior preserved.
- Anonymous visitor experience: no auth, no payment, no broken paths.

## CONSTRAINTS (Commander level)

- Engine, supplement table, conflict logic, variation, confidence, units, slug, timeline, lab, scanner, voice, body-systems, subscription — all FROZEN.
- All API routes, Tailwind config, globals.css, postcss config, all migrations — all FROZEN.
- `AssessmentForm.tsx` is FROZEN (the form stays as it is; `SymptomEntry` routes to it but does not modify it).
- The old `Hero.tsx` file is preserved (not deleted) for potential rollback, but is no longer mounted by `app/page.tsx`.
- Zero new dependencies.
- Locked palette only: `#0A0A0A` ink, `#FAFAF7` paper, `#D4FF3A` lime, `#FF6B35` clinical.
- No clinical-blue color scheme, no stethoscope iconography, no chatbot UI, no medical-diagnostic language.

## HANDOFF

→ Architect writes `/agent_state/S1_LOCKED_009.md`. All prior locked contracts remain binding.
