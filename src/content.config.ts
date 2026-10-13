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
    weeks: z.array(z.number()).default([]), // semaines de cours couvertes (badge)
    prereq: z.array(z.string()).default([]), // slugs d'unités prérequises
    related: z.array(z.string()).default([]), // slugs « voir aussi »
    // diapos du cours : public/courses/<deck>.pdf et public/courses/<deck>/pNN.webp
    slides: z.array(z.object({ deck: z.string(), label: z.string(), pages: z.array(z.number()) })).default([]),
    notions: z.array(z.object({
      category: z.string(),
      name: z.string(),
      explanation: z.string(),
      examples: z.array(z.object({ text: z.string(), reading: z.string().optional(), tr: z.string() })).default([]),
      mnemonic: z.string().optional(),
      topic: z.string().optional(),
      visual: z.array(z.object({
        eq: z.array(z.string()).optional(),
        rows: z.array(z.object({ if: z.string(), then: z.string(), ex: z.string().optional() })).optional(),
      })).default([]),
    })).default([]),
    drills: z.array(z.object({ q: z.string(), a: z.string(), topic: z.string().optional() })).default([]),
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
      theme: bi.optional(),
      mnemonic: bi.optional(),
      cards: z.array(z.object({
        term: z.string(),
        reading: z.string().optional(),
        fr: z.string(),
        en: z.string(),
        ex: z.object({ ko: z.string(), fr: z.string(), en: z.string() }).optional(),
        mnemonic: bi.optional(),
      })).min(1),
    })).min(1),
  }),
});

// Glossaire (survol façon Wikipédia) : src/content/glossary/<matiere>.json, utilisé par [[id]] dans le Markdown
const term = z.object({ term: z.string(), def: z.string() });
const glossary = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/glossary' }),
  schema: z.object({
    terms: z.array(z.object({ id: z.string(), topic: z.string(), anchor: z.string().optional(), fr: term, en: term })),
  }),
});

const lectures = defineCollection({
  loader: glob({ pattern: '{fr,en}/**/*.md', base: './src/content/lectures' }),
  schema: z.object({ title: z.string(), order: z.number(), deck: z.string(), pages: z.number(), summary: z.string().optional() }),
});
export const collections = { lectures, units, lessons, formulas, quiz, vocab, glossary };
