// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

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
        return item;
      },
    }),
  ],
});
