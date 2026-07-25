import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { SITE } from "../lib/site";

// /llms-full.txt：供 AI 助理／LLM 一次取用全站健康概念文章與最新消息全文（新興慣例，llms.txt 的全文版）。
// 內容直接取自 content collections 原始 Markdown，不重寫、不杜撰。
export const GET: APIRoute = async ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const origin = site ?? new URL("https://www.olderkkk.com");
  const abs = (p: string) => new URL(`${base}${p}`, origin).href;

  const health = (await getCollection("health")).sort((a, b) => a.data.order - b.data.order);
  const news = (await getCollection("news")).sort((a, b) => a.data.order - b.data.order);

  const section = (title: string, entries: typeof health, pathPrefix: string) =>
    `# ${title}\n\n` +
    entries
      .map((e) => {
        const lines = [`## ${e.data.title}`, `URL: ${abs(`${pathPrefix}/${e.id}`)}`];
        if (e.data.date) lines.push(`日期：${e.data.date}`);
        lines.push("", e.body ?? "");
        return lines.join("\n");
      })
      .join("\n\n---\n\n");

  const body = `# ${SITE.name}｜全文內容（供 LLM／AI 助理取用）

> ${SITE.tagline}。以下為健康概念分享與最新消息全文，供 AI 助理／LLM 完整取用引用。摘要版見 ${abs("/llms.txt")}。

${section("健康概念分享全文", health, "/health")}

---

${section("最新消息全文", news, "/news")}
`;

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
