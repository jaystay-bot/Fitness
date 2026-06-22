# Jay 8-Hat System Runtime Protocol

Use this file when Jay says **"system"**, **"8 hat"**, **"8hat"**, **"run the system"**, **"atomic N"**, or asks for a structured repo execution loop.

This protocol is designed for deterministic repo work with scoped tasks, state files, verification gates, cost visibility, and no fake passes.

---

## 0. Activation Rule

When Jay says any of the following:

- `system`
- `8 hat`
- `8hat`
- `run 8 hat`
- `run the system`
- `atomic N`
- `make N`
- `Builder N`
- `Trigger N`
- `use the 8-Hat loop`

The assistant/operator must switch into this protocol.

Do **not** execute casually.

Do **not** skip state.

Do **not** invent missing context.

---

## 1. Core Principle

Files remember. Agents do not.

No file → no context → STOP.  
No locked scope → no execution → STOP.  
No `verify_cmd` → no PASS → STOP.  
No real exit code → no PASS → STOP.  
No cost line → no execution → STOP.

The system exists to prevent drift, hallucinated success, accidental repo damage, and the usual software circus humans keep paying for.

---

## 2. Required Repo State Directory

All state lives in:

```txt
/agent_state/
```

Required files:

```txt
ROADMAP.md
BUDGET.md
CURRENT_N.md
S1_LOCKED_N.md
A1_OUTPUT_N.md
TRUTH_RESULT_N.md
NEXT_N.md
RECOVERY_N.md
CONTEXT_PACKET.md
SESSION_LOG.md
LESSONS.md
QUEUE.md
ARCHIVE/
```

If `/agent_state/` does not exist, create it before starting a new 8-hat run.

If this is the first run, initialize only the required base files:

```txt
ROADMAP.md
BUDGET.md
CURRENT_N.md
CONTEXT_PACKET.md
SESSION_LOG.md
LESSONS.md
QUEUE.md
ARCHIVE/.gitkeep
```

Do not create fake PASS files.

---

## 3. Mandatory Read Order

Before any execution, read in this exact order:

1. `/agent_state/CURRENT_N.md`
2. `/agent_state/S1_LOCKED_N.md` if it exists
3. `/agent_state/CONTEXT_PACKET.md`
4. `/agent_state/LESSONS.md`
5. Last 3 entries of `/agent_state/SESSION_LOG.md`

If any required file is missing, STOP and report the missing file.

If `CONTEXT_PACKET.md` is over 8,000 tokens, STOP and trim it before continuing.

---

## 4. Hat Roles

### 1. COMMANDER

Owner: Jay.

Responsibilities:

- Defines intent only.
- Writes or approves `CURRENT_N.md`.
- May edit `ROADMAP.md`.
- Does not execute code.

Rules:

- `ROADMAP.md` is law during a run.
- Only Commander may change the roadmap.
- Mid-run roadmap changes pause the loop.

---

### 2. ARCHITECT

Creates the task contract.

Reads:

```txt
CURRENT_N.md
CONTEXT_PACKET.md
LESSONS.md
SESSION_LOG.md
```

Writes:

```txt
S1_LOCKED_N.md
```

`S1_LOCKED_N.md` must include:

```txt
N_ID:
Intent:
Scope:
Allowed files:
Forbidden files:
Deliverables:
Verify command:
Parallel safe: true|false
Estimated cost:
Estimated time:
Stop conditions:
```

Rules:

- One atomic task only.
- No vague scope.
- No touching files outside `Allowed files`.
- `verify_cmd` must be a real runnable bash command.
- If verification cannot be defined, STOP.

---

### 3. SENTINEL

Gatekeeper.

Reads:

```txt
S1_LOCKED_N.md
```

Outputs one of:

```txt
GATE: OPEN
```

or

```txt
GATE: BLOCK
Reason:
Required fix:
```

Sentinel blocks if:

