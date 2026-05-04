# CURRENT_010.md

**N:** 010 **Hat:** COMMANDER (Jay) **Date:** 2026-05-04 **Status:** ACTIVE **Predecessor:** N=009 (PR #14)

---

## INTENT

N=010 ships a floating feedback widget that appears on every page of the live deployment so user testers can submit feedback directly from the product. Three atomic objectives. First, add a small floating button at the bottom-right of every page that opens a feedback panel when tapped. Second, add a feedback submission form inside the panel with a message field, an optional email field, and a one-tap submit button that writes the submission to a new Supabase table called `feedback_submissions`. Third, add a minimal admin route at `/admin/feedback` gated by a simple environment variable check that displays all submitted feedback in reverse chronological order so Jay can read what testers have submitted. The widget is accessible to every user including anonymous, requires no sign-up, and stores no personal data beyond what the user voluntarily submits in the message and optional email fields.

## SCOPE BOUNDARY

Floating widget + form + admin route + one new Supabase table. No engine changes. No payment changes. No frozen-component touches. Minimum viable admin auth via single environment-variable password (a richer auth layer can ship later if needed).

## SUCCESS DEFINITION

- Anonymous user on any page sees the floating Feedback button bottom-right.
- Tapping the button opens a panel with the feedback form.
- Submitting the form (valid message ≤ 500 chars) writes a row to `feedback_submissions` and shows a thank-you state.
- `/admin/feedback?password=...` (matching `ADMIN_PASSWORD`) renders submitted feedback in reverse-chronological order.
- Existing flow byte-identical: form, recommendation, shareable URL, all prior cycle features unchanged.

## CONSTRAINTS (Commander level)

- Engine, supplements, conflicts, all prior components, the homepage — all FROZEN.
- Zero new dependencies.
- One new Supabase table only: `feedback_submissions`.
- RLS enabled with anonymous-insert + service-role-select.
- Locked palette only.
- The widget never blocks or interrupts the existing flow; close button + outside-tap dismiss.

## HANDOFF

→ Architect writes `/agent_state/S1_LOCKED_010.md`. All prior locked contracts remain binding.
