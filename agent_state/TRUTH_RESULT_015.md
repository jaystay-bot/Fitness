# TRUTH_RESULT_015.md

**N:** 015 **Hat:** JUDGE **Date:** 2026-05-05 **Result:** PASS

---

## Verdict

**PASS — all 12 acceptance criteria satisfied.** Amazon is the second plugin to register against the locked Plugin Layer contract from N=012, and the **first action plugin** — proving the contract works for outbound surfaces (URL generation) just as it did for inbound signal surfaces (TaggedUserInput emission via Apple Health in N=014). The signal flow now spans both directions of plugin operation against the same registry interface.

The locked engine, Signal Stack core (`signalLayers` / `signalPriority` / `pluginContract`), and the N=014 Apple Health plugin are all byte-identical against `main`. Zero new dependencies. The fail-silently rule is honored at every layer: empty supplement names, missing affiliate tags, missing Supabase env, and unreachable databases all yield a successful redirect with degraded but functional behavior. The N=014 byte-identical engine regression still holds.

## Per-test detail

- **T1: PASS** — `git diff main -- package.json package-lock.json` empty. Zero new dependencies. Pure URL generator uses `URLSearchParams` (Web standard, no install).
- **T2: PASS** — `npm run build` clean. All routes still compile, including the new `/api/fulfillment/click` route and the new pluginRegistry surface.
- **T3: PASS** — `bash scripts/verify-audit-trail.sh` exits 0 with the success message: `verify-audit-trail [N=015]: OK — CURRENT, S1_LOCKED, A1_OUTPUT all committed (or A1_OUTPUT staged)`. The N=013 audit-trail guard is honored.
- **T4: PASS** — `generateAmazonAffiliateUrl("Creatine monohydrate", "apex-protocol-20")` returns `https://www.amazon.com/s?k=Creatine+monohydrate&tag=apex-protocol-20`. Contains `tag=apex-protocol-20`, the URL-encoded supplement name in `k`, and uses the `amazon.com/s` search root.
- **T5: PASS** — Fallback behavior verified across four edge cases:
  - Empty name + tag set → `https://www.amazon.com/s?tag=apex-protocol-20` (tag-only, no `k=`).
  - Name set + empty tag → `https://www.amazon.com/s?k=Vitamin+D3` (no `tag=`).
  - Whitespace-only name + whitespace-only tag → `https://www.amazon.com/` (Amazon home).
  - Identical inputs always produce identical URLs (deterministic).
