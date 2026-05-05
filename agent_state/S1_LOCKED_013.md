# S1_LOCKED_013.md

**N:** 013 **Hat:** ARCHITECT **Status:** LOCKED — NO DRIFT ALLOWED **Predecessors:** S1_LOCKED.md · S1_LOCKED_002..S1_LOCKED_012.md (all still binding)

This document is *additive*. Prior locked contracts remain in force.

---

## SCOPE

Infrastructure-only cycle. Diagnose the audit-trail gap from the N=009..N=011 reconstruction event, install a verifiable Watcher-phase guard, and document the protocol for all future cycles. Zero product-code changes.

## NEW FILES ALLOWED THIS CYCLE (no others)

```
scripts/verify-audit-trail.sh        executable bash script (exits non-zero on missing state)
agent_state/AUDIT_TRAIL_PROTOCOL.md  root cause + protocol doc; future cycles read this
agent_state/CURRENT_013.md
agent_state/S1_LOCKED_013.md
agent_state/A1_OUTPUT_013.md
agent_state/TRUTH_RESULT_013.md
agent_state/NEXT_014.md              written by the Judge if all 5 criteria PASS
```

No new components. No new lib modules. No new routes. No new migrations. No new dependencies.

## FILES MODIFIED THIS CYCLE (only these)

```
agent_state/SESSION_LOG.md   append the N=013 cycle entries
.gitignore                   ONLY if investigation shows it excludes agent_state/*.md
                             (investigation has shown it does NOT — so .gitignore
                             remains UNCHANGED; this slot stays empty)
```

If `.gitignore` is found to be non-causal (which it is — verified below), no diff is committed against `.gitignore`.

## FROZEN — DO NOT TOUCH

- All product code in `lib/`, `components/`, `app/`, `python/`, `supabase/`
- `tailwind.config.ts`, `app/globals.css`, `postcss.config.js`, `next.config.js`, `tsconfig.json`, `middleware.ts`, `vercel.json`, `package.json`, `package-lock.json`
- All N=012 signal-stack files (`lib/signalLayers.ts`, `lib/signalPriority.ts`, `lib/pluginContract.ts`, `lib/pluginRegistry.ts`) and the engine signature
- All prior `agent_state/*.md` files (CURRENT_002..CURRENT_012, S1_LOCKED_002..S1_LOCKED_012, A1_OUTPUT_002..A1_OUTPUT_012, TRUTH_RESULT_002..TRUTH_RESULT_012, NEXT_*.md, QUEUE.md, CONTEXT_PACKET.md). The cycle appends to SESSION_LOG.md; everything else is read-only.

## ROOT CAUSE FINDING (from Operator pre-investigation)

The investigation conducted by the Operator before contract lock revealed:

1. **`.gitignore` is NOT the cause.** The repo's `.gitignore` excludes only `node_modules/`, `.next/`, `out/`, `*.log`, `.DS_Store`, `.env.local`, `.env.production`, and `tsconfig.tsbuildinfo`. `agent_state/*.md` is fully tracked. `git check-ignore -v agent_state/CURRENT_013.md` returns `(not ignored)`.
2. **No Claude Code session config excludes state files.** `.claude/` directory and `.claude.json` are absent in the project. No hooks or settings interfere with staging.
3. **The N=009 / N=010 / N=011 state files DO appear in git history per branch.** Each cycle branch carries the state files for its own cycle. The reconstruction was needed because earlier cycle branches were deleted or force-replaced before the state files for cycle N+1 were created on top of them — at which point the file existed in the working tree but the branch's commit history did not carry it.
4. **The actual root cause is procedural.** The 6-Hat Agent Loop did not enforce a Watcher-phase audit on whether the cycle's state files are present in the branch's commit log. Operators sometimes appended `A1_OUTPUT_NNN.md` to the Sentinel or Judge commit, sometimes split it into its own commit; in the absence of a formal audit, a file written-but-not-staged could pass through the cycle undetected and only surface at PR-merge time when the branch is squashed or rebased.

The fix is therefore a **Watcher-phase audit script**, not a `.gitignore` change.

## VERIFY SCRIPT CONTRACT — `scripts/verify-audit-trail.sh`

