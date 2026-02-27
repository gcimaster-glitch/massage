import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import { requireAuth as requireAuthentication } from './auth-middleware';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// JWT認証ミドルウェア（統一版）
const requireAuth = async (c: Parameters<typeof app.get>[1], next: () => Promise<void>) => {
  const authHeader = c.req.header('Authorization');
  const authResult = await requireAuthentication(authHeader, c.env.JWT_SECRET);
  
  if (!authResult.success) {
    return c.json({ error: authResult.error || '認証が必要です' }, 401);
  }

  c.set('userId', authResult.user.userId);
  c.set('role', authResult.user.role);
  await next();
};

// ============================================
// セラピスト向け：自分の報酬情報取得
// ============================================

// 報酬一覧取得
app.get('/my-earnings', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { year, month } = c.req.query();

    // セラピストプロフィールIDを取得
    const therapistProfile = await c.env.DB.prepare(`
      SELECT id FROM therapist_profiles WHERE user_id = ?
    `).bind(userId).first();

    if (!therapistProfile) {
      return c.json({ earnings: [], total: 0 });
    }

    let query = `
      SELECT 
        te.*,
        b.scheduled_at,
        b.service_name,
        b.status as booking_status
      FROM therapist_earnings te
      JOIN bookings b ON te.booking_id = b.id
      WHERE te.therapist_profile_id = ?
    `;

    const params: (string | number | null)[] = [therapistProfile.id];

    if (year && month) {
      query += ` AND strftime('%Y', te.booking_date) = ? AND strftime('%m', te.booking_date) = ?`;
      params.push(year, month.padStart(2, '0'));
    }

    query += ` ORDER BY te.booking_date DESC LIMIT 100`;

    const earnings = await c.env.DB.prepare(query).bind(...params).all();

    return c.json({
      earnings: earnings.results || [],
      total: earnings.results?.length || 0,
    });
  } catch (error) {
    console.error('報酬取得エラー:', error);
    return c.json({ error: '報酬情報の取得に失敗しました' }, 500);
  }
});

// 月次レポート取得
app.get('/my-reports', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');

    // セラピストプロフィールIDを取得
    const therapistProfile = await c.env.DB.prepare(`
      SELECT id FROM therapist_profiles WHERE user_id = ?
    `).bind(userId).first();

    if (!therapistProfile) {
      return c.json({ reports: [], total: 0 });
    }

    const reports = await c.env.DB.prepare(`
      SELECT * FROM monthly_settlement_reports
      WHERE therapist_profile_id = ?
      ORDER BY year DESC, month DESC
      LIMIT 12
    `).bind(therapistProfile.id).all();

    return c.json({
      reports: reports.results || [],
      total: reports.results?.length || 0,
    });
  } catch (error) {
    console.error('レポート取得エラー:', error);
    return c.json({ error: 'レポートの取得に失敗しました' }, 500);
  }
});

// ============================================
// 管理者向け：報酬管理
// ============================================

