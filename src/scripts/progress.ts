export type CardState = { box: number; due: string };
export type Progress = {
  version: 1; updatedAt: string;
  cards: Record<string, CardState>;
  quiz: Record<string, { best: number; last: number }>;
};

const PK = 'rev-progress', CK = 'rev-code';
const INTERVALS = [0, 1, 3, 7, 14, 30]; // days, index = Leitner box
const ls = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch {} },
};
const EPOCH = new Date(0).toISOString();
const empty = (): Progress => ({ version: 1, updatedAt: EPOCH, cards: {}, quiz: {} });

export const today = (d = new Date()) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const inDays = (n: number) => today(new Date(Date.now() + n * 86400000));

export function load(): Progress {
  try { const p = JSON.parse(ls.get(PK) ?? ''); if (p?.version === 1) return p; } catch {}
  return empty();
}
const store = (p: Progress) => ls.set(PK, JSON.stringify(p));
function save(p: Progress) { p.updatedAt = new Date().toISOString(); store(p); schedulePush(); }

export const getCode = () => ls.get(CK);
export function setCode(c: string) {
  ls.set(CK, c.trim().toLowerCase());
  const p = load(); p.updatedAt = EPOCH; store(p); // remote wins on next sync
}
export function genCode() {
  const a = 'abcdefghjkmnpqrstuvwxyz23456789';
  const s = Array.from(crypto.getRandomValues(new Uint8Array(12)), (x) => a[x % a.length]).join('');
  return s.match(/.{4}/g)!.join('-');
}

export const isDue = (p: Progress, id: string) => { const c = p.cards[id]; return !c || c.due <= today(); };
export function grade(id: string, ok: boolean) {
  const p = load();
  const box = ok ? Math.min((p.cards[id]?.box ?? 0) + 1, 5) : 1;
  p.cards[id] = { box, due: ok ? inDays(INTERVALS[box]) : today() };
  save(p);
}
export function saveQuiz(id: string, score: number) {
  const p = load();
  p.quiz[id] = { best: Math.max(p.quiz[id]?.best ?? 0, score), last: score };
  save(p);
}

const api = (c: string) => `/api/progress?code=${encodeURIComponent(c)}`;
let timer: ReturnType<typeof setTimeout> | undefined, dirty = false;
function schedulePush() { dirty = true; clearTimeout(timer); timer = setTimeout(push, 2000); }

export async function push(keepalive = false) {
  const c = getCode();
  if (!c || !dirty) return;
  dirty = false;
  try {
    const r = await fetch(api(c), { method: 'PUT', body: JSON.stringify(load()), headers: { 'content-type': 'application/json' }, keepalive });
    if (r.status === 409) store(await r.json());
    else if (!r.ok) dirty = true;
  } catch { dirty = true; }
}

export async function sync(): Promise<'off' | 'ok' | 'error'> {
  const c = getCode();
  if (!c) return 'off';
  try {
    const r = await fetch(api(c));
    if (!r.ok) throw r.status;
    const remote = (await r.json()) as Progress | null;
    const local = load();
    if (remote && remote.updatedAt >= local.updatedAt) store(remote);
    else { dirty = true; await push(); }
    return dirty ? 'error' : 'ok';
  } catch { return 'error'; }
}

document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') push(true); });
