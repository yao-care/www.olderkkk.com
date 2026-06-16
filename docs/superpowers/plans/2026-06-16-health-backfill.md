# 健康概念分享回填 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `/health` 補入 6 篇文章（4 篇 YouTube 影片型用真實上片日、2 篇常青衛教文標 2026/06），並把列表改為依日期降冪排序，把健康概念分享的時間軸從 2023/07 帶到 2026/06。

**Architecture:** 純內容新增（Astro Content Collection `health` 的 markdown）＋ 單行排序變更（`src/pages/health/index.astro`）。文章經既有 `health/[slug].astro` 自動產生 Breadcrumb / Article（具名作者老K）／VideoObject（偵測到 iframe 時）JSON-LD。無新元件、無新依賴。

**Tech Stack:** Astro 6、Content Collections（`src/content.config.ts` 的 `health` schema，僅 `title` 必填）、既有 `health/[slug].astro` 動態頁。驗證用 `npm run build` 與 `node scripts/check-fontsize.mjs`。

**驗證說明（取代 TDD）：** 本專案內容層無單元測試框架。每個任務的「驗證」＝（a）`npm run build` 成功、（b）`check-fontsize` 通過、（c）對 `dist/` 產出做 grep 斷言。內容檔不含 `font-size`，不會觸發字級守門，但仍每次跑以防連帶影響。

---

### Task 1: 健康列表改為依日期降冪排序

**Files:**
- Modify: `src/pages/health/index.astro:6`

- [ ] **Step 1: 修改排序邏輯**

把第 6 行：

```js
const articles = (await getCollection("health")).sort((a, b) => a.data.order - b.data.order);
```

改為（`YYYY/MM/DD` 零填補字串可直接字典序比較，等同時序；空日期排到最後）：

```js
const articles = (await getCollection("health")).sort((a, b) => (b.data.date || "").localeCompare(a.data.date || ""));
```

- [ ] **Step 2: build 驗證**

Run: `npm run build`
Expected: 成功（無錯誤）。此時最新一篇仍是既有 2023/07/06 的「台中西屯—鄭骨館體雕中心」排在最前。

- [ ] **Step 3: 斷言排序正確**

Run: `grep -o 'card__meta[^>]*>[0-9/]*' dist/health/index.html | head -3`
Expected: 第一個日期為 `2023/07/06`（目前最新；新文章尚未加入）。確認排序鍵已是日期。

- [ ] **Step 4: Commit**

```bash
git add src/pages/health/index.astro
git commit -m "feat(health): 列表改依 date 降冪排序"
```

---

### Task 2: 新增 4 篇 YouTube 影片型衛教文（真實上片日）

**Files:**
- Create: `src/content/health/spine-care-2024.md`
- Create: `src/content/health/posture-bride-2024.md`
- Create: `src/content/health/elbow-2025.md`
- Create: `src/content/health/chef-lowback-2025.md`

iframe 格式沿用既有文章（外部全網址，不受 base 影響）。`health/[slug].astro` 會偵測 `youtube.com/embed` 自動加 VideoObject schema。

- [ ] **Step 1: 建立 `spine-care-2024.md`**

```markdown
---
title: "脊椎保養：日常如何照顧你的中軸"
date: "2024/01/08"
summary: "脊椎是支撐全身活動的中軸，日常姿勢與發力習慣會慢慢累積影響；談如何用調理搭配訓練保養脊椎。"
order: 0
---

脊椎是支撐全身活動的中軸。長期姿勢不良、單側施力或久坐久站，都會讓脊椎周邊的張力慢慢失衡，累積成痠、緊、卡的感覺。鄭骨館的做法是先以整復調理放鬆過度緊繃、協助排列回正，再搭配動作矯正與肌力訓練，讓身體學會用正確的方式出力，把保養效果維持住。以下影片分享脊椎保養的觀念：

<iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen="" frameborder="0" height="480" src="https://www.youtube.com/embed/U3GBk1XkFIw" title="脊椎保養：日常如何照顧你的中軸" width="853"></iframe>

#台中整骨#台中整脊#脊椎保養#台中體雕中心
```

- [ ] **Step 2: 建立 `posture-bride-2024.md`**

```markdown
---
title: "虎背熊腰、圓肩體態怎麼改善"
date: "2024/01/08"
summary: "圓肩、上背厚實的「虎背熊腰」多與長期前傾姿勢與上背張力有關；談調整與訓練如何改善體態線條。"
order: 0
---

「虎背熊腰」「圓肩」常讓人覺得體態顯壯、衣服不好看，但背後多半和長時間前傾姿勢、上背與肩胛周邊張力失衡有關，而不只是胖瘦問題。透過調理放鬆過度緊繃的部位、協助肩胛與胸椎排列回正，再以訓練喚醒該出力的肌群，體態線條會慢慢變得自然。以下影片以準新娘的例子分享改善方向：

<iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen="" frameborder="0" height="480" src="https://www.youtube.com/embed/oKhiKD3KMOM" title="虎背熊腰、圓肩體態怎麼改善" width="853"></iframe>

#台中體態調整#圓肩#虎背熊腰#台中體雕中心
```

