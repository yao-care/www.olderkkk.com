// 掃描 src/ 下所有 css/astro，找出 font-size 使用 px 且 < 18 的宣告，違規則 exit 1。
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = "src";
const exts = new Set([".css", ".astro"]);
const violations = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (exts.has(extname(p))) scan(p);
  }
}
function scan(file) {
  const text = readFileSync(file, "utf8");
  const re = /font-size\s*:\s*([0-9.]+)px/gi;
  let m;
  while ((m = re.exec(text))) {
    if (parseFloat(m[1]) < 18) violations.push(`${file}: font-size ${m[1]}px`);
  }
}
walk(ROOT);
if (violations.length) {
  console.error("字級違規（< 18px）：\n" + violations.join("\n"));
  process.exit(1);
}
console.log("字級檢查通過：無 < 18px 宣告。");
