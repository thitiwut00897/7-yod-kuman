#!/usr/bin/env bash
set -euo pipefail

# Install shared Cursor config into a target project.
# Works without cloning repo to disk permanently (downloads zip or shallow git clone).

REPO_URL_DEFAULT="https://github.com/thitiwut00897/my-cursor-rules.git"
REPO_BRANCH_DEFAULT="main"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" 2>/dev/null && pwd)" || SCRIPT_DIR=""
CONFIG_REPO_ROOT=""
if [[ -n "$SCRIPT_DIR" && "$SCRIPT_DIR" != "/dev/fd" ]]; then
  CONFIG_REPO_ROOT="$(cd "$SCRIPT_DIR/.." 2>/dev/null && pwd)" || CONFIG_REPO_ROOT=""
fi

REPO_URL=""
REPO_BRANCH="$REPO_BRANCH_DEFAULT"
USE_LOCAL="0"
PROJECT_PATH="$(pwd)"
OVERWRITE="0"
COPY_SCRIPT="0"
SKIP_DOCS="0"
REGENERATE_DOCS="0"
MODE=""

usage() {
  cat <<'EOF'
Usage:
  setup-cursor.sh [--create | --update] [options]

Modes (shorthand):
  --create    Install .cursor + regenerate docs/codebase-docs (full setup)
  --update    Install .cursor only (skip docs)

Options:
  --local              Use config repo on disk (folder that contains scripts/)
  --repo <url>         Download from GitHub (zip or git clone)
  --branch <name>      Branch for zip/clone (default: main)
  --project <path>     Target project (default: current directory)
  --overwrite          Replace existing .cursor without backup
  --copy-script        Copy setup scripts into <project>/scripts/
  --skip-docs          Do not generate docs/codebase-docs
  --regenerate-docs    Force regenerate docs
  -h, --help

Environment:
  GITHUB_TOKEN         Required if repo is private (zip download)

Examples:
  # Create (full) — run inside target project:
  curl -fsSL https://raw.githubusercontent.com/thitiwut00897/my-cursor-rules/main/scripts/setup-cursor.sh | bash -s -- --create --project .

  # Update (.cursor only):
  curl -fsSL .../setup-cursor.sh | bash -s -- --update --project .

  # Local (after one-time clone of my-cursor-rules):
  bash ~/Github-Work/my-cursor-rules/scripts/setup-cursor.sh --local --create --project .
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --create) MODE="create"; shift ;;
    --update) MODE="update"; shift ;;
    --local) USE_LOCAL="1"; shift ;;
    --repo) REPO_URL="${2:-}"; shift 2 ;;
    --branch) REPO_BRANCH="${2:-}"; shift 2 ;;
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

# Apply mode presets
if [[ "$MODE" == "create" ]]; then
  OVERWRITE="1"
  REGENERATE_DOCS="1"
  SKIP_DOCS="0"
elif [[ "$MODE" == "update" ]]; then
  OVERWRITE="1"
  SKIP_DOCS="1"
  REGENERATE_DOCS="0"
fi

if [[ -z "$REPO_URL" && "$USE_LOCAL" != "1" ]]; then
  if [[ -n "$CONFIG_REPO_ROOT" ]] && { [[ -d "$CONFIG_REPO_ROOT/rules" ]] || [[ -d "$CONFIG_REPO_ROOT/.cursor/rules" ]]; }; then
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

parse_github_slug() {
  # https://github.com/owner/repo.git -> owner/repo
  local url="$1"
  url="${url%.git}"
  url="${url#https://github.com/}"
  url="${url#http://github.com/}"
  url="${url#git@github.com:}"
  echo "$url"
}

download_repo_zip() {
  local slug="$1"
  local branch="$2"
  local dest="$3"
  local zip_url="https://github.com/${slug}/archive/refs/heads/${branch}.zip"
  local zip_file="$dest/repo.zip"
  local curl_args=(-fsSL -L)

  if [[ -n "${GITHUB_TOKEN:-}" ]]; then
    curl_args+=(-H "Authorization: Bearer ${GITHUB_TOKEN}")
  fi

  echo "Downloading ${slug}@${branch} (zip)..."
  if ! curl "${curl_args[@]}" -o "$zip_file" "$zip_url"; then
    echo "ERROR: Cannot download zip. If repo is private, set GITHUB_TOKEN." >&2
    echo "  URL tried: $zip_url" >&2
    return 1
  fi

  if ! command -v unzip >/dev/null 2>&1; then
    echo "ERROR: unzip not found. Install unzip or use git clone." >&2
    return 1
  fi

  unzip -q "$zip_file" -d "$dest"
  local extracted
  extracted="$(find "$dest" -maxdepth 1 -type d -name '*-main' -o -name '*-master' 2>/dev/null | head -1)"
  if [[ -z "$extracted" ]]; then
    extracted="$(find "$dest" -maxdepth 1 -mindepth 1 -type d 2>/dev/null | head -1)"
  fi
  if [[ -z "$extracted" || ! -d "$extracted" ]]; then
    echo "ERROR: Failed to extract zip." >&2
    return 1
  fi
  echo "$extracted"
}

