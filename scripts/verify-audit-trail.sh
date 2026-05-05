#!/usr/bin/env bash
# verify-audit-trail.sh — N=013 Watcher-phase guard.
#
# Asserts that the active cycle's mandatory state files are committed to
# the current branch's git history (not just present in the working
# tree). Designed to fail fast and loud when an Operator forgets to
# stage a state file before closing the cycle.
#
# Usage:
#   bash scripts/verify-audit-trail.sh           # autodetect highest CURRENT_NNN.md
#   bash scripts/verify-audit-trail.sh 013       # explicit cycle number
#
# Exits 0 on success, non-zero on any failed assertion.
# No writes. No network. No npm. Idempotent.

set -uo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"
if [ -z "$ROOT" ]; then
  echo "verify-audit-trail: not inside a git repository" >&2
  exit 2
fi
cd "$ROOT"

STATE_DIR="agent_state"

# --- 1. Determine active cycle number ---------------------------------

if [ "$#" -ge 1 ]; then
  CYCLE="$1"
  if ! [[ "$CYCLE" =~ ^[0-9]{3}$ ]]; then
    echo "verify-audit-trail: cycle must be a 3-digit zero-padded number, got '$CYCLE'" >&2
    exit 2
  fi
else
  # Highest N from agent_state/CURRENT_NNN.md (excluding CURRENT_N.md, the bootstrap file).
  CYCLE="$(
    find "$STATE_DIR" -maxdepth 1 -type f -name 'CURRENT_[0-9][0-9][0-9].md' \
      -printf '%f\n' 2>/dev/null \
      | sed -E 's/^CURRENT_([0-9]{3})\.md$/\1/' \
      | sort -n \
      | tail -n 1
  )"
  if [ -z "$CYCLE" ]; then
    echo "verify-audit-trail: no agent_state/CURRENT_NNN.md found — cannot autodetect cycle" >&2
    exit 2
  fi
fi

CURRENT_FILE="$STATE_DIR/CURRENT_${CYCLE}.md"
LOCKED_FILE="$STATE_DIR/S1_LOCKED_${CYCLE}.md"
OUTPUT_FILE="$STATE_DIR/A1_OUTPUT_${CYCLE}.md"

# --- 2. Helper assertions ---------------------------------------------

fail() {
  echo "verify-audit-trail [N=$CYCLE]: FAIL — $1" >&2
  exit 1
}

assert_exists() {
  local f="$1"
  if [ ! -f "$f" ]; then
    fail "$f does not exist in the working tree"
  fi
}

assert_tracked() {
  local f="$1"
  if ! git ls-files --error-unmatch -- "$f" >/dev/null 2>&1; then
    fail "$f is not tracked by git (untracked or never staged)"
  fi
}

# Returns 0 if the file has at least one commit on the current branch.
assert_committed_on_branch() {
  local f="$1"
  local n
  n="$(git log --oneline HEAD -- "$f" 2>/dev/null | wc -l | tr -d '[:space:]')"
  if [ "$n" -eq 0 ]; then
    fail "$f exists but has no commit on the current branch (lost from history?)"
  fi
}

# Returns 0 if file is committed (in HEAD) AND working-tree clean against HEAD.
assert_no_drift_against_head() {
  local f="$1"
  if [ -n "$(git diff HEAD -- "$f" 2>/dev/null)" ]; then
    fail "$f has uncommitted modifications relative to HEAD (lock file must not drift)"
  fi
}

# A1_OUTPUT may be staged-but-not-yet-committed in the moment when the
# Operator runs the script before the final manifest commit lands.
# Accept either committed-on-branch OR staged-for-the-next-commit.
assert_committed_or_staged() {
  local f="$1"
  local n
  n="$(git log --oneline HEAD -- "$f" 2>/dev/null | wc -l | tr -d '[:space:]')"
  if [ "$n" -gt 0 ]; then return 0; fi
  if git diff --cached --name-only -- "$f" 2>/dev/null | grep -qx "$f"; then
    return 0
  fi
  fail "$f is neither committed on the current branch nor staged for commit"
}

# --- 3. Run the assertions --------------------------------------------

assert_exists "$CURRENT_FILE"
assert_tracked "$CURRENT_FILE"
assert_committed_on_branch "$CURRENT_FILE"
assert_no_drift_against_head "$CURRENT_FILE"

assert_exists "$LOCKED_FILE"
assert_tracked "$LOCKED_FILE"
assert_committed_on_branch "$LOCKED_FILE"
assert_no_drift_against_head "$LOCKED_FILE"

# A1_OUTPUT_NNN.md is conventionally the last operator commit; the
# script is run as part of the Watcher phase which can fire either
# AFTER the manifest commit (preferred) or while the manifest is staged.
if [ -f "$OUTPUT_FILE" ]; then
  assert_tracked "$OUTPUT_FILE"
  assert_committed_or_staged "$OUTPUT_FILE"
else
  fail "$OUTPUT_FILE does not exist — Operator manifest is missing"
fi

echo "verify-audit-trail [N=$CYCLE]: OK — CURRENT, S1_LOCKED, A1_OUTPUT all committed (or A1_OUTPUT staged)"
exit 0
