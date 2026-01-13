import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
}

const officesApp = new Hono<{ Bindings: Bindings }>()

// ============================================
// Offices Routes (事務所一覧・詳細)
// ============================================

/**
 * GET /api/offices
 * セラピスト事務所一覧を取得
 */
officesApp.get('/', async (c) => {
  try {
    if (!c.env.DB) {
      return c.json([])
    }
    
    const { results } = await c.env.DB.prepare(`
      SELECT 
        to.id, to.name, to.area, to.manager_name, to.contact_email,
        to.commission_rate, 
        (SELECT COUNT(*) FROM therapist_profiles WHERE office_id = to.id) as therapist_count
      FROM therapist_offices to
      ORDER BY therapist_count DESC
    `).all()
    
    return c.json(results)
  } catch (e) {
    console.error('Offices API error:', e)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * GET /api/offices/:id
 * 事務所詳細と所属セラピスト一覧を取得
 */
officesApp.get('/:id', async (c) => {
  const id = c.req.param('id')
  
  try {
    if (!c.env.DB) {
      return c.json({ error: 'Database not available' }, 503)
    }
    
    // 事務所情報
    const { results: offices } = await c.env.DB.prepare(`
      SELECT to.*
      FROM therapist_offices to
      WHERE to.id = ?
    `).bind(id).all()
    
    if (offices.length === 0) {
      return c.json({ error: 'Office not found' }, 404)
    }
    
    // 所属セラピスト一覧
    const { results: therapists } = await c.env.DB.prepare(`
      SELECT u.id, u.name, u.avatar_url, tp.rating, tp.review_count,
             tp.specialties, tp.approved_areas, tp.bio
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

/**
 * GET /api/offices/:id/stats
 * 事務所の統計情報を取得
 */
officesApp.get('/:id/stats', async (c) => {
  const id = c.req.param('id')
  
  try {
    if (!c.env.DB) {
      return c.json({ error: 'Database not available' }, 503)
    }
    
    // セラピスト数
    const { results: therapistCount } = await c.env.DB.prepare(`
      SELECT COUNT(*) as count
      FROM therapist_profiles
      WHERE office_id = ?
    `).bind(id).all()
    
    // 平均評価
    const { results: avgRating } = await c.env.DB.prepare(`
      SELECT AVG(rating) as avg_rating, SUM(review_count) as total_reviews
      FROM therapist_profiles
      WHERE office_id = ?
    `).bind(id).all()
    
    // 予約数（過去30日）
    const { results: bookingCount } = await c.env.DB.prepare(`
      SELECT COUNT(*) as count
      FROM bookings
      WHERE office_id = ? AND created_at >= datetime('now', '-30 days')
    `).bind(id).all()
    
    return c.json({
      therapist_count: therapistCount[0]?.count || 0,
      avg_rating: avgRating[0]?.avg_rating || 0,
      total_reviews: avgRating[0]?.total_reviews || 0,
      bookings_last_30_days: bookingCount[0]?.count || 0
    })
  } catch (e) {
    console.error('Office stats error:', e)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default officesApp
