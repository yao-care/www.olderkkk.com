# olderkkk.com Astro 改版 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 將 www.olderkkk.com（PHP 動態站）改版為 Astro 靜態站，7 頁內容 1:1 照搬，外觀套用 design-tokens（OKLCH 配色 + 最小 18px 字級），移除購物車與後端表單。

**Architecture:** Astro + Content Collections（內容與版型分離）。內容用擷取腳本從線上抓取轉成 Markdown/MDX + 本地圖片。版型為原生 Astro 元件，無 jQuery（flexslider→CSS scroll-snap、mmenu→原生 `<details>`）。全站樣式吃單一 `tokens.css`。

**Tech Stack:** Astro 5、@astrojs/mdx、TypeScript、原生 CSS（OKLCH）、Node 內建 fetch（擷取腳本）。

**參考規範：** design-tokens 技能（`colors.md`、`typography.md`）。本計畫已內嵌實際 token 值。

---

## 設計來源資料（擷取階段使用）

頁面對應（原 URL → 路由 → collection）：

| 路由 | 原 URL | 內容容器 | 種類 |
|------|--------|---------|------|
| `/` | `https://www.olderkkk.com/` | 自訂 | 首頁 |
| `/services` | `paper/services_index.php?title_id=293` | `.content` | 單頁 |
| `/courses` | `paper/other_page.php?id=294` | `.content` | 單頁 |
| `/health` | `paper/share_index.php?title_id=295` | `.content` | 單頁 |
| `/works` | `workshow/index.php?title_id=296`（group_id 子分類） | `.content` | 列表 |
| `/news` | `paper/promotions_index.php?title_id=297` | `.content` | 列表 |
| `/contact` | `paper/contact_index.php?title_id=298` | `.content` | 資訊+CTA |

聯絡資訊（首頁與 footer 擷取）：LINE `@275nxace`、電話 `0970686319`、Email `d28281778@gmail.com`、FB `facebook.com/olderk`、Google Maps `goo.gl/maps/5ycqSypugBVycsi4A`。

---

## 檔案結構

```
scripts/extract.mjs        # 內容擷取腳本（一次性，產出 content + 圖片）
src/
  styles/tokens.css        # OKLCH 變數 + 字級 scale
  styles/global.css        # reset + 基礎排版
  content.config.ts        # Content Collections schema (Astro 5)
  content/
    pages/{services,courses,health}.md
    works/*.md
    news/*.md
  layouts/Base.astro
  components/{Header,Nav,Footer,SeoKeywords,Hero,Card,ContactCTA}.astro
  pages/{index,services,courses,health,contact}.astro
  pages/works/[...slug].astro
  pages/news/[...slug].astro
public/images/             # 擷取下載的圖片
scripts/check-fontsize.mjs # 字級守門腳本（CI 用）
astro.config.mjs
```

---

## Task 0：Scaffold Astro 專案

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`（由 create astro 產生）

- [ ] **Step 1：建立 Astro 專案於現有目錄**

Run（目前目錄已含 docs/ 與 git，用空白模板就地建立）：
```bash
cd /Users/lightman/yao.care/www.olderkkk.com
npm create astro@latest . -- --template minimal --no-install --no-git --typescript strict --yes
```
若提示目錄非空，選擇繼續（保留 docs/、.git、.gitignore）。

- [ ] **Step 2：安裝依賴與 MDX 整合**

Run：
```bash
npm install
npx astro add mdx --yes
```

- [ ] **Step 3：驗證 build 可跑**

Run：`npm run build`
Expected：build 成功，產出 `dist/`（此時僅預設首頁）。

- [ ] **Step 4：Commit**

```bash
git add -A
git commit -m "chore: scaffold Astro project with MDX"
```

---

## Task 1：Design tokens 與全域樣式

**Files:**
- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`
- Create: `scripts/check-fontsize.mjs`

- [ ] **Step 1：寫字級守門腳本（先寫測試）**