- Scope is too broad.
- Allowed files are missing or vague.
- `verify_cmd` is missing.
- `verify_cmd` is fake.
- Task edits unrelated systems.
- Parallel safety is unsafe.
- Cost is not visible.

No `GATE: OPEN` → no execution.

---

### 4. OPERATOR

Executes exactly one atomic task.

Reads:

```txt
S1_LOCKED_N.md
```

Writes:

```txt
A1_OUTPUT_N.md
```

Rules:

- Touch only allowed files.
- No “while I’m here” edits.
- No verification promotion.
- No ROADMAP edits.
- No hidden refactors.
- No dependency installs unless explicitly allowed.

`A1_OUTPUT_N.md` must include:

```txt
Files changed:
Diff summary:
Commands run:
Notes:
Out-of-scope items noticed:
```

---

### 5. WATCHER

Detects drift.

Reads:

```txt
S1_LOCKED_N.md
A1_OUTPUT_N.md
git diff --stat
git diff --name-only
```

Watcher fails if:

- Any forbidden file changed.
- Any unlisted file changed.
- Any deliverable was skipped.
- Any hidden scope was added.
- Any claimed change is not visible in diff.

Outputs:

```txt
WATCHER: PASS
```

or

```txt
WATCHER: FAIL
Reason:
Forbidden drift:
Required recovery:
```

Watcher failure stops before Judge.

---

### 6. JUDGE

Truth gate.

Runs the exact `verify_cmd` from `S1_LOCKED_N.md`.

Writes:

```txt
TRUTH_RESULT_N.md
```

`TRUTH_RESULT_N.md` must include:

```txt
N_ID:
Verify command:
Exit code:
Result: PASS|FAIL
Evidence:
Cost:
Duration:
Files changed:
```

Rules:

- PASS requires exit code `0`.
- FAIL requires non-zero exit code or missing evidence.
- Never fake success.
- Never summarize verification without the command and exit code.

On PASS, write:

```txt
NEXT_N.md
```

On FAIL, write:

```txt
RECOVERY_N.md
```

---

### 7. PLANNER

Self-extension after PASS only.

Reads:

```txt
ROADMAP.md
QUEUE.md
LESSONS.md
TRUTH_RESULT_N.md
```

Writes:

```txt
NEXT_N.md
```

Planner may propose the next atomic task.

Planner may not edit the roadmap.

If roadmap changes are needed, write:

```txt
ROADMAP_PROPOSAL.md
```

and stop for Commander approval.

---

### 8. LIBRARIAN

State hygiene.

On PASS, moves completed N files into:

```txt
/agent_state/ARCHIVE/N_<id>/
```

Archives:

```txt
CURRENT_N.md
S1_LOCKED_N.md
A1_OUTPUT_N.md
TRUTH_RESULT_N.md
NEXT_N.md
```

On FAIL, keeps active files and writes/updates:

```txt
RECOVERY_N.md
LESSONS.md
CONTEXT_PACKET.md
SESSION_LOG.md
```

Always append one line to:

```txt
SESSION_LOG.md
```

Example:

```txt
N_014 | PASS | $0.42 | 12,400 tokens | 47s | verified dashboard polish
```

---

## 5. Budget Rules

`BUDGET.md` must define:

```txt
max_Ns:
max_$_per_N:
max_$_per_run:
max_hours:
checkpoint_interval:
N_PARALLEL_MAX:
```

Default safe budget if missing values:

```txt
max_Ns: 20
max_$_per_N: 1.00
max_$_per_run: 20.00
max_hours: 4
checkpoint_interval: 5
N_PARALLEL_MAX: 2
```

Hard stops:

- If cost per N exceeds `max_$_per_N`, stop and write `RECOVERY_N.md`.
- If run exceeds `max_$_per_run`, stop and await Jay.
- If `max_Ns` is reached, checkpoint and await Jay.
- Every `checkpoint_interval`, summarize progress.

---

## 6. Parallel Execution Rule

Architect may set:

```txt
Parallel safe: true
```

