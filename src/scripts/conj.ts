/** Moteur de conjugaison coréen (forme polie). Règles : voir Weeks 2–5. */
const B = 0xac00;
const dec = (ch: string) => { const n = ch.charCodeAt(0) - B; return [Math.floor(n / 588), Math.floor((n % 588) / 28), n % 28] as const; };
const comp = (l: number, v: number, t: number) => String.fromCharCode(B + l * 588 + v * 28 + t);
const isH = (ch: string) => ch >= '가' && ch <= '힣';
const V = { a: 0, ae: 1, eo: 4, e: 5, yeo: 6, o: 8, wa: 9, oe: 11, u: 13, wo: 14, eu: 18, i: 20 };
const T = { d: 7, l: 8, b: 17, ss: 20 };
const bright = (v: number) => v === V.a || v === V.o;
const last = (s: string) => s[s.length - 1];
const head = (s: string) => s.slice(0, -1);
const withT = (syl: string, t: number) => { const [l, v] = dec(syl); return comp(l, v, t); };

const D_IRR = ['듣', '걷', '묻'];
const B_IRR = ['춥', '덥', '맵', '쉽', '어렵', '무겁', '가볍', '가깝'];
const REU_IRR = ['빠르', '다르', '부르', '모르'];

export type Form = 'present' | 'past' | 'future' | 'can' | 'seyo' | 'jimaseyo' | 'gosipeo' | 'reo' | 'boseyo' | 'jianayo' | 'mod';
export const FORMS_VERB: Form[] = ['present', 'past', 'future', 'can', 'seyo', 'jimaseyo', 'gosipeo', 'reo', 'boseyo', 'jianayo'];
export const FORMS_ADJ: Form[] = ['present', 'past', 'jianayo', 'mod'];

const stemOf = (w: string) => w.slice(0, -1);

/** Présent poli sans « 요 »-final tronqué : retourne la forme complète en -요 */
function present(w: string): string {
  const s = stemOf(w), L = last(s), [l, v, t] = dec(L);
  if (s.endsWith('하')) return head(s) + '해요';
  if (REU_IRR.includes(s)) { const p = s[s.length - 2]; return head(head(s)) + withT(p, T.l) + (bright(dec(p)[1]) ? '라요' : '러요'); }
  if (t === 0 && v === V.eu) { // 으 탈락
    const p = s[s.length - 2];
    const vow = p && isH(p) ? (bright(dec(p)[1]) ? V.a : V.eo) : V.eo;
    return head(s) + comp(l, vow, 0) + '요';
  }
  if (D_IRR.includes(s.slice(-1)) || D_IRR.includes(s)) return head(s) + withT(L, T.l) + (bright(v) ? '아요' : '어요');
  if (B_IRR.some((x) => s.endsWith(x))) return head(s) + comp(l, v, 0) + '워요';
  if (t === 0) { // voyelle finale
    if (v === V.a || v === V.eo || v === V.ae || v === V.e || v === V.yeo) return s + '요';
    if (v === V.o) return head(s) + comp(l, V.wa, 0) + '요';
    if (v === V.u) return head(s) + comp(l, V.wo, 0) + '요';
    if (v === V.i) return head(s) + comp(l, V.yeo, 0) + '요';
    if (v === V.oe) return head(s) + comp(l, 10, 0) + '요';
    return s + '어요';
  }
  return s + (bright(v) ? '아요' : '어요');
}

/** Radical modifié devant une voyelle (ㄷ→ㄹ, ㅂ→우) pour -(으)… */
function vstem(s: string): string {
  const L = last(s);
  if (D_IRR.includes(s)) return head(s) + withT(L, T.l);
  if (B_IRR.some((x) => s.endsWith(x))) { const [l, v] = dec(L); return head(s) + comp(l, v, 0) + '우'; }
  return s;
}
const hasT = (s: string) => dec(last(s))[2] > 0;
const isL = (s: string) => dec(last(s))[2] === T.l;

export function conj(w: string, f: Form): string {
  const s = stemOf(w), d = D_IRR.includes(s), v = vstem(s), L = isL(s), T0 = hasT(v);
  switch (f) {
    case 'present': return present(w);
    case 'past': { const p = present(w).slice(0, -1); return head(p) + withT(last(p), T.ss) + '어요'; }
    case 'future': case 'can': {
      const tail = f === 'future' ? ' 거예요' : ' 수 있어요';
      if (d) return v + '을' + tail;
      if (L) return s + tail;
      return (T0 ? v + '을' : head(v) + withT(last(v), T.l)) + tail;
    }
    case 'seyo':
      if (w === '먹다' || w === '마시다') return '드세요';
      if (d) return v + '으세요';
      if (L) return head(s) + withT(last(s), 0) + '세요';
      return v + (T0 ? '으세요' : '세요');
    case 'jimaseyo': return s + '지 마세요';
    case 'jianayo': return s + '지 않아요';
    case 'gosipeo': return s + '고 싶어요';
    case 'reo': return v + (d || (T0 && !L) ? '으러' : '러') + ' 가요';
    case 'boseyo': return w === '보다' ? '보세요' : present(w).slice(0, -1) + ' 보세요';
    case 'mod':
      if (/있$|없$/.test(s)) return s + '는';
      if (L) return head(s) + withT(last(s), 0).replace(/./, (c) => comp(dec(c)[0], dec(c)[1], 4));
      return T0 ? v + '은' : head(v) + withT(last(v), 4);
  }
}
