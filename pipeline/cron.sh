#!/usr/bin/env bash
# pipeline/cron.sh — 身體小卡關系列 cron 包裝：flock 互斥 → git 同步 → run.mjs（生成＋合規閘門）→
#   build gate → commit+push（文章＋游標帳本）→ Slack。失敗清檔不推進游標、發🔴。
# 安裝（台北 01:00＝UTC 17:00，每 3 天；離峰、落 UTC 午後 claude 空檔）：
#   /etc/cron.d/seo-ops：0 17 */3 * * root /root/www.olderkkk.com/pipeline/cron.sh >> /root/seo-ops/logs/olderkkk.com-series.log 2>&1
# 前置：`claude` 已登入（訂閱帳戶，root headless 靠 IS_SANDBOX=1）。乾測：DRY_RUN=1 pipeline/cron.sh
set -uo pipefail
export PATH="/root/.local/bin:/usr/local/bin:/usr/bin:/bin"
export TZ="Asia/Taipei"
export IS_SANDBOX=1

REPO="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO"
SEO_OPS="/root/seo-ops"
log(){ echo "[series] $(date '+%F %T %Z') $*"; }
slack(){ [ "${DRY_RUN:-0}" = "1" ] && return 0; node "$SEO_OPS/bin/slack-send.mjs" --site olderkkk.com --text "$1" 2>/dev/null || true; }

# 與自家 reflect/brain 共用 per-站 flock 鎖：絕不同時改工作樹。
exec 200>"/tmp/seo-claude-olderkkk.com.lock"
flock -w 3900 200 || { log "等 claude 鎖逾時，跳過本次"; exit 1; }

git fetch origin main 2>&1 && git rebase --autostash origin/main 2>&1 || log "git 同步失敗（續行）"

OUT="$(node pipeline/run.mjs)"; log "run.mjs → $OUT"
BODY="${OUT#STATUS=}"; STATUS="${BODY%%|*}"; REST="${BODY#*|}"; SLUG="${REST%%|*}"; TOPIC="${REST#*|}"

if [ "${DRY_RUN:-0}" = "1" ]; then log "DRY_RUN — 不 build/commit/push（STATUS=$STATUS，檔案保留供審）"; exit 0; fi

case "$STATUS" in
  PUBLISH)
    if ! node scripts/check-design.mjs >/tmp/olderkkk-series-gate.log 2>&1 || ! npm run build >>/tmp/olderkkk-series-gate.log 2>&1; then
      log "build gate 失敗，回退文章與游標"
      git checkout -- pipeline/state/cursor.json 2>/dev/null || true
      rm -f "src/content/health/$SLUG.md"
      slack "🔴 身體小卡關：build gate 失敗（$SLUG），未上線、不推進游標"; exit 1
    fi
    git add "src/content/health/$SLUG.md" pipeline/state/cursor.json
    git commit -q -m "content: 身體小卡關自動上線 — $TOPIC

自動產線（pipeline/，每3天1篇）；已過 guard 合規閘門與 build gate。
Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01EEVrHiJRWP4UFEpcKyDmPN" || { log "commit 失敗"; exit 1; }
    git push origin main 2>&1 || { log "push 失敗"; slack "🔴 身體小卡關：push 失敗（$SLUG）"; exit 1; }
    log "已上線：/health/$SLUG"
    slack "🩹 身體小卡關新文上線：$TOPIC → https://www.olderkkk.com/health/$SLUG"
    ;;
  SKIP)  log "檔案已存在，游標已推進：$SLUG" ;;
  BLOCK) log "guard 擋下：$SLUG｜$TOPIC"; slack "🔴 身體小卡關：guard 擋下（$SLUG）：$TOPIC，未上線、不推進游標" ;;
  EMPTY) log "題材佇列見底"; slack "📭 身體小卡關：題材佇列見底，請補題（pipeline/topics.tsv）" ;;
  ERROR) log "生成錯誤：$REST"; slack "🔴 身體小卡關：生成錯誤 — $REST" ;;
  *)     log "未知狀態：$OUT" ;;
esac