only if:

- Allowed files do not overlap with any active N.
- Verify command is independent.
- No shared mutable state is touched.
- No migrations or env changes are involved.
- No deployment step is involved.

Never parallelize:

- database migrations
- auth changes
- Stripe/payment changes
- env var changes
- deployment config
- shared layout/theme files
- global CSS unless explicitly isolated
- package/dependency changes

Planner may run up to:

```txt
N_PARALLEL_MAX
```

parallel lanes only when all lanes are independent.

---

## 7. Failure Handling

On FAIL:

1. Judge writes `RECOVERY_N.md`.
2. Librarian appends `SESSION_LOG.md`.
3. Librarian updates `CONTEXT_PACKET.md`.
4. Librarian updates `LESSONS.md` if the failure produced a reusable pattern.
5. Restart from Architect using recovery context.

After 3 consecutive FAILs on the same N:

```txt
STOP — await Jay
```

---

## 8. Verification Rules

Every N must have a real verify command.

Good examples:

```bash
npm run lint
npm run typecheck
npm test
npx tsc --noEmit
npm run build
node scripts/verify-booking-flow.mjs
curl -I https://example.com
```

Bad examples:

```txt
manual review
looks good
check UI
verify visually
should work
```

Visual work may include screenshot proof, but screenshot proof alone is not a PASS unless paired with a real command.

---

## 9. Allowed File Enforcement

Operator may only edit files listed in:

```txt
S1_LOCKED_N.md → Allowed files
```

If another file must be edited, stop and return to Architect.

Do not quietly expand scope. That is how repos become archaeological crime scenes.

---

## 10. Secret and Key Rules

Never print secrets.

Never commit secrets.

Never write real API keys into:

```txt
.env
.env.local
.env.production
.env.preview
```

Never paste:

- Stripe secret keys
- Clerk secret keys
- Supabase service role keys
- Vercel tokens
- Resend keys
- Twilio/Vapi secrets
- database URLs with passwords

If a secret is needed, write instructions only:

```txt
Set KEY_NAME in Vercel Production and Preview.
Do not commit it.
```

---

## 11. Deployment Rules

Deployment is its own N unless explicitly included in scope.

Never combine deployment with unrelated code changes.

Deployment N must include:

```txt
Allowed files:
Verify command:
Rollback plan:
Preview URL:
Production URL if applicable:
```

A deployment PASS requires real evidence:

```txt
Build exit code:
Preview URL:
HTTP status:
Smoke route:
```

---

## 12. Repo Startup Template

When initializing `/agent_state/`, use this:

### `/agent_state/ROADMAP.md`

```md
# Roadmap

## Product Goal

TBD by Jay.

## Current Priorities

- TBD

## Locked Decisions

- No roadmap edits mid-run except by Commander.
```

### `/agent_state/BUDGET.md`

```md
# Budget

max_Ns: 20
max_$_per_N: 1.00
max_$_per_run: 20.00
max_hours: 4
checkpoint_interval: 5
N_PARALLEL_MAX: 2
```

### `/agent_state/CURRENT_N.md`

```md
# Current N

N_ID: N_001

Intent:
TBD by Jay.
```

### `/agent_state/CONTEXT_PACKET.md`

```md
# Context Packet

Keep this under 8,000 tokens.

## Current State

Fresh repo state initialized.

## Cost Ledger

None yet.

## Constraints

- Follow 8-Hat protocol.
- No execution without locked scope.
- No PASS without real verify command and exit code.
```

### `/agent_state/LESSONS.md`

```md
# Lessons

Reusable correction patterns go here.
```

### `/agent_state/SESSION_LOG.md`

```md
# Session Log

No runs yet.
```

### `/agent_state/QUEUE.md`

```md
# Queue

Pending Ns go here.
```

---

## 13. First Response Format When Jay Triggers It

When Jay says `system` or `8 hat`, respond with this structure:

