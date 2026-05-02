import { Hono } from 'hono'
import { sign, verify } from 'hono/jwt'

// ============================================
// Type Definitions
// ============================================
type Bindings = {
  DB: D1Database
  JWT_SECRET: string
}

type JwtPayload = {
  sub: string
  userId: string
  role: string
  userName?: string
  name?: string
  iat?: number
  exp?: number
}

type Review = {
  id: string
  booking_id: string
  therapist_id: string
  user_id: string | null
  rating: number
  comment: string | null
  customer_age_range: string | null
  customer_gender: string | null
  customer_occupation: string | null
  body_concerns: string
  ng_items: string
  is_public: number
  therapist_reply: string | null
  therapist_replied_at: number | null
  created_at: number
  updated_at: number
}

const reviewsApp = new Hono<{ Bindings: Bindings }>()

// ============================================
// ユーティリティ: JWT検証
// ============================================
async function verifyJwt(authHeader: string | undefined, secret: string): Promise<JwtPayload | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)
  try {
    const payload = await verify(token, secret) as JwtPayload
    return payload
  } catch {
    return null
  }
}

function generateId(): string {
  return crypto.randomUUID()
}

// ============================================
// POST /api/reviews
// レビュー投稿（ログインユーザーのみ）
// ============================================
reviewsApp.post('/', async (c) => {
  const payload = await verifyJwt(c.req.header('Authorization'), c.env.JWT_SECRET)
  if (!payload) {
    return c.json({ error: '認証が必要です' }, 401)
  }

  const body = await c.req.json().catch(() => null)
  if (!body) {
    return c.json({ error: 'リクエストボディが不正です' }, 400)
  }

  const {
    booking_id,
    therapist_id,
    rating,
    comment,
    customer_age_range,
    customer_gender,
    customer_occupation,
    body_concerns,
    ng_items,
    is_public,
  } = body

  // バリデーション
  if (!booking_id || !therapist_id) {
    return c.json({ error: '予約IDとセラピストIDは必須です' }, 400)
  }
  if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
    return c.json({ error: '評価は1〜5の整数で入力してください' }, 400)
  }

  const db = c.env.DB
  const userId = payload.userId || payload.sub

  // 同じ予約に対して既にレビューが存在するか確認
  const existing = await db
    .prepare('SELECT id FROM reviews WHERE booking_id = ? AND user_id = ?')
    .bind(booking_id, userId)
    .first()

  if (existing) {
    return c.json({ error: 'この予約に対するレビューは既に投稿済みです' }, 409)
  }

  // 予約の存在確認（自分の予約かどうか）
  const booking = await db
    .prepare('SELECT id, therapist_id, status FROM bookings WHERE id = ? AND user_id = ?')
    .bind(booking_id, userId)
    .first()

  if (!booking) {
    return c.json({ error: '対象の予約が見つかりません' }, 404)
  }

  const now = Date.now()
  const reviewId = generateId()

  const bodyConcernsJson = JSON.stringify(Array.isArray(body_concerns) ? body_concerns : [])
  const ngItemsJson = JSON.stringify(Array.isArray(ng_items) ? ng_items : [])
  const isPublicVal = is_public === false ? 0 : 1

  await db
    .prepare(`
      INSERT INTO reviews (
        id, booking_id, therapist_id, user_id, rating, comment,
        customer_age_range, customer_gender, customer_occupation,
        body_concerns, ng_items, is_public,
        therapist_reply, therapist_replied_at,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, ?)
    `)
    .bind(
      reviewId,
      booking_id,
      therapist_id,
      userId,
      rating,
      comment || null,
      customer_age_range || null,
      customer_gender || null,
      customer_occupation || null,
      bodyConcernsJson,
      ngItemsJson,
      isPublicVal,
      now,
      now
    )
    .run()

  return c.json({
    ok: true,
    review_id: reviewId,
    message: 'レビューを投稿しました',
  }, 201)
})

