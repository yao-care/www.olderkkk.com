// 全站禁用詞守門（2026-07-19 用詞政策「運動矯正／肌力訓練」的機械閘門）。
// 掃 src/ 下所有內容檔，命中禁用詞／療效字／落單「矯正」即 exit 1。
// 禁詞表**唯一真實來源＝ pipeline/config.mjs 的 GUARD**（與每日產線同一套），此處只引用不重造。
// 用途：接進 seo-ops 反思/大腦的 gate——自動化改站台若加回禁詞，gate 擋下並回退，不會 push 上線。
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { GUARD } from "../pipeline/config.mjs";

const ROOT = "src";
const exts = new Set([".astro", ".md", ".mdx", ".ts", ".js", ".css"]);
const hits = [];

// 客戶要求的唯一特例（2026-07-20）：nav 標籤「全身調理」准用，除此之外「調理」等禁詞仍全禁。
// 掃描前先把這串整體挖掉，因此「調理」單獨出現、或「身體調理」等變體仍會被擋。
const ALLOW = ["全身調理"];
const stripAllowed = (line) => ALLOW.reduce((s, a) => s.split(a).join(""), line);

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (exts.has(extname(p))) scan(p);
  }
}

function scan(file) {
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((rawLine, i) => {
    const at = `${file}:${i + 1}`;
    const line = stripAllowed(rawLine); // 白名單詞（全身調理）先挖掉再驗
    for (const w of GUARD.forbidden || [])
      if (line.includes(w)) hits.push(`${at}: 療效/醫療宣稱字「${w}」`);
    for (const w of GUARD.bannedTerms || [])
      if (line.includes(w)) hits.push(`${at}: 禁用服務用語「${w}」（徒手療程/服務名/整脊訊號詞）`);
    // 「矯正」只放行「運動矯正…」；落單矯正退回。每行建新 regex 避免 lastIndex 殘留。
    if (GUARD.correctionRule && new RegExp(GUARD.correctionRule.source, GUARD.correctionRule.flags).test(line))
      hits.push(`${at}: 落單「矯正」——只能寫「運動矯正…」`);
  });
}

walk(ROOT);
if (hits.length) {
  console.error(`禁用詞守門未過（${hits.length} 處）：\n` + hits.join("\n"));
  process.exit(1);
}
console.log("禁用詞守門通過：src/ 無禁用詞／療效字／落單矯正。");
