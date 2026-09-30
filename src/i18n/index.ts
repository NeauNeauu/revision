import fr from './fr.json';
import en from './en.json';

export const langs = ['fr', 'en'] as const;
export type Lang = (typeof langs)[number];
const dict = { fr, en };

export function t(lang: Lang, key: string): string {
  return key.split('.').reduce((o: any, k) => o?.[k], dict[lang]) ?? key;
}
export const subjectName = (lang: Lang, s: string) => (dict[lang].subjects as Record<string, string>)[s] ?? s;
export const langPaths = () => langs.map((lang) => ({ params: { lang } }));
