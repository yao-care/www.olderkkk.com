// 將內部絕對路徑加上 Astro base 前綴。external URL / 已含 base 的路徑不變。
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, ""); // e.g. "/www.olderkkk.com" or ""
  if (!path.startsWith("/")) return path;
  const full = base && !path.startsWith(base + "/") ? base + path : path;
  // 頁面路徑（不含副檔名）補上結尾斜線，對應靜態輸出的 /path/index.html，
  // 避免 GitHub Pages 對無斜線網址多一次 301 轉址；圖片/manifest 等實際檔案路徑不受影響。
  const lastSegment = full.split("/").pop() ?? "";
  if (!full.endsWith("/") && !lastSegment.includes(".")) {
    return full + "/";
  }
  return full;
}
