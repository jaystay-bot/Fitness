# NEXT_008.md

**Previous N:** 007 — PASS (clinical companion: timeline projection + lab result parser + supplement bottle scanner, all Pro-tier gated).

## N=008 — Practitioner annotation layer (B2B addition)

The clinical companion features in N=007 turn Apex Protocol into a credible self-quantification tool. The next major cycle scopes a **B2B addition** that lets a practitioner (functional-medicine clinician, registered dietitian, performance coach) annotate a patient's `/r/[slug]` recommendation with provider notes, contraindication overrides, and dose adjustments.

### Sketch (Architect to refine)

- **Multi-tenant role system** — extend the `subscriptions` schema (or add a `practitioners` table) with provider role, NPI number (US clinical license identifier), org affiliation. The single-table-only posture from N=006 relaxes here, but each new table must justify itself in the architect contract.
- **Annotation surface** — a practitioner can attach inline notes to specific supplements, mark contraindications that override the engine's pick (e.g. "patient on warfarin → omega-3 flagged"), and adjust doses. Notes are stored as a JSONB column keyed by supplement id.
- **Patient invite flow** — practitioner generates a one-time invite link that pairs a patient's anonymous `/r/[slug]` with the practitioner's annotations on first open.
- **Annotated share page** — `/r/[slug]?annotation=<token>` renders the annotated overlay alongside the regular recommendation. Anonymous patients can read; authenticated providers can edit.
- **Audit log** — every annotation edit is timestamped and signed with the provider's user_id. Adheres to clinical record-keeping norms (BAA, HIPAA, etc. — flag as architecture-level decision; do not assume scope).

### Strategic posture

- Pricing: practitioner tier (separate from $5/mo individual Pro) — TBD by Commander.
- Distribution: per-clinic onboarding, not consumer-driven.
- Engineering: this is the first cycle where multi-tenant RBAC enters the codebase. Architect must lock the role hierarchy precisely.

## Standing posture going forward

- Engine determinism, free-tier preservation, no-raw-file-storage, locked palette, locked typography, locked positioning tripwire — all remain non-negotiable.
- The `/api/recommend` route, `lib/supplements.ts`, `lib/conflicts.ts`, and the locked palette/typography are inviolate.

## Other QUEUE candidates (Commander to consider)

- 30-day check-in flow (the remaining "coming soon" Pro feature on the pricing page).
- Wearable integration (Oura OAuth + Apple Health XML import).
- Open-source release of the engine + supplement table + conflict logic under MIT license.
- WCAG 2.2 AAA accessibility remediation pass.
- Award-surface positioning packets (Webby, FastCo IxD, Communication Arts).
- Apify-based supplement price comparison.
