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
const home = defineCollection({
  loader: glob({ pattern: "home.md", base: "src/content" }),
  schema: z.object({ ...seo, slides: z.array(z.string()).default([]) }),
});

export const collections = { pages, works, health, news, home };
