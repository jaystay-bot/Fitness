# A1_OUTPUT_032

N_ID: N_032

Files changed:
- components/SpearHero.tsx — slim top nav (brand + "Build protocol" + mint
  "Compare prices" → /shop with Store icon).
- components/SymptomEntry.tsx — front-door cards: staggered animate-fade-up +
  hover lift; upgraded to surface fill + rounded-xl + shadow.
- components/VaultDashboard.tsx — preview cards: staggered fade-up + hover lift.

Commands run:
- npx tsc --noEmit → 0 ; npm run build → 0
- Screenshots: landing hero (nav visible), front-door, mobile, /shop, result.

Notes:
- Pure CSS motion (N=026 keyframes); reduced-motion honored globally.
- No engine/route/dependency change.
