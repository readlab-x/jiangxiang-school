import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const chapters = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/chapters' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    order: z.number(),
    part: z.string(),
    summary: z.string(),
    readingTime: z.string().optional(),
  }),
});

const manuscripts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/books' }),
  schema: z.object({
    title: z.string(),
    romanization: z.string().optional(),
    order: z.number(),
    nature: z.string(),
    summary: z.string(),
    transmission: z.string(),
    modernReading: z.string(),
    sourceNote: z.string(),
  }),
});

export const collections = { chapters, manuscripts };
