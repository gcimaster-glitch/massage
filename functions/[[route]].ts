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
    const envOrigins = c.env?.ALLOWED_ORIGINS
      ? c.env.ALLOWED_ORIGINS.split(',').map((o: string) => o.trim())
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
// Email Routes
// ============================================
app.route('/api/email', emailApp)

// ============================================
// Notification & Storage Routes
// (/api/notify/email, /api/storage/upload-url)
// ============================================
app.route('/api/notify', notifyApp)
app.route('/api/storage', notifyApp)

export default app
