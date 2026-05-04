# S1_LOCKED_008.md

N=008 mobile polish and input normalization contract. Prior locks S1_LOCKED.md through S1_LOCKED_007.md remain binding.

## NEW FILES ALLOWED

None unless absolutely required. If needed for numeric input display normalization only:
- /lib/inputDisplay.ts (pure formatting functions only)

## FILES MODIFIED

- /components/AssessmentForm.tsx — numeric input display normalization across seven fields
- /components/Hero.tsx — mobile layout spacing and section rhythm
- /components/EvidenceLedger.tsx — mobile stacking behavior
- /components/ResultCard.tsx — mobile spacing only; no data rendering logic changes
- /components/LabUpload.tsx — mobile layout only
- /components/LabComparison.tsx — mobile layout only
- /components/BottleScanner.tsx — mobile layout only
- /components/ScanResult.tsx — mobile layout only
- /components/TimelineProjection.tsx — mobile layout only
- /app/page.tsx — outer wrapper spacing and safe-area padding
- /app/globals.css — safe-area utilities if needed, preserving palette and typography

No other file may be touched.

## FROZEN

- /lib/engine.ts
- /lib/supplements.ts
- /lib/conflicts.ts
- /lib/variation.ts
- /lib/confidence.ts
- /lib/units.ts
- /lib/slug.ts
- /lib/timeline.ts
- /lib/timelineData.ts
- /lib/labParser.ts
- /lib/labMapping.ts
- /lib/scanner.ts
- /lib/subscription.ts
- All API routes
- /tailwind.config.ts
- /supabase migrations
- /package.json (zero new dependencies)
- /components/ConflictBanner.tsx, EmailCapture.tsx, UpgradeButton.tsx, AccountMenu.tsx, ProGate.tsx, UnitToggle.tsx, all N=005 motion components behavior (class-only mobile adjustments allowed, no logic changes)

## NUMERIC INPUT DISPLAY CONTRACT

Fields covered: age, height feet, height inches, weight, sleep, coffee, alcohol.

Rules:
- No forced leading zeroes in display (`05` displays as `5`).
- Empty input stays empty (`""`), never coerced to `0` in the UI.
- Underlying numeric parsing passed to the engine remains behaviorally identical at submit time.
- Implementation may use inputMode="numeric" and controlled sanitization, or parseInt-then-toString normalization, while preserving empty-state behavior.

## MOBILE LAYOUT CONTRACT

Must render cleanly with no overlap or horizontal overflow at:
- 390px
- 430px
- 768px
- desktop

Applies to hero, evidence ledger, assessment form, result card sections, lab upload, bottle scanner, timeline projection, and any sticky/footer/CTA elements.

Bottom safe-area handling must use `env(safe-area-inset-bottom)` or equivalent utility.

Palette and typography remain locked. Fixes are spacing, sizing, stacking, and z-index only.

## ACCEPTANCE CRITERIA (9)

1. npm install succeeds. Zero new dependencies.
2. npm run build succeeds with zero errors.
3. 390px screenshot: /agent_state/screenshots/mobile_390_clean.png
4. 430px screenshot: /agent_state/screenshots/mobile_430_clean.png
5. 768px screenshot: /agent_state/screenshots/tablet_768_clean.png
6. Numeric input test: typing `05` in age displays `5`; clearing returns empty; submit sends correct numeric value.
7. Safe-area test: bottom content not cut off by iOS gesture area under mobile emulation.
8. N=007 regressions pass (timeline render, lab parser known/unknown paths, scanner conservative confidence, prior behavior unchanged).
9. Ensure agent state is tracked in git via `git add agent_state/*.md`.

## BANNED

- Modifying frozen files
- New runtime dependency
- Engine/supplement/conflict/scoring/API/data-model changes
- UserInput type or engine signature changes
- localStorage, sessionStorage, cookies
- `AI-powered`
- `from-purple-` or `to-purple-`
- New colors outside locked palette (#0A0A0A, #FAFAF7, #D4FF3A, #FF6B35)
- Analytics SDK
- Component-tree restructuring beyond required polish fixes