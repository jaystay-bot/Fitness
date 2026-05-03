# CURRENT_N.md

**N:** 001 **Hat:** COMMANDER (Jay) **Date:** 2026-05-03 **Status:** ACTIVE

---

## INTENT

Build a one-shot, end-to-end personalized supplement and nutrition recommendation product that produces evidence-backed output from a user's biometric and lifestyle inputs.

## PRODUCT NAME (working)

**Apex Protocol** — *"The supplement & nutrition stack the science actually supports for your body."*

## CORE OUTCOME

User enters: age, sex, height, weight, activity level, sleep hours, primary goal (energy / muscle / fat loss / longevity / focus), dietary pattern, current health flags (caffeine intake, alcohol, smoking), and one symptom they want fixed.

System returns:

1. A ranked supplement stack (3–7 items) with dosage, timing, and the specific peer-reviewed evidence tier behind each pick.
2. A daily food protocol (what to eat, what to cut) tied to the same goal.
3. A 30-day execution plan in plain language.
4. A "why this beats a multivitamin" one-line verdict.

## DIFFERENTIATION (must pass mom-test + AI-test)

This is not another quiz-to-affiliate-link app. The wedge is:

- **Evidence tier shown on every pick** (Strong / Moderate / Emerging) with source count.
- **Stack interaction warnings** (e.g., zinc blocks copper absorption, magnesium timing vs. caffeine).
- **Goal-conflict detection** (user wants muscle + fat loss → system tells them which to prioritize and why).
- **No login wall, no email gate** on the first result. Result is shown instantly.
- **One-line verdict at the top** before the deep stack — mom-test readable.

## DELIVERABLE FOR THIS N

A complete landing page + working recommendation engine, shippable in one Next.js App Router project. Hero page must visually demonstrate the product working (live demo embedded in hero, not a screenshot).

## CONSTRAINTS (Commander level)

- One shot. Start to finish. No follow-up cycles unless FAIL.
- Use Jay's stack defaults (Next.js App Router, Tailwind, TypeScript, Vercel-ready).
- No auth. No database. No payments. Pure front-end + one API route for the recommendation engine.
- Open-source / public-domain evidence sources only (PubMed IDs, examine.com-style citations as text references — no scraped data).
- Mobile-first. Hero must work on a phone screen.

## SUCCESS DEFINITION

A non-technical person ("the mom test") can:

1. Land on the hero
2. Understand what it does in under 5 seconds
3. Get a personalized stack in under 60 seconds
4. Read the result and feel it was written for *them*, not generic

## HANDOFF

→ Architect (N=002) reads this file and writes S1_LOCKED.md
