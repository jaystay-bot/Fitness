# S1_LOCKED_035

N_ID: N_035

Intent:
Replace the dark "Apothecary" theme with a LIGHT, vibrant, premium "Daylight"
theme (Commander: the dark green reads generic/"meathead"; wants whites, blues,
vibrant green/yellow). Flip tokens to light, rebuild the global canvas to a clean
white with soft vibrant washes, and fix every hardcoded dark-only color in the
chart/visualization components so nothing renders invisible or mis-toned on white.
Also fix any overlap/legibility glitch found during screenshot verification.

New palette ("Daylight"):
- ink (page bg / text-on-accent) #F7F9FC  rgb(247,249,252)
- surface (cards)   #FFFFFF
- elevate (inputs)  #EEF2F8
- paper (text)      #0F1B2D  deep navy
- lime (PRIMARY)    #2563EB  vivid blue
- gold (secondary)  #047857  emerald (readable on white)
- clinical (warning)#E11D48  rose
- canvas washes: soft blue + emerald + amber radials on white (vibrant, light)

Scope / Allowed files:
- tailwind.config.ts            (palette + shadows + glow)
- app/globals.css              (light canvas, washes, focus, selection, grain off)
- app/layout.tsx               (Clerk vars)
- tests/visual.spec.ts         (re-freeze locked body bg + CTA)
- components/commerce/BottleVisual.tsx        (SVG hexes → light palette)
- components/TimelineProjection.tsx           (hardcoded chart colors)
- components/InteractiveTimeline.tsx          (hardcoded chart colors)
- components/BodyVisualization.tsx            (hardcoded SVG colors)
- components/SpeakToDoctorButton.tsx          (#FF6B35 → clinical)
- agent_state/* (trail; QUEUE primitive re-freeze)

Forbidden files:
- lib/** ; app/api/** ; package.json/lock

Deliverables:
- Whole app reads light/vibrant; charts + body map legible on white.
- No overlap/contrast glitches on landing, form, result, /shop (desktop+mobile).
- tsc + build green; screenshots.

Verify command:
```bash
npx tsc --noEmit && npm run build
```
Plus desktop+mobile screenshots of landing, result (with charts), and /shop.

Parallel safe: false (shared theme). Stop: tsc/build non-zero; forbidden edit.

## Scope amendment (type-forced + completeness)
- components/AccountMenu.tsx, app/sign-in/[[...sign-in]]/page.tsx, app/sign-up/[[...sign-up]]/page.tsx — Clerk appearance vars (were hardcoded dark palette).
