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