Create `scripts/check-fontsize.mjs`：
```js
// 掃描 src/ 下所有 css/astro，找出 font-size 使用 px 且 < 18 的宣告，違規則 exit 1。
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = "src";
const exts = new Set([".css", ".astro"]);
const violations = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (exts.has(extname(p))) scan(p);
  }
}
function scan(file) {
  const text = readFileSync(file, "utf8");
  const re = /font-size\s*:\s*([0-9.]+)px/gi;
  let m;
  while ((m = re.exec(text))) {
    if (parseFloat(m[1]) < 18) violations.push(`${file}: font-size ${m[1]}px`);
  }
}
walk(ROOT);
if (violations.length) {
  console.error("字級違規（< 18px）：\n" + violations.join("\n"));
  process.exit(1);
}
console.log("字級檢查通過：無 < 18px 宣告。");
```

- [ ] **Step 2：執行守門腳本確認可運作**

Run：`node scripts/check-fontsize.mjs`
Expected：PASS「字級檢查通過」（此時 src 尚無違規）。

- [ ] **Step 3：寫 tokens.css（OKLCH + hex fallback + 字級）**

Create `src/styles/tokens.css`：
```css
:root {
  /* 背景層級 */
  --bg-base: #f5f6f8;
  --bg-surface: #ecedf0;
  --bg-overlay: #dfe0e5;
  --bg-hover: #e5e6ea;
  /* 文字層級 */
  --text-primary: #1e2030;
  --text-secondary: #5e6070;
  --text-muted: #8a8c98;
  /* 功能色 */
  --color-link: #1e5ab8;
  --color-pass: #1e8050;
  --color-critical: #c93135;
  /* 邊框 */
  --border-subtle: #d5d6da;
  /* 字級量表（最小 18px） */
  --text-xs: 1.125rem;  /* 18px */
  --text-sm: 1.25rem;   /* 20px */
  --text-base: 1.5rem;  /* 24px */
  --text-lg: 1.75rem;   /* 28px */
  --text-xl: 2rem;      /* 32px */
  --text-2xl: 3rem;     /* 48px */
  --text-3xl: 3.5rem;   /* 56px */
  /* 字型與行高 */
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "PingFang TC", "Microsoft JhengHei", sans-serif;
  --leading: 1.6;
}
@supports (color: oklch(0.5 0.1 250)) {
  :root {
    --bg-base: oklch(0.97 0.005 250);
    --bg-surface: oklch(0.94 0.005 250);
    --bg-overlay: oklch(0.90 0.008 250);
    --bg-hover: oklch(0.92 0.005 250);
    --text-primary: oklch(0.20 0.01 250);
    --text-secondary: oklch(0.45 0.01 250);
    --text-muted: oklch(0.60 0.008 250);
    --color-link: oklch(0.48 0.15 250);
    --color-pass: oklch(0.48 0.16 150);
    --color-critical: oklch(0.55 0.22 25);
    --border-subtle: oklch(0.85 0.005 250);
  }
}
```

- [ ] **Step 4：寫 global.css（reset + 基礎排版）**

Create `src/styles/global.css`：
```css
@import "./tokens.css";

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: 100%; }
body {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: var(--leading);
  color: var(--text-primary);
  background: var(--bg-base);
  -webkit-font-smoothing: antialiased;
}
h1 { font-size: var(--text-3xl); font-weight: 700; }
h2 { font-size: var(--text-xl); font-weight: 700; }
h3 { font-size: var(--text-lg); font-weight: 700; }
small, .fs-xs { font-size: var(--text-xs); }
a { color: var(--color-link); text-decoration: none; }
a:hover { text-decoration: underline; }
img { max-width: 100%; height: auto; display: block; }
.container { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; }
```

- [ ] **Step 5：再跑守門腳本確認 tokens/global 無違規**

Run：`node scripts/check-fontsize.mjs`
Expected：PASS。

- [ ] **Step 6：Commit**

```bash
git add src/styles scripts/check-fontsize.mjs
git commit -m "feat: add OKLCH design tokens and font-size guard"
```

---

## Task 2：Base 版面與 SEO

**Files:**
- Create: `src/layouts/Base.astro`

- [ ] **Step 1：寫 Base.astro**

