// Carte au survol des termes du glossaire (a.gl). Souris : survol. Tactile : 1er tap = carte, 2e tap = lien.
export function bindGlossary() {
  const links = document.querySelectorAll<HTMLAnchorElement>('a.gl');
  if (!links.length) return;
  const card = document.createElement('div');
  card.className = 'glcard';
  card.setAttribute('role', 'tooltip');
  card.hidden = true;
  document.body.append(card);
  let cur: HTMLAnchorElement | null = null;
  let touch = false;
  const show = (a: HTMLAnchorElement) => {
    cur = a;
    const b = document.createElement('strong');
    b.textContent = a.dataset.term ?? '';
    const p = document.createElement('p');
    p.textContent = a.dataset.def ?? '';
    card.replaceChildren(b, p);
    card.hidden = false;
    const r = a.getBoundingClientRect();
    const w = Math.min(320, innerWidth - 24);
    card.style.width = `${w}px`;
    card.style.left = `${scrollX + Math.max(12, Math.min(r.left, innerWidth - w - 12))}px`;
    const below = r.bottom + 8 + card.offsetHeight < innerHeight;
    card.style.top = `${scrollY + (below ? r.bottom + 8 : r.top - card.offsetHeight - 8)}px`;
  };
  const hide = () => { card.hidden = true; cur = null; };
  links.forEach((a) => {
    a.addEventListener('pointerdown', (e) => { touch = e.pointerType !== 'mouse'; });
    a.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') show(a); });
    a.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') hide(); });
    a.addEventListener('focus', () => { if (!touch) show(a); });
    a.addEventListener('blur', hide);
    a.addEventListener('click', (e) => { if (touch && cur !== a) { e.preventDefault(); show(a); } });
  });
  document.addEventListener('pointerdown', (e) => { if (!(e.target as Element).closest?.('a.gl')) hide(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });
}
