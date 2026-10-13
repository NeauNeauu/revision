import fs from 'node:fs';
import path from 'node:path';

// [[id]] ou [[id|texte]] → lien vers la notion + carte au survol.
// Définitions : src/content/glossary/<matiere>.json. La langue et la matière viennent du chemin du fichier.
const RE = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
const cache = new Map();
const load = (subject) => {
  if (!cache.has(subject)) {
    const f = path.resolve('src/content/glossary', `${subject}.json`);
    cache.set(subject, fs.existsSync(f) ? Object.fromEntries(JSON.parse(fs.readFileSync(f, 'utf8')).terms.map((t) => [t.id, t])) : {});
  }
  return cache.get(subject);
};
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

export default function remarkGlossary() {
  return (tree, file) => {
    const m = String(file.path ?? file.history?.[0] ?? '').match(/content\/[^/]+\/(fr|en)\/([^/]+)\//);
    if (!m) return;
    const [, lang, subject] = m;
    const terms = load(subject);
    const walk = (node) => {
      if (!node.children) return;
      const kids = []; // le parseur peut couper le texte sur les crochets : on refusionne
      for (const c of node.children) {
        const last = kids[kids.length - 1];
        if (c.type === 'text' && last?.type === 'text') last.value += c.value;
        else kids.push(c);
      }
      node.children = kids.flatMap((c) => {
        if (c.type !== 'text' || !c.value.includes('[[')) { walk(c); return [c]; }
        const out = [];
        let i = 0;
        for (const x of c.value.matchAll(RE)) {
          const t = terms[x[1].trim()];
          const label = x[2] ?? t?.[lang].term ?? x[1];
          if (x.index > i) out.push({ type: 'text', value: c.value.slice(i, x.index) });
          out.push(t
            ? { type: 'html', value: `<a class="gl" href="/${lang}/${subject}/${t.topic}/${t.anchor ? '#' + t.anchor : ''}" data-term="${esc(t[lang].term)}" data-def="${esc(t[lang].def)}">${esc(label)}</a>` }
            : { type: 'text', value: label });
          i = x.index + x[0].length;
        }
        if (i < c.value.length) out.push({ type: 'text', value: c.value.slice(i) });
        return out;
      });
    };
    walk(tree);
  };
}
