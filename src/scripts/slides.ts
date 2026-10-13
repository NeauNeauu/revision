// Galerie des diapos : tap = plein écran, flèches / swipe pour naviguer.
export function bindSlides() {
  const lb = document.getElementById('lb') as HTMLDialogElement | null;
  if (!lb) return;
  const img = lb.querySelector('img')!;
  const all = [...document.querySelectorAll<HTMLButtonElement>('button.slide')];
  let i = 0;
  const go = (k: number) => { i = (k + all.length) % all.length; img.src = all[i].dataset.src!; };
  all.forEach((b, k) => b.addEventListener('click', () => { go(k); lb.showModal(); }));
  lb.querySelector('.lb-p')!.addEventListener('click', () => go(i - 1));
  lb.querySelector('.lb-n')!.addEventListener('click', () => go(i + 1));
  lb.querySelector('.lb-x')!.addEventListener('click', () => lb.close());
  lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
  lb.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') go(i - 1);
    if (e.key === 'ArrowRight') go(i + 1);
  });
  let x0 = 0;
  img.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  img.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) go(dx < 0 ? i + 1 : i - 1);
  });
}
