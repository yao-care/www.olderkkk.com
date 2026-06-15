// 將內部絕對路徑加上 Astro base 前綴。external URL / 已含 base 的路徑不變。
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, ""); // e.g. "/www.olderkkk.com" or ""
  if (!path.startsWith("/")) return path;
  if (base && path.startsWith(base + "/")) return path;
  return base + path;
}
