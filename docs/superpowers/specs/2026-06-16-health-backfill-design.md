# 健康概念分享回填設計（2023/07 → 2026/06）

- 日期：2026-06-16
- 範圍：`/health` 列表自 2023/07 後無更新，補入 6 篇文章把時間軸帶到 2026/06。
- 方案：**A+C**（A＝YouTube 真實素材回填真實日期；C＝現寫常青衛教文標今日真實日期）。

## 背景與現況

- `src/content/health/*.md` 共 15 篇，最新停在 2023/07/06；2023/08 後空白。
- `src/content/news/*` 其實已同步到 2026/05（鏡像 IG 優惠／案例貼文），**不在本次範圍**。
- 商家社群：YouTube `@KKK0524TW`（channel_id `UCUGnxaVMPnDo1bJmBWKoCSg`）、IG `@cheng_spine_fit_center`、FB `olderk`。
- 已查證：YouTube 頻道最後上片 2025/08/16；IG/FB 無法穩定批次抓取（登入牆），且 IG 衛教貼文多與 news 重疊、內文不顯示日期。故 2025/09–2026/06 不依賴 IG 抓取，改以 C 的常青衛教文涵蓋。

## 誠信原則（YMYL）

1. **真實日期**：A 用 YouTube 實際上片日；C 用撰寫當下的真實日期（2026/06），**不回推假日期**。
2. **不捏造**：不杜撰療效、療程數據、證照或醫療診斷。內容只描述影片所示主題與店家公開講述過的方法（調整＋肌肉發力訓練兩步驟）。
3. **非醫療建議**：CTA 用「歡迎預約評估」，不寫「治療/治癒」字眼。
4. 作者掛名沿用既有具名專家「老K」（由 `articleSchema` 自動帶入，見 `src/lib/site.ts`）。

## 要新增的文章

### Part A — YouTube 影片型（4 篇，真實上片日）

| 檔名（= URL slug） | title | date | YouTube videoId | 主題框架 |
|---|---|---|---|---|
| `spine-care-2024.md` | 脊椎保養：日常如何照顧你的中軸 | 2024/01/08 | `U3GBk1XkFIw` | 脊椎/中軸日常保養 |
| `posture-bride-2024.md` | 虎背熊腰、圓肩體態怎麼改善 | 2024/01/08 | `oKhiKD3KMOM` | 上背圓肩體態 |
| `elbow-2025.md` | 手肘伸不直？談肘關節活動受限 | 2025/02/26 | `-PcTOdEfg60` | 肘關節活動度 |
| `chef-lowback-2025.md` | 久站工作的腰痠怎麼來的 | 2025/08/15 | `imehv8Ws3gQ` | 久站腰部負擔 |

- 不納入 health 的影片：波比跳（`krFk1QkxYiU`）、墨鏡運動（`ettWH3vh4Gs`）、不要檔姐的路（`NpE5s7kSr5M`）＝娛樂型；前往鄭骨館（`msMaAERLER4`）＝路線導引。需要時另歸 news，本案不處理。

### Part C — 常青衛教文（2 篇，現寫，標 2026/06）

| 檔名 | title | date | 內容紮根來源 |
|---|---|---|---|
| `sitting-posture-2026.md` | 久坐族的身體警訊與自我檢測 | 2026/06/12 | 店家久坐主題（胸椎過直、中軸歪斜、肋骨外凸；調整＋訓練維持） |
| `o-leg-training-2026.md` | O型腿、假跨寬：為什麼「喬一喬」不夠，還要訓練 | 2026/06/16 | 店家 O 型腿衛教（結構調整＋肌肉發力訓練兩步驟） |

## 檔案格式（與既有 health 一致）

frontmatter 只寫必要欄位（schema 其餘有預設值；**不寫關鍵字堆砌的 description/keywords**）：

```yaml
---
title: "脊椎保養：日常如何照顧你的中軸"
date: "2024/01/08"
summary: "一句話摘要，會被渲染成 meta description（乾淨、含主題）"
order: 0
---
```

body：
- **A（影片型）**：一段衛教引言（紮根方法、不誇大）＋ YouTube `<iframe>`（外部全網址，不受 base 影響，沿用既有 iframe 寫法）＋ 結尾 hashtags。
- **C（常青型）**：H2 問句結構（利於 AEO）＋ 條列自我檢測／成因／調整與訓練兩步驟＋「歡迎預約評估」CTA。不嵌影片或嵌相關既有影片。

圖片若需要，一律放 `public/images/` 並用 markdown `/images/...` 引用（不用 raw HTML img）。

## 排序變更

- 現況：`src/pages/health/index.astro` 以 `order` 升冪排序。
- 變更：**改為以 `date` 降冪排序**（新→舊）。日期格式 `YYYY/MM/DD` 可直接字串比較。
  ```js
  const articles = (await getCollection("health"))
    .sort((a, b) => (b.data.date || "").localeCompare(a.data.date || ""));
  ```
- 影響：只動 `health/index.astro`，**不動 news**（news 維持 `order`，其日期已於前次確認維持現狀）。
- `order` 欄位：新文章可留 `order: 0`（排序不再依賴它）；既有文章 `order` 保留不刪，無副作用。

## 驗收標準

1. `/health` 列表依日期新→舊排列，最上面是 2026/06 的兩篇 C 文。
2. 6 篇新文章頁可正常開啟；A 的 YouTube `<iframe>` 正常嵌入。
3. 文章頁 `Article` JSON-LD 的 `author` 為具名老K、`datePublished` 正確。
4. `npm run build` 成功、`node scripts/check-fontsize.mjs` 通過。
5. 內容無捏造療效／證照／醫療診斷；CTA 為「預約評估」。
6. 無 raw HTML 圖片連結造成的 base 404。

## 不做（YAGNI）

- 不抓 IG/FB 批次貼文、不改 news、不動既有 15 篇 health 內容。
- 不新增圖片資產（除非某篇確需，屆時走 `public/images/` + markdown）。
- 不改 Person/author schema（已於前次完成）。
