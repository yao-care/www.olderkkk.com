// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const REPO = dirname(fileURLToPath(import.meta.url));

/**
 * sitemap 的 lastmod 取自該頁原始檔的 **最後一次 git commit 日期**，不是建置時間。
 *
 * 為什麼要有（2026-08-11 站主回報：Google 上顯示的招牌頁文案是 7 月中的舊版）：
 * 該頁 7/19 改過三次，Google 最後一次爬取卻停在 7/16，之後 26 天沒回來。sitemap 當時
 * 每一條都只有 changefreq，沒有任何時間戳 → 搜尋引擎沒有線索知道哪一頁真的變了，
 * 每天重新提交的 sitemap 對它來說內容完全相同。
 *
 * 為什麼不用建置時間：那會讓每次建置都宣稱全站都更新了。假訊號多了以後，這個欄位
 * 就再也不會被當一回事，真的改版那次也跟著被埋掉。
 *
 * 只看該頁自己的原始檔，**不把共用版型/元件的異動算進來**：那會把全站 65 頁的日期一起拉到
 * 同一天（實測共用檔一次改動就蓋掉 60 頁的個別日期），而搜尋引擎要的正是「哪一頁真的變了」。
 * 版型微調本來就不該宣稱內容更新——每天的 sitemap 重新提交機制另外會處理網址增減。
 * ⚠️ CI 的 checkout 必須 fetch-depth: 0；淺 clone 只有一個 commit，會讓全站日期一起變成
 * 最後那次 push，等於退回建置時間的假訊號（deploy.yml 已一併設定）。
 * ⚠️ 未 commit 的改動不會反映在 lastmod——改完要讓搜尋引擎知道，就得 commit。
 */
const gitDate = (paths) => {
  let newest = null;
  for (const p of paths) {
    if (!existsSync(join(REPO, p))) continue;
    try {
      const d = execFileSync('git', ['log', '-1', '--format=%cI', '--', p], { cwd: REPO, encoding: 'utf8' }).trim();
      if (d && (!newest || d > newest)) newest = d;
    } catch { /* 不是 git checkout 或該檔無 commit：略過，退化成沒有 lastmod */ }
  }
  return newest;
};

/** 站內路徑（無結尾斜線，首頁為 '/'）→ 可能的原始檔清單 */
const sourceFor = (path) => {
  const p = path.replace(/^\//, '');
  if (p === '') return ['src/content/home.md', 'src/pages/index.astro'];
  const coll = p.match(/^(health|news|works)\/(.+)$/);
  const cands = [];
  if (coll) cands.push(`src/content/${coll[1]}/${coll[2]}.md`, `src/content/${coll[1]}/${coll[2]}.mdx`);
  cands.push(`src/pages/${p}.astro`, `src/pages/${p}/index.astro`, `src/content/pages/${p}.md`);
  return cands;
};

// 部署設定：預設為 GitHub Pages 專案頁（子路徑）。
// 未來切換到根網域 www.olderkkk.com 時，只要設環境變數：
//   BASE_PATH=/  SITE_URL=https://www.olderkkk.com
// 並建立 public/CNAME（內容為 www.olderkkk.com），重新 build 即可。
const BASE = process.env.BASE_PATH ?? '/www.olderkkk.com';
const SITE = process.env.SITE_URL ?? 'https://yao-care.github.io';

// rehype 外掛：把 Markdown 內以 "/" 開頭的內部連結/圖片加上 base 前綴，
// 並替內部「頁面」連結補結尾斜線（對應靜態輸出 /path/index.html，避免
// GitHub Pages 對無斜線網址多一次 301——那會被 GSC 記成「頁面會重新導向」）。
// 注意：base 前綴僅在 BASE≠"/" 時加；補斜線邏輯需在 BASE="/"（正式站）時照樣執行。
function rehypeBasePrefix() {
  const prefix = BASE === '/' ? '' : BASE;
  // 僅對 href（頁面連結）補斜線：拆出 ?query / #hash，路徑段無副檔名才補。
  const ensureTrailingSlash = (v) => {
    const m = v.match(/^([^?#]*)([?#].*)?$/);
    let path = m[1];
    const suffix = m[2] ?? '';
    const last = path.split('/').pop() ?? '';
    if (path && !path.endsWith('/') && !last.includes('.')) path += '/';
    return path + suffix;
  };
  const fix = (node) => {
    if (node.type === 'element' && node.properties) {
      for (const attr of ['href', 'src']) {
        let v = node.properties[attr];
        if (typeof v !== 'string' || !v.startsWith('/') || v.startsWith('//')) continue;
        if (prefix && !v.startsWith(prefix + '/')) v = prefix + v;
        if (attr === 'href') v = ensureTrailingSlash(v);
        node.properties[attr] = v;
      }
    }
    if (node.children) node.children.forEach(fix);
  };
  return (tree) => fix(tree);
}

// rehype 外掛：替 Markdown 內 alt 空白的圖片補上基本替代文字（無障礙 + 圖片 SEO）。
function rehypeAltFill() {
  const DEFAULT = '鄭骨館體雕中心－台中西屯全身調理體雕';
  const fix = (node) => {
    if (node.type === 'element' && node.tagName === 'img') {
      const alt = node.properties && node.properties.alt;
      if (!alt || (typeof alt === 'string' && alt.trim() === '')) {
        node.properties = node.properties || {};
        node.properties.alt = DEFAULT;
      }
    }
    if (node.children) node.children.forEach(fix);
  };
  return (tree) => fix(tree);
}

// https://astro.build/config
export default defineConfig({
  site: SITE,
  base: BASE,
  markdown: { rehypePlugins: [rehypeBasePrefix, rehypeAltFill] },
  integrations: [
    mdx(),
    sitemap({
      // 排除 noindex 的舊網址轉址樁（如 /services/chiropractic → /services/body-care）：
      // 這些頁帶 <meta robots="noindex">，放進 sitemap 會對 Google 送出矛盾訊號
      // （一邊提交、一邊叫它別收），造成「已找到/已檢索－尚未建立索引」。
      // 保留頁面本身以承接舊連結，但不在 sitemap 宣告。新增此類樁頁時一併加入。
      filter: (url) => !/\/services\/chiropractic\/?$/.test(url) && !/\/paper\//.test(url),
      // 依頁面重要性差異化 priority / changefreq（預設全為 0.5 / weekly）
      serialize(item) {
        // 取站內路徑（去掉網域與 base 前綴），結尾不含斜線方便比對
        let path = new URL(item.url).pathname;
        if (BASE !== '/' && path.startsWith(BASE)) path = path.slice(BASE.length);
        path = path.replace(/\/$/, '') || '/';
        if (path === '/') {
          item.priority = 1.0; item.changefreq = 'weekly';
        } else if (['/services', '/courses', '/contact', '/faq'].includes(path)) {
          item.priority = 0.8; item.changefreq = 'monthly';
        } else if (['/health', '/news'].includes(path)) {
          item.priority = 0.7; item.changefreq = 'weekly';
        } else {
          // 內頁文章
          item.priority = 0.6; item.changefreq = 'monthly';
        }
        const lastmod = gitDate(sourceFor(path));
        if (lastmod) item.lastmod = lastmod;
        return item;
      },
    }),
  ],
});
