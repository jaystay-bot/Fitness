# S1_LOCKED_015.md

**N:** 015 **Hat:** ARCHITECT **Status:** LOCKED — NO DRIFT ALLOWED **Predecessors:** S1_LOCKED.md · S1_LOCKED_002..S1_LOCKED_014.md (all still binding) · `AUDIT_TRAIL_PROTOCOL.md` (binding since N=013)

This document is *additive*. Prior locked contracts remain in force, except where this document explicitly unfreezes a single file for surgical edit.

---

## SCOPE

Ship Amazon as the second registered plugin and the first **action plugin** against the locked Signal Stack contract. Five new files (affiliate URL generator, plugin index, button component, click API route, migration). Four surgical modifications (`pluginRegistry.ts` registers Amazon, `ResultCard.tsx` mounts the button, `types.ts` adds action-plugin + fulfillment types, `.env.example` adds env placeholder). The locked engine, Signal Stack core, and N=014 Apple Health plugin are FROZEN.

## NEW FILES ALLOWED THIS CYCLE (no others)

```
lib/plugins/amazon/affiliateUrl.ts       pure deterministic URL generator
lib/plugins/amazon/index.ts              ActionPluginNormalization implementation
components/FulfillButton.tsx             per-supplement "Fulfill on Amazon" button
app/api/fulfillment/click/route.ts       POST endpoint: log click + return URL
supabase/migrations/0004_fulfillment_clicks.sql   additive table migration
agent_state/CURRENT_015.md
agent_state/S1_LOCKED_015.md
agent_state/A1_OUTPUT_015.md
agent_state/TRUTH_RESULT_015.md
agent_state/NEXT_016.md                  written by the Judge if all criteria PASS
```

No new runtime dependencies. No new components beyond `FulfillButton`. No new lib modules outside `lib/plugins/amazon/`. No additional API routes.

## FILES MODIFIED THIS CYCLE (only these)

```
lib/pluginRegistry.ts        widen `registered` element type to PluginNormalization
                             | ActionPluginNormalization. Seed the array with
                             [appleHealthPlugin, amazonPlugin] in that order so
                             the existing Apple Health entry from N=014 stays
                             first and Amazon is appended as the second entry.
                             registerPlugin / clearRegistry exports adapt to
                             the union; isPluginNormalization runtime guard
                             still rejects partial signal plugins per N=012 T7.

components/ResultCard.tsx    mount <FulfillButton supplementName={s.name} />
                             inside each supplement <article>, between the
                             whyForYou paragraph and the existing flex-row
                             that hosts ConfidenceBadge. The article layout
                             remains a flex column with gap-2; only one new
                             child is added.

lib/types.ts                 additive: ActionPluginNormalization interface
                             with `kind: "action"` discriminator + name +
                             generateActionUrl(supplementName: string): string;
                             plus a FulfillmentClick interface describing the
                             POST body / DB row shape. UserInput unchanged.
                             TaggedUserInput / SignalLayer / TaggedValue
                             re-exports unchanged.

.env.example                 append AMAZON_ASSOCIATES_TAG placeholder. The
                             plugin reads this server-side from the
                             /api/fulfillment/click route at request time.

agent_state/SESSION_LOG.md   append the N=015 cycle entries
```

## FROZEN — DO NOT TOUCH

