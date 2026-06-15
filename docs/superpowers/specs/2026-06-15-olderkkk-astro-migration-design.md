# olderkkk.com Astro 改版設計

- 日期：2026-06-15
- 專案：www.olderkkk.com（鄭骨館體雕中心，台中西屯，整骨／體雕／課程）
- 目標：將原 PHP 動態網站改版為 Astro 靜態網站，內容 1:1 照搬，外觀套用使用者的 design-tokens 規範（OKLCH 配色 + 最小 18px 字級）

## 已確認決策

1. **複製定位**：內容（文字／圖片／頁面結構）照搬，外觀換成 design-tokens 規範。視覺會與原站不同（配色改 OKLCH、字級套最小 18px），這是規範套用的預期結果。
2. **內容來源**：從線上網站爬取全部公開頁面（無原始碼／資料庫匯出）。
3. **聯絡表單**：移除 PHP 後端表單，改為 LINE（`@275nxace`）／電話（0970686319）／Email CTA。
4. **購物車**：移除（原站購物車為空、無上架商品）。
5. **架構**：方案 A — Content Collections + 原生 Astro 元件，內容與版型分離，無 jQuery 依賴。

## 頁面清單（7 頁）

| 頁面 | 原 URL | 新路由 | 內容型態 |
|------|--------|--------|---------|
| 首頁 | `/` | `/` | 自訂版面（Hero/輪播 + 區塊） |
| 服務項目 | `paper/services_index.php?title_id=293` | `/services` | 內容頁 |
| 課程介紹 | `paper/other_page.php?id=294` | `/courses` | 內容頁 |
| 健康概念分享 | `paper/share_index.php?title_id=295` | `/health` | 內容頁／列表 |
| 成果分享 | `workshow/index.php?title_id=296`（含 group_id 子分類） | `/works`（+ 子分類） | 列表 + 項目 |
| 最新消息 | `paper/promotions_index.php?title_id=297` | `/news` | 列表 + 項目 |
| 聯絡我們 | `paper/contact_index.php?title_id=298` | `/contact` | 資訊 + CTA |

> 已知子分類：成果分享 group_id=4744、group_id=629（擷取時確認完整清單）。

## 專案架構

```
src/
  content/
    pages/          # 單頁內容 MDX：services, courses, health
    works/          # 成果分享，每篇一個 md（含 group 分類欄位）
    news/           # 最新消息，每則一個 md
    config.ts       # Content Collections schema（zod 驗證）
  layouts/
    Base.astro      # HTML 骨架、<head>、SEO meta、全域 CSS 載入
  components/
    Header.astro
    Nav.astro       # 桌面導覽 + 手機選單（取代 mmenu）
    Footer.astro
    SeoKeywords.astro  # 原站 footer 關鍵字區塊照搬
    Hero.astro      # 首頁輪播（取代 flexslider）
    Card.astro      # 列表卡片
    ContactCTA.astro   # LINE／電話／Email
  pages/
    index.astro
    services.astro
    courses.astro
    health.astro
    works/[...].astro
    news/[...].astro
    contact.astro
  styles/
    tokens.css      # design-tokens：OKLCH 變數 + 字級 scale
    global.css      # reset + 基礎排版
public/
  images/           # 下載的原站圖片資產
astro.config.mjs
package.json
```

## 設計系統（design-tokens 規範）

- **配色**：`src/styles/tokens.css` 以 OKLCH 定義
  - 背景 L 0.90–0.97
  - 文字 L 0.20–0.60
  - 語意／嚴重度色 L 0.45–0.55（淺底 WCAG AA 4.5:1+）
  - 每個 OKLCH 變數附 `@supports not (color: oklch())` 的 hex fallback
- **字級**：`--text-xs` = 18px 起跳，xs → 3xl scale；全站**無任何字級低於 18px**
- **不沿用原站樣式**：原 `style.css / menu.css / flexslider.css / product.css` 廢棄，改吃 tokens.css；font-awesome 改用內嵌 SVG 或必要子集

## 互動元件處理（去 jQuery）

| 原站 | 改版作法 |
|------|---------|
| flexslider（jQuery）首頁輪播 | Astro 原生 + 純 CSS `scroll-snap`，無 JS 依賴 |
| mmenu（jQuery）手機選單 | 原生 `<details>`／CSS 漢堡選單 |
| 聯絡表單（PHP `pro_edit.php` + 驗證碼） | 移除，改 ContactCTA（LINE／電話／Email） |
| 購物車 `products/car.php` | 移除 |
| 商品搜尋 `products/index.php` | 移除 |

## 內容擷取流程

1. 用 curl（帶 UA）逐頁抓取 7 頁 HTML
2. 解析正文 HTML → 轉 Markdown／MDX（保留標題、段落、清單、表格、圖片）
3. 下載頁面內所有圖片到 `public/images/`，內文圖片路徑改為本地相對路徑
4. 擷取每頁 SEO 中繼資料：`<title>`、`meta description`、OG 標籤、footer 關鍵字區塊，照搬到對應頁面
5. 逐頁與原站文字比對，確保內容一致

## 不在範圍

- 購物車結帳、金流
- PHP 後端表單收件
- 會員登入（`web_login`）
- 商品搜尋／商品上架

## 驗收標準

- 7 頁文字內容與原站逐頁比對一致
- 全站套用 OKLCH tokens；無任何字級 < 18px
- `npm run build` 無錯誤、輸出純靜態、無 jQuery
- 響應式正常：手機選單可開合、首頁輪播可滑動
- SEO 中繼資料（title／description／OG／關鍵字）與原站一致
