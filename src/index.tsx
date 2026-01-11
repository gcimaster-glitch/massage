import { Hono } from 'hono'
import { cors } from 'hono/cors'

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
}

const app = new Hono<{ Bindings: Bindings }>()

// ============================================
// Middleware
// ============================================
app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// ============================================
// Health Check
// ============================================
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Soothe x CARE CUBE Japan API'
  })
})

// ============================================
// Auth Routes
// ============================================
app.post('/api/auth/login', async (c) => {
  const { email, password } = await c.req.json()
  
  try {
    if (!c.env.DB) {
      // モックユーザー（開発環境用）
      const mockUser = {
        id: 'u1',
        email: email,
        name: '山田 太郎',
        role: 'USER'
      }
      
      const token = btoa(JSON.stringify({ 
        userId: mockUser.id, 
        role: mockUser.role, 
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000 
      }))
      
      return c.json({ token, user: mockUser })
    }
    
    // モック認証（実際はパスワードハッシュと照合）
    const { results } = await c.env.DB.prepare(
      'SELECT id, email, name, role FROM users WHERE email = ?'
    ).bind(email).all()
    
    if (results.length === 0) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }
    
    const user = results[0]
    
    // JWTトークン生成（簡易版）
    const token = btoa(JSON.stringify({ userId: user.id, role: user.role, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }))
    
    return c.json({ token, user })
  } catch (e) {
    // エラー時はモックユーザーを返す
    const mockUser = {
      id: 'u1',
      email: email,
      name: '山田 太郎',
      role: 'USER'
    }
    
    const token = btoa(JSON.stringify({ 
      userId: mockUser.id, 
      role: mockUser.role, 
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000 
    }))
    
    return c.json({ token, user: mockUser })
  }
})

app.get('/api/auth/me', async (c) => {
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  try {
    const token = authHeader.replace('Bearer ', '')
    const payload = JSON.parse(atob(token))
    
    if (payload.exp < Date.now()) {
      return c.json({ error: 'Token expired' }, 401)
    }
    
    if (!c.env.DB) {
      // モックユーザー（開発環境用）
      return c.json({
        id: payload.userId,
        email: 'user@example.com',
        name: '山田 太郎',
        role: payload.role
      })
    }
    
    const { results } = await c.env.DB.prepare(
      'SELECT id, email, name, role FROM users WHERE id = ?'
    ).bind(payload.userId).all()
    
    return c.json(results[0] || null)
  } catch (e) {
    return c.json({ error: 'Invalid token' }, 401)
  }
})

// ============================================
// Booking Routes
// ============================================
app.get('/api/bookings', async (c) => {
  try {
    if (!c.env.DB) {
      // モックデータ（開発環境用）
      return c.json([
        {
          id: 'b-101',
          user_id: 'u1',
          therapist_id: 't1',
          site_id: 'site1',
          type: 'ONSITE',
          status: 'CONFIRMED',
          service_name: '深層筋ボディケア (60分)',
          duration: 60,
          scheduled_start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          price: 8000,
          payment_status: 'PAID'
        }
      ])
    }
    
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM bookings ORDER BY scheduled_start DESC LIMIT 50'
    ).all()
    
    return c.json(results)
  } catch (e) {
    // エラー時はモックデータを返す
    return c.json([])
  }
})