Create `src/layouts/Base.astro`：
```astro
---
import "../styles/global.css";
import Header from "../components/Header.astro";
import Footer from "../components/Footer.astro";

interface Props {
  title: string;
  description?: string;
  keywords?: string;
}
const { title, description = "", keywords = "" } = Astro.props;
---
<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    {description && <meta name="description" content={description} />}
    {keywords && <meta name="keywords" content={keywords} />}
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <link rel="icon" href="/favicon.ico" />
  </head>
  <body>
    <Header />
    <main class="container"><slot /></main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 2：Commit**（Header/Footer 尚未建立，下一 Task 完成後一起 build）

```bash
git add src/layouts/Base.astro
git commit -m "feat: add Base layout with SEO meta"
```

---

## Task 3：Header / Nav / Footer / SeoKeywords 元件

**Files:**
- Create: `src/components/Header.astro`, `Nav.astro`, `Footer.astro`, `SeoKeywords.astro`

- [ ] **Step 1：寫 Nav.astro（桌面 + 手機 `<details>`，無 jQuery）**

Create `src/components/Nav.astro`：
```astro
---
const links = [
  { href: "/", label: "首頁" },
  { href: "/services", label: "服務項目" },
  { href: "/courses", label: "課程介紹" },
  { href: "/health", label: "健康概念分享" },
  { href: "/works", label: "成果分享" },
  { href: "/news", label: "最新消息" },
  { href: "/contact", label: "聯絡我們" },
];
const path = Astro.url.pathname;
---
<nav class="nav">
  <ul class="nav__list">
    {links.map((l) => (
      <li><a href={l.href} aria-current={path === l.href ? "page" : undefined}>{l.label}</a></li>
    ))}
  </ul>
  <details class="nav__mobile">
    <summary aria-label="選單">☰</summary>
    <ul>
      {links.map((l) => <li><a href={l.href}>{l.label}</a></li>)}
    </ul>
  </details>
</nav>
<style>
  .nav__list { display: flex; gap: 1.5rem; list-style: none; }
  .nav__list a { font-size: var(--text-base); color: var(--text-primary); }
  .nav__list a[aria-current="page"] { color: var(--color-link); font-weight: 700; }
  .nav__mobile { display: none; }
  .nav__mobile summary { font-size: var(--text-xl); cursor: pointer; list-style: none; }
  .nav__mobile ul { list-style: none; padding: 1rem 0; }
  .nav__mobile li { padding: 0.5rem 0; }
  @media (max-width: 768px) {
    .nav__list { display: none; }
    .nav__mobile { display: block; }
  }
</style>
```

- [ ] **Step 2：寫 Header.astro**

Create `src/components/Header.astro`：
```astro
---
import Nav from "./Nav.astro";
---
<header class="header">
  <div class="container header__inner">
    <a href="/" class="header__brand">鄭骨館體雕中心</a>
    <Nav />
  </div>
</header>
<style>
  .header { background: var(--bg-surface); border-bottom: 1px solid var(--border-subtle); }
  .header__inner { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.5rem; }
  .header__brand { font-size: var(--text-lg); font-weight: 700; color: var(--text-primary); }
</style>
```

- [ ] **Step 3：寫 SeoKeywords.astro（原站 footer 關鍵字區塊，擷取後填入）**

Create `src/components/SeoKeywords.astro`：
```astro
---
interface Props { keywords: string[]; }
const { keywords } = Astro.props;
---
<div class="seo-keywords">
  {keywords.map((k) => <span>{k}</span>)}
</div>
<style>
  .seo-keywords { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1rem; }
  .seo-keywords span { font-size: var(--text-xs); color: var(--text-muted); }
</style>
```

- [ ] **Step 4：寫 Footer.astro**

Create `src/components/Footer.astro`：
```astro
---
import SeoKeywords from "./SeoKeywords.astro";
// 關鍵字陣列於擷取階段（Task 4）由 site meta 填入；先放代表性清單，擷取後更新。
const keywords = ["台中整骨", "台中整骨推薦", "台中整脊", "西屯整脊", "台中整復", "體雕中心"];
---
<footer class="footer">
  <div class="container">
    <p>鄭骨館體雕中心 · 台中市西屯區</p>
    <p>電話 <a href="tel:0970686319">0970686319</a> · Email <a href="mailto:d28281778@gmail.com">d28281778@gmail.com</a></p>
    <SeoKeywords keywords={keywords} />
  </div>
</footer>
<style>
  .footer { background: var(--bg-overlay); border-top: 1px solid var(--border-subtle); padding: 2rem 0; margin-top: 3rem; }
  .footer p { font-size: var(--text-sm); color: var(--text-secondary); }