// ============================================
// GET /api/reviews/therapist/:therapistId
// セラピスト別レビュー一覧（公開）
// ============================================
reviewsApp.get('/therapist/:therapistId', async (c) => {
  const therapistId = c.req.param('therapistId')
  const page = parseInt(c.req.query('page') || '1', 10)
  const limit = Math.min(parseInt(c.req.query('limit') || '10', 10), 50)
  const offset = (page - 1) * limit

  const db = c.env.DB

  const [rows, countRow] = await Promise.all([
    db
      .prepare(`
        SELECT
          r.id, r.booking_id, r.therapist_id, r.rating, r.comment,
          r.customer_age_range, r.customer_gender, r.customer_occupation,
          r.body_concerns, r.ng_items, r.is_public,
          r.therapist_reply, r.therapist_replied_at,
          r.created_at, r.updated_at
        FROM reviews r
        WHERE r.therapist_id = ? AND r.is_public = 1
        ORDER BY r.created_at DESC
        LIMIT ? OFFSET ?
      `)
      .bind(therapistId, limit, offset)
      .all(),
    db
      .prepare('SELECT COUNT(*) as total FROM reviews WHERE therapist_id = ? AND is_public = 1')
      .bind(therapistId)
      .first<{ total: number }>(),
  ])

  const total = countRow?.total || 0
  const reviews = (rows.results as Review[]).map((r) => ({
    ...r,
    body_concerns: safeParseJson(r.body_concerns, []),
    ng_items: safeParseJson(r.ng_items, []),
  }))

  return c.json({
    ok: true,
    reviews,
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
  })
})

// ============================================
// GET /api/reviews/stats/:therapistId
// セラピスト評価統計（公開）
// ============================================
reviewsApp.get('/stats/:therapistId', async (c) => {
  const therapistId = c.req.param('therapistId')
  const db = c.env.DB

  const [statsRow, distributionRows, concernsRows] = await Promise.all([
    // 平均・件数
    db
      .prepare(`
        SELECT
          COUNT(*) as total_count,
          ROUND(AVG(rating), 1) as average_rating,
          COUNT(CASE WHEN rating = 5 THEN 1 END) as count_5,
          COUNT(CASE WHEN rating = 4 THEN 1 END) as count_4,
          COUNT(CASE WHEN rating = 3 THEN 1 END) as count_3,
          COUNT(CASE WHEN rating = 2 THEN 1 END) as count_2,
          COUNT(CASE WHEN rating = 1 THEN 1 END) as count_1
        FROM reviews
        WHERE therapist_id = ? AND is_public = 1
      `)
      .bind(therapistId)
      .first<{
        total_count: number
        average_rating: number | null
        count_5: number
        count_4: number
        count_3: number
        count_2: number
        count_1: number
      }>(),
    // 性別分布
    db
      .prepare(`
        SELECT customer_gender, COUNT(*) as count
        FROM reviews
        WHERE therapist_id = ? AND is_public = 1 AND customer_gender IS NOT NULL
        GROUP BY customer_gender
      `)
      .bind(therapistId)
      .all(),
    // 年齢層分布
    db
      .prepare(`
        SELECT customer_age_range, COUNT(*) as count
        FROM reviews
        WHERE therapist_id = ? AND is_public = 1 AND customer_age_range IS NOT NULL
        GROUP BY customer_age_range
      `)
      .bind(therapistId)
      .all(),
  ])

  const stats = statsRow || {
    total_count: 0,
    average_rating: null,
    count_5: 0,
    count_4: 0,
    count_3: 0,
    count_2: 0,
    count_1: 0,
  }

  return c.json({
    ok: true,
    stats: {
      total_count: stats.total_count,
      average_rating: stats.average_rating,
      rating_distribution: {
        5: stats.count_5,
        4: stats.count_4,
        3: stats.count_3,
        2: stats.count_2,
        1: stats.count_1,
      },
      gender_distribution: distributionRows.results,
      age_distribution: concernsRows.results,
    },
  })
})

// ============================================
// GET /api/reviews/my
// 自分が投稿したレビュー一覧（認証必須）
// ============================================
reviewsApp.get('/my', async (c) => {
  const payload = await verifyJwt(c.req.header('Authorization'), c.env.JWT_SECRET)
  if (!payload) {
    return c.json({ error: '認証が必要です' }, 401)
  }

  const userId = payload.userId || payload.sub
  const db = c.env.DB

  const rows = await db
    .prepare(`
      SELECT
        r.id, r.booking_id, r.therapist_id, r.rating, r.comment,
        r.customer_age_range, r.customer_gender, r.customer_occupation,
        r.body_concerns, r.ng_items, r.is_public,
        r.therapist_reply, r.therapist_replied_at,
        r.created_at, r.updated_at
      FROM reviews r
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `)
    .bind(userId)
    .all()

  const reviews = (rows.results as Review[]).map((r) => ({
    ...r,
    body_concerns: safeParseJson(r.body_concerns, []),
    ng_items: safeParseJson(r.ng_items, []),
  }))

  return c.json({ ok: true, reviews })
})

