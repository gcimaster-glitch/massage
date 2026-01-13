import { Hono } from 'hono'
import { cors } from 'hono/cors'
import authApp from './auth-routes'
import mapsApp from './maps-routes'
import adminApp from './admin-routes'
import sitesApp from './sites-routes'
import officesApp from './offices-routes'

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
    service: 'HOGUSY API'
  })
})

// ============================================
// Mount Social Auth Routes
// ============================================
app.route('/api/auth', authApp)

// ============================================
// Mount Google Maps Routes
// ============================================
app.route('/api/maps', mapsApp)

// ============================================
// Mount Admin Routes
// ============================================
app.route('/api/admin', adminApp)

// ============================================
// Mount Sites Routes
// ============================================
app.route('/api/sites', sitesApp)

// ============================================
// Mount Offices Routes
// ============================================
app.route('/api/offices', officesApp)

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
      'line_items[0][price_data][product_data][name]': 'HOGUSY Wellness Session',
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
      SELECT u.id, u.name, u.avatar_url, tp.rating, tp.review_count, tp.specialties, tp.approved_areas, tp.bio
      FROM users u
      JOIN therapist_profiles tp ON u.id = tp.user_id
      WHERE u.role = 'THERAPIST'
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

// ============================================
// Sites Routes (施設一覧・検索)
// ============================================
app.get('/api/sites', async (c) => {
  const area = c.req.query('area')
  const type = c.req.query('type')
  const search = c.req.query('search')
  
  try {
    if (!c.env.DB) {
      return c.json([])
    }
    
    // Check if we're using area or area_code
    const { results: schemaCheck } = await c.env.DB.prepare(
      "SELECT sql FROM sqlite_master WHERE type='table' AND name='sites'"
    ).all()
    
    const useAreaCode = schemaCheck.length > 0 && 
                        schemaCheck[0].sql.includes('area_code')
    
    const areaColumn = useAreaCode ? 's.area_code' : 's.area'
    const latColumn = useAreaCode ? 's.latitude' : 's.lat'
    const lngColumn = useAreaCode ? 's.longitude' : 's.lng'
    
    let query = `
      SELECT s.id, s.name, s.type, s.address, ${areaColumn} as area, 
             ${latColumn} as lat, ${lngColumn} as lng, s.host_id,
             u.name as host_name
      FROM sites s
      LEFT JOIN users u ON s.host_id = u.id
      WHERE 1=1
    `
    const params: any[] = []
    
    if (area) {
      query += ` AND ${areaColumn} = ?`
      params.push(area)
    }
    
    if (type) {
      query += ' AND s.type = ?'
      params.push(type)
    }
    
    if (search) {
      query += ' AND (s.name LIKE ? OR s.address LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }
    
    query += ' ORDER BY s.name LIMIT 100'
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all()
    return c.json(results)
  } catch (e) {
    console.error('Sites API error:', e)
    return c.json([], 500)
  }
})

app.get('/api/sites/:id', async (c) => {
  const id = c.req.param('id')
  
  try {
    if (!c.env.DB) {
      return c.json({ error: 'Database not available' }, 503)
    }
    
    // Check schema
    const { results: schemaCheck } = await c.env.DB.prepare(
      "SELECT sql FROM sqlite_master WHERE type='table' AND name='sites'"
    ).all()
    
    const useAreaCode = schemaCheck.length > 0 && 
                        schemaCheck[0].sql.includes('area_code')
    
    const areaColumn = useAreaCode ? 's.area_code' : 's.area'
    const latColumn = useAreaCode ? 's.latitude' : 's.lat'
    const lngColumn = useAreaCode ? 's.longitude' : 's.lng'
    
    const { results } = await c.env.DB.prepare(`
      SELECT s.id, s.name, s.type, s.address, ${areaColumn} as area,
             ${latColumn} as lat, ${lngColumn} as lng, s.host_id,
             u.name as host_name, u.email as host_email, u.phone as host_phone
      FROM sites s
      LEFT JOIN users u ON s.host_id = u.id
      WHERE s.id = ?
    `).bind(id).all()
    
    if (results.length === 0) {
      return c.json({ error: 'Site not found' }, 404)
    }
    
    return c.json(results[0])
  } catch (e) {
    console.error('Site detail error:', e)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// ============================================
// Offices Routes (事務所一覧・詳細)
// ============================================
app.get('/api/offices', async (c) => {
  try {
    if (!c.env.DB) {
      return c.json([])
    }
    
    const { results } = await c.env.DB.prepare(`
      SELECT o.id, o.name, o.area_code as area, o.manager_name, o.contact_email,
             o.commission_rate, o.therapist_count, o.status,
             u.name as owner_name
      FROM offices o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.status = 'APPROVED'
      ORDER BY o.therapist_count DESC
    `).all()
    
    return c.json(results)
  } catch (e) {
    console.error('Offices API error:', e)
    return c.json([], 500)
  }
})

app.get('/api/offices/:id', async (c) => {
  const id = c.req.param('id')
  
  try {
    if (!c.env.DB) {
      return c.json({ error: 'Database not available' }, 503)
    }
    
    // 事務所情報
    const { results: offices } = await c.env.DB.prepare(`
      SELECT o.*, u.name as owner_name, u.email as owner_email, u.phone as owner_phone
      FROM offices o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `).bind(id).all()
    
    if (offices.length === 0) {
      return c.json({ error: 'Office not found' }, 404)
    }
    
    // 所属セラピスト一覧
    const { results: therapists } = await c.env.DB.prepare(`
      SELECT u.id, u.name, u.avatar_url, tp.rating, tp.review_count,
             tp.specialties, tp.approved_areas
      FROM therapist_profiles tp
      JOIN users u ON tp.user_id = u.id
      WHERE tp.office_id = ?
      ORDER BY tp.rating DESC, tp.review_count DESC
    `).bind(id).all()
    
    return c.json({
      ...offices[0],
      therapists
    })
  } catch (e) {
    console.error('Office detail error:', e)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// ============================================
// Therapists Search with Filters
// ============================================
app.get('/api/therapists/search', async (c) => {
  const area = c.req.query('area')
  const officeId = c.req.query('officeId')
  const specialty = c.req.query('specialty')
  const minRating = c.req.query('minRating')
  
  try {
    if (!c.env.DB) {
      return c.json([])
    }
    
    let query = `
      SELECT u.id, u.name, u.avatar_url, tp.rating, tp.review_count,
             tp.specialties, tp.approved_areas, tp.office_id,
             o.name as office_name
      FROM users u
      JOIN therapist_profiles tp ON u.id = tp.user_id
      LEFT JOIN therapist_offices o ON tp.office_id = o.id
      WHERE u.role = 'THERAPIST' AND tp.is_active = TRUE
    `
    const params: any[] = []
    
    if (officeId) {
      query += ' AND tp.office_id = ?'
      params.push(officeId)
    }
    
    if (minRating) {
      query += ' AND tp.rating >= ?'
      params.push(parseFloat(minRating))
    }
    
    if (area) {
      query += ' AND tp.approved_areas LIKE ?'
      params.push(`%${area}%`)
    }
    
    if (specialty) {
      query += ' AND tp.specialties LIKE ?'
      params.push(`%${specialty}%`)
    }
    
    query += ' ORDER BY tp.rating DESC, tp.review_count DESC LIMIT 50'
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all()
    return c.json(results)
  } catch (e) {
    console.error('Therapist search error:', e)
    return c.json([], 500)
  }
})

export default app