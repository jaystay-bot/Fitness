# S1_LOCKED_016.md

**N:** 016 **Hat:** ARCHITECT **Status:** LOCKED — NO DRIFT ALLOWED **Predecessors:** S1_LOCKED.md · S1_LOCKED_002..S1_LOCKED_015.md (all still binding) · `AUDIT_TRAIL_PROTOCOL.md` (binding since N=013)

This document is *additive*. Prior locked contracts remain in force, except where this document explicitly unfreezes a single file for surgical edit.

---

## SCOPE

Ship telehealth as the third registered plugin and the second **action plugin** against the locked Signal Stack contract. Four new files (deep-link generator, plugin index, button component, migration 0005). Five surgical modifications (`pluginRegistry.ts` registers telehealth, `ResultCard.tsx` mounts the button conditionally, `app/api/fulfillment/click/route.ts` dispatches on `pluginName`, `lib/types.ts` adds telehealth + plugin_name + optional `shouldRender?`, `.env.example` adds env placeholder). The locked engine, Signal Stack core, and N=014/N=015 plugins are FROZEN.

## NEW FILES ALLOWED THIS CYCLE (no others)

```
lib/plugins/telehealth/deepLink.ts                     pure deep-link URL generator
lib/plugins/telehealth/index.ts                        ActionPluginNormalization implementation
components/SpeakToDoctorButton.tsx                     clinical-orange escalation button
supabase/migrations/0005_fulfillment_clicks_plugin_name.sql   additive plugin_name column
agent_state/CURRENT_016.md
agent_state/S1_LOCKED_016.md
agent_state/A1_OUTPUT_016.md
agent_state/TRUTH_RESULT_016.md
agent_state/NEXT_017.md                                written by the Judge if all criteria PASS
```

No new runtime dependencies. No new components beyond `SpeakToDoctorButton`. No new lib modules outside `lib/plugins/telehealth/`. No additional API routes (the existing `/api/fulfillment/click` is extended additively).

## FILES MODIFIED THIS CYCLE (only these)

```
lib/pluginRegistry.ts        seed `registered` with [appleHealthPlugin, amazonPlugin,
                             telehealthPlugin] in that order, preserving the N=014
                             first-entry and N=015 second-entry invariants. The
                             RegisteredPlugin union already accommodates action
                             plugins; no type widening required.

components/ResultCard.tsx    import telehealthPlugin + SpeakToDoctorButton; render
                             <SpeakToDoctorButton /> conditionally above the
                             "Stack" section when telehealthPlugin.shouldRender(result)
                             is true. The supplement-card layout (with FulfillButton)
                             is byte-identical.

app/api/fulfillment/click/route.ts   additive dispatch on body.pluginName. Default
                                     "amazon" preserves N=015 behavior; "telehealth"
                                     calls telehealthPlugin.generateActionUrl(). The
                                     fail-silently rule extends to telehealth: any DB
                                     write failure still returns 200 with URL. The
                                     plugin_name field is persisted to the new column.

lib/types.ts                 additive: TelehealthDeepLink interface; FulfillmentClick
                             gains optional pluginName field; ActionPluginNormalization
                             gains optional shouldRender?(recommendation) method.
                             Existing Amazon plugin (which doesn't implement
                             shouldRender) continues to satisfy the interface.

.env.example                 append TELEHEALTH_PROVIDER_URL placeholder. The plugin
                             reads this server-side from /api/fulfillment/click at
                             request time; falls back to a generic landing page URL
                             when unset.

agent_state/SESSION_LOG.md   append the N=016 cycle entries
```

## FROZEN — DO NOT TOUCH

