import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const meta = {
  title: z.string(),
  subject: z.string(),
  tags: z.array(z.string()).default([]),
  date: z.coerce.date().optional(),
  unit: z.string().optional(), // slug de l'unité (ex. week-01)
};
const bi = z.object({ fr: z.string(), en: z.string() });

// Unité = Week / Chapitre : src/content/units/{fr,en}/<matiere>/<unit>.md
const units = defineCollection({
  loader: glob({ pattern: '{fr,en}/**/*.{md,mdx}', base: './src/content/units' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    summary: z.string().optional(),
    notions: z.array(z.object({
      category: z.string(),
      name: z.string(),
      explanation: z.string(),
      examples: z.array(z.object({ text: z.string(), reading: z.string().optional(), tr: z.string() })).default([]),
      mnemonic: z.string().optional(),
    })).default([]),
  }),
});

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

// Vocab (un fichier par unité, bilingue) : src/content/vocab/<matiere>/<unit>.yaml
const vocab = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml}', base: './src/content/vocab' }),
  schema: z.object({
    lang: z.string(),
    groups: z.array(z.object({
      name: bi,
      mnemonic: bi.optional(),
      cards: z.array(z.object({
        term: z.string(),
        reading: z.string().optional(),
        fr: z.string(),
        en: z.string(),
        example: z.string().optional(),
        mnemonic: bi.optional(),
      })).min(1),
    })).min(1),
  }),
});

export const collections = { units, lessons, formulas, quiz, vocab };