- Executable bash script (`#!/usr/bin/env bash`, `chmod +x`).
- Default behavior with no arguments: autodetect the active cycle number by scanning `agent_state/` for the highest `CURRENT_NNN.md` (where `NNN` is a zero-padded three-digit cycle number).
- Optional first argument: explicit three-digit cycle number, e.g. `./scripts/verify-audit-trail.sh 013`.
- For the active cycle `NNN`, the script asserts:
  1. `agent_state/CURRENT_NNN.md` exists in the working tree.
  2. `agent_state/CURRENT_NNN.md` is tracked AND committed (i.e. `git log --oneline -- agent_state/CURRENT_NNN.md` returns at least one commit on the current branch).
  3. `agent_state/S1_LOCKED_NNN.md` exists, tracked, and committed.
  4. `agent_state/A1_OUTPUT_NNN.md` exists, tracked, and committed (or at minimum staged so the next commit will include it — Watcher allows the manifest to be staged-but-not-yet-committed because the manifest is conventionally the last operator commit).
  5. `git diff HEAD -- agent_state/CURRENT_NNN.md agent_state/S1_LOCKED_NNN.md` is empty (no working-tree drift against the committed state for the locked contract files).
- Any failed assertion prints a clear message to stderr and exits non-zero.
- All assertions pass → exit 0 with a one-line success message to stdout.
- Side-effect free: no writes, no network, no env-var pollution.
- Idempotent: running it twice in a row produces the same exit code.

## PROTOCOL DOC CONTRACT — `agent_state/AUDIT_TRAIL_PROTOCOL.md`

- Sections in order:
  1. **Diagnosis** — restate the root cause finding from the contract above.
  2. **Fix** — describe the verify script, its invocation pattern, and the Watcher-phase integration.
  3. **Mandatory read order amendment** — declare that all future Commander phases MUST add `AUDIT_TRAIL_PROTOCOL.md` to their mandatory read order, alongside `CURRENT_*.md`, `S1_LOCKED_*.md`, etc.
  4. **Watcher-phase amendment** — declare that all future Watcher phases MUST run `bash scripts/verify-audit-trail.sh` and refuse to mark the cycle GATE-OPEN-WATCHER-CLEAN if the script exits non-zero.
  5. **Recovery procedure** — describe how an operator should respond if the verify script fails mid-cycle (re-stage missing files; redo Operator commit if staged file was lost; write `RECOVERY_NNN.md` if the branch state can't be reconstructed).

## SESSION_LOG amendment

The N=013 SESSION_LOG entries reference the verify script by path and explicitly state that all future Watcher entries must include the verify-script result.

## ACCEPTANCE CRITERIA (Judge will verify all 5)

1. Root cause is documented in `agent_state/AUDIT_TRAIL_PROTOCOL.md` with a clear written diagnosis (not a one-liner). Specifically, the doc states that `.gitignore` is NOT the cause and identifies the actual procedural cause.
2. Running `bash scripts/verify-audit-trail.sh` from the repo root in a state where `CURRENT_013.md` is not committed exits non-zero with a clear error message; running it after the file is committed exits 0 with a success message. Both behaviors are demonstrated by the Judge.
3. After Commander wrote `CURRENT_013.md` (this cycle), `git status` showed the file as untracked — proving `.gitignore` does NOT exclude it. The Judge re-runs `git check-ignore -v agent_state/CURRENT_013.md` and confirms the file is not ignored.
4. `agent_state/AUDIT_TRAIL_PROTOCOL.md` contains a Watcher-phase amendment that names `scripts/verify-audit-trail.sh` and requires future cycles to invoke it. The Judge greps the protocol doc for the exact verify-script path and confirms the reference exists.
5. All N=012 behaviors regress green: `recommend(input)` byte-identical, `recommend(input, taggedInputs)` honors lab > wearable > behavior priority, `getActivePlugins()` returns empty array, `npm run build` clean.

## BANNED THIS CYCLE

- Modifications to product code (any file in `lib/`, `components/`, `app/`, `python/`, `supabase/`)
- New runtime dependencies (no `npm install` of any package)
- Changes to user-facing flow
- Modifying `.gitignore` unless the investigation shows it's the cause (it is NOT)
- The verify script reaching out to the network or invoking `npm`
- Adding TODO/placeholder content; the script must be functional and tested

## OPERATOR INSTRUCTIONS — Atomic commits per file group

```
1.  N=013 operator: add scripts/verify-audit-trail.sh (executable)
2.  N=013 operator: add agent_state/AUDIT_TRAIL_PROTOCOL.md
3.  N=013 operator: write A1_OUTPUT_013.md manifest
```

## HANDOFF

→ Sentinel reads this file and emits GATE: OPEN or GATE: BLOCK.
