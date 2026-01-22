/**
 * 施設管理API（管理者用）
 * - 施設の作成、更新、削除
 * - 一括操作（非表示化、アーカイブ）
 */

import { Hono } from 'hono';
import { verifyJWT } from './auth-middleware';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings; Variables: { userId: string; role: string } }>();

// 全てのルートで管理者認証を要求
app.use('*', async (c, next) => {
  try {
    const authHeader = c.req.header('Authorization');
    console.log('[admin-sites] Auth header:', authHeader?.substring(0, 30));
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: '認証トークンが必要です' }, 401);
    }
    
    const token = authHeader.substring(7);
    console.log('[admin-sites] Token extracted, length:', token.length);
    
    const payload = await verifyJWT(token, c.env.JWT_SECRET);
    console.log('[admin-sites] JWT payload:', payload);
    
    if (!payload || payload.role !== 'ADMIN') {
      console.log('[admin-sites] Authorization failed. Payload role:', payload?.role);
      return c.json({ error: '管理者権限が必要です' }, 403);
    }
    
    c.set('userId', payload.userId);
    c.set('role', payload.role);
    console.log('[admin-sites] Auth successful. Role set to:', payload.role);
    await next();
  } catch (error) {
    console.error('[admin-sites] JWT verification error:', error);
    return c.json({ error: '認証に失敗しました' }, 401);
  }
});

