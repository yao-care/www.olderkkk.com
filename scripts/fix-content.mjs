// 重新擷取 courses（用 .hs_box），並改寫全站內部舊連結為新路由。
import { parse } from "node-html-parser";
import TurndownService from "turndown";
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36";
const BASE = "https://www.olderkkk.com";
const td = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" });

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

// 1) 重新擷取 courses（.hs_box）
{
  const html = await (await fetch(BASE + "/paper/other_page.php?id=294", { headers: { "User-Agent": UA } })).text();
  const root = parse(html);
  const title = (root.querySelector("title")?.text || "").trim();
  const meta = (n) => { const e = root.querySelector(`meta[name="${n}"]`); return e ? e.getAttribute("content") || "" : ""; };
  const content = root.querySelector(".hs_box");
  content.querySelectorAll("style, script").forEach((e) => e.remove());
  for (const img of content.querySelectorAll("img")) { const s = img.getAttribute("src"); if (s) img.setAttribute("src", await dl(s)); }
  const md = td.turndown(content.innerHTML);
  const fm = ["---", `title: ${JSON.stringify(title)}`, `description: ${JSON.stringify(meta("description"))}`, `keywords: ${JSON.stringify(meta("keywords"))}`, `sourcePath: ${JSON.stringify("/paper/other_page.php?id=294")}`, "---", "", md, ""].join("\n");
  writeFileSync("src/content/pages/courses.md", fm);
  console.log("✓ courses 重新擷取 (.hs_box):", md.length, "chars");
}

// 2) 全站內部連結改寫
const MAP = [
  [/#page/g, ""],
  [/https?:\/\/www\.olderkkk\.com\/paper\/services_index\.php\?title_id=293/g, "/services"],
  [/https?:\/\/www\.olderkkk\.com\/paper\/other_page\.php\?id=294/g, "/courses"],
  [/https?:\/\/www\.olderkkk\.com\/paper\/share_index\.php\?title_id=295/g, "/health"],
  [/https?:\/\/www\.olderkkk\.com\/workshow\/index\.php\?title_id=296/g, "/works"],
  [/https?:\/\/www\.olderkkk\.com\/paper\/promotions_index\.php\?title_id=297/g, "/news"],
  [/https?:\/\/www\.olderkkk\.com\/paper\/contact_index\.php\?title_id=298/g, "/contact"],
  [/https?:\/\/www\.olderkkk\.com\/workshow\/\?group_id=629[^)"\s]*/g, "/works/body"],
  [/https?:\/\/www\.olderkkk\.com\/workshow\/\?group_id=4744[^)"\s]*/g, "/works/feet"],
  [/https?:\/\/www\.olderkkk\.com\/products\/car\.php\?title_id=/g, "/"],
  [/\.\.\/index\.php/g, "/"],
  [/https?:\/\/www\.olderkkk\.com\/?(?=[)"\s])/g, "/"],
];
function walk(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith(".md")) {
      let t = readFileSync(p, "utf8"); const o = t;
      for (const [re, rep] of MAP) t = t.replace(re, rep);
      if (t !== o) { writeFileSync(p, t); console.log("改寫連結:", p); }
    }
  }
}
walk("src/content");
console.log("內容清理完成。");