// 全セラピストの報酬一覧取得
app.get('/all-earnings', requireAuth, async (c) => {
  try {
    const role = c.get('role');
    
    if (role !== 'ADMIN') {
      return c.json({ error: '権限がありません' }, 403);
    }

    const { year, month, therapist_id, status } = c.req.query();

    let query = `
      SELECT 
        te.*,
        u.name as therapist_name,
        b.service_name,
        b.scheduled_at
      FROM therapist_earnings te
      JOIN therapist_profiles tp ON te.therapist_profile_id = tp.id
      JOIN users u ON tp.user_id = u.id
      JOIN bookings b ON te.booking_id = b.id
      WHERE 1=1
    `;

    const params: (string | number | null)[] = [];

    if (year && month) {
      query += ` AND strftime('%Y', te.booking_date) = ? AND strftime('%m', te.booking_date) = ?`;
      params.push(year, month.padStart(2, '0'));
    }

    if (therapist_id) {
      query += ` AND te.therapist_profile_id = ?`;
      params.push(therapist_id);
    }

    if (status) {
      query += ` AND te.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY te.booking_date DESC LIMIT 500`;

    const earnings = await c.env.DB.prepare(query).bind(...params).all();

    return c.json({
      earnings: earnings.results || [],
      total: earnings.results?.length || 0,
    });
  } catch (error) {
    console.error('報酬一覧取得エラー:', error);
    return c.json({ error: '報酬一覧の取得に失敗しました' }, 500);
  }
});

// 月次レポート生成
app.post('/generate-report', requireAuth, async (c) => {
  try {
    const role = c.get('role');
    
    if (role !== 'ADMIN') {
      return c.json({ error: '権限がありません' }, 403);
    }

    const { therapist_profile_id, year, month } = await c.req.json();

    // 既存レポートを確認
    const existingReport = await c.env.DB.prepare(`
      SELECT id FROM monthly_settlement_reports
      WHERE therapist_profile_id = ? AND year = ? AND month = ?
    `).bind(therapist_profile_id, year, month).first();

    if (existingReport) {
      return c.json({ error: 'すでにレポートが存在します' }, 400);
    }

    // 対象月の報酬データを集計
    const earnings = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total_bookings,
        SUM(booking_price) as total_revenue,
        SUM(therapist_amount) as therapist_earnings,
        SUM(office_amount) as office_earnings,
        SUM(platform_amount) as platform_earnings
      FROM therapist_earnings
      WHERE therapist_profile_id = ?
        AND strftime('%Y', booking_date) = ?
        AND strftime('%m', booking_date) = ?
        AND status = 'CONFIRMED'
    `).bind(therapist_profile_id, year, month.toString().padStart(2, '0')).first();

    const reportId = `report-${nanoid(10)}`;

    // レポートを作成
    await c.env.DB.prepare(`
      INSERT INTO monthly_settlement_reports (
        id, therapist_profile_id, year, month,
        total_bookings, total_revenue, therapist_earnings,
        office_earnings, platform_earnings, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED')
    `).bind(
      reportId,
      therapist_profile_id,
      year,
      month,
      earnings?.total_bookings || 0,
      earnings?.total_revenue || 0,
      earnings?.therapist_earnings || 0,
      earnings?.office_earnings || 0,
      earnings?.platform_earnings || 0
    ).run();

    return c.json({ 
      success: true, 
      message: '月次レポートを生成しました',
      reportId 
    });
  } catch (error) {
    console.error('レポート生成エラー:', error);
    return c.json({ error: 'レポートの生成に失敗しました' }, 500);
  }
});

// 報酬ステータス更新
app.put('/earnings/:earningId/status', requireAuth, async (c) => {
  try {
    const role = c.get('role');
    
    if (role !== 'ADMIN') {
      return c.json({ error: '権限がありません' }, 403);
    }

    const earningId = c.req.param('earningId');
    const { status } = await c.req.json();

    await c.env.DB.prepare(`
      UPDATE therapist_earnings 
      SET status = ?, 
          confirmed_at = CASE WHEN ? = 'CONFIRMED' THEN datetime('now') ELSE confirmed_at END,
          paid_at = CASE WHEN ? = 'PAID' THEN datetime('now') ELSE paid_at END
      WHERE id = ?
    `).bind(status, status, status, earningId).run();

    return c.json({ 
      success: true, 
      message: 'ステータスを更新しました' 
    });
  } catch (error) {
    console.error('ステータス更新エラー:', error);
    return c.json({ error: 'ステータスの更新に失敗しました' }, 500);
  }
});

// 予約完了時に報酬レコードを自動生成するトリガー（手動で呼び出し）
app.post('/create-earning-from-booking', requireAuth, async (c) => {
  try {
    const { booking_id } = await c.req.json();

    // 予約情報を取得
    const booking = await c.env.DB.prepare(`
      SELECT 
        b.*,
        tp.id as therapist_profile_id
      FROM bookings b
      JOIN therapist_profiles tp ON b.therapist_id = tp.id
      WHERE b.id = ?
    `).bind(booking_id).first();

    if (!booking) {
      return c.json({ error: '予約が見つかりません' }, 404);
    }

    // 料率を取得（事務所所属の場合）
    const affiliation = await c.env.DB.prepare(`
      SELECT 
        commission_rate,
        office_commission_rate,
        platform_commission_rate
      FROM office_therapist_affiliations
      WHERE therapist_profile_id = ? AND status = 'APPROVED'
      LIMIT 1
    `).bind(booking.therapist_profile_id).first();

    const therapistRate = affiliation?.commission_rate || 70;
    const officeRate = affiliation?.office_commission_rate || 0;
    const platformRate = affiliation?.platform_commission_rate || 30;

    const totalPrice = booking.price || 0;
    const therapistAmount = Math.floor(totalPrice * therapistRate / 100);
    const officeAmount = Math.floor(totalPrice * officeRate / 100);
    const platformAmount = totalPrice - therapistAmount - officeAmount;

    const earningId = `earning-${nanoid(10)}`;

    // 報酬レコードを作成
    await c.env.DB.prepare(`
      INSERT INTO therapist_earnings (
        id, therapist_profile_id, booking_id,
        booking_price, therapist_amount, office_amount, platform_amount,
        therapist_rate, office_rate, platform_rate,
        status, booking_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', date(?))
    `).bind(
      earningId,
      booking.therapist_profile_id,
      booking_id,
      totalPrice,
      therapistAmount,
      officeAmount,
      platformAmount,
      therapistRate,
      officeRate,
      platformRate,
      booking.scheduled_at
    ).run();

    return c.json({ 
      success: true, 
      message: '報酬レコードを作成しました',
      earningId 
    });
  } catch (error) {
    console.error('報酬レコード作成エラー:', error);
    return c.json({ error: '報酬レコードの作成に失敗しました' }, 500);
  }
});

export default app;
