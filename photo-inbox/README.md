# 📥 照片收件夾（photo-inbox）— 全站照片上傳的唯一入口

**本站以後所有要換／新增的照片，一律丟這裡。** 不分頁面、不分用途
（首頁輪播、招牌頁、相簿、文章配圖、各頁 banner… 全部走這條）。
Claude 會 pull 下來自動處理，處理完把原圖清掉。

> 這個資料夾不在 `public/`／`src/` 底下，**不會被 build 打包、不會上線**，
> 純粹當「進料暫存區」。聊天室夾帶圖常常靜默失敗傳不到 Claude，所以改走 git 進料。

## 怎麼上傳（GitHub 網頁，手機電腦都行）

1. 打開 repo：<https://github.com/yao-care/www.olderkkk.com/tree/main/photo-inbox>
2. 右上 **Add file → Upload files**（或 repo 首頁 Add file→Upload files，拖到 `photo-inbox/` 路徑）。
3. 把照片拖進去。**檔名隨便取、中文檔名都行**，可一次傳多張。
4. 下方綠色 **Commit changes**（直接 commit 到 `main`）。
5. 回來跟 Claude 說：**「傳好了」** ＋ 一句話講這些圖要放哪。

## 「放哪」怎麼講（一句話就夠）

不用管尺寸、格式、檔名規則——只要講清楚「哪一張、擺到哪」，例如：

- 「換 **/method** 最上面那張大圖」
- 「加到 **手部保養相簿**（/works/body）最後面」
- 「這是 **《手繞到背後扣不起來》那篇文章** 的配圖」
- 「換 **首頁輪播** 第 2 張」
- 「**課程頁**的橫幅換這張」

一次傳多張時，用檔名或順序標一下對應（「`a.jpg` 換 hero、`b.jpg` 換師傅頭像」）即可。

### 選用：檔名開頭帶用途，可省去解釋

| 開頭範例 | 對應位置 |
|---------|---------|
| `home-slide-*` | 首頁輪播 |
| `method-hero-*` / `method-clinic-*` / `method-laok-*` / `method-train-*` | 招牌頁四張 |
| `works-body-*` / `works-feet-*` | 相簿 |
| `article-<slug>-*` | 某篇 health／news 文章配圖 |
| `services-*` / `courses-*` | 服務／課程頁 banner |

## 給 Claude 的處理備忘（標準流程，勿走捷徑）

1. `git pull` → 在本資料夾找新圖。
2. `cwebp -q 80`（大橫圖加 `-resize 1600 0`；相簿／頭像視情況）輸出到 `public/images/`。
3. 接到對應位置：
   - 頁面固定圖 → 改該 `.astro` 變數＋`alt`（如 `method.astro`）。
   - 首頁輪播 → `src/content/home.md` 的 `slides:`。
   - 相簿 → `src/content/works/<album>.md` 的 `photos:`（`src`＋`caption`）。
   - 文章配圖 → 對應 `.md` 內用 **Markdown 語法** `![alt](/images/xxx)`（禁 raw HTML `<img>`，會 404）。
   - `alt`／`caption` 須符合站台用詞政策（禁詞見 `CLAUDE.md` 與 seo-ops `check-terms` gate）。
4. gate 全過再 push：`npm run build`（已內含 `check-design.mjs` 設計守門）＋`node scripts/check-terms.mjs`。
5. **`git rm` 掉本資料夾的原圖**（原圖不入正式 `public/`，避免重複與肥大），連同頁面改動一起 commit/push。
