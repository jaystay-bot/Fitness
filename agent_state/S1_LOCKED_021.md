# S1_LOCKED_021

N_ID: N_021

Intent:
Fix the mobile rendering bug where `ParallaxLedger`'s scroll-driven transform
shifts the Evidence Ledger over the hero's numbered list, making text overlap
and become unreadable on narrow screens.

Root cause:
`ParallaxLedger` runs its `translate3d(0, offset, 0)` parallax on all viewports.
On `lg+` the ledger lives in a sticky side column where the shift is harmless;
on stacked mobile/tablet layouts the same shift overlaps the content above it.

Scope:
- Gate the parallax effect to `(min-width: 1024px)` AND no reduced-motion.
- Clear the inline transform whenever parallax is disabled (mobile / resize down).
- Re-evaluate on media-query change so resizing across the breakpoint is correct.

Allowed files:
- components/ParallaxLedger.tsx
- agent_state/* (trail)

Forbidden files:
- everything else (no engine, routes, theme, other components)

Deliverables:
- No overlap on 390px width; desktop parallax preserved.
- Build + typecheck green.

Verify command:
```bash
npx tsc --noEmit && npm run build
```
Plus screenshot proof at 390px showing the ledger stacked cleanly above the form.

Parallel safe: false (touches a shared hero component).
Stop conditions: tsc/build non-zero; any forbidden file changed.
