// pipeline/run.mjs
// 身體小卡關系列全流程：取題 → claude 生成 → 取 md → 標點正規化 → guard 合規閘門 →
//   過關寫檔＋推進游標。git 同步/build gate/commit/push/Slack 由 cron.sh 負責。
// 只往 stdout 印一行 STATUS（給 cron.sh 解析）；其餘走 stderr。
// 環境變數 DRY_RUN=1：寫檔供審，但不推進游標（cron.sh 也不 commit）。
import { promises as fs } from 'node:fs';
import { PATHS } from './config.mjs';
import { askText } from './claude.mjs';
import { lint, normalizePunct, extractMd } from './guard.mjs';

const DRY = process.env.DRY_RUN === '1';
const status = (s) => process.stdout.write(s + '\n');
const err = (...a) => console.error('[pipeline]', ...a);

async function readCursor() {
  try { return JSON.parse(await fs.readFile(PATHS.cursor, 'utf8')).next ?? 0; } catch { return 0; }
}
async function writeCursor(n) { await fs.writeFile(PATHS.cursor, JSON.stringify({ next: n }) + '\n'); }
async function readTopics() {
  const raw = await fs.readFile(PATHS.topics, 'utf8');
  return raw.split('\n').filter((l) => l.trim()).map((l) => {
    const [slug, topic, hint] = l.split('\t');
    return { slug, topic, hint: hint || '' };
  });
}

function buildPrompt(t, dateSlash) {
  return `你是鄭骨館體雕中心（台中西屯，無痛整脊·全身調理·一對一訓練）的內容編輯，寫一篇「身體小卡關」生活自助文。

【今天的題目】困擾：${t.topic}
【涉及部位/重點提示】${t.hint}

【固定格式，四段】
1. 那個很有畫面的小困擾（開頭就讓讀者「對，就是我」）
2. ## 為什麼會這樣 —— 這段是重點，用『老師傅串聯判讀』的調性：不要孤立列原因，而是『一個卡 → 牽出一整組相關現象（點名具體肌群/骨頭）→ 說明它們是同一條張力失衡的連鎖 → 所以只處理表面留不住』。要有連帶關係、要具體。
3. ## 在家可以先試的 —— 2~3 個具體、能照做的動作或方法，原則寫明『不痛的範圍、每天一點』。
4. ## 什麼情況該找人看 —— 安全提醒＋自然帶到我們。末段一定要有指向 [無痛整脊・自然牽引](/method) 與 [預約說明](/booking) 的內部連結（Markdown 語法）。

【frontmatter】用 --- 包住，需要：title（用讀者會 Google 的搜尋問句，不要放站名）、date: "${dateSlash}"、summary（一句自然摘要，別重複標題）、order: 0、faq（2~3 組 q/a，貼近搜尋意圖）。

【合規紅線（務必遵守）】這是民俗調理保健內容：
- 絕不可出現：治療、根治、療效、治好、痊癒、醫療行為 等字。用『舒緩、放鬆、保養、調理、活動度、回到中立』這類講法。
- 一定要有安全提醒：動作以不痛為原則、別硬拉；若持續、加劇，或有明顯疼痛/無力/發麻，建議先就醫。
- 若提到民俗做法（如吹風機熱敷）給安全版：溫熱就好別燙傷、急性紅腫發炎不要熱敷。

【文風：去 AI 味】長短句交錯、少用破折號、避免『不是X而是Y』的公式句型、用台灣口語、每段有具體細節。用詞可自然使用『整脊/整骨/無痛整脊』。內部連結只用 Markdown（禁 raw HTML）。

【輸出】只輸出這篇 .md 的完整內容，從第一行的 --- 開始。不要任何前言、說明或 code fence。`;
}

async function main() {
  const topics = await readTopics();
  const cur = await readCursor();
  if (cur >= topics.length) { status('STATUS=EMPTY'); return; }

  const t = topics[cur];
  const target = `${PATHS.health}/${t.slug}.md`;
  err(`題目 #${cur}：${t.slug}｜${t.topic}`);

  try { await fs.access(target); if (!DRY) await writeCursor(cur + 1); status(`STATUS=SKIP|${t.slug}`); return; } catch { /* 不存在，繼續 */ }

  // 台北日期（cron.sh 已設 TZ=Asia/Taipei；en-CA 回 ISO 格式 YYYY-MM-DD）
  const dateSlash = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' }).replace(/-/g, '/');
  let raw;
  try { raw = await askText(buildPrompt(t, dateSlash)); }
  catch (e) { status(`STATUS=ERROR|${t.slug}|${(e.message || '').slice(0, 120)}`); process.exit(3); }

  const md = normalizePunct(extractMd(raw));
  const v = lint(md);
  if (!v.ok) { status(`STATUS=BLOCK|${t.slug}|${v.reason}`); return; }

  await fs.writeFile(target, md.endsWith('\n') ? md : md + '\n');
  if (DRY) { status(`STATUS=DRY|${t.slug}|${t.topic}`); return; }
  await writeCursor(cur + 1);
  status(`STATUS=PUBLISH|${t.slug}|${t.topic}`);
}

main().catch((e) => { status(`STATUS=ERROR||${(e.message || '').slice(0, 120)}`); process.exit(1); });
