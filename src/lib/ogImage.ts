import { statSync } from "node:fs";

// 從文章 Markdown 內文挑選適合的 og:image：
// 取第一張「夠大」的本地圖片（跳過 emoji/icon 等 < 8KB 的小圖與 .gif），
// 找不到才退回第一張圖。回傳原始路徑（如 /images/xxx.jpg），未加 base。
export function pickOgImage(body: string): string {
  const urls = [...body.matchAll(/!\[[^\]]*\]\((\S+?)(?:\s+"[^"]*")?\)/g)].map((m) => m[1]);
  const local = urls.filter((u) => u.startsWith("/images/") && !/\.gif(\?|$)/i.test(u));
  const big = local.find((u) => {
    try {
      return statSync(`public${u}`).size > 8000;
    } catch {
      return false;
    }
  });
  return big || local[0] || urls[0] || "";
}
