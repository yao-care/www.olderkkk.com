# 鄭骨館體雕中心 官網（www.olderkkk.com）

台中西屯整骨／整脊／體雕／一對一訓練。由原 PHP 站改版為 **Astro 靜態網站**，部署於 **GitHub Pages**。

- 線上：https://yao-care.github.io/www.olderkkk.com/
- **維運手冊（先讀這個）：[`CLAUDE.md`](./CLAUDE.md)** — 內容維護、設計規範、SEO 慣例、陷阱、待辦。
- **部署 / 切換正式網域：[`DEPLOY.md`](./DEPLOY.md)**

## 快速開始
```bash
npm install
npm run dev       # 開發（網址含 base：/www.olderkkk.com/）
npm run build     # 產生 dist/
node scripts/check-design.mjs     # 設計規範守門 v2（npm run build 已內含）
node scripts/check-content.mjs    # 內容守門（去 AI 味，npm run build 已內含）
node scripts/check-content.mjs --all   # 全站盤點（永遠放行，供人工普查）
```

## 重點提醒
- 內容在 `src/content/`（Markdown），改完 `npm run build` 通過再 push；push 到 `main` 會自動部署。
- **內容守門（去 AI 味）**：`npm run build` 於 `astro build` 前先跑 `check-content.mjs`，偵測 AI 腔句型；強指紋單一命中即擋、軟訊號跨 ≥3 層升級擋。預設只掃相對 `origin/main` 的變動檔（存量 grandfather、不回頭清算），命中即 build fail。
- **內部連結／圖片用 Markdown 語法，勿用 raw HTML**（否則 base 前綴失效會 404）。
- 商家資訊（電話/地址/營業時間/地圖等）唯一來源：`src/lib/site.ts`。

詳見 `CLAUDE.md`。
