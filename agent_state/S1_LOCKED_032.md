# S1_LOCKED_032

N_ID: N_032

Intent:
Carry the elite motion language beyond the hero and add a discoverable nav to
/shop. Add a slim top nav (brand + "Compare prices" → /shop) to SpearHero, and
give the SymptomEntry front-door cards and the VaultDashboard preview cards a
staggered fade-up entrance + hover lift. Presentation only.

Scope / Allowed files:
- components/SpearHero.tsx        (slim top nav row with /shop link)
- components/SymptomEntry.tsx     (fade-up + hover lift on the 3 cards)
- components/VaultDashboard.tsx   (fade-up + hover lift on preview cards)
- agent_state/* (trail)

Forbidden files:
- lib/** ; app/** ; other components ; package.json/lock

Deliverables:
- Visible /shop nav at the top; consistent motion on the landing cards.
- Build + typecheck green; screenshots.

Verify command:
```bash
npx tsc --noEmit && npm run build
```
Plus full-page landing + /shop screenshots (also serve the "show all work" ask).

Parallel safe: false (shared landing components). Stop: tsc/build non-zero; forbidden edit.
