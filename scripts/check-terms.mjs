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

// 客戶要求的特例：這幾串在掃描前整體挖掉，因此只有「完全一致」的寫法會被放行。
//   2026-07-20  「全身調理」——nav 標籤
//   2026-09-17  「調理身體」「調理全身」——站主放寬用語
//   2026-09-17  下面三串出自客戶已審核的〈台中骨盆調理推薦〉一文，逐句放行、不開放整個詞：
//               ・「治療」不一樣／疾病治療效果 → 兩句都是免責句（說明本服務不是醫療處置、
//                 不宣稱效果）。單獨的「治療」「療效」仍是紅線，例如「治療腰痛」照樣擋下。
//               ・脊椎側彎 → 轉述醫師診斷名詞，非服務宣稱。
//               ・肩膀、脊椎、骨盆 → 解剖部位列舉，非服務宣稱。
//               ・依當下狀況調整方式 → 「調整」指安排方式，非徒手動作。
const ALLOW = [
  "全身調理",
  "調理身體",
  "調理全身",
  "「治療」不一樣",
  "疾病治療效果",
  "脊椎側彎",
  "肩膀、脊椎、骨盆",
  "依當下狀況調整方式",
];

// 站主 2026-09-17 放寬：「調理」原則放行（骨盆調理／體態調理／民俗調理…），
// 但明確指示「調理脊椎」不行——先把脊椎相關的挑出來擋，其餘「調理」才挖掉放行。
const spineCare = () => /調理(?:脊椎|脊柱)/g;

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
    // 1) 完全一致的白名單串先挖掉
    let line = ALLOW.reduce((s, a) => s.split(a).join(""), rawLine);
    // 2) 「調理脊椎／調理脊柱」仍禁（站主 2026-09-17 明示）；挖掉以免下面又被拆成「脊椎」重複報
    const sc = spineCare();
    if (sc.test(line)) hits.push(`${at}: 禁用服務用語「調理脊椎／調理脊柱」（站主明示不放行）`);
    line = line.replace(spineCare(), "");
    // 3) 其餘「調理」放行
    line = line.split("調理").join("");
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
