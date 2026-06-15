// 從線上抓取 7 頁，解析 .content 區塊，下載圖片到 public/images，
// 將文字+圖片路徑寫成 Markdown + frontmatter。
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
  return abs;
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
console.log("擷取完成。");
