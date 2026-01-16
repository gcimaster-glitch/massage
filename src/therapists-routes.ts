/**
 * セラピスト管理API
 * - セラピスト一覧取得（検索、フィルタリング対応）
 * - セラピスト詳細取得
 * - セラピストのメニュー取得
 * - セラピストのスケジュール取得
 */

import { Hono } from 'hono';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// ============================================
// セラピスト一覧取得（パブリック）
// ============================================
app.get('/', async (c) => {
  const { DB } = c.env;
  
  // クエリパラメータ
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const search = c.req.query('search') || '';
  const area = c.req.query('area') || '';
  const specialty = c.req.query('specialty') || '';
  const minRating = parseFloat(c.req.query('minRating') || '0');
  
  const offset = (page - 1) * limit;
  
  try {
    // WHERE句の構築
    const conditions: string[] = ["tp.status = 'APPROVED'"];
    const params: any[] = [];
    
    if (search) {
      conditions.push('(u.name LIKE ? OR tp.bio LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (area) {
      conditions.push('tp.approved_areas LIKE ?');
      params.push(`%${area}%`);
    }
    
    if (specialty) {
      conditions.push('tp.specialties LIKE ?');
      params.push(`%${specialty}%`);
    }
    
    if (minRating > 0) {
      conditions.push('tp.rating >= ?');
      params.push(minRating);
    }
    
    const whereClause = conditions.join(' AND ');
    
    // 総数取得
    const countQuery = `
      SELECT COUNT(*) as total
      FROM therapist_profiles tp
      JOIN users u ON tp.user_id = u.id
      WHERE ${whereClause}
    `;
    const countResult = await DB.prepare(countQuery).bind(...params).first<{ total: number }>();
    const total = countResult?.total || 0;
    
    // データ取得
    const query = `
      SELECT 
        tp.user_id as id,
        u.name,
        u.avatar_url,
        tp.bio,
        tp.specialties,
        tp.experience_years,
        tp.rating,
        tp.review_count,
        tp.approved_areas,
        o.name as office_name
      FROM therapist_profiles tp
      JOIN users u ON tp.user_id = u.id
      LEFT JOIN offices o ON tp.office_id = o.id
      WHERE ${whereClause}
      ORDER BY tp.rating DESC, tp.review_count DESC
      LIMIT ? OFFSET ?
    `;
    
    const result = await DB.prepare(query).bind(...params, limit, offset).all();
    
    return c.json({
      therapists: result.results || [],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error: any) {
    console.error('Error fetching therapists:', error);
    return c.json({ error: 'セラピストの取得に失敗しました' }, 500);
  }
});

// ============================================
// セラピスト詳細取得（パブリック）
// ============================================
app.get('/:id', async (c) => {
  const { DB } = c.env;
  const therapistId = c.req.param('id');
  
  try {
    // セラピスト情報取得
    const therapistQuery = `
      SELECT 
        tp.*,
        tp.user_id as id,
        u.name,
        u.avatar_url,
        u.email,
        o.name as office_name
      FROM therapist_profiles tp
      JOIN users u ON tp.user_id = u.id
      LEFT JOIN offices o ON tp.office_id = o.id
      WHERE tp.user_id = ?
    `;
    
    const therapist = await DB.prepare(therapistQuery).bind(therapistId).first();
    
    if (!therapist) {
      return c.json({ error: 'セラピストが見つかりません' }, 404);
    }
    
    // メニュー取得
    const menuQuery = `
      SELECT 
        tm.id,
        tm.price,
        tm.is_available,
        mc.name as course_name,
        mc.duration,
        mc.description
      FROM therapist_menu tm
      JOIN master_courses mc ON tm.master_course_id = mc.id
      WHERE tm.therapist_id = ? AND tm.is_available = 1
      ORDER BY mc.duration
    `;
    
    const menuResult = await DB.prepare(menuQuery).bind(therapistId).all();
    
    // オプション取得
    const optionsQuery = `
      SELECT 
        topt.id,
        topt.price,
        topt.is_available,
        mo.name as option_name,
        mo.description,
        mo.duration
      FROM therapist_options topt
      JOIN master_options mo ON topt.master_option_id = mo.id
      WHERE topt.therapist_id = ? AND topt.is_available = 1
      ORDER BY mo.name
    `;
    
    const optionsResult = await DB.prepare(optionsQuery).bind(therapistId).all();
    
    // レビュー取得（最新5件）
    const reviewsQuery = `
      SELECT 
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        u.name as user_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.therapist_id = ? AND r.is_public = 1
      ORDER BY r.created_at DESC
      LIMIT 5
    `;
    
    const reviewsResult = await DB.prepare(reviewsQuery).bind(therapistId).all();
    
    return c.json({
      therapist,
      menu: menuResult.results || [],
      options: optionsResult.results || [],
      reviews: reviewsResult.results || []
    });
  } catch (error: any) {
    console.error('Error fetching therapist detail:', error);
    return c.json({ 
      error: 'セラピストの取得に失敗しました',
      details: error.message || String(error)
    }, 500);
  }
});

// ============================================
// セラピストのスケジュール取得（パブリック）
// ============================================
app.get('/:id/schedule', async (c) => {
  const { DB } = c.env;
  const therapistId = c.req.param('id');
  const date = c.req.query('date') || new Date().toISOString().split('T')[0];
  
  try {
    // その日の予約状況を取得
    const query = `
      SELECT 
        scheduled_at,
        duration,
        status
      FROM bookings
      WHERE therapist_id = ? 
        AND DATE(scheduled_at) = ?
        AND status IN ('CONFIRMED', 'IN_PROGRESS')
      ORDER BY scheduled_at
    `;
    
    const result = await DB.prepare(query).bind(therapistId, date).all();
    
    return c.json({
      date,
      bookings: result.results || []
    });
  } catch (error: any) {
    console.error('Error fetching therapist schedule:', error);
    return c.json({ error: 'スケジュールの取得に失敗しました' }, 500);
  }
});

// ============================================
// セラピストのメニュー取得（予約フロー用）
// ============================================
app.get('/:id/menu', async (c) => {
  const { DB } = c.env;
  const therapistId = c.req.param('id');
  
  try {
    // コース取得
    const coursesQuery = `
      SELECT 
        mc.id,
        mc.name,
        mc.duration,
        mc.description,
        tm.price as base_price,
        tm.is_available
      FROM therapist_menu tm
      JOIN master_courses mc ON tm.master_course_id = mc.id
      WHERE tm.therapist_id = ? AND tm.is_available = 1
      ORDER BY mc.duration
    `;
    
    const coursesResult = await DB.prepare(coursesQuery).bind(therapistId).all();
    
    // オプション取得
    const optionsQuery = `
      SELECT 
        mo.id,
        mo.name,
        mo.duration,
        mo.description,
        topt.price as base_price,
        topt.is_available
      FROM therapist_options topt
      JOIN master_options mo ON topt.master_option_id = mo.id
      WHERE topt.therapist_id = ? AND topt.is_available = 1
      ORDER BY mo.name
    `;
    
    const optionsResult = await DB.prepare(optionsQuery).bind(therapistId).all();
    
    return c.json({
      courses: coursesResult.results || [],
      options: optionsResult.results || []
    });
  } catch (error: any) {
    console.error('Error fetching therapist menu:', error);
    return c.json({ error: 'メニューの取得に失敗しました' }, 500);
  }
});

export default app;
