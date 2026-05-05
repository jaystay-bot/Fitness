# RECONSTRUCTED FROM GIT HISTORY
# This cycle did not run through the full six-hat loop. State reconstructed post-hoc from commit hash e00095f45abd2c8372aa175c1e1022892d918386 on 2026-05-04.

---

# S1_LOCKED_009.md

**N:** 009 **Hat:** ARCHITECT (reconstructed) **Date:** 2026-05-04

---

## SCOPE

### NEW FILES
None.

### MODIFIED FILES

- `components/BodyVisualization.tsx` — add `overflow="visible"` to root SVG element to prevent label clipping.
- `components/BottleScanner.tsx` — handle HTTP 401 and 403 responses with specific user-readable strings instead of surfacing raw error text.
- `components/ResultCard.tsx` — body map / food / 30-day plan collapsed by default; trust/value copy block above supplement stack; UpgradeButton changed to primary variant; sticky CTA bar for free users.

### FROZEN FILES

All files not listed above. Specifically: lib/engine.ts, lib/types.ts, lib/supplements.ts, lib/conflicts.ts, lib/variation.ts, lib/confidence.ts, lib/units.ts, lib/slug.ts, lib/timeline.ts, lib/timelineData.ts, lib/labParser.ts, lib/labMapping.ts, lib/scanner.ts, lib/voice.ts, lib/voiceParser.ts, lib/bodySystems.ts, lib/svgPositions.ts, lib/subscription.ts, lib/spearCopy.ts (if present), all API routes, all other components, tailwind.config.ts, app/globals.css, postcss.config.js, supabase/*, package.json (no new deps).

## ACCEPTANCE CRITERIA (reconstructed)

1. npm run build passes with zero errors.
2. BodyVisualization SVG labels visible without clipping at any viewport.
3. BottleScanner renders "Sign in to use the scanner" on 401.
4. BottleScanner renders "Upgrade to Pro to use the scanner" on 403.
5. ResultCard mounts with body map, food, and 30-day plan sections collapsed.
6. Trust/value copy block renders above the supplement stack.
7. UpgradeButton renders with primary styling.
8. Sticky CTA bar present for free users.
9. No banned patterns (streak, achievement, gamification copy).
10. Engine output byte-identical to N=008.