// ============================================
// 施設一覧取得（管理者用 - 全ステータス）
// ============================================
app.get('/', async (c) => {
  const { DB } = c.env;
  
  // 管理者チェックは既にミドルウェアで済んでいる
  const role = c.get('role');
  if (role !== 'ADMIN') {
    return c.json({ error: 'Unauthorized' }, 403);
  }
  
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '100');
  const search = c.req.query('search') || '';
  const area = c.req.query('area') || '';
  const type = c.req.query('type') || '';
  const status = c.req.query('status') || '';
  
  const offset = (page - 1) * limit;
  
  try {
    const conditions: string[] = ['1=1'];
    const params: any[] = [];
    
    if (status) {
      conditions.push('s.status = ?');
      params.push(status);
    }
    
    if (search) {
      conditions.push('(s.name LIKE ? OR s.address LIKE ? OR s.id LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (area) {
      conditions.push('s.area_code = ?');
      params.push(area);
    }
    
    if (type) {
      conditions.push('s.type = ?');
      params.push(type);
    }
    
    const whereClause = conditions.join(' AND ');
    
    // 総数取得
    const countQuery = `SELECT COUNT(*) as total FROM sites s WHERE ${whereClause}`;
    const countResult = await DB.prepare(countQuery).bind(...params).first<{ total: number }>();
    const total = countResult?.total || 0;
    
    // データ取得
    const query = `
      SELECT 
        s.id,
        s.name,
        s.type,
        s.address,
        s.area_code,
        s.latitude,
        s.longitude,
        s.room_count,
        s.amenities,
        s.status,
        s.image_url,
        s.host_id,
        s.created_at,
        s.updated_at,
        u.name as host_name
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
  } catch (error: any) {
    console.error('Error fetching sites:', error);
    return c.json({ error: 'Failed to fetch sites', details: error.message }, 500);
  }
});

// ============================================
// 施設詳細取得
// ============================================
app.get('/:id', async (c) => {
  const { DB } = c.env;
  const siteId = c.req.param('id');
  
  try {
    const query = `
      SELECT 
        s.*,
        u.name as host_name,
        u.email as host_email
      FROM sites s
      LEFT JOIN users u ON s.host_id = u.id
      WHERE s.id = ?
    `;
    
    const site = await DB.prepare(query).bind(siteId).first();
    
    if (!site) {
      return c.json({ error: 'Site not found' }, 404);
    }
    
    return c.json({ site });
  } catch (error: any) {
    console.error('Error fetching site:', error);
    return c.json({ error: 'Failed to fetch site', details: error.message }, 500);
  }
});

// ============================================
// 施設作成
// ============================================
app.post('/', async (c) => {
  const { DB } = c.env;
  
  const role = c.get('role');
  if (role !== 'ADMIN') {
    return c.json({ error: 'Unauthorized' }, 403);
  }
  
  try {
    const body = await c.req.json();
    const {
      id,
      name,
      type,
      address,
      area_code,
      latitude,
      longitude,
      room_count,
      amenities,
      status,
      image_url,
      description,
      host_id
    } = body;
    
    // 必須フィールドのチェック
    if (!id || !name || !type || !address) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    const query = `
      INSERT INTO sites (
        id, name, type, address, area_code, latitude, longitude,
        room_count, amenities, status, image_url, description, host_id,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `;
    
    await DB.prepare(query).bind(
      id,
      name,
      type,
      address,
      area_code || '',
      latitude || 0,
      longitude || 0,
      room_count || 0,
      amenities || '[]',
      status || 'PENDING',
      image_url || '',
      description || '',
      host_id || 'system'
    ).run();
    
    return c.json({ success: true, id }, 201);
  } catch (error: any) {
    console.error('Error creating site:', error);
    return c.json({ error: 'Failed to create site', details: error.message }, 500);
  }
});

// ============================================
// 施設更新
// ============================================
app.put('/:id', async (c) => {
  const { DB } = c.env;
  const siteId = c.req.param('id');
  
  const role = c.get('role');
  if (role !== 'ADMIN') {
    return c.json({ error: 'Unauthorized' }, 403);
  }
  
  try {
    const body = await c.req.json();
    
    // 動的にUPDATE文を構築
    const fields: string[] = [];
    const values: any[] = [];
    
    const allowedFields = [
      'name', 'type', 'address', 'area_code', 'latitude', 'longitude',
      'room_count', 'amenities', 'status', 'image_url', 'description', 'host_id'
    ];
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(body[field]);
      }
    }
    
    if (fields.length === 0) {
      return c.json({ error: 'No fields to update' }, 400);
    }
    
    fields.push('updated_at = datetime(\'now\')');
    values.push(siteId);
    
    const query = `UPDATE sites SET ${fields.join(', ')} WHERE id = ?`;
    await DB.prepare(query).bind(...values).run();
    
    return c.json({ success: true });
  } catch (error: any) {
    console.error('Error updating site:', error);
    return c.json({ error: 'Failed to update site', details: error.message }, 500);
  }
});

// ============================================
// 施設削除
// ============================================
app.delete('/:id', async (c) => {
  const { DB } = c.env;
  const siteId = c.req.param('id');
  
  const role = c.get('role');
  if (role !== 'ADMIN') {
    return c.json({ error: 'Unauthorized' }, 403);
  }
  
  try {
    await DB.prepare('DELETE FROM sites WHERE id = ?').bind(siteId).run();
    return c.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting site:', error);
    return c.json({ error: 'Failed to delete site', details: error.message }, 500);
  }
});

// ============================================
// 一括非表示化
// ============================================
app.post('/bulk/hide', async (c) => {
  const { DB } = c.env;
  
  const role = c.get('role');
  if (role !== 'ADMIN') {
    return c.json({ error: 'Unauthorized' }, 403);
  }
  
  try {
    const { ids } = await c.req.json();
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return c.json({ error: 'Invalid site IDs' }, 400);
    }
    
    const placeholders = ids.map(() => '?').join(',');
    const query = `UPDATE sites SET status = 'HIDDEN', updated_at = datetime('now') WHERE id IN (${placeholders})`;
    
    await DB.prepare(query).bind(...ids).run();
    
    return c.json({ success: true, count: ids.length });
  } catch (error: any) {
    console.error('Error hiding sites:', error);
    return c.json({ error: 'Failed to hide sites', details: error.message }, 500);
  }
});

// ============================================
// 一括アーカイブ（削除）
// ============================================
app.post('/bulk/archive', async (c) => {
  const { DB } = c.env;
  
  const role = c.get('role');
  if (role !== 'ADMIN') {
    return c.json({ error: 'Unauthorized' }, 403);
  }
  
  try {
    const { ids } = await c.req.json();
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return c.json({ error: 'Invalid site IDs' }, 400);
    }
    
    const placeholders = ids.map(() => '?').join(',');
    const query = `DELETE FROM sites WHERE id IN (${placeholders})`;
    
    await DB.prepare(query).bind(...ids).run();
    
    return c.json({ success: true, count: ids.length });
  } catch (error: any) {
    console.error('Error archiving sites:', error);
    return c.json({ error: 'Failed to archive sites', details: error.message }, 500);
  }
});

export default app;
