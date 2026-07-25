# www.olderkkk.com — 維運手冊

鄭骨館體雕中心（台中西屯整骨／整脊／體雕／一對一訓練，**預約制**）官網。
由原 PHP 站改版為 **Astro 靜態網站**，部署於 **GitHub Pages**。

- 正式站（現行）：https://www.olderkkk.com/ ✅ 已上線（2026-07-02 切換）
  - 裸網域 `olderkkk.com`、`http://` 皆 301 轉到 `https://www.olderkkk.com/`（強制 HTTPS）。
  - 舊 GitHub 子路徑 `https://yao-care.github.io/www.olderkkk.com/` 亦 301 轉正式站。
- Repo：`yao-care/www.olderkkk.com`（公開；free 組織的 Pages 僅支援公開 repo）
- 切換總開關：repo 變數 `CUSTOM_DOMAIN=www.olderkkk.com`（回退步驟見 `DEPLOY.md`）。

## 技術棧 / 常用指令
- Astro 6 + @astrojs/mdx + @astrojs/sitemap，純靜態，無 jQuery。**Node ≥ 22.12**。
```bash
npm install
npm run dev       # 本機開發（注意：因有 base，網址是 http://localhost:4321/www.olderkkk.com/）
npm run build     # 產生 dist/
npm run preview   # 預覽 build（http://localhost:4326/www.olderkkk.com/）
npm run check:design              # 設計規範守門 v2（build 已內含，手動跑用這個）
npm run check:content             # 內容守門（去 AI 味，build 已內含，手動跑用這個）
npm run check:content:all         # 全站盤點（永遠放行，供人工普查曝光）
```

## 部署
- push 到 `main` → GitHub Actions（`.github/workflows/deploy.yml`，已釘 Node 22）自動 build & 部署 Pages。
- 修改後務必：`npm run build` 成功（已內含 `scripts/check-design.mjs` 設計守門），再 commit/push。
- commit 訊息結尾請接 `Co-Authored-By: ...`（沿用既有慣例）。

## 內容維護（最常見任務）
內容與版型分離，內容在 `src/content/`（Content Collections，schema 在 `src/content.config.ts`）：

| 區塊 | 檔案 | 路由 |
|------|------|------|
| 首頁 | `src/content/home.md`（含 `slides:` 輪播圖） | `/` |
| 服務項目 | `src/content/pages/services.md` | `/services` |
| 課程介紹 | `src/content/pages/courses.md` | `/courses` |
| 聯絡我們 | `src/content/pages/contact.md` | `/contact` |
| 招牌頁 | `src/pages/method.astro`（差異軸主打：運動矯正/肌力訓練/中軸定位床/健美選手/一條龍） | `/method` |
| 健康概念分享 | `src/content/health/<id>.md`（列表＋文章） | `/health`、`/health/<id>` |
| 最新消息 | `src/content/news/<id>.md` | `/news`、`/news/<id>` |
| 成果分享 | `src/content/works/{body,feet}.md`（相簿，`photos:` 陣列） | `/works`、`/works/<album>` |

- **新增一篇健康/最新消息**：在對應資料夾新增 `<id>.md`，frontmatter 需 `title, date(YYYY/MM/DD), summary, order`（數字越小越前面）；body 寫 Markdown。圖片放 `public/images/` 並以 `/images/xxx` 引用。
- **新增相簿照片**：編輯 `works/<album>.md` 的 `photos:`（`src` + `caption`），圖片放 `public/images/`。
- **圖片一律放 `public/images/`，用 `/images/檔名` 引用**（會自動加 base 前綴）。
- **站主上傳照片流程（全站唯一入口，之後所有換／新增照片一律走這條，不分頁面用途）**：站主把原圖丟到 repo 的 `photo-inbox/`（GitHub 網頁 Add file→Upload files，直接 commit main）→ Claude `git pull` → 轉 WebP 進 `public/images/` → 接到對應位置（頁面 `.astro` 變數／home.md `slides:`／works `photos:`／文章 Markdown 圖）＋`alt` → 過 gate → push →`git rm` 掉 inbox 原圖。細節與「放哪怎麼講」見 `photo-inbox/README.md`。（聊天室夾帶圖常靜默失敗傳不到 Claude，故一律走 git 進料，不要再要求站主用附件貼圖。）

