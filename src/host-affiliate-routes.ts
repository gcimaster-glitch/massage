/**
 * ホスト・アフィリエイト用APIルート
 * - GET /api/host/dashboard     ホストダッシュボード統計
 * - GET /api/host/sites         ホストのサイト一覧
 * - PUT /api/host/sites/:siteId サイト情報更新
 * - GET /api/host/bookings      ホストのサイトに紐づく予約一覧
 * - GET /api/host/earnings      ホストの収益情報
 * - GET /api/affiliate/dashboard アフィリエイトダッシュボード
 * - GET /api/affiliate/referrals アフィリエイト紹介履歴
 * - GET /api/affiliate/earnings  アフィリエイト収益情報
 */
import { Hono } from 'hono';
import { requireAuth as requireAuthentication } from './auth-middleware';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// JWT認証ミドルウェア
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
// ホスト向けAPI
// ============================================

// ホストダッシュボード統計
app.get('/host/dashboard', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const role = c.get('role');
    if (role !== 'HOST' && role !== 'ADMIN') {
      return c.json({ error: '権限がありません' }, 403);
    }

    // ホストのサイト一覧
    const sites = await c.env.DB.prepare(`
      SELECT id, name, type, status, room_count FROM sites WHERE host_id = ?
    `).bind(userId).all();

    const siteIds = (sites.results || []).map((s: any) => s.id);

    if (siteIds.length === 0) {
      return c.json({
        total_sites: 0,
        active_sites: 0,
        total_bookings_this_month: 0,
        total_revenue_this_month: 0,
        upcoming_bookings: [],
        sites: [],
      });
    }

    const placeholders = siteIds.map(() => '?').join(',');
    const now = new Date().toISOString();
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    // 今月の予約数・収益
    const monthlyStats = await c.env.DB.prepare(`
      SELECT COUNT(*) as count, SUM(price) as revenue
      FROM bookings
      WHERE site_id IN (${placeholders})
        AND status NOT IN ('CANCELLED', 'REJECTED')
        AND scheduled_at >= ?
    `).bind(...siteIds, monthStart).first();

    // 直近の予約
    const upcomingBookings = await c.env.DB.prepare(`
      SELECT b.id, b.scheduled_at, b.service_name, b.price, b.status,
             b.therapist_name, s.name as site_name
      FROM bookings b
      JOIN sites s ON b.site_id = s.id
      WHERE b.site_id IN (${placeholders})
        AND b.status IN ('CONFIRMED', 'PENDING')
        AND b.scheduled_at >= ?
      ORDER BY b.scheduled_at ASC
      LIMIT 10
    `).bind(...siteIds, now).all();

    const activeSites = (sites.results || []).filter((s: any) => s.status === 'ACTIVE').length;

    return c.json({
      total_sites: sites.results?.length || 0,
      active_sites: activeSites,
      total_bookings_this_month: (monthlyStats as any)?.count || 0,
      total_revenue_this_month: (monthlyStats as any)?.revenue || 0,
      upcoming_bookings: upcomingBookings.results || [],
      sites: sites.results || [],
    });
  } catch (error) {
    console.error('ホストダッシュボードエラー:', error);
    return c.json({ error: 'ダッシュボードデータの取得に失敗しました' }, 500);
  }
});

// ホストのサイト一覧
app.get('/host/sites', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const role = c.get('role');
    if (role !== 'HOST' && role !== 'ADMIN') {
      return c.json({ error: '権限がありません' }, 403);
    }

    const sites = await c.env.DB.prepare(`
      SELECT * FROM sites WHERE host_id = ? ORDER BY created_at DESC
    `).bind(userId).all();

    // 各サイトの今月の予約数を追加
    const siteList = await Promise.all(
      (sites.results || []).map(async (site: any) => {
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
        const stats = await c.env.DB.prepare(`
          SELECT COUNT(*) as booking_count, SUM(price) as revenue
          FROM bookings
          WHERE site_id = ? AND status NOT IN ('CANCELLED', 'REJECTED') AND scheduled_at >= ?
        `).bind(site.id, monthStart).first();
        return {
          ...site,
          monthly_bookings: (stats as any)?.booking_count || 0,
          monthly_revenue: (stats as any)?.revenue || 0,
        };
      })
    );

    return c.json({ sites: siteList });
  } catch (error) {
    console.error('ホストサイト取得エラー:', error);
    return c.json({ error: 'サイト情報の取得に失敗しました' }, 500);
  }
});

