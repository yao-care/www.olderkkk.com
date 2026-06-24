import type { APIRoute } from "astro";
import { SITE } from "../lib/site";

// PWA / 行動裝置 manifest。用端點動態產生，base 前綴會自動正確（子路徑或根網域皆可）。
export const GET: APIRoute = () => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const manifest = {
    name: `${SITE.name}｜${SITE.tagline}`,
    short_name: SITE.name,
    description:
      "台中市西屯區全身調理體雕中心，結合健美式訓練與人體力學矯正，預約制。",
    start_url: `${base}/`,
    scope: `${base}/`,
    display: "standalone",
    background_color: "#f3f7f7",
    theme_color: "#005060",
    lang: "zh-Hant",
    icons: [
      { src: `${base}/icon-192.png`, sizes: "192x192", type: "image/png" },
      { src: `${base}/icon-512.png`, sizes: "512x512", type: "image/png" },
      { src: `${base}/icon-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
  return new Response(JSON.stringify(manifest), {
    headers: { "Content-Type": "application/manifest+json; charset=utf-8" },
  });
};
