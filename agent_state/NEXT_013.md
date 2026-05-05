# NEXT_013.md

**Proposed:** N=013 **From:** N=012 Judge **Date:** 2026-05-04

---

## RECOMMENDED NEXT CYCLE

**N=013 — Audit trail infrastructure: guarantee loop integrity for all future cycles.**

Per the N=012 guardrail: "After this cycle merges, immediately fire N=013 as the audit trail infrastructure cycle that fixes whatever caused N=009 through N=011 state files to not be committed in the first place. Plugin work should not begin until the loop's audit trail integrity is guaranteed for all future cycles."

## PROBLEM TO SOLVE

N=009 through N=011 shipped product work but never wrote or committed their agent_state files. The gap was discovered at the N=012 read-order check and required a full reconstruction cycle before N=012 could proceed. If plugin cycles (N=014+) experience the same gap, reconstructions will be significantly harder because plugin code has larger diffs, more complex type contracts, and more interaction surface.

## PROPOSED SOLUTION

N=013 establishes a git pre-commit hook (or equivalent) that enforces agent_state file presence before any product-code commit lands. Specifically:

1. **Pre-commit hook** — before any commit that touches `lib/`, `components/`, `app/`, or `middleware.ts`, verify that a `CURRENT_NNN.md` file exists in `agent_state/` matching the current N number. If absent, block the commit with a clear message: "Agent state file missing — write agent_state/CURRENT_NNN.md before committing product code."

2. **N-tracking convention** — establish a single source of truth for the current N number. Options: a one-line `agent_state/CURRENT_N_NUMBER` file, or a field in `QUEUE.md`. The pre-commit hook reads this to know which CURRENT_NNN.md to require.

3. **Retroactive validation script** — `scripts/validate-agent-state.ts` that verifies every commit in the repo's history that touches product code has a corresponding agent_state CURRENT file, producing a report of any gaps. This script becomes part of the CI check.

## SCOPE CONSTRAINTS

- No product feature changes.
- No engine changes.
- No component changes.
- No new runtime dependencies.
- The hook and validation script are dev tooling only.

## WHY THIS BEFORE PLUGINS

The Apple Health plugin (originally proposed for N=013) requires a reliable audit trail to track its contract evolution. The plugin contract shipped in N=012 is new and will be iterated. Every iteration must have a clear TRUTH_RESULT to establish the regression baseline. Shipping the audit enforcement now costs one cycle; skipping it risks multiple reconstruction cycles across the plugin development arc.