app.post('/api/bookings', async (c) => {
  const booking = await c.req.json()
  
  const id = `b-${Date.now()}`
  
  await c.env.DB.prepare(`
    INSERT INTO bookings (
      id, user_id, therapist_id, site_id, office_id, type, status,
      service_name, duration, scheduled_start, price, payment_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    booking.userId,
    booking.therapistId,
    booking.siteId,
    booking.officeId || null,
    booking.type,
    'PENDING',
    booking.serviceName,
    booking.duration,
    booking.scheduledStart,
    booking.price,
    'PENDING'
  ).run()
  
  return c.json({ success: true, id })
})

app.get('/api/bookings/:id', async (c) => {
  const id = c.req.param('id')
  
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM bookings WHERE id = ?'
  ).bind(id).all()
  
  if (results.length === 0) {
    return c.json({ error: 'Not found' }, 404)
  }
  
  return c.json(results[0])
})

app.patch('/api/bookings/:id/status', async (c) => {
  const id = c.req.param('id')
  const { status } = await c.req.json()
  
  await c.env.DB.prepare(
    'UPDATE bookings SET status = ? WHERE id = ?'
  ).bind(status, id).run()
  
  return c.json({ success: true })
})

// ============================================
// Messages Routes
// ============================================
app.get('/api/bookings/:id/messages', async (c) => {
  const bookingId = c.req.param('id')
  
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM messages WHERE booking_id = ? ORDER BY created_at ASC'
  ).bind(bookingId).all()
  
  return c.json(results)
})

app.patch('/api/bookings/:id/location', async (c) => {
  const id = c.req.param('id')
  const { lat, lng } = await c.req.json()
  
  const msgId = `msg-${Date.now()}`
  
  await c.env.DB.prepare(`
    INSERT INTO messages (id, booking_id, sender_id, content, type)
    VALUES (?, ?, ?, ?, ?)
  `).bind(
    msgId,
    id,
    'system',
    JSON.stringify({ lat, lng }),
    'LOCATION'
  ).run()
  
  return c.json({ success: true })
})

// ============================================
// Payment Routes (Stripe)
// ============================================
app.post('/api/payments/create-session', async (c) => {
  const { bookingId, amount } = await c.req.json()
  
  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${c.env.STRIPE_SECRET}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'mode': 'payment',
      'success_url': `${new URL(c.req.url).origin}/#/app/booking/success?id=${bookingId}`,
      'cancel_url': `${new URL(c.req.url).origin}/#/app/booking/new`,
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
  // TODO: Stripe Connect アカウント作成とオンボーディングURL生成
  return c.json({ url: 'https://connect.stripe.com/setup/...' })
})

// ============================================
// Notification Routes (Resend)
// ============================================
app.post('/api/notify/email', async (c) => {
  const { to, subject, html } = await c.req.json()
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${c.env.RESEND_API_KEY}`,
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
// Therapist Routes
// ============================================
app.get('/api/therapists', async (c) => {
  try {
    if (!c.env.DB) {
      // モックデータ（開発環境用）
      return c.json([
        {
          id: 't1',
          name: '田中 有紀',
          rating: 4.9,
          review_count: 120,
          specialties: ['LICENSED', 'RELAXATION'],
          approved_areas: ['SHINJUKU', 'SHIBUYA']
        },
        {
          id: 't2',
          name: '佐藤 花子',
          rating: 4.8,
          review_count: 85,
          specialties: ['HEAD', 'RECOVERY'],
          approved_areas: ['SHINJUKU']
        }
      ])
    }
    
    const { results } = await c.env.DB.prepare(`
      SELECT u.id, u.name, tp.rating, tp.review_count, tp.specialties, tp.approved_areas
      FROM users u
      JOIN therapist_profiles tp ON u.id = tp.user_id
      WHERE u.role = 'THERAPIST' AND tp.is_active = TRUE
      LIMIT 50
    `).all()
    
    return c.json(results)
  } catch (e) {
    // エラーが発生した場合もモックデータを返す
    return c.json([
      {
        id: 't1',
        name: '田中 有紀',
        rating: 4.9,
        review_count: 120,
        specialties: ['LICENSED', 'RELAXATION'],
        approved_areas: ['SHINJUKU', 'SHIBUYA']
      }
    ])
  }
})

app.get('/api/therapists/:id', async (c) => {
  const id = c.req.param('id')
  
  try {
    if (!c.env.DB) {
      // モックデータ（開発環境用）
      return c.json({
        id: 't1',
        name: '田中 有紀',
        rating: 4.9,
        review_count: 120,
        specialties: ['LICENSED', 'RELAXATION'],
        approved_areas: ['SHINJUKU', 'SHIBUYA'],
        bio: 'プロフェッショナルなセラピストです。',
        imageUrl: 'https://images.unsplash.com/photo-1622902046580-2b47f47f0871?auto=format&fit=crop&q=80&w=800&h=800'
      })
    }
    
    const { results } = await c.env.DB.prepare(`
      SELECT u.*, tp.*
      FROM users u
      JOIN therapist_profiles tp ON u.id = tp.user_id
      WHERE u.id = ?
    `).bind(id).all()
    
    return c.json(results[0] || null)
  } catch (e) {
    // エラーが発生した場合もモックデータを返す
    return c.json({
      id,
      name: '田中 有紀',
      rating: 4.9,
      review_count: 120
    })
  }
})

export default app