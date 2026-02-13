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

// ============================================
// オフィス管理 CRUD（神権限）
// ============================================

// オフィス一覧取得
app.get('/offices', requireAdmin, async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT o.*, u.name as user_name, u.email as user_email
      FROM offices o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `).all();

    // 各オフィスのセラピスト数を取得
    const offices = await Promise.all((result.results || []).map(async (office: any) => {
      const countResult = await c.env.DB.prepare(`
        SELECT COUNT(*) as count FROM therapist_profiles WHERE office_id = ?
      `).bind(office.id).first();
      return {
        ...office,
        total_therapists: countResult?.count || office.therapist_count || 0,
        monthly_revenue: office.monthly_revenue || 0,
      };
    }));

    return c.json({ offices });
  } catch (error) {
    console.error('オフィス一覧取得エラー:', error);
    return c.json({ error: 'オフィス一覧の取得に失敗しました' }, 500);
  }
});

// オフィス詳細取得
app.get('/offices/:officeId', requireAdmin, async (c) => {
  try {
    const officeId = c.req.param('officeId');
    
    const office = await c.env.DB.prepare(`
      SELECT o.*, u.name as user_name, u.email as user_email
      FROM offices o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `).bind(officeId).first();

    if (!office) {
      return c.json({ error: 'オフィスが見つかりません' }, 404);
    }

    // 所属セラピスト一覧を取得
    const therapistsResult = await c.env.DB.prepare(`
      SELECT tp.*, u.name, u.email, u.phone, u.avatar_url
      FROM therapist_profiles tp
      JOIN users u ON tp.user_id = u.id
      WHERE tp.office_id = ?
      ORDER BY u.name
    `).bind(officeId).all();

    return c.json({ 
      office,
      therapists: therapistsResult.results || []
    });
  } catch (error) {
    console.error('オフィス詳細取得エラー:', error);
    return c.json({ error: 'オフィス詳細の取得に失敗しました' }, 500);
  }
});

// オフィス作成
app.post('/offices', requireAdmin, async (c) => {
  try {
    const body = await c.req.json();
    const id = `office-${Date.now()}`;
    const userId = body.user_id || `user-office-${Date.now()}`;
    
    // オフィスユーザーが未作成の場合は作成
    if (!body.user_id) {
      await c.env.DB.prepare(`
        INSERT OR IGNORE INTO users (id, email, name, phone, role, email_verified, kyc_status, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'THERAPIST_OFFICE', 1, 'VERIFIED', datetime('now'), datetime('now'))
      `).bind(userId, body.email || '', body.name || '', body.phone || '').run();
    }

    await c.env.DB.prepare(`
      INSERT INTO offices (id, user_id, name, area_code, manager_name, contact_email, commission_rate, status, therapist_count, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, datetime('now'), datetime('now'))
    `).bind(
      id, userId, body.name, body.area_code || 'TOKYO',
      body.manager_name || body.representative_name || '',
      body.email || body.contact_email || '',
      body.commission_rate || 15,
      body.status || 'PENDING'
    ).run();

    return c.json({ success: true, id, message: 'オフィスを作成しました' });
  } catch (error) {
    console.error('オフィス作成エラー:', error);
    return c.json({ error: 'オフィスの作成に失敗しました' }, 500);
  }
});

// オフィス更新
app.put('/offices/:officeId', requireAdmin, async (c) => {
  try {
    const officeId = c.req.param('officeId');
    const body = await c.req.json();

    await c.env.DB.prepare(`
      UPDATE offices SET
        name = COALESCE(?, name),
        manager_name = COALESCE(?, manager_name),
        contact_email = COALESCE(?, contact_email),
        commission_rate = COALESCE(?, commission_rate),
        status = COALESCE(?, status),
        area_code = COALESCE(?, area_code),
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      body.name || null,
      body.manager_name || body.representative_name || null,
      body.email || body.contact_email || null,
      body.commission_rate ?? null,
      body.status || null,
      body.area_code || null,
      officeId
    ).run();

    return c.json({ success: true, message: 'オフィス情報を更新しました' });
  } catch (error) {
    console.error('オフィス更新エラー:', error);
    return c.json({ error: 'オフィス情報の更新に失敗しました' }, 500);
  }
});

// オフィス削除
app.delete('/offices/:officeId', requireAdmin, async (c) => {
  try {
    const officeId = c.req.param('officeId');

    // 所属セラピストのoffice_idをnullにリセット
    await c.env.DB.prepare(`
      UPDATE therapist_profiles SET office_id = NULL WHERE office_id = ?
    `).bind(officeId).run();

    await c.env.DB.prepare(`
      DELETE FROM offices WHERE id = ?
    `).bind(officeId).run();

    return c.json({ success: true, message: 'オフィスを削除しました' });
  } catch (error) {
    console.error('オフィス削除エラー:', error);
    return c.json({ error: 'オフィスの削除に失敗しました' }, 500);
  }
});

// ============================================
// ホスト管理 CRUD（神権限）
// ============================================

