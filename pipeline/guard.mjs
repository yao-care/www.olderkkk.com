// pipeline/guard.mjs
// 自動上線前的確定性合規閘門＋標點正規化。閘門不過 → 不寫檔、不推進游標。
import { GUARD } from './config.mjs';

// 中文字旁的半形逗號 → 全形（模型常出半形，與全站一致）。不碰 URL/數字裡的逗號。
export function normalizePunct(md) {
  return String(md)
    .replace(/,(?=[一-鿿])/g, '，')
    .replace(/([一-鿿]),/g, '$1，');
}

// 從 claude 輸出取出從第一個 --- 起的 markdown（去除任何前言）。
export function extractMd(raw) {
  const lines = String(raw).split('\n');
  const i = lines.findIndex((l) => /^---\s*$/.test(l));
  return i < 0 ? '' : lines.slice(i).join('\n');
}

export function lint(md) {
  if (!md || !md.trimStart().startsWith('---')) return { ok: false, reason: '無 frontmatter' };
  for (const w of GUARD.forbidden) if (md.includes(w)) return { ok: false, reason: `含療效/醫療宣稱字「${w}」` };
  for (const w of GUARD.bannedTerms || []) if (md.includes(w)) return { ok: false, reason: `含禁用服務用語「${w}」（徒手療程動詞/服務名/整脊訊號詞）` };
  if (GUARD.correctionRule && GUARD.correctionRule.test(md)) return { ok: false, reason: '「矯正」只能寫「運動矯正…」，落單的矯正一律退回' };
  if (GUARD.aiFlavor && GUARD.aiFlavor.test(md)) return { ok: false, reason: '含破折號「——」（AI 味），改用自然標點' };
  if (!GUARD.safety.test(md)) return { ok: false, reason: '缺就醫/專業安全提醒' };
  if (!GUARD.funnel.test(md)) return { ok: false, reason: '缺 /method 導流' };
  if (!/^title:/m.test(md) || !/^date:/m.test(md) || !/^summary:/m.test(md)) return { ok: false, reason: 'frontmatter 不全' };
  return { ok: true };
}
