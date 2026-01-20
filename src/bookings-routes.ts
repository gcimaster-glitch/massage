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
    
    // 🔍 受信した全データをログ出力
    console.log('========================================');
    console.log('📥 GUEST BOOKING REQUEST - FULL BODY:');
    console.log(JSON.stringify(body, null, 2));
    console.log('========================================');
    
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
    
    // 🔍 各パラメータの型と値をログ出力
    console.log('📋 Parsed parameters:');
    console.log(`  therapist_id: ${typeof therapist_id} = ${therapist_id}`);
    console.log(`  site_id: ${typeof site_id} = ${site_id}`);
    console.log(`  booking_type: ${typeof booking_type} = ${booking_type}`);
    console.log(`  scheduled_at: ${typeof scheduled_at} = ${scheduled_at}`);
    console.log(`  total_price: ${typeof total_price} = ${total_price}`);
    console.log(`  total_duration: ${typeof total_duration} = ${total_duration}`);
    console.log(`  customer_name: ${typeof customer_name} = ${customer_name}`);
    console.log(`  customer_email: ${typeof customer_email} = ${customer_email}`);
    console.log(`  customer_phone: ${typeof customer_phone} = ${customer_phone}`);
    console.log(`  customer_address: ${typeof customer_address} = ${customer_address}`);
    console.log(`  postal_code: ${typeof postal_code} = ${postal_code}`);
    console.log(`  items: ${typeof items} = ${JSON.stringify(items)}`);
    console.log('========================================');
    
    // バリデーション
    if (!therapist_id || !booking_type || !scheduled_at || !customer_name || !customer_email || !customer_phone) {
      console.error('❌ Validation failed - missing required fields');
      return c.json({ error: '必須項目が不足しています' }, 400);
    }
    
    // セラピスト名を取得
    const therapist = await DB.prepare('SELECT name FROM users WHERE id = ?').bind(therapist_id).first();
    const therapist_name = therapist ? (therapist as any).name : 'セラピスト';
    
    // 予約IDを生成
    const bookingId = `booking_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // バインド値
    const service_name = items && items.length > 0 ? items[0].name : '施術';
    
    // 🔍 環境判別: bookingsテーブルのスキーマを確認
    const schemaCheck = await DB.prepare(
      "SELECT sql FROM sqlite_master WHERE type='table' AND name='bookings'"
    ).first<{ sql: string }>();
    
    const hasUserColumns = schemaCheck?.sql?.includes('user_name');
    const hasScheduledStart = schemaCheck?.sql?.includes('scheduled_start');
    
    console.log('🔍 Environment detection:');
    console.log(`  hasUserColumns: ${hasUserColumns}`);
    console.log(`  hasScheduledStart: ${hasScheduledStart}`);
    
    let insertBookingQuery: string;
    let bindValues: any[];
    
    if (hasUserColumns) {
      // 本番環境: user_name, user_email, user_phone, scheduled_start を使用
      console.log('✅ Using PRODUCTION schema (with user columns and scheduled_start)');
      insertBookingQuery = `
        INSERT INTO bookings (
          id, user_id, user_name, user_email, user_phone, user_address, postal_code,
          therapist_id, therapist_name, site_id,
          type, status, service_name, duration, price, scheduled_start, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `;
      bindValues = [
        bookingId,
        null, // user_id
        customer_name,
        customer_email,
        customer_phone,
        customer_address || null,
        postal_code || null,
        therapist_id,
        therapist_name,
        site_id || null,
        booking_type,
        'PENDING_PAYMENT',
        service_name,
        total_duration,
        total_price,
        scheduled_at
      ];
    } else {
      // ローカル環境: user_id, therapist_id, scheduled_at のみ使用
      console.log('✅ Using LOCAL schema (without user columns, with scheduled_at)');
      
      // ゲスト用の共通ユーザーID（ローカル環境ではuser_idがNOT NULL）
      const guestUserId = 'guest-user';
      console.log(`  Using guest user_id: ${guestUserId}`);
      
      insertBookingQuery = `
        INSERT INTO bookings (
          id, user_id, therapist_id, therapist_name, office_id, site_id,
          type, status, service_name, duration, price, scheduled_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `;
      
      // ローカル環境用のtherapist_id変換
      const profileResult = await DB.prepare(
        'SELECT id FROM therapist_profiles WHERE user_id = ?'
      ).bind(therapist_id).first<{ id: string }>();
      
      const finalTherapistId = profileResult?.id || therapist_id;
      console.log(`  therapist_id: ${therapist_id} -> ${finalTherapistId}`);
      
      bindValues = [
        bookingId,
        guestUserId, // ゲスト用の一時ユーザーID
        finalTherapistId,
        therapist_name,
        null, // office_id
        site_id || null,
        booking_type,
        'PENDING', // ローカル環境では PENDING_PAYMENT が使えない
        service_name,
        total_duration,
        total_price,
        scheduled_at
      ];
    }
    
    console.log('📋 Guest booking bind values:', bindValues.map((v, i) => `[${i}] ${typeof v}: ${v}`));
    
    try {
      await DB.prepare(insertBookingQuery).bind(...bindValues).run();
      console.log('✅ Guest booking inserted successfully');
    } catch (dbError: any) {
      console.error('❌ Guest booking insert failed:', dbError);
      throw dbError;
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
// 予約作成（認証必須）
// ============================================
app.post('/', requireAuth, async (c) => {
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
      office_id,
      itemsCount: items?.length || 0
    });
    
    // セラピスト名とプロフィールIDを取得
    const therapistResult = await DB.prepare(
      'SELECT name FROM users WHERE id = ?'
    ).bind(therapist_id).first<{ name: string }>();
    
    const therapistName = therapistResult?.name || 'セラピスト';
    console.log('👤 Therapist name:', therapistName);
    
    // 環境に応じてtherapist_idを決定
    // ローカル: therapist_profiles.idを使用
    // 本番: users.idを使用
    let finalTherapistId = therapist_id;
    
    // therapist_profilesテーブルからIDを取得して環境判別
    const profileResult = await DB.prepare(
      'SELECT user_id FROM therapist_profiles WHERE user_id = ? LIMIT 1'
    ).bind(therapist_id).first<{ user_id: string }>();
    
    if (profileResult) {
      // ローカル環境: therapist_profiles(id)が主キー
      // profile-xxxの形式のIDを取得
      const localProfileResult = await DB.prepare(
        'SELECT id FROM therapist_profiles WHERE user_id = ?'
      ).bind(therapist_id).first<{ id: string }>();
      
      if (localProfileResult?.id && localProfileResult.id !== therapist_id) {
        finalTherapistId = localProfileResult.id;
        console.log(`🔄 Using therapist profile ID: ${finalTherapistId} (local env)`);
      } else {
        console.log(`✅ Using user ID: ${finalTherapistId} (production env)`);
      }
    }
    
    // 予約IDを生成
    const bookingId = `booking_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // バインド値を事前にログ出力
    const bindValues = [
      bookingId,
      userId,
      finalTherapistId, // 環境に応じたID
      therapistName,
      office_id || null,
      site_id || null,
      type,
      service_name || '施術',
      duration,
      price,
      scheduled_at
    ];
    
    console.log('📋 Bind values:', bindValues.map((v, i) => `[${i}] ${typeof v}: ${v}`));
    
    // 予約を作成
    console.log('📝 Inserting booking into database...');
    
    // 環境判別: scheduled_at vs scheduled_start
    // ローカル: scheduled_at, 本番: scheduled_start
    let insertBookingQuery = `
      INSERT INTO bookings (
        id, user_id, therapist_id, therapist_name, office_id, site_id,
        type, status, service_name, duration, price, scheduled_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', ?, ?, ?, ?, datetime('now'))
    `;
    
    try {
      await DB.prepare(insertBookingQuery).bind(...bindValues).run();
      console.log('✅ Booking inserted successfully');
    } catch (dbError: any) {
      console.error('❌ Database insert failed (trying scheduled_at):', dbError);
      
      // scheduled_atで失敗した場合、scheduled_startで再試行
      if (dbError.message?.includes('scheduled_at')) {
        console.log('🔄 Retrying with scheduled_start column...');
        insertBookingQuery = `
          INSERT INTO bookings (
            id, user_id, therapist_id, therapist_name, office_id, site_id,
            type, status, service_name, duration, price, scheduled_start, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', ?, ?, ?, ?, datetime('now'))
        `;
        
        try {
          await DB.prepare(insertBookingQuery).bind(...bindValues).run();
          console.log('✅ Booking inserted successfully with scheduled_start');
        } catch (retryError: any) {
          console.error('❌ Database insert failed again:', retryError);
          throw new Error(`Database insert failed: ${retryError.message}`);
        }
      } else {
        throw new Error(`Database insert failed: ${dbError.message}`);
      }
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
app.get('/', requireAuth, async (c) => {
  const { DB } = c.env;
  const userId = c.get('userId');
  const userRole = c.get('userRole');
  
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const status = c.req.query('status') || '';
  
  const offset = (page - 1) * limit;
  
  try {
    let whereClause = '';
    let params: any[] = [];

    // ロールに応じてクエリを変更
    if (userRole === 'THERAPIST') {
      // セラピストの場合：自分が担当する予約を取得
      const therapistProfile = await DB.prepare(
        'SELECT id FROM therapist_profiles WHERE user_id = ?'
      ).bind(userId).first<any>();

      if (!therapistProfile) {
        return c.json({ error: 'セラピストプロフィールが見つかりません' }, 404);
      }

      whereClause = 'b.therapist_id = ?';
      params.push(therapistProfile.id);
    } else if (userRole === 'USER') {
      // ユーザーの場合：自分の予約を取得
      whereClause = 'b.user_id = ?';
      params.push(userId);
    } else if (userRole === 'ADMIN') {
      // 管理者の場合：全予約を取得
      whereClause = '1=1';
    } else {
      return c.json({ error: '権限がありません' }, 403);
    }

    if (status) {
      whereClause += ' AND b.status = ?';
      params.push(status);
    }

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
app.get('/:id', requireAuth, async (c) => {
  const { DB } = c.env;
  const userId = c.get('userId');
  const userRole = c.get('userRole');
  const bookingId = c.req.param('id');
  
  try {
    // 予約情報取得（顧客情報も含む）
    const bookingQuery = `
      SELECT 
        b.*,
        t_user.name as therapist_name,
        t_user.avatar_url as therapist_avatar,
        t_user.phone as therapist_phone,
        c_user.name as customer_name,
        c_user.email as customer_email,
        c_user.phone as customer_phone,
        s.name as site_name,
        s.address as site_address
      FROM bookings b
      LEFT JOIN therapist_profiles tp ON b.therapist_id = tp.id
      LEFT JOIN users t_user ON tp.user_id = t_user.id
      LEFT JOIN users c_user ON b.user_id = c_user.id
      LEFT JOIN sites s ON b.site_id = s.id
      WHERE b.id = ?
    `;
    
    const booking = await DB.prepare(bookingQuery).bind(bookingId).first<any>();
    
    if (!booking) {
      return c.json({ error: '予約が見つかりません' }, 404);
    }

    // 権限チェック
    if (userRole === 'USER' && booking.user_id !== userId) {
      return c.json({ error: '他のユーザーの予約は閲覧できません' }, 403);
    }

    if (userRole === 'THERAPIST') {
      const therapistProfile = await DB.prepare(
        'SELECT id FROM therapist_profiles WHERE user_id = ?'
      ).bind(userId).first<any>();

      if (!therapistProfile || booking.therapist_id !== therapistProfile.id) {
        return c.json({ error: '他のセラピストの予約は閲覧できません' }, 403);
      }
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

// ============================================
// 予約ステータス更新（セラピスト専用）
// ============================================
app.patch('/:id/status', requireAuth, async (c) => {
  const { DB } = c.env;
  const userId = c.get('userId');
  const userRole = c.get('userRole');
  const bookingId = c.req.param('id');
  
  try {
    const body = await c.req.json();
    const { status, notes } = body;

    console.log('📝 Updating booking status:', { bookingId, status, userRole });

    // バリデーション
    const validStatuses = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return c.json({ error: '無効なステータスです' }, 400);
    }

    // セラピストまたは管理者のみ
    if (userRole !== 'THERAPIST' && userRole !== 'ADMIN' && userRole !== 'USER') {
      return c.json({ error: '権限がありません' }, 403);
    }

    // 予約が存在することを確認
    const booking = await DB.prepare(
      'SELECT * FROM bookings WHERE id = ?'
    ).bind(bookingId).first<any>();
    
    if (!booking) {
      return c.json({ error: '予約が見つかりません' }, 404);
    }

    // ユーザーの場合は自分の予約のみキャンセル可能
    if (userRole === 'USER') {
      if (booking.user_id !== userId) {
        return c.json({ error: '他のユーザーの予約は変更できません' }, 403);
      }
      if (status !== 'CANCELLED') {
        return c.json({ error: 'キャンセル以外のステータス変更はできません' }, 403);
      }
    }

    // セラピストの場合は自分の予約のみ変更可能
    if (userRole === 'THERAPIST') {
      // therapist_idがセラピストプロフィールIDと一致するか確認
      const therapistProfile = await DB.prepare(
        'SELECT id FROM therapist_profiles WHERE user_id = ?'
      ).bind(userId).first<any>();

      if (!therapistProfile || booking.therapist_id !== therapistProfile.id) {
        return c.json({ error: '他のセラピストの予約は変更できません' }, 403);
      }
    }

    // ステータスに応じてタイムスタンプを更新
    let updateQuery = "UPDATE bookings SET status = ?, updated_at = datetime('now')";
    const bindParams: any[] = [status];

    if (status === 'IN_PROGRESS') {
      updateQuery += ", started_at = datetime('now')";
    } else if (status === 'COMPLETED') {
      updateQuery += ", completed_at = datetime('now')";
    }

    updateQuery += " WHERE id = ?";
    bindParams.push(bookingId);

    await DB.prepare(updateQuery).bind(...bindParams).run();

    console.log('✅ Booking status updated:', { bookingId, status });

    // ログに記録（オプション）
    if (notes) {
      try {
        await DB.prepare(
          "INSERT INTO booking_logs (booking_id, action, notes, created_at) VALUES (?, ?, ?, datetime('now'))"
        ).bind(bookingId, `STATUS_CHANGE_${status}`, notes).run();
      } catch (logError) {
        console.warn('Failed to create booking log:', logError);
      }
    }
    
    return c.json({ 
      success: true,
      message: 'ステータスを更新しました',
      status
    });
  } catch (error: any) {
    console.error('❌ Error updating booking status:', error);
    return c.json({ 
      error: 'ステータスの更新に失敗しました',
      details: error.message 
    }, 500);
  }
});

export default app;