- `lib/engine.ts` (recommend signature locked at N=012; this cycle does NOT touch it)
- `lib/signalLayers.ts`, `lib/signalPriority.ts`, `lib/pluginContract.ts` (Signal Stack core, immutable)
- `lib/plugins/appleHealth/parser.ts`, `lib/plugins/appleHealth/normalizer.ts`, `lib/plugins/appleHealth/index.ts` (N=014 plugin, FROZEN)
- All other `lib/*` (`supplements`, `conflicts`, `variation`, `confidence`, `units`, `slug`, `timeline`, `timelineData`, `labParser`, `labMapping`, `scanner`, `voice`, `voiceParser`, `bodySystems`, `svgPositions`, `subscription`, `spearCopy`, `feedback`, `stripe`, `proAccess`, `supabase`, `email`, `nutrition`, `verdict`)
- Every API route except the new `/api/fulfillment/click` (existing routes — `/api/recommend`, `/api/og`, `/api/checkout`, `/api/webhooks/stripe`, `/api/webhooks/clerk`, `/api/subscription`, `/api/email/result`, `/api/labs/parse`, `/api/labs/recompute`, `/api/scanner/identify`, `/api/feedback/submit`, `/api/plugins/apple-health` — are byte-identical)
- Every component except `ResultCard.tsx` (and the new `FulfillButton.tsx`)
- App pages (`app/page.tsx`, `app/layout.tsx`, `app/r/[slug]/page.tsx`, `app/pricing/page.tsx`, `app/account/page.tsx`, `app/admin/feedback/page.tsx`, sign-in / sign-up)
- `tailwind.config.ts`, `app/globals.css`, `postcss.config.js`, `next.config.js`, `tsconfig.json`, `middleware.ts`, `vercel.json`, `package.json`, `package-lock.json`
- All prior Supabase migrations (0001 + 0002 + 0003) + Python files
- N=013 audit-trail infrastructure (`scripts/verify-audit-trail.sh`, `agent_state/AUDIT_TRAIL_PROTOCOL.md`)

## URL GENERATOR CONTRACT — `lib/plugins/amazon/affiliateUrl.ts`

```ts
/**
 * Pure deterministic Amazon affiliate URL generator.
 *
 * @param supplementName  — the supplement to search for, e.g. "Creatine monohydrate".
 *                          When empty / whitespace, falls back to a tag-only
 *                          generic Amazon search URL.
 * @param associatesTag   — the Amazon Associates tag, e.g. "apex-protocol-20".
 *                          When empty, the resulting URL omits the `tag`
 *                          parameter entirely (no affiliate revenue accrues).
 * @returns               — a fully-qualified URL on `www.amazon.com`. Never
 *                          throws. URL-encodes the search term using
 *                          URLSearchParams (RFC 3986 form encoding).
 */
export function generateAmazonAffiliateUrl(
  supplementName: string,
  associatesTag: string,
): string;
```

Pure module. No I/O, no `'use client'`, no imports beyond `URLSearchParams` (a Web standard). Zero dependencies.

## PLUGIN CONTRACT — `lib/plugins/amazon/index.ts`

```ts
import type { ActionPluginNormalization } from "@/lib/types";

export const amazonPlugin: ActionPluginNormalization = {
  name: "amazon",
  kind: "action",
  generateActionUrl(supplementName: string): string {
    const tag = process.env.AMAZON_ASSOCIATES_TAG ?? "";
    return generateAmazonAffiliateUrl(supplementName, tag);
  },
};
```

The plugin reads `process.env.AMAZON_ASSOCIATES_TAG` at call-time, not at module-load-time, so the env var can be configured after deployment without a code change. Module is server-safe (no `'use client'`).

## TYPES EXTENSION — `lib/types.ts`

```ts
// N=015: action-plugin + fulfillment types — additive only.

export interface ActionPluginNormalization {
  readonly name: string;
  readonly kind: "action";
  generateActionUrl(supplementName: string): string;
}

export interface FulfillmentClick {
  supplementName: string;
  affiliateUrl: string;
  userId?: string | null;
  clickedAt?: string;
}
```

`UserInput` shape, `TaggedUserInput`, `Recommendation`, every prior type — byte-identical.

## REGISTRY MODIFICATION — `lib/pluginRegistry.ts`

Widen the `registered` array element type from `PluginNormalization[]` to `(PluginNormalization | ActionPluginNormalization)[]`. Seed with `[appleHealthPlugin, amazonPlugin]`. The existing `registerPlugin(plugin: PluginNormalization)` signature is widened to accept the union; the runtime guard `isPluginNormalization` continues to validate signal plugins identically (it is a guard for the signal variant only — action plugins skip the guard since they have a different shape). `clearRegistry` exports unchanged.

The N=012 acceptance criterion T7 (incomplete `PluginNormalization` produces `TS2739`) remains green: the discriminated union still rejects partial objects of EITHER variant at compile time.

