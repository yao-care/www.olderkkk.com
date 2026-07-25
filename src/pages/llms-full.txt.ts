import type { APIRoute } from "astro";
import { getCollection, getEntry } from "astro:content";
import { SITE, PERSON, PRACTITIONERS, PRICING, BOOKING, PARKING } from "../lib/site";
import { FAQS, METHOD_FAQS } from "../lib/faqs";
import { GLOSSARY_TERMS } from "../lib/glossary";
import { CORE_SERVICES, ADJUST_SERVICES, TRAIN_SERVICES } from "../lib/services-catalog";

// /llms-full.txt：llms.txt 的「全文版」——llms.txt 是目錄（分區連結），本檔給的是實際正文，
// 讓 AI 助理（ChatGPT／Claude／Perplexity）一次讀到本站主要內容、可直接引用，不必逐頁爬。
// 資料來源全部是站上既有的東西：src/lib/site.ts、共用資料模組（faqs/glossary/services-catalog）、
// content collections（health/news/pages）、以及各服務分頁 .astro 原始碼；純文字輸出，不重寫、不杜撰。

// 服務分頁與招牌頁的正文：直接讀該頁 .astro 原始碼並去標籤取可見文字。
// 用 ?raw 讀原檔而非另抄一份，避免同一段文案兩處維護而漂移。
const RAW_PAGES = import.meta.glob(["./method.astro", "./services/*.astro"], {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};
const decode = (s: string) => s.replace(/&[a-z#0-9]+;/gi, (m) => ENTITIES[m.toLowerCase()] ?? m);

/** .astro 原始碼 → 可見純文字（去 frontmatter、樣式、標籤與殘留的樣板運算式） */
function astroPageText(src: string): string {
  let s = src;
  s = s.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
  s = s.replace(/<(style|script)\b[\s\S]*?<\/\1>/g, "");
  s = s.replace(/<!--[\s\S]*?-->/g, "");
  // 行內標籤直接拿掉（句子才不會被切成好幾行），其餘區塊標籤換成換行
  s = s.replace(/<\/?(a|strong|em|b|i|u|span|small|code|sup|sub|mark)\b[^>]*>/g, "");
  s = s.replace(/<[^>]*>/g, "\n");
  s = s.replace(/\{[^{}]*\}/g, "");
  s = decode(s);
  return s
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !/^[(){}[\],;:]+$/.test(l) && !l.includes("=>"))
    .join("\n")
    .replace(/([，。、；])\s*([，。、；])/g, "$1");
}

/** Markdown 內文 → 純文字（去圖片、HTML 標籤、連結語法與強調符號） */
function markdownText(src: string): string {
  let s = src;
  s = s.replace(/!\[[^\]]*\]\([^)]*\)/g, "");
  s = s.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
  s = s.replace(/<[^>]+>/g, " ");
  s = decode(s);
  s = s.replace(/^#{1,6}\s*/gm, "");
  s = s.replace(/\*\*([^*]+)\*\*/g, "$1");
  s = s.replace(/\\([.\-*_])/g, "$1");
  return s
    .split("\n")
    .map((l) => l.replace(/\s+$/, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export const GET: APIRoute = async ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const origin = site ?? new URL("https://www.olderkkk.com");
  const abs = (p: string) => new URL(`${base}${p}`, origin).href;

  const health = (await getCollection("health")).sort((a, b) => a.data.order - b.data.order);
  const news = (await getCollection("news")).sort((a, b) => a.data.order - b.data.order);
  const coursesPage = await getEntry("pages", "courses");

  const pageText = (key: string) => astroPageText(RAW_PAGES[key] ?? "");
  const qa = (list: { q: string; a: string }[]) => list.map((f) => `Q：${f.q}\nA：${f.a}`).join("\n\n");

  const articleSection = (title: string, entries: typeof health, pathPrefix: string) =>
    `# ${title}\n\n` +
    entries
      .map((e) => {
        const lines = [`## ${e.data.title}`, `URL: ${abs(`${pathPrefix}/${e.id}/`)}`];
        if (e.data.date) lines.push(`日期：${e.data.date}`);
        if (e.data.summary) lines.push(`摘要：${e.data.summary}`);
        lines.push("", markdownText(e.body ?? ""));
        if (e.data.faq?.length) lines.push("", "常見問題", "", qa(e.data.faq));
        return lines.join("\n");
      })
      .join("\n\n---\n\n");

  const body = `# ${SITE.name}｜全文內容（供 LLM／AI 助理取用）

> ${SITE.tagline}。本檔是 ${abs("/llms.txt")} 的全文版：llms.txt 給的是目錄，這裡給的是實際正文，供 AI 助理直接閱讀與引用。
> 收錄範圍：商家資訊、招牌做法、服務項目與各服務分頁、課程介紹、收費方式、預約流程與須知、名詞解釋、常見問題，
> 以及健康概念分享 ${health.length} 篇與最新消息 ${news.length} 則的全文。完整網址索引見 ${abs("/sitemap-index.xml")}。
> 本站提供的是運動矯正與肌力訓練服務，屬一般保健與運動訓練範疇，不能取代醫療診斷。

# 商家資訊

- 名稱：${SITE.name}
- 定位：${SITE.tagline}
- 官網：${abs("/")}
- 地址：${SITE.address.postalCode} ${SITE.addressText}
- 座標：${SITE.geo.lat}, ${SITE.geo.lng}
- 電話：${SITE.tel}（${SITE.telE164}）
- Email：${SITE.email}
- LINE：${SITE.lineId}
- Facebook：${SITE.facebook}
- Instagram：${SITE.instagram}
- YouTube：${SITE.youtube}
- Google 地圖：${SITE.map}
- Google 商家檔案：${SITE.googleBusiness}
- 營業時間：${SITE.hoursText}
- 停車：鄰近可停${PARKING.name}（${PARKING.map}）
- 預約方式：採預約制，請先以電話或 LINE 預約時段

## 主理人與師傅

${PERSON.name}（本名${PERSON.alternateName}，${PERSON.jobTitle}）：${PERSON.description}
專長：${PERSON.knowsAbout.join("、")}。

${PRACTITIONERS.map((p) => `- ${p.name}${p.aka ? `（${p.aka}）` : ""}：${p.role}`).join("\n")}

---

# 招牌做法：運動矯正・肌力訓練（全文）
URL: ${abs("/method/")}

${pageText("./method.astro")}

## 招牌頁常見問題

${qa(METHOD_FAQS)}

---

# 服務項目
URL: ${abs("/services/")}

${SITE.name}結合運動矯正與肌力訓練：先用運動矯正協助身體排列回正，再用訓練讓成果維持住。以下為各項服務說明。

## 核心服務（各有獨立說明頁）

${CORE_SERVICES.map((c) => `- ${c.title}（${abs(`${c.href}/`)}）：${c.desc}`).join("\n")}

## 運動矯正類

${ADJUST_SERVICES.map((s) => `- ${s.name}：${s.desc}`).join("\n")}

## 訓練健身類

${TRAIN_SERVICES.map((s) => `- ${s.name}：${s.desc}`).join("\n")}

---

# 全身運動矯正（服務分頁全文）
URL: ${abs("/services/body-care/")}

${pageText("./services/body-care.astro")}

---

# 一對一訓練（服務分頁全文）
URL: ${abs("/services/personal-training/")}

${pageText("./services/personal-training.astro")}

---

# 體雕・體態訓練（服務分頁全文）
URL: ${abs("/services/body-sculpting/")}

${pageText("./services/body-sculpting.astro")}

---

# 課程介紹
URL: ${abs("/courses/")}

一對一指導課程，結合全身運動矯正與肌力訓練，改善體態與動作。課程頁以實際上課照片呈現，內容與排課請以 LINE 或電話洽詢為準。
${markdownText(coursesPage?.body ?? "")}

---

# 收費方式
URL: ${abs("/pricing/")}

以下為各項服務的參考價格。實際費用會依個人狀況與方案而定，價格以現場或 LINE 最新公告為準。不確定適合哪一項時，建議先選擇「預約諮詢與評估」。

${PRICING.map((p) => `- ${p.name}：${p.price != null ? `${p.price} 元／${p.unit}` : "先評估"}${p.duration ? `（${p.duration}）` : ""}。${p.desc}`).join("\n")}

---

# 預約流程與初次須知
URL: ${abs("/booking/")}

${BOOKING.steps.map((s, i) => `${i + 1}. ${s.name}：${s.text}`).join("\n")}

${BOOKING.confirm}

運動矯正前請先主動告知的狀況：
${BOOKING.notice.map((n) => `- ${n}`).join("\n")}

---

# 名詞解釋
URL: ${abs("/glossary/")}

這些名詞在民間常被混用。以下用淺白方式說明本中心對各服務的定位，幫助你了解差異。內容為一般觀念說明，不能取代個別評估或醫療診斷。

${GLOSSARY_TERMS.map((t) => `## ${t.term}\n${t.def}`).join("\n\n")}

---

# 常見問題
URL: ${abs("/faq/")}

${qa(FAQS)}

---

${articleSection("健康概念分享全文", health, "/health")}

---

${articleSection("最新消息全文", news, "/news")}
`;

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
