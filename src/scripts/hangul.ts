const L = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
const V = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';
const T = ['', ...'ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ'];
const VC: Record<string, string> = { ㅗㅏ: 'ㅘ', ㅗㅐ: 'ㅙ', ㅗㅣ: 'ㅚ', ㅜㅓ: 'ㅝ', ㅜㅔ: 'ㅞ', ㅜㅣ: 'ㅟ', ㅡㅣ: 'ㅢ' };
const TC: Record<string, string> = { ㄱㅅ: 'ㄳ', ㄴㅈ: 'ㄵ', ㄴㅎ: 'ㄶ', ㄹㄱ: 'ㄺ', ㄹㅁ: 'ㄻ', ㄹㅂ: 'ㄼ', ㄹㅅ: 'ㄽ', ㄹㅌ: 'ㄾ', ㄹㅍ: 'ㄿ', ㄹㅎ: 'ㅀ', ㅂㅅ: 'ㅄ' };
const inv = (o: Record<string, string>) => Object.fromEntries(Object.entries(o).map(([k, v]) => [v, k]));
const VCi = inv(VC), TCi = inv(TC);

/** Syllabes -> suite de jamo (ex. 닭 -> ㄷ ㅏ ㄹ ㄱ) */
export function disassemble(s: string): string[] {
  const out: string[] = [];
  for (const ch of s) {
    const c = ch.codePointAt(0)!;
    if (c >= 0xac00 && c <= 0xd7a3) {
      const n = c - 0xac00, l = Math.floor(n / 588), v = Math.floor((n % 588) / 28), t = n % 28;
      out.push(L[l]);
      out.push(...(VCi[V[v]] ?? V[v]));
      if (t) out.push(...(TCi[T[t]] ?? T[t]));
    } else out.push(ch);
  }
  return out;
}

/** Suite de jamo -> texte (composition type IME dubeolsik) */
export function assemble(tokens: string[]): string {
  let out = '', l = -1, v = -1, t1 = '', t2 = '';
  const flush = () => {
    if (l < 0) return;
    out += v < 0 ? L[l] : String.fromCharCode(0xac00 + (l * 21 + v) * 28 + T.indexOf(t2 ? TC[t1 + t2] : t1));
    l = v = -1; t1 = t2 = '';
  };
  for (const j of tokens) {
    const li = L.indexOf(j), vi = V.indexOf(j);
    if (li >= 0) {
      if (l >= 0 && v >= 0) {
        if (!t1 && T.indexOf(j) > 0) { t1 = j; continue; }
        if (t1 && !t2 && TC[t1 + j]) { t2 = j; continue; }
      }
      flush(); l = li;
    } else if (vi >= 0) {
      if (l >= 0 && v < 0) { v = vi; continue; }
      if (l >= 0 && v >= 0) {
        if (!t1) { const c = VC[V[v] + j]; if (c) { v = V.indexOf(c); continue; } }
        else {
          const move = t2 || t1;
          if (t2) t2 = ''; else t1 = '';
          flush(); l = L.indexOf(move); v = vi; continue;
        }
      }
      flush(); out += j;
    } else { flush(); out += j; }
  }
  flush();
  return out;
}

// [lettre, jamo, jamo avec Maj?]
const ROWS: string[][][] = [
  [['q', 'ㅂ', 'ㅃ'], ['w', 'ㅈ', 'ㅉ'], ['e', 'ㄷ', 'ㄸ'], ['r', 'ㄱ', 'ㄲ'], ['t', 'ㅅ', 'ㅆ'], ['y', 'ㅛ'], ['u', 'ㅕ'], ['i', 'ㅑ'], ['o', 'ㅐ', 'ㅒ'], ['p', 'ㅔ', 'ㅖ']],
  [['a', 'ㅁ'], ['s', 'ㄴ'], ['d', 'ㅇ'], ['f', 'ㄹ'], ['g', 'ㅎ'], ['h', 'ㅗ'], ['j', 'ㅓ'], ['k', 'ㅏ'], ['l', 'ㅣ']],
  [['z', 'ㅋ'], ['x', 'ㅌ'], ['c', 'ㅊ'], ['v', 'ㅍ'], ['b', 'ㅠ'], ['n', 'ㅜ'], ['m', 'ㅡ']],
];
const MAP = Object.fromEntries(ROWS.flat().map(([k, a, b]) => [k, [a, b ?? a]]));

