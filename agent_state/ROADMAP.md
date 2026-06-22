# Roadmap

## Product Goal

A premium, trustworthy supplement & nutrition guidance tool: a person enters the
**least information possible** and gets clear, evidence-backed basics — protein
needs (raised when inflammation is elevated), daily water, and supplement (NOT
peptide) support for goals including **healthy weight gain when underweight**.
The output must look premium and read as credible, never as "AI slop."

## Current Priorities (Commander redirect — 2026-06-22)

Supersedes the prior `NEXT_020` vault-funding cycle. Jay's stated intent, in order:

1. **N=020 — Premium visual redesign.** Kill the harsh neon palette + flat cards;
   establish surface depth and a refined accent. (DONE — PASS.)
2. **N=021 — Mission logic.** Inflammation-aware protein target + underweight →
   healthy weight-gain support (no peptides). Unify the protein number so the
   card, daily target, and 30-day plan never disagree.
3. **N=022 — Minimal-input mode.** Reduce the form to the fewest questions that
   still produce useful guidance.
4. **N=023 — Real data research.** Replace hand-typed `studyCount` values with
   real PubMed counts via a build-time fetch script (NIH ODS / DSLD references).

## Commander directive — 2026-06-22 (b): Elite brand redesign

Full creative runway granted. Re-design the whole color scheme + brand feel into
an ELITE PREMIUM wellness brand ("get right for humans" / vital, active, healthy)
— not a "supplement page." Background, imagery, CTA, motion/kinetics all in
scope. May add open-source libs, React interactivity, CSS/JS motion. NO basic
emojis. Least friction, least questions — just proceed and make it magnificent.

Design language (Designer's call): "Elite Apothecary" — deep evergreen-obsidian
canvas, vital mint-emerald primary (retire neon lime), champagne gold luxe
accent, warm bone text, organic motion, crisp SVG imagery.

Cycles:
- N=026 — Elite colorway + design tokens + premium global background (cascades app-wide).
- N=027 — Kinetic hero: animated SVG aurora backdrop, entrance motion, premium CTA.
- (further polish cycles as warranted)

## Deferred

- Vault funding (former NEXT_020). The N=009 disclosure literal stays in place
  and honest until funding actually ships, so no ethical/chargeback debt accrues.

## Locked Decisions

- No roadmap edits mid-run except by Commander (Jay).
- Engine `recommend()` stays a pure, deterministic, synchronous function.
- Commander authorized changing two standing Judge primitives:
  - Visual locked palette (N=020) — colors are an explicit product complaint.
  - Engine byte-identical regression baseline (N=021) — new mission logic must
    change engine output; the baseline will be re-frozen, not bypassed.
- No peptides or hormones in any recommendation. Food-first, supplements-second.
