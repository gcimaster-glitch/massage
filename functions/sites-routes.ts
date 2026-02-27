/**
 * 施設（Sites）管理API
 * - 施設一覧取得（検索、フィルタリング対応）
 * - 施設詳細取得
 * - 施設の部屋一覧取得
 */

import { Hono } from 'hono';
import { verifyJWT } from './auth-middleware';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// ============================================
// 施設一覧取得（パブリック）
// ============================================
app.get('/', async (c) => {
  const { DB } = c.env;
  
  // クエリパラメータ
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const search = c.req.query('search') || '';
  const area = c.req.query('area') || '';
  const type = c.req.query('type') || '';
  const status = c.req.query('status') || '';
  
  const offset = (page - 1) * limit;
  
  try {
    // WHERE句の構築
    const conditions: string[] = ['1=1'];
    const params: any[] = [];
    
    if (status) {
      conditions.push('s.status = ?');
      params.push(status);
    }
    
    if (search) {
      conditions.push('(s.name LIKE ? OR s.address LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (area) {
      conditions.push('s.area = ?');
      params.push(area);
    }
    
    if (type) {
      conditions.push('s.type = ?');
      params.push(type);
    }
    
    const whereClause = conditions.join(' AND ');
    
    // 総数取得
    const countQuery = `
      SELECT COUNT(*) as total
      FROM sites s
      WHERE ${whereClause}
    `;
    const countResult = await DB.prepare(countQuery).bind(...params).first<{ total: number }>();
    const total = countResult?.total || 0;
    
    // データ取得
    const query = `
      SELECT 
        s.id,
        s.name,
        s.type,
        s.address,
        s.area_code as area,
        s.latitude as lat,
        s.longitude as lng,
        s.latitude,
        s.longitude,
        s.room_count,
        s.amenities,
        s.status,
        s.created_at,
        s.image_url,
        u.name as host_name,
        (SELECT COUNT(*) FROM site_rooms WHERE site_id = s.id AND is_available = 1) as available_rooms
      FROM sites s
      LEFT JOIN users u ON s.host_id = u.id
      WHERE ${whereClause}
      ORDER BY s.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const result = await DB.prepare(query).bind(...params, limit, offset).all();
    
    return c.json({
      sites: result.results || [],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error: unknown) {
    console.error('Error fetching sites:', error);
    return c.json({ error: '施設の取得に失敗しました' }, 500);
  }
});

// ============================================
// 施設詳細取得（パブリック）
// ============================================
app.get('/:id', async (c) => {
  const { DB } = c.env;
  const siteId = c.req.param('id');
  
  try {
    // 施設情報取得
    const siteQuery = `
      SELECT 
        s.*,
        s.latitude as lat,
        s.longitude as lng,
        u.name as host_name,
        u.email as host_email,
        u.phone as host_phone
      FROM sites s
      LEFT JOIN users u ON s.host_id = u.id
      WHERE s.id = ?
    `;
    
    const site = await DB.prepare(siteQuery).bind(siteId).first();
    
    if (!site) {
      return c.json({ error: '施設が見つかりません' }, 404);
    }
    
    // 部屋一覧取得
    const roomsQuery = `
      SELECT *
      FROM site_rooms
      WHERE site_id = ? AND is_available = 1
      ORDER BY room_number
    `;
    
    const roomsResult = await DB.prepare(roomsQuery).bind(siteId).all();
    
    return c.json({
      site,
      rooms: roomsResult.results || []
    });
  } catch (error: unknown) {
    console.error('Error fetching site detail:', error);
    return c.json({ error: '施設の取得に失敗しました' }, 500);
  }
});

// ============================================
// 施設の利用可能セラピスト一覧（パブリック）
// ============================================
app.get('/:id/therapists', async (c) => {
  const { DB } = c.env;
  const siteId = c.req.param('id');
  
  try {
    // この施設で施術可能なセラピストを取得
    const query = `
      SELECT DISTINCT
        tp.id,
        u.name,
        u.avatar_url,
        tp.bio,
        tp.rating,
        tp.review_count,
        tp.specialties
      FROM therapist_profiles tp
      JOIN users u ON tp.user_id = u.id
      WHERE tp.status = 'APPROVED'
        AND tp.approved_areas LIKE ?
      ORDER BY tp.rating DESC, tp.review_count DESC
    `;
    
    // 施設のエリアを取得
    const site = await DB.prepare('SELECT area FROM sites WHERE id = ?').bind(siteId).first<{ area: string }>();
    
    if (!site) {
      return c.json({ error: '施設が見つかりません' }, 404);
    }
    
    const result = await DB.prepare(query).bind(`%${site.area}%`).all();
    
    return c.json({
      therapists: result.results || []
    });
  } catch (error: unknown) {
    console.error('Error fetching site therapists:', error);
    return c.json({ error: 'セラピストの取得に失敗しました' }, 500);
  }
});

export default app;
