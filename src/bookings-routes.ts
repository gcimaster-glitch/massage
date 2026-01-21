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
  // ゲスト予約を無効化：会員登録必須
  return c.json({ 
    error: '予約には会員登録が必要です',
    message: '会員登録後、予約を続行してください。',
    requireAuth: true
  }, 401);
});

/*
// ===== ゲスト予約エンドポイント（無効化済み） =====
// 会員登録必須化のため、このコードは使用されません
app.post('/guest', async (c) => {
  const { DB } = c.env;
  
  try {
    const rawBody = await c.req.json();
    
    // 🔍 受信した全データをログ出力
    console.log('========================================');
    console.log('📥 GUEST BOOKING REQUEST - RAW BODY:');
    console.log(JSON.stringify(rawBody, null, 2));
    console.log('========================================');
    
    // 🛡️ undefined/null値を完全に除去して安全な値に変換
    const cleanValue = (val: any, defaultValue: any = null) => {
      if (val === undefined || val === null || val === 'undefined' || val === 'null') {
        return defaultValue;
      }
      return val;
    };
    
    // 全フィールドを安全な値に変換
    const body = {
      therapist_id: cleanValue(rawBody.therapist_id),
      site_id: cleanValue(rawBody.site_id, null),
      booking_type: cleanValue(rawBody.booking_type, 'ONSITE'),
      scheduled_at: cleanValue(rawBody.scheduled_at),
      total_price: cleanValue(rawBody.total_price, 0),
      total_duration: cleanValue(rawBody.total_duration, 60),
      customer_name: cleanValue(rawBody.customer_name),
      customer_email: cleanValue(rawBody.customer_email),
      customer_phone: cleanValue(rawBody.customer_phone),
      customer_address: cleanValue(rawBody.customer_address, null),
      postal_code: cleanValue(rawBody.postal_code, null),
      items: Array.isArray(rawBody.items) ? rawBody.items.map((item: any) => ({
        type: cleanValue(item.type, 'COURSE'),
        course_id: cleanValue(item.course_id),
        option_id: cleanValue(item.option_id),
        name: cleanValue(item.name, '施術'),
        price: cleanValue(item.price, 0),
        duration: cleanValue(item.duration, 0)
      })) : []
    };
    
    console.log('🔧 CLEANED BODY:');
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
    
    // 🛡️ undefined値を自動修正
    const fixedBody: any = {};
    for (const [key, value] of Object.entries(body)) {
      if (value === undefined || value === 'undefined') {
        console.warn(`⚠️ Found undefined value for key: ${key}, converting to null`);
        fixedBody[key] = null;
      } else {
        fixedBody[key] = value;
      }
    }
    
    // 修正後の値を再代入
    const fixed = {
      therapist_id: fixedBody.therapist_id,
      site_id: fixedBody.site_id || null,
      booking_type: fixedBody.booking_type || 'ONSITE',
      scheduled_at: fixedBody.scheduled_at,
      total_price: fixedBody.total_price || 0,
      total_duration: fixedBody.total_duration || 60,
      customer_name: fixedBody.customer_name,
      customer_email: fixedBody.customer_email,
      customer_phone: fixedBody.customer_phone,
      customer_address: fixedBody.customer_address || null,
      postal_code: fixedBody.postal_code || null,
      items: fixedBody.items || []
    };
    
    console.log('🔧 Fixed parameters:', JSON.stringify(fixed, null, 2));
    
    // バリデーション
    if (!fixed.therapist_id || !fixed.booking_type || !fixed.scheduled_at || !fixed.customer_name || !fixed.customer_email || !fixed.customer_phone) {
      console.error('❌ Validation failed - missing required fields after fix');
      return c.json({ 
        error: '必須項目が不足しています',
        details: {
          therapist_id: !!fixed.therapist_id,
          booking_type: !!fixed.booking_type,
          scheduled_at: !!fixed.scheduled_at,
          customer_name: !!fixed.customer_name,
          customer_email: !!fixed.customer_email,
          customer_phone: !!fixed.customer_phone
        }
      }, 400);
    }
    
    // 修正後の値を使用
    const therapist_id_fixed = fixed.therapist_id;
    
    // 🔧 therapist_id を therapist_profiles.id に変換
    // URL params: therapist-1 → therapist_profiles.id: tp-1
    let therapist_profile_id = therapist_id_fixed;
    if (therapist_id_fixed && therapist_id_fixed.startsWith('therapist-')) {
      const num = therapist_id_fixed.replace('therapist-', '');
      therapist_profile_id = `tp-${num}`;
      console.log(`🔄 Converting therapist_id: ${therapist_id_fixed} → ${therapist_profile_id}`);
    }
    
    const site_id_fixed = fixed.site_id;
    const booking_type_fixed = fixed.booking_type;
    const scheduled_at_fixed = fixed.scheduled_at;
    const total_price_fixed = fixed.total_price;
    const total_duration_fixed = fixed.total_duration;
    const customer_name_fixed = fixed.customer_name;
    const customer_email_fixed = fixed.customer_email;
    const customer_phone_fixed = fixed.customer_phone;
    const customer_address_fixed = fixed.customer_address;
    const postal_code_fixed = fixed.postal_code;
    const items_fixed = fixed.items;
    
    // セラピスト名を取得
    const therapist = await DB.prepare('SELECT name FROM users WHERE id = ?').bind(therapist_id_fixed).first();
    const therapist_name = therapist ? (therapist as any).name : 'セラピスト';
    
    // 予約IDを生成
    const bookingId = `booking_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // バインド値
    const service_name = items_fixed && items_fixed.length > 0 ? items_fixed[0].name : '施術';
    
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
        customer_name_fixed,
        customer_email_fixed,
        customer_phone_fixed,
        customer_address_fixed || null,
        postal_code_fixed || null,
        therapist_profile_id, // therapist_profiles.id を使用
        therapist_name,
        site_id_fixed || null,
        booking_type_fixed,
        'PENDING_PAYMENT',
        service_name,
        total_duration_fixed || 60,
        total_price_fixed || 0,
        scheduled_at_fixed
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
      
      // therapist_id は user_id と同じ（therapist_profiles の主キーは user_id）
      // 外部キー制約が therapist_profiles(id) を参照しているが、実際には user_id を使う
      console.log(`  Using therapist_id directly as user_id: ${therapist_id_fixed}`);
      
      bindValues = [
        bookingId,
        guestUserId,
        therapist_profile_id, // therapist_profiles.id を使用
        therapist_name,
        null, // office_id
        site_id_fixed || null,
        booking_type_fixed,
        'PENDING',
        service_name,
        total_duration_fixed || 60,
        total_price_fixed || 0,
        scheduled_at_fixed
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
    if (items_fixed && items_fixed.length > 0) {
      for (const item of items_fixed) {
        // item_idを決定（COURSE: course_id, OPTION: option_id）
        const actualItemId = item.type === 'COURSE' ? item.course_id : item.option_id;
        
        // item_idがnullの場合はスキップ
        if (!actualItemId) {
          console.warn(`⚠️ Skipping item with null item_id: ${JSON.stringify(item)}`);
          continue;
        }
        
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
          actualItemId,
          item.name || '施術',
          item.price || 0
        ).run();
      }
    }
    
    // 📧 予約確認メールを送信
    try {
      const bookingDetails = {
        bookingId,
        userName: customer_name,
        therapistName: therapist_name,
        serviceName: service_name,
        date: scheduled_at,
        duration: total_duration,
        price: total_price,
        bookingType: booking_type
      };
      
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${c.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'HOGUSY <noreply@hogusy.com>',
          to: [customer_email],
          subject: '【HOGUSY】ご予約を承りました',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%); padding: 32px 20px; text-align: center; }
                .header h1 { color: white; margin: 0; font-size: 28px; }
                .content { padding: 32px 24px; }
                .content h2 { color: #14b8a6; margin: 0 0 16px 0; font-size: 22px; }
                .info-box { background: #f0fdfa; border-left: 4px solid #14b8a6; padding: 16px; margin: 20px 0; border-radius: 8px; }
                .info-row { display: flex; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
                .info-label { width: 120px; color: #6b7280; font-size: 14px; }
                .info-value { flex: 1; color: #111827; font-weight: 600; font-size: 14px; }
                .footer { background: #f8f8f8; padding: 24px; text-align: center; color: #888; font-size: 13px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🌿 HOGUSY</h1>
                </div>
                <div class="content">
                  <h2>ご予約ありがとうございます</h2>
                  <p>${customer_name}様、この度はHOGUSYをご利用いただき、誠にありがとうございます。</p>
                  <p>ご予約を承りましたのでご確認ください。</p>
                  
                  <div class="info-box">
                    <div class="info-row">
                      <div class="info-label">予約番号</div>
                      <div class="info-value">${bookingId}</div>
                    </div>
                    <div class="info-row">
                      <div class="info-label">担当セラピスト</div>
                      <div class="info-value">${therapist_name}</div>
                    </div>
                    <div class="info-row">
                      <div class="info-label">サービス</div>
                      <div class="info-value">${service_name}</div>
                    </div>
                    <div class="info-row">
                      <div class="info-label">日時</div>
                      <div class="info-value">${scheduled_at}</div>
                    </div>
                    <div class="info-row">
                      <div class="info-label">所要時間</div>
                      <div class="info-value">${total_duration}分</div>
                    </div>
                    <div class="info-row" style="border-bottom: none;">
                      <div class="info-label">料金</div>
                      <div class="info-value">¥${total_price.toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <p style="margin-top: 24px; color: #6b7280; font-size: 14px;">
                    ご不明な点がございましたら、お気軽にお問い合わせください。<br>
                    当日お会いできることを楽しみにしております。
                  </p>
                </div>
                <div class="footer">
                  <p style="margin: 0;">© 2026 HOGUSY. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
          `
        })
      });
      
      console.log('✅ Confirmation email sent to:', customer_email);
    } catch (emailError: any) {
      console.error('⚠️ Failed to send confirmation email:', emailError);
      // メール送信失敗しても予約は成功とする
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
*/

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
