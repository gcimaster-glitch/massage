import { Hono } from 'hono'
import { cors } from 'hono/cors'
import authApp from './auth-routes'
import passwordResetApp from './password-reset-routes'
import mapsApp from './maps-routes'
import adminApp from './admin-routes'
import adminComprehensiveApp from './admin-comprehensive-routes'
import sitesApp from './sites-routes'
import adminSitesApp from './admin-sites-routes'
import officesApp from './offices-routes'
import officeManagementApp from './office-management-routes'
import earningsManagementApp from './earnings-management-routes'
import therapistEditApp from './therapist-edit-routes'
import therapistManagementApp from './therapist-management-routes'
import imageApp from './image-routes'
import userManagementApp from './user-management-routes'
// sitesRoutesApp は sitesApp と同一のため削除済み
import therapistsRoutesApp from './therapists-routes'
import areasRoutesApp from './areas-routes'
import bookingsRoutesApp from './bookings-routes'
import schedulesRoutesApp from './schedules-routes'
import paymentApp from './routes/payment-routes'
import emailApp from './routes/email-routes'

// ============================================
// Type Definitions
// ============================================
type Bindings = {
  DB: D1Database
  STORAGE: R2Bucket
  STRIPE_SECRET: string
  RESEND_API_KEY: string
  GEMINI_API_KEY: string
  JWT_SECRET: string
  GOOGLE_MAPS_API_KEY: string
  // Social Auth Provider Secrets
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  YAHOO_CLIENT_ID: string
  YAHOO_CLIENT_SECRET: string
  X_CLIENT_ID: string
  X_CLIENT_SECRET: string
  FACEBOOK_CLIENT_ID: string
  FACEBOOK_CLIENT_SECRET: string
  LINE_CLIENT_ID: string
  LINE_CLIENT_SECRET: string
  APPLE_CLIENT_ID: string
  APPLE_CLIENT_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

// ============================================
// Middleware - CORS設定（セキュリティ強化）
// ============================================
// 許可するオリジンのリスト
const ALLOWED_ORIGINS = [
  'https://hogusy.com',
  'https://www.hogusy.com',
  'https://hogusy.pages.dev',
  // 開発環境用（本番では削除推奨）
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]

app.use('/api/*', cors({
  origin: (origin) => {
    // オリジンが許可リストに含まれているかチェック
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      return origin || 'https://hogusy.com'
    }
    // Cloudflare Pages のプレビューURLを許可（*.hogusy.pages.dev）
    if (origin.endsWith('.hogusy.pages.dev')) {
      return origin
    }
    // 許可されていないオリジンの場合はnullを返す
    return null
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Cookieを使用する場合
  maxAge: 86400, // プリフライトリクエストのキャッシュ時間（24時間）
}))

// ============================================
// Health Check
// ============================================
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'HOGUSY API'
  })
})

// ============================================
// Mount Social Auth Routes
// ============================================
app.route('/api/auth', authApp)
app.route('/api/auth', passwordResetApp)

// ============================================
// Mount Google Maps Routes
// ============================================
app.route('/api/maps', mapsApp)

// ============================================
// Mount Admin Routes
// ============================================
// Mount Admin Routes
// ============================================
app.route('/api/admin', adminApp)
app.route('/api/admin', adminComprehensiveApp)

// ============================================
// Mount Sites Routes
// ============================================
app.route('/api/sites', sitesApp)
app.route('/api/admin/sites', adminSitesApp)

// ============================================
// Mount Offices Routes
// ============================================
app.route('/api/offices', officesApp)

// ============================================
// Mount Office Management Routes (Auth required)
// ============================================
app.route('/api/office-management', officeManagementApp)

// ============================================
// Mount Earnings Management Routes (Auth required)
// ============================================
app.route('/api/earnings', earningsManagementApp)

// ============================================
// Mount Therapist Edit Routes
// ============================================
app.route('/api/therapist-edits', therapistEditApp)

// ============================================
// Mount Image Routes (R2 Storage)
// ============================================
app.route('/api/images', imageApp)

// ============================================
// Mount User Management Routes (Admin only)
// ============================================
app.route('/api/admin/users', userManagementApp)

// /api/sites は sitesApp で登録済み（重複削除）

// ============================================
// Mount Public Therapists Routes
// ============================================
app.route('/api/therapists', therapistsRoutesApp)

// ============================================
// Mount Therapist Management Routes (Auth required)
// ============================================
app.route('/api/therapists', therapistManagementApp)

