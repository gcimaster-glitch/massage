import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import { requireAuth as requireAuthentication } from './auth-middleware';

type Bindings = { DB: D1Database; JWT_SECRET: string };

const app = new Hono<{ Bindings: Bindings }>();

const requireAdmin = async (c: any, next: any) => {
  const result = await requireAuthentication(c.req.header('Authorization'), c.env.JWT_SECRET, ['ADMIN']);
  if (!result.success) return c.json({ error: result.error || '管理者権限が必要です' }, 401);
  c.set('userId', result.user.userId);
  await next();
};

// GET /api/admin/plans
app.get('/', requireAdmin, async (c) => {
  try {
    const role = c.req.query('role');
    let query = `
      SELECT id, plan_name, display_name, target_role,
             monthly_fee, monthly_price, annual_price, initial_fee,
             description, features, is_active,
             stripe_price_id_monthly, stripe_price_id_annual,
             created_at, updated_at
      FROM plans
    `;
    const bindings: string[] = [];
    if (role && role !== 'ALL') {
      query += ' WHERE target_role = ?';
      bindings.push(role);
    }
    query += ' ORDER BY target_role, monthly_price ASC';

    const { results } = bindings.length
      ? await c.env.DB.prepare(query).bind(...bindings).all()
      : await c.env.DB.prepare(query).all();

    // display_name フォールバック
    const plans = (results || []).map((p: any) => ({
      ...p,
      display_name: p.display_name || p.plan_name,
      monthly_price: p.monthly_price ?? p.monthly_fee ?? 0,
      features: p.features || '[]',
    }));

    return c.json({ plans });
  } catch (error: unknown) {
    console.error('プラン一覧取得エラー:', error);
    return c.json({ error: 'プラン一覧の取得に失敗しました' }, 500);
  }
});

// POST /api/admin/plans - 新規プラン作成
app.post('/', requireAdmin, async (c) => {
  try {
    const body = await c.req.json();
    const { plan_name, display_name, target_role, monthly_price, annual_price, features, is_active } = body;

    if (!plan_name || !target_role) {
      return c.json({ error: 'plan_name と target_role は必須です' }, 400);
    }

    const validRoles = ['THERAPIST', 'THERAPIST_OFFICE', 'HOST', 'AFFILIATE', 'USER'];
    if (!validRoles.includes(target_role)) {
      return c.json({ error: '無効なロールです' }, 400);
    }

    const id = `plan_${nanoid()}`;
    const now = new Date().toISOString();
    await c.env.DB.prepare(`
      INSERT INTO plans (id, plan_name, display_name, target_role, monthly_fee, monthly_price,
                         annual_price, features, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, plan_name, display_name || plan_name, target_role,
      monthly_price || 0, monthly_price || 0,
      annual_price || null,
      features || '[]',
      is_active ?? 1,
      now, now
    ).run();

    return c.json({ success: true, id }, 201);
  } catch (error: unknown) {
    console.error('プラン作成エラー:', error);
    return c.json({ error: 'プランの作成に失敗しました' }, 500);
  }
});

// PUT /api/admin/plans/:id - プラン更新
app.put('/:id', requireAdmin, async (c) => {
  try {
    const planId = c.req.param('id');
    const body = await c.req.json();
    const {
      display_name, monthly_price, annual_price, features,
      is_active, stripe_price_id_monthly, stripe_price_id_annual,
    } = body;

    const existing = await c.env.DB.prepare('SELECT id FROM plans WHERE id = ?').bind(planId).first();
    if (!existing) return c.json({ error: 'プランが見つかりません' }, 404);

    await c.env.DB.prepare(`
      UPDATE plans SET
        display_name = COALESCE(?, display_name),
        monthly_price = COALESCE(?, monthly_price),
        monthly_fee = COALESCE(?, monthly_fee),
        annual_price = ?,
        features = COALESCE(?, features),
        is_active = COALESCE(?, is_active),
        stripe_price_id_monthly = ?,
        stripe_price_id_annual = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      display_name ?? null,
      monthly_price ?? null,
      monthly_price ?? null,
      annual_price ?? null,
      features ?? null,
      is_active ?? null,
      stripe_price_id_monthly ?? null,
      stripe_price_id_annual ?? null,
      planId
    ).run();

    return c.json({ success: true, message: 'プランを更新しました' });
  } catch (error: unknown) {
    console.error('プラン更新エラー:', error);
    return c.json({ error: 'プランの更新に失敗しました' }, 500);
  }
});

export default app;
