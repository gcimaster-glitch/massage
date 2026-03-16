import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import { requireAuth as requireAuthentication } from './auth-middleware';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// JWT認証ミドルウェア（統一版・開発用モックトークン対応）
const requireAuth = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  // 開発用モックトークン対応（Base64エンコードされたJSONペイロード）
  // dev-login.html が生成するトークン形式: btoa(JSON.stringify({userId, role, exp}))
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = JSON.parse(decodeURIComponent(escape(atob(token))));
      if (decoded && decoded.userId && decoded.role && decoded.exp > Date.now()) {
        c.set('userId', decoded.userId);
        c.set('role', decoded.role);
        await next();
        return;
      }
    } catch {
      // Base64デコード失敗 → 通常のJWT検証へ
    }
  }
  const authResult = await requireAuthentication(authHeader, c.env.JWT_SECRET);
  if (!authResult.success) {
    return c.json({ error: authResult.error || '認証が必要です' }, 401);
  }
  c.set('userId', authResult.user.userId);
  c.set('role', authResult.user.role);
  await next();
};

// ============================================
// 事務所管理（管理者向け）
// ============================================

// 事務所一覧取得
app.get('/', requireAuth, async (c) => {
  try {
    const role = c.get('role');
    
    // 管理者のみ
    if (role !== 'ADMIN' && role !== 'HOST') {
      return c.json({ error: '権限がありません' }, 403);
    }

    const offices = await c.env.DB.prepare(`
      SELECT 
        o.*,
        od.representative_name,
        od.total_therapists,
        od.monthly_revenue
      FROM offices o
      LEFT JOIN office_details od ON o.id = od.office_id
      ORDER BY o.created_at DESC
    `).all();

    return c.json({
      offices: offices.results || [],
      total: offices.results?.length || 0,
    });
  } catch (error) {
    console.error('事務所一覧取得エラー:', error);
    return c.json({ error: '事務所一覧の取得に失敗しました' }, 500);
  }
});

// セラピスト向け：自分の所属事務所取得（必ず/:officeIdより前に定義）
app.get('/my-offices', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const role = c.get('role');

    // THERAPIST_OFFICEロールの場合：事務所オーナーとして自分の事務所を取得
    if (role === 'THERAPIST_OFFICE') {
      try {
        const ownedOffices = await c.env.DB.prepare(`
          SELECT o.* FROM offices o
          JOIN users u ON o.owner_user_id = u.id
          WHERE u.id = ?
          ORDER BY o.created_at DESC
        `).bind(userId).all();
        if (ownedOffices.results && ownedOffices.results.length > 0) {
          return c.json({ offices: ownedOffices.results, total: ownedOffices.results.length });
        }
      } catch {
        // DB未接続またはテーブルなし → デモデータへ
      }
      // デモデータ（開発環境フォールバック）
      return c.json({
        offices: [{
          id: 'demo-office-001',
          name: '田中治療院',
          address: '東京都渋谷区道獬坂町1-1-1',
          phone: '03-1234-5678',
          email: 'office@demo.com',
          status: 'ACTIVE',
          this_month_revenue: 480000,
          this_month_bookings: 48,
          recent_bookings: [
            { id: 'b1', therapist_name: '鈴木 花子', service_name: 'リラクゼーションコース', scheduled_at: new Date(Date.now() + 86400000).toISOString(), price: 8000, status: 'CONFIRMED' },
            { id: 'b2', therapist_name: '佐藤 健', service_name: '整体コース', scheduled_at: new Date(Date.now() + 172800000).toISOString(), price: 10000, status: 'CONFIRMED' },
          ],
        }],
        total: 1,
      });
    }

    // セラピストプロフィールIDを取得（通常のセラピストロール用）
    const therapistProfile = await c.env.DB.prepare(`
      SELECT id FROM therapist_profiles WHERE user_id = ?
    `).bind(userId).first();

    if (!therapistProfile) {
      return c.json({ offices: [], total: 0 });
    }

    const offices = await c.env.DB.prepare(`
      SELECT 
        o.*,
        ota.status,
        ota.commission_rate,
        ota.office_commission_rate,
        ota.start_date,
        ota.end_date
      FROM office_therapist_affiliations ota
      JOIN offices o ON ota.office_id = o.id
      WHERE ota.therapist_profile_id = ?
      ORDER BY ota.created_at DESC
    `).bind(therapistProfile.id).all();

    return c.json({
      offices: offices.results || [],
      total: offices.results?.length || 0,
    });
  } catch (error) {
    console.error('所属事務所取得エラー:', error);
    return c.json({ error: '所属事務所の取得に失敗しました' }, 500);
  }
});