</style>
```

- [ ] **Step 5：暫時首頁套 Base 驗證 build**

暫改 `src/pages/index.astro`：
```astro
---
import Base from "../layouts/Base.astro";
---
<Base title="鄭骨館體雕中心" description="台中整骨整脊體雕">
  <h1>鄭骨館體雕中心</h1>
</Base>
```
Run：`npm run build`
Expected：build 成功，header/footer 正常 render。

- [ ] **Step 6：Commit**

```bash
git add src/components src/pages/index.astro
git commit -m "feat: add Header, Nav, Footer, SeoKeywords components"
```

---

## Task 4：內容擷取腳本

**Files:**
- Create: `scripts/extract.mjs`
- Output: `src/content/pages/*.md`、`src/content/works/*.md`、`src/content/news/*.md`、`public/images/*`

- [ ] **Step 1：寫 extract.mjs**

Create `scripts/extract.mjs`：
```js
// 從線上抓取 7 頁，解析 .content 區塊，下載圖片到 public/images，
// 將文字+圖片路徑寫成 Markdown + frontmatter。
// 依賴：node-html-parser、turndown（HTML→Markdown）。
import { parse } from "node-html-parser";
import TurndownService from "turndown";
import { mkdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36";
const BASE = "https://www.olderkkk.com";
const td = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" });

const PAGES = [
  { slug: "services", path: "/paper/services_index.php?title_id=293", col: "pages" },
  { slug: "courses",  path: "/paper/other_page.php?id=294",         col: "pages" },
  { slug: "health",   path: "/paper/share_index.php?title_id=295",   col: "pages" },
  { slug: "works",    path: "/workshow/index.php?title_id=296",      col: "works-index" },
  { slug: "news",     path: "/paper/promotions_index.php?title_id=297", col: "news-index" },
  { slug: "contact",  path: "/paper/contact_index.php?title_id=298",  col: "pages" },
  { slug: "home",     path: "/",                                      col: "home" },
];

mkdirSync("public/images", { recursive: true });
mkdirSync("src/content/pages", { recursive: true });
mkdirSync("src/content/works", { recursive: true });
mkdirSync("src/content/news", { recursive: true });

async function fetchHtml(url) {
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return await r.text();
}
async function downloadImage(src) {
  const abs = src.startsWith("http") ? src : BASE + (src.startsWith("/") ? src : "/" + src);
  const ext = (abs.split("?")[0].match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) || [".jpg"])[0];
  const name = createHash("md5").update(abs).digest("hex").slice(0, 12) + ext;
  const local = `public/images/${name}`;
  try {
    const r = await fetch(abs, { headers: { "User-Agent": UA } });
    if (r.ok) { writeFileSync(local, Buffer.from(await r.arrayBuffer())); return `/images/${name}`; }
  } catch {}
  return abs; // 失敗則保留原 URL
}
function meta(root, name) {
  const el = root.querySelector(`meta[name="${name}"]`);
  return el ? el.getAttribute("content") || "" : "";
}

for (const p of PAGES) {
  const html = await fetchHtml(BASE + p.path);
  const root = parse(html);
  const title = (root.querySelector("title")?.text || "").trim();
  const description = meta(root, "description");
  const keywords = meta(root, "keywords");
  const content = root.querySelector(".content") || root.querySelector("#page") || root;

  // 下載並改寫圖片路徑
  for (const img of content.querySelectorAll("img")) {
    const src = img.getAttribute("src");
    if (src) img.setAttribute("src", await downloadImage(src));
  }
  const md = td.turndown(content.innerHTML);
  const fm = [
    "---",
    `title: ${JSON.stringify(title)}`,
    `description: ${JSON.stringify(description)}`,
    `keywords: ${JSON.stringify(keywords)}`,
    `sourcePath: ${JSON.stringify(p.path)}`,
    "---",
    "",
    md,
    "",
  ].join("\n");

  const dir = p.col === "works-index" ? "src/content/works"
            : p.col === "news-index" ? "src/content/news"
            : p.col === "home" ? "src/content" : "src/content/pages";
  writeFileSync(`${dir}/${p.slug}.md`, fm);
  console.log(`✓ ${p.slug} (${md.length} chars)`);
}
console.log("擷取完成。請人工檢視 src/content/ 內容並與原站比對。");
```

- [ ] **Step 2：安裝擷取依賴**

Run：`npm install -D node-html-parser turndown`

- [ ] **Step 3：執行擷取**

Run：`node scripts/extract.mjs`
Expected：印出 7 個 `✓ <slug>`，`src/content/` 出現 md、`public/images/` 出現圖片。

- [ ] **Step 4：人工檢視與比對**

逐一打開 `src/content/pages/services.md` 等，對照原站頁面確認文字無缺漏；`works`/`news` 若有多筆項目，依需要拆成多檔（腳本目前每頁一檔，列表內項目保留在同檔內）。修正擷取漏抓的圖片或內容。

- [ ] **Step 5：Commit**

```bash
git add scripts/extract.mjs src/content public/images package.json package-lock.json
git commit -m "feat: add content extraction script and extracted content"
```

---

## Task 5：Content Collections schema

**Files:**
- Create: `src/content.config.ts`

- [ ] **Step 1：寫 content.config.ts**

Create `src/content.config.ts`：
```ts
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const seo = {
  title: z.string(),
  description: z.string().default(""),
  keywords: z.string().default(""),
  sourcePath: z.string().optional(),
};

const pages = defineCollection({
  loader: glob({ pattern: "*.md", base: "src/content/pages" }),
  schema: z.object(seo),
});
const works = defineCollection({
  loader: glob({ pattern: "*.md", base: "src/content/works" }),
  schema: z.object({ ...seo, group: z.string().optional() }),
});
const news = defineCollection({
  loader: glob({ pattern: "*.md", base: "src/content/news" }),
  schema: z.object({ ...seo, date: z.string().optional() }),
});

export const collections = { pages, works, news };
```

- [ ] **Step 2：驗證 collections 載入**

Run：`npm run build`
Expected：build 成功，無 schema 驗證錯誤（若 frontmatter 不符，依錯誤訊息修正擷取產物）。

- [ ] **Step 3：Commit**

```bash
git add src/content.config.ts
git commit -m "feat: define content collections schema"
```

---

## Task 6：單頁渲染（services / courses / health）

**Files:**
- Create: `src/pages/services.astro`, `src/pages/courses.astro`, `src/pages/health.astro`

- [ ] **Step 1：寫 services.astro**

Create `src/pages/services.astro`：
```astro
---
import { getEntry, render } from "astro:content";
import Base from "../layouts/Base.astro";
const entry = await getEntry("pages", "services");
const { Content } = await render(entry);
---
<Base title={entry.data.title} description={entry.data.description} keywords={entry.data.keywords}>
  <h1>{entry.data.title}</h1>
  <article class="prose"><Content /></article>
</Base>
<style>
  .prose :global(p) { font-size: var(--text-base); margin: 1rem 0; }
  .prose :global(h2) { margin: 2rem 0 1rem; }
  .prose :global(img) { border-radius: 8px; margin: 1rem 0; }
</style>
```

- [ ] **Step 2：寫 courses.astro 與 health.astro**

Create `src/pages/courses.astro`（同 services.astro，將兩處 `"services"` 改為 `"courses"`）：
```astro
---
import { getEntry, render } from "astro:content";
import Base from "../layouts/Base.astro";
const entry = await getEntry("pages", "courses");
const { Content } = await render(entry);
---
<Base title={entry.data.title} description={entry.data.description} keywords={entry.data.keywords}>
  <h1>{entry.data.title}</h1>
  <article class="prose"><Content /></article>
</Base>
<style>
  .prose :global(p) { font-size: var(--text-base); margin: 1rem 0; }
  .prose :global(h2) { margin: 2rem 0 1rem; }
  .prose :global(img) { border-radius: 8px; margin: 1rem 0; }
</style>
```

Create `src/pages/health.astro`（同上，將兩處改為 `"health"`）：
```astro
---
import { getEntry, render } from "astro:content";
import Base from "../layouts/Base.astro";
const entry = await getEntry("pages", "health");
const { Content } = await render(entry);
---
<Base title={entry.data.title} description={entry.data.description} keywords={entry.data.keywords}>
  <h1>{entry.data.title}</h1>
  <article class="prose"><Content /></article>
</Base>
<style>
  .prose :global(p) { font-size: var(--text-base); margin: 1rem 0; }
  .prose :global(h2) { margin: 2rem 0 1rem; }
  .prose :global(img) { border-radius: 8px; margin: 1rem 0; }
</style>
```

- [ ] **Step 3：驗證 build 並開 dev 檢視**

Run：`npm run build && npm run preview`
Expected：`/services`、`/courses`、`/health` 顯示對應內容與圖片。

- [ ] **Step 4：Commit**

```bash
git add src/pages/services.astro src/pages/courses.astro src/pages/health.astro
git commit -m "feat: render services/courses/health pages from collections"
```

---

## Task 7：列表頁（works / news）

**Files:**
- Create: `src/pages/works/[...slug].astro`, `src/pages/news/[...slug].astro`
- Create: `src/components/Card.astro`

> 說明：擷取階段每個 collection 目前可能為單一索引檔。若 works/news 含多筆項目，於 Task 4 Step 4 已拆成多檔；此 Task 同時產生「列表頁」(`/works`, `/news`) 與「項目頁」(`/works/<slug>`)。若只有單檔，列表頁即顯示該檔內容。

- [ ] **Step 1：寫 Card.astro**

Create `src/components/Card.astro`：
```astro
---
interface Props { href: string; title: string; excerpt?: string; image?: string; }
const { href, title, excerpt = "", image } = Astro.props;
---
<a class="card" href={href}>
  {image && <img src={image} alt={title} />}
  <h3>{title}</h3>
  {excerpt && <p>{excerpt}</p>}
</a>
<style>
  .card { display: block; background: var(--bg-surface); border: 1px solid var(--border-subtle);
    border-radius: 8px; padding: 1rem; color: var(--text-primary); }
  .card:hover { background: var(--bg-hover); text-decoration: none; }
  .card h3 { font-size: var(--text-lg); margin: 0.5rem 0; }
  .card p { font-size: var(--text-sm); color: var(--text-secondary); }
</style>
```

- [ ] **Step 2：寫 works/[...slug].astro（列表 + 項目）**

Create `src/pages/works/[...slug].astro`：
```astro
---
import { getCollection, getEntry, render } from "astro:content";
import Base from "../../layouts/Base.astro";
import Card from "../../components/Card.astro";

export async function getStaticPaths() {
  const items = await getCollection("works");
  // 列表頁：slug 為 undefined；項目頁：每筆一頁
  const paths = [{ params: { slug: undefined }, props: { list: true } }];
  for (const it of items) paths.push({ params: { slug: it.id }, props: { list: false, id: it.id } });
  return paths;
}
const { list, id } = Astro.props;
let entry = null, Content = null, items = [];
if (list) {
  items = await getCollection("works");
} else {
  entry = await getEntry("works", id);
  ({ Content } = await render(entry));
}
---
{list ? (
  <Base title="成果分享-鄭骨館體雕中心" description="成果分享">
    <h1>成果分享</h1>
    <div class="grid">
      {items.map((it) => <Card href={`/works/${it.id}`} title={it.data.title} />)}
    </div>
  </Base>
) : (
  <Base title={entry.data.title} description={entry.data.description} keywords={entry.data.keywords}>
    <h1>{entry.data.title}</h1>
    <article class="prose"><Content /></article>
  </Base>
)}
<style>
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.5rem; }
  .prose :global(p) { font-size: var(--text-base); margin: 1rem 0; }
  .prose :global(img) { border-radius: 8px; margin: 1rem 0; }
</style>
```

- [ ] **Step 3：寫 news/[...slug].astro**

Create `src/pages/news/[...slug].astro`（結構同 works，將 `"works"`→`"news"`、`/works/`→`/news/`、標題改「最新消息」）：
```astro
---
import { getCollection, getEntry, render } from "astro:content";
import Base from "../../layouts/Base.astro";
import Card from "../../components/Card.astro";

export async function getStaticPaths() {
  const items = await getCollection("news");
  const paths = [{ params: { slug: undefined }, props: { list: true } }];
  for (const it of items) paths.push({ params: { slug: it.id }, props: { list: false, id: it.id } });
  return paths;
}
const { list, id } = Astro.props;
let entry = null, Content = null, items = [];
if (list) {
  items = await getCollection("news");
} else {
  entry = await getEntry("news", id);
  ({ Content } = await render(entry));
}
---
{list ? (
  <Base title="最新消息-鄭骨館體雕中心" description="最新消息">
    <h1>最新消息</h1>
    <div class="grid">
      {items.map((it) => <Card href={`/news/${it.id}`} title={it.data.title} />)}
    </div>
  </Base>
) : (
  <Base title={entry.data.title} description={entry.data.description} keywords={entry.data.keywords}>
    <h1>{entry.data.title}</h1>
    <article class="prose"><Content /></article>
  </Base>
)}
<style>
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.5rem; }
  .prose :global(p) { font-size: var(--text-base); margin: 1rem 0; }
  .prose :global(img) { border-radius: 8px; margin: 1rem 0; }
</style>
```

- [ ] **Step 4：驗證 build**

Run：`npm run build`
Expected：`/works`、`/news` 列表與各項目頁皆產生。

- [ ] **Step 5：Commit**

```bash
git add src/pages/works src/pages/news src/components/Card.astro
git commit -m "feat: render works/news list and item pages"
```

---

## Task 8：聯絡頁與 ContactCTA

**Files:**
- Create: `src/components/ContactCTA.astro`, `src/pages/contact.astro`

- [ ] **Step 1：寫 ContactCTA.astro**

Create `src/components/ContactCTA.astro`：
```astro
---
const line = "https://line.me/R/ti/p/%40275nxace";
const tel = "0970686319";
const mail = "d28281778@gmail.com";
const map = "https://goo.gl/maps/5ycqSypugBVycsi4A";
---
<div class="cta">
  <a class="cta__btn cta__btn--line" href={line}>加 LINE 諮詢</a>
  <a class="cta__btn" href={`tel:${tel}`}>撥打電話 {tel}</a>
  <a class="cta__btn" href={`mailto:${mail}`}>寄 Email</a>
  <a class="cta__btn" href={map}>查看地圖</a>
</div>
<style>
  .cta { display: flex; flex-wrap: wrap; gap: 1rem; margin: 1.5rem 0; }
  .cta__btn { font-size: var(--text-base); padding: 0.75rem 1.5rem; border-radius: 8px;
    background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-primary); }
  .cta__btn:hover { background: var(--bg-hover); text-decoration: none; }
  .cta__btn--line { background: var(--color-pass); color: #fff; border-color: transparent; }
</style>
```

- [ ] **Step 2：寫 contact.astro（內容照搬 + CTA 取代表單）**

Create `src/pages/contact.astro`：
```astro
---
import { getEntry, render } from "astro:content";
import Base from "../layouts/Base.astro";
import ContactCTA from "../components/ContactCTA.astro";
const entry = await getEntry("pages", "contact");
const { Content } = await render(entry);
---
<Base title={entry.data.title} description={entry.data.description} keywords={entry.data.keywords}>
  <h1>聯絡我們</h1>
  <article class="prose"><Content /></article>
  <ContactCTA />
</Base>
<style>
  .prose :global(p) { font-size: var(--text-base); margin: 1rem 0; }
  .prose :global(form) { display: none; } /* 原站表單若被擷取進來則隱藏，改用 CTA */
