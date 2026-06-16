// 商家基本資訊與結構化資料（SEO / AEO / GEO 共用）
export const SITE = {
  name: "鄭骨館體雕中心",
  tagline: "台中西屯整骨・整脊・體雕・一對一訓練",
  tel: "0970686319",
  telE164: "+886-970-686-319",
  email: "d28281778@gmail.com",
  line: "https://line.me/R/ti/p/%40275nxace",
  lineId: "@275nxace",
  facebook: "https://www.facebook.com/olderk/",
  instagram: "https://www.instagram.com/cheng_spine_fit_center/",
  threads: "https://www.threads.com/@cheng_spine_fit_center",
  youtube: "https://www.youtube.com/@KKK0524TW",
  map: "https://maps.app.goo.gl/dx4tE1qBJhFficMz6",
  addressText: "台中市西屯區工業區一路58巷11弄83號",
  hoursText: "週一、二、三、五、六 14:00–17:00、20:00–22:00（週四、日公休）",
  address: {
    street: "工業區一路58巷11弄83號",
    locality: "西屯區",
    region: "台中市",
    postalCode: "407",
    country: "TW",
  },
  geo: { lat: 24.1775877, lng: 120.6136818 },
  // 營業日（兩個時段：午場 14:00–17:00、晚場 20:00–22:00；週四、日公休）
  openDays: ["Monday", "Tuesday", "Wednesday", "Friday", "Saturday"],
  defaultImage: "/images/cc685b243660.webp",
};

// 師傅／教練（對外公開）。鄭師傅即主理人老K（本名鄭博陽）。
export const PRACTITIONERS = [
  { name: "鄭師傅", aka: "老K（鄭博陽）", role: "整脊・整骨・體雕" },
  { name: "何師傅", role: "整脊・整骨" },
];

// 收費方式（價格以現場或 LINE 最新公告為準）。
export const PRICING = [
  { name: "整脊全身調整（鄭師傅）", price: 1100, unit: "次", duration: "約 30–40 分鐘", desc: "含骨盆、膝蓋、腳踝、肩膀的全身調整" },
  { name: "整脊全身調整（何師傅）", price: 1000, unit: "次", duration: "約 30–40 分鐘", desc: "含骨盆、膝蓋、腳踝、肩膀的全身調整" },
  { name: "一對一教練課", price: 1800, unit: "堂", desc: "依個人張力失衡、身體協調與肌力進行個人化訓練；已接受調整服務者可用 780 元體驗一次" },
  { name: "小型團課", price: 300, unit: "堂", desc: "4 人成班、每週一次，5 堂 1500 元；可揪親友或協助媒合成班" },
  { name: "運動按摩放鬆", price: 1200, unit: "小時", desc: "針對運動後肌肉與筋膜緊繃、痠痛進行按摩與拉伸放鬆" },
  { name: "預約諮詢與評估", price: null as number | null, desc: "先了解身體狀況，再一起決定合適的調理與訓練方向" },
];

// 停車（場館鄰近合作/推薦停車場）
export const PARKING = { name: "天佑停車場", map: "https://maps.app.goo.gl/hqxsxipGU1m7GZGM8" };

// 預約流程與初次須知（對外公開；採預約制）
export const BOOKING = {
  steps: [
    { name: "選擇服務", text: "決定想預約的服務（整脊評估、一對一教練課、團課或運動按摩）。不確定時可先選「預約諮詢與評估」。" },
    { name: "聯繫預約", text: "透過 LINE（@275nxace）或電話 0970686319 告知欲預約的項目與希望時段。" },
    { name: "提供姓名電話", text: "預約時請提供姓名與聯絡電話，方便確認與聯繫。" },
    { name: "等待確認", text: "小編回覆並確認姓名、電話後，才算預約成功。" },
    { name: "依約到場", text: "依約定時間前往台中市西屯區工業區一路58巷11弄83號，鄰近可停天佑停車場。" },
  ],
  // 整脊調整前需主動告知的狀況（安全評估）
  notice: [
    "女生請避免穿著裙裝，以方便活動與檢查。",
    "有骨質疏鬆、曾耳石滑脫、裝有心臟支架者，請於預約與到場時主動告知。",
    "脊椎曾開刀（打釘、骨漿等）者請先告知，由師傅評估。",
    "開刀或剖腹生產者，建議滿 3 個月後再進行調整。",
    "若有明確外傷、急性疼痛或神經症狀（麻、無力），建議先就醫診斷。",
  ],
  confirm: "本中心採預約制；小編回覆並確認姓名、電話後才算預約成功。",
};

// 收費方式 OfferCatalog（含價格）
export function pricingOfferCatalogSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: "收費方式",
    itemListElement: PRICING.filter((p) => p.price != null).map((p) => ({
      "@type": "Offer",
      priceCurrency: "TWD",
      price: p.price,
      itemOffered: { "@type": "Service", name: p.name, provider: { "@type": "LocalBusiness", name: SITE.name } },
    })),
  };
}

// 單一服務 Service schema（核心服務分頁用）
export function serviceSchema(o: { name: string; description: string; url: string; siteUrl: string; price?: number | null; serviceType?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: o.name,
    description: o.description,
    ...(o.serviceType ? { serviceType: o.serviceType } : {}),
    provider: { "@type": "LocalBusiness", "@id": o.siteUrl + "#business", name: SITE.name },
    areaServed: [
      { "@type": "City", name: "台中市" },
      ...["西屯區", "北屯區", "南屯區", "西區", "北區"].map((n) => ({ "@type": "AdministrativeArea", name: `台中市${n}` })),
    ],
    url: o.url,
    ...(o.price != null ? { offers: { "@type": "Offer", priceCurrency: "TWD", price: o.price } } : {}),
  };
}

