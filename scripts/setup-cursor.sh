#!/usr/bin/env bash
set -euo pipefail

# Install shared Cursor config into a target project.
#
# Usage:
#   ./scripts/setup-cursor.sh [options]
#
# Options:
#   --local              Use this repo on disk (no git clone). Default when run from cloned repo.
#   --repo <url>         Clone config from Git URL (e.g. https://github.com/thitiwut00897/my-cursor-rules.git)
#   --project <path>     Target project directory (default: current directory)
#   --overwrite          Replace .cursor without backup
#   --copy-script        Copy setup + generate scripts into <project>/scripts/
#   --skip-docs          Do not generate docs/codebase-docs (only .cursor)
#   --regenerate-docs    Force regenerate HTML/MD docs (passes --force to generator)
#   -h, --help           Show help

REPO_URL_DEFAULT="https://github.com/thitiwut00897/my-cursor-rules.git"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

REPO_URL=""
USE_LOCAL="0"
PROJECT_PATH="$(pwd)"
OVERWRITE="0"
COPY_SCRIPT="0"
SKIP_DOCS="0"
REGENERATE_DOCS="0"

usage() {
  sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'
  cat <<'EOF'

Examples:
  # From cloned my-cursor-rules repo — install into current project:
  cd /path/to/your-project
  bash /path/to/my-cursor-rules/scripts/setup-cursor.sh --local

  # Clone from GitHub and install:
  bash scripts/setup-cursor.sh --repo https://github.com/thitiwut00897/my-cursor-rules.git --project /path/to/your-project

  # Also leave setup script inside the target project:
  bash scripts/setup-cursor.sh --local --copy-script --project .
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --local) USE_LOCAL="1"; shift ;;
    --repo) REPO_URL="${2:-}"; shift 2 ;;
    --project) PROJECT_PATH="${2:-}"; shift 2 ;;
    --overwrite) OVERWRITE="1"; shift ;;
    --copy-script) COPY_SCRIPT="1"; shift ;;
    --skip-docs) SKIP_DOCS="1"; shift ;;
    --regenerate-docs) REGENERATE_DOCS="1"; shift ;;
    -h|--help) usage; exit 0 ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      exit 2
      ;;
  esac
done

if [[ -z "$REPO_URL" && "$USE_LOCAL" != "1" ]]; then
  # Auto --local when script lives inside a config repo
  if [[ -d "$CONFIG_REPO_ROOT/rules" || -d "$CONFIG_REPO_ROOT/.cursor/rules" ]]; then
    USE_LOCAL="1"
  fi
fi

if [[ "$USE_LOCAL" != "1" && -z "$REPO_URL" ]]; then
  REPO_URL="$REPO_URL_DEFAULT"
fi

if [[ ! -d "$PROJECT_PATH" ]]; then
  echo "ERROR: Project path not found: $PROJECT_PATH" >&2
  exit 2
fi

PROJECT_PATH="$(cd "$PROJECT_PATH" && pwd)"

TMP_DIR=""
SOURCE_ROOT=""

cleanup() {
  [[ -n "$TMP_DIR" && -d "$TMP_DIR" ]] && rm -rf "$TMP_DIR"
}
trap cleanup EXIT

if [[ "$USE_LOCAL" == "1" ]]; then
  SOURCE_ROOT="$CONFIG_REPO_ROOT"
  echo "Using local config repo: $SOURCE_ROOT"
else
  TMP_DIR="$(mktemp -d)"
  echo "Cloning config repo..."
  git clone --depth 1 "$REPO_URL" "$TMP_DIR/repo" >/dev/null
  SOURCE_ROOT="$TMP_DIR/repo"
fi

# Build staged .cursor in TMP if source is flat layout at repo root
STAGE_CURSOR=""
if [[ -d "$SOURCE_ROOT/.cursor/rules" && -d "$SOURCE_ROOT/.cursor/skills" ]]; then
  STAGE_CURSOR="$SOURCE_ROOT/.cursor"
elif [[ -d "$SOURCE_ROOT/rules" && -d "$SOURCE_ROOT/skills" ]]; then
  STAGE_CURSOR="${TMP_DIR:-$(mktemp -d)}/staged-cursor"
  if [[ -z "$TMP_DIR" ]]; then
    TMP_DIR="$(dirname "$STAGE_CURSOR")"
  fi
  mkdir -p "$STAGE_CURSOR"
  cp -R "$SOURCE_ROOT/rules" "$STAGE_CURSOR/"
  cp -R "$SOURCE_ROOT/skills" "$STAGE_CURSOR/"
  [[ -d "$SOURCE_ROOT/agents" ]] && cp -R "$SOURCE_ROOT/agents" "$STAGE_CURSOR/"
  [[ -f "$SOURCE_ROOT/cursor.md" ]] && cp "$SOURCE_ROOT/cursor.md" "$STAGE_CURSOR/"
  if [[ -f "$SOURCE_ROOT/.cursorrules" ]]; then
    cp "$SOURCE_ROOT/.cursorrules" "$STAGE_CURSOR/"
  elif [[ -f "$SOURCE_ROOT/.cursor/.cursorrules" ]]; then
    cp "$SOURCE_ROOT/.cursor/.cursorrules" "$STAGE_CURSOR/"
  fi
  echo "Assembled .cursor from repo root (rules/, skills/, agents/)"
