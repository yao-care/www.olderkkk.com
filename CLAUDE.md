# www.olderkkk.com — 維運手冊

鄭骨館體雕中心（台中西屯整骨／整脊／體雕／一對一訓練，**預約制**）官網。
由原 PHP 站改版為 **Astro 靜態網站**，部署於 **GitHub Pages**。

- 線上（測試／現行）：https://yao-care.github.io/www.olderkkk.com/
- Repo：`yao-care/www.olderkkk.com`（公開；free 組織的 Pages 僅支援公開 repo）
- 正式網域（未切換）：www.olderkkk.com — 切換步驟見 `DEPLOY.md`

## 技術棧 / 常用指令
- Astro 6 + @astrojs/mdx + @astrojs/sitemap，純靜態，無 jQuery。**Node ≥ 22.12**。
```bash
npm install
npm run dev       # 本機開發（注意：因有 base，網址是 http://localhost:4321/www.olderkkk.com/）
npm run build     # 產生 dist/
npm run preview   # 預覽 build（http://localhost:4326/www.olderkkk.com/）
node scripts/check-fontsize.mjs   # 字級守門：禁止任何 font-size < 18px
```

## 部署
- push 到 `main` → GitHub Actions（`.github/workflows/deploy.yml`，已釘 Node 22）自動 build & 部署 Pages。
- 修改後務必：`npm run build` 成功 + `node scripts/check-fontsize.mjs` 通過，再 commit/push。
- commit 訊息結尾請接 `Co-Authored-By: ...`（沿用既有慣例）。

## 內容維護（最常見任務）
內容與版型分離，內容在 `src/content/`（Content Collections，schema 在 `src/content.config.ts`）：

| 區塊 | 檔案 | 路由 |
|------|------|------|
| 首頁 | `src/content/home.md`（含 `slides:` 輪播圖） | `/` |
| 服務項目 | `src/content/pages/services.md` | `/services` |
| 課程介紹 | `src/content/pages/courses.md` | `/courses` |
| 聯絡我們 | `src/content/pages/contact.md` | `/contact` |
| 健康概念分享 | `src/content/health/<id>.md`（列表＋文章） | `/health`、`/health/<id>` |
| 最新消息 | `src/content/news/<id>.md` | `/news`、`/news/<id>` |
| 成果分享 | `src/content/works/{body,feet}.md`（相簿，`photos:` 陣列） | `/works`、`/works/<album>` |

- **新增一篇健康/最新消息**：在對應資料夾新增 `<id>.md`，frontmatter 需 `title, date(YYYY/MM/DD), summary, order`（數字越小越前面）；body 寫 Markdown。圖片放 `public/images/` 並以 `/images/xxx` 引用。
- **新增相簿照片**：編輯 `works/<album>.md` 的 `photos:`（`src` + `caption`），圖片放 `public/images/`。
- **圖片一律放 `public/images/`，用 `/images/檔名` 引用**（會自動加 base 前綴）。

## ⚠️ 重要陷阱（踩過的雷）
1. **內部連結／圖片只用 Markdown 語法，不要用 raw HTML `<img>/<a>`**。Markdown 的 `/images`、`/services` 會被 rehype 自動加上 base 前綴；**raw HTML 不會 → 上線變 404**。需要格狀版面時用 CSS（見 services/courses/index 的 `.astro` style），不要在 .md 內寫 `<div><img></div>`。
2. **首頁多欄版面**用 CSS 處理（`src/pages/index.astro`：去項目符號、`ul:last-of-type` 格狀、聯絡圖示列）。
3. 大圖請轉 WebP（範例：課程橫幅 `ok-class-banner.webp`，用 `cwebp -q 80 -resize 1600 0`）。

## 設計規範
- OKLCH 配色 + hex fallback、字型/字級在 `src/styles/tokens.css`、`global.css`。
- **最小字級 18px（`--text-xs`），無例外**；`scripts/check-fontsize.mjs` 會擋 px<18（CI/手動）。

## SEO / AEO / GEO 慣例
- **商家資訊唯一來源：`src/lib/site.ts`**（名稱/電話/Email/LINE/FB/地圖/地址/座標/營業時間）。要改 NAP、營業時間、地圖連結 → 改這裡（schema 與多處引用會一起更新）。
- **結構化資料**：`Base.astro` 全站自動輸出 `LocalBusiness`；各頁可傳 `schemas={[...]}`（已有 Breadcrumb / Article / VideoObject / OfferCatalog / ImageGallery / FAQPage 產生器在 `site.ts`）。
- **標題/描述**：各頁在 `.astro` 設 `seoTitle`/`seoDesc`（乾淨、唯一、含「台中西屯」）。**不要**再用關鍵字堆砌，**不要**加 `meta keywords`。
- **robots.txt**：`src/pages/robots.txt.ts`（開放 AI 爬蟲 GPTBot/PerplexityBot/ClaudeBot/Google-Extended，指向 sitemap）。註：現為子路徑，**切到正式網域才會在根目錄生效**。
- **FAQ**：`src/pages/faq.astro`（含 FAQPage schema）。
- **圖片 alt**：`astro.config.mjs` 的 rehype 會替空 alt 補預設值；新增重要圖片仍建議自己寫 alt。
- **禁止**把 Google 評論（4.9/245）寫成自家 `AggregateRating`（違反 Google 準則）。

## 商家資訊（現況，2026-06）
- 地址：407 台中市西屯區工業區一路58巷11弄83號（座標 24.1775877, 120.6136818）
- 電話 0970686319｜Email d28281778@gmail.com｜LINE @275nxace｜FB facebook.com/olderk/
- 地圖：https://maps.app.goo.gl/dx4tE1qBJhFficMz6
- 營業時間：週一、二、三、五、六 14:00–17:00、20:00–22:00；**週四、日公休**

## 一次性擷取腳本（平時不需執行）
`scripts/` 內 `extract.mjs`（主要頁）、`extract-works.mjs`（相簿）、`extract-articles.mjs`（文章）、`fix-content.mjs`（連結改寫）為**從舊站擷取內容用**。內容已產出並可直接編輯，無需重跑；若要重抓需注意會覆蓋現有手動修正（如文章文字摘要、contact 清理）。

## 待辦（交接給後續）
- **切換正式網域 www.olderkkk.com**：見 `DEPLOY.md`（加 `public/CNAME`、設 `BASE_PATH=/`、`SITE_URL=https://www.olderkkk.com`、Pages 設定 Custom domain、DNS CNAME 指向 yao-care.github.io）。
- **Google 商家檔案（GBP）**：認領/優化、評論經營（現 4.9／245 則）。
- 設計／規劃文件：`docs/superpowers/`（spec、plan）。
