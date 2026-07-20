# 📥 照片收件夾（photo-inbox）

**站主上傳原圖的地方。** 把新照片丟進這個資料夾，Claude 會 pull 下來自動處理
（轉 WebP → 放進 `public/images/` → 換到對應頁面 → 過 gate → 上線），
處理完會把這裡的原圖清掉。

> 這個資料夾不在 `public/`／`src/` 底下，**不會被 build 打包、不會上線**，
> 純粹當「進料暫存區」。

## 怎麼上傳（GitHub 網頁，手機電腦都行）

1. 打開 repo：<https://github.com/yao-care/www.olderkkk.com>
2. 點進 **`photo-inbox`** 資料夾 → 右上 **Add file → Upload files**
   （或直接在 repo 首頁 **Add file → Upload files**，把檔案拖到 `photo-inbox/` 路徑）。
3. 把新照片拖進去。**檔名隨便取沒關係**，中文檔名也行。
4. 下方 **Commit changes**（直接 commit 到 `main` 即可）。
5. 回來跟 Claude 說一聲：**「傳好了」** ＋ 這張要換頁面上的哪一張。

## 命名小撇步（非必須）

檔名開頭寫用途，Claude 一眼就知道要換哪張，你就不用再解釋：

| 開頭 | 對應 /method 頁位置 |
|------|--------------------|
| `hero-xxx.jpg`   | 最上方大圖（師傅帶客人做運動矯正） |
| `clinic-xxx.jpg` | 中段寬圖（診療空間／中軸定位床環境） |
| `laok-xxx.jpg`   | 鄭師傅頭像（方形） |
| `train-xxx.jpg`  | 下方寬圖（一對一訓練） |

其它頁面的照片也一樣丟這裡，講一下要放哪頁哪個位置就行。

## 給 Claude 的處理備忘

- pull 後在本資料夾找新圖 → `cwebp -q 80`（大圖加 `-resize 1600 0`）輸出到 `public/images/`，
  沿用既有 hash 式命名或語意檔名皆可。
- 更新對應頁面變數＋`alt`（`alt` 須符合站台用詞政策，禁詞見 `CLAUDE.md` 與 seo-ops gate）。
- **處理完把本資料夾的原圖 `git rm` 掉**（原圖不入正式 `public/`，避免重複與肥大）。
- gate：`npm run build`＋`node scripts/check-fontsize.mjs`＋`node scripts/check-terms.mjs` 全過再 push。