## FULFILLBUTTON CONTRACT — `components/FulfillButton.tsx`

- `'use client'`.
- Props: `supplementName: string`.
- Renders a `<button type="button">` with locked-palette styling (Tailwind classes only — no hex literals): `border-paper/20`, `text-paper/85`, `hover:border-lime`, `font-mono`, `text-[11px]`, `uppercase`, `tracking-wider`, `rounded-md`, `px-2.5`, `py-1.5`.
- Inner content: lucide `ExternalLink` icon (`w-3 h-3`) + the literal text `Fulfill on Amazon`.
- On click:
  1. Synchronously call `window.open("about:blank", "_blank", "noopener,noreferrer")`. The synchronous `window.open` avoids popup-blocker rejection of the new tab.
  2. `fetch("/api/fulfillment/click", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ supplementName }) })` to log the click and retrieve the affiliate URL.
  3. On `200 { ok: true, url }`, set the new tab's `location.href = url`.
  4. On any failure (network, JSON parse, missing url), `newTab.close()` and silently swallow the error.
- The button is purely additive to each supplement card and does not alter existing card behavior.

## API ROUTE CONTRACT — `app/api/fulfillment/click/route.ts`

- POST. `runtime: "nodejs"`. `dynamic: "force-dynamic"`.
- Reads JSON body `{ supplementName: string, userId?: string | null }`.
- Validates `supplementName` is a non-empty string. Invalid → returns `400 { error: "supplementName required" }`.
- Reads `process.env.AMAZON_ASSOCIATES_TAG` (defaults to empty string if absent).
- Generates the affiliate URL via `amazonPlugin.generateActionUrl(supplementName)` (which calls the pure URL generator).
- Best-effort logs the click to `fulfillment_clicks` via `getSupabaseAdmin()`. If Supabase env is absent OR insertion fails, the route SWALLOWS the error (does NOT bubble it up).
- Returns `200 { ok: true, url }` regardless of DB outcome — the affiliate redirect must never break.
- No auth required. The endpoint is intended for anonymous + signed-in users alike. Optional Clerk `userId` is captured server-side via `auth()` from `@clerk/nextjs/server` if Clerk is configured; otherwise the row's `user_id` is null.

## MIGRATION CONTRACT — `supabase/migrations/0004_fulfillment_clicks.sql`

```sql
CREATE TABLE fulfillment_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplement_name text NOT NULL,
  affiliate_url text NOT NULL,
  user_id text,
  clicked_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE fulfillment_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert fulfillment clicks"
  ON fulfillment_clicks FOR INSERT
  WITH CHECK (true);

-- Reads only via service role (admin queries / conversion analysis).
-- No public select policy → anon clients cannot enumerate clicks.
```

Additive only. Does not touch the prior 3 migrations.

## RESULTCARD MODIFICATION — `components/ResultCard.tsx`

Inside each supplement `<article>`, after the `<p>{s.whyForYou}</p>` line and before the `<div className="flex justify-end mt-1">` that hosts `ConfidenceBadge`, mount `<FulfillButton supplementName={s.name} />`. The button is wrapped in a flex container so it sits on the same row as the existing `ConfidenceBadge` with `justify-between`:

```diff
- <div className="flex justify-end mt-1">
-   <ConfidenceBadge confidence={s.confidence} />
- </div>
+ <div className="flex items-center justify-between gap-3 mt-1">
+   <FulfillButton supplementName={s.name} />
+   <ConfidenceBadge confidence={s.confidence} />
+ </div>
```

Every other line in `ResultCard.tsx` is byte-identical.

## ENV EXTENSION — `.env.example`

Append at the bottom:

```
# --- N=015: Amazon action plugin ---
# Amazon Associates affiliate tag. Configured in Vercel for both
# Production and Preview before launch. When unset, the Fulfill button
# still works and routes the user to Amazon — just without an affiliate
# attribution, so no revenue accrues until the tag is configured.
AMAZON_ASSOCIATES_TAG=
```

## ACCEPTANCE CRITERIA (Judge will verify all 12)

