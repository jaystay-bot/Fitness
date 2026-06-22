# S1_LOCKED_027

N_ID: N_027

Intent:
Transform the top-of-page hero into a cinematic, elite first impression: an
animated aurora backdrop (mint + gold blooms), a fine botanical SVG motif, a
champagne-gold emphasis in the headline, staggered entrance motion, a premium
primary CTA that routes to the assessment form, and a quiet trust line. Uses the
N=026 motion keyframes + palette. Presentation only.

Scope / Allowed files:
- components/SpearHero.tsx (full rewrite into a kinetic hero; lucide icons only,
  NO emoji; CSS motion only, no new dependency)
- agent_state/* (trail)

Forbidden files:
- everything else (no engine/route/theme/other component; no package change)

Deliverables:
- Aurora + grain hero that animates in on load, with a working "Build my
  protocol" CTA anchored to #assessment-form.
- Respects reduced-motion (global guard from N=026).
- Build + typecheck green; screenshot proof desktop + mobile.

Verify command:
```bash
npx tsc --noEmit && npm run build
```
Plus desktop + mobile screenshots of the new hero.

Parallel safe: false (shared hero).
Stop conditions: tsc/build non-zero; any forbidden file changed; any emoji added.
