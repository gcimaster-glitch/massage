import { Hono } from 'hono'
import { cors } from 'hono/cors'
import authApp from './auth-routes'
import passwordResetApp from './password-reset-routes'
import mapsApp from './maps-routes'
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
import therapistsRoutesApp from './therapists-routes'
import areasRoutesApp from './areas-routes'
import bookingsRoutesApp from './bookings-routes'
import schedulesRoutesApp from './schedules-routes'
import paymentApp from './routes/payment-routes'
import emailApp from './routes/email-routes'
import kycApp from './kyc-routes'
import notifyApp from './notify-routes'
import mockDataApp from './mock-data-routes'
import paymentsApp from './payments-routes'
import revenueEngineApp from './revenue-engine-routes'
import publicPagesApp from './ssr/public-pages'
import hostApp from './host-routes'
import stripeWebhookApp from './stripe-webhook-routes'
import reviewsApp from './reviews-routes'

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
  ALLOWED_ORIGINS: string // カンマ区切りの許可オリジンリスト（Cloudflare環境変数で上書き可能）
  ASSETS: Fetcher // Cloudflare Pages 静的アセットフェッチャー
}

const app = new Hono<{ Bindings: Bindings }>()

// ============================================
// Middleware - セキュリティヘッダー（本番稼働準備）
// ============================================
app.use('*', async (c, next) => {
  await next()
  // クリックジャッキング防止
  c.res.headers.set('X-Frame-Options', 'DENY')
  // MIMEタイプスニッフィング防止
  c.res.headers.set('X-Content-Type-Options', 'nosniff')
  // XSS保護（レガシーブラウザ向け）
  c.res.headers.set('X-XSS-Protection', '1; mode=block')
  // HTTPS強制（1年間）
  c.res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  // リファラーポリシー
  c.res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  // パーミッションポリシー
  c.res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self), payment=(self)')
  // コンテンツセキュリティポリシー
  c.res.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://maps.googleapis.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https: http:",
      "connect-src 'self' https://api.stripe.com https://maps.googleapis.com wss:",
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  )
})

// ============================================
// Middleware - CORS設定（セキュリティ強化）
// ============================================
const DEFAULT_ALLOWED_ORIGINS = [
  'https://hogusy.com',
  'https://www.hogusy.com',
  'https://hogusy.pages.dev',
  // 開発環境用（本番では ALLOWED_ORIGINS 環境変数で上書き推奨）
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]

app.use('/api/*', cors({
  origin: (origin, c) => {
    // 環境変数で許可オリジンを上書き可能
    const envOrigins = (c.env as Bindings)?.ALLOWED_ORIGINS
      ? (c.env as Bindings).ALLOWED_ORIGINS.split(',').map((o: string) => o.trim())
      : DEFAULT_ALLOWED_ORIGINS

    if (!origin || envOrigins.includes(origin)) {
      return origin || 'https://hogusy.com'
    }
    // Cloudflare Pages のプレビューURLを許可（*.hogusy.pages.dev）
    if (origin.endsWith('.hogusy.pages.dev')) {
      return origin
    }
    return null
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
}))

// ============================================
// Health Check
// ============================================
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'HOGUSY API',
    // デバッグ用: 環境変数の存在確認（実際の値は返さない）
    env_check: {
      GOOGLE_MAPS_API_KEY: !!c.env.GOOGLE_MAPS_API_KEY,
      VITE_GOOGLE_MAPS_API_KEY: !!(c.env as any).VITE_GOOGLE_MAPS_API_KEY,
      JWT_SECRET: !!c.env.JWT_SECRET,
      STRIPE_SECRET: !!c.env.STRIPE_SECRET,
    },
    env_keys: Object.keys(c.env || {})
  })
})


