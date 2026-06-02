#!/usr/bin/env bash
# setup-cursor.sh — ติดตั้ง .cursor + docs จาก my-cursor-rules
# ใช้ได้กับ: curl ... | bash -s -- --create --project .

set -e

REPO_URL="https://github.com/thitiwut00897/my-cursor-rules.git"
REPO_BRANCH="main"
REPO_SLUG="thitiwut00897/my-cursor-rules"
ZIP_FOLDER="my-cursor-rules-main"

PROJECT="."
MODE=""
USE_LOCAL=""
LOCAL_REPO=""
SKIP_DOCS=""
FORCE_DOCS=""
OVERWRITE=""

log() { printf '%s\n' "$*" >&2; }
die() { log "ERROR: $*"; exit 1; }

usage() {
  cat >&2 <<'EOF'
Usage:
  setup-cursor.sh --create --project <path>
  setup-cursor.sh --update --project <path>
  setup-cursor.sh --local [--create|--update] --project <path>

  --create   ติดตั้ง .cursor + สร้าง docs/codebase-docs ใหม่
  --update   ติดตั้ง .cursor อย่างเดียว (ไม่แตะ docs)
  --local    ใช้ repo บนเครื่อง (โฟลเดอร์ที่ clone my-cursor-rules ไว้)
  --project  path โปรเจกต์ปลายทาง (default: .)
EOF
}

while [ $# -gt 0 ]; do
  case "$1" in
    --create) MODE="create"; OVERWRITE="1"; FORCE_DOCS="1"; shift ;;
    --update) MODE="update"; OVERWRITE="1"; SKIP_DOCS="1"; shift ;;
    --local)  USE_LOCAL="1"; shift ;;
    --project) PROJECT="${2:-}"; shift 2 ;;
    --overwrite) OVERWRITE="1"; shift ;;
    --skip-docs) SKIP_DOCS="1"; shift ;;
    --regenerate-docs) FORCE_DOCS="1"; shift ;;
    -h|--help) usage; exit 0 ;;
    --) shift; break ;;
    -*)
      # ถ้า --local แล้วตามด้วย path ที่ไม่ใช่ flag
      if [ -n "$USE_LOCAL" ] && [ -z "$LOCAL_REPO" ] && [ "${1#-}" = "$1" ]; then
        LOCAL_REPO="$1"; shift
      else
        die "Unknown option: $1"
      fi
      ;;
    *)
      if [ -n "$USE_LOCAL" ] && [ -z "$LOCAL_REPO" ]; then
        LOCAL_REPO="$1"; shift
      else
        die "Unknown argument: $1"
      fi
      ;;
  esac
done

[ -n "$MODE" ] || die "ระบุ --create หรือ --update"

[ -d "$PROJECT" ] || die "ไม่พบโปรเจกต์: $PROJECT"
PROJECT="$(cd "$PROJECT" && pwd)"

# --- ดึง config repo ---
SRC=""

if [ -n "$USE_LOCAL" ]; then
  if [ -z "$LOCAL_REPO" ]; then
    # ถ้ารันจากไฟล์: scripts/setup-cursor.sh → parent = repo root
    _dir="$(dirname "$0")"
    if [ -f "$_dir/setup-cursor.sh" ] && [ "$_dir" != "." ] && [ "$_dir" != "bash" ]; then
      LOCAL_REPO="$(cd "$_dir/.." && pwd)"
    fi
  fi
  [ -n "$LOCAL_REPO" ] && [ -d "$LOCAL_REPO" ] || die "ใช้ --local ต้องระบุ path repo หรือรันจากไฟล์ใน my-cursor-rules/scripts/"
  SRC="$LOCAL_REPO"
  log "ใช้ local repo: $SRC"
else
  WORK="$(mktemp -d)"
  trap 'rm -rf "$WORK"' EXIT

  if command -v git >/dev/null 2>&1; then
    log "git clone $REPO_URL ..."
    if git clone --depth 1 --branch "$REPO_BRANCH" "$REPO_URL" "$WORK/repo" 2>&1; then
      SRC="$WORK/repo"
    fi
  fi

  if [ -z "$SRC" ]; then
    log "git ไม่ได้ → ดาวน์โหลด zip ..."
    ZIP_URL="https://github.com/${REPO_SLUG}/archive/refs/heads/${REPO_BRANCH}.zip"
    if [ -n "${GITHUB_TOKEN:-}" ]; then
      curl -fsSL -L -H "Authorization: Bearer ${GITHUB_TOKEN}" -o "$WORK/z.zip" "$ZIP_URL" \
        || die "ดาวน์โหลด zip ไม่ได้"
    else
      curl -fsSL -L -o "$WORK/z.zip" "$ZIP_URL" \
        || die "ดาวน์โหลด zip ไม่ได้ (repo private? ใส่ GITHUB_TOKEN)"
    fi
    command -v unzip >/dev/null 2>&1 || die "ไม่มี unzip — ติดตั้ง unzip หรือ git"
    unzip -q "$WORK/z.zip" -d "$WORK"
    SRC="$WORK/$ZIP_FOLDER"
    [ -d "$SRC" ] || die "แตก zip แล้วไม่พบ $ZIP_FOLDER (ได้: $(ls "$WORK"))"
  fi