1. `npm install` succeeds. Zero new dependencies. `git diff main -- package.json package-lock.json` empty.
2. `npm run build` succeeds with zero errors.
3. `bash scripts/verify-audit-trail.sh` exits 0 against this cycle's state files (N=013 audit-trail guard satisfied).
4. `generateAmazonAffiliateUrl("Creatine monohydrate", "apex-protocol-20")` returns a URL containing `tag=apex-protocol-20` and the URL-encoded supplement name in the `k` parameter.
5. `generateAmazonAffiliateUrl("", "apex-protocol-20")` falls back to a tag-only Amazon search URL (no `k=...` populated, or `k=` empty).
6. `getActivePlugins()` returns an array of length 2 with `[0].name === "apple-health"` and `[1].name === "amazon"`. The N=014 first-entry invariant is preserved.
7. The N=012 T7 compile-time check still holds: a `PluginNormalization` registration object missing required fields fails `tsc --noEmit` with `TS2739`.
8. `POST /api/fulfillment/click { supplementName: "Creatine monohydrate" }` returns `200 { ok: true, url }` with `url` containing `amazon.com`.
9. The same POST returns `200 { ok: true, url }` even when Supabase env is absent — the affiliate URL still flows back to the client (fail-silently rule).
10. `<FulfillButton>` renders inside every supplement article in the rendered `ResultCard`. Verified via DOM inspection: count of `[data-testid="fulfill-button"]` elements equals `result.supplements.length`.
11. `recommend(input)` and `recommend(input, taggedInputs)` outputs are byte-identical to N=014 — the cycle does not touch the recommendation pipeline. Verified via JSON snapshot diff.
12. **N=014 regression intact:** Apple Health upload card still renders above the assessment form; assessment form submission flow byte-identical for users who skip the upload; the `InteractiveTimeline` still mounts with `PLAY_DURATION_MS = 30_000`; `/pricing` three-tier copy intact; `bash scripts/verify-audit-trail.sh` exits 0; the N=014 byte-identical engine regression still holds.

## BANNED THIS CYCLE

- New runtime dependencies (no `aws-sdk`, no Amazon SDK, no signed-URL libraries)
- Modifications to `lib/engine.ts`, `lib/signalLayers.ts`, `lib/signalPriority.ts`, `lib/pluginContract.ts`
- Modifications to the N=014 Apple Health plugin (`lib/plugins/appleHealth/*`)
- Cart-building, OAuth flows with Amazon, actual purchase execution
- Any persistence of personally identifiable information beyond the optional Clerk `userId`
- Changes to the Stripe checkout flow, the pricing page, or the upgrade button
- Changes to the locked palette or typography
- The string `"AI-powered"`, `from-purple-` / `to-purple-` Tailwind classes
- Any new color outside the locked palette
- `localStorage`, `sessionStorage`, `document.cookie` (the click-tracking row is the audit surface)
- Any change that breaks regression #11 or #12

## OPERATOR INSTRUCTIONS — Atomic commits per file group

```
1.  N=015 operator: add lib/plugins/amazon/affiliateUrl.ts (pure URL generator)
2.  N=015 operator: add lib/plugins/amazon/index.ts (ActionPluginNormalization)
3.  N=015 operator: add components/FulfillButton.tsx ("Fulfill on Amazon" button)
4.  N=015 operator: add app/api/fulfillment/click/route.ts (click logger + URL)
5.  N=015 operator: add supabase/migrations/0004_fulfillment_clicks.sql
6.  N=015 operator: register amazon as 2nd entry in lib/pluginRegistry.ts
7.  N=015 operator: mount FulfillButton on each supplement card in ResultCard
8.  N=015 operator: add ActionPluginNormalization + FulfillmentClick to lib/types.ts
9.  N=015 operator: add AMAZON_ASSOCIATES_TAG to .env.example
10. N=015 operator: write A1_OUTPUT_015.md manifest
```

## HANDOFF

→ Sentinel reads this file and emits GATE: OPEN or GATE: BLOCK.
→ Watcher invokes `bash scripts/verify-audit-trail.sh` per the N=013 protocol.
