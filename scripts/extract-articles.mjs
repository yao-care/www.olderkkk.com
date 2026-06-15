// 爬 health(295)/news(297) 所有個別文章，產出 src/content/health/<id>.md, src/content/news/<id>.md
import { parse } from "node-html-parser";
import TurndownService from "turndown";
import { mkdirSync, writeFileSync, rmSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36";
const BASE = "https://www.olderkkk.com";
const td = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" });
// 保留 YouTube 等 iframe 影片嵌入（turndown 預設會丟棄）
td.keep(["iframe"]);
// Instagram 嵌入 → 轉成可點連結（無法在靜態頁載入 IG widget）
td.addRule("instagram", {
  filter: (node) => node.nodeName === "BLOCKQUOTE" && (node.getAttribute("class") || "").includes("instagram-media"),
  replacement: (_content, node) => {
    const url = (node.getAttribute("data-instgrm-permalink") || "").split("?")[0];
    return url ? `\n\n[在 Instagram 觀看貼文](${url})\n\n` : "";
  },
});

const SECTIONS = [
  { col: "health", base: "/paper/share_index.php",      tid: "295" },
  { col: "news",   base: "/paper/promotions_index.php", tid: "297" },
];

async function dl(src) {
  const abs = src.startsWith("http") ? src : BASE + (src.startsWith("/") ? src : "/" + src.replace(/^\.\.\//, ""));
  const ext = (abs.split("?")[0].match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) || [".jpg"])[0];
  const name = createHash("md5").update(abs).digest("hex").slice(0, 12) + ext;
  try {
    const r = await fetch(abs, { headers: { "User-Agent": UA } });
    if (r.ok) { writeFileSync(`public/images/${name}`, Buffer.from(await r.arrayBuffer())); return `/images/${name}`; }
  } catch {}
  return abs;
}
const txt = (n) => (n?.text || "").replace(/\s+/g, " ").trim();

for (const s of SECTIONS) {
  const dir = `src/content/${s.col}`;
  mkdirSync(dir, { recursive: true });
  // 清掉舊檔（重新產生）
  for (const f of readdirSync(dir)) { if (f.endsWith(".md")) rmSync(`${dir}/${f}`); }

  const listHtml = await (await fetch(`${BASE}${s.base}?title_id=${s.tid}`, { headers: { "User-Agent": UA } })).text();
  const ids = [];
  const re = new RegExp(`[?&]id=(\\d+)&useno=olderk&title_id=${s.tid}`, "g");
  let m;
  while ((m = re.exec(listHtml))) if (!ids.includes(m[1])) ids.push(m[1]);
  console.log(`${s.col}: ${ids.length} articles`);

  let order = 0;
  for (const id of ids) {
    order++;
    const url = `${BASE}${s.base}?id=${id}&useno=olderk&title_id=${s.tid}`;
    const html = await (await fetch(url, { headers: { "User-Agent": UA } })).text();
    const root = parse(html);
    const meta = (n) => { const e = root.querySelector(`meta[name="${n}"]`); return e ? e.getAttribute("content") || "" : ""; };
    const content = root.querySelector(".content");
    if (!content) { console.log(`  ! ${id}: no .content`); continue; }
    const aTitle = txt(content.querySelector(".article_title")) || (root.querySelector("title")?.text || "").trim();
    // 日期結構：<div class="date">06<span>2023.07</span></div> → 重組為 2023/07/06
    const dateEl = content.querySelector(".date");
    let date = "";
    if (dateEl) {
      const span = dateEl.querySelector("span");
      const ym = span ? span.text.trim() : "";          // "2023.07"
      const day = txt(dateEl).replace(ym, "").trim();    // "06"
      const parts = ym.split(".");
      date = (parts.length === 2 && day) ? `${parts[0]}/${parts[1]}/${day}` : txt(dateEl);
    }
    const body = content.querySelector(".edit") || content;
    body.querySelectorAll("style, script, .other_promotion, .date, .article_title").forEach((e) => e.remove());
    for (const img of body.querySelectorAll("img")) { const sc = img.getAttribute("src"); if (sc) img.setAttribute("src", await dl(sc)); }
    const md = td.turndown(body.innerHTML);
    const summary = md
      .replace(/<iframe[\s\S]*?<\/iframe>/gi, " ")
      .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")        // 移除圖片 ![alt](src)
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")        // 連結 → 只留文字
      .replace(/[#*_>`~]/g, " ")
      .replace(/https?:\/\/\S+/g, " ")
      .replace(/\/images\/\S+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80);
    const fm = ["---",
      `title: ${JSON.stringify(aTitle)}`,
      `date: ${JSON.stringify(date)}`,
      `description: ${JSON.stringify(meta("description"))}`,
      `keywords: ${JSON.stringify(meta("keywords"))}`,
      `summary: ${JSON.stringify(summary)}`,
      `order: ${order}`,
      "---", "", md, ""].join("\n");
    writeFileSync(`${dir}/${id}.md`, fm);
    console.log(`  ✓ ${s.col}/${id}: ${aTitle.slice(0, 24)} (${md.length} chars)`);
  }
}
console.log("文章擷取完成。");
