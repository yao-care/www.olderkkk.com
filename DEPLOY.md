# 部署說明

## 現況：GitHub Pages 專案頁
- Repo: `yao-care/www.olderkkk.com`
- 網址: https://yao-care.github.io/www.olderkkk.com/
- 每次 push 到 `main` → GitHub Actions 自動 build & 部署（`.github/workflows/deploy.yml`）。
- base 路徑 `/www.olderkkk.com`、site `https://yao-care.github.io`（`astro.config.mjs` 預設值）。
- 全站內部連結與 Markdown 圖片會自動加上 base 前綴（`src/lib/withBase.ts` 處理 `.astro`，`astro.config.mjs` 的 rehype 外掛處理 Markdown）。

## 未來切換到正式網域 www.olderkkk.com（快速）
1. 在 repo 加入 `public/CNAME`，內容為一行：`www.olderkkk.com`
2. 設環境變數重新 build（擇一）：
   - 改 `astro.config.mjs` 兩個預設值：`BASE = '/'`、`SITE = 'https://www.olderkkk.com'`，或
   - 在 workflow 的 `withastro/action` 步驟加 `env: { BASE_PATH: '/', SITE_URL: 'https://www.olderkkk.com' }`
3. GitHub repo → Settings → Pages → Custom domain 填 `www.olderkkk.com`
4. DNS：將 `www` 的 CNAME 指向 `yao-care.github.io`
5. push → 重新部署即上線。`BASE_PATH=/` 時前綴邏輯自動關閉（不會產生 `//path`）。

## 本機指令
```bash
npm run dev       # 開發
npm run build     # 產生 dist/
npm run preview   # 預覽 build 結果
node scripts/check-fontsize.mjs   # 字級守門（最小 18px）
```
