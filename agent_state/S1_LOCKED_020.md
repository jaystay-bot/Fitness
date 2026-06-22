# S1_LOCKED_020

N_ID: N_020

Intent:
Premium visual redesign — replace the harsh neon-lime + neon-orange palette and
the flat, border-only cards with a refined accent, calmer warning color, and
elevated surfaces with depth. Pure presentation; zero behavior change.

Scope:
- Refine the four theme tokens (ink/paper/lime/clinical) and add `surface`,
  `elevate`, and elevation shadows in the Tailwind config.
- Add page-level depth (subtle backdrop gradient), refined focus ring, and
  smoothed font rendering in global CSS.
- Give form fields, the form container, the submit button, supplement cards,
  30-day plan cards, and nutrition lists real surface fills + softer radii.
- Update the locked visual-baseline test to the new intentional color values.

Allowed files:
- tailwind.config.ts
- app/globals.css
- components/AssessmentForm.tsx   (className/styling only)
- components/ResultCard.tsx        (className/styling only)
- tests/visual.spec.ts             (locked-value update only)
- 8HAT_SYSTEM.md, AGENTS.md         (protocol install — this turn only)
- agent_state/*                     (state trail)

Forbidden files:
- lib/** (no engine/data/logic change)
- app/api/** (no route change)
- any component other than AssessmentForm / ResultCard
- package.json / package-lock.json (no dependency change)

Deliverables:
- Refined, premium palette applied app-wide via tokens.
- Cards/inputs/buttons no longer flat; visible elevation + hierarchy.
- Build + typecheck green.

Verify command:
```bash
npx tsc --noEmit && npm run build
```

Parallel safe: false (touches shared theme + global CSS).
Estimated cost: < $1.00
Estimated time: ~20 min
Stop conditions: tsc or build non-zero; any forbidden file changed.

Commander authorization note:
Changing the locked visual palette overrides a STANDING JUDGE PRIMITIVE
(body bg + CTA color). Authorized by Commander — the palette is the explicit
product complaint. New locked values recorded in QUEUE.md.
