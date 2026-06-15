import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const origin = site ?? new URL("https://www.olderkkk.com");
  const sitemap = new URL(`${base}/sitemap-index.xml`, origin).href;
  const body = [
    "User-agent: *",
    "Allow: /",
    "",
    "# AI 爬蟲：在地商家開放，以利被 AI 搜尋/助理引用推薦",
    "User-agent: GPTBot",
    "Allow: /",
    "User-agent: OAI-SearchBot",
    "Allow: /",
    "User-agent: ChatGPT-User",
    "Allow: /",
    "User-agent: PerplexityBot",
    "Allow: /",
    "User-agent: Google-Extended",
    "Allow: /",
    "User-agent: ClaudeBot",
    "Allow: /",
    "",
    `Sitemap: ${sitemap}`,
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
