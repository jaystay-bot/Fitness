# NEXT_010.md

**Previous N:** 009 — PASS (Project Spear positioning: un-insurance thesis + three-button entry + vault dashboard preview, existing flow preserved).

## N=010 — Vault funding (Stripe Treasury or equivalent)

The clinical-orange disclosure on `VaultDashboard` says vault funding ships in N=010. Honor the commitment. Replace the placeholder values in `VaultDashboard` with real balance data backed by an actual money primitive.

### Cycle sketch (Architect to refine)

1. **Funding primitive selection.** Stripe Treasury is the obvious candidate (FBOA accounts, ACH credit, real balance ledger). Alternatives worth weighing in the architect contract: a Modern Treasury account, a Silicon Valley Bank–style HSA/FSA partnership, or a self-hosted ledger backed by Stripe Connect Express accounts. Pick one; lock the choice; document the rejection rationale for the others.
2. **New tables (additive only).**
   - `vault_accounts` — `clerk_user_id`, `stripe_treasury_account_id` (or equivalent), `created_at`. RLS own-row.
   - `vault_contributions` — `user_email`, `amount_cents`, `contributed_at`, `stripe_payment_intent_id`. RLS own-row.
   - `vault_balances` — denormalized cache of current balance per user; updated by webhook. RLS own-row.
3. **New API routes.**
   - `POST /api/vault/contribute` — creates a Payment Intent for `monthlyContribution` cents.
   - `POST /api/webhooks/treasury` — handles Stripe Treasury events (or equivalent), updates `vault_balances`.
   - `GET /api/vault/balance` — returns the current user's balance and lifetime contributions.
4. **`VaultDashboard` rewire.** Pull live values from `/api/vault/balance` instead of `SPEAR_COPY.vaultMath`. Show the contributing-user's actual balance. Anonymous and unfunded users continue to see the locked placeholder values (preview mode) plus the same disclosure, swapped to read "Sign in to fund your vault."
5. **Pricing page rewire.** Add a "Start your vault" CTA that triggers `/api/vault/contribute` and opens Stripe Checkout for the recurring $200/mo contribution.
6. **Remove the disclosure** when vault is funded (only when `vault_balances.balance_cents > 0` for the current user). Keep the disclosure for everyone else.

### Risks the architect should call out

- KYC / identity verification for FBOA accounts (Stripe Treasury requires it).
- State-by-state money-services regulation if funds are held custodially.
- The wedge copy ("kept by you, not the insurer") sets a high bar — the funding flow must clearly preserve user ownership and avoid implying any kind of pooled risk.

## Other Project Spear cycles queued behind N=010

- **N=011** — Provider marketplace. The `Find Care` card in `VaultDashboard` becomes a real link to a curated direct-pay provider directory.
- **N=012** — Lab integration (LabCorp / Quest direct-pay).
- **N=013** — Amazon fulfillment loop for the supplement stack.
- **N=014** — IOTA Tangle hashing of verified health actions to user-owned data (the `Health Score` card backing).

## Standing posture

- Engine determinism, free-tier preservation, no-raw-file-storage, locked palette, locked typography, positioning tripwire, the `DEV MODE` reminder on `isProUser` (still active) — all non-negotiable.
- The `/api/recommend` route, `lib/supplements.ts`, `lib/conflicts.ts` are inviolate.
