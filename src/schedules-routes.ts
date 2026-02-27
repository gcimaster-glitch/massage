/**
 * セラピストスケジュール管理API
 * - スケジュール作成
 * - スケジュール一覧取得
 * - スケジュール更新
 * - スケジュール削除
 * - 空き時間計算
 */

import { Hono } from 'hono';
import { verifyJWT } from './auth-middleware';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// 認証必須ミドルウェア
const requireAuth = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: '認証が必要です' }, 401);
  }

  const token = authHeader.substring(7);
  const payload = await verifyJWT(token, c.env.JWT_SECRET);

  if (!payload) {
    return c.json({ error: '無効なトークンです' }, 401);
  }

  c.set('userId', payload.userId);
  c.set('userRole', payload.role);
  await next();
};

// すべてのルートに認証必須
app.use('/*', requireAuth);

// ============================================
// スケジュール作成
// ============================================
app.post('/', async (c) => {
  const { DB } = c.env;
  const userId = c.get('userId');
  const userRole = c.get('userRole');
  
  try {
    // セラピストまたは管理者のみ
    if (userRole !== 'THERAPIST' && userRole !== 'ADMIN') {
      return c.json({ error: '権限がありません' }, 403);
    }

    const body = await c.req.json();
    const {
      therapist_id,
      day_of_week, // 0=日曜, 1=月曜, ..., 6=土曜
      start_time,  // HH:MM 形式
      end_time,    // HH:MM 形式
      is_available = true
    } = body;
    
    // バリデーション
    if (!therapist_id || day_of_week === undefined || !start_time || !end_time) {
      return c.json({ error: '必須項目が不足しています' }, 400);
    }
    
    // 重複チェック
    const existingQuery = `
      SELECT * FROM therapist_schedules
      WHERE therapist_id = ? AND day_of_week = ?
        AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?))
    `;
    
    const existing = await DB.prepare(existingQuery)
      .bind(therapist_id, day_of_week, start_time, start_time, end_time, end_time)
      .first();
    
    if (existing) {
      return c.json({ error: 'この時間帯は既に登録されています' }, 400);
    }
    
    // スケジュールIDを生成
    const scheduleId = `schedule_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // スケジュールを作成
    const insertQuery = `
      INSERT INTO therapist_schedules (
        id, therapist_id, day_of_week, start_time, end_time, is_available, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `;
    
    await DB.prepare(insertQuery).bind(
      scheduleId,
      therapist_id,
      day_of_week,
      start_time,
      end_time,
      is_available ? 1 : 0
    ).run();
    
    return c.json({
      success: true,
      schedule_id: scheduleId,
      message: 'スケジュールを作成しました'
    }, 201);
  } catch (error: unknown) {
    console.error('Error creating schedule:', error);
    return c.json({ error: 'スケジュールの作成に失敗しました' }, 500);
  }
});

// ============================================
// スケジュール一覧取得
// ============================================
app.get('/', async (c) => {
  const { DB } = c.env;
  const userId = c.get('userId');
  const therapistId = c.req.query('therapist_id');
  const dayOfWeek = c.req.query('day_of_week');
  
  try {
    let query = 'SELECT * FROM therapist_schedules WHERE 1=1';
    const params: any[] = [];
    
    if (therapistId) {
      query += ' AND therapist_id = ?';
      params.push(therapistId);
    }
    
    if (dayOfWeek !== undefined) {
      query += ' AND day_of_week = ?';
      params.push(parseInt(dayOfWeek));
    }
    
    query += ' ORDER BY day_of_week, start_time';
    
    const result = await DB.prepare(query).bind(...params).all();
    
    return c.json({
      schedules: result.results || []
    });
  } catch (error: unknown) {
    console.error('Error fetching schedules:', error);
    return c.json({ error: 'スケジュールの取得に失敗しました' }, 500);
  }
});

// ============================================
// スケジュール削除
// ============================================
app.delete('/:id', async (c) => {
  const { DB } = c.env;
  const userId = c.get('userId');
  const userRole = c.get('userRole');
  const scheduleId = c.req.param('id');
  
  try {
    // セラピストまたは管理者のみ
    if (userRole !== 'THERAPIST' && userRole !== 'ADMIN') {
      return c.json({ error: '権限がありません' }, 403);
    }

    await DB.prepare(
      'DELETE FROM therapist_schedules WHERE id = ?'
    ).bind(scheduleId).run();
    
    return c.json({ 
      success: true,
      message: 'スケジュールを削除しました'
    });
  } catch (error: unknown) {
    console.error('Error deleting schedule:', error);
    return c.json({ error: 'スケジュールの削除に失敗しました' }, 500);
  }
});

export default app;