else
  echo "ERROR: Cannot find rules/ + skills/ or .cursor/ in config repo." >&2
  exit 2
fi

TARGET_CURSOR="$PROJECT_PATH/.cursor"

if [[ -e "$TARGET_CURSOR" ]]; then
  if [[ "$OVERWRITE" == "1" ]]; then
    echo "Removing existing .cursor (--overwrite)"
    rm -rf "$TARGET_CURSOR"
  else
    TS="$(date +%Y%m%d_%H%M%S)"
    BACKUP="$PROJECT_PATH/.cursor.backup.$TS"
    echo "Backing up existing .cursor -> $(basename "$BACKUP")"
    mv "$TARGET_CURSOR" "$BACKUP"
  fi
fi

echo "Installing .cursor/ -> $TARGET_CURSOR"
mkdir -p "$TARGET_CURSOR"

if command -v rsync >/dev/null 2>&1; then
  rsync -a --exclude '.DS_Store' "$STAGE_CURSOR/" "$TARGET_CURSOR/"
else
  cp -R "$STAGE_CURSOR/." "$TARGET_CURSOR/"
  find "$TARGET_CURSOR" -name '.DS_Store' -delete 2>/dev/null || true
fi

# --- docs folders referenced by rules ---
echo "Setting up docs/..."
mkdir -p "$PROJECT_PATH/docs/work-summary"
mkdir -p "$PROJECT_PATH/docs/codebase-docs"
touch "$PROJECT_PATH/docs/work-summary/.gitkeep"

if [[ "$SKIP_DOCS" != "1" ]]; then
  GEN_SCRIPT="$SCRIPT_DIR/generate-codebase-docs.mjs"
  if [[ -f "$GEN_SCRIPT" ]] && command -v node >/dev/null 2>&1; then
    GEN_ARGS=("$GEN_SCRIPT" "$PROJECT_PATH")
    [[ "$REGENERATE_DOCS" == "1" ]] && GEN_ARGS+=("--force")
    echo "Scanning project and generating docs/codebase-docs (HTML + Markdown)..."
    node "${GEN_ARGS[@]}"
  else
    echo "WARN: node or generate-codebase-docs.mjs not found — falling back to minimal templates"
    DOCS_TEMPLATES="$SOURCE_ROOT/docs-templates"
    if [[ -d "$DOCS_TEMPLATES" ]]; then
      for f in "$DOCS_TEMPLATES"/*.md; do
        [[ -f "$f" ]] || continue
        base="$(basename "$f")"
        dest="$PROJECT_PATH/docs/codebase-docs/$base"
        [[ -f "$dest" ]] || cp "$f" "$dest"
      done
      [[ -f "$DOCS_TEMPLATES/styles.css" ]] && cp "$DOCS_TEMPLATES/styles.css" "$PROJECT_PATH/docs/codebase-docs/styles.css"
    fi
    touch "$PROJECT_PATH/docs/codebase-docs/.gitkeep"
  fi
else
  echo "Skipped docs generation (--skip-docs)"
fi

# --- optional: copy setup script into target project ---
if [[ "$COPY_SCRIPT" == "1" ]]; then
  TARGET_SCRIPT_DIR="$PROJECT_PATH/scripts"
  mkdir -p "$TARGET_SCRIPT_DIR"
  cp "$SCRIPT_DIR/setup-cursor.sh" "$TARGET_SCRIPT_DIR/setup-cursor.sh"
  chmod +x "$TARGET_SCRIPT_DIR/setup-cursor.sh"
  [[ -f "$SCRIPT_DIR/generate-codebase-docs.mjs" ]] && cp "$SCRIPT_DIR/generate-codebase-docs.mjs" "$TARGET_SCRIPT_DIR/"
  echo "Copied scripts -> $TARGET_SCRIPT_DIR/"
fi

echo ""
echo "Done."
echo "  Project: $PROJECT_PATH"
RULE_COUNT="$(find "$TARGET_CURSOR/rules" -name '*.mdc' 2>/dev/null | wc -l | tr -d ' \n' || true)"
RULE_COUNT="${RULE_COUNT:-0}"
echo "  Installed: .cursor/ ($RULE_COUNT rules)"
echo ""
echo "Next steps:"
echo "  1. Open project in Cursor"
echo "  2. Cursor Settings -> Rules, Commands — confirm Project Rules are listed"
echo "  3. Open docs/codebase-docs/index.html — review auto-generated feature docs"
echo "  4. Edit project-blueprint.md + features/*.md for business details"
echo "  5. (Optional) Configure MCP: SonarQube, Postman, Jira in Cursor Settings -> MCP"

exit 0
