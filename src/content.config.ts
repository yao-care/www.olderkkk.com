import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const seo = {
  title: z.string(),
  description: z.string().default(""),
  keywords: z.string().default(""),
  sourcePath: z.string().optional(),
};

const article = {
  title: z.string(),
  description: z.string().default(""),
  keywords: z.string().default(""),
  date: z.string().default(""),
  summary: z.string().default(""),
  order: z.number().default(0),
};

const pages = defineCollection({
  loader: glob({ pattern: "*.md", base: "src/content/pages" }),
  schema: z.object(seo),
});
const works = defineCollection({
  loader: glob({ pattern: "*.md", base: "src/content/works" }),
  schema: z.object({
    title: z.string(),
    description: z.string().default(""),
    keywords: z.string().default(""),
    album: z.string().default(""),
    group: z.string().optional(),
    photos: z.array(z.object({ src: z.string(), caption: z.string().default("") })).default([]),
  }),
});
const health = defineCollection({
  loader: glob({ pattern: "*.md", base: "src/content/health" }),
  schema: z.object(article),
});
const news = defineCollection({
  loader: glob({ pattern: "*.md", base: "src/content/news" }),
  schema: z.object(article),
});
const heroCard = z.object({
  no: z.string().default(""),
  title: z.string().default(""),
  desc: z.string().default(""),
});
// 左欄常駐文案（只進場一次，不隨輪播重播）
const heroCopy = z.object({
  accent: z.array(z.string()).default([]),   // 青色大標，每詞一行
  main: z.string().default(""),              // 深色大標
  lines: z.array(z.string()).default([]),    // 說明，逐行浮現
});
const heroSlide = z.object({
  image: z.string(),
  // 照片對焦位置（object-position），直式人像用來避免裁到頭，例 "50% 22%"
  focus: z.string().default("center"),
  // contain=完整顯示不裁切（預設，配模糊背景填留白）；cover=填滿裁切（會裁到頭/腳，少用）
  fit: z.enum(["cover", "contain"]).default("contain"),
});
const home = defineCollection({
  loader: glob({ pattern: "home.md", base: "src/content" }),
  // heroCards：Hero 正下方的三張課程卡（不再覆蓋照片）
  schema: z.object({ ...seo, heroCopy: heroCopy.default({}), heroCards: z.array(heroCard).default([]), slides: z.array(heroSlide).default([]) }),
});

export const collections = { pages, works, health, news, home };
