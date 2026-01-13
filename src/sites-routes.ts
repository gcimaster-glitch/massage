import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
}

const sitesApp = new Hono<{ Bindings: Bindings }>()

// ============================================
// Sites Routes (施設一覧・検索)
// ============================================

/**
 * GET /api/sites
 * 施設一覧を取得（CARE CUBE + 施設ホスト）
 * クエリパラメータ:
 *   - area: エリアでフィルタ (例: TOKYO_STATION, SHINJUKU)
 *   - type: 施設タイプでフィルタ (HOTEL, CARE_CUBE, PRIVATE_SPACE)
 *   - search: 名前・住所で検索
 */
sitesApp.get('/', async (c) => {
  const area = c.req.query('area')
  const type = c.req.query('type')
  const search = c.req.query('search')
  
  try {
    if (!c.env.DB) {
      return c.json([])
    }
    
    let query = `
      SELECT s.id, s.name, s.type, s.address, 
             COALESCE(s.area_code, s.area) as area, 
             COALESCE(s.latitude, s.lat) as lat, 
             COALESCE(s.longitude, s.lng) as lng, 
             s.host_id, s.cube_serial_number, 
             COALESCE(s.status, s.is_active) as is_active,
             u.name as host_name
      FROM sites s
      LEFT JOIN users u ON s.host_id = u.id
      WHERE (s.is_active = TRUE OR s.is_active IS NULL)
    `
    const params: any[] = []
    
    if (area) {
      query += ' AND (s.area = ? OR s.area_code = ?)'
      params.push(area, area)
    }
    
    if (type) {
      query += ' AND s.type = ?'
      params.push(type)
    }
    
    if (search) {
      query += ' AND (s.name LIKE ? OR s.address LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }
    
    query += ' ORDER BY s.type, s.name LIMIT 100'
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all()
    return c.json(results)
  } catch (e) {
    console.error('Sites API error:', e)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

/**
 * GET /api/sites/:id
 * 施設詳細を取得
 */
sitesApp.get('/:id', async (c) => {
  const id = c.req.param('id')
  
  try {
    if (!c.env.DB) {
      return c.json({ error: 'Database not available' }, 503)
    }
    
    const { results } = await c.env.DB.prepare(`
      SELECT s.*, u.name as host_name, u.email as host_email, u.phone as host_phone
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

/**
 * GET /api/sites/stats
 * 施設統計情報を取得
 */
sitesApp.get('/stats', async (c) => {
  try {
    if (!c.env.DB) {
      return c.json({ error: 'Database not available' }, 503)
    }
    
    const { results } = await c.env.DB.prepare(`
      SELECT 
        type,
        COUNT(*) as count,
        COUNT(DISTINCT area) as areas_covered
      FROM sites
      WHERE is_active = TRUE
      GROUP BY type
    `).all()
    
    return c.json(results)
  } catch (e) {
    console.error('Sites stats error:', e)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default sitesApp
