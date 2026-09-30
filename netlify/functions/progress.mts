import { getStore } from '@netlify/blobs';

const CODE = /^[a-z0-9-]{8,64}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_BYTES = 256 * 1024;
const json = (d: unknown, status = 200) =>
  new Response(JSON.stringify(d), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

const isObj = (o: unknown): o is Record<string, any> => !!o && typeof o === 'object' && !Array.isArray(o);
function valid(p: any): boolean {
  if (!isObj(p) || p.version !== 1 || typeof p.updatedAt !== 'string' || isNaN(Date.parse(p.updatedAt))) return false;
  if (!isObj(p.cards) || !isObj(p.quiz)) return false;
  const keys = Object.keys(p).sort().join();
  if (keys !== 'cards,quiz,updatedAt,version') return false;
  for (const [k, c] of Object.entries(p.cards))
    if (k.length > 200 || !isObj(c) || !Number.isInteger(c.box) || c.box < 1 || c.box > 5 || !DATE.test(c.due) || Object.keys(c).length !== 2) return false;
  for (const [k, q] of Object.entries(p.quiz))
    if (k.length > 200 || !isObj(q) || [q.best, q.last].some((n) => typeof n !== 'number' || n < 0 || n > 100) || Object.keys(q).length !== 2) return false;
  return true;
}

export default async (req: Request) => {
  const code = new URL(req.url).searchParams.get('code') ?? '';
  if (!CODE.test(code)) return json({ error: 'invalid code' }, 400);
  const store = getStore({ name: 'progress', consistency: 'strong' });
  const key = `progress/${code}`;

  if (req.method === 'GET') return json((await store.get(key, { type: 'json' })) ?? null);

  if (req.method === 'PUT') {
    const body = await req.text();
    if (body.length > MAX_BYTES) return json({ error: 'too large' }, 413);
    let p: any;
    try { p = JSON.parse(body); } catch { return json({ error: 'invalid json' }, 400); }
    if (!valid(p)) return json({ error: 'invalid format' }, 422);
    const cur: any = await store.get(key, { type: 'json' });
    if (cur && cur.updatedAt > p.updatedAt) return json(cur, 409);
    await store.setJSON(key, p);
    return json({ ok: true });
  }
  return json({ error: 'method not allowed' }, 405);
};

export const config = { path: '/api/progress' };
