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
const heroSlide = z.object({
  image: z.string(),
  // 照片對焦位置（object-position），直式人像用來避免裁到頭，例 "50% 22%"
  focus: z.string().default("center"),
  // 大標：accent 為青色詞（每個自成一行），main 為深色詞
  accent: z.array(z.string()).default([]),
  main: z.string().default(""),
  // 說明段落（每行一個陣列元素，逐行浮現）
  lines: z.array(z.string()).default([]),
  // 疊在照片上的說明卡（可空）
  cards: z.array(heroCard).default([]),
});
const home = defineCollection({
  loader: glob({ pattern: "home.md", base: "src/content" }),
  schema: z.object({ ...seo, slides: z.array(heroSlide).default([]) }),
});

export const collections = { pages, works, health, news, home };
