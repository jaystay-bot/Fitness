# TRUTH_RESULT_016.md

**N:** 016 **Hat:** JUDGE **Date:** 2026-05-05 **Result:** PASS

---

## Verdict

**PASS — all 12 acceptance criteria satisfied.** Telehealth is the third plugin to register against the locked Plugin Layer contract from N=012, and the **second action plugin** (after Amazon, N=015). The signal flow now spans Apple Health as a signal plugin, Amazon and telehealth as action plugins — proving the contract supports multiple action plugins simultaneously without further contract modification.

The locked engine, Signal Stack core (`signalLayers` / `signalPriority` / `pluginContract`), the N=014 Apple Health plugin, the N=015 Amazon plugin, and the N=015 `FulfillButton` component are all byte-identical against `main`. Zero new dependencies. The fail-silently rule extends to telehealth: missing env, missing Supabase, RLS rejections all yield `200 { ok: true, url }`. The escalation button is conservative — only renders when `goalConflict !== null` OR a clinician-oversight supplement (iron / melatonin) is in the stack. Routine recommendations get a result page byte-identical to N=015.

## Per-test detail

- **T1: PASS** — `git diff main -- package.json package-lock.json` empty. Zero new dependencies. Pure URL generation uses `URLSearchParams` (Web standard).
- **T2: PASS** — `npm run build` clean. All routes still compile, including the additive dispatch on `/api/fulfillment/click` and the new pluginRegistry surface.
- **T3: PASS** — `bash scripts/verify-audit-trail.sh` exits 0 with the success message: `verify-audit-trail [N=016]: OK — CURRENT, S1_LOCKED, A1_OUTPUT all committed (or A1_OUTPUT staged)`. The N=013 audit-trail guard is honored.
- **T4: PASS** — `generateTelehealthDeepLink(<rec with goalConflict>, "https://www.sesamecare.com/")` returns `https://www.sesamecare.com/?reason=goal-conflict`. Contains the provider URL prefix and the `reason=` query parameter.
- **T5: PASS** — Fallback verified: `generateTelehealthDeepLink(null, "")` returns the generic `https://www.sesamecare.com/` landing page (no exception, non-empty URL).
- **T6: PASS** — `getActivePlugins()` returns an array of length 3: `[0].name === "apple-health"`, `[1].name === "amazon"`, `[2].name === "telehealth"`. The N=014/N=015 first/second-entry invariants are preserved.
- **T7: PASS** — `shouldRender` logic verified across three cases:
  - `shouldRender(<rec with goalConflict>)` → `true` (muscle goal + sedentary activity → block).
  - `shouldRender(<rec with iron in stack>)` → `true` (female + fatigue → iron added; iron matches the clinician-oversight key).
  - `shouldRender(<routine rec>)` → `false` (no conflict, no clinician-oversight supplement).
  - `chooseEscalationReason` correctly categorizes: `goal-conflict` for muscle/sedentary, `clinician-oversight-supplement` for iron-in-stack, `null` for routine.
- **T8: PASS** — `POST /api/fulfillment/click { pluginName: "telehealth", supplementName: "escalation" }` returns `200 { ok: true, url: "https://www.sesamecare.com/" }`. URL contains the configured provider host (or fallback in this sandbox where the env var is unset). Verified via curl against the live `npm run start` server.
- **T9: PASS — backward compatibility verified across two paths:**
  - `POST { supplementName: "Creatine monohydrate" }` (no `pluginName`) → `200 { ok: true, url: "https://www.amazon.com/s?k=Creatine+monohydrate" }` — identical Amazon URL + response shape as N=015.
  - `POST { supplementName: "Vitamin D3", pluginName: "amazon" }` (explicit) → `200 { ok: true, url: "https://www.amazon.com/s?k=Vitamin+D3" }` — same identical behavior.
- **T10: PASS** — In this sandbox, Supabase env is intentionally absent. The telehealth `POST /api/fulfillment/click` call still returned `200 { ok: true, url }` — fail-silently rule extends to telehealth. The DB insert is best-effort; the redirect URL is always returned.
- **T11: PASS — conditional rendering verified:**
  - **Escalation case** (female + fatigue → iron in stack): `/r/<slug>` HTML contains exactly 1 `data-testid="speak-to-doctor-button"` element. Mobile 390 screenshot at `/tmp/n016_escalation_mobile_390.png` shows the clinical-orange `SPEAK TO A DOCTOR` button rendered above the supplement stack (above `STACK (4 PICKS)` heading).
  - **Routine case** (male moderate energy + low-strength symptom): `/r/<slug>` HTML contains zero `data-testid="speak-to-doctor-button"` elements. Mobile 390 screenshot at `/tmp/n016_routine_mobile_390.png` shows the page jumping directly from the editorial line to `STACK (5 PICKS)` with no escalation button.