fi

log "แหล่ง config: $SRC"

# --- หา .cursor source ---
CURSOR_SRC=""
if [ -d "$SRC/.cursor/rules" ] && [ -d "$SRC/.cursor/skills" ]; then
  CURSOR_SRC="$SRC/.cursor"
elif [ -d "$SRC/rules" ] && [ -d "$SRC/skills" ]; then
  CURSOR_SRC="$(mktemp -d)/.cursor"
  mkdir -p "$CURSOR_SRC"
  cp -R "$SRC/rules" "$CURSOR_SRC/"
  cp -R "$SRC/skills" "$CURSOR_SRC/"
  [ -d "$SRC/agents" ] && cp -R "$SRC/agents" "$CURSOR_SRC/"
  [ -f "$SRC/cursor.md" ] && cp "$SRC/cursor.md" "$CURSOR_SRC/"
  if [ -f "$SRC/.cursor/.cursorrules" ]; then
    cp "$SRC/.cursor/.cursorrules" "$CURSOR_SRC/"
  elif [ -f "$SRC/.cursorrules" ]; then
    cp "$SRC/.cursorrules" "$CURSOR_SRC/"
  fi
  log "ประกอบ .cursor จาก rules/ + skills/ ที่ root"
else
  die "repo ไม่มี .cursor/ หรือ rules/+skills/ — ตรวจ $SRC"
fi

# --- ติดตั้ง .cursor ---
TARGET="$PROJECT/.cursor"
if [ -e "$TARGET" ]; then
  if [ -n "$OVERWRITE" ]; then
    log "ลบ .cursor เดิม (--overwrite)"
    rm -rf "$TARGET"
  else
    BAK="$PROJECT/.cursor.backup.$(date +%Y%m%d_%H%M%S)"
    log "backup .cursor → $(basename "$BAK")"
    mv "$TARGET" "$BAK"
  fi
fi

log "ติดตั้ง → $TARGET"
mkdir -p "$TARGET"
cp -R "$CURSOR_SRC/." "$TARGET/"
find "$TARGET" -name '.DS_Store' -delete 2>/dev/null || true

# --- docs ---
mkdir -p "$PROJECT/docs/work-summary"
touch "$PROJECT/docs/work-summary/.gitkeep"

if [ -z "$SKIP_DOCS" ]; then
  GEN="$SRC/scripts/generate-codebase-docs.mjs"
  if [ -f "$GEN" ] && command -v node >/dev/null 2>&1; then
    log "สแกนโปรเจกต์ + เตรียม AI docs (Cursor Opus) ..."
    NODE_ARGS=("$GEN" "$PROJECT")
    [ -n "$FORCE_DOCS" ] && NODE_ARGS+=("--force")
    [ -n "${AI_DOCS_OUTLINE:-}" ] && NODE_ARGS+=("--ai-outline")
    node "${NODE_ARGS[@]}"
    log ""
    log "ขั้นตอนถัดไป: เปิด docs/codebase-docs/GENERATE-DOCS-PROMPT-PHASE1.md ใน Cursor Agent (Opus)"
  else
    log "WARN: ข้าม generate docs (ไม่มี node หรือ $GEN)"
    mkdir -p "$PROJECT/docs/codebase-docs"
    [ -f "$SRC/docs-templates/project-blueprint.md" ] && cp "$SRC/docs-templates/project-blueprint.md" "$PROJECT/docs/codebase-docs/" 2>/dev/null || true
    [ -f "$SRC/docs-templates/AI-GUIDE.md" ] && cp "$SRC/docs-templates/AI-GUIDE.md" "$PROJECT/docs/codebase-docs/" 2>/dev/null || true
    [ -f "$SRC/docs-templates/styles.css" ] && cp "$SRC/docs-templates/styles.css" "$PROJECT/docs/codebase-docs/" 2>/dev/null || true
  fi
else
  log "ข้าม docs (--update)"
fi

RULES_COUNT="$(find "$TARGET/rules" -name '*.mdc' 2>/dev/null | wc -l | tr -d ' ')"
log ""
log "เสร็จแล้ว"
log "  โปรเจกต์: $PROJECT"
log "  rules: ${RULES_COUNT:-0} ไฟล์"
log "  เปิด Cursor → Settings → Rules เพื่อตรวจสอบ"
exit 0
