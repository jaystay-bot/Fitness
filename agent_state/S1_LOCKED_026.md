# S1_LOCKED_026

N_ID: N_026

Intent:
Re-skin the entire app to the "Elite Apothecary" colorway — a premium wellness
brand feel — by redefining the theme tokens (cascades app-wide) and upgrading the
global background to a refined evergreen aurora. Retire the energy-drink neon
lime for a vital mint-emerald primary; add a champagne-gold luxe accent; warm
bone text; deep evergreen-obsidian canvas. Add motion primitives (keyframes) for
the next cycle to use. Presentation only; no engine/route/data change.

New palette:
- ink (canvas)   #0B0E0C   rgb(11,14,12)
- surface        #131815
- elevate        #1C231E
- paper (text)   #EFEDE4
- lime (primary, token kept so it cascades) → vital mint-emerald #5FE3A1  rgb(95,227,161)
- gold (NEW)     #E4C896   champagne luxe accent
- clinical       #EF8A63   warm coral warning

Scope / Allowed files:
- tailwind.config.ts   (palette + gold token + glow color + motion keyframes/animation)
- app/globals.css      (canvas color, premium aurora background, focus ring, selection)
- app/layout.tsx       (Clerk appearance vars → new palette; body bg already token)
- tests/visual.spec.ts (re-freeze locked body bg + CTA color)
- agent_state/*        (trail + QUEUE primitive re-freeze)

Forbidden files:
- lib/** ; app/api/** ; components/** (component motion lands in N=027)
- package.json / lock  (no dependency this cycle — pure CSS motion)

PRIMITIVE IMPACT (Commander-authorized):
Re-freezes the visual locked-color primitive again (body bg rgb(11,14,12),
CTA rgb(95,227,161)). Recorded in QUEUE + visual.spec in lockstep.

Deliverables:
- Whole app reads as elite mint/gold-on-evergreen, not neon-on-black.
- Premium animated aurora canvas; build + typecheck green.

Verify command:
```bash
npx tsc --noEmit && npm run build
```
Plus desktop + mobile screenshots of the new canvas.

Parallel safe: false (shared theme + global CSS).
Stop conditions: tsc/build non-zero; forbidden file changed.
