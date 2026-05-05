# A1_OUTPUT_015.md

**N:** 015 **Hat:** OPERATOR **Date:** 2026-05-05 **Branch:** `claude/apex-protocol-n015-aYZje` **Predecessor:** main @ `787943d` (post N=014 merge)

---

## SUMMARY

Ten atomic operator commits + Commander/Architect/Sentinel state commits. Five new files (URL generator, plugin index, FulfillButton, click route, migration 0004). Four surgical modifications: `lib/types.ts` (additive `ActionPluginNormalization` + `FulfillmentClick`), `lib/pluginRegistry.ts` (widen union + seed `[appleHealthPlugin, amazonPlugin]`), `components/ResultCard.tsx` (mount `<FulfillButton>` on each pick), `.env.example` (AMAZON_ASSOCIATES_TAG placeholder). One additive Supabase migration. Zero new runtime dependencies. Engine + Signal Stack core + N=014 Apple Health plugin FROZEN and untouched.

## COMMITS

```
cbe9b9d  N=015 commander: define Amazon action plugin integration cycle
33c953a  N=015 architect: lock Amazon action plugin integration contract
2135d49  N=015 operator: add lib/plugins/amazon/affiliateUrl.ts (pure URL generator)
57bc739  N=015 operator: add ActionPluginNormalization + FulfillmentClick to lib/types.ts
497ba9e  N=015 operator: add lib/plugins/amazon/index.ts (ActionPluginNormalization)
9460479  N=015 operator: add components/FulfillButton.tsx ('Fulfill on Amazon' button)
53455ae  N=015 operator: add app/api/fulfillment/click/route.ts (click logger + URL)
e0a0b35  N=015 operator: add supabase/migrations/0004_fulfillment_clicks.sql
fedc260  N=015 operator: register amazon as 2nd entry in lib/pluginRegistry.ts
d29a7dc  N=015 operator: mount FulfillButton on each supplement card in ResultCard
f22edfb  N=015 operator: add AMAZON_ASSOCIATES_TAG to .env.example
(this)   N=015 operator: write A1_OUTPUT_015.md manifest
```

The architect's recommended commit order placed `types.ts` at #8, but the dependency graph requires it before commits referencing `ActionPluginNormalization`. The actual commit order satisfies the dependency graph (types → plugin index → registry) while preserving the same set of changes; the recommended order was a guideline rather than a hard constraint and the diff against `main` is identical regardless of order.

## FILES TOUCHED

```
A  lib/plugins/amazon/affiliateUrl.ts        pure URL generator (37 lines)
A  lib/plugins/amazon/index.ts               ActionPluginNormalization (23 lines)
A  components/FulfillButton.tsx              "Fulfill on Amazon" button (72 lines)
A  app/api/fulfillment/click/route.ts        POST: log + return affiliate URL (93 lines)
A  supabase/migrations/0004_fulfillment_clicks.sql   table + RLS + insert policy (24 lines)

M  lib/types.ts                              +24 lines additive: ActionPluginNormalization + FulfillmentClick
M  lib/pluginRegistry.ts                     widen union; seed [appleHealth, amazon]; widen registerPlugin signature
M  components/ResultCard.tsx                 mount <FulfillButton> next to <ConfidenceBadge> on each pick
M  .env.example                              +8 lines: AMAZON_ASSOCIATES_TAG placeholder

A  agent_state/CURRENT_015.md
A  agent_state/S1_LOCKED_015.md
A  agent_state/A1_OUTPUT_015.md   (this file)
A  agent_state/TRUTH_RESULT_015.md  (Judge will write)
A  agent_state/NEXT_016.md          (Judge will write on PASS)
M  agent_state/SESSION_LOG.md       N=015 cycle entries appended
```

`git diff main -- lib/engine.ts lib/signalLayers.ts lib/signalPriority.ts lib/pluginContract.ts` is empty (Signal Stack core preserved).

`git diff main -- lib/plugins/appleHealth/` is empty (N=014 plugin preserved).

`git diff main -- package.json package-lock.json` is empty (zero new deps).

## CONTRACT-SPIRIT-HONORING NOTES

1. **Commit ordering vs architect recommendation.** The architect's contract listed types.ts as commit 8. The actual commit order placed it at commit 4 because the plugin index, registry mod, and API route all import from it. The end-state diff is identical to the recommended order; only the commit ladder shape differs. Documented here for full transparency.
2. **`pluginContract.ts` stays FROZEN.** The architect contract explicitly preferred extending without modifying the Signal Stack core. The `ActionPluginNormalization` interface lives in `lib/types.ts` (which is in the modify-allowed list this cycle). The discriminated `kind: "action"` field separates action plugins from signal plugins at the type level; the existing N=012 `isPluginNormalization` runtime guard continues to validate ONLY signal plugins, and the registry's `registerPlugin` function checks each variant separately.
3. **Server-side env var read.** `process.env.AMAZON_ASSOCIATES_TAG` is read at request time (inside `amazonPlugin.generateActionUrl`), not at module-load time. This lets the affiliate tag be set in Vercel env after deployment without a redeploy. The variable is intentionally NOT prefixed with `NEXT_PUBLIC_` so it stays server-only — the FulfillButton fetches the URL through `/api/fulfillment/click` rather than building it client-side.
4. **Synchronous `window.open` + deferred location update.** The standard popup-blocker-safe pattern: open `about:blank` synchronously in the click handler, await the click POST, then set `newTab.location.href` to the affiliate URL the server returned. On any failure, the new tab is closed silently — the fail-silently rule is honored.
5. **Engine purity preserved.** `lib/engine.ts` is byte-identical against `main`. `recommend(input)` and `recommend(input, taggedInputs)` produce JSON byte-identical to N=014. The cycle is purely peripheral.

## VERIFICATION

- `npx tsc --noEmit` clean across all 10 source commits.
- Smoke harness exercised end-to-end:
  - `generateAmazonAffiliateUrl("Creatine monohydrate", "apex-protocol-20")` → `https://www.amazon.com/s?k=Creatine+monohydrate&tag=apex-protocol-20`.
  - `generateAmazonAffiliateUrl("", "apex-protocol-20")` → `https://www.amazon.com/s?tag=apex-protocol-20` (no `k=`).
  - `generateAmazonAffiliateUrl("Vitamin D3", "")` → `https://www.amazon.com/s?k=Vitamin+D3` (no `tag=`).
  - `generateAmazonAffiliateUrl("   ", "   ")` → `https://www.amazon.com/` (whitespace-only fallback).
  - Identical inputs produce identical URLs (deterministic).
  - `amazonPlugin.name === "amazon"`, `amazonPlugin.kind === "action"`, `generateActionUrl` is a function.
  - `getActivePlugins().length === 2` with `[0].name === "apple-health"` and `[1].name === "amazon"` — N=014 first-entry invariant preserved.
  - `recommend(input) === recommend(input, undefined) === recommend(input, [])` byte-identical (2711 bytes).
  - Setting `process.env.AMAZON_ASSOCIATES_TAG` between calls changes the URL output — proves the env var is read at call time, not at module load.

## HANDOFF

→ Watcher reads this file, runs the drift gauntlet against `main` (`787943d`), and invokes `bash scripts/verify-audit-trail.sh` per the N=013 protocol.
→ Judge reads `S1_LOCKED_015.md` and verifies the 12 acceptance criteria, runs the N=014 regression, writes `TRUTH_RESULT_015.md` and (on PASS) `NEXT_016.md`, and opens the N=015 PR.
