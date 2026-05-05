# AUDIT_TRAIL_PROTOCOL.md

**Authored by:** N=013 (Operator) **Date:** 2026-05-05 **Status:** BINDING for N=014+

This document is part of the **mandatory read order** for every future Commander phase. It must be read alongside `CURRENT_NNN.md`, `S1_LOCKED_NNN.md`, and the prior cycle's `TRUTH_RESULT_NNN.md`. The Watcher-phase amendment described below is binding starting at N=014.

---

## 1. Diagnosis

The reconstruction of `N=009 / N=010 / N=011` from git history (per the `agent_state/reconstruct-009-011` merge) revealed an audit-trail gap. The investigation conducted in N=013 found:

- **`.gitignore` is NOT the cause.** The repo's `.gitignore` excludes only build artefacts and env files — `agent_state/*.md` is fully tracked. `git check-ignore -v agent_state/CURRENT_013.md` returned `(not ignored)` and `git status` showed `CURRENT_013.md` as untracked immediately after the Commander wrote it, which is the correct git behavior for a new file in a non-ignored directory.
- **No Claude Code session config interferes.** The project carries no `.claude/` directory and no `.claude.json` file, so there are no hooks or settings that could exclude state files from the staging step.
- **State files DID exist on each cycle's branch at some point** — git log per branch confirms `CURRENT_NNN.md`, `S1_LOCKED_NNN.md`, and `A1_OUTPUT_NNN.md` were written. The gap occurred because earlier cycle branches were occasionally deleted, force-replaced, or rebased before the next cycle's branch was created from them, and the state files for the previous cycle were lost from the commit graph that ultimately reached `main`.
- **The actual root cause is procedural.** The 6-Hat Agent Loop never enforced a Watcher-phase audit on whether the active cycle's state files appear in the branch's commit log. Operators sometimes appended `A1_OUTPUT_NNN.md` to a Sentinel or Judge commit, sometimes split it into its own commit; in the absence of a formal audit, a file written-but-not-staged could pass through the cycle undetected and only surface at PR-merge time when the branch was squashed or rebased.

The fix is therefore a **Watcher-phase audit script**, not a `.gitignore` change.

## 2. Fix

A new script lives at `scripts/verify-audit-trail.sh`. It is bash-only with `git` on PATH; it has no `npm` dependency, no network access, and no side effects. Idempotent.

### Invocation

```bash
# Autodetect the active cycle by scanning for the highest CURRENT_NNN.md
bash scripts/verify-audit-trail.sh

# Explicit cycle number (3-digit zero-padded)
bash scripts/verify-audit-trail.sh 013
```

### Assertions

For the active cycle `NNN`:

1. `agent_state/CURRENT_NNN.md` exists in the working tree.
2. `agent_state/CURRENT_NNN.md` is tracked by git.
3. `agent_state/CURRENT_NNN.md` has at least one commit on the current branch (`git log HEAD -- <file>` returns ≥ 1 entry).
4. `agent_state/CURRENT_NNN.md` has zero working-tree drift against `HEAD` (lock files must not silently mutate after commit).
5. Same four checks for `agent_state/S1_LOCKED_NNN.md`.
6. `agent_state/A1_OUTPUT_NNN.md` exists, is tracked, and is either committed-on-branch OR staged-for-the-next-commit (the manifest is conventionally the final operator commit; the script tolerates running before the final commit lands).

Any failed assertion exits non-zero with a clear message to stderr. All assertions pass → exit 0 with a one-line success message to stdout.

### Exit codes

| Code | Meaning |
|------|---------|
| `0`  | All assertions passed. |
| `1`  | A specific assertion failed. The stderr message names the file and the failure mode. |
| `2`  | Usage error — bad argument, not inside a git repo, no `CURRENT_NNN.md` to autodetect, etc. |

## 3. Mandatory read order amendment (Commander phase)

**Effective N=014 onward**, every Commander phase MUST add `agent_state/AUDIT_TRAIL_PROTOCOL.md` to its mandatory read-order list. The Commander's `CURRENT_NNN.md` must reference this protocol explicitly so the protocol is propagated to every downstream cycle without relying on session memory.

Recommended boilerplate to add in the Commander's mandatory read order:

```
N. /agent_state/AUDIT_TRAIL_PROTOCOL.md  (binding since N=013)
```

## 4. Watcher-phase amendment

**Effective N=014 onward**, every Watcher phase MUST run:

```bash
bash scripts/verify-audit-trail.sh
```

The Watcher MAY run additional drift checks, but the verify-audit-trail invocation is non-negotiable. The Watcher MUST NOT mark the cycle GATE-OPEN-WATCHER-CLEAN if the verify script exits non-zero. The Watcher's SESSION_LOG entry MUST include the script's stdout success line (or its stderr failure line if the script failed).

If the verify script fails mid-cycle, the Operator follows the recovery procedure in section 5.

## 5. Recovery procedure

If `verify-audit-trail.sh` exits non-zero during a cycle's Watcher phase:

1. Read the failure message; it names the file and the failure mode.
2. **Missing file** — the Operator forgot to write a state file. Write it, stage it, commit it on the active branch, re-run the script.
3. **Untracked file** — the file exists in the working tree but was never `git add`-ed. Stage and commit, then re-run.
4. **No commit on branch** — the file was committed but the commit was lost (e.g. by a force-replace of the branch). Re-add the file, commit fresh, re-run. If history can't be reconstructed without losing other work, write `agent_state/RECOVERY_NNN.md` documenting the loss and the manual recovery taken.
5. **Working-tree drift against HEAD** — the lock file was edited after commit. This is forbidden once the contract is locked. Either revert the working-tree change to match HEAD, or amend HEAD and re-run.

The Watcher MUST re-run the script after every recovery action. Cycle PASS is gated on a clean exit-0 from the script.

## 6. RELATIONSHIP TO PRIOR CYCLES

This protocol does NOT retroactively fail N=001..N=013. Those cycles' state files are intact in `main` per the reconstruction event. The protocol applies prospectively starting N=014.
