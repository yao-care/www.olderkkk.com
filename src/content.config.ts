import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const seo = {
  title: z.string(),
  description: z.string().default(""),
  keywords: z.string().default(""),
  sourcePath: z.string().optional(),
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
const news = defineCollection({
  loader: glob({ pattern: "*.md", base: "src/content/news" }),
  schema: z.object({ ...seo, date: z.string().optional() }),
});
const home = defineCollection({
  loader: glob({ pattern: "home.md", base: "src/content" }),
  schema: z.object({ ...seo, slides: z.array(z.string()).default([]) }),
});

export const collections = { pages, works, news, home };
