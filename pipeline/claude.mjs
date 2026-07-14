// pipeline/claude.mjs
// 共用的 `claude -p`（本機訂閱帳戶）呼叫：單輪、無工具、JSON 信封解析，回傳助手文字。
// 沿用 dreamer868 pipeline 的穩健寫法：
//   --output-format json → 回 {type:"result", result:"<文字>", is_error, subtype...}
//   --max-turns 1 + --tools "" → 強制單輪純文字，不 agentic、不用工具（否則會撞 error_max_turns，
//   或在 repo cwd 幻覺式假裝 cat 檔案）。失敗診斷全寫 .cache/claude-errors.log。
import { spawn } from 'node:child_process';
import { appendFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import path from 'node:path';
import { MODEL } from './config.mjs';

const ERR_LOG = path.join(path.dirname(fileURLToPath(import.meta.url)), '.cache', 'claude-errors.log');

function logFailure(kind, { code = null, out = '', err = '', promptLen = 0 } = {}) {
  try {
    mkdirSync(path.dirname(ERR_LOG), { recursive: true });
    appendFileSync(ERR_LOG, JSON.stringify({
      ts: new Date().toISOString(), kind, code, promptLen,
      stderr: String(err).slice(0, 2000), stdout: String(out).slice(0, 2000),
    }) + '\n');
  } catch { /* 記 log 失敗無所謂 */ }
}

function claudePrint(prompt, { timeoutMs = 180000 } = {}) {
  return new Promise((resolve, reject) => {
    // cwd 設中性目錄（非 repo）：否則 claude 讀到 repo 的 CLAUDE.md 會把自己當 Claude Code agent，
    // 即使 --tools "" 也會幻覺式吐出假的 shell 指令當前言污染輸出。純文字生成不需要 repo 脈絡。
    const child = spawn('claude', ['-p', '--output-format', 'json', '--model', MODEL, '--max-turns', '1', '--tools', ''], {
      stdio: ['pipe', 'pipe', 'pipe'], cwd: os.tmpdir(),
    });
    let out = '', err = '';
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      logFailure('timeout', { out, err, promptLen: prompt.length });
      reject(new Error(`claude -p timeout（${timeoutMs}ms）`));
    }, timeoutMs);
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { err += d; });
    child.on('error', reject);
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        logFailure('exit', { code, out, err, promptLen: prompt.length });
        return reject(new Error(`claude exit ${code}: ${(err.trim() || out.trim() || '(空)').slice(0, 200)}`));
      }
      resolve(out);
    });
    child.stdin.on('error', () => {}); // 提早結束的 EPIPE 交給 'close' 統一處理
    try { child.stdin.write(prompt); child.stdin.end(); } catch { /* close 會處理 */ }
  });
}

// 送 prompt → 取回助手輸出的純文字（throws on error / usage-limit / overloaded）。
export async function askText(prompt, opts) {
  const raw = await claudePrint(prompt, opts);
  let env;
  try { env = JSON.parse(raw); }
  catch { logFailure('parse', { out: raw, promptLen: prompt.length }); throw new Error(`claude 信封非 JSON：${String(raw).slice(0, 150)}`); }
  if (env.is_error || typeof env.result !== 'string') {
    logFailure('envelope', { out: raw, promptLen: prompt.length });
    throw new Error(`claude_error: ${env.subtype || env.api_error_status || env.error || 'is_error'}`);
  }
  return env.result;
}