// ============================================
// GET /api/reviews/check/:bookingId
// 予約に対してレビュー済みか確認（認証必須）
// ============================================
reviewsApp.get('/check/:bookingId', async (c) => {
  const payload = await verifyJwt(c.req.header('Authorization'), c.env.JWT_SECRET)
  if (!payload) {
    return c.json({ error: '認証が必要です' }, 401)
  }

  const bookingId = c.req.param('bookingId')
  const userId = payload.userId || payload.sub
  const db = c.env.DB

  const existing = await db
    .prepare('SELECT id FROM reviews WHERE booking_id = ? AND user_id = ?')
    .bind(bookingId, userId)
    .first()

  return c.json({ ok: true, has_review: !!existing, review_id: existing?.id || null })
})

// ============================================
// PATCH /api/reviews/:reviewId/reply
// セラピストからの返信（セラピスト認証必須）
// ============================================
reviewsApp.patch('/:reviewId/reply', async (c) => {
  const payload = await verifyJwt(c.req.header('Authorization'), c.env.JWT_SECRET)
  if (!payload) {
    return c.json({ error: '認証が必要です' }, 401)
  }
  if (payload.role !== 'THERAPIST' && payload.role !== 'ADMIN') {
    return c.json({ error: 'セラピストのみ返信できます' }, 403)
  }

  const reviewId = c.req.param('reviewId')
  const body = await c.req.json().catch(() => null)
  if (!body?.reply) {
    return c.json({ error: '返信内容は必須です' }, 400)
  }

  const db = c.env.DB
  const therapistId = payload.userId || payload.sub

  // 自分のレビューかどうか確認
  const review = await db
    .prepare('SELECT id, therapist_id FROM reviews WHERE id = ?')
    .bind(reviewId)
    .first<{ id: string; therapist_id: string }>()

  if (!review) {
    return c.json({ error: 'レビューが見つかりません' }, 404)
  }
  if (payload.role !== 'ADMIN' && review.therapist_id !== therapistId) {
    return c.json({ error: 'このレビューへの返信権限がありません' }, 403)
  }

  const now = Date.now()
  await db
    .prepare('UPDATE reviews SET therapist_reply = ?, therapist_replied_at = ?, updated_at = ? WHERE id = ?')
    .bind(body.reply, now, now, reviewId)
    .run()

  return c.json({ ok: true, message: '返信を投稿しました' })
})

// ============================================
// GET /api/reviews/therapist-dashboard/:therapistId
// セラピストダッシュボード用レビュー一覧（認証必須・全件）
// ============================================
reviewsApp.get('/therapist-dashboard/:therapistId', async (c) => {
  const payload = await verifyJwt(c.req.header('Authorization'), c.env.JWT_SECRET)
  if (!payload) {
    return c.json({ error: '認証が必要です' }, 401)
  }

  const therapistId = c.req.param('therapistId')
  const userId = payload.userId || payload.sub

  // 自分のダッシュボードのみアクセス可能（ADMINは全員アクセス可）
  if (payload.role !== 'ADMIN' && userId !== therapistId) {
    return c.json({ error: 'アクセス権限がありません' }, 403)
  }

  const page = parseInt(c.req.query('page') || '1', 10)
  const limit = Math.min(parseInt(c.req.query('limit') || '20', 10), 100)
  const offset = (page - 1) * limit

  const db = c.env.DB

  const [rows, countRow] = await Promise.all([
    db
      .prepare(`
        SELECT
          r.id, r.booking_id, r.therapist_id, r.user_id, r.rating, r.comment,
          r.customer_age_range, r.customer_gender, r.customer_occupation,
          r.body_concerns, r.ng_items, r.is_public,
          r.therapist_reply, r.therapist_replied_at,
          r.created_at, r.updated_at
        FROM reviews r
        WHERE r.therapist_id = ?
        ORDER BY r.created_at DESC
        LIMIT ? OFFSET ?
      `)
      .bind(therapistId, limit, offset)
      .all(),
    db
      .prepare('SELECT COUNT(*) as total FROM reviews WHERE therapist_id = ?')
      .bind(therapistId)
      .first<{ total: number }>(),
  ])

  const total = countRow?.total || 0
  const reviews = (rows.results as Review[]).map((r) => ({
    ...r,
    body_concerns: safeParseJson(r.body_concerns, []),
    ng_items: safeParseJson(r.ng_items, []),
  }))

  return c.json({
    ok: true,
    reviews,
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
  })
})

// ============================================
// ユーティリティ
// ============================================
function safeParseJson(value: string | null | undefined, fallback: unknown): unknown {
  if (!value) return fallback
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

export default reviewsApp