fetch_remote_repo() {
  local slug dest extracted
  slug="$(parse_github_slug "$REPO_URL")"
  dest="$TMP_DIR"
  mkdir -p "$dest"

  if command -v git >/dev/null 2>&1; then
    echo "Cloning ${REPO_URL} (depth 1)..."
    if git clone --depth 1 --branch "$REPO_BRANCH" "$REPO_URL" "$dest/repo" 2>/dev/null; then
      echo "$dest/repo"
      return 0
    fi
    echo "git clone failed, trying zip download..."
  fi

  extracted="$(download_repo_zip "$slug" "$REPO_BRANCH" "$dest")"
  echo "$extracted"
}

if [[ "$USE_LOCAL" == "1" ]]; then
  SOURCE_ROOT="$CONFIG_REPO_ROOT"
  echo "Using local config repo: $SOURCE_ROOT"
else
  TMP_DIR="$(mktemp -d)"
  SOURCE_ROOT="$(fetch_remote_repo)"
fi

# Build staged .cursor
STAGE_CURSOR=""
if [[ -d "$SOURCE_ROOT/.cursor/rules" && -d "$SOURCE_ROOT/.cursor/skills" ]]; then
  STAGE_CURSOR="$SOURCE_ROOT/.cursor"
elif [[ -d "$SOURCE_ROOT/rules" && -d "$SOURCE_ROOT/skills" ]]; then
  STAGE_CURSOR="${TMP_DIR:-$(mktemp -d)}/staged-cursor"
  [[ -z "$TMP_DIR" ]] && TMP_DIR="$(dirname "$STAGE_CURSOR")"
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
  echo "Assembled .cursor from repo root"
else
  echo "ERROR: Downloaded repo missing .cursor/ or rules/+skills/." >&2
  echo "  Check repo URL, branch, and GITHUB_TOKEN (if private)." >&2
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

echo "Setting up docs/..."
mkdir -p "$PROJECT_PATH/docs/work-summary"
mkdir -p "$PROJECT_PATH/docs/codebase-docs"
touch "$PROJECT_PATH/docs/work-summary/.gitkeep"

if [[ "$SKIP_DOCS" != "1" ]]; then
  GEN_SCRIPT="$SOURCE_ROOT/scripts/generate-codebase-docs.mjs"
  if [[ -f "$GEN_SCRIPT" ]] && command -v node >/dev/null 2>&1; then
    GEN_ARGS=("$GEN_SCRIPT" "$PROJECT_PATH")
    [[ "$REGENERATE_DOCS" == "1" ]] && GEN_ARGS+=("--force")
    echo "Scanning project and generating docs/codebase-docs..."
    node "${GEN_ARGS[@]}"
  else
    echo "WARN: node or $GEN_SCRIPT not found — minimal docs templates only"
    DOCS_TEMPLATES="$SOURCE_ROOT/docs-templates"
    if [[ -d "$DOCS_TEMPLATES" ]]; then
      for f in "$DOCS_TEMPLATES"/*.md; do
        [[ -f "$f" ]] || continue
        dest="$PROJECT_PATH/docs/codebase-docs/$(basename "$f")"
        [[ -f "$dest" ]] || cp "$f" "$dest"
      done
      [[ -f "$DOCS_TEMPLATES/styles.css" ]] && cp "$DOCS_TEMPLATES/styles.css" "$PROJECT_PATH/docs/codebase-docs/styles.css"
    fi
  fi
else
  echo "Skipped docs (--skip-docs / --update)"
fi

if [[ "$COPY_SCRIPT" == "1" ]]; then
  TARGET_SCRIPT_DIR="$PROJECT_PATH/scripts"
  mkdir -p "$TARGET_SCRIPT_DIR"
  SRC_SETUP="$SOURCE_ROOT/scripts/setup-cursor.sh"
  [[ -f "$SRC_SETUP" ]] && cp "$SRC_SETUP" "$TARGET_SCRIPT_DIR/setup-cursor.sh" && chmod +x "$TARGET_SCRIPT_DIR/setup-cursor.sh"
  [[ -f "$SOURCE_ROOT/scripts/generate-codebase-docs.mjs" ]] && cp "$SOURCE_ROOT/scripts/generate-codebase-docs.mjs" "$TARGET_SCRIPT_DIR/"
  echo "Copied scripts -> $TARGET_SCRIPT_DIR/"
fi

RULE_COUNT="$(find "$TARGET_CURSOR/rules" -name '*.mdc' 2>/dev/null | wc -l | tr -d ' \n' || true)"
RULE_COUNT="${RULE_COUNT:-0}"

echo ""
echo "Done."
echo "  Project: $PROJECT_PATH"
echo "  Installed: .cursor/ ($RULE_COUNT rules)"
echo "  Docs: $([ "$SKIP_DOCS" == "1" ] && echo skipped || echo generated)"
exit 0
