import { getCollection } from 'astro:content';
import katex from 'katex';
import type { Lang } from '../i18n';

export type Card = { id: string; subject: string; deck: string; front: string; back: string };

/** "fr/bi/intro" -> { lang, subject, slug } ; vocab ids have no lang: "coreen/salutations" */
export function parts(id: string, withLang = true) {
  const p = id.split('/');
  const lang = (withLang ? p.shift() : undefined) as Lang;
  const subject = p.shift()!;
  return { lang, subject, slug: p.join('/') };
}

export async function inLang<C extends 'lessons' | 'formulas' | 'quiz'>(c: C, lang: Lang) {
  return (await getCollection(c)).filter((e) => e.id.startsWith(lang + '/'));
}

export const esc = (s = '') =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export const tex = (s: string, displayMode = false) => katex.renderToString(s, { displayMode, throwOnError: false });

/** Text with inline $...$ math */
export const mathText = (s = '') =>
  s.split(/\$([^$]+)\$/g).map((part, i) => (i % 2 ? tex(part) : esc(part))).join('');

export async function allCards(lang: Lang): Promise<Card[]> {
  const cards: Card[] = [];
  for (const v of await getCollection('vocab')) {
    const { subject } = parts(v.id, false);
    const deck = `vocab/${v.id}`;
    for (const c of v.data.cards)
      cards.push({
        id: `${deck}#${c.term}`, subject, deck,
        front: `<div class="term">${esc(c.term)}</div>${c.reading ? `<div class="muted">${esc(c.reading)}</div>` : ''}`,
        back: `<div class="term">${esc(c[lang])}</div>${c.example ? `<div class="muted">${esc(c.example)}</div>` : ''}`,
      });
  }
  for (const f of await inLang('formulas', lang)) {
    const { subject, slug } = parts(f.id);
    const deck = `formulas/${subject}/${slug}`;
    let i = 0;
    for (const ch of f.data.chapters)
      for (const x of ch.formulas)
        cards.push({
          id: `${deck}#${i++}`, subject, deck,
          front: `<div class="muted">${esc(ch.chapter)}</div><div class="term">${esc(x.name)}</div>`,
          back: `${tex(x.latex, true)}<div class="muted">${mathText(x.when_to_use)}</div>`,
        });
  }
  return cards;
}
