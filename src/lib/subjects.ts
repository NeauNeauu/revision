import type { Lang } from '../i18n';

/** Config par matière. unit = libellé des unités ; speech = langue de synthèse vocale (BCP-47). */
export const SUBJECTS: Record<string, { unit: { fr: string; en: string }; speech?: string; icon: string }> = {
  coreen: { unit: { fr: 'Week', en: 'Week' }, speech: 'ko-KR', icon: '한' },
  bi: { unit: { fr: 'Chapitre', en: 'Chapter' }, icon: 'BI' },
  android: { unit: { fr: 'Chapitre', en: 'Chapter' }, icon: 'A' },
  maba: { unit: { fr: 'Thème', en: 'Topic' }, icon: 'AI' },
};
const fallback = { unit: { fr: 'Chapitre', en: 'Chapter' }, icon: '•' };
export const subjectConf = (s: string) => SUBJECTS[s] ?? fallback;
export const unitLabel = (lang: Lang, s: string) => subjectConf(s).unit[lang];