// ============================================
// Mount Public Areas Routes
// ============================================
app.route('/api/areas', areasRoutesApp)

// ============================================
// Mount Bookings Routes (Auth required)
// ============================================
app.route('/api/bookings', bookingsRoutesApp)

// ============================================
// Schedules Routes
// ============================================
app.route('/api/schedules', schedulesRoutesApp)

// ============================================
// Payment Routes
// ============================================
app.route('/api/payment', paymentApp)

// ============================================
// Email Routes
// ============================================
app.route('/api/email', emailApp)

// ============================================
// Auth Routes
// ============================================
// /api/auth/login は auth-routes.ts で処理済み（重複削除）

// /api/auth/me は auth-routes.ts で処理済み（重複削除）

app.post('/api/auth/kyc', async (c) => {
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  try {
    const token = authHeader.replace('Bearer ', '')
    const { verifyJWT } = await import('./auth-helpers')
    const payload = await verifyJWT(token, c.env.JWT_SECRET)
    if (!payload) {
      return c.json({ error: 'Invalid or expired token' }, 401)
    }
    
    const { id_type, id_number, document_data } = await c.req.json()
    
    if (!document_data) {
      return c.json({ error: 'Document data is required' }, 400)
    }
    
    // 本番環境では、document_dataはR2のURLまたはBase64エンコードされた画像
    // ここでは簡易実装として、kyc_statusを更新
    
    await c.env.DB.prepare(`
      UPDATE users 
      SET kyc_status = 'PENDING'
      WHERE id = ?
    `).bind(payload.userId).run()
    
    // TODO: 本番環境では、KYC書類をR2にアップロードし、審査キューに追加
    // await c.env.R2.put(`kyc/${payload.userId}/${Date.now()}.jpg`, document_data)
    
    return c.json({ success: true, kyc_status: 'PENDING' })
  } catch (e) {
    console.error('KYC submission error:', e)
    return c.json({ error: 'KYC submission failed' }, 500)
  }
})

// KYC審査一覧取得（管理者用）
app.get('/api/admin/kyc-applications', async (c) => {
  try {
    const { env } = c;
    
    if (!env.DB) {
      return c.json({ applications: [] });
    }
    
    // kyc_status = 'PENDING' のユーザーを取得
    const result = await env.DB.prepare(`
      SELECT id, email, name, phone, kyc_status, created_at
      FROM users
      WHERE kyc_status = 'PENDING'
      ORDER BY created_at DESC
    `).all();
    
    return c.json({ applications: result.results || [] });
  } catch (e) {
    console.error('KYC applications fetch error:', e);
    return c.json({ error: 'Failed to fetch KYC applications' }, 500);
  }
});

// KYC審査（承認/却下）
app.patch('/api/admin/kyc/:userId', async (c) => {
  try {
    const { env } = c;
    const userId = c.req.param('userId');
    const { status, reason } = await c.req.json(); // status: 'VERIFIED' | 'REJECTED', reason: string
    
    if (!env.DB) {
      return c.json({ error: 'Database not available' }, 500);
    }
    
    if (!['VERIFIED', 'REJECTED'].includes(status)) {
      return c.json({ error: 'Invalid status' }, 400);
    }
    
    // kyc_statusを更新
    await env.DB.prepare(`
      UPDATE users 
      SET kyc_status = ?
      WHERE id = ?
    `).bind(status, userId).run();
    
    // メール通知を送信
    try {
      const user = await env.DB.prepare(`
        SELECT email, name FROM users WHERE id = ?
      `).bind(userId).first();
      
      if (user && user.email) {
        const isApproved = status === 'VERIFIED';
        const emailHtml = isApproved ? `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">✅ KYC審査が承認されました</h2>
            <p>こんにちは、${user.name}さん</p>
            <p>本人確認（KYC）の審査が完了し、承認されました。</p>
            
            <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h3 style="margin-top: 0;">審査結果</h3>
              <p><strong>ステータス:</strong> ✅ 承認</p>
              <p>これで出張サービスのご予約が可能になりました。</p>
            </div>
            
            <p>引き続きHOGUSYをご利用ください。</p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              このメールは自動送信されています。<br>
              © 2024 HOGUSY. All rights reserved.
            </p>
          </div>
        ` : `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ef4444;">❌ KYC審査について</h2>
            <p>こんにちは、${user.name}さん</p>
            <p>本人確認（KYC）の審査結果をお知らせします。</p>
            
            <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
              <h3 style="margin-top: 0;">審査結果</h3>
              <p><strong>ステータス:</strong> ❌ 却下</p>
              ${reason ? `<p><strong>理由:</strong> ${reason}</p>` : ''}
            </div>
            
            <p>再度本人確認書類を提出いただく場合は、マイページからお手続きください。</p>
            <p style="color: #6b7280; font-size: 14px;">ご不明な点がございましたら、お気軽にお問い合わせください。</p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              このメールは自動送信されています。<br>
              © 2024 HOGUSY. All rights reserved.
            </p>
          </div>
        `;
        
        // メール送信API呼び出し（非同期・エラーは無視）
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${c.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'HOGUSY <noreply@hogusy.com>',
            to: user.email,
            subject: isApproved ? '【HOGUSY】KYC審査が承認されました' : '【HOGUSY】KYC審査について',
            html: emailHtml,
          }),
        }).catch(err => console.error('Email send error:', err));
      }
    } catch (e) {
      console.error('Failed to send KYC result email:', e);
    }
    
    return c.json({ success: true, status });
  } catch (e) {
    console.error('KYC approval error:', e);
    return c.json({ error: 'Failed to update KYC status' }, 500);
  }
});