- [ ] **Step 3: 建立 `elbow-2025.md`**

```markdown
---
title: "手肘伸不直？談肘關節活動受限"
date: "2025/02/26"
summary: "手肘伸不直、卡卡的，常與關節排列與周邊肌肉張力有關；談如何評估與透過調理訓練恢復活動度。"
order: 0
---

手肘伸不直、活動到某個角度就卡住，常讓人擔心是不是受傷。除了急性傷害之外，許多情況和肘關節排列、前臂肌群張力過高或長期使用習慣有關。先釐清活動受限的來源，再以調理放鬆與動作訓練協助恢復正常活動度，是比較全面的處理方式。以下影片示範手肘伸不直的情況：

<iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen="" frameborder="0" height="480" src="https://www.youtube.com/embed/-PcTOdEfg60" title="手肘伸不直？談肘關節活動受限" width="853"></iframe>

#台中整復#肘關節#關節活動度#台中體雕中心
```

- [ ] **Step 4: 建立 `chef-lowback-2025.md`**

```markdown
---
title: "久站工作的腰痠怎麼來的"
date: "2025/08/15"
summary: "廚師等久站久彎腰的工作者特別容易腰痠；談久站腰部負擔的成因與調理訓練對策。"
order: 0
---

廚師、櫃檯、生產線等需要長時間站立或反覆彎腰的工作，腰部承受的負擔遠比想像中大。長期固定姿勢會讓下背與骨盆周邊張力累積，演變成站久就痠、直不起來的狀況。除了調理放鬆與協助排列回正，更重要的是學會用核心與下肢一起分擔負荷，減少腰部單獨硬撐。以下影片以炒菜大廚的例子分享：

<iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen="" frameborder="0" height="480" src="https://www.youtube.com/embed/imehv8Ws3gQ" title="久站工作的腰痠怎麼來的" width="853"></iframe>

#台中腰痛調理#久站#腰痠#台中體雕中心
```

- [ ] **Step 5: build 驗證**

Run: `npm run build && node scripts/check-fontsize.mjs`
Expected: build 成功、字級守門通過。

- [ ] **Step 6: 斷言 4 篇頁面與影片 schema 產出**

Run: `for s in spine-care-2024 posture-bride-2024 elbow-2025 chef-lowback-2025; do echo -n "$s: "; test -f "dist/health/$s/index.html" && grep -o '"@type":"VideoObject"' "dist/health/$s/index.html" | head -1; echo; done`
Expected: 4 篇都存在且各含一個 `"@type":"VideoObject"`（iframe 被偵測）。

- [ ] **Step 7: 斷言作者為具名老K**

Run: `grep -o '"author":{[^}]*}' dist/health/spine-care-2024/index.html | head -1`
Expected: 含 `"@type":"Person","name":"老K"` 與 `#founder` 的 `@id`。

- [ ] **Step 8: Commit**

```bash
git add src/content/health/spine-care-2024.md src/content/health/posture-bride-2024.md src/content/health/elbow-2025.md src/content/health/chef-lowback-2025.md
git commit -m "content(health): 補 4 篇 YouTube 影片型衛教文（真實上片日 2024-2025）"
```

---

### Task 3: 新增 2 篇常青衛教文（標 2026/06 真實日期）

**Files:**
- Create: `src/content/health/sitting-posture-2026.md`
- Create: `src/content/health/o-leg-training-2026.md`

YMYL：H2 問句結構利於 AEO；內容紮根於店家公開講述的方法（調整＋肌肉發力訓練兩步驟）；含「不能取代個別評估」聲明；CTA 用「預約評估」，不寫治療/治癒。

- [ ] **Step 1: 建立 `sitting-posture-2026.md`**

```markdown
---
title: "久坐族的身體警訊與自我檢測"
date: "2026/06/12"
summary: "久坐會悄悄累積胸椎僵硬、中軸歪斜與肋骨外凸等狀況；提供幾個自我留意的警訊與保養觀念。"
order: 0
---

## 久坐為什麼會讓身體慢慢「跑掉」？

久坐的問題很少是突然發生的，而是每天坐著一點一點累積。長時間維持同一姿勢，會讓胸椎變得僵硬、過直，身體中軸逐漸歪斜，有些人甚至出現單側肋骨向外凸的情況。

## 幾個可以自己留意的警訊

- 坐久了背部卡緊、站起來時腰背僵硬
- 肩頸容易痠、上背怎麼樣都放鬆不下來
- 左右肩高度、肋骨外形看起來不太對稱
- 明明沒受傷，痠痛卻變成日常

## 調整與訓練，要一起做

身體的結構可以透過調理回到比較正確的排列，但如果出力與姿勢習慣沒有改變，很快又會回到舊的方式。調理幫助「回正」，訓練幫助「維持」，兩者搭配才會穩定。

## 想了解自己的狀況？

這篇分享的是一般保養觀念，不能取代個別評估。如果你長期久坐又有上述狀況，歡迎預約評估，由教練實際看你的姿勢與出力方式再給建議。

#台中久坐痠痛#姿勢檢測#台中運動矯正#台中體雕中心
```

