import type { APIRoute } from "astro";
import { SITE, PERSON } from "../lib/site";

// /llms.txt —— 供大型語言模型快速取用的純文字摘要（新興慣例）。
// 內容皆取自 site.ts 既有事實，不杜撰。
export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const origin = site ?? new URL("https://www.olderkkk.com");
  const abs = (p: string) => new URL(`${base}${p}`, origin).href;

  const body = `# ${SITE.name}

> ${SITE.tagline}。位於${SITE.address.region}${SITE.address.locality}的整骨／整脊／體雕與一對一肌力訓練中心，採預約制。結合健美式訓練、整脊技術與人體力學矯正，處理身體歪斜、痠痛與動作矯正。

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
身體調理、歪斜調理、痠痛調理、運動動作矯正、動作失能矯正、運動按摩矯正、肌力訓練、減脂計畫、重量肌力訓練、全身張力平衡、一對一健身教練、團課指導。

## 主理人
${PERSON.name}（${PERSON.jobTitle}）：${PERSON.description}

## 重要頁面
- 服務項目：${abs("/services")}
- 課程介紹：${abs("/courses")}
- 健康概念分享：${abs("/health")}
- 成果分享：${abs("/works")}
- 最新消息：${abs("/news")}
- 常見問題：${abs("/faq")}
- 聯絡我們：${abs("/contact")}
`;

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