- `lib/engine.ts` (recommend signature locked at N=012; this cycle does NOT touch it)
- `lib/signalLayers.ts`, `lib/signalPriority.ts`, `lib/pluginContract.ts` (Signal Stack core)
- `lib/plugins/appleHealth/parser.ts`, `lib/plugins/appleHealth/normalizer.ts`, `lib/plugins/appleHealth/index.ts` (N=014 plugin)
- `lib/plugins/amazon/affiliateUrl.ts`, `lib/plugins/amazon/index.ts` (N=015 plugin)
- `components/FulfillButton.tsx` (N=015 component)
- All other `lib/*` (`supplements`, `conflicts`, `variation`, `confidence`, `units`, `slug`, `timeline`, `timelineData`, `labParser`, `labMapping`, `scanner`, `voice`, `voiceParser`, `bodySystems`, `svgPositions`, `subscription`, `spearCopy`, `feedback`, `stripe`, `proAccess`, `supabase`, `email`, `nutrition`, `verdict`)
- Every API route except the existing `/api/fulfillment/click` (additive dispatch only)
- Every component except `ResultCard.tsx` (conditional mount only) and the new `SpeakToDoctorButton.tsx`
- App pages (`app/page.tsx`, `app/layout.tsx`, `app/r/[slug]/page.tsx`, `app/pricing/page.tsx`, `app/account/page.tsx`, `app/admin/feedback/page.tsx`, sign-in / sign-up)
- `tailwind.config.ts`, `app/globals.css`, `postcss.config.js`, `next.config.js`, `tsconfig.json`, `middleware.ts`, `vercel.json`, `package.json`, `package-lock.json`
- All prior Supabase migrations (0001 + 0002 + 0003 + 0004) + Python files
- N=013 audit-trail infrastructure (`scripts/verify-audit-trail.sh`, `agent_state/AUDIT_TRAIL_PROTOCOL.md`)

## DEEP-LINK GENERATOR CONTRACT — `lib/plugins/telehealth/deepLink.ts`

```ts
import type { Recommendation } from "@/lib/types";

/**
 * Pure deterministic deep-link generator. Maps a recommendation context
 * to a URL on the configured telehealth provider's landing page.
 *
 * @param recommendation  — the engine output. The function inspects
 *                          goalConflict and supplement names to derive the
 *                          escalation `reason` query parameter. May be null.
 * @param providerUrl     — base URL of the telehealth provider, e.g.
 *                          "https://www.sesamecare.com/". When empty or
 *                          whitespace, falls back to a hardcoded generic
 *                          landing page URL.
 * @returns               — a fully-qualified URL with optional `?reason=...`
 *                          appended. Never throws. Identical inputs always
 *                          produce identical URLs.
 */
export function generateTelehealthDeepLink(
  recommendation: Recommendation | null,
  providerUrl: string,
): string;
```

`reason` query values (closed enum):
- `medical-clearance` — when goalConflict.message contains medical/clinic/clearance vocabulary
- `goal-conflict` — when goalConflict is non-null but doesn't trigger medical-clearance
- `clinician-oversight-supplement` — when no goalConflict but a supplement in the stack matches the curated oversight list (iron, melatonin)
- (no `reason` param) — when no escalation indicator present

The pure module imports only the `Recommendation` type. Zero dependencies.

## PLUGIN CONTRACT — `lib/plugins/telehealth/index.ts`

```ts
import type {
  ActionPluginNormalization,
  Recommendation,
} from "@/lib/types";
import { generateTelehealthDeepLink } from "./deepLink";

const FALLBACK_PROVIDER_URL = "https://www.sesamecare.com/";

const CLINICIAN_OVERSIGHT_SUPPLEMENT_KEYS: ReadonlyArray<string> = [
  "iron",
  "melatonin",
];

export const telehealthPlugin: ActionPluginNormalization & {
  shouldRender(recommendation: Recommendation): boolean;
} = {
  name: "telehealth",
  kind: "action",
  generateActionUrl(_supplementName: string): string {
    const providerUrl = process.env.TELEHEALTH_PROVIDER_URL ?? "";
    return generateTelehealthDeepLink(null, providerUrl);
  },
  shouldRender(recommendation): boolean {
    if (!recommendation) return false;
    if (recommendation.goalConflict !== null) return true;
    return recommendation.supplements.some((s) => {
      const lower = s.name.toLowerCase();
      return CLINICIAN_OVERSIGHT_SUPPLEMENT_KEYS.some((k) =>
        lower.startsWith(k),
      );
    });
  },
};
```

