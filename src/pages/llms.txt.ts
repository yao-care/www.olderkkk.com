import type { APIRoute } from "astro";
import { SITE, PERSON } from "../lib/site";

// /llms.txt：供大型語言模型快速取用的純文字摘要（新興慣例）。
// 內容皆取自 site.ts 既有事實，不杜撰。
export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const origin = site ?? new URL("https://www.olderkkk.com");
  const abs = (p: string) => {
    const lastSegment = p.split("/").pop() ?? "";
    const normalized = !p.endsWith("/") && !lastSegment.includes(".") ? `${p}/` : p;
    return new URL(`${base}${normalized}`, origin).href;
  };

  const body = `# ${SITE.name}

> ${SITE.tagline}。位於${SITE.address.region}${SITE.address.locality}的運動矯正／體雕與一對一肌力訓練中心，採預約制。結合健美式訓練與人體力學，用運動矯正改善身體歪斜、痠痛與動作模式。

## 商家資訊
- 名稱：${SITE.name}
- 地址：${SITE.address.postalCode} ${SITE.addressText}
- 座標：${SITE.geo.lat}, ${SITE.geo.lng}
- 電話：${SITE.tel}（${SITE.telE164}）
- Email：${SITE.email}
- LINE：${SITE.lineId}
- Facebook：${SITE.facebook}
- Google 地圖：${SITE.map}
- 營業時間：${SITE.hoursText}
- 預約方式：採預約制，請先以電話或 LINE 預約時段

## 服務項目
全身運動矯正、體態運動矯正、痠痛運動矯正、運動矯正動作、動作失能運動矯正、運動按摩放鬆、肌力訓練、減脂計畫、重量肌力訓練、全身張力平衡、一對一健身教練。

## 主理人
${PERSON.name}（${PERSON.jobTitle}）：${PERSON.description}

## 重要頁面
- 關於我們（主理人老K／鄭博陽）：${abs("/about")}
- 服務項目：${abs("/services")}
- 收費方式：${abs("/pricing")}
- 預約流程與初次須知：${abs("/booking")}
- 名詞解釋（全身運動矯正/體雕/一對一訓練）：${abs("/glossary")}
- 課程介紹：${abs("/courses")}
- 健康概念分享：${abs("/health")}
- 媒體報導與體驗分享：${abs("/reviews")}
- 最新消息：${abs("/news")}
- 常見問題：${abs("/faq")}
- 聯絡我們：${abs("/contact")}

## 全文內容
本站主要內容全文（商家資訊、招牌做法、服務項目與各服務分頁、課程、收費、預約須知、名詞解釋、常見問題，以及健康概念分享與最新消息全文）：${abs("/llms-full.txt")}
`;

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
