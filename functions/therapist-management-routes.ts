import { Hono } from 'hono';
import { requireAuth as requireAuthentication } from './auth-middleware';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// JWT認証ミドルウェア（統一版）
const requireAuth = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  const authResult = await requireAuthentication(authHeader, c.env.JWT_SECRET);
  
  if (!authResult.success) {
    return c.json({ error: authResult.error || '認証が必要です' }, 401);
  }

  c.set('userId', authResult.user.userId);
  c.set('role', authResult.user.role);
  await next();
};

// ============================================
// プロフィール管理
// ============================================

// プロフィール取得
app.get('/profile', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');

    // ユーザー情報とセラピストプロフィールを取得
    const user = await c.env.DB.prepare(`
      SELECT u.*, tp.*
      FROM users u
      LEFT JOIN therapist_profiles tp ON u.id = tp.user_id
      WHERE u.id = ?
    `).bind(userId).first();

    if (!user) {
      return c.json({ error: 'ユーザーが見つかりません' }, 404);
    }

    return c.json({
      profile: {
        id: user.id,
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar_url: user.avatar_url,
        bio: user.bio,
        specialties: user.specialties ? JSON.parse(user.specialties) : [],
        experience_years: user.experience_years || 0,
        certifications: user.certifications ? JSON.parse(user.certifications) : [],
        rating: user.rating || 0,
        review_count: user.review_count || 0,
        approved_areas: user.approved_areas ? JSON.parse(user.approved_areas) : [],
        status: user.status || 'PENDING',
        commission_rate: user.commission_rate || 70,
      }
    });
  } catch (error) {
    console.error('プロフィール取得エラー:', error);
    return c.json({ error: 'プロフィールの取得に失敗しました' }, 500);
  }
});

// プロフィール更新
app.put('/profile', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();

    // ユーザー情報を更新
    await c.env.DB.prepare(`
      UPDATE users 
      SET name = ?, email = ?, phone = ?
      WHERE id = ?
    `).bind(body.name, body.email, body.phone, userId).run();

    // セラピストプロフィールを更新
    await c.env.DB.prepare(`
      UPDATE therapist_profiles 
      SET bio = ?, 
          specialties = ?, 
          experience_years = ?,
          certifications = ?
      WHERE user_id = ?
    `).bind(
      body.bio,
      JSON.stringify(body.specialties || []),
      body.experience_years || 0,
      JSON.stringify(body.certifications || []),
      userId
    ).run();

    return c.json({ 
      success: true, 
      message: 'プロフィールを更新しました' 
    });
  } catch (error) {
    console.error('プロフィール更新エラー:', error);
    return c.json({ error: 'プロフィールの更新に失敗しました' }, 500);
  }
});

// ============================================
// メニュー管理
// ============================================

// メニュー取得
app.get('/menu', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');

    // セラピストプロフィールIDを取得
    const therapistProfile = await c.env.DB.prepare(`
      SELECT id FROM therapist_profiles WHERE user_id = ?
    `).bind(userId).first();

    if (!therapistProfile) {
      return c.json({ error: 'セラピストプロフィールが見つかりません' }, 404);
    }

    // コース取得
    const courses = await c.env.DB.prepare(`
      SELECT * FROM therapist_menu_courses 
      WHERE therapist_profile_id = ? AND is_active = 1
      ORDER BY display_order
    `).bind(therapistProfile.id).all();

    // オプション取得
    const options = await c.env.DB.prepare(`
      SELECT * FROM therapist_menu_options 
      WHERE therapist_profile_id = ? AND is_active = 1
      ORDER BY display_order
    `).bind(therapistProfile.id).all();

    return c.json({
      courses: courses.results || [],
      options: options.results || [],
    });
  } catch (error) {
    console.error('メニュー取得エラー:', error);
    return c.json({ error: 'メニューの取得に失敗しました' }, 500);
  }
});

// コース更新
app.put('/menu/courses', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { courses } = await c.req.json();

    // セラピストプロフィールIDを取得
    const therapistProfile = await c.env.DB.prepare(`
      SELECT id FROM therapist_profiles WHERE user_id = ?
    `).bind(userId).first();

    if (!therapistProfile) {
      return c.json({ error: 'セラピストプロフィールが見つかりません' }, 404);
    }

    // 既存のコースを削除
    await c.env.DB.prepare(`
      DELETE FROM therapist_menu_courses WHERE therapist_profile_id = ?
    `).bind(therapistProfile.id).run();

    // 新しいコースを挿入
    for (let i = 0; i < courses.length; i++) {
      const course = courses[i];
      await c.env.DB.prepare(`
        INSERT INTO therapist_menu_courses (
          id, therapist_profile_id, name, duration, price, description, display_order, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)
      `).bind(
        course.id,
        therapistProfile.id,
        course.name,
        course.duration,
        course.price,
        course.description || '',
        i
      ).run();
    }

    return c.json({ 
      success: true, 
      message: 'コース情報を更新しました' 
    });
  } catch (error) {
    console.error('コース更新エラー:', error);
    return c.json({ error: 'コースの更新に失敗しました' }, 500);
  }
});

