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

// rehype 外掛：把 Markdown 內以 "/" 開頭的內部連結/圖片加上 base 前綴。
// 當 BASE 為 "/"（根網域）時不做任何事，避免產生 "//path"。
function rehypeBasePrefix() {
  const prefix = BASE === '/' ? '' : BASE;
  const fix = (node) => {
    if (prefix && node.type === 'element' && node.properties) {
      for (const attr of ['href', 'src']) {
        const v = node.properties[attr];
        if (typeof v === 'string' && v.startsWith('/') && !v.startsWith('//') && !v.startsWith(prefix + '/')) {
          node.properties[attr] = prefix + v;
        }
      }
    }
    if (node.children) node.children.forEach(fix);
  };
  return (tree) => fix(tree);
}

// rehype 外掛：替 Markdown 內 alt 空白的圖片補上基本替代文字（無障礙 + 圖片 SEO）。
function rehypeAltFill() {
  const DEFAULT = '鄭骨館體雕中心－台中西屯整骨整脊體雕';
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
        } else if (['/health', '/news', '/works'].includes(path)) {
          item.priority = 0.7; item.changefreq = 'weekly';
        } else {
          // 內頁文章 / 相簿
          item.priority = 0.6; item.changefreq = 'monthly';
        }
        return item;
      },
    }),
  ],
});
