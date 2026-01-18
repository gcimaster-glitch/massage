import { Hono } from 'hono'
import { cors } from 'hono/cors'
import authApp from './auth-routes'
import mapsApp from './maps-routes'
import adminApp from './admin-routes'
import sitesApp from './sites-routes'
import officesApp from './offices-routes'
import therapistEditApp from './therapist-edit-routes'
import imageApp from './image-routes'
import userManagementApp from './user-management-routes'
import sitesRoutesApp from './sites-routes'
import therapistsRoutesApp from './therapists-routes'
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

// ============================================
// Mount Public Sites Routes
// ============================================
app.route('/api/sites', sitesRoutesApp)

// ============================================
// Mount Public Therapists Routes
// ============================================
app.route('/api/therapists', therapistsRoutesApp)

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
    'PENDING_PAYMENT', // 決済待ち状態
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

// 決済成功時：予約を確定
app.post('/api/bookings/:id/confirm-payment', async (c) => {
  const id = c.req.param('id')
  const { paymentIntentId } = await c.req.json()
  
  await c.env.DB.prepare(`
    UPDATE bookings 
    SET status = 'CONFIRMED', payment_status = 'COMPLETED'
    WHERE id = ? AND status = 'PENDING_PAYMENT'
  `).bind(id).run()
  
  return c.json({ success: true })
})

// 決済失敗時：予約を削除
app.delete('/api/bookings/:id/cancel-payment', async (c) => {
  const id = c.req.param('id')
  
  // booking_items を先に削除（外部キー制約対応）
  await c.env.DB.prepare(`
    DELETE FROM booking_items WHERE booking_id = ?
  `).bind(id).run()
  
  // 予約本体を削除
  await c.env.DB.prepare(`
    DELETE FROM bookings 
    WHERE id = ? AND status = 'PENDING_PAYMENT'
  `).bind(id).run()
  
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
    
    // Map avatar URLs to local static files
    const therapistsWithLocalImages = results.map((t: any) => ({
      ...t,
      avatar_url: `/therapists/${t.id}.jpg`
    }))
    
    return c.json(therapistsWithLocalImages)
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

// セラピストのメニュー取得
app.get('/api/therapists/:id/menu', async (c) => {
  const therapistId = c.req.param('id')
  
  try {
    if (!c.env.DB) {
      // モックデータ（開発環境用）
      return c.json({
        courses: [
          {
            id: 'course-1',
            name: '整体コース（60分）',
            duration: 60,
            base_price: 8000,
            description: '全身の疲れをほぐす整体コース',
          },
          {
            id: 'course-2',
            name: 'リラクゼーション（90分）',
            duration: 90,
            base_price: 12000,
            description: 'じっくりとリラックスできるコース',
          },
          {
            id: 'course-3',
            name: 'ショートコース（30分）',
            duration: 30,
            base_price: 5000,
            description: '肩・首を集中的にほぐすコース',
          },
        ],
        options: [
          {
            id: 'option-1',
            name: 'ヘッドマッサージ追加',
            duration: 15,
            base_price: 2000,
            description: '頭皮をほぐしてリフレッシュ',
          },
          {
            id: 'option-2',
            name: 'フットケア追加',
            duration: 15,
            base_price: 1500,
            description: '足裏をじっくりほぐす',
          },
          {
            id: 'option-3',
            name: 'アロマオイル',
            duration: 0,
            base_price: 1000,
            description: 'リラックス効果のあるアロマオイル',
          },
        ],
      })
    }
    
    // DB実装
    // 本番DBでは user_id が therapist_profiles の主キー
    const therapistProfileId = therapistId // user_id をそのまま使用
    
    // 1. コースを取得（therapist_menu と master_courses を JOIN）
    const { results: courses } = await c.env.DB.prepare(`
      SELECT 
        mc.id,
        mc.name,
        mc.duration,
        tm.price as base_price,
        mc.description
      FROM therapist_menu tm
      JOIN master_courses mc ON tm.master_course_id = mc.id
      WHERE tm.therapist_id = ? AND tm.is_available = 1
      ORDER BY tm.price
    `).bind(therapistProfileId).all()
    
    // 2. オプションを取得（therapist_options と master_options を JOIN）
    const { results: options } = await c.env.DB.prepare(`
      SELECT 
        mo.id,
        mo.name,
        mo.duration,
        topt.price as base_price,
        mo.description
      FROM therapist_options topt
      JOIN master_options mo ON topt.master_option_id = mo.id
      WHERE topt.therapist_id = ? AND topt.is_available = 1
      ORDER BY topt.price
    `).bind(therapistProfileId).all()
    
    return c.json({
      courses: courses || [],
      options: options || [],
    })
  } catch (e) {
    console.error('メニュー取得エラー:', e)
    // エラー時はモックデータを返す
    return c.json({
      courses: [
        {
          id: 'course-1',
          name: '整体コース（60分）',
          duration: 60,
          base_price: 8000,
          description: '全身の疲れをほぐす整体コース',
        },
        {
          id: 'course-2',
          name: 'リラクゼーション（90分）',
          duration: 90,
          base_price: 12000,
          description: 'じっくりとリラックスできるコース',
        },
      ],
      options: [
        {
          id: 'option-1',
          name: 'ヘッドマッサージ追加',
          duration: 15,
          base_price: 2000,
          description: '頭皮をほぐしてリフレッシュ',
        },
      ],
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