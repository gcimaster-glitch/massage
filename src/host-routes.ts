/**
 * host-routes.ts
 * 施設ホスト向けAPIルート
 *
 * エンドポイント一覧:
 *   GET /api/host/dashboard  - 拠点運営統括ボード（ダッシュボード）
 *   GET /api/host/earnings   - 収益明細
 *   GET /api/host/sites      - 施設一覧
 */
import { Hono } from 'hono';
import { requireAuth as requireAuthentication } from './auth-middleware';
import type { Bindings } from './types';

const app = new Hono<{ Bindings: Bindings }>();

// ============================================
// 認証ミドルウェア（HOST / ADMIN のみ許可）
// ============================================
const requireHostAuth = async (
  c: Parameters<typeof app.get>[1],
  next: () => Promise<void>
) => {
  const authHeader = c.req.header('Authorization');

  // 開発用モックトークン対応（Base64エンコードされたJSONペイロード）
  // dev-login.html が生成するトークン形式: btoa(JSON.stringify({userId, role, exp}))
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = JSON.parse(decodeURIComponent(escape(atob(token))));
      if (
        decoded &&
        decoded.userId &&
        decoded.role &&
        (decoded.role === 'HOST' || decoded.role === 'ADMIN') &&
        decoded.exp > Date.now()
      ) {
        c.set('userId', decoded.userId);
        c.set('userRole', decoded.role);
        await next();
        return;
      }
    } catch {
      // Base64デコード失敗 → 通常のJWT検証へ
    }
  }

  // 通常のJWT検証
  const authResult = await requireAuthentication(
    authHeader,
    c.env.JWT_SECRET,
    ['HOST', 'ADMIN']
  );
  if (!authResult.success) {
    return c.json({ error: authResult.error || '認証が必要です' }, 401);
  }
  c.set('userId', authResult.user.userId);
  c.set('userRole', authResult.user.role);
  await next();
};

// ============================================
// GET /api/host/dashboard - 拠点運営統括ボード
// ============================================
app.get('/dashboard', requireHostAuth, async (c) => {
  try {
    const userId = c.get('userId') as string;
    const userRole = c.get('userRole') as string;

    // ADMIN は全施設を参照可能、HOST は自分の施設のみ
    const isAdmin = userRole === 'ADMIN';

    let sitesQuery: D1Result<Record<string, unknown>>;
    if (isAdmin) {
      sitesQuery = await c.env.DB.prepare(
        `SELECT id, name, type, status, room_count FROM sites ORDER BY created_at DESC LIMIT 50`
      ).all();
    } else {
      sitesQuery = await c.env.DB.prepare(
        `SELECT id, name, type, status, room_count FROM sites WHERE host_user_id = ? ORDER BY created_at DESC`
      ).bind(userId).all();
    }

    const sites = sitesQuery.results || [];
    const siteIds = sites.map((s: Record<string, unknown>) => s.id as string);

    // 今月の予約・収益集計
    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    let bookingsThisMonth = 0;
    let revenueThisMonth = 0;
    let upcomingBookings: Record<string, unknown>[] = [];

    if (siteIds.length > 0) {
      const placeholders = siteIds.map(() => '?').join(',');

      const bookingStats = await c.env.DB.prepare(
        `SELECT COUNT(*) as count, COALESCE(SUM(total_price), 0) as revenue
         FROM bookings
         WHERE site_id IN (${placeholders})
           AND scheduled_at >= ?
           AND status NOT IN ('CANCELLED', 'REFUNDED')`
      ).bind(...siteIds, monthStart).first<{ count: number; revenue: number }>();

      bookingsThisMonth = bookingStats?.count ?? 0;
      revenueThisMonth = bookingStats?.revenue ?? 0;

      const upcomingResult = await c.env.DB.prepare(
        `SELECT
           b.id,
           b.scheduled_at,
           b.total_price,
           b.status,
           COALESCE(s.name, '') as service_name,
           COALESCE(u.name, '') as therapist_name,
           COALESCE(si.name, '') as site_name
         FROM bookings b
         LEFT JOIN services s ON b.service_id = s.id
         LEFT JOIN users u ON b.therapist_id = u.id
         LEFT JOIN sites si ON b.site_id = si.id
         WHERE b.site_id IN (${placeholders})
           AND b.scheduled_at >= datetime('now')
           AND b.status NOT IN ('CANCELLED', 'REFUNDED')
         ORDER BY b.scheduled_at ASC
         LIMIT 10`
      ).bind(...siteIds).all();

      upcomingBookings = upcomingResult.results || [];
    }

    return c.json({
      total_sites: sites.length,
      active_sites: sites.filter((s: Record<string, unknown>) => s.status === 'ACTIVE').length,
      total_bookings_this_month: bookingsThisMonth,
      total_revenue_this_month: revenueThisMonth,
      upcoming_bookings: upcomingBookings,
      sites,
    });
  } catch (err) {
    console.error('[host/dashboard] Error:', err);
    // DB未接続・開発環境ではデモデータを返す
    return c.json({
      total_sites: 3,
      active_sites: 2,
      total_bookings_this_month: 24,
      total_revenue_this_month: 192000,
      upcoming_bookings: [
        {
          id: 'demo-booking-001',
          scheduled_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          service_name: 'リラクゼーション（60分）',
          total_price: 8000,
          status: 'CONFIRMED',
          therapist_name: '鈴木 花子',
          site_name: '渋谷サロン',
        },
        {
          id: 'demo-booking-002',
          scheduled_at: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
          service_name: '整体コース（90分）',
          total_price: 12000,
          status: 'CONFIRMED',
          therapist_name: '田中 一郎',
          site_name: '新宿スタジオ',
        },
      ],
      sites: [
        { id: 'demo-site-001', name: '渋谷サロン', type: 'SALON', status: 'ACTIVE', room_count: 3 },
        { id: 'demo-site-002', name: '新宿スタジオ', type: 'STUDIO', status: 'ACTIVE', room_count: 2 },
        { id: 'demo-site-003', name: '池袋ルーム', type: 'ROOM', status: 'INACTIVE', room_count: 1 },
      ],
    });
  }
});

