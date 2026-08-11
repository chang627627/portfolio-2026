// Shared comments for the slide decks (coffeeslide, homewiseslide): the
// Figma-style pins used to live in each reviewer's own localStorage; this
// endpoint gives every deck one common store so everyone sees everyone's
// pins. Backed by the PRIVATE `deck-comments` Vercel Blob store, one JSON
// array per deck, readable only through this endpoint. Writes are
// read-modify-write (last write wins), fine at portfolio traffic.
// GET    ?deck=coffeeslide&me=<authorKey>  -> { comments: [{id, slide, x, y, name, text, ts, own}] }
// POST   { deck, authorKey, comment: { slide, x, y, name, text } }
// DELETE { deck, authorKey, id }  (only the pin's author may delete it)
const { put, head } = require('@vercel/blob');

const DECKS = ['coffeeslide', 'homewiseslide'];
const MAX_COMMENTS = 800;

async function readComments(deck) {
  try {
    const h = await head(`comments/${deck}.json`);
    const r = await fetch(h.url, {
      headers: { authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
    });
    if (!r.ok) return [];
    const data = await r.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return []; // no blob yet: first comment ever creates it
  }
}

async function writeComments(deck, arr) {
  await put(`comments/${deck}.json`, JSON.stringify(arr), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
}

const publicView = (c, me) => ({
  id: c.id, slide: c.slide, x: c.x, y: c.y, name: c.name, text: c.text, ts: c.ts,
  own: Boolean(me) && c.authorKey === me,
});

module.exports = async function handler(req, res) {
  const ALLOWED_ORIGINS = [
    'https://www.chang-mou.com',
    'https://chang-mou.com',
    'https://chang-mou-portfolio.vercel.app',
  ];
  const origin = req.headers.origin;
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Best-effort rate limit: 60 requests / 5 min per IP, per warm instance
  const ip = ((req.headers['x-forwarded-for'] || '').split(',')[0] || '').trim() || 'unknown';
  const now = Date.now();
  globalThis.__cmtRate = globalThis.__cmtRate || new Map();
  if (globalThis.__cmtRate.size > 500) globalThis.__cmtRate.clear();
  const hits = (globalThis.__cmtRate.get(ip) || []).filter((t) => now - t < 5 * 60 * 1000);
  if (hits.length >= 60) return res.status(429).json({ error: 'Too many requests. Try again in a few minutes.' });
  hits.push(now);
  globalThis.__cmtRate.set(ip, hits);

  try {
    if (req.method === 'GET') {
      const deck = req.query.deck;
      if (!DECKS.includes(deck)) return res.status(400).json({ error: 'Unknown deck' });
      const me = typeof req.query.me === 'string' ? req.query.me.slice(0, 64) : '';
      const comments = await readComments(deck);
      return res.status(200).json({ comments: comments.map((c) => publicView(c, me)) });
    }

    if (req.method === 'POST') {
      const { deck, authorKey, comment } = req.body || {};
      if (!DECKS.includes(deck)) return res.status(400).json({ error: 'Unknown deck' });
      if (typeof authorKey !== 'string' || !authorKey) return res.status(400).json({ error: 'Missing author key' });
      if (!comment || typeof comment.text !== 'string' || !comment.text.trim()) {
        return res.status(400).json({ error: 'Comment text is required' });
      }
      const clamp01 = (v) => Math.min(Math.max(Number(v) || 0, 0), 1);
      const entry = {
        id: require('crypto').randomUUID(),
        ts: Date.now(),
        slide: Math.min(Math.max(parseInt(comment.slide, 10) || 0, 0), 60),
        x: clamp01(comment.x),
        y: clamp01(comment.y),
        name: String(comment.name || 'Anonymous').slice(0, 60),
        text: comment.text.slice(0, 1000),
        authorKey: authorKey.slice(0, 64),
      };
      const comments = await readComments(deck);
      if (comments.length >= MAX_COMMENTS) return res.status(400).json({ error: 'Comment limit reached' });
      comments.push(entry);
      await writeComments(deck, comments);
      return res.status(200).json({ comment: publicView(entry, entry.authorKey) });
    }

    if (req.method === 'DELETE') {
      const { deck, authorKey, id } = req.body || {};
      if (!DECKS.includes(deck)) return res.status(400).json({ error: 'Unknown deck' });
      const comments = await readComments(deck);
      const target = comments.find((c) => c.id === id);
      if (!target) return res.status(404).json({ error: 'Not found' });
      if (!authorKey || target.authorKey !== authorKey) return res.status(403).json({ error: 'Not your note' });
      await writeComments(deck, comments.filter((c) => c.id !== id));
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('comments error:', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};
