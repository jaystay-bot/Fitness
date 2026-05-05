# CURRENT_011.md

**N:** 011 **Hat:** COMMANDER (Jay) **Date:** 2026-05-04 **Status:** ACTIVE **Predecessor:** N=010 (PR #15)

---

## INTENT

N=011 makes the live-tester product readable to a person without a clinical background and visible to every tester regardless of subscription state. Two coordinated objectives.

**Objective A — Chart redesign for legibility.**
Redesign the 30-day execution-plan chart so it (1) advances one day at a time, (2) auto-traverses day 1 → day 30 over no less than 30 seconds, (3) is fully pausable, rewindable, and scrubbable by the user, and (4) replaces every technical term in the visible surface (chart notes, day-detail labels, axis annotations) with plain language readable at an 8th-grade level. Where a clinical term must remain (e.g., a supplement's biochemical form), the surface must include an inline plain-language gloss so the user is never left guessing. Every recommendation row continues to display its why-statement; nothing is removed.

**Objective B — DEV MODE access for live testing.**
Update `isProUser` in `lib/subscription.ts` so the comment block above the function reads exactly:

```
NOTE: DEV MODE ACTIVE, ALL USERS GRANTED PRO ACCESS FOR TESTING, REVERT BEFORE COMMERCIAL LAUNCH
```

The function must continue to return `true` unconditionally so anonymous testers see every Pro feature. Stripe checkout, the pricing page copy, and the upgrade button must remain present and functional — the gate is relaxed for testing, not removed.

## SCOPE BOUNDARY

Visible-surface chart components (`InteractiveTimeline`, `TimelineDayDetail`) and their pure note generator (`lib/timeline.ts`'s `noteForDay`). One-line subscription-comment update. No engine changes. No supplement renames. No new dependencies. The 30-day projection math (`projectTimeline`, `ONSET_CURVES`, `effectAtDay`) is FROZEN — only the rendering layer and the day-note copy change.

## SUCCESS DEFINITION

- Chart's Play button auto-traverses day 1 → day 30 in ≥ 30 seconds (the previous 5-second pace is gone).
- Chart shows current-day callout, with prev / next / scrub controls visible at all times.
- Pausing freezes the scrubber on the current day; rewinding returns to day 1; scrubbing snaps to any day 1–30.
- Every visible day-note string and every visible day-detail label uses plain language (no `ferritin`, `methylcobalamin`, `mitochondrial`, `cortisol`, `serum 25-OH`, `saturation`, `plateau`, `t50`, `tmax`, `bisglycinate`, `adaptogen`, `compounding`, `loading dose`, etc.). Where a clinical word remains visible, an adjacent plain-language gloss is shown.
- Every supplement card continues to display a `whyForYou` statement (already true; verified unchanged).
- `isProUser` returns `true` and its preceding comment matches the contract string byte-for-byte.
- `/pricing`, the upgrade button, and `/api/checkout` remain functional (Stripe surface unchanged).
- Every prior cycle's surface (Spear sections, homepage, recommendation engine, feedback widget, body viz, lab upload, scanner) is byte-identical.

## CONSTRAINTS (Commander level)

- Engine, supplements, conflicts, all prior `lib/*` except `lib/timeline.ts` (note-text only) and `lib/subscription.ts` (comment only) are FROZEN.
- `app/page.tsx`, `app/r/[slug]/page.tsx`, `app/pricing/page.tsx`, `app/account/page.tsx`, `app/admin/feedback/page.tsx`, `app/layout.tsx`, sign-in/sign-up, `middleware.ts`, all config files — all FROZEN.
- All N=001..N=010 components except `InteractiveTimeline` and `TimelineDayDetail` are FROZEN. `TimelineProjection` (the recharts version, no longer mounted) stays untouched.
- Locked palette only.
- Zero new runtime dependencies.
- DEV MODE comment string must match the contract literal exactly.

## HANDOFF

→ Architect writes `/agent_state/S1_LOCKED_011.md`. All prior locked contracts remain binding except where this contract explicitly unfreezes a single file.
