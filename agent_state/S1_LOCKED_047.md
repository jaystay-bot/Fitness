# S1_LOCKED_047

N_ID: N_047

Intent:
Kill the two weak visuals on the result (Commander: "AI slop") and replace the
body figure with a mind-blowing 3D piece.

1. REMOVE the SupplementBottle3D (two gray cylinders) entirely — delete the
   component + its usage. No bottle.
2. REPLACE the flat SVG body silhouette with a new AnatomyHologram: a procedural
   holographic WIREFRAME SKELETON in three.js (skull wireframe sphere, segmented
   spine, 4-rib ribcage + sternum, clavicles, arms, pelvis, legs, joint nodes),
   rotating slowly on a dark panel, with a sweeping "scan ring" and pulsing
   glowing nodes at exactly the body regions where the user's stack acts
   (lime = normal, rose = warning), mapped from the existing BODY_SYSTEMS data.
   Holographic cyan, additive blending. The explanatory per-system list stays.

Direction chosen by Commander: holographic wireframe scan; bottle removed.

Honesty/robustness:
- prefers-reduced-motion → one static frame, no animation.
- IntersectionObserver gates the rAF loop; all geometries/materials disposed.

Scope / Allowed files:
- components/AnatomyHologram.tsx (new)
- components/BodyVisualization.tsx (use the hologram; drop the SVG)
- components/ResultCard.tsx (remove the bottle import + block + unused `featured`)
- components/SupplementBottle3D.tsx (DELETE), lib/svgPositions.ts (DELETE — now unused)
- agent_state/* (trail)

Forbidden files:
- engine/route/types/data. Visual only.

Deliverables:
- 3D holographic skeleton replaces the body figure; bottle gone; tsc/build green.

Verify command:
```bash
npx tsc --noEmit && npm run build
```
CAVEAT: sandbox has no browser — the 3D output could NOT be visually verified
here. Built by construction (geometry math + viewport fit reviewed). Commander
to eyeball proportions/colors on the live deploy; expect a tuning pass.

Parallel safe: false (shared ResultCard). Stop: tsc/build non-zero.
