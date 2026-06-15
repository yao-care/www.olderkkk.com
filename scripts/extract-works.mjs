// 擷取成果分享兩個相簿的照片到 public/images，產出 src/content/works/<slug>.md
import { parse } from "node-html-parser";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36";
const BASE = "https://www.olderkkk.com";
const ALBUMS = [
  { slug: "body", group: "629",  title: "身體成果分享" },
  { slug: "feet", group: "4744", title: "腳部成果分享" },
];

mkdirSync("public/images", { recursive: true });
mkdirSync("src/content/works", { recursive: true });
try { rmSync("src/content/works/works.md"); } catch {}

async function dl(src) {
  const abs = src.startsWith("http") ? src : BASE + (src.startsWith("/") ? src : "/" + src);
  const ext = (abs.split("?")[0].match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) || [".jpg"])[0];
  const name = createHash("md5").update(abs).digest("hex").slice(0, 12) + ext;
  try {
    const r = await fetch(abs, { headers: { "User-Agent": UA } });
    if (r.ok) { writeFileSync(`public/images/${name}`, Buffer.from(await r.arrayBuffer())); return `/images/${name}`; }
  } catch {}
  return abs;
}

for (const a of ALBUMS) {
  const url = `${BASE}/workshow/?group_id=${a.group}&title_id=296`;
  const html = await (await fetch(url, { headers: { "User-Agent": UA } })).text();
  const root = parse(html);
  const gallery = root.querySelector(".popup-gallery");
  const photos = [];
  if (gallery) {
    for (const link of gallery.querySelectorAll("a")) {
      const href = link.getAttribute("href");
      const caption = (link.getAttribute("title") || "").trim();
      if (href) photos.push({ src: await dl(href), caption });
    }
  }
  const fm = [
    "---",
    `title: ${JSON.stringify(a.title + "-鄭骨館體雕中心")}`,
    `album: ${JSON.stringify(a.title)}`,
    `group: ${JSON.stringify(a.group)}`,
    "photos:",
  ];
  for (const p of photos) {
    fm.push(`  - src: ${JSON.stringify(p.src)}`);
    fm.push(`    caption: ${JSON.stringify(p.caption)}`);
  }
  fm.push("---", "");
  writeFileSync(`src/content/works/${a.slug}.md`, fm.join("\n"));
  console.log(`✓ ${a.slug} ${a.title}: ${photos.length} photos`);
}
console.log("成果相簿擷取完成。");