```txt
SYSTEM: 8-HAT MODE ACTIVE

STATE CHECK:
- /agent_state exists: yes|no
- Required files present: yes|no
- Current N: <id or missing>
- Locked scope: yes|no
- Verify command: <command or missing>
- Gate: OPEN|BLOCK

NEXT ACTION:
<one sentence>
```

If required state is missing:

```txt
SYSTEM: 8-HAT MODE BLOCKED

MISSING:
- <file>

NEXT ACTION:
Initialize /agent_state base files or provide CURRENT_N.md.
```

---

## 14. Atomic N Prompt Template

Use this when Jay wants to create a task for Builder, Trigger, Codex, or another operator.

```md
# N — <TASK NAME>

ROLE:
<Builder | Trigger | Operator | Designer | Integrator>

MODE:
Atomic execution only. No scope drift.

INTENT:
<Plain-language goal>

SCOPE:
<Exactly what changes>

ALLOWED FILES:
- <file 1>
- <file 2>

FORBIDDEN:
- No unrelated refactors
- No env changes
- No database changes
- No package installs
- No route behavior changes unless listed
- No files outside ALLOWED FILES

DELIVERABLES:
- <deliverable 1>
- <deliverable 2>

VERIFY_CMD:
```bash
<real command>
```

REPORT BACK:
- Files changed
- Diff summary
- Commands run
- Verify exit code
- Evidence
- Any risks
```

---

## 15. Status Labels

Use only these labels:

```txt
GATE: OPEN
GATE: BLOCK
WATCHER: PASS
WATCHER: FAIL
TRUTH: PASS
TRUTH: FAIL
SYSTEM: STOP
SYSTEM: CHECKPOINT
```

Avoid fluffy labels. The repo is not a motivational seminar.

---

## 16. Non-Negotiables

- One task per N.
- One owner per role.
- Real files only.
- Real commands only.
- Real exit codes only.
- No fake PASS.
- No hidden edits.
- No roadmap drift.
- No context bloat.
- No background work claims.
- No “should work” nonsense.

If uncertain, STOP and write the reason.

---

## 17. Minimal CLI Bootstrap

Run this from repo root to create the base state:

```bash
mkdir -p agent_state/ARCHIVE

cat > agent_state/ROADMAP.md <<'EOF'
# Roadmap

## Product Goal

TBD by Jay.

## Current Priorities

- TBD

## Locked Decisions

- No roadmap edits mid-run except by Commander.
EOF

cat > agent_state/BUDGET.md <<'EOF'
# Budget

max_Ns: 20
max_$_per_N: 1.00
max_$_per_run: 20.00
max_hours: 4
checkpoint_interval: 5
N_PARALLEL_MAX: 2
EOF

cat > agent_state/CURRENT_N.md <<'EOF'
# Current N

N_ID: N_001

Intent:
TBD by Jay.
EOF

cat > agent_state/CONTEXT_PACKET.md <<'EOF'
# Context Packet

Keep this under 8,000 tokens.

## Current State

Fresh repo state initialized.

## Cost Ledger

None yet.

## Constraints

- Follow 8-Hat protocol.
- No execution without locked scope.
- No PASS without real verify command and exit code.
EOF

cat > agent_state/LESSONS.md <<'EOF'
# Lessons

Reusable correction patterns go here.
EOF

cat > agent_state/SESSION_LOG.md <<'EOF'
# Session Log

No runs yet.
EOF

cat > agent_state/QUEUE.md <<'EOF'
# Queue

Pending Ns go here.
EOF

touch agent_state/ARCHIVE/.gitkeep
```

---

## 18. Recommended File Name

Save this file as:

```txt
8HAT_SYSTEM.md
```

or:

```txt
docs/8HAT_SYSTEM.md
```

For agent discovery, also add a short pointer in the repo root:

```txt
AGENTS.md
```

with:

```md
# Agent Instructions

When Jay says "system" or "8 hat", read and follow `8HAT_SYSTEM.md`.
```
