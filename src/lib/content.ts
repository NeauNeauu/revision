import { getCollection } from 'astro:content';
import katex from 'katex';
import type { Lang } from '../i18n';
import { subjectConf } from './subjects';

export type Card = {
  id: string; subject: string; unit: string; deck: string; front: string; back: string;
  speak?: string; rfront?: string; rback?: string; // vocab : audio + sens inverse
};

/** "fr/bi/intro" -> { lang, subject, slug } ; vocab ids have no lang: "coreen/week-01" */
export function parts(id: string, withLang = true) {
  const p = id.split('/');
  const lang = (withLang ? p.shift() : undefined) as Lang;
  const subject = p.shift()!;
  return { lang, subject, slug: p.join('/') };
}

export async function inLang<C extends 'units' | 'lessons' | 'formulas' | 'quiz'>(c: C, lang: Lang) {
  return (await getCollection(c)).filter((e) => e.id.startsWith(lang + '/'));
}

export async function unitsOf(lang: Lang, subject: string) {
  return (await inLang('units', lang))
    .filter((u) => parts(u.id).subject === subject)
    .sort((a, b) => a.data.order - b.data.order);
}

export async function subjectsList(lang: Lang) {
  const set = new Set<string>();
  for (const c of ['units', 'lessons', 'formulas', 'quiz'] as const) for (const e of await inLang(c, lang)) set.add(parts(e.id).subject);
  for (const v of await getCollection('vocab')) set.add(parts(v.id, false).subject);
  return [...set].sort();
}

export const esc = (s = '') =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export const tex = (s: string, displayMode = false) => katex.renderToString(s, { displayMode, throwOnError: false });

/** Texte avec maths inline $...$ et **gras** */
export const mathText = (s = '') =>
  s.split(/\$([^$]+)\$/g).map((part, i) => (i % 2 ? tex(part) : esc(part).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>'))).join('');

const mnemo = (m?: string) => (m ? `<div class="mnemo">💡 ${mathText(m)}</div>` : '');

export async function allCards(lang: Lang): Promise<Card[]> {
  const other: Lang = lang === 'fr' ? 'en' : 'fr';
  const cards: Card[] = [];
  for (const v of await getCollection('vocab')) {
    const { subject, slug: unit } = parts(v.id, false);
    const deck = `vocab/${v.id}`;
    const speech = subjectConf(subject).speech;
    for (const g of v.data.groups)
      for (const c of g.cards) {
        const known = `<div class="term">${esc(c[lang])}</div><div class="muted">${esc(c[other])}</div>`;
        const target = `<div class="term" lang="${v.data.lang}">${esc(c.term)}</div>${c.reading ? `<div class="muted">${esc(c.reading)}</div>` : ''}`;
        const extra = `${c.example ? `<div class="muted small" lang="${v.data.lang}">${esc(c.example)}</div>` : ''}${mnemo(c.mnemonic?.[lang] ?? g.mnemonic?.[lang])}`;
        cards.push({
          id: `${deck}#${c.term}`, subject, unit, deck,
          front: `<div class="eyebrow">${esc(g.name[lang])}</div>${target}`,
          back: known + extra,
          rfront: `<div class="eyebrow">${esc(g.name[lang])}</div>${known}`,
          rback: target + extra,
          speak: speech ? c.term : undefined,
        });
      }
  }
  for (const u of await inLang('units', lang)) {
    const { subject, slug: unit } = parts(u.id);
    const deck = `units/${subject}/${unit}`;
    u.data.notions.forEach((n, i) =>
      cards.push({
        id: `${deck}#${i}`, subject, unit, deck,
        front: `<div class="eyebrow">${esc(n.category)}</div><div class="term">${mathText(n.name)}</div>`,
        back: `<div>${mathText(n.explanation)}</div>${n.examples[0] ? `<div class="muted small">${esc(n.examples[0].text)} — ${esc(n.examples[0].tr)}</div>` : ''}${mnemo(n.mnemonic)}`,
      }));
  }
  for (const f of await inLang('formulas', lang)) {
    const { subject, slug } = parts(f.id);
    const deck = `formulas/${subject}/${slug}`;
    let i = 0;
    for (const ch of f.data.chapters)
      for (const x of ch.formulas)
        cards.push({
          id: `${deck}#${i++}`, subject, unit: f.data.unit ?? '', deck,
          front: `<div class="eyebrow">${esc(ch.chapter)}</div><div class="term">${esc(x.name)}</div>`,
          back: `${tex(x.latex, true)}<div class="muted">${mathText(x.when_to_use)}</div>`,
        });
  }
  return cards;
}