const pref = {
  get: () => { try { return localStorage.getItem('rev-kb'); } catch { return null; } },
  set: (v: string) => { try { localStorage.setItem('rev-kb', v); } catch {} },
};

/** Clavier hangeul virtuel + saisie par touches physiques (lettres -> jamo). */
const AZ: Record<string, string> = { q: 'a', w: 'z', a: 'q', z: 'w', m: ',' }; // QWERTY -> étiquette AZERTY (même position physique)
const lpref = {
  get: () => { try { return localStorage.getItem('rev-kbl'); } catch { return null; } },
  set: (v: string) => { try { localStorage.setItem('rev-kbl', v); } catch {} },
};
export function mountHangul(input: HTMLInputElement, kbd: HTMLElement, toggle: HTMLInputElement, layoutSel?: HTMLSelectElement) {
  // QWERTY : touche = lettre imprimée (event.key). AZERTY : touche = position physique (event.code), comme un clavier coréen collé sur AZERTY.
  let layout = lpref.get() ?? (navigator.language.startsWith('fr') ? 'azerty' : 'qwerty');
  (navigator as any).keyboard?.getLayoutMap?.().then((m: Map<string, string>) => {
    if (!lpref.get() && m.get('KeyQ') === 'a') setLayout('azerty');
  }).catch(() => {});
  const label = (k: string) => (layout === 'azerty' ? AZ[k] ?? k : k);
  let on = false, shift = false;
  const push = (tok: string) => { input.value = assemble([...disassemble(input.value), tok]); };
  const back = () => { const t = disassemble(input.value); t.pop(); input.value = assemble(t); };

  const mk = (cls: string, html: string, act: () => void) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'key ' + cls; b.innerHTML = html;
    b.addEventListener('mousedown', (e) => e.preventDefault());
    b.addEventListener('click', () => { act(); if (!(document.activeElement instanceof HTMLInputElement) && matchMedia('(pointer: fine)').matches) input.focus(); });
    return b;
  };
  const keys: { el: HTMLElement; k: string }[] = [];
  const render = () => keys.forEach(({ el, k }) => { const [a, b] = MAP[k]; el.firstChild!.textContent = shift ? b : a; el.querySelector('small')!.textContent = label(k); });
  function setLayout(v: string) { layout = v; if (layoutSel) layoutSel.value = v; render(); }
  layoutSel?.addEventListener('change', () => { lpref.set(layoutSel.value); setLayout(layoutSel.value); });
  const press = (k: string) => { push(MAP[k][shift ? 1 : 0]); if (shift) { shift = false; shiftBtn.classList.remove('on'); render(); } };

  const shiftBtn = mk('wide', '⇧', () => { shift = !shift; shiftBtn.classList.toggle('on', shift); render(); });
  ROWS.forEach((row, i) => {
    const r = document.createElement('div'); r.className = 'kbd-row';
    if (i === 2) r.append(shiftBtn);
    for (const [k, a] of row) {
      const el = mk('', `${a}<small>${k}</small>`, () => press(k));
      keys.push({ el, k }); r.append(el);
    }
    if (i === 2) r.append(mk('wide', '⌫', back));
    kbd.append(r);
  });
  const last = document.createElement('div'); last.className = 'kbd-row';
  last.append(mk('space', '␣', () => push(' ')));
  kbd.append(last);

  const apply = (v: boolean) => {
    on = v; toggle.checked = v; kbd.hidden = !v;
    input.inputMode = v ? 'none' : 'text';
    pref.set(v ? '1' : '0');
  };
  toggle.addEventListener('change', () => apply(toggle.checked));
  const saved = pref.get();
  apply(saved ? saved === '1' : matchMedia('(pointer: fine)').matches);
  setLayout(layout);

  input.addEventListener('keydown', (e) => {
    if (!on || e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return;
    if (e.key === 'Backspace') { e.preventDefault(); back(); }
    else if (e.key === ' ') { e.preventDefault(); push(' '); }
    else {
      const k = layout === 'azerty' ? (/^Key([A-Z])$/.exec(e.code)?.[1].toLowerCase() ?? (e.code === 'Comma' ? 'm' : '')) : /^[a-zA-Z]$/.test(e.key) ? e.key.toLowerCase() : '';
      if (MAP[k]) { e.preventDefault(); push(MAP[k][e.shiftKey ? 1 : 0]); }
    }
  });
}

export const normAnswer = (s: string) => s.normalize('NFC').replace(/[\s.,!?~…'"]/g, '');
