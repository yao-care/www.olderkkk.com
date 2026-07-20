# 部署說明

## 現況：GitHub Pages 專案頁
- Repo: `yao-care/www.olderkkk.com`
- 網址: https://yao-care.github.io/www.olderkkk.com/
- 每次 push 到 `main` → GitHub Actions 自動 build & 部署（`.github/workflows/deploy.yml`）。
- base 路徑 `/www.olderkkk.com`、site `https://yao-care.github.io`（`astro.config.mjs` 預設值）。
- 全站內部連結與 Markdown 圖片會自動加上 base 前綴（`src/lib/withBase.ts` 處理 `.astro`，`astro.config.mjs` 的 rehype 外掛處理 Markdown）。

## 切換到正式網域 www.olderkkk.com（已自動化，單一開關）

程式端已準備好。切換由 **GitHub Actions repo 變數 `CUSTOM_DOMAIN`** 控制
（見 `.github/workflows/deploy.yml`）：

- **未設**（現況）→ 維持子路徑 `https://yao-care.github.io/www.olderkkk.com/`，不受影響。
- **設為 `www.olderkkk.com`** → build 時自動套用 `BASE_PATH=/`、`SITE_URL=https://www.olderkkk.com`
  並產生 `public/CNAME`。

### 切換步驟（DNS 準備好後執行）
1. **DNS**（在網域商後台，需你操作）：將 `www` 的 CNAME 指向 `yao-care.github.io`。
2. 設變數：`gh variable set CUSTOM_DOMAIN --repo yao-care/www.olderkkk.com --body www.olderkkk.com`
3. 設 Pages 自訂網域 + 強制 HTTPS：
   `gh api -X PUT repos/yao-care/www.olderkkk.com/pages -f cname=www.olderkkk.com -F https_enforced=true`
4. 觸發重新部署：`gh workflow run "Deploy to GitHub Pages" --repo yao-care/www.olderkkk.com`
5. 等 DNS 生效（可能數分鐘~數小時）後，`https://www.olderkkk.com/` 即上線。

> 回退：刪除變數即可切回子路徑 — `gh variable delete CUSTOM_DOMAIN`，再重跑部署、
> 並於 Pages 設定移除 Custom domain。
> 本機驗證正式網域版：`BASE_PATH=/ SITE_URL=https://www.olderkkk.com npm run build`。

## 本機指令
```bash
npm run dev       # 開發
npm run build     # 產生 dist/
npm run preview   # 預覽 build 結果
node scripts/check-design.mjs     # 設計規範守門 v2（npm run build 已內含）
```
