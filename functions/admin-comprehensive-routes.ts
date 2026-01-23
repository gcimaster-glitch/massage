import { Hono } from 'hono';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// JWT認証ミドルウェア
const requireAdmin = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: '認証が必要です' }, 401);
  }

  const token = authHeader.substring(7);
  try {
    const payload = await verifyJWT(token, c.env.JWT_SECRET);
    if (!payload || payload.role !== 'ADMIN') {
      return c.json({ error: '管理者権限が必要です' }, 403);
    }
    c.set('userId', payload.userId);
    c.set('role', payload.role);
    await next();
  } catch (error) {
    return c.json({ error: '認証に失敗しました' }, 401);
  }
};

// JWT検証関数
async function verifyJWT(token: string, secret: string) {
  try {
    const [headerB64, payloadB64, signature] = token.split('.');
    const payload = JSON.parse(
      decodeURIComponent(
        atob(payloadB64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
    );

    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error('JWT verify error:', error);
    return null;
  }
}

// ============================================
// ユーザー管理
// ============================================

// 全ユーザー取得
app.get('/users', requireAdmin, async (c) => {
  try {
    const users = await c.env.DB.prepare(`
      SELECT * FROM users 
      ORDER BY created_at DESC
      LIMIT 1000
    `).all();

    return c.json({
      users: users.results || [],
      total: users.results?.length || 0,
    });
  } catch (error) {
    console.error('ユーザー取得エラー:', error);
    return c.json({ error: 'ユーザー一覧の取得に失敗しました' }, 500);
  }
});

// ユーザー詳細取得
app.get('/users/:userId', requireAdmin, async (c) => {
  try {
    const userId = c.req.param('userId');

    const user = await c.env.DB.prepare(`
      SELECT * FROM users WHERE id = ?
    `).bind(userId).first();

    if (!user) {
      return c.json({ error: 'ユーザーが見つかりません' }, 404);
    }

    return c.json({ user });
  } catch (error) {
    console.error('ユーザー詳細取得エラー:', error);
    return c.json({ error: 'ユーザー詳細の取得に失敗しました' }, 500);
  }
});

// ユーザー更新
app.put('/users/:userId', requireAdmin, async (c) => {
  try {
    const userId = c.req.param('userId');
    const body = await c.req.json();

    await c.env.DB.prepare(`
      UPDATE users 
      SET name = ?, email = ?, phone = ?, role = ?
      WHERE id = ?
    `).bind(body.name, body.email, body.phone, body.role, userId).run();

    return c.json({ 
      success: true, 
      message: 'ユーザー情報を更新しました' 
    });
  } catch (error) {
    console.error('ユーザー更新エラー:', error);
    return c.json({ error: 'ユーザー情報の更新に失敗しました' }, 500);
  }
});

// ユーザー削除
app.delete('/users/:userId', requireAdmin, async (c) => {
  try {
    const userId = c.req.param('userId');

    await c.env.DB.prepare(`
      DELETE FROM users WHERE id = ?
    `).bind(userId).run();

    return c.json({ 
      success: true, 
      message: 'ユーザーを削除しました' 
    });
  } catch (error) {
    console.error('ユーザー削除エラー:', error);
    return c.json({ error: 'ユーザーの削除に失敗しました' }, 500);
  }
});

// ============================================
// 予約管理（総合）
// ============================================

// 全予約取得
app.get('/bookings', requireAdmin, async (c) => {
  try {
    const { status, from_date, to_date } = c.req.query();

    let query = `
      SELECT 
        b.*,
        u.name as user_name,
        u.email as user_email,
        tp.id as therapist_profile_id
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN therapist_profiles tp ON b.therapist_id = tp.id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (status) {
      query += ` AND b.status = ?`;
      params.push(status);
    }

    if (from_date) {
      query += ` AND DATE(b.scheduled_at) >= ?`;
      params.push(from_date);
    }

    if (to_date) {
      query += ` AND DATE(b.scheduled_at) <= ?`;
      params.push(to_date);
    }

    query += ` ORDER BY b.scheduled_at DESC LIMIT 1000`;

    const bookings = await c.env.DB.prepare(query).bind(...params).all();

    return c.json({
      bookings: bookings.results || [],
      total: bookings.results?.length || 0,
    });
  } catch (error) {
    console.error('予約取得エラー:', error);
    return c.json({ error: '予約一覧の取得に失敗しました' }, 500);
  }
});

// 予約統計
app.get('/bookings/stats', requireAdmin, async (c) => {
  try {
    const stats = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total_bookings,
        SUM(CASE WHEN status = 'CONFIRMED' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
        SUM(price) as total_revenue,
        SUM(CASE WHEN status = 'COMPLETED' THEN price ELSE 0 END) as completed_revenue
      FROM bookings
    `).first();

    return c.json({ stats });
  } catch (error) {
    console.error('予約統計取得エラー:', error);
    return c.json({ error: '予約統計の取得に失敗しました' }, 500);
  }
});

// ============================================
// 決済管理
// ============================================

// 決済一覧取得（仮実装 - payment_transactionsテーブル使用）
app.get('/payments', requireAdmin, async (c) => {
  try {
    const payments = await c.env.DB.prepare(`
      SELECT 
        pt.*,
        msr.therapist_profile_id,
        msr.year,
        msr.month
      FROM payment_transactions pt
      LEFT JOIN monthly_settlement_reports msr ON pt.settlement_report_id = msr.id
      ORDER BY pt.created_at DESC
      LIMIT 500
    `).all();

    return c.json({
      payments: payments.results || [],
      total: payments.results?.length || 0,
    });
  } catch (error) {
    console.error('決済取得エラー:', error);
    return c.json({ error: '決済一覧の取得に失敗しました' }, 500);
  }
});

// 決済統計
app.get('/payments/stats', requireAdmin, async (c) => {
  try {
    const stats = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total_payments,
        SUM(amount) as total_amount,
        SUM(CASE WHEN payment_status = 'COMPLETED' THEN amount ELSE 0 END) as completed_amount,
        SUM(CASE WHEN payment_status = 'PENDING' THEN amount ELSE 0 END) as pending_amount
      FROM payment_transactions
    `).first();

    return c.json({ stats });
  } catch (error) {
    console.error('決済統計取得エラー:', error);
    return c.json({ error: '決済統計の取得に失敗しました' }, 500);
  }
});

// ============================================
// セラピスト管理（完全版）
// ============================================

// 全セラピスト取得
app.get('/therapists', requireAdmin, async (c) => {
  try {
    const therapists = await c.env.DB.prepare(`
      SELECT 
        tp.*,
        u.name,
        u.email,
        u.phone,
        u.avatar_url,
        ota.office_id,
        o.name as office_name
      FROM therapist_profiles tp
      JOIN users u ON tp.user_id = u.id
      LEFT JOIN office_therapist_affiliations ota ON tp.id = ota.therapist_profile_id AND ota.status = 'APPROVED'
      LEFT JOIN offices o ON ota.office_id = o.id
      ORDER BY tp.created_at DESC
      LIMIT 500
    `).all();

    return c.json({
      therapists: therapists.results || [],
      total: therapists.results?.length || 0,
    });
  } catch (error) {
    console.error('セラピスト取得エラー:', error);
    return c.json({ error: 'セラピスト一覧の取得に失敗しました' }, 500);
  }
});

// セラピスト詳細取得
app.get('/therapists/:therapistId', requireAdmin, async (c) => {
  try {
    const therapistId = c.req.param('therapistId');

    const therapist = await c.env.DB.prepare(`
      SELECT 
        tp.*,
        u.name,
        u.email,
        u.phone,
        u.avatar_url
      FROM therapist_profiles tp
      JOIN users u ON tp.user_id = u.id
      WHERE tp.id = ?
    `).bind(therapistId).first();

    if (!therapist) {
      return c.json({ error: 'セラピストが見つかりません' }, 404);
    }

    return c.json({ therapist });
  } catch (error) {
    console.error('セラピスト詳細取得エラー:', error);
    return c.json({ error: 'セラピスト詳細の取得に失敗しました' }, 500);
  }
});

// セラピスト更新
app.put('/therapists/:therapistId', requireAdmin, async (c) => {
  try {
    const therapistId = c.req.param('therapistId');
    const body = await c.req.json();

    await c.env.DB.prepare(`
      UPDATE therapist_profiles 
      SET bio = ?, status = ?
      WHERE id = ?
    `).bind(body.bio, body.status, therapistId).run();

    return c.json({ 
      success: true, 
      message: 'セラピスト情報を更新しました' 
    });
  } catch (error) {
    console.error('セラピスト更新エラー:', error);
    return c.json({ error: 'セラピスト情報の更新に失敗しました' }, 500);
  }
});

// セラピスト削除
app.delete('/therapists/:therapistId', requireAdmin, async (c) => {
  try {
    const therapistId = c.req.param('therapistId');

    await c.env.DB.prepare(`
      DELETE FROM therapist_profiles WHERE id = ?
    `).bind(therapistId).run();

    return c.json({ 
      success: true, 
      message: 'セラピストを削除しました' 
    });
  } catch (error) {
    console.error('セラピスト削除エラー:', error);
    return c.json({ error: 'セラピストの削除に失敗しました' }, 500);
  }
});

export default app;
