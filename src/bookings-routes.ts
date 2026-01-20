/**
 * 予約管理API
 * - 予約作成
 * - 予約一覧取得
 * - 予約詳細取得
 * - 予約キャンセル
 */

import { Hono } from 'hono';
import { verifyJWT } from './auth-middleware';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// 認証必須ミドルウェア
const requireAuth = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: '認証が必要です' }, 401);
  }

  const token = authHeader.substring(7);
  const payload = await verifyJWT(token, c.env.JWT_SECRET);

  if (!payload) {
    return c.json({ error: '無効なトークンです' }, 401);
  }

  c.set('userId', payload.userId);
  c.set('userRole', payload.role);
  await next();
};

// ============================================
// ゲスト予約作成（認証不要）
// ============================================
app.post('/guest', async (c) => {
  const { DB } = c.env;
  
  try {
    const body = await c.req.json();
    const {
      therapist_id,
      site_id,
      booking_type,
      scheduled_at,
      total_price,
      total_duration,
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      postal_code,
      items // { type: 'COURSE' | 'OPTION', course_id, option_id, name, price, duration }[]
    } = body;
    
    // バリデーション
    if (!therapist_id || !booking_type || !scheduled_at || !customer_name || !customer_email || !customer_phone) {
      return c.json({ error: '必須項目が不足しています' }, 400);
    }
    
    // セラピスト名を取得
    const therapist = await DB.prepare('SELECT name FROM users WHERE id = ?').bind(therapist_id).first();
    const therapist_name = therapist ? (therapist as any).name : 'セラピスト';
    
    // 予約IDを生成
    const bookingId = `booking_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // 予約を作成（user_id は NULL、ゲスト予約）
    const insertBookingQuery = `
      INSERT INTO bookings (
        id, user_id, user_name, user_email, user_phone, user_address, postal_code,
        therapist_id, therapist_name, site_id,
        type, status, service_name, duration, price, scheduled_start, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `;
    
    // サービス名を生成（最初のコースの名前）
    const service_name = items && items.length > 0 ? items[0].name : '施術';
    
    await DB.prepare(insertBookingQuery).bind(
      bookingId,              // 1: id
      null,                   // 2: user_id (ゲスト予約なので NULL)
      customer_name,          // 3: user_name
      customer_email,         // 4: user_email
      customer_phone,         // 5: user_phone
      customer_address || null, // 6: user_address
      postal_code || null,    // 7: postal_code
      therapist_id,           // 8: therapist_id
      therapist_name,         // 9: therapist_name
      site_id || null,        // 10: site_id
      booking_type,           // 11: type
      'PENDING_PAYMENT',      // 12: status
      service_name,           // 13: service_name
      total_duration,         // 14: duration
      total_price,            // 15: price
      scheduled_at            // 16: scheduled_start
    ).run();
    
    // 予約アイテムを追加
    if (items && items.length > 0) {
      for (const item of items) {
        const itemId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const insertItemQuery = `
          INSERT INTO booking_items (
            id, booking_id, item_type, item_id, item_name, price, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
        `;
        
        await DB.prepare(insertItemQuery).bind(
          itemId,
          bookingId,
          item.type,
          item.type === 'COURSE' ? item.course_id : item.option_id,
          item.name,
          item.price
        ).run();
      }
    }
    
    return c.json({ 
      success: true,
      bookingId,
      message: 'ゲスト予約が作成されました。決済を完了してください。'
    }, 201);
  } catch (error: any) {
    console.error('❌ Error creating guest booking:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    return c.json({ 
      error: '予約の作成に失敗しました',
      details: error.message 
    }, 500);
  }
});

// ============================================
// ゲスト予約詳細取得（認証不要）
// ============================================
// ゲスト予約詳細取得（認証不要）
// ============================================
app.get('/guest/:bookingId', async (c) => {
  const { DB } = c.env;
  const bookingId = c.req.param('bookingId');
  
  try {
    console.log('🔍 Fetching guest booking:', bookingId);
    
    // 予約情報をセラピスト情報と一緒に取得
    const booking = await DB.prepare(`
      SELECT 
        b.*,
        u.name as therapist_name,
        u.avatar_url as therapist_avatar,
        s.name as site_name,
        s.address as site_address
      FROM bookings b
      LEFT JOIN users u ON b.therapist_id = u.id
      LEFT JOIN sites s ON b.site_id = s.id
      WHERE b.id = ?
    `).bind(bookingId).first();
    
    console.log('📦 Booking found:', booking ? 'YES' : 'NO');
    
    if (!booking) {
      return c.json({ error: '予約が見つかりません' }, 404);
    }
    
    return c.json({ success: true, booking });
  } catch (error: any) {
    console.error('❌ Error fetching guest booking:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return c.json({ 
      error: '予約情報の取得に失敗しました',
      details: error.message 
    }, 500);
  }
});

// すべてのルートに認証必須（ただし /guest は除外済み）
app.use('/*', requireAuth);

// ============================================
// 予約作成
// ============================================
app.post('/', async (c) => {
  const { DB } = c.env;
  const userId = c.get('userId');
  
  try {
    const body = await c.req.json();
    const {
      therapist_id,
      office_id,
      site_id,
      type,
      service_name,
      duration,
      price,
      scheduled_at,
      items, // { item_type: 'COURSE' | 'OPTION', item_id: string, item_name: string, price: number }[]
    } = body;
    
    // バリデーション
    if (!therapist_id || !type || !scheduled_at || !duration || !price) {
      console.error('❌ Validation failed:', {
        therapist_id,
        type,
        scheduled_at,
        duration,
        price
      });
      return c.json({ error: '必須項目が不足しています' }, 400);
    }
    
    console.log('✅ Creating booking with data:', {
      therapist_id,
      type,
      scheduled_at,
      duration,
      price,
      service_name,
      userId,
      site_id,
      itemsCount: items?.length || 0
    });
    
    // 予約IDを生成
    const bookingId = `booking_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // 予約を作成
    console.log('📝 Inserting booking into database...');
    const insertBookingQuery = `
      INSERT INTO bookings (
        id, user_id, therapist_id, office_id, site_id,
        type, status, service_name, duration, price, scheduled_start, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'CONFIRMED', ?, ?, ?, ?, datetime('now'))
    `;
    
    try {
      await DB.prepare(insertBookingQuery).bind(
        bookingId,
        userId,
        therapist_id,
        office_id || null,
        site_id || null,
        type,
        service_name || '施術',
        duration,
        price,
        scheduled_at
      ).run();
      console.log('✅ Booking inserted successfully');
    } catch (dbError: any) {
      console.error('❌ Database insert failed:', dbError);
      throw new Error(`Database insert failed: ${dbError.message}`);
    }
    
    // 予約アイテムを追加
    if (items && items.length > 0) {
      for (const item of items) {
        const itemId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const insertItemQuery = `
          INSERT INTO booking_items (
            id, booking_id, item_type, item_id, item_name, price, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
        `;
        
        await DB.prepare(insertItemQuery).bind(
          itemId,
          bookingId,
          item.item_type,
          item.item_id,
          item.item_name,
          item.price
        ).run();
      }
    }
    
    // 作成した予約を取得
    const booking = await DB.prepare('SELECT * FROM bookings WHERE id = ?').bind(bookingId).first();
    
    return c.json({ 
      success: true,
      bookingId,  // Add bookingId to response
      booking
    }, 201);
  } catch (error: any) {
    console.error('❌ Error creating booking:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    return c.json({ 
      error: '予約の作成に失敗しました',
      details: error.message || 'Unknown error',
      errorType: error.constructor.name
    }, 500);
  }
});

// ============================================
// 予約一覧取得（ユーザー自身の予約）
// ============================================
app.get('/', async (c) => {
  const { DB } = c.env;
  const userId = c.get('userId');
  
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const status = c.req.query('status') || '';
  
  const offset = (page - 1) * limit;
  
  try {
    // WHERE句の構築
    const conditions: string[] = ['b.user_id = ?'];
    const params: any[] = [userId];
    
    if (status) {
      conditions.push('b.status = ?');
      params.push(status);
    }
    
    const whereClause = conditions.join(' AND ');
    
    // 総数取得
    const countQuery = `
      SELECT COUNT(*) as total
      FROM bookings b
      WHERE ${whereClause}
    `;
    const countResult = await DB.prepare(countQuery).bind(...params).first<{ total: number }>();
    const total = countResult?.total || 0;
    
    // データ取得
    const query = `
      SELECT 
        b.*,
        u.name as therapist_name,
        u.avatar_url as therapist_avatar,
        s.name as site_name,
        s.address as site_address
      FROM bookings b
      LEFT JOIN therapist_profiles tp ON b.therapist_id = tp.id
      LEFT JOIN users u ON tp.user_id = u.id
      LEFT JOIN sites s ON b.site_id = s.id
      WHERE ${whereClause}
      ORDER BY b.scheduled_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const result = await DB.prepare(query).bind(...params, limit, offset).all();
    
    return c.json({
      bookings: result.results || [],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    return c.json({ error: '予約の取得に失敗しました' }, 500);
  }
});

// ============================================
// 予約詳細取得
// ============================================
app.get('/:id', async (c) => {
  const { DB } = c.env;
  const userId = c.get('userId');
  const bookingId = c.req.param('id');
  
  try {
    // 予約情報取得
    const bookingQuery = `
      SELECT 
        b.*,
        u.name as therapist_name,
        u.avatar_url as therapist_avatar,
        u.phone as therapist_phone,
        s.name as site_name,
        s.address as site_address,
        s.phone as site_phone,
        sr.room_number,
        sr.name as room_name
      FROM bookings b
      LEFT JOIN therapist_profiles tp ON b.therapist_id = tp.id
      LEFT JOIN users u ON tp.user_id = u.id
      LEFT JOIN sites s ON b.site_id = s.id
      LEFT JOIN site_rooms sr ON b.room_id = sr.id
      WHERE b.id = ? AND b.user_id = ?
    `;
    
    const booking = await DB.prepare(bookingQuery).bind(bookingId, userId).first();
    
    if (!booking) {
      return c.json({ error: '予約が見つかりません' }, 404);
    }
    
    // 予約アイテム取得
    const itemsQuery = `
      SELECT *
      FROM booking_items
      WHERE booking_id = ?
      ORDER BY item_type
    `;
    
    const itemsResult = await DB.prepare(itemsQuery).bind(bookingId).all();
    
    return c.json({
      booking,
      items: itemsResult.results || []
    });
  } catch (error: any) {
    console.error('Error fetching booking detail:', error);
    return c.json({ error: '予約の取得に失敗しました' }, 500);
  }
});

// ============================================
// 予約キャンセル
// ============================================
app.delete('/:id', async (c) => {
  const { DB } = c.env;
  const userId = c.get('userId');
  const bookingId = c.req.param('id');
  
  try {
    // 予約が存在し、ユーザー自身の予約であることを確認
    const booking = await DB.prepare(
      'SELECT * FROM bookings WHERE id = ? AND user_id = ?'
    ).bind(bookingId, userId).first();
    
    if (!booking) {
      return c.json({ error: '予約が見つかりません' }, 404);
    }
    
    // キャンセル可能な状態かチェック
    if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
      return c.json({ error: 'この予約はキャンセルできません' }, 400);
    }
    
    // ステータスを CANCELLED に更新
    await DB.prepare(
      "UPDATE bookings SET status = 'CANCELLED', updated_at = datetime('now') WHERE id = ?"
    ).bind(bookingId).run();
    
    return c.json({ 
      success: true,
      message: '予約をキャンセルしました'
    });
  } catch (error: any) {
    console.error('Error cancelling booking:', error);
    return c.json({ error: '予約のキャンセルに失敗しました' }, 500);
  }
});

// ============================================
// 予約承認（セラピスト専用）
// ============================================
app.patch('/:id/approve', async (c) => {
  const { DB } = c.env;
  const userId = c.get('userId');
  const userRole = c.get('userRole');
  const bookingId = c.req.param('id');
  
  try {
    // セラピストまたは管理者のみ
    if (userRole !== 'THERAPIST' && userRole !== 'ADMIN') {
      return c.json({ error: '権限がありません' }, 403);
    }

    // 予約が存在し、担当セラピストであることを確認
    const booking = await DB.prepare(
      'SELECT * FROM bookings WHERE id = ?'
    ).bind(bookingId).first();
    
    if (!booking) {
      return c.json({ error: '予約が見つかりません' }, 404);
    }

    // ステータスを CONFIRMED に更新
    await DB.prepare(
      "UPDATE bookings SET status = 'CONFIRMED', updated_at = datetime('now') WHERE id = ?"
    ).bind(bookingId).run();
    
    return c.json({ 
      success: true,
      message: '予約を承認しました'
    });
  } catch (error: any) {
    console.error('Error approving booking:', error);
    return c.json({ error: '予約の承認に失敗しました' }, 500);
  }
});

// ============================================
// 予約拒否（セラピスト専用）
// ============================================
app.patch('/:id/reject', async (c) => {
  const { DB } = c.env;
  const userId = c.get('userId');
  const userRole = c.get('userRole');
  const bookingId = c.req.param('id');
  
  try {
    const body = await c.req.json();
    const { reason } = body;

    // セラピストまたは管理者のみ
    if (userRole !== 'THERAPIST' && userRole !== 'ADMIN') {
      return c.json({ error: '権限がありません' }, 403);
    }

    // 予約が存在し、担当セラピストであることを確認
    const booking = await DB.prepare(
      'SELECT * FROM bookings WHERE id = ?'
    ).bind(bookingId).first();
    
    if (!booking) {
      return c.json({ error: '予約が見つかりません' }, 404);
    }

    // ステータスを REJECTED に更新
    await DB.prepare(
      "UPDATE bookings SET status = 'REJECTED', updated_at = datetime('now') WHERE id = ?"
    ).bind(bookingId).run();
    
    // 拒否理由をログに記録（オプション）
    if (reason) {
      await DB.prepare(
        "INSERT INTO booking_logs (booking_id, action, notes, created_at) VALUES (?, 'REJECTED', ?, datetime('now'))"
      ).bind(bookingId, reason).run();
    }
    
    return c.json({ 
      success: true,
      message: '予約を拒否しました'
    });
  } catch (error: any) {
    console.error('Error rejecting booking:', error);
    return c.json({ error: '予約の拒否に失敗しました' }, 500);
  }
});

export default app;
