# CURRENT_013.md

**N:** 013 **Hat:** COMMANDER (Jay) **Date:** 2026-05-05 **Status:** ACTIVE **Predecessor:** N=012 (PASS, this branch builds on N=012)

---

## INTENT

N=013 fixes the root cause of the audit-trail gap that required N=009 / N=010 / N=011 to be reconstructed from git history per the `agent_state/reconstruct-009-011` merge. No product code changes. Three objectives:

**A — Diagnose the root cause.**
Inspect `.gitignore` for rules excluding `agent_state/*.md`. Inspect any Claude Code session config (`.claude/`, `.claude.json`) for hooks or settings that might exclude state files. Inspect git history for the actual sequence of state-file commits across N=009 / N=010 / N=011 to determine where the gap occurred. Document the finding.

**B — Install a verifiable guard.**
A `scripts/verify-audit-trail.sh` script that runs as part of every future cycle's Watcher phase. The script reads the active cycle number (passed as an argument or autodetected from the latest `agent_state/CURRENT_NNN.md`) and asserts that, for that cycle:

- `agent_state/CURRENT_NNN.md` is committed (not just present in the working tree).
- `agent_state/S1_LOCKED_NNN.md` is committed.
- `agent_state/A1_OUTPUT_NNN.md` is committed (or staged for the imminent commit).
- The active branch carries those files in its log against the parent branch (catches the case where state files exist in the working tree but were lost from the commit graph by a force-replace or branch-recreate).

A non-zero exit code fails the Watcher phase, blocking the cycle from being marked PASS until the operator re-stages the missing files.

**C — Document the protocol.**
A new `agent_state/AUDIT_TRAIL_PROTOCOL.md` describing the discovered root cause, the fix, and the mandatory read order for future cycles. The 6-Hat Agent Loop's Watcher phase instructions are extended to include a reference to the verify script. The Commander phase mandatory read order is extended to include `AUDIT_TRAIL_PROTOCOL.md` so the protocol survives across sessions.

## SCOPE BOUNDARY

Infrastructure only. Zero product-code changes. Zero new runtime dependencies. The product, the engine, every component, every route, every migration — all FROZEN. The signal stack from N=012 is FROZEN (read but not modified).

## SUCCESS DEFINITION

- Root cause documented in `AUDIT_TRAIL_PROTOCOL.md`.
- `scripts/verify-audit-trail.sh` runs and:
  - Returns exit 0 when the current cycle's state files are committed.
  - Returns non-zero when any required state file is missing or untracked.
  - Detects untracked, unstaged, modified-but-uncommitted, AND not-in-branch-history conditions.
- After Commander writes `CURRENT_013.md`, `git status` shows it as untracked or modified — confirming `.gitignore` does not exclude it (regression-proves the diagnosis).
- `AUDIT_TRAIL_PROTOCOL.md` references the verify script + adds it to the mandatory Watcher checklist.
- All N=012 behaviors regress green (signal stack foundation, plugin contract, `recommend` backward compatibility).

## CONSTRAINTS (Commander level)

- No product-code changes. Bash + Node-only verify script. No new `npm` dependency.
- No modification to `package.json`, `tailwind.config.ts`, or any frozen file.
- `.gitignore` modified ONLY if the investigation finds a rule excluding `agent_state/*.md`. If the investigation shows it's not excluded (the actual finding — see Operator phase), `.gitignore` stays untouched.
- The verify script must be deterministic and idempotent. Running it twice in a row with no state changes produces identical output.
- The verify script must work in any clean git checkout of the repo without external setup beyond a working `bash` and `git` on PATH.
- No user-facing flow change. The product stays byte-identical.

## HANDOFF

→ Architect writes `/agent_state/S1_LOCKED_013.md`. All prior locked contracts remain binding.
