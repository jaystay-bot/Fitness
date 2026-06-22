
## Session 2026-06-22 (N=020–N=030)

- **Theme cascade is the cheapest leverage.** The whole app skins through 4–6
  Tailwind tokens (ink/paper/lime/clinical + surface/elevate/gold). Re-skinning =
  redefine tokens + update the visual.spec lock + QUEUE primitive in lockstep.
- **Visual locked-color primitive** has been re-frozen twice (N=020, N=026) under
  Commander authorization. Always update tests/visual.spec.ts AND the QUEUE
  STANDING JUDGE PRIMITIVE together, or the tripwire diverges silently.
- **Optional UserInput fields** (e.g. `inflammation`) keep every construction site
  valid; thread them through slug encode/decode + the recommend route + the form.
  But exhaustive `Record<keyof UserInput, …>` (VoiceInput) forces a label add —
  expect that ripple and add the file to the lock before editing.
- **No-egress sandbox**: external hosts (PubMed eutils, image CDNs) are blocked by
  network policy AND WebFetch (403). Do not fake data. Build the mechanism + an
  honest fallback/placeholder, and document the allowlist step.
- **Compliance as a build gate**: a module-load `auditCopy` over seed copy fails
  the build on blocked medical claims — unsafe copy literally cannot ship.
- **Determinism proof without a test runner**: POST the same input to
  /api/recommend twice against the built server and diff the JSON.