- [ ] **Step 2: 建立 `o-leg-training-2026.md`**

```markdown
---
title: "O型腿、假跨寬：為什麼「喬一喬」不夠，還要訓練"
date: "2026/06/16"
summary: "O型腿與假跨寬常被以為「喬一喬就會直」，其實結構調整之外更需要肌肉發力訓練才能維持。"
order: 0
---

## 「推一推就會直」是常見的誤會

很多人以為 O 型腿、假跨寬只要調整一下就會立刻變漂亮。結構確實可以調整，但如果身體不會用正確的方式出力，調得再好也會慢慢回到舊的站、走、坐方式。

## 我們會分成兩步處理

### 第一步：結構調整

調整骨盆、髖關節、膝關節與下肢的排列，把卡住、歪掉的結構先回到該在的位置。

### 第二步：肌肉發力訓練（關鍵）

如果內側肌群不會出力、外側過度代償，結構很快又會跑掉。所以會依個人狀況，引導你該怎麼站、怎麼走、哪些肌肉要「醒過來」，讓身體慢慢記住正確的排列方式。

## 你可能也有這些狀況

- O 型腿、走路外八
- 站久膝蓋不舒服
- 假跨寬，褲子腰圍與骨盆很難同時合身
- 沒受傷，腿型卻越來越不對稱

## 想評估看看？

本文為一般衛教觀念，不能取代個別評估或醫療診斷。歡迎預約評估，由教練實際看你的下肢排列與出力方式再給建議。

#台中O型腿#假跨寬#台中骨盆調理#台中體雕中心
```

- [ ] **Step 3: build 驗證**

Run: `npm run build && node scripts/check-fontsize.mjs`
Expected: build 成功、字級守門通過。

- [ ] **Step 4: 斷言 2 篇存在且為 Article（無 VideoObject）**

Run: `for s in sitting-posture-2026 o-leg-training-2026; do echo -n "$s: "; test -f "dist/health/$s/index.html" && grep -o '"@type":"Article"' "dist/health/$s/index.html" | head -1; echo; done`
Expected: 2 篇都存在且各含 `"@type":"Article"`。

- [ ] **Step 5: Commit**

```bash
git add src/content/health/sitting-posture-2026.md src/content/health/o-leg-training-2026.md
git commit -m "content(health): 補 2 篇常青衛教文（2026/06）"
```

---

### Task 4: 整體驗收

**Files:** 無（純驗證）

- [ ] **Step 1: 最終 build 與字級守門**

Run: `npm run build && node scripts/check-fontsize.mjs`
Expected: 都通過。

- [ ] **Step 2: 斷言列表依日期新→舊、最上面是 2026/06 兩篇**

Run: `grep -o 'card__meta[^>]*>[0-9/]*' dist/health/index.html | head -8`
Expected: 依序為 `2026/06/16`、`2026/06/12`、`2025/08/15`、`2025/02/26`、`2024/01/08`、`2024/01/08`、`2023/07/06`、`2023/05/08`（降冪；娛樂片未納入 health 故不出現）。

- [ ] **Step 3: 斷言文章總數 = 21（既有 15 + 新 6）**

Run: `ls src/content/health/*.md | wc -l`
Expected: `21`。

- [ ] **Step 4: 斷言無殘留污染特徵（沿用過往防呆）**

Run: `grep -rl '\.webp\.webp' src/content/health/ 2>/dev/null | wc -l`
Expected: `0`。

- [ ] **Step 5: 視覺確認（preview + 截圖 /health）**

Run: 啟 `npm run preview`，以 playwright 開 `http://localhost:4321/www.olderkkk.com/health/` 截圖，確認列表新文章在最上、版面正常、無破圖。完成後關閉 preview。
Expected: 列表頂部為 2026/06 兩篇，卡片正常。

- [ ] **Step 6: 最終 Commit（如有 preview 產生的暫存則不納入）**

無程式碼變更則略過；前面任務已各自 commit。確認 `git status` 乾淨（除 /tmp 截圖外）。

---

## 完成後（部署）

依使用者指示再決定是否 `git push origin main`（會觸發 GitHub Pages 部署）。push 後可 `curl` 線上 `/health/` 驗證最新兩篇已上線。