</style>
```

- [ ] **Step 3：驗證 build**

Run：`npm run build`
Expected：`/contact` 顯示資訊與 CTA，無可送出的表單。

- [ ] **Step 4：Commit**

```bash
git add src/components/ContactCTA.astro src/pages/contact.astro
git commit -m "feat: add contact page with LINE/phone/email CTA"
```

---

## Task 9：首頁（Hero 輪播 + 區塊）

**Files:**
- Create: `src/components/Hero.astro`, `src/pages/index.astro`（覆寫 Task 3 暫存版）

- [ ] **Step 1：寫 Hero.astro（CSS scroll-snap 輪播，無 JS）**

Create `src/components/Hero.astro`：
```astro
---
interface Props { slides: { image: string; alt?: string }[]; }
const { slides } = Astro.props;
---
<div class="hero">
  {slides.map((s) => <img src={s.image} alt={s.alt ?? ""} />)}
</div>
<style>
  .hero { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; gap: 0; border-radius: 12px; }
  .hero img { flex: 0 0 100%; scroll-snap-align: start; object-fit: cover; max-height: 480px; }
</style>
```

- [ ] **Step 2：取得首頁輪播圖**

首頁輪播圖已於 Task 4 擷取（`src/content/home.md` 內含 img 路徑，或 `public/images/`）。從 `home.md` 取出輪播圖路徑清單，填入下一步 `slides`。

- [ ] **Step 3：寫 index.astro**

Create `src/pages/index.astro`（覆寫）：
```astro
---
import { getEntry, render } from "astro:content";
import Base from "../layouts/Base.astro";
import Hero from "../components/Hero.astro";
import ContactCTA from "../components/ContactCTA.astro";
const entry = await getEntry("home", "home");
const { Content } = await render(entry);
// slides：填入 Task 4 擷取到的首頁輪播圖路徑
const slides = [
  // { image: "/images/xxxx.jpg", alt: "鄭骨館體雕中心" },
];
---
<Base title={entry.data.title} description={entry.data.description} keywords={entry.data.keywords}>
  {slides.length > 0 && <Hero slides={slides} />}
  <article class="prose"><Content /></article>
  <ContactCTA />