// 預約流程 HowTo
export function bookingHowToSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "如何預約鄭骨館體雕中心",
    description: "鄭骨館體雕中心採預約制，透過 LINE 或電話完成預約。",
    step: BOOKING.steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.name, text: s.text })),
  };
}

// 以 site(URL) + base 產生絕對網址；path 以 "/" 開頭視為站內路徑
export function absUrl(path: string, site: URL | undefined, baseUrl: string): string {
  const base = baseUrl.replace(/\/$/, "");
  if (/^https?:\/\//.test(path)) return path;
  const p = path.startsWith("/") ? base + path : "/" + path;
  return site ? new URL(p, site).href : p;
}

// 麵包屑
export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

// 列表頁清單（健康/消息/相簿索引）—— 幫 AI 理解內容目錄與其順序
export function itemListSchema(o: { name: string; items: { name: string; url: string }[] }) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: o.name,
    numberOfItems: o.items.length,
    itemListElement: o.items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: it.url,
    })),
  };
}

// 文章（健康概念分享 / 最新消息）
export function articleSchema(o: {
  headline: string;
  description: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  url: string;
  siteUrl?: string;
}) {
  const published = o.datePublished ? o.datePublished.replace(/\//g, "-") : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: o.headline,
    description: o.description,
    ...(o.image ? { image: o.image } : {}),
    ...(published ? { datePublished: published } : {}),
    // 新鮮度訊號：未另填 dateModified 時沿用 datePublished
    ...(o.dateModified || published ? { dateModified: (o.dateModified || o.datePublished || "").replace(/\//g, "-") } : {}),
    mainEntityOfPage: o.url,
    inLanguage: "zh-Hant",
    author: { "@type": "Person", name: PERSON.name, ...(o.siteUrl ? { "@id": o.siteUrl + "#founder" } : {}) },
    publisher: { "@type": "Organization", name: SITE.name },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "article.prose p"],
    },
  };
}

// YouTube 影片（從內文 iframe 取 embed 連結）
export function youtubeId(body: string): string | null {
  const m = body.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : null;
}
export function videoObjectSchema(o: { id: string; name: string; description: string; uploadDate?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: o.name,
    description: o.description || o.name,
    thumbnailUrl: [`https://i.ytimg.com/vi/${o.id}/hqdefault.jpg`],
    embedUrl: `https://www.youtube.com/embed/${o.id}`,
    contentUrl: `https://www.youtube.com/watch?v=${o.id}`,
    ...(o.uploadDate ? { uploadDate: o.uploadDate.replace(/\//g, "-") } : {}),
  };
}

// 創辦人／具名專家（E-E-A-T）。事實僅取自首頁「關於老K」既有敘述，
// 不杜撰證照、年資或學歷。
export const PERSON = {
  name: "老K",
  alternateName: "鄭博陽", // 本名（用戶確認）；畫面顯示暱稱「老K」，結構化資料兩者並陳以利 AI 實體串接
  jobTitle: "整骨體雕暨一對一訓練教練",
  knowsAbout: ["健美式訓練", "整脊技術", "人體力學矯正", "肌力訓練", "體態矯正"],
  description:
    "結合健美式訓練、整脊技術與人體力學矯正，同時處理肌肉發力方式與調整關節排列位置，更快有效解決身體問題。",
};

// Person 結構化資料（全站輸出一次，供 LocalBusiness.founder 與文章 author 以 @id 參照）
export function personSchema(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": siteUrl + "#founder",
    name: PERSON.name,
    alternateName: PERSON.alternateName,
    jobTitle: PERSON.jobTitle,
    description: PERSON.description,
    knowsAbout: PERSON.knowsAbout,
    worksFor: { "@id": siteUrl + "#business" },
  };
}

// 全站 LocalBusiness 結構化資料
export function localBusinessSchema(siteUrl: string, image: string) {
  return {
    "@context": "https://schema.org",
    "@type": ["HealthAndBeautyBusiness", "LocalBusiness"],
    "@id": siteUrl + "#business",
    name: SITE.name,
    description:
      "台中市西屯區整骨整脊體雕中心，結合健美式訓練、整脊技術與人體力學矯正，提供身體調理、歪斜矯正、痠痛調理、運動矯正與一對一肌力訓練。",
    image,
    telephone: SITE.telE164,
    email: SITE.email,
    url: siteUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.locality,
      addressRegion: SITE.address.region,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: SITE.geo.lat, longitude: SITE.geo.lng },
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: SITE.openDays, opens: "14:00", closes: "17:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: SITE.openDays, opens: "20:00", closes: "22:00" },
    ],
    // 服務範圍：主市 + 鄰近行政區（吃下「附近整骨」類在地查詢）
    areaServed: [
      { "@type": "City", name: "台中市" },
      ...["西屯區", "北屯區", "南屯區", "西區", "北區"].map((n) => ({ "@type": "AdministrativeArea", name: `台中市${n}` })),
    ],
    knowsAbout: PERSON.knowsAbout,
    hasMap: SITE.map,
    sameAs: [SITE.facebook, SITE.instagram, SITE.threads, SITE.youtube, SITE.line, SITE.map],
    founder: { "@type": "Person", "@id": siteUrl + "#founder", name: PERSON.name },
    priceRange: "$$",
  };
}

// 全站 WebSite 結構化資料（語言/發行者；協助 AI 將整站對應到單一實體）
export function websiteSchema(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": siteUrl + "#website",
    url: siteUrl,
    name: SITE.name,
    inLanguage: "zh-Hant",
    publisher: { "@id": siteUrl + "#business" },
  };
}