## ⚠️ 重要陷阱（踩過的雷）
1. **內部連結／圖片只用 Markdown 語法，不要用 raw HTML `<img>/<a>`**。Markdown 的 `/images`、`/services` 會被 rehype 自動加上 base 前綴；**raw HTML 不會 → 上線變 404**。需要格狀版面時用 CSS（見 services/courses/index 的 `.astro` style），不要在 .md 內寫 `<div><img></div>`。
2. **首頁多欄版面**用 CSS 處理（`src/pages/index.astro`：去項目符號、`ul:last-of-type` 格狀、聯絡圖示列）。
3. 大圖請轉 WebP（範例：課程橫幅 `ok-class-banner.webp`，用 `cwebp -q 80 -resize 1600 0`）。

## 設計規範（v2，2026-07-20 全站統一）
`scripts/check-design.mjs` 於 `npm run build` 前自動守門（違規即 build fail，CI 同步擋）：
1. **font-size 禁用 px**——一律 `var(--text-*)` 階梯（最小 18px＝`--text-xs`，無例外）。
2. **顏色（hex/rgb()/hsl()）只准出現在 `src/styles/variables.css`**（OKLCH + hex fallback；原 `tokens.css` 已於 2026-07-20 更名）。
3. **禁 important 覆寫**。
4. **禁外部 CDN**（Google Fonts、公共 JS/CSS CDN；資源自託管或系統字型堆疊）。
5. **css 檔白名單**：`src/` 下 .css 只准 `src/styles/{variables,global}.css`；元件樣式寫 scoped `<style>`。
守門連註解裡的字面違規字串都擋，寫註解時避開。CI fail 會由 deploy.yml 的 notify-failure job 發 Slack（`C0BEU5RA02G`）。

## 內容守門（去 AI 味）
`scripts/check-content.mjs` 於 `npm run build` 時排在 `check-design` 之後、`astro build` 之前自動守門（違規即 build fail，CI 同步擋）。為 `/root/.claude/skills/new-astro-site/templates/check-content.mjs` 統一引擎的副本（跨站共用核心規則，站台特化才在檔內 `SITE_ERROR_TELLS`/`SITE_WARN_LAYERS` 擴充）。
- **兩級判定**：ERROR（擋 build）＝near-zero 誤判的強 AI 指紋（「不是X而是Y」「值得注意的是」「隨著…的發展」「研究顯示」…）＋模板化開頭，單一命中即擋；WARN（只印不擋）＝軟訊號分詞彙/句式/結構/語氣四層，**單檔跨 ≥3 層才升級為 ERROR**。
- **掃描範圍（存量 grandfather）**：預設只掃「相對 `origin/main` 的變動檔」中的 `src/**/*.md(x)`；抓不到 git base（CI 淺 checkout）→ 掃 0 檔 exit 0，永不誤擋既有內容。`--all` 全站盤點永遠放行（人工普查）；`<file>...` 只掃指定檔（產線產文後自檢）。
- **產線接口**：`pipeline/` 產文後可用 `node scripts/check-content.mjs <檔>` 自檢；seo-ops 反思/大腦的 `npm run build` gate 亦自動繼承本守門。