- **T12: PASS — N=015 regression intact:**
  - `recommend(input)` byte-identical to `main` (2719 bytes JSON, 0-byte diff).
  - Amazon `<FulfillButton>` still renders on each supplement card. Verified via DOM grep: 5 `data-testid="fulfill-button"` elements on the routine 5-supplement page.
  - Apple Health `<AppleHealthUpload>` card still mounts above the assessment form on `/`. DOM grep returns 1 `data-testid="apple-health-upload"`.
  - `/pricing` rendered HTML contains 14 occurrences of "Pro" and 15 of "Free" — three-tier copy intact.
  - `lib/subscription.ts` DEV MODE comment unchanged.
  - `bash scripts/verify-audit-trail.sh` exits 0.
  - `lib/plugins/appleHealth/` and `lib/plugins/amazon/` and `components/FulfillButton.tsx` diffs against `main` empty.

## End-to-end signal flow proof (multi-action variant)

The Plugin Layer is now exercised against three plugins simultaneously:

1. **Apple Health (signal)** — XML upload → parse → 7-day-window normalize → `TaggedUserInput[]` → priority resolver → `recommend(input, taggedInputs)` → recommendation reflects wearable signal.
2. **Amazon (action)** — supplement card → `<FulfillButton>` click → `POST /api/fulfillment/click { pluginName: "amazon" }` → server reads `AMAZON_ASSOCIATES_TAG`, generates affiliate URL → logs to `fulfillment_clicks` (plugin_name="amazon") → returns URL → client redirects.
3. **Telehealth (action)** — escalation-flagged recommendation → `<SpeakToDoctorButton>` click → `POST /api/fulfillment/click { pluginName: "telehealth" }` → server reads `TELEHEALTH_PROVIDER_URL`, generates deep-link with `?reason=` → logs to `fulfillment_clicks` (plugin_name="telehealth") → returns URL → client redirects.

All three plugins share the same `pluginRegistry` and the same click-tracking surface. The N=015 contract supports both action plugins without modification — only `lib/types.ts` extension was needed (additive optional `shouldRender?` method on `ActionPluginNormalization`).

## Watcher summary

13/13 drift checks clean against `main` (`a447fef`):

1. `package.json` + `package-lock.json` diff EMPTY (zero new deps)
2. Engine + Signal Stack core (`engine`, `signalLayers`, `signalPriority`, `pluginContract`) diffs EMPTY
3. N=014 Apple Health (`parser`, `normalizer`, `index`) + N=015 Amazon (`affiliateUrl`, `index`) + N=015 `FulfillButton.tsx` diffs EMPTY
4. 24 other frozen `lib/*` files diff EMPTY
5. API routes: only `/api/fulfillment/click` diffs (additive dispatch); every other route EMPTY
6. Components: only `ResultCard` (45 lines, conditional mount) and the new `SpeakToDoctorButton` diff
7. App pages + middleware + 7 config files + `.gitignore` + `scripts/verify-audit-trail.sh` diffs EMPTY
8. `agent_state/AUDIT_TRAIL_PROTOCOL.md` unchanged
9. Banned-string scan: 1 false-positive on the disclaimer comment "The product never replaces a clinician" (explicit opposite-of-claim, contract-honoring); zero actual medical-advice claims confirmed by precise grep
10. Prior 4 Supabase migrations diff EMPTY
11. Byte-identical engine regression: `recommend(FIXTURE)` 2719-byte JSON identical between this branch and `main`
12. `bash scripts/verify-audit-trail.sh` → exit 0
13. `npm run build` clean

## Required env vars

Add `TELEHEALTH_PROVIDER_URL=<provider landing page URL>` in Vercel for both Production and Preview before launch. When unset, the SpeakToDoctor button still works and routes to the generic Sesame Care landing page — users are not directed to the intended provider until the variable is configured. Configure later when partner approval lands.

## Outcome

→ Open PR `N=016: Telehealth deep-link plugin integration, second action plugin against locked contract`.
→ Write `NEXT_017.md` proposing N=017 as the lab placeholder plugin per the locked priority build order.
