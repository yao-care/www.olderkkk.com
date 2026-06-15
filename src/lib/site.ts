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
  defaultImage: "/images/cc685b243660.jpg",
};

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

// 文章（健康概念分享 / 最新消息）
export function articleSchema(o: {
  headline: string;
  description: string;
  image?: string;
  datePublished?: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: o.headline,
    description: o.description,
    ...(o.image ? { image: o.image } : {}),
    ...(o.datePublished ? { datePublished: o.datePublished.replace(/\//g, "-") } : {}),
    mainEntityOfPage: o.url,
    author: { "@type": "Organization", name: SITE.name },
    publisher: { "@type": "Organization", name: SITE.name },
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
    areaServed: { "@type": "City", name: "台中市" },
    hasMap: SITE.map,
    sameAs: [SITE.facebook, SITE.line],
    priceRange: "$$",
  };
}
