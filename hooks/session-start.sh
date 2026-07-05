#!/usr/bin/env bash
# SessionStart hook for my-claude-rules plugin
# Injects always-on safety/discipline rules into every session.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLUGIN_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

rules_content=$(cat "${PLUGIN_ROOT}/hooks/always-on-rules.md" 2>&1 || echo "Error reading always-on-rules.md")

escape_for_json() {
    local s="$1"
    s="${s//\\/\\\\}"
    s="${s//\"/\\\"}"
    s="${s//$'\n'/\\n}"
    s="${s//$'\r'/\\r}"
    s="${s//$'\t'/\\t}"
    printf '%s' "$s"
}

rules_escaped=$(escape_for_json "$rules_content")
session_context="<IMPORTANT>\nmy-claude-rules: always-on safety & discipline rules for this session.\n\n${rules_escaped}\n</IMPORTANT>"

# Claude Code reads hookSpecificOutput.additionalContext for SessionStart hooks.
if [ -n "${CLAUDE_PLUGIN_ROOT:-}" ]; then
  printf '{\n  "hookSpecificOutput": {\n    "hookEventName": "SessionStart",\n    "additionalContext": "%s"\n  }\n}\n' "$session_context" | cat
else
  printf '{\n  "additionalContext": "%s"\n}\n' "$session_context" | cat
fi

exit 0
