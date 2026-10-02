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

// 單篇特例（客戶已審核、逐字上線的文章）：只在該檔生效，其他檔照舊擋。
// 在「調理脊椎」檢查之後才挖掉，所以這些檔裡寫「調理脊椎」仍會被擋。
//   2026-09-25  〈什麼是脊椎調理？〉——整篇主題就是「脊椎調理」，站主指示「調理」要保留：
//               ・脊椎：主題詞＋解剖部位，僅限此檔放行。
//               ・三句含「治療」者都是免責句（本服務不等於醫療、已確診者依醫師建議）；
//                 FAQ 問句「可以治療椎間盤突出嗎」的答案正是否定（不能等同醫療治療）。
//               ・兩句含「調整」者指安排活動／訓練內容，非徒手動作。
const FILE_ALLOW = {
  "src/content/health/spine-care-taichung.mdx": [
    "脊椎",
    "疾病治療的同義詞",
    "等同於醫療治療",
    "接受適當治療與復健",
    "可以治療椎間盤突出嗎",
    "依當下狀況調整活動方式",
    "依個人身體狀況與運動能力調整",
  ],
  //   2026-10-02  〈椎間盤突出的患者，可以來做全身調理嗎？〉——用戶指示照原文上線：
  //               ・脊椎：解剖部位與主題詞，僅限此檔放行。
  //               ・兩句含「治療」者都是免責句（不能取代醫師、並非疾病治療）。
  //               ・三句含「調整」者指安排活動內容，非徒手動作。
  "src/content/health/disc-herniation-whole-body-care.mdx": [
    "脊椎",
    "也不能取代醫師的檢查與治療",
    "但並非醫療診斷或疾病治療",
    "是否需要調整活動",
    "實際內容仍然需要依照個人的身體狀況調整",
    "等面向逐步調整",
  ],
};

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
    // 2.5) 單篇特例
    line = (FILE_ALLOW[file.split("\\").join("/")] || []).reduce((s, a) => s.split(a).join(""), line);
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