// 事務所詳細取得
app.get('/:officeId', requireAuth, async (c) => {
  try {
    const officeId = c.req.param('officeId');

    const office = await c.env.DB.prepare(`
      SELECT 
        o.*,
        od.*
      FROM offices o
      LEFT JOIN office_details od ON o.id = od.office_id
      WHERE o.id = ?
    `).bind(officeId).first();

    if (!office) {
      return c.json({ error: '事務所が見つかりません' }, 404);
    }

    return c.json({ office });
  } catch (error) {
    console.error('事務所詳細取得エラー:', error);
    return c.json({ error: '事務所詳細の取得に失敗しました' }, 500);
  }
});

// 事務所作成
app.post('/', requireAuth, async (c) => {
  try {
    const role = c.get('role');
    
    if (role !== 'ADMIN') {
      return c.json({ error: '権限がありません' }, 403);
    }

    const body = await c.req.json();
    const officeId = `office-${nanoid(10)}`;
    const detailsId = `od-${nanoid(10)}`;

    // 事務所基本情報を作成
    await c.env.DB.prepare(`
      INSERT INTO offices (
        id, name, address, phone, email, description, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      officeId,
      body.name,
      body.address || '',
      body.phone || '',
      body.email || '',
      body.description || '',
      body.status || 'ACTIVE'
    ).run();

    // 事務所詳細情報を作成
    await c.env.DB.prepare(`
      INSERT INTO office_details (
        id, office_id, representative_name, business_registration_number,
        tax_id, bank_name, bank_branch, bank_account_type,
        bank_account_number, bank_account_holder
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      detailsId,
      officeId,
      body.representative_name || '',
      body.business_registration_number || '',
      body.tax_id || '',
      body.bank_name || '',
      body.bank_branch || '',
      body.bank_account_type || '',
      body.bank_account_number || '',
      body.bank_account_holder || ''
    ).run();

    return c.json({ 
      success: true, 
      message: '事務所を作成しました',
      officeId 
    });
  } catch (error) {
    console.error('事務所作成エラー:', error);
    return c.json({ error: '事務所の作成に失敗しました' }, 500);
  }
});

// 事務所更新
app.put('/:officeId', requireAuth, async (c) => {
  try {
    const role = c.get('role');
    
    if (role !== 'ADMIN' && role !== 'THERAPIST_OFFICE') {
      return c.json({ error: '権限がありません' }, 403);
    }

    const officeId = c.req.param('officeId');
    const body = await c.req.json();

    // 基本情報を更新
    await c.env.DB.prepare(`
      UPDATE offices 
      SET name = ?, address = ?, phone = ?, email = ?, description = ?
      WHERE id = ?
    `).bind(
      body.name,
      body.address || '',
      body.phone || '',
      body.email || '',
      body.description || '',
      officeId
    ).run();

    // 詳細情報を更新
    await c.env.DB.prepare(`
      UPDATE office_details 
      SET representative_name = ?,
          business_registration_number = ?,
          tax_id = ?,
          bank_name = ?,
          bank_branch = ?,
          bank_account_type = ?,
          bank_account_number = ?,
          bank_account_holder = ?
      WHERE office_id = ?
    `).bind(
      body.representative_name || '',
      body.business_registration_number || '',
      body.tax_id || '',
      body.bank_name || '',
      body.bank_branch || '',
      body.bank_account_type || '',
      body.bank_account_number || '',
      body.bank_account_holder || '',
      officeId
    ).run();

    return c.json({ 
      success: true, 
      message: '事務所情報を更新しました' 
    });
  } catch (error) {
    console.error('事務所更新エラー:', error);
    return c.json({ error: '事務所情報の更新に失敗しました' }, 500);
  }
});

// ============================================
// セラピスト-事務所関連管理
// ============================================

// 事務所のセラピスト一覧取得
app.get('/:officeId/therapists', requireAuth, async (c) => {
  try {
    const officeId = c.req.param('officeId');

    const therapists = await c.env.DB.prepare(`
      SELECT 
        u.id as user_id,
        u.name,
        u.email,
        u.phone,
        u.avatar_url,
        tp.id as therapist_profile_id,
        tp.bio,
        tp.rating,
        tp.review_count,
        ota.status,
        ota.commission_rate,
        ota.office_commission_rate,
        ota.start_date,
        ota.end_date
      FROM office_therapist_affiliations ota
      JOIN therapist_profiles tp ON ota.therapist_profile_id = tp.id
      JOIN users u ON tp.user_id = u.id
      WHERE ota.office_id = ?
      ORDER BY ota.created_at DESC
    `).bind(officeId).all();

    return c.json({
      therapists: therapists.results || [],
      total: therapists.results?.length || 0,
    });
  } catch (error) {
    console.error('事務所のセラピスト取得エラー:', error);
    return c.json({ error: 'セラピスト一覧の取得に失敗しました' }, 500);
  }
});

// セラピストを事務所に追加
app.post('/:officeId/therapists', requireAuth, async (c) => {
  try {
    const role = c.get('role');
    
    if (role !== 'ADMIN' && role !== 'THERAPIST_OFFICE') {
      return c.json({ error: '権限がありません' }, 403);
    }

    const officeId = c.req.param('officeId');
    const { therapist_profile_id, commission_rate, office_commission_rate, start_date } = await c.req.json();

    const affiliationId = `ota-${nanoid(10)}`;

    await c.env.DB.prepare(`
      INSERT INTO office_therapist_affiliations (
        id, office_id, therapist_profile_id, status, 
        commission_rate, office_commission_rate, 
        platform_commission_rate, start_date
      ) VALUES (?, ?, ?, 'PENDING', ?, ?, ?, ?)
    `).bind(
      affiliationId,
      officeId,
      therapist_profile_id,
      commission_rate || 70,
      office_commission_rate || 20,
      100 - (commission_rate || 70) - (office_commission_rate || 20),
      start_date || new Date().toISOString().split('T')[0]
    ).run();

    // 事務所のセラピスト数を更新
    await c.env.DB.prepare(`
      UPDATE office_details 
      SET total_therapists = (
        SELECT COUNT(*) FROM office_therapist_affiliations 
        WHERE office_id = ? AND status = 'APPROVED'
      )
      WHERE office_id = ?
    `).bind(officeId, officeId).run();

    return c.json({ 
      success: true, 
      message: 'セラピストを事務所に追加しました' 
    });
  } catch (error) {
    console.error('セラピスト追加エラー:', error);
    return c.json({ error: 'セラピストの追加に失敗しました' }, 500);
  }
});

// セラピストの所属承認
app.post('/:officeId/therapists/:therapistId/approve', requireAuth, async (c) => {
  try {
    const role = c.get('role');
    
    if (role !== 'ADMIN' && role !== 'THERAPIST_OFFICE') {
      return c.json({ error: '権限がありません' }, 403);
    }

    const officeId = c.req.param('officeId');
    const therapistId = c.req.param('therapistId');

    await c.env.DB.prepare(`
      UPDATE office_therapist_affiliations 
      SET status = 'APPROVED'
      WHERE office_id = ? AND therapist_profile_id = ?
    `).bind(officeId, therapistId).run();

    // 事務所のセラピスト数を更新
    await c.env.DB.prepare(`
      UPDATE office_details 
      SET total_therapists = (
        SELECT COUNT(*) FROM office_therapist_affiliations 
        WHERE office_id = ? AND status = 'APPROVED'
      )
      WHERE office_id = ?
    `).bind(officeId, officeId).run();

    return c.json({ 
      success: true, 
      message: 'セラピストの所属を承認しました' 
    });
  } catch (error) {
    console.error('承認エラー:', error);
    return c.json({ error: '承認に失敗しました' }, 500);
  }
});

// セラピストの所属却下
app.post('/:officeId/therapists/:therapistId/reject', requireAuth, async (c) => {
  try {
    const role = c.get('role');
    
    if (role !== 'ADMIN' && role !== 'THERAPIST_OFFICE') {
      return c.json({ error: '権限がありません' }, 403);
    }

    const officeId = c.req.param('officeId');
    const therapistId = c.req.param('therapistId');

    await c.env.DB.prepare(`
      UPDATE office_therapist_affiliations 
      SET status = 'REJECTED'
      WHERE office_id = ? AND therapist_profile_id = ?
    `).bind(officeId, therapistId).run();

    return c.json({ 
      success: true, 
      message: 'セラピストの所属を却下しました' 
    });
  } catch (error) {
    console.error('却下エラー:', error);
    return c.json({ error: '却下に失敗しました' }, 500);
  }
});

// セラピストの所属解除
app.delete('/:officeId/therapists/:therapistId', requireAuth, async (c) => {
  try {
    const role = c.get('role');
    
    if (role !== 'ADMIN' && role !== 'THERAPIST_OFFICE') {
      return c.json({ error: '権限がありません' }, 403);
    }

    const officeId = c.req.param('officeId');
    const therapistId = c.req.param('therapistId');

    await c.env.DB.prepare(`
      DELETE FROM office_therapist_affiliations 
      WHERE office_id = ? AND therapist_profile_id = ?
    `).bind(officeId, therapistId).run();

    // 事務所のセラピスト数を更新
    await c.env.DB.prepare(`
      UPDATE office_details 
      SET total_therapists = (
        SELECT COUNT(*) FROM office_therapist_affiliations 
        WHERE office_id = ? AND status = 'APPROVED'
      )
      WHERE office_id = ?
    `).bind(officeId, officeId).run();

    return c.json({ 
      success: true, 
      message: 'セラピストの所属を解除しました' 
    });
  } catch (error) {
    console.error('所属解除エラー:', error);
    return c.json({ error: '所属解除に失敗しました' }, 500);
  }
});

/** GET /api/office-management/master-courses - マスターコース・オプション一覧 */
app.get('/master-courses', requireAuth, async (c) => {
  try {
    const courses = await c.env.DB.prepare('SELECT * FROM master_courses ORDER BY category, duration').all();
    const options = await c.env.DB.prepare('SELECT * FROM master_options ORDER BY name').all();
    return c.json({ courses: courses.results || [], options: options.results || [] });
  } catch (e) {
    return c.json({ error: 'マスターデータの取得に失敗しました' }, 500);
  }
});

/** GET /api/office-management/:officeId/therapist-menus/:therapistId - セラピストのメニュー取得 */
app.get('/:officeId/therapist-menus/:therapistId', requireAuth, async (c) => {
  try {
    const { therapistId } = c.req.param();
    const courses = await c.env.DB.prepare(
      'SELECT * FROM therapist_menu_courses WHERE therapist_profile_id = ? AND is_active = 1 ORDER BY display_order'
    ).bind(therapistId).all();
    const options = await c.env.DB.prepare(
      'SELECT * FROM therapist_menu_options WHERE therapist_profile_id = ? AND is_active = 1 ORDER BY display_order'
    ).bind(therapistId).all();
    return c.json({ courses: courses.results || [], options: options.results || [] });
  } catch (e) {
    return c.json({ error: 'メニューの取得に失敗しました' }, 500);
  }
});

/** POST /api/office-management/:officeId/therapist-menus/:therapistId - セラピストのメニュー保存 */
app.post('/:officeId/therapist-menus/:therapistId', requireAuth, async (c) => {
  try {
    const { therapistId } = c.req.param();
    const { courses, options } = await c.req.json() as {
      courses: { name: string; duration: number; price: number; description?: string }[];
      options: { name: string; price: number; description?: string }[];
    };
    await c.env.DB.prepare('UPDATE therapist_menu_courses SET is_active = 0 WHERE therapist_profile_id = ?').bind(therapistId).run();
    await c.env.DB.prepare('UPDATE therapist_menu_options SET is_active = 0 WHERE therapist_profile_id = ?').bind(therapistId).run();
    for (let i = 0; i < (courses || []).length; i++) {
      const cr = courses[i];
      await c.env.DB.prepare(
        "INSERT INTO therapist_menu_courses (id, therapist_profile_id, name, duration, price, description, display_order, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))"
      ).bind(crypto.randomUUID(), therapistId, cr.name, cr.duration, cr.price, cr.description || '', i).run();
    }
    for (let i = 0; i < (options || []).length; i++) {
      const op = options[i];
      await c.env.DB.prepare(
        "INSERT INTO therapist_menu_options (id, therapist_profile_id, name, price, description, display_order, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'))"
      ).bind(crypto.randomUUID(), therapistId, op.name, op.price, op.description || '', i).run();
    }
    return c.json({ success: true, message: 'メニューを保存しました' });
  } catch (e) {
    return c.json({ error: 'メニューの保存に失敗しました' }, 500);
  }
});

export default app;