// ============================================
// Booking Routes
// ============================================
// /api/bookings は bookingsRoutesApp で処理済み（重複削除）

app.post('/api/notify/email', async (c) => {
  const { to, subject, html } = await c.req.json()
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${c.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'HOGUSY <noreply@hogusy.com>',
      to,
      subject,
      html,
    }),
  })
  
  const result = await response.json()
  return c.json(result)
})

// ============================================
// Storage Routes (R2)
// ============================================
app.get('/api/storage/upload-url', async (c) => {
  const fileName = c.req.query('file')
  
  if (!fileName) {
    return c.json({ error: 'File name required' }, 400)
  }
  
  const key = `uploads/${Date.now()}-${fileName}`
  
  // R2署名付きURLの生成（簡易版）
  return c.json({ 
    url: `https://storage.soothe.jp/${key}`,
    key
  })
})

// ============================================
// 以下のルートは app.route() で登録済みのため削除（重複防止）
// /api/therapists → therapistsRoutesApp + therapistManagementApp
// /api/sites → sitesApp
// /api/offices → officesApp
// /api/therapists/search → therapistsRoutesApp
// ============================================

// ============================================
// Mock Data Management Routes (Admin only)
// ============================================

// モックデータ削除API
app.delete('/api/admin/mock-data', async (c) => {
  try {
    if (!c.env.DB) {
      return c.json({ error: 'Database not available' }, 500)
    }
    
    // トランザクションで全てのモックデータを削除
    const deletions = [
      // 1. 予約関連データを削除（外部キー制約のため先に削除）
      `DELETE FROM booking_items WHERE booking_id IN (SELECT id FROM bookings WHERE therapist_id IN (SELECT user_id FROM therapist_profiles WHERE user_id LIKE 'therapist-%'))`,
      `DELETE FROM bookings WHERE therapist_id IN (SELECT user_id FROM therapist_profiles WHERE user_id LIKE 'therapist-%')`,
      
      // 2. セラピストメニュー・オプションを削除
      `DELETE FROM therapist_options WHERE therapist_id LIKE 'therapist-%'`,
      `DELETE FROM therapist_menu WHERE therapist_id LIKE 'therapist-%'`,
      
      // 3. セラピストプロフィールを削除
      `DELETE FROM therapist_profiles WHERE user_id LIKE 'therapist-%'`,
      
      // 4. セラピストユーザーを削除
      `DELETE FROM users WHERE id LIKE 'therapist-%' AND role = 'THERAPIST'`,
      
      // 5. マスターデータは削除しない（他のセラピストが使用している可能性）
    ]
    
    let deletedCount = 0
    for (const sql of deletions) {
      const result = await c.env.DB.prepare(sql).run()
      deletedCount += result.meta.changes || 0
    }
    
    return c.json({ 
      success: true, 
      message: `${deletedCount}件のモックデータを削除しました`,
      deletedCount 
    })
  } catch (e) {
    console.error('モックデータ削除エラー:', e)
    return c.json({ error: 'モックデータの削除に失敗しました', details: String(e) }, 500)
  }
})