## SEO / AEO / GEO 慣例
- **商家資訊唯一來源：`src/lib/site.ts`**（名稱/電話/Email/LINE/FB/地圖/地址/座標/營業時間）。要改 NAP、營業時間、地圖連結 → 改這裡（schema 與多處引用會一起更新）。
- **結構化資料**：`Base.astro` 全站自動輸出 `LocalBusiness`；各頁可傳 `schemas={[...]}`（已有 Breadcrumb / Article / VideoObject / OfferCatalog / ImageGallery / FAQPage 產生器在 `site.ts`）。
- **標題/描述**：各頁在 `.astro` 設 `seoTitle`/`seoDesc`（乾淨、唯一、含「台中西屯」）。**不要**再用關鍵字堆砌，**不要**加 `meta keywords`。
- **robots.txt**：`src/pages/robots.txt.ts`（開放 AI 爬蟲 GPTBot/PerplexityBot/ClaudeBot/Google-Extended，指向 sitemap）。已在正式網域根目錄生效：`https://www.olderkkk.com/robots.txt` → `Sitemap: https://www.olderkkk.com/sitemap-index.xml`。
- **FAQ**：`src/pages/faq.astro`（含 FAQPage schema）；問答資料在 `src/lib/faqs.ts`（`FAQS`＝/faq、`METHOD_FAQS`＝/method），頁面與 `/llms-full.txt` 共用同一份。
- **llms.txt / llms-full.txt**（給 AI 助理讀的純文字）：`src/pages/llms.txt.ts` ＝ **目錄**（站台簡介＋分區連結）；`src/pages/llms-full.txt.ts` ＝ **全文**（商家資訊、招牌做法、服務項目與各服務分頁、課程、收費、預約須知、名詞解釋、常見問題，以及 health／news 全部文章正文，約 110 KB）。全文版不另抄文案：資料取自 `src/lib/site.ts`、共用資料模組（`faqs.ts`／`glossary.ts`／`services-catalog.ts`）、content collections，服務／招牌頁則以 `import.meta.glob(?raw)` 讀 `.astro` 原始碼去標籤取正文——**新增服務分頁會自動被收錄，不需再改本檔**。
- **圖片 alt**：`astro.config.mjs` 的 rehype 會替空 alt 補預設值；新增重要圖片仍建議自己寫 alt。
- **禁止**把 Google 評論（4.9/245）寫成自家 `AggregateRating`（違反 Google 準則）。

## 商家資訊（現況，2026-06）
- 地址：407 台中市西屯區工業區一路58巷11弄83號（座標 24.1775877, 120.6136818）
- 電話 0970686319｜Email d28281778@gmail.com｜LINE @275nxace｜FB facebook.com/olderk/
- 地圖：https://maps.app.goo.gl/dx4tE1qBJhFficMz6
- 營業時間：週一、二、三、五、六 14:00–17:00、20:00–22:00；**週四、日公休**

## 一次性擷取腳本（平時不需執行）
`scripts/` 內 `extract.mjs`（主要頁）、`extract-works.mjs`（相簿）、`extract-articles.mjs`（文章）、`fix-content.mjs`（連結改寫）為**從舊站擷取內容用**。內容已產出並可直接編輯，無需重跑；若要重抓需注意會覆蓋現有手動修正（如文章文字摘要、contact 清理）。

## 內容自動產線（`pipeline/`）— 「身體小卡關」自助文系列

> ✍️ **每 3 天自動寫 1 篇**「解決生理小不便」的衛教自助文（肌肉/骨頭/筋膜相關），過閘門後**直接上線**，站主在網站上事後審。結構對齊 dreamer868 的 `pipeline/` 慣例。**放在本 repo `pipeline/`，勿搬回 seo-ops/bin。**
> 流程：`cron.sh`（flock 互斥＋git 同步＋build gate＋commit/push＋Slack）→ `run.mjs`（編排）：取題 → `claude.mjs`（`claude -p` JSON 信封、`cwd=/tmp` 避免載入本 CLAUDE.md 幻覺）生成 → `guard.mjs`（合規閘門：禁療效字、需就醫提醒、需 `(/method)` 導流、frontmatter 齊＋半形逗號正規化）→ 過關寫檔＋推進游標。
> 題材佇列 `pipeline/topics.tsv`（一行一題）、游標帳本 `pipeline/state/cursor.json`（隨文章 commit）；見底自動 Slack 提醒補題。乾測 `DRY_RUN=1 pipeline/cron.sh`。細節 `pipeline/README.md`；系列定調（格式/串聯判讀/合規）見主機記憶 `olderkkk-daily-life-fix-series`。排程單一真來源＝`/etc/cron.d/seo-ops`（台北 01:00／每 3 天）。

## 數據追蹤（GA / GSC）

