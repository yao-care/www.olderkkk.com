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

// https://astro.build/config
export default defineConfig({
  site: SITE,
  base: BASE,
  markdown: { rehypePlugins: [rehypeBasePrefix] },
  integrations: [mdx(), sitemap()],
});
