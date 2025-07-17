import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const posts = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/pages/posts" }),
  schema: z.object({
    title: z.string(),
    layout: z.string(),
    tags: z.array(z.string()),
    date: z.coerce.date(),
    description: z.string(),
  }),
});
export const collections = { posts };
