// 從線上抓取 7 頁，解析內容區塊（移除 style/script），下載圖片到 public/images，
// 寫成 Markdown + frontmatter。首頁額外擷取 flexslider 輪播圖到 frontmatter.slides。
import { parse } from "node-html-parser";
import TurndownService from "turndown";
import { mkdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36";
const BASE = "https://www.olderkkk.com";
const td = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" });

const PAGES = [
  { slug: "services", path: "/paper/services_index.php?title_id=293",   dir: "src/content/pages", selector: ".content" },
  { slug: "courses",  path: "/paper/other_page.php?id=294",            dir: "src/content/pages", selector: ".hs_box" },
  { slug: "health",   path: "/paper/share_index.php?title_id=295",      dir: "src/content/pages", selector: ".content" },
  { slug: "news",     path: "/paper/promotions_index.php?title_id=297",  dir: "src/content/news",  selector: ".content" },
  { slug: "contact",  path: "/paper/contact_index.php?title_id=298",     dir: "src/content/pages", selector: ".content" },
  { slug: "home",     path: "/",                                         dir: "src/content",       selector: ".hs_box", slidesSelector: ".flexslider .slides img" },
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
  const abs = src.startsWith("http") ? src : BASE + (src.startsWith("/") ? src : "/" + src.replace(/^\.\.\//, ""));
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

  const content = root.querySelector(p.selector) || root.querySelector(".content") || root.querySelector("#page") || root;
  // 移除內嵌 style/script，避免 CSS/JS 被當成內文
  content.querySelectorAll("style, script").forEach((e) => e.remove());

  for (const img of content.querySelectorAll("img")) {
    const src = img.getAttribute("src");
    if (src) img.setAttribute("src", await downloadImage(src));
  }
  const md = td.turndown(content.innerHTML);

  // 首頁輪播 banner
  let slides = [];
  if (p.slidesSelector) {
    for (const img of root.querySelectorAll(p.slidesSelector)) {
      const src = img.getAttribute("src");
      if (src) slides.push(await downloadImage(src));
    }
  }

  const fm = ["---", `title: ${JSON.stringify(title)}`, `description: ${JSON.stringify(description)}`, `keywords: ${JSON.stringify(keywords)}`, `sourcePath: ${JSON.stringify(p.path)}`];
  if (slides.length) { fm.push("slides:"); for (const s of slides) fm.push(`  - ${JSON.stringify(s)}`); }
  fm.push("---", "", md, "");
  writeFileSync(`${p.dir}/${p.slug}.md`, fm.join("\n"));
  console.log(`✓ ${p.slug} (${md.length} chars${slides.length ? `, ${slides.length} slides` : ""})`);
}
console.log("擷取完成。");