</Base>
<style>
  .prose :global(p) { font-size: var(--text-base); margin: 1rem 0; }
  .prose :global(img) { border-radius: 8px; margin: 1rem 0; }
</style>
```

> 註：`home` collection 需在 `content.config.ts` 補定義（loader 指向 `src/content`，pattern `home.md`）。於本步驟一併加入：
```ts
const home = defineCollection({
  loader: glob({ pattern: "home.md", base: "src/content" }),
  schema: z.object(seo),
});
// 並在 export 的 collections 物件加入 home
```

- [ ] **Step 4：驗證 build 並檢視首頁**

Run：`npm run build && npm run preview`
Expected：首頁顯示輪播（可橫向滑動）、內容區塊、CTA。

- [ ] **Step 5：Commit**

```bash
git add src/components/Hero.astro src/pages/index.astro src/content.config.ts
git commit -m "feat: build home page with CSS scroll-snap hero"
```

---

## Task 10：最終驗收

**Files:**
- 無新增；執行驗證

- [ ] **Step 1：字級守門**

Run：`node scripts/check-fontsize.mjs`
Expected：PASS，無 < 18px。

- [ ] **Step 2：確認無 jQuery / flexslider / mmenu 殘留**

Run：`grep -rinE "jquery|flexslider|mmenu" src/ public/ astro.config.mjs || echo "OK: 無殘留"`
Expected：`OK: 無殘留`。

- [ ] **Step 3：完整 build**

Run：`npm run build`
Expected：成功，`dist/` 含 `/`, `/services`, `/courses`, `/health`, `/works`, `/news`, `/contact` 及項目頁。

- [ ] **Step 4：內容比對**

逐頁開 `npm run preview` 與原站對照：7 頁文字內容一致、圖片正常顯示、SEO title/description/keywords 與原站相符。記錄任何缺漏並回到 Task 4 修正擷取。

- [ ] **Step 5：響應式檢查**

於瀏覽器縮到 ≤768px：手機 `<details>` 選單可開合、首頁輪播可滑動、版面不破。

- [ ] **Step 6：最終 commit**

```bash
git add -A
git commit -m "chore: final verification for olderkkk Astro migration"
```

---

## Self-Review 對照

- **Spec 7 頁** → Task 6（services/courses/health）、Task 7（works/news）、Task 8（contact）、Task 9（home）全覆蓋。
- **OKLCH + 字級** → Task 1（tokens.css + 守門腳本），Task 10 Step 1 驗收。
- **內容照搬 + 圖片本地化** → Task 4 擷取腳本，Task 10 Step 4 比對。
- **去 jQuery（flexslider/mmenu）** → Task 3 Nav（`<details>`）、Task 9 Hero（scroll-snap），Task 10 Step 2 驗收。
- **聯絡表單→CTA、移除購物車** → Task 8（ContactCTA、隱藏表單）；購物車自始不建立。
- **SEO meta** → Task 2 Base、Task 4 擷取 title/description/keywords、Task 10 Step 4 比對。