Pure on construction. Reads `process.env.TELEHEALTH_PROVIDER_URL` at call time so the env var can be configured after deployment. The `_supplementName` parameter is required by `ActionPluginNormalization` but not consumed — telehealth's URL is recommendation-context-driven, not supplement-name-driven; the route layer passes the full Recommendation to `generateTelehealthDeepLink` separately.

## TYPES EXTENSION — `lib/types.ts`

Modifications (all additive):

```ts
// 1. ActionPluginNormalization gains optional shouldRender method
export interface ActionPluginNormalization {
  readonly name: string;
  readonly kind: "action";
  generateActionUrl(supplementName: string): string;
  // N=016: optional. Returns true when this action button should render
  // for the given recommendation. Implementations that always render
  // (e.g. Amazon FulfillButton on every supplement card) leave this
  // undefined.
  shouldRender?(recommendation: Recommendation): boolean;
}

// 2. FulfillmentClick gains optional pluginName field
export interface FulfillmentClick {
  supplementName: string;
  affiliateUrl: string;
  userId?: string | null;
  clickedAt?: string;
  pluginName?: "amazon" | "telehealth";
}

// 3. New TelehealthDeepLink type for the route response shape
export interface TelehealthDeepLink {
  url: string;
  reason: "medical-clearance" | "goal-conflict" | "clinician-oversight-supplement" | null;
}
```

Existing types (`UserInput`, `TaggedUserInput`, `Recommendation`, `SupplementPick`, `LabValues`, etc.) byte-identical.

## REGISTRY MODIFICATION — `lib/pluginRegistry.ts`

The `RegisteredPlugin` union from N=015 already covers `PluginNormalization | ActionPluginNormalization`. Seed the `registered` array with `[appleHealthPlugin, amazonPlugin, telehealthPlugin]`. The N=014 + N=015 first/second-entry invariants are preserved. `registerPlugin` / `clearRegistry` exports byte-identical to N=015.

## SPEAK-TO-DOCTOR BUTTON CONTRACT — `components/SpeakToDoctorButton.tsx`

- `'use client'`.
- Props: none. The button represents a generic "talk to a doctor" routing action; no per-supplement context is required.
- Renders a `<button type="button">` styled in clinical orange (locked palette `#FF6B35`):
  - `bg-clinical text-paper` background fill, OR `border-clinical text-clinical hover:bg-clinical/10` outline.
  - `font-mono`, `text-xs` or `text-sm`, `uppercase`, `tracking-wider`.
  - `rounded-md`, `px-4`, `py-2.5`.
  - Pre-styled to be visible on mobile without scrolling when mounted above the supplement list.