// サイト情報更新
app.put('/host/sites/:siteId', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const role = c.get('role');
    const { siteId } = c.req.param();

    if (role !== 'HOST' && role !== 'ADMIN') {
      return c.json({ error: '権限がありません' }, 403);
    }

    // 所有権確認
    const site = await c.env.DB.prepare(`
      SELECT id FROM sites WHERE id = ? AND host_id = ?
    `).bind(siteId, userId).first();

    if (!site && role !== 'ADMIN') {
      return c.json({ error: 'このサイトを編集する権限がありません' }, 403);
    }

    const body = await c.req.json();
    const { name, type, address, room_count, amenities, status } = body;

    await c.env.DB.prepare(`
      UPDATE sites SET
        name = COALESCE(?, name),
        type = COALESCE(?, type),
        address = COALESCE(?, address),
        room_count = COALESCE(?, room_count),
        amenities = COALESCE(?, amenities),
        status = COALESCE(?, status),
        updated_at = ?
      WHERE id = ?
    `).bind(
      name || null, type || null, address || null,
      room_count || null, amenities || null, status || null,
      new Date().toISOString(), siteId
    ).run();

    return c.json({ success: true, message: 'サイト情報を更新しました' });
  } catch (error) {
    console.error('サイト更新エラー:', error);
    return c.json({ error: 'サイト情報の更新に失敗しました' }, 500);
  }
});

// ホストの予約一覧
app.get('/host/bookings', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const role = c.get('role');
    if (role !== 'HOST' && role !== 'ADMIN') {
      return c.json({ error: '権限がありません' }, 403);
    }

    const sites = await c.env.DB.prepare(`
      SELECT id FROM sites WHERE host_id = ?
    `).bind(userId).all();

    const siteIds = (sites.results || []).map((s: any) => s.id);
    if (siteIds.length === 0) {
      return c.json({ bookings: [] });
    }

    const placeholders = siteIds.map(() => '?').join(',');
    const { status, limit = '20', offset = '0' } = c.req.query();

    let sql = `
      SELECT b.*, s.name as site_name
      FROM bookings b
      JOIN sites s ON b.site_id = s.id
      WHERE b.site_id IN (${placeholders})
    `;
    const params: (string | number)[] = [...siteIds];

    if (status) {
      sql += ` AND b.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY b.scheduled_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const bookings = await c.env.DB.prepare(sql).bind(...params).all();
    return c.json({ bookings: bookings.results || [] });
  } catch (error) {
    console.error('ホスト予約取得エラー:', error);
    return c.json({ error: '予約情報の取得に失敗しました' }, 500);
  }
});

// ホストの収益情報
app.get('/host/earnings', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const role = c.get('role');
    if (role !== 'HOST' && role !== 'ADMIN') {
      return c.json({ error: '権限がありません' }, 403);
    }

    const sites = await c.env.DB.prepare(`
      SELECT id FROM sites WHERE host_id = ?
    `).bind(userId).all();

    const siteIds = (sites.results || []).map((s: any) => s.id);
    if (siteIds.length === 0) {
      return c.json({ earnings: [], summary: { total: 0, this_month: 0 } });
    }

    const placeholders = siteIds.map(() => '?').join(',');
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    // 月別収益集計
    const monthlyEarnings = await c.env.DB.prepare(`
      SELECT
        strftime('%Y-%m', scheduled_at) as month,
        COUNT(*) as booking_count,
        SUM(price) as total_revenue,
        SUM(price * 0.1) as host_earnings
      FROM bookings
      WHERE site_id IN (${placeholders})
        AND status = 'COMPLETED'
      GROUP BY strftime('%Y-%m', scheduled_at)
      ORDER BY month DESC
      LIMIT 12
    `).bind(...siteIds).all();

    const thisMonthStats = await c.env.DB.prepare(`
      SELECT SUM(price) as revenue, COUNT(*) as count
      FROM bookings
      WHERE site_id IN (${placeholders})
        AND status = 'COMPLETED'
        AND scheduled_at >= ?
    `).bind(...siteIds, monthStart).first();

    const totalStats = await c.env.DB.prepare(`
      SELECT SUM(price) as revenue, COUNT(*) as count
      FROM bookings
      WHERE site_id IN (${placeholders})
        AND status = 'COMPLETED'
    `).bind(...siteIds).first();

    return c.json({
      earnings: monthlyEarnings.results || [],
      summary: {
        total_revenue: (totalStats as any)?.revenue || 0,
        total_bookings: (totalStats as any)?.count || 0,
        this_month_revenue: (thisMonthStats as any)?.revenue || 0,
        this_month_bookings: (thisMonthStats as any)?.count || 0,
        host_rate: 0.1, // 10%
      },
    });
  } catch (error) {
    console.error('ホスト収益取得エラー:', error);
    return c.json({ error: '収益情報の取得に失敗しました' }, 500);
  }
});

// ============================================
// アフィリエイト向けAPI
// ============================================

// アフィリエイトダッシュボード
app.get('/affiliate/dashboard', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const role = c.get('role');
    if (role !== 'AFFILIATE' && role !== 'ADMIN') {
      return c.json({ error: '権限がありません' }, 403);
    }

    const affiliate = await c.env.DB.prepare(`
      SELECT * FROM affiliates WHERE user_id = ?
    `).bind(userId).first();

    if (!affiliate) {
      return c.json({
        affiliate_code: null,
        total_referrals: 0,
        total_earnings: 0,
        this_month_referrals: 0,
        this_month_earnings: 0,
        recent_referrals: [],
      });
    }

    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    const thisMonthStats = await c.env.DB.prepare(`
      SELECT COUNT(*) as count, SUM(commission_amount) as earnings
      FROM affiliate_referrals
      WHERE affiliate_id = ? AND created_at >= ?
    `).bind((affiliate as any).id, monthStart).first();

    const recentReferrals = await c.env.DB.prepare(`
      SELECT ar.*, u.name as referred_user_name
      FROM affiliate_referrals ar
      LEFT JOIN users u ON ar.referred_user_id = u.id
      WHERE ar.affiliate_id = ?
      ORDER BY ar.created_at DESC
      LIMIT 10
    `).bind((affiliate as any).id).all();

    return c.json({
      affiliate_code: (affiliate as any).affiliate_code,
      commission_rate: (affiliate as any).commission_rate,
      total_referrals: (affiliate as any).total_referrals || 0,
      total_earnings: (affiliate as any).total_earnings || 0,
      this_month_referrals: (thisMonthStats as any)?.count || 0,
      this_month_earnings: (thisMonthStats as any)?.earnings || 0,
      recent_referrals: recentReferrals.results || [],
    });
  } catch (error) {
    console.error('アフィリエイトダッシュボードエラー:', error);
    return c.json({ error: 'ダッシュボードデータの取得に失敗しました' }, 500);
  }
});

// アフィリエイト紹介履歴
app.get('/affiliate/referrals', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const role = c.get('role');
    if (role !== 'AFFILIATE' && role !== 'ADMIN') {
      return c.json({ error: '権限がありません' }, 403);
    }

    const affiliate = await c.env.DB.prepare(`
      SELECT id FROM affiliates WHERE user_id = ?
    `).bind(userId).first();

    if (!affiliate) {
      return c.json({ referrals: [], total: 0 });
    }

    const { status, limit = '50', offset = '0' } = c.req.query();
    let sql = `
      SELECT ar.*, u.name as referred_user_name, u.created_at as user_joined_at
      FROM affiliate_referrals ar
      LEFT JOIN users u ON ar.referred_user_id = u.id
      WHERE ar.affiliate_id = ?
    `;
    const params: (string | number)[] = [(affiliate as any).id];

    if (status) {
      sql += ` AND ar.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY ar.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const referrals = await c.env.DB.prepare(sql).bind(...params).all();

    return c.json({
      referrals: referrals.results || [],
      total: referrals.results?.length || 0,
    });
  } catch (error) {
    console.error('アフィリエイト紹介履歴エラー:', error);
    return c.json({ error: '紹介履歴の取得に失敗しました' }, 500);
  }
});

