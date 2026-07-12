import { Hono } from 'hono';
import { requireAuth as requireAuthentication } from './auth-middleware';

type Bindings = { DB: D1Database; JWT_SECRET: string };

const app = new Hono<{ Bindings: Bindings }>();

const requireAuth = async (c: any, next: any) => {
  const result = await requireAuthentication(c.req.header('Authorization'), c.env.JWT_SECRET);
  if (!result.success) return c.json({ error: result.error || '認証が必要です' }, 401);
  c.set('userId', result.user.userId);
  await next();
};

// GET /api/users/points - ポイント残高取得
app.get('/points', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const row = await c.env.DB.prepare(
      'SELECT balance FROM user_points WHERE user_id = ?'
    ).bind(userId).first() as { balance: number } | null;
    return c.json({ balance: row?.balance ?? 0 });
  } catch (error: unknown) {
    console.error('ポイント取得エラー:', error);
    return c.json({ error: 'ポイントの取得に失敗しました' }, 500);
  }
});

// GET /api/users/points/history - ポイント取引履歴
app.get('/points/history', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { results } = await c.env.DB.prepare(`
      SELECT id, amount, type, description, reference_id, created_at
      FROM point_transactions
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `).bind(userId).all();
    return c.json({ transactions: results || [] });
  } catch (error: unknown) {
    console.error('ポイント履歴取得エラー:', error);
    return c.json({ error: 'ポイント履歴の取得に失敗しました' }, 500);
  }
});

export default app;
