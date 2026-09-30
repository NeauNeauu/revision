import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const meta = {
  title: z.string(),
  subject: z.string(),
  tags: z.array(z.string()).default([]),
  date: z.coerce.date().optional(),
};

const lessons = defineCollection({
  loader: glob({ pattern: '{fr,en}/**/*.{md,mdx}', base: './src/content/lessons' }),
  schema: z.object({ ...meta, date: z.coerce.date(), summary: z.string() }),
});

const formulas = defineCollection({
  loader: glob({ pattern: '{fr,en}/**/*.md', base: './src/content/formulas' }),
  schema: z.object({
    ...meta,
    chapters: z.array(z.object({
      chapter: z.string(),
      formulas: z.array(z.object({
        name: z.string(),
        latex: z.string(),
        when_to_use: z.string(),
        example: z.string(),
      })).min(1),
    })).min(1),
  }),
});

const quiz = defineCollection({
  loader: glob({ pattern: '{fr,en}/**/*.md', base: './src/content/quiz' }),
  schema: z.object({
    ...meta,
    questions: z.array(z.object({
      question: z.string(),
      choices: z.array(z.string()).min(2).optional(),
      answer: z.string(),
      explanation: z.string(),
    }).refine((q) => !q.choices || q.choices.includes(q.answer), 'answer must be one of choices')).min(1),
  }),
});

const vocab = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml}', base: './src/content/vocab' }),
  schema: z.object({
    deck: z.object({ fr: z.string(), en: z.string() }),
    lang: z.string(),
    tags: z.array(z.string()).default([]),
    cards: z.array(z.object({
      term: z.string(),
      reading: z.string().optional(),
      fr: z.string(),
      en: z.string(),
      example: z.string().optional(),
    })).min(1),
  }),
});

export const collections = { lessons, formulas, quiz, vocab };
