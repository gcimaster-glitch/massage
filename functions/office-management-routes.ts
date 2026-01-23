import { Hono } from 'hono';
import { nanoid } from 'nanoid';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// JWT認証ミドルウェア
const requireAuth = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: '認証が必要です' }, 401);
  }

  const token = authHeader.substring(7);
  try {
    const payload = await verifyJWT(token, c.env.JWT_SECRET);
    if (!payload) {
      return c.json({ error: '無効なトークンです' }, 401);
    }
    c.set('userId', payload.userId);
    c.set('role', payload.role);
    await next();
  } catch (error) {
    return c.json({ error: '認証に失敗しました' }, 401);
  }
};

// JWT検証関数
async function verifyJWT(token: string, secret: string) {
  try {
    const [headerB64, payloadB64, signature] = token.split('.');
    const payload = JSON.parse(
      decodeURIComponent(
        atob(payloadB64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
    );

    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error('JWT verify error:', error);
    return null;
  }
}

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

// ============================================
// セラピスト向け：自分の所属事務所取得
// ============================================

app.get('/my-offices', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');

    // セラピストプロフィールIDを取得
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

export default app;