- **T6: PASS** — `getActivePlugins()` returns an array of length 2: `[0].name === "apple-health"` (N=014 first-entry preserved), `[1].name === "amazon"` (this cycle). The discriminator `kind: "action"` distinguishes the action plugin from the signal plugin at the type level.
- **T7: PASS** — The N=012 compile-time check still holds. A registration object missing required `PluginNormalization` fields fails `tsc --noEmit` with `TS2739` (verified via the type-system regression in N=012's harness; the discriminated union narrows correctly so partial signal plugins still fail compilation, and partial action plugins fail through the structural runtime check in `registerPlugin`).
- **T8: PASS** — `POST /api/fulfillment/click { supplementName: "Creatine monohydrate" }` returns `200 { ok: true, url: "https://www.amazon.com/s?k=Creatine+monohydrate" }`. URL contains `amazon.com`. Verified via `curl` against the live `npm run start` server.
- **T9: PASS** — In this sandbox, Supabase env is intentionally absent. The `POST /api/fulfillment/click` call still returned `200 { ok: true, url }` — the affiliate URL flows back to the client even when `getSupabaseAdmin()` returns `null`. Fail-silently rule honored.
- **T10: PASS** — `/r/<slug>` HTML contains exactly 3 `data-testid="fulfill-button"` elements, matching the 3-supplement stack length for the test fixture. One `<FulfillButton>` per supplement `<article>`. Visual verification: mobile 390 screenshot shows `FULFILL ON AMAZON` next to `93% CONFIDENCE` on each supplement card (B12, Vitamin D3, Magnesium glycinate).
- **T11: PASS** — `recommend(input)` byte-identical to `recommend(input, undefined)` and `recommend(input, [])`. `POST /api/recommend` without a `taggedInputs` body field returns 2719 bytes byte-identical to N=014 head. Engine purity preserved.
- **T12: PASS — N=014 regression intact:**
  - `/` HTML contains `data-testid="apple-health-upload"` (Apple Health upload card still mounts above the form).
  - `lib/plugins/appleHealth/` diff against `main` is empty.
  - `InteractiveTimeline.tsx` unchanged (`PLAY_DURATION_MS = 30_000` still in source).
  - `/pricing` three-tier copy unchanged.
  - `lib/subscription.ts` DEV MODE comment unchanged.
  - `bash scripts/verify-audit-trail.sh` exits 0.
  - The N=014 byte-identical engine regression still holds.

## End-to-end signal flow proof (action variant)

1. **Render** — `ResultCard` renders one `<FulfillButton supplementName={s.name} />` per pick.
2. **Click** — User taps the button. The synchronous `window.open("about:blank", "_blank", "noopener,noreferrer")` allocates the new tab without triggering popup blockers.
3. **POST** — Client `POST`s `{ supplementName }` to `/api/fulfillment/click`.
4. **Resolve URL** — Route calls `amazonPlugin.generateActionUrl(supplementName)`, which reads `process.env.AMAZON_ASSOCIATES_TAG` at request time and delegates to the pure `generateAmazonAffiliateUrl`. Tag-set → URL contains `tag=...`. Tag-unset → URL omits `tag=`. Either way, a working Amazon URL flows back.
5. **Log click** — Route best-effort inserts a row into `fulfillment_clicks` via `getSupabaseAdmin()`. Optional Clerk `userId` captured if signed in. Any DB failure is swallowed.
6. **Respond** — Route returns `200 { ok: true, url }`.
7. **Redirect** — Client sets `newTab.location.href = url`. The user lands on Amazon's search page with the affiliate tag attached. Affiliate revenue accrues on conversion.
8. **Audit** — Conversion analysis queries `fulfillment_clicks` via the service role in future cycles.

The contract proves end-to-end for both directions of plugin operation. The Plugin Layer is now exercised against signals (Apple Health, N=014) AND actions (Amazon, this cycle) using the same registry, the same lib/ structure, and the same fail-silently posture.

## Watcher summary

13/13 drift checks clean against `main` (`787943d`):

1. `package.json` + `package-lock.json` diff EMPTY (zero new deps)
2. Engine + Signal Stack core (`engine`, `signalLayers`, `signalPriority`, `pluginContract`) diffs EMPTY
3. N=014 Apple Health plugin (`parser`, `normalizer`, `index`) diffs EMPTY
4. 24 other frozen `lib/*` files diff EMPTY
5. API routes: only new `/api/fulfillment/click` diffs; every other route EMPTY
6. Components: only `ResultCard` (mount FulfillButton) and the new `FulfillButton` diff
7. App pages + middleware + 7 config files + `.gitignore` + `scripts/verify-audit-trail.sh` diffs EMPTY
8. `agent_state/AUDIT_TRAIL_PROTOCOL.md` unchanged
9. Banned-string scan in new code (`localStorage` / `sessionStorage` / `document.cookie` / `AI-powered` / `from-purple` / `to-purple`) → 0 hits
10. Prior 3 Supabase migrations diff EMPTY
11. Byte-identical engine regression: `recommend(FIXTURE)` JSON identical to `main`
12. `bash scripts/verify-audit-trail.sh` → exit 0
13. `npm run build` clean

## Required env vars

Add `AMAZON_ASSOCIATES_TAG` in Vercel for both Production and Preview before launch. When unset, the Fulfill button still works and routes to Amazon — just without affiliate attribution. Configure later when partner approval lands.

## Outcome

→ Open PR `N=015: Amazon action plugin integration, first action surface against locked contract`.
→ Write `NEXT_016.md` proposing N=016 as the basic telehealth plugin per the locked priority build order.
