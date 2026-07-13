import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import { requireAuth as requireAuthentication } from './auth-middleware';

type Bindings = { DB: D1Database; JWT_SECRET: string };

const app = new Hono<{ Bindings: Bindings }>();

const requireAuth = async (c: any, next: any) => {
  const result = await requireAuthentication(c.req.header('Authorization'), c.env.JWT_SECRET);
  if (!result.success) return c.json({ error: result.error || '認証が必要です' }, 401);
  c.set('userId', result.user.userId);
  await next();
};

// GET /api/favorites - お気に入り一覧取得
app.get('/', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { results } = await c.env.DB.prepare(`
      SELECT uf.id, uf.site_id, uf.created_at,
             s.name as site_name, s.type as site_type,
             s.address, s.image_url
      FROM user_favorites uf
      JOIN sites s ON uf.site_id = s.id
      WHERE uf.user_id = ?
      ORDER BY uf.created_at DESC
    `).bind(userId).all();

    return c.json({ favorites: results || [], count: results?.length || 0 });
  } catch (error: unknown) {
    console.error('お気に入り取得エラー:', error);
    return c.json({ error: 'お気に入りの取得に失敗しました' }, 500);
  }
});

// GET /api/favorites/count - お気に入り件数のみ
app.get('/count', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const row = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM user_favorites WHERE user_id = ?'
    ).bind(userId).first() as { count: number } | null;
    return c.json({ count: row?.count || 0 });
  } catch (error: unknown) {
    console.error('お気に入り件数取得エラー:', error);
    return c.json({ error: 'お気に入り件数の取得に失敗しました' }, 500);
  }
});

// POST /api/favorites/:siteId - お気に入り追加
app.post('/:siteId', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const siteId = c.req.param('siteId');

    const site = await c.env.DB.prepare('SELECT id FROM sites WHERE id = ?').bind(siteId).first();
    if (!site) return c.json({ error: '施設が見つかりません' }, 404);

    const id = `fav_${nanoid()}`;
    await c.env.DB.prepare(
      'INSERT OR IGNORE INTO user_favorites (id, user_id, site_id) VALUES (?, ?, ?)'
    ).bind(id, userId, siteId).run();

    return c.json({ success: true, message: 'お気に入りに追加しました' });
  } catch (error: unknown) {
    console.error('お気に入り追加エラー:', error);
    return c.json({ error: 'お気に入りの追加に失敗しました' }, 500);
  }
});

// DELETE /api/favorites/:siteId - お気に入り解除
app.delete('/:siteId', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const siteId = c.req.param('siteId');

    await c.env.DB.prepare(
      'DELETE FROM user_favorites WHERE user_id = ? AND site_id = ?'
    ).bind(userId, siteId).run();

    return c.json({ success: true, message: 'お気に入りを解除しました' });
  } catch (error: unknown) {
    console.error('お気に入り解除エラー:', error);
    return c.json({ error: 'お気に入りの解除に失敗しました' }, 500);
  }
});

export default app;