// ============================================
// [TEMP] D1 Migration Endpoint v2 - 使用後は必ず削除すること
// ============================================
app.post('/api/admin/run-migration', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const secret = (body as any).secret || ''
  const action = (body as any).action || 'default'
  if (secret !== 'hogusy-migrate-2026') {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  const db = c.env.DB
  const results: { sql: string; success: boolean; error?: string }[] = []

  // actionに応じてSQL文を選択
  let statements: string[] = []

  if (action === 'debug_query') {
    const sql = (body as any).sql || ''
    if (!sql) return c.json({ error: 'No SQL provided' }, 400)
    try {
      const result = await db.prepare(sql).all()
      return c.json({ results: result.results, meta: result.meta })
    } catch (e: any) {
      return c.json({ error: e.message })
    }
  }

  if (action === 'rebuild_bookings') {
    // bookingsテーブルをuser_id NULL許容で再作成
    statements = [
      `CREATE TABLE IF NOT EXISTS bookings_new (id TEXT PRIMARY KEY, user_id TEXT, therapist_id TEXT NOT NULL, therapist_name TEXT, site_id TEXT, office_id TEXT, type TEXT NOT NULL CHECK(type IN ('ONSITE', 'HOTEL', 'HOME', 'OFFICE', 'OUTCALL')), status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')), service_name TEXT NOT NULL DEFAULT '施術', duration INTEGER NOT NULL, scheduled_at DATETIME, scheduled_start DATETIME, scheduled_end DATETIME, price INTEGER NOT NULL, payment_intent_id TEXT, payment_status TEXT DEFAULT 'PENDING' CHECK(payment_status IN ('PENDING', 'PAID', 'REFUNDED')), notes TEXT, guest_name TEXT, guest_email TEXT, guest_phone TEXT, timelock_id TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, completed_at DATETIME)`,
      `INSERT OR IGNORE INTO bookings_new (id, user_id, therapist_id, therapist_name, site_id, office_id, type, status, service_name, duration, scheduled_at, scheduled_start, scheduled_end, price, payment_intent_id, payment_status, notes, guest_name, guest_email, guest_phone, timelock_id, created_at, completed_at) SELECT id, user_id, therapist_id, therapist_name, site_id, office_id, type, status, service_name, duration, scheduled_at, scheduled_start, scheduled_end, price, payment_intent_id, payment_status, notes, guest_name, guest_email, guest_phone, timelock_id, created_at, completed_at FROM bookings`,
      `DROP TABLE IF EXISTS bookings_old`,
      `ALTER TABLE bookings RENAME TO bookings_old`,
      `ALTER TABLE bookings_new RENAME TO bookings`,
      `CREATE INDEX IF NOT EXISTS idx_bookings_therapist ON bookings(therapist_id)`,
      `CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)`,
    ]
  } else if (action === 'rebuild_reviews') {
    // reviews テーブルを削除して再作成（スキーマ変更時に使用）
    statements = [
      `DROP TABLE IF EXISTS reviews`,
      `DROP INDEX IF EXISTS idx_reviews_therapist_id`,
      `DROP INDEX IF EXISTS idx_reviews_booking_id`,
      `DROP INDEX IF EXISTS idx_reviews_user_id`,
      `DROP INDEX IF EXISTS idx_reviews_created_at`,
      `DROP INDEX IF EXISTS idx_reviews_rating`,
      `CREATE TABLE reviews (id TEXT PRIMARY KEY, booking_id TEXT NOT NULL, therapist_id TEXT NOT NULL, user_id TEXT, rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5), comment TEXT, customer_age_range TEXT, customer_gender TEXT, customer_occupation TEXT, body_concerns TEXT DEFAULT '[]', ng_items TEXT DEFAULT '[]', is_public INTEGER NOT NULL DEFAULT 1, therapist_reply TEXT, therapist_replied_at INTEGER, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
      `CREATE INDEX idx_reviews_therapist_id ON reviews(therapist_id)`,
      `CREATE INDEX idx_reviews_booking_id ON reviews(booking_id)`,
      `CREATE INDEX idx_reviews_user_id ON reviews(user_id)`,
      `CREATE INDEX idx_reviews_created_at ON reviews(therapist_id, created_at)`,
      `CREATE INDEX idx_reviews_rating ON reviews(therapist_id, rating)`,
    ]
  } else if (action === 'restore_data') {
    // bookings_oldからbookingsへデータを復元
    statements = [
      `INSERT OR IGNORE INTO bookings (id, user_id, therapist_id, therapist_name, site_id, office_id, type, status, service_name, duration, scheduled_at, price, payment_intent_id, payment_status, guest_name, guest_email, guest_phone, timelock_id, created_at, completed_at) SELECT id, user_id, therapist_id, therapist_name, site_id, office_id, type, status, service_name, duration, scheduled_at, price, payment_intent_id, payment_status, guest_name, guest_email, guest_phone, timelock_id, created_at, completed_at FROM bookings_old`,
    ]
  } else if (action === 'add_travel_settings') {
    // セラピストプロフィールに出張設定カラムを追加
    statements = [
      `ALTER TABLE therapist_profiles ADD COLUMN outcall_available INTEGER DEFAULT 1`,
      `ALTER TABLE therapist_profiles ADD COLUMN incall_available INTEGER DEFAULT 1`,
      `ALTER TABLE therapist_profiles ADD COLUMN base_location TEXT`,
      `ALTER TABLE therapist_profiles ADD COLUMN base_lat REAL`,
      `ALTER TABLE therapist_profiles ADD COLUMN base_lng REAL`,
      `ALTER TABLE therapist_profiles ADD COLUMN travel_methods TEXT`,
      `ALTER TABLE therapist_profiles ADD COLUMN outcall_hours TEXT`,
      `ALTER TABLE therapist_profiles ADD COLUMN incall_hours TEXT`,
    ]
  } else if (action === 'add_booking_address') {
    // 出張予約（MOBILE）の住所保存用カラム追加
    statements = [
      `ALTER TABLE bookings ADD COLUMN customer_address TEXT`,
      `ALTER TABLE bookings ADD COLUMN postal_code TEXT`,
      `ALTER TABLE bookings ADD COLUMN customer_lat REAL`,
      `ALTER TABLE bookings ADD COLUMN customer_lng REAL`,
    ]
  } else if (action === 'rebuild_bookings_v2') {
    // bookingsテーブルをMOBILE対応 + customer_addressカラム追加で再構築
    statements = [
      `DROP TABLE IF EXISTS bookings_new`,
      `CREATE TABLE bookings_new (id TEXT PRIMARY KEY, user_id TEXT, therapist_id TEXT NOT NULL, therapist_name TEXT, site_id TEXT, office_id TEXT, type TEXT NOT NULL CHECK(type IN ('ONSITE', 'MOBILE', 'HOTEL', 'HOME', 'OFFICE', 'OUTCALL')), status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')), service_name TEXT NOT NULL DEFAULT '施術', duration INTEGER NOT NULL, scheduled_at DATETIME, scheduled_start DATETIME, scheduled_end DATETIME, price INTEGER NOT NULL, payment_intent_id TEXT, payment_status TEXT DEFAULT 'PENDING' CHECK(payment_status IN ('PENDING', 'PAID', 'REFUNDED')), notes TEXT, guest_name TEXT, guest_email TEXT, guest_phone TEXT, timelock_id TEXT, customer_address TEXT, postal_code TEXT, customer_lat REAL, customer_lng REAL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, completed_at DATETIME)`,
      `INSERT OR IGNORE INTO bookings_new (id, user_id, therapist_id, therapist_name, site_id, office_id, type, status, service_name, duration, scheduled_at, scheduled_start, scheduled_end, price, payment_intent_id, payment_status, notes, guest_name, guest_email, guest_phone, timelock_id, created_at, completed_at) SELECT id, user_id, therapist_id, therapist_name, site_id, office_id, type, status, service_name, duration, scheduled_at, scheduled_start, scheduled_end, price, payment_intent_id, payment_status, notes, guest_name, guest_email, guest_phone, timelock_id, created_at, completed_at FROM bookings`,
      `DROP TABLE IF EXISTS bookings_old`,
      `ALTER TABLE bookings RENAME TO bookings_old`,
      `ALTER TABLE bookings_new RENAME TO bookings`,
      `CREATE INDEX IF NOT EXISTS idx_bookings_therapist ON bookings(therapist_id)`,
      `CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)`,
      `CREATE INDEX IF NOT EXISTS idx_bookings_type ON bookings(type)`,
    ]
  } else if (action === 'fix_booking_items_fk') {
    // booking_itemsのFOREIGN KEYがbookings_oldを参照している問題を修正
    statements = [
      `DROP TABLE IF EXISTS booking_items_new`,
      `CREATE TABLE booking_items_new (id TEXT PRIMARY KEY, booking_id TEXT NOT NULL, item_type TEXT NOT NULL CHECK (item_type IN ('COURSE', 'OPTION')), item_id TEXT NOT NULL, item_name TEXT NOT NULL, price INTEGER NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE)`,
      `INSERT OR IGNORE INTO booking_items_new SELECT * FROM booking_items`,
      `DROP TABLE IF EXISTS booking_items`,
      `ALTER TABLE booking_items_new RENAME TO booking_items`,
      `CREATE INDEX IF NOT EXISTS idx_booking_items_booking ON booking_items(booking_id)`,
      `DROP TABLE IF EXISTS bookings_old`,
    ]
  } else if (action === 'seed_data') {
    // 全データクリア＋デモデータ投入
    statements = [
      // 全テーブルをクリア（FK依存の逆順でDELETE）
      `DELETE FROM booking_items`,
      `DELETE FROM booking_timelocks`,
      `DELETE FROM payments`,
      `DELETE FROM incidents`,
      `DELETE FROM affiliate_referrals`,
      `DELETE FROM therapist_earnings`,
      `DELETE FROM payment_splits`,
      `DELETE FROM transactions`,
      `DELETE FROM receipts`,
      `DELETE FROM bookings`,
      `DELETE FROM reviews`,
      `DELETE FROM therapist_menu_courses`,
      `DELETE FROM therapist_menu_options`,
      `DELETE FROM therapist_schedules`,
      `DELETE FROM therapist_profiles`,
      `DELETE FROM social_accounts`,
      `DELETE FROM auth_sessions`,
      `DELETE FROM offices`,
      `DELETE FROM office_details`,
      `DELETE FROM office_therapist_affiliations`,
      `DELETE FROM financial_statements`,
      `DELETE FROM incident_actions`,
      `DELETE FROM affiliates`,
      `DELETE FROM notifications`,
      `DELETE FROM admin_logs`,
      `DELETE FROM therapist_profile_edits`,
      `DELETE FROM therapist_edit_logs`,
      `DELETE FROM email_verifications`,
      `DELETE FROM stripe_connected_accounts`,
      `DELETE FROM user_subscriptions`,
      `DELETE FROM gift_cards`,
      `DELETE FROM password_reset_tokens`,
      `DELETE FROM kyc_documents`,
      `DELETE FROM contracts`,
      `DELETE FROM transaction_splits`,
      `DELETE FROM invoices`,
      `DELETE FROM payout_statements`,
      `DELETE FROM payout_statement_line_items`,
      `DELETE FROM user_favorites`,
      `DELETE FROM user_points`,
      `DELETE FROM point_transactions`,
      `DELETE FROM sites`,
      `DELETE FROM users`,
      // ===== デモデータ投入 =====
      `INSERT INTO users (id, name, email, phone, role, password_hash, email_verified, created_at, updated_at) VALUES ('therapist-1', '高橋 大地', 'daichi.takahashi@hogusy.com', '090-1234-0001', 'THERAPIST', 'pbkdf2:10000:K8xuogSxCqgJTM7i5nHbgQ==:JyFALM85bPQGPYjk1LRvxa8pJYjudcjPdJK4BSKfHxA=', 1, '2026-01-15 09:00:00', '2026-06-30 00:00:00')`,
      `INSERT INTO users (id, name, email, phone, role, password_hash, email_verified, created_at, updated_at) VALUES ('therapist-2', '佐藤 美咲', 'misaki.sato@hogusy.com', '090-1234-0002', 'THERAPIST', 'pbkdf2:10000:K8xuogSxCqgJTM7i5nHbgQ==:JyFALM85bPQGPYjk1LRvxa8pJYjudcjPdJK4BSKfHxA=', 1, '2026-02-01 09:00:00', '2026-06-30 00:00:00')`,
      `INSERT INTO users (id, name, email, phone, role, password_hash, email_verified, created_at, updated_at) VALUES ('therapist-3', '田中 健太', 'kenta.tanaka@hogusy.com', '090-1234-0003', 'THERAPIST', 'pbkdf2:10000:K8xuogSxCqgJTM7i5nHbgQ==:JyFALM85bPQGPYjk1LRvxa8pJYjudcjPdJK4BSKfHxA=', 1, '2026-02-15 09:00:00', '2026-06-30 00:00:00')`,
      `INSERT INTO users (id, name, email, phone, role, password_hash, email_verified, created_at, updated_at) VALUES ('customer-1', '山田 花子', 'hanako.yamada@example.com', '090-5678-0001', 'USER', 'pbkdf2:10000:K8xuogSxCqgJTM7i5nHbgQ==:JyFALM85bPQGPYjk1LRvxa8pJYjudcjPdJK4BSKfHxA=', 1, '2026-03-01 09:00:00', '2026-06-30 00:00:00')`,
      `INSERT INTO users (id, name, email, phone, role, password_hash, email_verified, created_at, updated_at) VALUES ('customer-2', '鈴木 太郎', 'taro.suzuki@example.com', '090-5678-0002', 'USER', 'pbkdf2:10000:K8xuogSxCqgJTM7i5nHbgQ==:JyFALM85bPQGPYjk1LRvxa8pJYjudcjPdJK4BSKfHxA=', 1, '2026-03-15 09:00:00', '2026-06-30 00:00:00')`,
      `INSERT INTO users (id, name, email, phone, role, password_hash, email_verified, created_at, updated_at) VALUES ('host-1', 'HOGUSYサロン運営', 'host@hogusy.com', '03-1234-5000', 'HOST', 'pbkdf2:10000:K8xuogSxCqgJTM7i5nHbgQ==:JyFALM85bPQGPYjk1LRvxa8pJYjudcjPdJK4BSKfHxA=', 1, '2026-01-01 09:00:00', '2026-06-30 00:00:00')`,
      `INSERT INTO users (id, name, email, phone, role, password_hash, email_verified, created_at, updated_at) VALUES ('admin-1', '岩間 管理者', 'admin@hogusy.com', '090-0000-0001', 'ADMIN', 'pbkdf2:10000:K8xuogSxCqgJTM7i5nHbgQ==:JyFALM85bPQGPYjk1LRvxa8pJYjudcjPdJK4BSKfHxA=', 1, '2026-01-01 09:00:00', '2026-06-30 00:00:00')`,
      // ===== セラピストプロフィール =====
      `INSERT INTO therapist_profiles (id, user_id, bio, specialties, experience_years, certifications, rating, review_count, approved_areas, status, catch_copy, outcall_available, incall_available, base_location, base_lat, base_lng, travel_methods, outcall_hours, incall_hours, created_at, updated_at) VALUES ('tp-1', 'therapist-1', '鍼灸師・柔道整復師の資格保有。スポーツ障害や慢性痛の改善を得意としています。', '["鍼灸","柔道整復","スポーツケア"]', 11, '["鍼灸師","柔道整復師","アスレティックトレーナー"]', 4.9, 156, '["shibuya","shinjuku","minato","meguro","setagaya"]', 'APPROVED', '国家資格保有の鍼灸整体師', 1, 1, '東京都渋谷区神宮前3-5-10', 35.6708, 139.7073, '["電車","タクシー"]', '{"start":"09:00","end":"21:00"}', '{"start":"10:00","end":"20:00"}', '2026-01-15 09:00:00', '2026-06-30 00:00:00')`,
      `INSERT INTO therapist_profiles (id, user_id, bio, specialties, experience_years, certifications, rating, review_count, approved_areas, status, catch_copy, outcall_available, incall_available, base_location, base_lat, base_lng, travel_methods, outcall_hours, incall_hours, created_at, updated_at) VALUES ('tp-2', 'therapist-2', 'アロマセラピスト・リフレクソロジスト。女性特有の不調やストレスケアを専門としています。', '["アロマ","リフレクソロジー","フェイシャル"]', 8, '["AEAJ認定アロマセラピスト","リフレクソロジスト"]', 4.8, 98, '["shibuya","minato","meguro","setagaya","ota"]', 'APPROVED', '心と体を癒すアロマの専門家', 1, 1, '東京都目黒区自由が丘2-8-15', 35.6073, 139.6686, '["電車"]', '{"start":"10:00","end":"20:00"}', '{"start":"10:00","end":"19:00"}', '2026-02-01 09:00:00', '2026-06-30 00:00:00')`,
      `INSERT INTO therapist_profiles (id, user_id, bio, specialties, experience_years, certifications, rating, review_count, approved_areas, status, catch_copy, outcall_available, incall_available, base_location, base_lat, base_lng, travel_methods, outcall_hours, incall_hours, created_at, updated_at) VALUES ('tp-3', 'therapist-3', '整体師・パーソナルトレーナー。姿勢改善と運動指導を組み合わせた独自メソッドで根本改善。', '["整体","パーソナルトレーニング","姿勢矯正"]', 6, '["柔道整復師","NSCA-CPT"]', 4.7, 72, '["shinjuku","chiyoda","bunkyo","toshima","nakano"]', 'APPROVED', '姿勢改善のスペシャリスト', 1, 0, '東京都新宿区西新宿1-12-3', 35.6938, 139.7003, '["電車","自転車"]', '{"start":"08:00","end":"22:00"}', '{}', '2026-02-15 09:00:00', '2026-06-30 00:00:00')`,
      // ===== スケジュール =====
      `INSERT INTO therapist_schedules (id, therapist_id, day_of_week, start_time, end_time, is_available) VALUES ('sched-1-0', 'therapist-1', 0, '10:00', '17:00', 0)`,
      `INSERT INTO therapist_schedules (id, therapist_id, day_of_week, start_time, end_time, is_available) VALUES ('sched-1-1', 'therapist-1', 1, '09:00', '21:00', 1)`,
      `INSERT INTO therapist_schedules (id, therapist_id, day_of_week, start_time, end_time, is_available) VALUES ('sched-1-2', 'therapist-1', 2, '09:00', '21:00', 1)`,
      `INSERT INTO therapist_schedules (id, therapist_id, day_of_week, start_time, end_time, is_available) VALUES ('sched-1-3', 'therapist-1', 3, '09:00', '21:00', 1)`,
      `INSERT INTO therapist_schedules (id, therapist_id, day_of_week, start_time, end_time, is_available) VALUES ('sched-1-4', 'therapist-1', 4, '09:00', '21:00', 1)`,
      `INSERT INTO therapist_schedules (id, therapist_id, day_of_week, start_time, end_time, is_available) VALUES ('sched-1-5', 'therapist-1', 5, '09:00', '21:00', 1)`,
      `INSERT INTO therapist_schedules (id, therapist_id, day_of_week, start_time, end_time, is_available) VALUES ('sched-1-6', 'therapist-1', 6, '10:00', '18:00', 1)`,
      `INSERT INTO therapist_schedules (id, therapist_id, day_of_week, start_time, end_time, is_available) VALUES ('sched-2-0', 'therapist-2', 0, '10:00', '17:00', 0)`,
      `INSERT INTO therapist_schedules (id, therapist_id, day_of_week, start_time, end_time, is_available) VALUES ('sched-2-1', 'therapist-2', 1, '10:00', '17:00', 0)`,
      `INSERT INTO therapist_schedules (id, therapist_id, day_of_week, start_time, end_time, is_available) VALUES ('sched-2-2', 'therapist-2', 2, '10:00', '20:00', 1)`,
      `INSERT INTO therapist_schedules (id, therapist_id, day_of_week, start_time, end_time, is_available) VALUES ('sched-2-3', 'therapist-2', 3, '10:00', '20:00', 1)`,
      `INSERT INTO therapist_schedules (id, therapist_id, day_of_week, start_time, end_time, is_available) VALUES ('sched-2-4', 'therapist-2', 4, '10:00', '20:00', 1)`,
      `INSERT INTO therapist_schedules (id, therapist_id, day_of_week, start_time, end_time, is_available) VALUES ('sched-2-5', 'therapist-2', 5, '10:00', '20:00', 1)`,
      `INSERT INTO therapist_schedules (id, therapist_id, day_of_week, start_time, end_time, is_available) VALUES ('sched-2-6', 'therapist-2', 6, '10:00', '18:00', 1)`,
      `INSERT INTO therapist_schedules (id, therapist_id, day_of_week, start_time, end_time, is_available) VALUES ('sched-3-0', 'therapist-3', 0, '08:00', '22:00', 0)`,
      `INSERT INTO therapist_schedules (id, therapist_id, day_of_week, start_time, end_time, is_available) VALUES ('sched-3-1', 'therapist-3', 1, '08:00', '22:00', 1)`,
      `INSERT INTO therapist_schedules (id, therapist_id, day_of_week, start_time, end_time, is_available) VALUES ('sched-3-2', 'therapist-3', 2, '08:00', '22:00', 1)`,
      `INSERT INTO therapist_schedules (id, therapist_id, day_of_week, start_time, end_time, is_available) VALUES ('sched-3-3', 'therapist-3', 3, '08:00', '22:00', 1)`,
      `INSERT INTO therapist_schedules (id, therapist_id, day_of_week, start_time, end_time, is_available) VALUES ('sched-3-4', 'therapist-3', 4, '08:00', '22:00', 1)`,
      `INSERT INTO therapist_schedules (id, therapist_id, day_of_week, start_time, end_time, is_available) VALUES ('sched-3-5', 'therapist-3', 5, '08:00', '22:00', 1)`,
      `INSERT INTO therapist_schedules (id, therapist_id, day_of_week, start_time, end_time, is_available) VALUES ('sched-3-6', 'therapist-3', 6, '08:00', '22:00', 0)`,
      // ===== メニュー（コース） =====
      `INSERT INTO therapist_menu_courses (id, therapist_profile_id, name, duration, price, description, display_order, is_active) VALUES ('course-1-1', 'tp-1', '鍼灸コース', 60, 9000, '東洋医学に基づいた鍼灸施術', 0, 1)`,
      `INSERT INTO therapist_menu_courses (id, therapist_profile_id, name, duration, price, description, display_order, is_active) VALUES ('course-1-2', 'tp-1', 'スポーツケアコース', 90, 12000, 'アスリート向けの集中ケア', 1, 1)`,
      `INSERT INTO therapist_menu_courses (id, therapist_profile_id, name, duration, price, description, display_order, is_active) VALUES ('course-1-3', 'tp-1', '整体コース', 60, 8000, '全身の歪みを整え改善', 2, 1)`,
      `INSERT INTO therapist_menu_courses (id, therapist_profile_id, name, duration, price, description, display_order, is_active) VALUES ('course-1-4', 'tp-1', 'トータルケア', 120, 16000, '鍼灸+整体+ストレッチ総合', 3, 1)`,
      `INSERT INTO therapist_menu_courses (id, therapist_profile_id, name, duration, price, description, display_order, is_active) VALUES ('course-2-1', 'tp-2', 'アロマリラクゼーション', 60, 8500, 'オーガニック精油の全身トリートメント', 0, 1)`,
      `INSERT INTO therapist_menu_courses (id, therapist_profile_id, name, duration, price, description, display_order, is_active) VALUES ('course-2-2', 'tp-2', 'フェイシャルケア', 45, 7000, '小顔矯正+リンパドレナージュ', 1, 1)`,
      `INSERT INTO therapist_menu_courses (id, therapist_profile_id, name, duration, price, description, display_order, is_active) VALUES ('course-2-3', 'tp-2', 'リフレクソロジー', 60, 7500, '足裏反射区で全身改善', 2, 1)`,
      `INSERT INTO therapist_menu_courses (id, therapist_profile_id, name, duration, price, description, display_order, is_active) VALUES ('course-2-4', 'tp-2', 'プレミアムコース', 120, 15000, 'アロマ+フェイシャル+リフレ', 3, 1)`,
      `INSERT INTO therapist_menu_courses (id, therapist_profile_id, name, duration, price, description, display_order, is_active) VALUES ('course-3-1', 'tp-3', '姿勢矯正コース', 60, 8000, '猫背・巻き肩・骨盤の歪み改善', 0, 1)`,
      `INSERT INTO therapist_menu_courses (id, therapist_profile_id, name, duration, price, description, display_order, is_active) VALUES ('course-3-2', 'tp-3', 'パーソナル整体', 90, 11000, '整体+運動指導で体質改善', 1, 1)`,
      `INSERT INTO therapist_menu_courses (id, therapist_profile_id, name, duration, price, description, display_order, is_active) VALUES ('course-3-3', 'tp-3', 'ストレッチ集中', 45, 6000, 'パートナーストレッチで柔軟性向上', 2, 1)`,
      `INSERT INTO therapist_menu_courses (id, therapist_profile_id, name, duration, price, description, display_order, is_active) VALUES ('course-3-4', 'tp-3', 'ボディメイクコース', 120, 14000, '整体+トレーニング+食事指導', 3, 1)`,
      // ===== メニュー（オプション） =====
      `INSERT INTO therapist_menu_options (id, therapist_profile_id, name, price, description, display_order, is_active) VALUES ('opt-1-1', 'tp-1', 'ヘッドマッサージ追加', 1500, '頭皮のツボを刺激', 0, 1)`,
      `INSERT INTO therapist_menu_options (id, therapist_profile_id, name, price, description, display_order, is_active) VALUES ('opt-1-2', 'tp-1', 'お灸追加', 2000, '温灸で血行促進', 1, 1)`,
      `INSERT INTO therapist_menu_options (id, therapist_profile_id, name, price, description, display_order, is_active) VALUES ('opt-1-3', 'tp-1', 'テーピング', 1000, 'スポーツテーピング', 2, 1)`,
      `INSERT INTO therapist_menu_options (id, therapist_profile_id, name, price, description, display_order, is_active) VALUES ('opt-2-1', 'tp-2', 'ホットストーン', 2000, '温めた天然石で深部温め', 0, 1)`,
      `INSERT INTO therapist_menu_options (id, therapist_profile_id, name, price, description, display_order, is_active) VALUES ('opt-2-2', 'tp-2', 'パック追加', 1500, 'コラーゲンパックで保湿', 1, 1)`,
      `INSERT INTO therapist_menu_options (id, therapist_profile_id, name, price, description, display_order, is_active) VALUES ('opt-2-3', 'tp-2', 'アロマ精油グレードアップ', 1000, 'プレミアム精油に変更', 2, 1)`,
      `INSERT INTO therapist_menu_options (id, therapist_profile_id, name, price, description, display_order, is_active) VALUES ('opt-3-1', 'tp-3', 'EMSトレーニング', 2500, 'EMS機器で筋力アップ', 0, 1)`,
      `INSERT INTO therapist_menu_options (id, therapist_profile_id, name, price, description, display_order, is_active) VALUES ('opt-3-2', 'tp-3', 'テーピング', 1000, 'キネシオテーピング', 1, 1)`,
      `INSERT INTO therapist_menu_options (id, therapist_profile_id, name, price, description, display_order, is_active) VALUES ('opt-3-3', 'tp-3', '食事指導レポート', 2000, 'パーソナル食事プラン', 2, 1)`,
      // ===== サイト =====
      `INSERT INTO sites (id, host_id, name, type, address, area_code, latitude, longitude, room_count, amenities, status, created_at, updated_at) VALUES ('site-shibuya', 'host-1', '渋谷サロン', 'PRIVATE_SPACE', '東京都渋谷区道玄坂2-10-7 新大宗ビル5F', 'shibuya', 35.6580, 139.6994, 3, '["WiFi","シャワー","アメニティ"]', 'APPROVED', '2026-01-01 00:00:00', '2026-01-01 00:00:00')`,
      `INSERT INTO sites (id, host_id, name, type, address, area_code, latitude, longitude, room_count, amenities, status, created_at, updated_at) VALUES ('site-shinjuku', 'host-1', '新宿サロン', 'PRIVATE_SPACE', '東京都新宿区西新宿1-5-11 新宿三葉ビル8F', 'shinjuku', 35.6896, 139.6922, 2, '["WiFi","ドリンク","アメニティ"]', 'APPROVED', '2026-01-01 00:00:00', '2026-01-01 00:00:00')`,
      `INSERT INTO sites (id, host_id, name, type, address, area_code, latitude, longitude, room_count, amenities, status, created_at, updated_at) VALUES ('site-meguro', 'host-1', '目黒サロン', 'PRIVATE_SPACE', '東京都目黒区目黒1-4-16 目黒Gビル3F', 'meguro', 35.6334, 139.7158, 2, '["WiFi","シャワー"]', 'APPROVED', '2026-01-01 00:00:00', '2026-01-01 00:00:00')`,
      // ===== 予約 =====
      `INSERT INTO bookings (id, user_id, therapist_id, therapist_name, site_id, type, status, service_name, duration, scheduled_at, price, notes, created_at) VALUES ('booking-001', 'customer-1', 'therapist-1', '高橋 大地', 'site-shibuya', 'ONSITE', 'PENDING', '鍼灸コース', 60, '2026-07-05 14:00:00', 9000, '肩こりがひどいです', '2026-06-28 10:00:00')`,
      `INSERT INTO bookings (id, user_id, therapist_id, therapist_name, site_id, type, status, service_name, duration, scheduled_at, price, notes, created_at) VALUES ('booking-002', 'customer-2', 'therapist-2', '佐藤 美咲', 'site-meguro', 'ONSITE', 'CONFIRMED', 'アロマリラクゼーション', 60, '2026-07-03 11:00:00', 8500, 'リラックスしたい', '2026-06-25 15:00:00')`,
      `INSERT INTO bookings (id, user_id, therapist_id, therapist_name, site_id, type, status, service_name, duration, scheduled_at, price, notes, customer_address, postal_code, created_at) VALUES ('booking-003', 'customer-1', 'therapist-1', '高橋 大地', NULL, 'MOBILE', 'CONFIRMED', 'スポーツケアコース', 90, '2026-07-07 10:00:00', 12000, 'スポーツ後のケア希望', '東京都渋谷区神宮前1-2-3 マンション405', '150-0001', '2026-06-27 18:00:00')`,
      `INSERT INTO bookings (id, user_id, therapist_id, therapist_name, site_id, type, status, service_name, duration, scheduled_at, price, notes, created_at, completed_at) VALUES ('booking-004', 'customer-2', 'therapist-3', '田中 健太', 'site-shinjuku', 'ONSITE', 'COMPLETED', '姿勢矯正コース', 60, '2026-06-20 15:00:00', 8000, '姿勢が気になる', '2026-06-18 12:00:00', '2026-06-20 16:00:00')`,
      `INSERT INTO bookings (id, therapist_id, therapist_name, site_id, type, status, service_name, duration, scheduled_at, price, notes, guest_name, guest_email, guest_phone, created_at) VALUES ('booking-005', 'therapist-2', '佐藤 美咲', 'site-shibuya', 'ONSITE', 'PENDING', 'フェイシャルケア', 45, '2026-07-08 13:00:00', 7000, 'フェイシャル希望', '伊藤 さくら', 'sakura.ito@example.com', '080-9999-1234', '2026-06-29 20:00:00')`,
      `INSERT INTO bookings (id, therapist_id, therapist_name, type, status, service_name, duration, scheduled_at, price, notes, guest_name, guest_email, guest_phone, customer_address, postal_code, created_at) VALUES ('booking-006', 'therapist-3', '田中 健太', 'MOBILE', 'PENDING', 'パーソナル整体', 90, '2026-07-10 09:00:00', 11000, '腰痛改善希望', '中村 翔太', 'shota.nakamura@example.com', '070-8888-5678', '東京都新宿区高田馬場4-5-6 ハイツ302', '169-0075', '2026-06-30 08:00:00')`,
      // ===== 予約アイテム =====
      `INSERT INTO booking_items (id, booking_id, item_type, item_id, item_name, price) VALUES ('bi-001', 'booking-001', 'COURSE', 'course-1-1', '鍼灸コース', 9000)`,
      `INSERT INTO booking_items (id, booking_id, item_type, item_id, item_name, price) VALUES ('bi-002', 'booking-002', 'COURSE', 'course-2-1', 'アロマリラクゼーション', 8500)`,
      `INSERT INTO booking_items (id, booking_id, item_type, item_id, item_name, price) VALUES ('bi-003', 'booking-003', 'COURSE', 'course-1-2', 'スポーツケアコース', 12000)`,
      `INSERT INTO booking_items (id, booking_id, item_type, item_id, item_name, price) VALUES ('bi-004', 'booking-004', 'COURSE', 'course-3-1', '姿勢矯正コース', 8000)`,
      `INSERT INTO booking_items (id, booking_id, item_type, item_id, item_name, price) VALUES ('bi-005', 'booking-005', 'COURSE', 'course-2-2', 'フェイシャルケア', 7000)`,
      `INSERT INTO booking_items (id, booking_id, item_type, item_id, item_name, price) VALUES ('bi-006', 'booking-006', 'COURSE', 'course-3-2', 'パーソナル整体', 11000)`,
      // ===== レビュー =====
      `INSERT INTO reviews (id, booking_id, therapist_id, user_id, rating, comment, customer_age_range, customer_gender, customer_occupation, body_concerns, is_public, created_at, updated_at) VALUES ('review-001', 'booking-004', 'therapist-3', 'customer-2', 5, '姿勢の改善を実感できました。施術後は体が軽くなり定期的に通いたいです。', '30代', '男性', '会社員', '["肩こり","猫背"]', 1, 1719100000, 1719100000)`,
      `INSERT INTO reviews (id, booking_id, therapist_id, user_id, rating, comment, customer_age_range, customer_gender, customer_occupation, body_concerns, is_public, created_at, updated_at) VALUES ('review-002', 'booking-004', 'therapist-3', 'customer-1', 4, '丁寧な説明と施術で安心できました。ストレッチ指導も分かりやすかったです。', '40代', '女性', '主婦', '["腰痛","冷え性"]', 1, 1719200000, 1719200000)`,
      `INSERT INTO reviews (id, booking_id, therapist_id, user_id, rating, comment, customer_age_range, customer_gender, customer_occupation, body_concerns, is_public, created_at, updated_at) VALUES ('review-003', 'booking-002', 'therapist-2', 'customer-2', 5, 'アロマの香りに癒されました。施術後は体全体がポカポカしてぐっすり眠れました。', '30代', '男性', '会社員', '["ストレス","不眠"]', 1, 1719300000, 1719300000)`,
      `INSERT INTO reviews (id, booking_id, therapist_id, user_id, rating, comment, customer_age_range, customer_gender, customer_occupation, body_concerns, is_public, created_at, updated_at) VALUES ('review-004', 'booking-003', 'therapist-1', 'customer-1', 5, '出張で自宅まで来ていただけて助かりました。鍼灸の腕は確かです。', '30代', '女性', '会社員', '["筋肉痛","疲労"]', 1, 1719400000, 1719400000)`,
      `INSERT INTO reviews (id, booking_id, therapist_id, user_id, rating, comment, customer_age_range, customer_gender, customer_occupation, body_concerns, is_public, created_at, updated_at) VALUES ('review-005', 'booking-001', 'therapist-1', 'customer-2', 4, '予約が取りやすく施術も丁寧。肩こりが楽になりました。', '20代', '男性', '学生', '["肩こり"]', 1, 1719500000, 1719500000)`,
      // ===== 関連テーブルの再作成（bookings参照） =====
      `CREATE TABLE IF NOT EXISTS payments (id TEXT PRIMARY KEY, booking_id TEXT NOT NULL, user_id TEXT NOT NULL, amount INTEGER NOT NULL, stripe_payment_intent_id TEXT, status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','PROCESSING','COMPLETED','FAILED','REFUNDED')), payment_method TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)`,
      `CREATE TABLE IF NOT EXISTS incidents (id TEXT PRIMARY KEY, booking_id TEXT NOT NULL, reporter_id TEXT NOT NULL, reporter_role TEXT NOT NULL, severity TEXT NOT NULL CHECK(severity IN ('LOW','MEDIUM','HIGH','CRITICAL')), category TEXT NOT NULL, description TEXT NOT NULL, status TEXT DEFAULT 'OPEN' CHECK(status IN ('OPEN','INVESTIGATING','RESOLVED','CLOSED')), resolution TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE, FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE)`,
      `CREATE TABLE IF NOT EXISTS affiliate_referrals (id TEXT PRIMARY KEY, affiliate_id TEXT NOT NULL, referred_user_id TEXT NOT NULL, booking_id TEXT, commission_amount INTEGER DEFAULT 0, status TEXT DEFAULT 'PENDING', created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (affiliate_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY (referred_user_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL)`,
      `CREATE TABLE IF NOT EXISTS therapist_earnings (id TEXT PRIMARY KEY, therapist_profile_id TEXT NOT NULL, booking_id TEXT NOT NULL, office_id TEXT, booking_price INTEGER NOT NULL, therapist_amount INTEGER NOT NULL, office_amount INTEGER DEFAULT 0, platform_fee INTEGER NOT NULL, status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING','CONFIRMED','PAID','CANCELLED')), paid_at DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (therapist_profile_id) REFERENCES therapist_profiles(id) ON DELETE CASCADE, FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE)`,
      `CREATE TABLE IF NOT EXISTS payment_splits (id TEXT PRIMARY KEY, booking_id TEXT NOT NULL, payment_intent_id TEXT NOT NULL, total_amount INTEGER NOT NULL, platform_fee INTEGER NOT NULL, office_amount INTEGER DEFAULT 0, therapist_amount INTEGER NOT NULL, status TEXT DEFAULT 'PENDING', created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (booking_id) REFERENCES bookings(id))`,
      `CREATE TABLE IF NOT EXISTS transactions (id TEXT PRIMARY KEY, booking_id TEXT, type TEXT NOT NULL CHECK(type IN ('BOOKING_PAYMENT','REFUND','PAYOUT','PLATFORM_FEE','ADJUSTMENT')), status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','PROCESSING','COMPLETED','FAILED','REFUNDED')), gross_amount INTEGER NOT NULL, net_amount INTEGER NOT NULL, fee_amount INTEGER NOT NULL DEFAULT 0, currency TEXT NOT NULL DEFAULT 'jpy', stripe_payment_intent_id TEXT UNIQUE, stripe_charge_id TEXT UNIQUE, stripe_refund_id TEXT UNIQUE, stripe_transfer_id TEXT UNIQUE, description TEXT, metadata TEXT, processed_at DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL)`,
      `CREATE TABLE IF NOT EXISTS receipts (id TEXT PRIMARY KEY, booking_id TEXT, user_id TEXT NOT NULL, transaction_id TEXT, receipt_number TEXT NOT NULL UNIQUE, amount INTEGER NOT NULL, tax_amount INTEGER NOT NULL DEFAULT 0, currency TEXT NOT NULL DEFAULT 'jpy', payment_method TEXT, stripe_payment_intent_id TEXT, pdf_url TEXT, issued_at DATETIME DEFAULT CURRENT_TIMESTAMP, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL)`,
    ]

  } else {
    // デフォルト: 初期マイグレーション + reviews テーブル
    statements = [
      // reviews テーブル（お客様レビューシステム）
      `CREATE TABLE IF NOT EXISTS reviews (id TEXT PRIMARY KEY, booking_id TEXT NOT NULL, therapist_id TEXT NOT NULL, user_id TEXT, rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5), comment TEXT, customer_age_range TEXT, customer_gender TEXT, customer_occupation TEXT, body_concerns TEXT DEFAULT '[]', ng_items TEXT DEFAULT '[]', is_public INTEGER NOT NULL DEFAULT 1, therapist_reply TEXT, therapist_replied_at INTEGER, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
      `CREATE INDEX IF NOT EXISTS idx_reviews_therapist_id ON reviews(therapist_id)`,
      `CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id)`,
      `CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(therapist_id, created_at)`,
      `CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(therapist_id, rating)`,
      // booking_timelocks テーブル（既存）
      `CREATE TABLE IF NOT EXISTS booking_timelocks (id TEXT PRIMARY KEY, therapist_id TEXT NOT NULL, site_id TEXT, scheduled_at DATETIME NOT NULL, duration INTEGER NOT NULL DEFAULT 60, expires_at DATETIME NOT NULL, session_id TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'ACTIVE', created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,
      `CREATE INDEX IF NOT EXISTS idx_timelocks_therapist_time ON booking_timelocks(therapist_id, scheduled_at, status)`,
      `CREATE INDEX IF NOT EXISTS idx_timelocks_expires ON booking_timelocks(expires_at, status)`,
      `ALTER TABLE bookings ADD COLUMN guest_name TEXT`,
      `ALTER TABLE bookings ADD COLUMN guest_email TEXT`,
      `ALTER TABLE bookings ADD COLUMN guest_phone TEXT`,
      `ALTER TABLE bookings ADD COLUMN timelock_id TEXT`,
      // 出張予約（MOBILE）の住所保存用カラム
      `ALTER TABLE bookings ADD COLUMN customer_address TEXT`,
      `ALTER TABLE bookings ADD COLUMN postal_code TEXT`,
      `ALTER TABLE bookings ADD COLUMN customer_lat REAL`,
      `ALTER TABLE bookings ADD COLUMN customer_lng REAL`,
    ]
  }

  for (const sql of statements) {
    try {
      await db.prepare(sql).run()
      results.push({ sql: sql.substring(0, 80) + '...', success: true })
    } catch (e: any) {
      const msg = e?.message || String(e)
      if (msg.includes('already exists') || msg.includes('duplicate column')) {
        results.push({ sql: sql.substring(0, 80) + '...', success: true, error: 'skipped (already exists)' })
      } else {
        results.push({ sql: sql.substring(0, 80) + '...', success: false, error: msg })
      }
    }
  }
  const allOk = results.every(r => r.success)
  return c.json({ ok: allOk, results }, allOk ? 200 : 500)
})

// ============================================
// Auth Routes
// ============================================
app.route('/api/auth', authApp)
app.route('/api/auth', passwordResetApp)

// ============================================
// KYC Routes
// ============================================
app.route('/api/kyc', kycApp)

// ============================================
// Google Maps Routes
// ============================================
app.route('/api/maps', mapsApp)

// ============================================
// Admin Routes
// ============================================
app.route('/api/admin', adminComprehensiveApp)

// ============================================
// Admin: Mock Data Routes
// ============================================
app.route('/api/admin/mock-data', mockDataApp)

// ============================================
// Sites Routes
// ============================================
app.route('/api/sites', sitesApp)
app.route('/api/admin/sites', adminSitesApp)

// ============================================
// Offices Routes
// ============================================
app.route('/api/offices', officesApp)

// ============================================
// Office Management Routes (Auth required)
// ============================================
app.route('/api/office-management', officeManagementApp)

// ============================================
// Earnings Management Routes (Auth required)
// ============================================
app.route('/api/earnings', earningsManagementApp)

// ============================================
// Therapist Routes
// ============================================
app.route('/api/therapist-edits', therapistEditApp)
app.route('/api/therapists', therapistManagementApp)
app.route('/api/therapists', therapistsRoutesApp)

// ============================================
// Image Routes (R2 Storage)
// ============================================
app.route('/api/images', imageApp)

// ============================================
// User Management Routes (Admin only)
// ============================================
app.route('/api/admin/users', userManagementApp)

// ============================================
// Areas Routes
// ============================================
app.route('/api/areas', areasRoutesApp)

// ============================================
// Bookings Routes (Auth required)
// ============================================
app.route('/api/bookings', bookingsRoutesApp)

// ============================================
// Reviews Routes
// ============================================
app.route('/api/reviews', reviewsApp)

// ============================================
// Schedules Routes
// ============================================
app.route('/api/schedules', schedulesRoutesApp)

// ============================================
// Payment Routes
// ============================================
app.route('/api/payment', paymentApp)
app.route('/api/payments', paymentsApp)
app.route('/api/receipts', paymentsApp)
app.route('/api/user', paymentsApp)

// ============================================
// Revenue Engine Routes (収益分配エンジン)
// ============================================
app.route('/api/revenue', revenueEngineApp)

// ============================================
// Host Routes (拠点ホスト向けAPI)
// ============================================
app.route('/api/host', hostApp)

// ============================================
// Stripe Webhook Routes
// ============================================
app.route('/api/webhook', stripeWebhookApp)

// ============================================
// Email Routes
// ============================================
app.route('/api/email', emailApp)

// ============================================
// Notification & Storage Routes
// (/api/notify/email, /api/storage/upload-url)
// ============================================
app.route('/api/notify', notifyApp)
app.route('/api/storage', notifyApp)

// ============================================
// SSR Public Pages（SEO対応のサーバーサイドHTML）
// ============================================
app.route('', publicPagesApp)

// ============================================
// SPA フォールバック
// /app/*, /t/*, /o/*, /h/*, /affiliate/*, /admin/*, /login, /signup, /logout, /auth/*
// などのSPAルートはindex.htmlを返してReactのクライアントサイドルーティングに委譲
// ============================================
app.all('*', async (c) => {
  const url = new URL(c.req.url)

  // 開発用静的HTMLファイルは直接ASSETSから配信（SPAにフォールバックしない）
  // 本番公開前に public/dev-login.html を削除すること
  const STATIC_HTML_FILES = ['/dev-login.html']
  if (STATIC_HTML_FILES.includes(url.pathname)) {
    const staticResponse = await c.env.ASSETS.fetch(new Request(c.req.url, {
      headers: c.req.raw.headers,
    }))
    if (staticResponse.status === 200) {
      return staticResponse
    }
  }

  // Cloudflare Pages の ASSETS バインディングから index.html を取得
  url.pathname = '/'
  const response = await c.env.ASSETS.fetch(new Request(url.toString(), {
    headers: c.req.raw.headers,
  }))
  return new Response(response.body, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
})

export default app
