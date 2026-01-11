import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

// ============================================
// Cloudflare Bindings Type Definition
// ============================================
type Bindings = {
  DB: D1Database
  STORAGE: R2Bucket
  STRIPE_SECRET: string
  RESEND_API_KEY: string
  GEMINI_API_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

// ============================================
// Middleware
// ============================================
app.use('/api/*', cors())

// ============================================
// Static Files (Frontend assets)
// ============================================
app.use('/static/*', serveStatic({ root: './public' }))

// ============================================
// API Routes
// ============================================

// ===== Auth & KYC =====
app.get('/api/auth/me', async (c) => {
  // TODO: Implement JWT verification
  return c.json({ 
    id: 'u1', 
    name: '山田 太郎', 
    role: 'USER',
    email: 'user1@example.com' 
  })
})

app.post('/api/auth/kyc-verify', async (c) => {
  const { image } = await c.req.json()
  // TODO: Upload to R2 and verify with Stripe Identity
  return c.json({ success: true, status: 'VERIFIED' })
})

// ===== Bookings (D1 Database) =====
app.get('/api/bookings', async (c) => {
  const { DB } = c.env
  const { results } = await DB.prepare(
    'SELECT * FROM bookings ORDER BY scheduled_start DESC'
  ).all()
  return c.json(results)
})

app.get('/api/bookings/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  const { results } = await DB.prepare(
    'SELECT * FROM bookings WHERE id = ?'
  ).bind(id).all()
  return c.json(results[0] || null)
})

app.post('/api/bookings', async (c) => {
  const { DB } = c.env
  const booking = await c.req.json()
  
  await DB.prepare(
    `INSERT INTO bookings (id, user_id, therapist_id, site_id, office_id, type, status, service_name, duration, scheduled_start, price, payment_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    booking.id,
    booking.userId,
    booking.therapistId,
    booking.siteId,
    booking.officeId,
    booking.type,
    'PENDING',
    booking.serviceName,
    booking.duration,
    booking.scheduledStart,
    booking.price,
    'PENDING'
  ).run()

  return c.json({ success: true, id: booking.id })
})

app.patch('/api/bookings/:id/status', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  const { status } = await c.req.json()
  
  await DB.prepare(
    'UPDATE bookings SET status = ? WHERE id = ?'
  ).bind(status, id).run()

  return c.json({ success: true })
})

// ===== Messages =====
app.get('/api/bookings/:id/messages', async (c) => {
  const { DB } = c.env
  const bookingId = c.req.param('id')
  
  const { results } = await DB.prepare(
    'SELECT * FROM messages WHERE booking_id = ? ORDER BY created_at ASC'
  ).bind(bookingId).all()

  return c.json(results)
})

app.patch('/api/bookings/:id/location', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  const { lat, lng } = await c.req.json()
  
  // Insert location update as system message
  await DB.prepare(
    `INSERT INTO messages (id, booking_id, sender_id, content, type)
     VALUES (?, ?, ?, ?, ?)`
  ).bind(
    `msg-${Date.now()}`,
    id,
    'system',
    JSON.stringify({ lat, lng }),
    'LOCATION'
  ).run()

  return c.json({ success: true })
})

// ===== Payments (Stripe) =====
app.post('/api/payments/create-session', async (c) => {
  const { STRIPE_SECRET } = c.env
  const { bookingId, amount } = await c.req.json()

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'mode': 'payment',
      'success_url': `${c.req.url.split('/api')[0]}/#/app/booking/success?id=${bookingId}`,
      'cancel_url': `${c.req.url.split('/api')[0]}/#/app/booking/new`,
      'line_items[0][price_data][currency]': 'jpy',
      'line_items[0][price_data][product_data][name]': 'Soothe Wellness Session',
      'line_items[0][price_data][unit_amount]': amount.toString(),
      'line_items[0][quantity]': '1',
    })
  })

  const session = await response.json()
  return c.json({ checkoutUrl: session.url })
})

app.get('/api/payments/connect-onboarding', async (c) => {
  const { STRIPE_SECRET } = c.env
  // TODO: Create Stripe Connect account and return onboarding URL
  return c.json({ url: 'https://connect.stripe.com/setup/...' })
})

// ===== Notifications (Resend) =====
app.post('/api/notify/email', async (c) => {
  const { RESEND_API_KEY } = c.env
  const { to, subject, html } = await c.req.json()

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Soothe <noreply@soothe.jp>',
      to,
      subject,
      html,
    }),
  })

  const result = await response.json()
  return c.json(result)
})

// ===== Storage (R2) =====
app.get('/api/storage/upload-url', async (c) => {
  const { STORAGE } = c.env
  const fileName = c.req.query('file')
  
  // Generate signed upload URL
  const key = `uploads/${Date.now()}-${fileName}`
  // TODO: Generate R2 presigned URL
  return c.json({ url: `https://storage.soothe.jp/${key}` })
})

// ===== Therapists =====
app.get('/api/therapists', async (c) => {
  const { DB } = c.env
  const { results } = await DB.prepare(`
    SELECT u.id, u.name, tp.rating, tp.review_count, tp.specialties, tp.approved_areas
    FROM users u
    JOIN therapist_profiles tp ON u.id = tp.user_id
    WHERE u.role = 'THERAPIST' AND tp.is_active = TRUE
  `).all()
  return c.json(results)
})

app.get('/api/therapists/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  const { results } = await DB.prepare(`
    SELECT u.*, tp.*
    FROM users u
    JOIN therapist_profiles tp ON u.id = tp.user_id
    WHERE u.id = ?
  `).bind(id).all()
  return c.json(results[0] || null)
})

// ============================================
// Default Route (Serve React App)
// ============================================
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Soothe x CARE CUBE Japan</title>
        <meta name="description" content="癒やしを、都市のインフラへ。次世代ウェルネス・プラットフォーム">
    </head>
    <body>
        <div id="root"></div>
        <script type="module" src="/static/index.js"></script>
    </body>
    </html>
  `)
})

export default app