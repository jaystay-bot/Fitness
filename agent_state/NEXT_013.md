# NEXT_013.md

**Proposed by:** Judge of N=012 **Date:** 2026-05-05 **Predecessor:** N=012 (PASS, this branch)

---

## INTENT

N=013 is the **audit trail infrastructure** cycle. The reconstruction of N=009 / N=010 / N=011 from git history (per the `agent_state/reconstruct-009-011` merge) revealed that state files for those cycles were written to the working directory but never committed. This cycle diagnoses the root cause and installs a guard that prevents the same gap from recurring.

Three objectives:

**A — Diagnose the root cause.**
Possible causes include `.gitignore` rules excluding `agent_state/`, a Claude Code session configuration that skips state-file staging, a step in the agent loop being silently dropped, or a long-context-window summary discarding the staging step. Inspect `.gitignore`, the actual git status of the current cycle's state files, the project's `.claude/` configuration if present, and the historical commit pattern. Document the finding.

**B — Install a verifiable guard.**
A `scripts/verify-audit-trail.sh` (or `.mjs`) script that the Watcher phase runs as part of every future cycle. It reads the active cycle number from `agent_state/CURRENT_NNN.md`, then asserts that `CURRENT_NNN.md`, `S1_LOCKED_NNN.md`, and `A1_OUTPUT_NNN.md` are all tracked + committed before the cycle is marked PASS. Failing to find one or more of these files (untracked / unstaged / missing) exits non-zero so the Watcher fails the cycle.

**C — Document the protocol.**
A new `agent_state/AUDIT_TRAIL_PROTOCOL.md` describing the discovered root cause, the fix, and the mandatory read order for future cycles. Future Commander phases must add this file to their mandatory read order.

## SCOPE BOUNDARY

Infrastructure only. Zero product-code changes. Zero new runtime dependencies. The product, the engine, every component, every route, every migration — all FROZEN. The signal stack from N=012 is FROZEN.

## SUCCESS DEFINITION (Judge-binding for N=013)

1. Root cause documented in `AUDIT_TRAIL_PROTOCOL.md`.
2. `scripts/verify-audit-trail.sh` runs and detects when the current cycle's state files are not staged.
3. After Commander writes `CURRENT_013.md`, `git status` shows the file as modified or untracked (confirms `.gitignore` does not exclude it).
4. The verify script is referenced in the loop's Watcher-phase instructions for all future cycles (added to `AUDIT_TRAIL_PROTOCOL.md` and SESSION_LOG).
5. All N=012 behaviors regress green (signal stack foundation, plugin contract, `recommend` backward compatibility).

## CONSTRAINTS

- No modification to product code.
- No new runtime dependencies. Bash / Node-only verify script.
- No change to user-facing flow.
- The verify script must be deterministic and idempotent.

## HANDOFF

→ N=013 Commander reads this file alongside the cycle-start mandatory read order, then writes `agent_state/CURRENT_013.md`.
