#!/usr/bin/env bash
# pipeline/cron.sh — 身體小卡關系列 cron 包裝：flock 互斥 → git 同步 → run.mjs（生成＋合規閘門）→
#   build gate → commit+push（文章＋游標帳本）→ Slack。失敗清檔不推進游標、發🔴。
# 安裝（台北 01:00＝UTC 17:00，每 3 天；離峰、落 UTC 午後 claude 空檔）：
#   /etc/cron.d/seo-ops：0 17 */3 * * root /mnt/customers/www.olderkkk.com/pipeline/cron.sh >> /mnt/customers/seo-ops/logs/olderkkk.com-series.log 2>&1
# 前置：`claude` 已登入（訂閱帳戶，root headless 靠 IS_SANDBOX=1）。乾測：DRY_RUN=1 pipeline/cron.sh
set -uo pipefail
export PATH="/root/.local/bin:/usr/local/bin:/usr/bin:/bin"
export TZ="Asia/Taipei"
export IS_SANDBOX=1

REPO="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO"
SEO_OPS="/mnt/customers/seo-ops"
log(){ echo "[series] $(date '+%F %T %Z') $*"; }
slack(){ [ "${DRY_RUN:-0}" = "1" ] && return 0; node "$SEO_OPS/bin/slack-send.mjs" --site olderkkk.com --text "$1" 2>/dev/null || true; }

# 與自家 reflect/brain 共用 per-站 flock 鎖：絕不同時改工作樹。
exec 200>"/tmp/seo-claude-olderkkk.com.lock"
flock -w 3900 200 || { log "等 claude 鎖逾時，跳過本次"; exit 1; }

git fetch origin main 2>&1 && git rebase --autostash origin/main 2>&1 || log "git 同步失敗（續行）"

OUT="$(node pipeline/run.mjs)"; log "run.mjs → $OUT"
BODY="${OUT#STATUS=}"; STATUS="${BODY%%|*}"; REST="${BODY#*|}"; SLUG="${REST%%|*}"; TOPIC="${REST#*|}"

if [ "${DRY_RUN:-0}" = "1" ]; then log "DRY_RUN — 不 build/commit/push（STATUS=$STATUS，檔案保留供審）"; exit 0; fi

# 題材見底時 run.mjs 會自動補題（2026-11-09 站主裁示）：補了就先單獨 commit topics.tsv，並在 Slack 列出補了哪些
if [ -s pipeline/state/refill-last.txt ] && ! git diff --quiet -- pipeline/topics.tsv; then
  git add pipeline/topics.tsv
  git commit -q -m "content: 身體小卡關題材見底，自動補題

$(cat pipeline/state/refill-last.txt)" && git push origin main 2>&1 || log "補題 commit/push 失敗（續行）"
  slack "🧩 身體小卡關：題材見底，已自動補 $(grep -c . pipeline/state/refill-last.txt) 題（之後照常每 3 天 1 篇）：
$(sed 's/^/• /' pipeline/state/refill-last.txt)"
  rm -f pipeline/state/refill-last.txt
fi

GATE_LOG=/mnt/customers/seo-ops/logs/olderkkk.com-series-gate.log   # 原本在 /tmp（2026-11-09 移）
case "$STATUS" in
  PUBLISH)
    # 全站 build 走全機 build 輪流（site-build-run；最多等 30 分）。等鎖逾時（75）＝本輪跳過：回退文章與游標、不發 🔴
    BRC=0
    node scripts/check-design.mjs >"$GATE_LOG" 2>&1 || BRC=1
    if [ "$BRC" = 0 ]; then SITE_BUILD_WAIT=1800 site-build-run olderkkk.com -- npm run build >>"$GATE_LOG" 2>&1 || BRC=$?; fi
    if [ "$BRC" = 75 ]; then
      log "等全機 build 鎖逾時，本輪跳過（回退文章與游標，下輪再寫這題）"
      git checkout -- pipeline/state/cursor.json 2>/dev/null || true
      rm -f "src/content/health/$SLUG.md"; exit 0
    fi
    if [ "$BRC" != 0 ]; then
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
  EMPTY) log "題材佇列見底且自動補題失敗"; slack "📭 身體小卡關：題材佇列見底，自動補題沒成功（看 olderkkk.com-series.log），這輪沒產文" ;;
  ERROR) log "生成錯誤：$REST"; slack "🔴 身體小卡關：生成錯誤 — $REST" ;;
  *)     log "未知狀態：$OUT" ;;
esac