// オプション更新
app.put('/menu/options', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { options } = await c.req.json();

    // セラピストプロフィールIDを取得
    const therapistProfile = await c.env.DB.prepare(`
      SELECT id FROM therapist_profiles WHERE user_id = ?
    `).bind(userId).first();

    if (!therapistProfile) {
      return c.json({ error: 'セラピストプロフィールが見つかりません' }, 404);
    }

    // 既存のオプションを削除
    await c.env.DB.prepare(`
      DELETE FROM therapist_menu_options WHERE therapist_profile_id = ?
    `).bind(therapistProfile.id).run();

    // 新しいオプションを挿入
    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      await c.env.DB.prepare(`
        INSERT INTO therapist_menu_options (
          id, therapist_profile_id, name, price, description, display_order, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, 1)
      `).bind(
        option.id,
        therapistProfile.id,
        option.name,
        option.price,
        option.description || '',
        i
      ).run();
    }

    return c.json({ 
      success: true, 
      message: 'オプション情報を更新しました' 
    });
  } catch (error) {
    console.error('オプション更新エラー:', error);
    return c.json({ error: 'オプションの更新に失敗しました' }, 500);
  }
});

// ============================================
// 予約管理
// ============================================

// 予約一覧取得（セラピスト向け）
app.get('/bookings', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');

    // セラピストプロフィールIDを取得
    const therapistProfile = await c.env.DB.prepare(`
      SELECT id FROM therapist_profiles WHERE user_id = ?
    `).bind(userId).first();

    if (!therapistProfile) {
      return c.json({ error: 'セラピストプロフィールが見つかりません' }, 404);
    }

    // 予約を取得
    const bookings = await c.env.DB.prepare(`
      SELECT 
        b.*,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone,
        s.name as site_name,
        s.address as site_address
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN sites s ON b.site_id = s.id
      WHERE b.therapist_id = ?
      ORDER BY b.scheduled_at DESC
      LIMIT 100
    `).bind(therapistProfile.id).all();

    return c.json({
      bookings: bookings.results || [],
      total: bookings.results?.length || 0,
    });
  } catch (error) {
    console.error('予約取得エラー:', error);
    return c.json({ error: '予約の取得に失敗しました' }, 500);
  }
});

// 予約詳細取得
app.get('/bookings/:bookingId', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const bookingId = c.req.param('bookingId');

    // セラピストプロフィールIDを取得
    const therapistProfile = await c.env.DB.prepare(`
      SELECT id FROM therapist_profiles WHERE user_id = ?
    `).bind(userId).first();

    if (!therapistProfile) {
      return c.json({ error: 'セラピストプロフィールが見つかりません' }, 404);
    }

    // 予約詳細を取得
    const booking = await c.env.DB.prepare(`
      SELECT 
        b.*,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone,
        s.name as site_name,
        s.address as site_address
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN sites s ON b.site_id = s.id
      WHERE b.id = ? AND b.therapist_id = ?
    `).bind(bookingId, therapistProfile.id).first();

    if (!booking) {
      return c.json({ error: '予約が見つかりません' }, 404);
    }

    return c.json({ booking });
  } catch (error) {
    console.error('予約詳細取得エラー:', error);
    return c.json({ error: '予約詳細の取得に失敗しました' }, 500);
  }
});

// 施術開始
app.post('/bookings/:bookingId/start', requireAuth, async (c) => {
  try {
    const bookingId = c.req.param('bookingId');

    await c.env.DB.prepare(`
      UPDATE bookings 
      SET status = 'IN_PROGRESS', started_at = datetime('now')
      WHERE id = ?
    `).bind(bookingId).run();

    return c.json({ 
      success: true, 
      message: '施術を開始しました' 
    });
  } catch (error) {
    console.error('施術開始エラー:', error);
    return c.json({ error: '施術開始に失敗しました' }, 500);
  }
});

// 施術終了
app.post('/bookings/:bookingId/complete', requireAuth, async (c) => {
  try {
    const bookingId = c.req.param('bookingId');

    await c.env.DB.prepare(`
      UPDATE bookings 
      SET status = 'COMPLETED', completed_at = datetime('now')
      WHERE id = ?
    `).bind(bookingId).run();

    return c.json({ 
      success: true, 
      message: '施術を完了しました' 
    });
  } catch (error) {
    console.error('施術完了エラー:', error);
    return c.json({ error: '施術完了に失敗しました' }, 500);
  }
});

// 予約キャンセル
app.post('/bookings/:bookingId/cancel', requireAuth, async (c) => {
  try {
    const bookingId = c.req.param('bookingId');
    const { reason } = await c.req.json();

    await c.env.DB.prepare(`
      UPDATE bookings 
      SET status = 'CANCELLED'
      WHERE id = ?
    `).bind(bookingId).run();

    // キャンセル理由を記録（ログテーブルがあれば）
    console.log(`予約キャンセル - ID: ${bookingId}, 理由: ${reason}`);

    return c.json({ 
      success: true, 
      message: '予約をキャンセルしました' 
    });
  } catch (error) {
    console.error('予約キャンセルエラー:', error);
    return c.json({ error: '予約キャンセルに失敗しました' }, 500);
  }
});

export default app;