// モックデータ挿入API
app.post('/api/admin/mock-data/seed', async (c) => {
  try {
    if (!c.env.DB) {
      return c.json({ error: 'Database not available' }, 500)
    }
    
    // 1. ユーザーを挿入
    const users = [
      ['therapist-1', 'misaki.tanaka@hogusy.com', '田中 美咲', '090-1234-5678', 'THERAPIST', '/therapists/therapist-1.jpg'],
      ['therapist-2', 'takeshi.sato@hogusy.com', '佐藤 武志', '090-2345-6789', 'THERAPIST', '/therapists/therapist-2.jpg'],
      ['therapist-3', 'kenji.yamada@hogusy.com', '山田 健二', '090-3456-7890', 'THERAPIST', '/therapists/therapist-3.jpg'],
      ['therapist-4', 'yui.kobayashi@hogusy.com', '小林 結衣', '090-4567-8901', 'THERAPIST', 'https://www.genspark.ai/api/files/s/kMBUm4hm'],
      ['therapist-5', 'ayumi.watanabe@hogusy.com', '渡辺 あゆみ', '090-5678-9012', 'THERAPIST', 'https://www.genspark.ai/api/files/s/0RIiDbmp'],
      ['therapist-6', 'hiroki.kato@hogusy.com', '加藤 浩樹', '090-6789-0123', 'THERAPIST', 'https://www.genspark.ai/api/files/s/iLvjbJLH'],
      ['therapist-7', 'sakura.nakamura@hogusy.com', '中村 さくら', '090-7890-1234', 'THERAPIST', 'https://www.genspark.ai/api/files/s/rmby81Es'],
      ['therapist-8', 'rina.yamamoto@hogusy.com', '山本 梨奈', '090-8901-2345', 'THERAPIST', 'https://www.genspark.ai/api/files/s/iqRVJzGE'],
      ['therapist-9', 'yuka.ito@hogusy.com', '伊藤 優香', '090-9012-3456', 'THERAPIST', 'https://www.genspark.ai/api/files/s/jl395HcH'],
      ['therapist-10', 'mika.suzuki@hogusy.com', '鈴木 美香', '090-0123-4567', 'THERAPIST', 'https://www.genspark.ai/api/files/s/hg4hZj91'],
      ['therapist-11', 'daichi.takahashi@hogusy.com', '高橋 大地', '090-1234-6789', 'THERAPIST', 'https://www.genspark.ai/api/files/s/dlavRDmC'],
    ]
    
    for (const user of users) {
      await c.env.DB.prepare(`
        INSERT OR IGNORE INTO users (id, email, name, phone, role, avatar_url, kyc_status, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, 'VERIFIED', CURRENT_TIMESTAMP)
      `).bind(...user).run()
    }
    
    // 2. セラピストプロフィールを挿入
    const profiles = [
      ['therapist-1', '看護師資格を持つベテランセラピスト。医療知識を活かした丁寧な施術で、お客様一人ひとりの体調に合わせたケアを提供します。', '["メディカルマッサージ", "リラクゼーション", "アロマセラピー"]', 10, 4.9, 342, '["shibuya", "shinjuku", "minato"]'],
      ['therapist-2', 'スポーツトレーナー出身の男性セラピスト。筋膜リリースとスポーツマッサージで、アスリートから一般の方まで幅広く対応。', '["スポーツマッサージ", "筋膜リリース", "ストレッチ"]', 8, 4.8, 298, '["shibuya", "shinjuku", "minato"]'],
      ['therapist-3', '整体院での経験を活かした施術が得意。深層筋へのアプローチで根本から体を改善します。', '["整体", "深層筋マッサージ", "姿勢改善"]', 12, 4.7, 134, '["shibuya", "shinjuku", "minato"]'],
      ['therapist-4', '看護師としての経験を活かし、丁寧で安心感のある施術を心がけています。女性のお客様に人気です。', '["リラクゼーション", "リンパドレナージュ", "メディカルケア"]', 6, 4.7, 234, '["shibuya", "shinjuku", "minato"]'],
      ['therapist-5', '受付スタッフとしても活躍。お客様とのコミュニケーションを大切にし、心身ともにリラックスできる施術を提供。', '["リラクゼーション", "ボディケア", "ヘッドスパ"]', 4, 4.6, 187, '["shibuya", "shinjuku", "minato"]'],
      ['therapist-6', 'エステティシャン出身の男性セラピスト。美容と健康の両面からアプローチする施術が特徴です。', '["美容整体", "リンパドレナージュ", "デトックス"]', 7, 4.7, 265, '["shibuya", "shinjuku", "minato"]'],
      ['therapist-7', '明るく親しみやすい雰囲気が魅力。初めての方でもリラックスして施術を受けていただけます。', '["リラクゼーション", "アロマセラピー", "ストレッチ"]', 5, 4.8, 213, '["shibuya", "shinjuku", "minato"]'],
      ['therapist-8', '笑顔が素敵なセラピスト。お客様の悩みに寄り添った丁寧なカウンセリングと施術を提供。', '["リラクゼーション", "ボディケア", "フットケア"]', 6, 4.7, 198, '["shibuya", "shinjuku", "minato"]'],
      ['therapist-9', '国家資格保有のあん摩マッサージ指圧師。確かな技術で根本から体の不調を改善します。', '["あん摩", "指圧", "マッサージ"]', 9, 4.9, 378, '["shibuya", "shinjuku", "minato"]'],
      ['therapist-10', 'ヨガインストラクターとしても活動。呼吸と体のバランスを整える施術が特徴です。', '["ヨガセラピー", "ストレッチ", "バランス調整"]', 7, 4.8, 289, '["shibuya", "shinjuku", "minato"]'],
      ['therapist-11', '鍼灸師・柔道整復師の資格保有。スポーツ障害や慢性痛の改善を得意としています。', '["鍼灸", "柔道整復", "スポーツ障害"]', 11, 4.9, 423, '["shibuya", "shinjuku", "minato"]'],
    ]
    
    for (const profile of profiles) {
      await c.env.DB.prepare(`
        INSERT OR IGNORE INTO therapist_profiles 
        (user_id, bio, specialties, experience_years, rating, review_count, approved_areas, is_active) 
        VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)
      `).bind(...profile).run()
    }
    
    // 3. セラピストメニューを挿入（全セラピストに全コースを割り当て）
    const { results: courses } = await c.env.DB.prepare('SELECT id, base_price FROM master_courses').all()
    const therapistIds = users.map(u => u[0])
    
    for (const therapistId of therapistIds) {
      for (const course of courses) {
        await c.env.DB.prepare(`
          INSERT OR IGNORE INTO therapist_menu (id, therapist_id, master_course_id, price, is_available, created_at)
          VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
        `).bind(`tm-${therapistId}-${course.id}`, therapistId, course.id, course.base_price).run()
      }
    }
    
    // 4. セラピストオプションを挿入
    const { results: options } = await c.env.DB.prepare('SELECT id, base_price FROM master_options').all()
    
    for (const therapistId of therapistIds) {
      for (const option of options) {
        await c.env.DB.prepare(`
          INSERT OR IGNORE INTO therapist_options (id, therapist_id, master_option_id, price, is_available, created_at)
          VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
        `).bind(`to-${therapistId}-${option.id}`, therapistId, option.id, option.base_price).run()
      }
    }
    
    return c.json({ 
      success: true, 
      message: `11名のセラピストと${courses.length * 11}件のメニュー、${options.length * 11}件のオプションを挿入しました`,
      therapists: 11,
      menus: courses.length * 11,
      options: options.length * 11
    })
  } catch (e) {
    console.error('モックデータ挿入エラー:', e)
    return c.json({ error: 'モックデータの挿入に失敗しました', details: String(e) }, 500)
  }
})

// モックデータ状態確認API
app.get('/api/admin/mock-data/status', async (c) => {
  try {
    if (!c.env.DB) {
      return c.json({ error: 'Database not available' }, 500)
    }
    
    const { results: therapists } = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM users WHERE id LIKE 'therapist-%' AND role = 'THERAPIST'
    `).all()
    
    const { results: profiles } = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM therapist_profiles WHERE user_id LIKE 'therapist-%'
    `).all()
    
    const { results: menus } = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM therapist_menu WHERE therapist_id LIKE 'therapist-%'
    `).all()
    
    const { results: options } = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM therapist_options WHERE therapist_id LIKE 'therapist-%'
    `).all()
    
    const hasMockData = therapists[0].count > 0
    
    return c.json({
      hasMockData,
      counts: {
        therapists: therapists[0].count,
        profiles: profiles[0].count,
        menus: menus[0].count,
        options: options[0].count
      }
    })
  } catch (e) {
    console.error('モックデータ状態確認エラー:', e)
    return c.json({ error: 'モックデータの状態確認に失敗しました', details: String(e) }, 500)
  }
})

export default app