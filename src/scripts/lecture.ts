// Suivi de lecture : sections "vues" (localStorage), progression, section courante.
export function bindLecture(deck: string) {
  const key = `seen:${deck}`;
  let seen = new Set<number>();
  try { seen = new Set(JSON.parse(localStorage.getItem(key) || '[]')); } catch {}
  const secs = [...document.querySelectorAll<HTMLElement>('.lsec')];
  const fill = document.getElementById('lbar-fill');
  const txt = document.getElementById('lbar-txt');
  secs.forEach((s) => { const b = s.querySelector<HTMLButtonElement>('.seen')!; b.dataset.f = b.textContent!; });
  const render = () => {
    secs.forEach((s, i) => {
      const on = seen.has(i + 1);
      s.classList.toggle('done', on);
      const b = s.querySelector<HTMLButtonElement>('.seen')!;
      b.setAttribute('aria-pressed', String(on));
      b.textContent = on ? b.dataset.t! : b.dataset.f!;
      document.querySelector(`.ltoc a[data-s="${i + 1}"]`)?.classList.toggle('done', on);
    });
    if (fill) fill.style.width = `${(seen.size / secs.length) * 100}%`;
    if (txt) txt.textContent = (txt.dataset.tpl || '{n}/{t}').replace('{n}', String(seen.size)).replace('{t}', String(secs.length));
  };
  secs.forEach((s, i) => s.querySelector('.seen')!.addEventListener('click', () => {
    seen.has(i + 1) ? seen.delete(i + 1) : seen.add(i + 1);
    try { localStorage.setItem(key, JSON.stringify([...seen])); } catch {}
    render();
  }));
  render();
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) {
      document.querySelectorAll('.ltoc a.cur').forEach((a) => a.classList.remove('cur'));
      document.querySelector(`.ltoc a[href="#${e.target.id}"]`)?.classList.add('cur');
    }
  }), { rootMargin: '-30% 0px -60% 0px' });
  secs.forEach((s) => io.observe(s));
}
