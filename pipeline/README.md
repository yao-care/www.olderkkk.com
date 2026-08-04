# pipeline/ — 「身體小卡關」自助文自動產線

每 3 天自動寫一篇「解決生理小不便」的衛教自助文（跟肌肉/骨頭/筋膜有關），過合規閘門與 build gate 後**直接上線**，站主在網站上事後審。設計對齊 dreamer868 的 `pipeline/` 慣例（模組化 + cron.sh 包裝 + guard 閘門 + state 帳本）。

## 流程

`cron.sh`（包裝）→ `run.mjs`（編排）：取題 → `claude.mjs` 生成 → `guard.mjs` 標點正規化＋合規閘門 → **閘門未過先自動送修一輪**（把草稿＋違規理由回餵 claude 做最小改寫再過閘門，2026-08-05 加：高頻通用禁詞「調整/脊椎」靠一次生成很難全避開，曾同題連擋 4 班）→ 仍不過才 BLOCK（**被擋草稿落檔 `pipeline/.cache/blocked-<slug>-<ts>.md` 供稽核**，.cache 不進 repo）→ 過關寫檔＋推進游標 → 回 `cron.sh` 跑 build gate → commit+push（文章＋游標）→ Slack。

- **claude.mjs**：`claude -p --output-format json --max-turns 1 --tools ""`（本機訂閱帳戶，單輪純文字、不 agentic；失敗診斷落 `.cache/claude-errors.log`）。
- **guard.mjs**（自動上線防呆，不過就不寫檔）：禁療效字（治療/根治/療效/治好/痊癒/醫療行為）、需就醫/專業安全提醒、需 `(/method)` 導流、frontmatter 需齊；另做中文半形逗號→全形正規化。
- **state/cursor.json**：`{"next":N}` 下一題索引，隨文章一起 commit（跨機器可續）。
- **topics.tsv**：題材佇列，一行一題 `slug<TAB>困擾<TAB>部位提示`。見底時 cron 發 Slack 提醒補題。

## 檔案

| 檔 | 作用 |
|---|---|
| `cron.sh` | cron 進入點：flock 互斥（與 reflect/brain 共用 `/tmp/seo-claude-olderkkk.com.lock`）、git 同步、build gate、commit/push、Slack |
| `run.mjs` | 編排：取題→生成→閘門→寫檔＋推游標；只印一行 `STATUS=...` 給 cron 解析 |
| `claude.mjs` | `claude -p` JSON 信封呼叫 |
| `guard.mjs` | 合規閘門＋標點正規化＋取 md |
| `config.mjs` | MODEL、路徑、閘門規則 |
| `topics.tsv` / `state/cursor.json` | 題材佇列與游標帳本 |

## 操作

```bash
# 乾測（生成＋閘門＋保留檔案供審，不 build/commit/push、不推游標）
DRY_RUN=1 pipeline/cron.sh

# 只跑編排看 STATUS（不動 git）
node pipeline/run.mjs           # 正式（會寫檔＋推游標）
DRY_RUN=1 node pipeline/run.mjs # 乾跑（寫檔不推游標）

# 補題材：編 topics.tsv 加行即可
# 暫停：把 /etc/cron.d/seo-ops 的 olderkkk 系列那行註解掉
```

## 排程

`/etc/cron.d/seo-ops`（olderkkk 區塊）：`0 17 */3 * *` = UTC 17:00 = 台北 01:00，每 3 天。離峰、落 UTC 午後 claude 空檔、每 3 天才跑，額度負擔極小。

系列定調（格式/串聯判讀調性/合規）另見主機記憶 `olderkkk-daily-life-fix-series`。
