const K = 'rev-slow';
export const isSlow = () => { try { return localStorage.getItem(K) === '1'; } catch { return false; } };
/** Branche une case à cocher « audio lent » (préférence mémorisée) */
export function mountSlow(box: HTMLInputElement) {
  box.checked = isSlow();
  box.addEventListener('change', () => { try { localStorage.setItem(K, box.checked ? '1' : '0'); } catch {} });
}
export function speak(text: string, lang: string) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang; u.rate = isSlow() ? 0.5 : 0.9;
  const v = speechSynthesis.getVoices().find((x) => x.lang.replace('_', '-').startsWith(lang.split('-')[0]));
  if (v) u.voice = v;
  speechSynthesis.speak(u);
}
/** Active tous les boutons [data-speak] de la page */
export function bindSpeak(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('[data-speak]').forEach((b) =>
    b.addEventListener('click', (e) => { e.stopPropagation(); speak(b.dataset.speak!, b.dataset.lang!); }));
}