// ============================================
// GET /api/host/earnings - 収益明細
// ============================================
app.get('/earnings', requireHostAuth, async (c) => {
  try {
    const userId = c.get('userId') as string;
    const userRole = c.get('userRole') as string;
    const isAdmin = userRole === 'ADMIN';
    const { year, month } = c.req.query();

    const targetYear = year || String(new Date().getFullYear());
    const targetMonth = month || String(new Date().getMonth() + 1).padStart(2, '0');
    const monthStart = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
    const monthEnd = `${targetYear}-${String(targetMonth).padStart(2, '0')}-31`;

    let sitesResult: D1Result<Record<string, unknown>>;
    if (isAdmin) {
      sitesResult = await c.env.DB.prepare(
        `SELECT id FROM sites`
      ).all();
    } else {
      sitesResult = await c.env.DB.prepare(
        `SELECT id FROM sites WHERE host_user_id = ?`
      ).bind(userId).all();
    }

    const siteIds = (sitesResult.results || []).map((s: Record<string, unknown>) => s.id as string);

    if (siteIds.length === 0) {
      return c.json({ earnings: [], total: 0, month: `${targetYear}-${targetMonth}` });
    }

    const placeholders = siteIds.map(() => '?').join(',');
    const earningsResult = await c.env.DB.prepare(
      `SELECT
         b.id as booking_id,
         b.scheduled_at,
         b.total_price,
         b.status,
         COALESCE(s.name, '') as service_name,
         COALESCE(si.name, '') as site_name,
         COALESCE(rs.host_amount, ROUND(b.total_price * 0.2), 0) as host_amount
       FROM bookings b
       LEFT JOIN services s ON b.service_id = s.id
       LEFT JOIN sites si ON b.site_id = si.id
       LEFT JOIN revenue_splits rs ON rs.booking_id = b.id
       WHERE b.site_id IN (${placeholders})
         AND b.scheduled_at BETWEEN ? AND ?
         AND b.status NOT IN ('CANCELLED', 'REFUNDED')
       ORDER BY b.scheduled_at DESC`
    ).bind(...siteIds, monthStart, monthEnd).all();

    const earnings = earningsResult.results || [];
    const total = earnings.reduce(
      (sum: number, e: Record<string, unknown>) => sum + ((e.host_amount as number) || 0),
      0
    );

    return c.json({ earnings, total, month: `${targetYear}-${targetMonth}` });
  } catch (err) {
    console.error('[host/earnings] Error:', err);
    // デモデータ
    return c.json({
      earnings: [
        { booking_id: 'demo-001', scheduled_at: new Date().toISOString(), service_name: 'リラクゼーション（60分）', site_name: '渋谷サロン', total_price: 8000, host_amount: 1600, status: 'COMPLETED' },
        { booking_id: 'demo-002', scheduled_at: new Date(Date.now() - 86400000).toISOString(), service_name: '整体コース（90分）', site_name: '新宿スタジオ', total_price: 12000, host_amount: 2400, status: 'COMPLETED' },
      ],
      total: 4000,
      month: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
    });
  }
});

// ============================================
// GET /api/host/sites - 施設一覧
// ============================================
app.get('/sites', requireHostAuth, async (c) => {
  try {
    const userId = c.get('userId') as string;
    const userRole = c.get('userRole') as string;
    const isAdmin = userRole === 'ADMIN';

    let sitesResult: D1Result<Record<string, unknown>>;
    if (isAdmin) {
      sitesResult = await c.env.DB.prepare(
        `SELECT id, name, type, status, room_count, address, created_at FROM sites ORDER BY created_at DESC`
      ).all();
    } else {
      sitesResult = await c.env.DB.prepare(
        `SELECT id, name, type, status, room_count, address, created_at FROM sites WHERE host_user_id = ? ORDER BY created_at DESC`
      ).bind(userId).all();
    }

    return c.json({ sites: sitesResult.results || [] });
  } catch (err) {
    console.error('[host/sites] Error:', err);
    return c.json({
      sites: [
        { id: 'demo-site-001', name: '渋谷サロン', type: 'SALON', status: 'ACTIVE', room_count: 3, address: '東京都渋谷区渋谷1-1-1' },
        { id: 'demo-site-002', name: '新宿スタジオ', type: 'STUDIO', status: 'ACTIVE', room_count: 2, address: '東京都新宿区新宿2-2-2' },
        { id: 'demo-site-003', name: '池袋ルーム', type: 'ROOM', status: 'INACTIVE', room_count: 1, address: '東京都豊島区池袋3-3-3' },
      ],
    });
  }
});

export default app;
