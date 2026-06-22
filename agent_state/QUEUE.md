# QUEUE.md

## ACTIVE

- N=021 — Mission logic: unify protein target + inflammation-aware protein + underweight → healthy weight gain (NO peptides). See NEXT_021.md. (Commander redirect 2026-06-22.)
- N=022 — Minimal-input mode: reduce the form to the fewest questions that still yield useful guidance.
- N=023 — Real data research: replace hand-typed `studyCount` with real PubMed counts via a build-time fetch script (NIH ODS / DSLD references).

## DEFERRED (Commander redirect 2026-06-22)

- N=010-style Vault funding (Stripe Treasury). Deferred behind the redesign + mission cycles. The N=009 "Vault funding ships in N=010" disclosure stays in place and honest until funding actually ships — no ethical/chargeback debt.

## DONE

- N=001 — Apex Protocol scaffold (PASS).
- N=002 — Differentiation pass: evidence ledger + OG sharing + conflict promotion (PASS).
- N=003 — Styling recovery: PostCSS config + visual regression test (PASS).
- N=004 — US-first unit toggle: imperial default + metric toggle, engine unchanged (PASS).
- N=005 — Depth and authority pass: input-driven variation + per-pick confidence + editorial motion + 3D supplement bottle (PASS).
- N=006 — Launch-readiness commercial layer: Clerk auth + Stripe subscription + Supabase subscriptions table + shareable URLs + post-result email capture + pricing page with explicit "coming soon" labels (PASS).
- N=007 — Clinical companion pass: 30-day timeline projection (recharts) + lab result PDF parser (Python via spawn) + supplement bottle scanner (Python OCR), all Pro-tier gated. Privacy posture: raw uploads never persist (PASS).
- N=008 — Interactive expansion: voice-reactive form (Web Speech API + deterministic regex parser) + body-systems SVG visualization + interactive 30-day timeline with play-through + temporary `isProUser` DEV MODE relaxation (PASS).
- N=009 — Project Spear positioning: SpearHero + SymptomEntry + VaultDashboard (preview only with mandatory disclosure) + UninsuranceThesis. Existing recommendation flow byte-identical to N=008 (PASS).

## STANDING REMINDERS

- **DEV MODE on `isProUser`** — the verbatim comment block in `lib/subscription.ts` flags that Pro tier gating is currently disabled for testing. Re-enable before commercial launch by reverting the function body to `return tier === "pro";` and removing the comment block.
- **Vault funding disclosure** — RESOLVED in N=024. The `VaultDashboard` no longer makes any vault FUNDING CLAIM (the "$2,400 balance / health score / kept by you" cards were removed when the top-of-page was re-pointed to the supplement mission). With no funding promise rendered, the mandatory disclosure is no longer applicable and was removed together with the claims — honest by construction. Do NOT reintroduce vault/insurance financial claims without restoring a disclosure AND a real funding flow.

## Project Spear cycles queued behind N=010

- N=011 — Provider marketplace (`Find Care` card backing).
- N=012 — Lab integration (LabCorp / Quest direct-pay).
- N=013 — Amazon fulfillment loop for the supplement stack.
- N=014 — IOTA Tangle hashing of verified health actions (the `Health Score` card backing).

## STANDING JUDGE PRIMITIVES

- **Visual baseline regression test (`tests/visual.spec.ts`)** is part of the standard Judge phase. Three computed-style assertions: hero `h1` font-size > 32px, and the locked palette. **As of N=026 (Elite Apothecary rebrand, Commander-authorized re-freeze) the locked colors are `body.backgroundColor === rgb(11, 14, 12)` and primary CTA `backgroundColor === rgb(95, 227, 161)`** (evergreen canvas + mint-emerald CTA). Prior locks retired: N=003 neon (`rgb(10,10,10)`/`rgb(212,255,58)`) → N=020 (`rgb(10,11,13)`/`rgb(182,242,74)`) → N=026 (current). The same file also asserts the unit-toggle invariants: imperial-default mode (`#feet`, `#inches`, `#pounds` visible; FT/LB `aria-pressed="true"`) and metric-after-toggle mode (`#heightCm`, `#weightKg` visible; CM/KG `aria-pressed="true"`).
- **Positioning tripwire** (added N=005): every Judge phase re-runs a rendered-HTML banned-pattern check against `streak`, `unlock`, `achievement`, `level up`, `limited time`, `people viewing`, `earn xp/points/rewards`, and any `\d+:\d{2}` countdown timer. The Watcher's source-grep mirrors this list (`earn xp`, etc.).
- **Engine determinism**: `recommend(input)` must remain pure synchronous and `JSON.stringify`-identical across calls with the same input, including `variationSeed` and every `SupplementPick.confidence`.

## PENDING (future cycles — not part of N=006)

- Apify-based supplement price comparison
- Wearable integration (Oura OAuth + Apple Health XML import) — Pro feature; unlocks measurably different recommendations
- Open-source release of the engine + supplement table + conflict logic under MIT license
- WCAG 2.2 AAA accessibility remediation pass
- Award-surface positioning packets (Webby, FastCo IxD, Communication Arts)

These are queued for cycles beyond N=007.

## COMMERCE FOLLOW-UPS (after N=029)

- Live price + exact-SKU resolution via retailer APIs / affiliate feeds (needs egress). Set priceCents + lastVerifiedAt; "Best price" badge then activates.
- Real, license-verified bottle photography (needs egress to verify/download + attribution).
- Nav link to /shop + per-recommendation "where to buy" deep links from ResultCard.
- Wire the existing Amazon affiliate plugin (lib/plugins/amazon) into BuyBox server-side for attributed Amazon links.

## FUTURE VISION (logged, not scoped)

- **THE WIRE** — a living, citation-backed evidence newsroom personalized to the compounds in a user's protocol, graded on the existing evidence tiers, able to recompute the stack when new evidence lands. Sources only (PubMed/Europe PMC, ClinicalTrials.gov, Cochrane, journal RSS); no human posts, no engagement metrics; every card one click from the primary source with funding/COI shown. Braids with Dream-State Dosing, The Negotiator, and self-trial publishing. Large multi-N initiative — needs egress + a Commander scope before any build.