// アフィリエイト収益情報
app.get('/affiliate/earnings', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const role = c.get('role');
    if (role !== 'AFFILIATE' && role !== 'ADMIN') {
      return c.json({ error: '権限がありません' }, 403);
    }

    const affiliate = await c.env.DB.prepare(`
      SELECT * FROM affiliates WHERE user_id = ?
    `).bind(userId).first();

    if (!affiliate) {
      return c.json({ earnings: [], summary: { total: 0, pending: 0, paid: 0 } });
    }

    // 月別収益集計
    const monthlyEarnings = await c.env.DB.prepare(`
      SELECT
        strftime('%Y-%m', created_at) as month,
        COUNT(*) as referral_count,
        SUM(commission_amount) as total_commission,
        SUM(CASE WHEN status = 'PAID' THEN commission_amount ELSE 0 END) as paid_amount,
        SUM(CASE WHEN status = 'PENDING' THEN commission_amount ELSE 0 END) as pending_amount
      FROM affiliate_referrals
      WHERE affiliate_id = ?
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY month DESC
      LIMIT 12
    `).bind((affiliate as any).id).all();

    return c.json({
      earnings: monthlyEarnings.results || [],
      summary: {
        total_earnings: (affiliate as any).total_earnings || 0,
        total_referrals: (affiliate as any).total_referrals || 0,
        commission_rate: (affiliate as any).commission_rate || 0.05,
        status: (affiliate as any).status,
      },
    });
  } catch (error) {
    console.error('アフィリエイト収益エラー:', error);
    return c.json({ error: '収益情報の取得に失敗しました' }, 500);
  }
});

export default app;