- Inner content: lucide `Stethoscope` icon (`w-4 h-4`) + literal text `Speak to a doctor`.
- On click:
  1. Synchronously call `window.open("about:blank", "_blank", "noopener,noreferrer")` for popup-blocker safety.
  2. `fetch("/api/fulfillment/click", { method: "POST", headers, body: JSON.stringify({ pluginName: "telehealth", supplementName: "escalation" }) })` to log the click and retrieve the deep-link URL. (`supplementName` is set to `"escalation"` as a synthetic placeholder so the existing `supplement_name` non-null column accepts the row; the real escalation context lives in the URL's `?reason=` parameter and the `plugin_name="telehealth"` discriminator.)
  3. On `200 { ok: true, url }`, set `newTab.location.href = url`.
  4. On any failure (network, JSON parse, missing url), `newTab.close()` and silently swallow the error.
- The button mounts conditionally inside `ResultCard` (see below); when not rendered, no DOM cost.
- Locked palette only. No hex literals beyond what Tailwind classes resolve.
- Carries `data-testid="speak-to-doctor-button"` for Judge DOM verification.

## API ROUTE EXTENSION — `app/api/fulfillment/click/route.ts`

The existing route from N=015 gains an additive `pluginName` dispatch:

```ts
type PluginName = "amazon" | "telehealth";
const VALID_PLUGINS: ReadonlySet<PluginName> = new Set(["amazon", "telehealth"]);

const rawPluginName = typeof body.pluginName === "string" ? body.pluginName : "amazon";
const pluginName: PluginName = VALID_PLUGINS.has(rawPluginName as PluginName)
  ? (rawPluginName as PluginName)
  : "amazon";

let url: string;
if (pluginName === "telehealth") {
  url = telehealthPlugin.generateActionUrl(supplementName);
} else {
  url = amazonPlugin.generateActionUrl(supplementName);
}

// DB insert now includes plugin_name; backward-compatible default is
// "amazon" via the column default in migration 0005, but the route
// also explicitly sets it for clarity.
await supabase.from("fulfillment_clicks").insert({
  supplement_name: supplementName,
  affiliate_url: url,
  user_id: userId,
  plugin_name: pluginName,
});

return NextResponse.json({ ok: true, url });
```

Behavior preserved for N=015 callers:
- `POST { supplementName }` (no `pluginName`) → `pluginName="amazon"` (default) → identical Amazon URL + identical response shape as N=015.
- `POST { supplementName, pluginName: "amazon" }` → identical to N=015 (just makes the dispatch explicit).
- `POST { supplementName, pluginName: "telehealth" }` → telehealth URL + log row tagged `plugin_name="telehealth"`.
- Invalid `pluginName` value → silently coerced to "amazon" (fail-silently rule).

The fail-silently rule continues to apply: missing Supabase env, RLS rejection, network failure inside the insert all yield `200 { ok: true, url }`.

## MIGRATION CONTRACT — `supabase/migrations/0005_fulfillment_clicks_plugin_name.sql`

```sql
-- N=016: add plugin_name column to fulfillment_clicks. Default is
-- 'amazon' so existing rows from N=015 are correctly classified after
-- migration apply.
ALTER TABLE fulfillment_clicks
  ADD COLUMN plugin_name text NOT NULL DEFAULT 'amazon';

-- RLS policies and indexes from migration 0004 are unchanged.
```

Additive only. Backward-compatible. Existing rows get `plugin_name='amazon'` by default; new rows from this cycle's clients get either `'amazon'` or `'telehealth'` based on the route's dispatch.

## RESULTCARD MODIFICATION — `components/ResultCard.tsx`

Conditional mount above the existing "Stack" section:

```tsx
import { SpeakToDoctorButton } from "./SpeakToDoctorButton";
import { telehealthPlugin } from "@/lib/plugins/telehealth";
// ... existing imports unchanged ...

// Inside the function body, before the SectionHeader for "Stack (n picks)":
const showEscalation = telehealthPlugin.shouldRender(result);

return (
  <section ...>
    {/* ... existing Spear / verdict / vault / etc. ... */}

    {showEscalation ? (
      <div className="mt-8 mb-2">
        <SpeakToDoctorButton />
      </div>
    ) : null}

    <SectionHeader icon={<Pill .../>}>
      Stack (... picks)
    </SectionHeader>
    {/* ... existing supplement grid (with FulfillButton from N=015) — byte-identical ... */}
  </section>
);
```

Every other line in `ResultCard.tsx` is byte-identical against N=015. The `FulfillButton` mount inside each supplement article is unchanged.

## ENV EXTENSION — `.env.example`

Append at the bottom:

```
# --- N=016: Telehealth deep-link plugin ---
# Base URL of the telehealth provider's landing page, e.g.
# "https://www.sesamecare.com/". Configured in Vercel for both
# Production and Preview before launch. When unset, the SpeakToDoctor
# button still works and routes the user to a generic fallback landing
# page; users are not directed to the intended provider until the
# variable is configured. Read at request time by /api/fulfillment/click.
TELEHEALTH_PROVIDER_URL=
```

## ACCEPTANCE CRITERIA (Judge will verify all 12)

1. `npm install` succeeds. Zero new dependencies. `git diff main -- package.json package-lock.json` empty.
2. `npm run build` succeeds with zero errors.
3. `bash scripts/verify-audit-trail.sh` exits 0 against this cycle's state files.
4. `generateTelehealthDeepLink(<rec with goal-conflict>, "https://www.sesamecare.com/")` returns a URL beginning with `https://www.sesamecare.com/` and containing a `reason=` query parameter.
5. `generateTelehealthDeepLink(null, "")` returns a non-empty fallback URL (no exception).
6. `getActivePlugins()` returns an array of length 3 with `[0].name === "apple-health"`, `[1].name === "amazon"`, `[2].name === "telehealth"`. The N=014/N=015 first-and-second-entry invariants are preserved.
7. `telehealthPlugin.shouldRender(<rec with goalConflict>)` returns `true`. `shouldRender(<rec with iron in stack>)` returns `true`. `shouldRender(<routine rec, no flags>)` returns `false`.
8. `POST /api/fulfillment/click { pluginName: "telehealth", supplementName: "escalation" }` returns `200 { ok: true, url }` where URL contains the configured provider host (or fallback).
9. `POST /api/fulfillment/click { supplementName: "Creatine monohydrate" }` (no `pluginName`) returns the same Amazon URL and response shape as N=015 — backward compatibility preserved.
10. `POST /api/fulfillment/click { pluginName: "telehealth" }` returns 200 even when Supabase env is absent — fail-silently rule honored.
11. `<SpeakToDoctorButton>` renders inside `ResultCard` above the supplement list when `shouldRender(rec)` is true (verified via DOM `[data-testid="speak-to-doctor-button"]` for an escalation-flagged input). It does NOT render for a routine recommendation.
12. **N=015 regression intact:**
    - `recommend(input)` byte-identical to N=015 (engine pipeline untouched).
    - Amazon `<FulfillButton>` still renders on each supplement card.
    - Apple Health upload card still mounts above the assessment form.
    - `InteractiveTimeline` still mounts with `PLAY_DURATION_MS = 30_000`.
    - `/pricing` three-tier copy intact.
    - `lib/subscription.ts` DEV MODE comment unchanged.
    - The N=014/N=015 byte-identical engine regression still holds.

## BANNED THIS CYCLE

- New runtime dependencies
- Modifications to `lib/engine.ts`, `lib/signalLayers.ts`, `lib/signalPriority.ts`, `lib/pluginContract.ts`
- Modifications to N=014 Apple Health plugin (`lib/plugins/appleHealth/*`)
- Modifications to N=015 Amazon plugin (`lib/plugins/amazon/*`) and the `FulfillButton` component
- Actual telehealth API integration, OAuth, patient-data transmission, booking execution
- Any claim in copy that the product is providing medical advice or replacing a clinician
- Chatbot or AI-assistant framing of the button
- Any new color outside the locked palette (the new clinical-orange usage is already in the palette)
- The string `"AI-powered"`, `from-purple-` / `to-purple-` Tailwind classes
- `localStorage`, `sessionStorage`, `document.cookie`
- Any change that breaks regression #12

## OPERATOR INSTRUCTIONS — Atomic commits

Per the architect's order, the operator commits 10 atomic changes. The architect's recommended order placed `types.ts` modifications late (commit 8); the actual commit ladder starts with the types extension because the deep-link, plugin index, click route, and ResultCard all import the new types. The end-state diff is identical to the recommended order regardless of ladder shape.

```
1.  N=016 operator: add TelehealthDeepLink + extend FulfillmentClick + optional shouldRender? in lib/types.ts
2.  N=016 operator: add lib/plugins/telehealth/deepLink.ts (pure deep-link generator)
3.  N=016 operator: add lib/plugins/telehealth/index.ts (ActionPluginNormalization + shouldRender)
4.  N=016 operator: add components/SpeakToDoctorButton.tsx (clinical-orange escalation button)
5.  N=016 operator: add supabase/migrations/0005_fulfillment_clicks_plugin_name.sql
6.  N=016 operator: extend app/api/fulfillment/click/route.ts to dispatch on pluginName
7.  N=016 operator: register telehealth as 3rd entry in lib/pluginRegistry.ts
8.  N=016 operator: mount SpeakToDoctorButton conditionally above stack in ResultCard
9.  N=016 operator: add TELEHEALTH_PROVIDER_URL to .env.example
10. N=016 operator: write A1_OUTPUT_016.md manifest
```

## HANDOFF

→ Sentinel reads this file and emits GATE: OPEN or GATE: BLOCK.
→ Watcher invokes `bash scripts/verify-audit-trail.sh` per the N=013 protocol.