// ホスト一覧取得
app.get('/hosts', requireAdmin, async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT u.id, u.email, u.name, u.phone, u.role, u.avatar_url,
             u.email_verified, u.phone_verified, u.kyc_status, u.created_at, u.updated_at,
             (SELECT COUNT(*) FROM sites WHERE host_id = u.id) as site_count
      FROM users u
      WHERE u.role = 'HOST'
      ORDER BY u.created_at DESC
    `).all();

    return c.json({ hosts: result.results || [] });
  } catch (error) {
    console.error('ホスト一覧取得エラー:', error);
    return c.json({ error: 'ホスト一覧の取得に失敗しました' }, 500);
  }
});

// ホスト詳細取得
app.get('/hosts/:hostId', requireAdmin, async (c) => {
  try {
    const hostId = c.req.param('hostId');
    
    const host = await c.env.DB.prepare(`
      SELECT u.* FROM users u WHERE u.id = ? AND u.role = 'HOST'
    `).bind(hostId).first();

    if (!host) {
      return c.json({ error: 'ホストが見つかりません' }, 404);
    }

    // ホストの施設一覧
    const sitesResult = await c.env.DB.prepare(`
      SELECT * FROM sites WHERE host_id = ? ORDER BY created_at DESC
    `).bind(hostId).all();

    return c.json({ host, sites: sitesResult.results || [] });
  } catch (error) {
    console.error('ホスト詳細取得エラー:', error);
    return c.json({ error: 'ホスト詳細の取得に失敗しました' }, 500);
  }
});

// ホスト承認
app.post('/hosts/:hostId/approve', requireAdmin, async (c) => {
  try {
    const hostId = c.req.param('hostId');
    await c.env.DB.prepare(`
      UPDATE users SET kyc_status = 'VERIFIED', updated_at = datetime('now') WHERE id = ?
    `).bind(hostId).run();
    return c.json({ success: true, message: 'ホストを承認しました' });
  } catch (error) {
    return c.json({ error: 'ホスト承認に失敗しました' }, 500);
  }
});

// ホスト拒否
app.post('/hosts/:hostId/reject', requireAdmin, async (c) => {
  try {
    const hostId = c.req.param('hostId');
    await c.env.DB.prepare(`
      UPDATE users SET kyc_status = 'REJECTED', updated_at = datetime('now') WHERE id = ?
    `).bind(hostId).run();
    return c.json({ success: true, message: 'ホストを拒否しました' });
  } catch (error) {
    return c.json({ error: 'ホスト拒否に失敗しました' }, 500);
  }
});

// ホスト削除
app.delete('/hosts/:hostId', requireAdmin, async (c) => {
  try {
    const hostId = c.req.param('hostId');
    await c.env.DB.prepare(`DELETE FROM users WHERE id = ? AND role = 'HOST'`).bind(hostId).run();
    return c.json({ success: true, message: 'ホストを削除しました' });
  } catch (error) {
    return c.json({ error: 'ホスト削除に失敗しました' }, 500);
  }
});

// ============================================
// 施設管理 CRUD（神権限）
// ============================================

// 施設一覧取得
app.get('/sites', requireAdmin, async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT s.*, u.name as host_name, u.email as host_email,
             (SELECT COUNT(*) FROM site_rooms WHERE site_id = s.id) as room_count
      FROM sites s
      LEFT JOIN users u ON s.host_id = u.id
      ORDER BY s.created_at DESC
    `).all();

    return c.json({ sites: result.results || [] });
  } catch (error) {
    console.error('施設一覧取得エラー:', error);
    return c.json({ error: '施設一覧の取得に失敗しました' }, 500);
  }
});

// 施設更新
app.put('/sites/:siteId', requireAdmin, async (c) => {
  try {
    const siteId = c.req.param('siteId');
    const body = await c.req.json();

    await c.env.DB.prepare(`
      UPDATE sites SET
        name = COALESCE(?, name),
        type = COALESCE(?, type),
        address = COALESCE(?, address),
        area_code = COALESCE(?, area_code),
        status = COALESCE(?, status),
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      body.name || null, body.type || null, body.address || null,
      body.area_code || null, body.status || null, siteId
    ).run();

    return c.json({ success: true, message: '施設情報を更新しました' });
  } catch (error) {
    return c.json({ error: '施設情報の更新に失敗しました' }, 500);
  }
});

// 施設削除
app.delete('/sites/:siteId', requireAdmin, async (c) => {
  try {
    const siteId = c.req.param('siteId');
    await c.env.DB.prepare(`DELETE FROM sites WHERE id = ?`).bind(siteId).run();
    return c.json({ success: true, message: '施設を削除しました' });
  } catch (error) {
    return c.json({ error: '施設の削除に失敗しました' }, 500);
  }
});

// ============================================
// 予約管理 CRUD（神権限）
// ============================================

// 予約更新
app.put('/bookings/:bookingId', requireAdmin, async (c) => {
  try {
    const bookingId = c.req.param('bookingId');
    const body = await c.req.json();

    await c.env.DB.prepare(`
      UPDATE bookings SET
        status = COALESCE(?, status),
        scheduled_at = COALESCE(?, scheduled_at),
        price = COALESCE(?, price),
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(body.status || null, body.scheduled_at || null, body.price ?? null, bookingId).run();

    return c.json({ success: true, message: '予約情報を更新しました' });
  } catch (error) {
    return c.json({ error: '予約情報の更新に失敗しました' }, 500);
  }
});

// 予約削除
app.delete('/bookings/:bookingId', requireAdmin, async (c) => {
  try {
    const bookingId = c.req.param('bookingId');
    await c.env.DB.prepare(`DELETE FROM bookings WHERE id = ?`).bind(bookingId).run();
    return c.json({ success: true, message: '予約を削除しました' });
  } catch (error) {
    return c.json({ error: '予約の削除に失敗しました' }, 500);
  }
});

export default app;
