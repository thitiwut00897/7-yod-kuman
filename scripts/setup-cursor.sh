#!/usr/bin/env bash
# setup-cursor.sh — ติดตั้ง .cursor (rules, agents, skills) จาก my-cursor-rules
#
# วิธีใช้:
#   curl -fsSL https://raw.githubusercontent.com/thitiwut00897/my-cursor-rules/main/scripts/setup-cursor.sh | bash -s -- --project .

REPO_URL="https://github.com/thitiwut00897/my-cursor-rules.git"
REPO_BRANCH="main"
REPO_SLUG="thitiwut00897/my-cursor-rules"
ZIP_FOLDER="my-cursor-rules-main"

PROJECT="."
USE_LOCAL=""
LOCAL_REPO=""
OVERWRITE="1"

log() { printf '%s\n' "$*"; }

die() {
  log ""
  log "❌ ERROR: $*"
  exit 1
}

usage() {
  cat <<'EOF'

my-cursor-rules — setup-cursor.sh

  --project <path>   ติดตั้ง/อัปเดต .cursor (rules, agents, skills)
  --local <path>     ใช้ repo บนเครื่องแทน download

ตัวอย่าง:
  curl -fsSL https://raw.githubusercontent.com/thitiwut00897/my-cursor-rules/main/scripts/setup-cursor.sh | bash -s -- --project .

EOF
}

# --- parse args ---
while [ $# -gt 0 ]; do
  case "$1" in
    --project) PROJECT="${2:-}"; shift 2 ;;
    --local)  USE_LOCAL="1"; shift ;;
    -h|--help) usage; exit 0 ;;
    --) shift; break ;;
    *)
      if [ -n "$USE_LOCAL" ] && [ -z "$LOCAL_REPO" ]; then
        LOCAL_REPO="$1"; shift
      else
        die "Unknown argument: $1"
      fi
      ;;
  esac
done

[ -d "$PROJECT" ] || die "ไม่พบโฟลเดอร์โปรเจกต์: $PROJECT"
PROJECT="$(cd "$PROJECT" && pwd)"

log ""
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "  my-cursor-rules setup"
log "  project: $PROJECT"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log ""

# --- download config repo ---
SRC=""

if [ -n "$USE_LOCAL" ]; then
  if [ -z "$LOCAL_REPO" ]; then
    _dir="$(dirname "$0")"
    LOCAL_REPO="$(cd "$_dir/.." && pwd)"
  fi
  [ -d "$LOCAL_REPO" ] || die "ไม่พบ local repo: $LOCAL_REPO"
  SRC="$LOCAL_REPO"
  log "[1/3] ใช้ local repo: $SRC"
else
  WORK="$(mktemp -d)"
  cleanup() { rm -rf "$WORK"; }
  trap cleanup EXIT

  log "[1/3] ดาวน์โหลด my-cursor-rules จาก GitHub ..."
  if command -v git >/dev/null 2>&1; then
    git clone --depth 1 --branch "$REPO_BRANCH" "$REPO_URL" "$WORK/repo" && SRC="$WORK/repo"
  fi

  if [ -z "$SRC" ]; then
    ZIP_URL="https://github.com/${REPO_SLUG}/archive/refs/heads/${REPO_BRANCH}.zip"
    curl -fsSL -L -o "$WORK/z.zip" "$ZIP_URL" || die "ดาวน์โหลด zip ไม่ได้"
    unzip -q "$WORK/z.zip" -d "$WORK"
    SRC="$WORK/$ZIP_FOLDER"
  fi
fi

[ -d "$SRC" ] || die "ไม่พบ Source files"
log "      OK"

# --- install .cursor ---
log "[2/3] ติดตั้ง rules, agents, skills ..."
TARGET="$PROJECT/.cursor"

# Backup if exists (optional, but here we overwrite for simplicity)
[ -d "$TARGET" ] && rm -rf "$TARGET"
mkdir -p "$TARGET"

# Copy rules, agents, skills from root of SRC
[ -d "$SRC/rules" ] && cp -R "$SRC/rules" "$TARGET/"
[ -d "$SRC/agents" ] && cp -R "$SRC/agents" "$TARGET/"
[ -d "$SRC/skills" ] && cp -R "$SRC/skills" "$TARGET/"
[ -f "$SRC/.cursor/.cursorrules" ] && cp "$SRC/.cursor/.cursorrules" "$TARGET/"

# Clean up
find "$TARGET" -name '.DS_Store' -delete 2>/dev/null || true

RULES_COUNT="$(find "$TARGET/rules" -name '*.mdc' 2>/dev/null | wc -l | tr -d ' ')"
log "      OK: $TARGET ($RULES_COUNT rules)"

# --- verify ---
log "[3/3] ตรวจผล ..."
log ""
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "  ✅ เสร็จแล้ว"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log ""
log "  โปรเจกต์:  $PROJECT"
log "  Rules:     $RULES_COUNT ไฟล์"
log "  Agents:    $([ -d "$TARGET/agents" ] && echo OK || echo None)"
log "  Skills:    $([ -d "$TARGET/skills" ] && echo OK || echo None)"
log ""
log "  ตรวจที่ Cursor: Settings → Rules"
log ""

exit 0
