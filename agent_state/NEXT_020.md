# NEXT_020.md

**Proposed by:** Judge of N=019 **Date:** 2026-05-05 **Predecessors:** N=001..N=019 (full plugin layer + audit trail + commercial layer + Spear positioning)

---

## INTENT

N=020 is the **vault funding cycle** — the first revenue-compounding cycle after the wearable-layer expansion completes. The locked priority build order's plugin phase (Apple Health → Amazon → telehealth → lab-placeholder → Whoop → Oura) is now done; the next priority is converting the **non-functional vault** mocked in N=009 Project Spear positioning into a **working revenue surface**.

Rationale:
- N=009's `VaultDashboard` carries the literal `"Vault funding ships in N=010. Provider marketplace ships in N=011."` disclosure. N=010 shipped feedback widget instead. N=011 shipped chart legibility instead. The disclosure is now mathematically incorrect — the vault is positioned but not funded after 10 cycles of "ships next." Per the standing reminder in `agent_state/QUEUE.md`, "Removing it before the funding flow is real is an ethical failure and a chargeback risk."
- Subscription revenue (N=006) and Amazon affiliate revenue (N=015) are shipping. Vault funding compounds with both — converting positioned trust into a routed financial product.
- Real LabCorp / Quest API integration requires HIPAA partner approval. Telehealth API integration requires partner approval. Vault funding via Stripe Treasury does not require external partnership beyond Stripe (already integrated since N=006).

Three objectives:

**A — Stripe Treasury (or equivalent) integration.**
A new `lib/vault/stripeTreasury.ts` wraps the Stripe Treasury API for opening a financial account on behalf of the user. Requires `STRIPE_TREASURY_API_KEY` env var. Treasury operations: create financial account, list balance, list inbound transfers. Server-only.

**B — VaultDashboard becomes funded.**
The N=009 `VaultDashboard` currently shows a hardcoded preview. N=020 wires it to read live balance + savings from `/api/vault/status` (new route). Authenticated users see their real account state; anonymous users see the preview. The `"Vault funding ships in N=010"` disclosure is replaced with the actual funded state OR an explicit "Setup pending" CTA.

**C — Vault setup flow.**
A new `/account/vault` page guides authenticated users through KYC handoff (Stripe Identity), account creation, ACH funding instructions. Pro-tier gated.

## SCOPE BOUNDARY

The vault-funding cycle is the largest cycle since N=006 (commercial launch readiness). Expected scope:

- 4–6 new lib files (`lib/vault/stripeTreasury.ts`, `lib/vault/types.ts`, `lib/vault/kyc.ts`).
- 3–4 new API routes (`/api/vault/status`, `/api/vault/setup`, `/api/vault/webhooks/stripe-treasury`).
- 2 new components (`VaultSetupCard`, `VaultBalanceCard`).
- 1 new Supabase migration (`0006_vault_accounts.sql`) — minimum-PII storage of Stripe Treasury account IDs (NOT the Treasury balance itself; Stripe is source of truth).
- Surgical modifications to N=009 `VaultDashboard.tsx` to replace the hardcoded preview with live data + the disclosure update.
- New env vars: `STRIPE_TREASURY_API_KEY`, `STRIPE_IDENTITY_API_KEY`.

## SUCCESS DEFINITION (high-level — Architect will lock specifics)

- Pro-tier authenticated users can open a Treasury financial account through the `/account/vault` flow.
- The N=009 `VaultDashboard` displays real account balance for funded users, an explicit "Setup pending" CTA for users without an account, and a sign-in CTA for anonymous visitors.
- The `"Vault funding ships in N=010"` disclosure is REMOVED — the literal that was mandatory in N=009 SESSION_LOG is no longer required because vault funding actually ships.
- All N=019 behaviors regress green.
- Stripe webhooks are signature-verified per the N=006 pattern.
- HIPAA-equivalent privacy posture: no PII beyond Stripe customer/account IDs persists.

## CONSTRAINTS

- No engine modification.
- No Signal Stack core modification.
- No N=014–N=019 plugin code modification.
- New runtime dependency permitted ONLY for Stripe SDK Treasury support (likely already in `stripe` package — verify before installing anything new).
- The vault page is Pro-gated; DEV MODE remains active for testing.
- Environment-variable-gated activation: when `STRIPE_TREASURY_API_KEY` is unset, the vault page shows a "Coming soon" state and the `/api/vault/*` routes return 503. Mirrors the N=006 launch-readiness pattern.

## HANDOFF

→ N=020 Commander reads:
  1. `agent_state/CURRENT_N.md` through `CURRENT_019.md`
  2. `agent_state/S1_LOCKED.md` through `S1_LOCKED_019.md`
  3. `agent_state/AUDIT_TRAIL_PROTOCOL.md` (binding since N=013)
  4. `agent_state/TRUTH_RESULT_019.md`
  5. `agent_state/QUEUE.md` (note the standing reminder about the vault funding disclosure)
  6. `lib/stripe.ts` (existing Stripe integration from N=006)
  7. `lib/subscription.ts` + `lib/proAccess.ts` (auth + tier gating patterns)
  8. `lib/supabase.ts` and prior migrations (RLS pattern reference)
  9. `components/VaultDashboard.tsx` (the surface being upgraded)
  10. `lib/spearCopy.ts` (the disclosure literal to remove)

If any file is missing, STOP and report.

## Alternative N=020 candidates (NOT recommended)

- **Real LabCorp / Quest API integration** — requires HIPAA Business Associate Agreement and partner approval before any code can ship. Not unblocked.
- **Real telehealth API (vs N=016 deep-link)** — requires partner approval. Not unblocked.
- **Garmin / Fitbit fourth wearable** — incremental value over the three already shipped. Defer.
- **HSA card via Privacy.com** — useful but smaller revenue surface than vault funding.

The vault funding cycle is the highest-leverage unblock and resolves the standing N=009 disclosure debt. Recommend N=020 as vault funding.
