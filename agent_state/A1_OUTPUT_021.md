# A1_OUTPUT_021

N_ID: N_021

Files changed:
- components/ParallaxLedger.tsx — gate the parallax effect to `(min-width:
  1024px)` and no reduced-motion; clear the inline transform when disabled;
  re-evaluate on media-query change. State renamed `reduced` → `enabled`.

Diff summary:
The scroll-driven `translate3d` now only runs on `lg+`, where the ledger is in
the sticky side column. On mobile/tablet it renders in normal flow with no
transform, so it no longer shifts over the hero's numbered list. Desktop
parallax behavior is unchanged.

Commands run:
- npx tsc --noEmit  → exit 0
- npm run build      → exit 0
- screenshot @ 390px → agent_state/screenshots/n021_fixed_mobile_form.png
  (hero bullets readable; ledger stacked cleanly below the hero copy)

Notes:
- Engine + routes untouched.

Out-of-scope items noticed:
- EvidenceLedger cards still use border-only (no surface fill). Cosmetic; could
  fold into a later polish pass, not a bug.