> 🤖 **SEO 自動化（2026-07-02 起，2026-07-09 重構為三主層）**：本站已納入主機統一框架 `/root/seo-ops`——每天三主層＋週報：
> 收集(抓 GA4+GSC→發📊 Slack，已併心跳) → 🧭 反思(自動改站台「經營層」：IA/導覽/內鏈/canonical/sitemap，限白名單) → 🤖 大腦(自動改「單篇內容」/補文章) → 📈 週報(週一)；發到 Slack `C0BEU5RA02G`。
> **排程時刻的單一真來源＝`/etc/cron.d/seo-ops`**（勿在此寫死，會漂移）。
> 站台參數 `seo-ops/sites/olderkkk.com.json`、站規＋動手白名單(reflect:scope/brain:scope) `seo-ops/playbooks/olderkkk.com.md`、log `seo-ops/logs/olderkkk.com-*.log`。
> 回滾自動改動：本 repo `git log --oneline | grep -E 'auto-claude-(seo|reflect)'` → `git revert <sha>`。
- **GA4**：評估 ID `G-LRMXNPBRX0`（GA4 property `properties/543939182`）。追蹤碼由 `Base.astro` 讀 `PUBLIC_GA_ID` 輸出；正式開關為 repo 變數 `GA_ID`（未設則全站不輸出）。
- **GSC**：網域資源 `sc-domain:olderkkk.com`（DNS TXT 驗證）；sitemap 已提交，robots.txt 亦指向，會自動重抓。
- **GBP（Google 商家檔案）**：**已認領且持續經營中**（現 4.9／245 則）。知識面板 kgmid `/g/11b_23ch3f`，分享連結 https://share.google/v6oTDE5MDUvqfZjW5 。非待辦。此連結已進站：`site.ts` `googleBusiness` → LocalBusiness `sameAs`（官網↔商家檔案實體綁定）＋ `/contact` 頁「看位置與評論」導流。**主類別策略＝整復推拿**（吃「整骨」在地流量；配套：商家簡介點明「運動矯正、不硬扳、不喀一聲」過濾期望，狂拚評論勝過傳統老店）。
- **每週排名追蹤（2026-07-23 起，用戶要求「每週一次」）**：`/root/seo-ops/bin/rank-track.mjs --site olderkkk.com`（cron 台北週一 09:00），拉「整骨/整復/整脊類」字本週 vs 上週排名/曝光→Slack `C0BEU5RA02G`。目標字定義在 `seo-ops/sites/olderkkk.com.json` 的 `rankTrack.pattern`。**診斷**：本站早已在多個整骨字排第一頁邊緣卻近乎 0 點擊（搜整骨者要傳統手法、與本站運動矯正定位不對味）→ 策略靠**地圖三包（商家檔案評論）**贏在地，非衝藍色連結自然排名。禁詞政策只禁官網文案，追蹤「別人搜什麼」不衝突。
- API 操作（提 sitemap／讀 GA 即時）用 service account `~/.config/olderkkk/ga4-sa.json`（siteOwner + analytics.readonly）。

## 已完成（2026-07-02 上線）
- 正式網域 `www.olderkkk.com` 切換完成（`CUSTOM_DOMAIN` 變數 + Pages 自訂網域 + 強制 HTTPS）；裸網域與舊子路徑皆 301 轉正式站。
- GA4 埋碼、GSC sitemap 提交完成。

## 待辦（交接給後續）
- **/method 招牌頁照片**：✅ 2026-07-20 已換上實拍新照（hero＝師傅操作中軸定位床、中軸定位床段＝客人躺床實拍、一對一段＝站姿運動矯正）；`body-care` 過程段、`personal-training` 課程段亦各補一張實拍直式配圖。鄭師傅頭像 `laoKImg` 仍為舊照，日後有更好頭像可換。照片一律走 `photo-inbox/` 上傳流程（見 `photo-inbox/README.md`）。
- **/method 中軸定位床宣稱**：✅ 店主確認「全台唯一・耗資百萬」為事實（2026-07-20 拍板）；建議留存可佐證資料（採購憑證／獨家性依據）以備公平法查詢。此項結案。
- **證照定調（勿再放回頁面）**：鄭博陽證照＝**台灣整復協會**發（非「國際」，媒體寫法有誇大）。**決定不強調、頁面不放**——圈內反感證照，放了反而扣公信力；可信度靠健美選手實績＋成果對比，不靠證書。
- （GBP 已在經營，見「數據追蹤」段。）
- 設計／規劃文件：`docs/superpowers/`（spec、plan）。
