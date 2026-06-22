# A1_OUTPUT_024

N_ID: N_024

Files changed:
- lib/spearCopy.ts — rewritten to mission copy (hero eyebrow/headline/subhead,
  "what you get" panel, protocol-output preview, thesis bullets + closer).
  Removed vaultMath / vaultLabels / vaultCaptions / vaultDisclosure.
- components/SpearHero.tsx — insurance "$2,400 you keep / Traditional insurance
  $0" aside replaced with the "What you get" checklist panel (now a surface card).
  Currency formatter removed.
- components/VaultDashboard.tsx — fabricated "$2,400 vault balance / $200 saved /
  health score 87 / find care" cards + the funding disclosure replaced with an
  honest preview of protocol outputs (Ranked / Protein + water / Eat more-less /
  Week by week). USD formatter removed.
- components/UninsuranceThesis.tsx — aria-label "Un-insurance thesis" → "What
  this is"; bullets + closer now from the re-pointed copy.
- app/page.tsx — openGraph/twitter metadata re-pointed off the insurance lines.

Commands run:
- npx tsc --noEmit → exit 0
- npm run build → exit 0
- banned-pattern grep → clean; insurance/vault-word grep → only comments +
  internal component identifiers (no rendered text).
- screenshots: n024_repositioned_desktop.png, n024_repositioned_mobile.png

Notes:
- Standing reminder satisfied: the vault FUNDING CLAIMS are removed, so the
  mandatory funding disclosure is no longer applicable. QUEUE updated.
- Engine / routes / data untouched.

Out-of-scope items noticed:
- Component identifiers/filenames still say Vault/Uninsurance (internal only;
  rendered text is clean). Optional rename later.
- /api/og image generator + layout.tsx Clerk appearance colors still reference
  old palette/insurance framing — separate small follow-ups.
