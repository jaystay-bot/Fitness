# S1_LOCKED_030

N_ID: N_030

Intent:
Future-agent expansion loop (spec N7). Document how any future agent extends the
commerce system (add products, retailers, images, offers) safely and
autonomously, with explicit escalation triggers for legal/medical/commercial
uncertainty. Update the standing agent-state files. Log THE WIRE as a future
vision. Docs only.

Scope / Allowed files:
- lib/commerce/EXPANSION.md            (new — the contributor loop for agents)
- agent_state/LESSONS.md               (append session lessons)
- agent_state/QUEUE.md                 (queue commerce follow-ups + THE WIRE vision)
- agent_state/* (trail)

Forbidden files:
- any code file ; package.json/lock

Deliverables:
- EXPANSION.md: add-a-product / add-a-retailer / add-an-image recipes + default
  decisions + "when to ask Jay" triggers.
- LESSONS + QUEUE updated.

Verify command:
```bash
npx tsc --noEmit && npm run build
```
(proves the repo is still green after the doc cycle) + verify-audit-trail.

Parallel safe: true (docs only, no code overlap). Stop: build non-zero.
