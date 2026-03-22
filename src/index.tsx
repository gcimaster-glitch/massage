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
  } else if (action === 'restore_data') {
    // bookings_oldからbookingsへデータを復元
    statements = [
      `INSERT OR IGNORE INTO bookings (id, user_id, therapist_id, therapist_name, site_id, office_id, type, status, service_name, duration, scheduled_at, price, payment_intent_id, payment_status, guest_name, guest_email, guest_phone, timelock_id, created_at, completed_at) SELECT id, user_id, therapist_id, therapist_name, site_id, office_id, type, status, service_name, duration, scheduled_at, price, payment_intent_id, payment_status, guest_name, guest_email, guest_phone, timelock_id, created_at, completed_at FROM bookings_old`,
    ]
  } else {
    // デフォルト: 初期マイグレーション
    statements = [
      `CREATE TABLE IF NOT EXISTS booking_timelocks (id TEXT PRIMARY KEY, therapist_id TEXT NOT NULL, site_id TEXT, scheduled_at DATETIME NOT NULL, duration INTEGER NOT NULL DEFAULT 60, expires_at DATETIME NOT NULL, session_id TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'ACTIVE', created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,
      `CREATE INDEX IF NOT EXISTS idx_timelocks_therapist_time ON booking_timelocks(therapist_id, scheduled_at, status)`,
      `CREATE INDEX IF NOT EXISTS idx_timelocks_expires ON booking_timelocks(expires_at, status)`,
      `ALTER TABLE bookings ADD COLUMN guest_name TEXT`,
      `ALTER TABLE bookings ADD COLUMN guest_email TEXT`,
      `ALTER TABLE bookings ADD COLUMN guest_phone TEXT`,
      `ALTER TABLE bookings ADD COLUMN timelock_id TEXT`,
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
app.route('/api/therapists', therapistsRoutesApp)
app.route('/api/therapists', therapistManagementApp)

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
