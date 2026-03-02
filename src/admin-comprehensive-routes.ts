/**
 * admin-comprehensive-routes.ts
 * 管理者向け総合APIルート
 *
 * 旧 admin-routes.ts（DELETE /users・GET /stats）を統合済み。
 * マウントポイント: /api/admin
 */
import { Hono } from 'hono'
import { requireAdmin as requireAdminAuth } from './auth-middleware'
import type { Bindings } from './types'

const app = new Hono<{ Bindings: Bindings }>()

// ============================================
// 認証ミドルウェア
// ============================================
const requireAdmin = async (c: Parameters<typeof app.get>[1], next: () => Promise<void>) => {
  const authHeader = c.req.header('Authorization')
  const authResult = await requireAdminAuth(authHeader, c.env.JWT_SECRET)

  if (!authResult.success) {
    return c.json({ error: authResult.error || '認証が必要です' }, 401)
  }

  c.set('userId', authResult.user!.userId)
  c.set('role', authResult.user!.role)
  await next()
}

// ============================================
// ユーザー管理
// ============================================

/** GET /api/admin/users - 全ユーザー取得 */
app.get('/users', requireAdmin, async (c) => {
  try {
    const users = await c.env.DB.prepare(`
      SELECT id, email, name, role, phone, kyc_status, is_active, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 1000
    `).all()

    return c.json({
      users: users.results || [],
      total: users.results?.length || 0,
    })
  } catch (error: unknown) {
    console.error('ユーザー取得エラー:', error)
    return c.json({ error: 'ユーザー一覧の取得に失敗しました' }, 500)
  }
})

/** GET /api/admin/users/:userId - ユーザー詳細取得 */
app.get('/users/:userId', requireAdmin, async (c) => {
  try {
    const userId = c.req.param('userId')

    const user = await c.env.DB.prepare(`
      SELECT id, email, name, role, phone, kyc_status, is_active, created_at, updated_at
      FROM users WHERE id = ?
    `).bind(userId).first()

    if (!user) {
      return c.json({ error: 'ユーザーが見つかりません' }, 404)
    }

    return c.json({ user })
  } catch (error: unknown) {
    console.error('ユーザー詳細取得エラー:', error)
    return c.json({ error: 'ユーザー詳細の取得に失敗しました' }, 500)
  }
})

/** PUT /api/admin/users/:userId - ユーザー更新 */
app.put('/users/:userId', requireAdmin, async (c) => {
  try {
    const userId = c.req.param('userId')
    const body = await c.req.json<{ name?: string; email?: string; phone?: string; role?: string }>()

    await c.env.DB.prepare(`
      UPDATE users
      SET name = ?, email = ?, phone = ?, role = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(body.name, body.email, body.phone, body.role, userId).run()

    return c.json({
      success: true,
      message: 'ユーザー情報を更新しました',
    })
  } catch (error: unknown) {
    console.error('ユーザー更新エラー:', error)
    return c.json({ error: 'ユーザー情報の更新に失敗しました' }, 500)
  }
})

/**
 * DELETE /api/admin/users/:userId - 単一ユーザー削除
 * 関連レコードを外部キー順に削除する
 */
app.delete('/users/:userId', requireAdmin, async (c) => {
  try {
    const userId = c.req.param('userId')
    const DB = c.env.DB

    // セラピストユーザーは broken FK constraint のため削除不可
    const therapistCheck = await DB.prepare(
      `SELECT user_id FROM therapist_profiles WHERE user_id = ?`
    ).bind(userId).first()

    if (therapistCheck) {
      return c.json({
        error: 'セラピストユーザーは削除できません',
        message: 'データベース制約により、セラピストユーザーの削除はサポートされていません。',
      }, 400)
    }

    let totalDeleted = 0
    const tables = [
      `DELETE FROM email_verifications WHERE user_id = ?`,
      `DELETE FROM social_accounts WHERE user_id = ?`,
      `DELETE FROM booking_items WHERE booking_id IN (SELECT id FROM bookings WHERE user_id = ?)`,
      `DELETE FROM bookings WHERE user_id = ?`,
      `DELETE FROM reviews WHERE user_id = ?`,
      `DELETE FROM payments WHERE user_id = ?`,
      `DELETE FROM notifications WHERE user_id = ?`,
    ]

    for (const sql of tables) {
      try {
        const result = await DB.prepare(sql).bind(userId).run()
        totalDeleted += result.meta.changes || 0
      } catch (e: unknown) {
        console.warn(`⚠️ 削除スキップ: ${sql.split(' ')[2]}`, (e as Error).message)
      }
    }

    const usersResult = await DB.prepare(`DELETE FROM users WHERE id = ?`).bind(userId).run()
    totalDeleted += usersResult.meta.changes || 0

    return c.json({
      success: true,
      message: `ユーザーと関連レコード ${totalDeleted} 件を削除しました`,
      deletedUserId: userId,
      totalRecordsDeleted: totalDeleted,
    })
  } catch (error: unknown) {
    console.error('❌ ユーザー削除エラー:', error)
    return c.json({ error: 'ユーザーの削除に失敗しました', message: (error as Error).message }, 500)
  }
})

/**
 * DELETE /api/admin/users - 複数ユーザーをメールで一括削除
 * Body: { emails: string[] }
 */
app.delete('/users', requireAdmin, async (c) => {
  const { DB } = c.env

  try {
    const body = await c.req.json<{ emails: string[] }>()
    const { emails } = body

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return c.json({ error: 'emails 配列が必要です' }, 400)
    }

    const placeholders = emails.map(() => '?').join(', ')
    const userIdsResult = await DB.prepare(
      `SELECT id FROM users WHERE email IN (${placeholders})`
    ).bind(...emails).all()

    const userIds = userIdsResult.results.map((r) => (r as Record<string, unknown>).id as string)

    if (userIds.length === 0) {
      return c.json({ success: true, message: '対象ユーザーが見つかりませんでした', deleted: 0 })
    }

    // セラピストユーザーを除外
    const therapistCheckResult = await DB.prepare(
      `SELECT user_id FROM therapist_profiles WHERE user_id IN (${userIds.map(() => '?').join(', ')})`
    ).bind(...userIds).all()

    const therapistUserIds = therapistCheckResult.results.map(
      (r) => (r as Record<string, unknown>).user_id as string
    )
    const nonTherapistUserIds = userIds.filter((id) => !therapistUserIds.includes(id))

    if (nonTherapistUserIds.length === 0) {
      return c.json({
        error: 'セラピストユーザーは削除できません',
        therapistUsers: therapistUserIds,
      }, 400)
    }

    const idPlaceholders = nonTherapistUserIds.map(() => '?').join(', ')
    let totalDeleted = 0

    const deleteSqls = [
      `DELETE FROM email_verifications WHERE user_id IN (${idPlaceholders})`,
      `DELETE FROM social_accounts WHERE user_id IN (${idPlaceholders})`,
      `DELETE FROM booking_items WHERE booking_id IN (SELECT id FROM bookings WHERE user_id IN (${idPlaceholders}))`,
      `DELETE FROM bookings WHERE user_id IN (${idPlaceholders})`,
      `DELETE FROM reviews WHERE user_id IN (${idPlaceholders})`,
      `DELETE FROM payments WHERE user_id IN (${idPlaceholders})`,
      `DELETE FROM notifications WHERE user_id IN (${idPlaceholders})`,
    ]

    for (const sql of deleteSqls) {
      try {
        const result = await DB.prepare(sql).bind(...nonTherapistUserIds).run()
        totalDeleted += result.meta.changes || 0
      } catch (e: unknown) {
        console.warn(`⚠️ 削除スキップ: ${sql.split(' ')[2]}`, (e as Error).message)
      }
    }

    const usersResult = await DB.prepare(
      `DELETE FROM users WHERE id IN (${idPlaceholders})`
    ).bind(...nonTherapistUserIds).run()
    totalDeleted += usersResult.meta.changes || 0

    return c.json({
      success: true,
      message: `${nonTherapistUserIds.length} 件のユーザーと関連レコード ${totalDeleted} 件を削除しました`,
      deletedEmails: emails,
      deletedUserIds: nonTherapistUserIds,
      skippedTherapistUsers: therapistUserIds,
      totalRecordsDeleted: totalDeleted,
    })
  } catch (error: unknown) {
    console.error('❌ 一括ユーザー削除エラー:', error)
    return c.json({ error: 'ユーザーの削除に失敗しました', message: (error as Error).message }, 500)
  }
})

// ============================================
// 予約管理
// ============================================

/** GET /api/admin/bookings - 全予約取得 */
app.get('/bookings', requireAdmin, async (c) => {
  try {
    const { status, from_date, to_date } = c.req.query()

    let query = `
      SELECT
        b.*,
        u.name as user_name,
        u.email as user_email,
        tp.id as therapist_profile_id
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN therapist_profiles tp ON b.therapist_id = tp.id
      WHERE 1=1
    `

    const params: (string | number)[] = []

    if (status) {
      query += ` AND b.status = ?`
      params.push(status)
    }
    if (from_date) {
      query += ` AND DATE(b.scheduled_at) >= ?`
      params.push(from_date)
    }
    if (to_date) {
      query += ` AND DATE(b.scheduled_at) <= ?`
      params.push(to_date)
    }

    query += ` ORDER BY b.scheduled_at DESC LIMIT 1000`

    const bookings = await c.env.DB.prepare(query).bind(...params).all()

    return c.json({
      bookings: bookings.results || [],
      total: bookings.results?.length || 0,
    })
  } catch (error: unknown) {
    console.error('予約取得エラー:', error)
    return c.json({ error: '予約一覧の取得に失敗しました' }, 500)
  }
})

/** GET /api/admin/bookings/stats - 予約統計 */
app.get('/bookings/stats', requireAdmin, async (c) => {
  try {
    const stats = await c.env.DB.prepare(`
      SELECT
        COUNT(*) as total_bookings,
        SUM(CASE WHEN status = 'CONFIRMED' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
        SUM(price) as total_revenue,
        SUM(CASE WHEN status = 'COMPLETED' THEN price ELSE 0 END) as completed_revenue
      FROM bookings
    `).first()

    return c.json({ stats })
  } catch (error: unknown) {
    console.error('予約統計取得エラー:', error)
    return c.json({ error: '予約統計の取得に失敗しました' }, 500)
  }
})

// ============================================
// 決済管理
// ============================================

/** GET /api/admin/payments - 決済一覧取得 */
app.get('/payments', requireAdmin, async (c) => {
  try {
    const payments = await c.env.DB.prepare(`
      SELECT
        pt.*,
        msr.therapist_profile_id,
        msr.year,
        msr.month
      FROM payment_transactions pt
      LEFT JOIN monthly_settlement_reports msr ON pt.settlement_report_id = msr.id
      ORDER BY pt.created_at DESC
      LIMIT 500
    `).all()

    return c.json({
      payments: payments.results || [],
      total: payments.results?.length || 0,
    })
  } catch (error: unknown) {
    console.error('決済取得エラー:', error)
    return c.json({ error: '決済一覧の取得に失敗しました' }, 500)
  }
})

/** GET /api/admin/payments/stats - 決済統計 */
app.get('/payments/stats', requireAdmin, async (c) => {
  try {
    const stats = await c.env.DB.prepare(`
      SELECT
        COUNT(*) as total_payments,
        SUM(amount) as total_amount,
        SUM(CASE WHEN payment_status = 'COMPLETED' THEN amount ELSE 0 END) as completed_amount,
        SUM(CASE WHEN payment_status = 'PENDING' THEN amount ELSE 0 END) as pending_amount
      FROM payment_transactions
    `).first()

    return c.json({ stats })
  } catch (error: unknown) {
    console.error('決済統計取得エラー:', error)
    return c.json({ error: '決済統計の取得に失敗しました' }, 500)
  }
})

// ============================================
// セラピスト管理
// ============================================

/** GET /api/admin/therapists - 全セラピスト取得 */
app.get('/therapists', requireAdmin, async (c) => {
  try {
    const therapists = await c.env.DB.prepare(`
      SELECT
        tp.*,
        u.name,
        u.email,
        u.phone,
        u.avatar_url,
        ota.office_id,
        o.name as office_name
      FROM therapist_profiles tp
      JOIN users u ON tp.user_id = u.id
      LEFT JOIN office_therapist_affiliations ota ON tp.id = ota.therapist_profile_id AND ota.status = 'APPROVED'
      LEFT JOIN offices o ON ota.office_id = o.id
      ORDER BY tp.created_at DESC
      LIMIT 500
    `).all()

    return c.json({
      therapists: therapists.results || [],
      total: therapists.results?.length || 0,
    })
  } catch (error: unknown) {
    console.error('セラピスト取得エラー:', error)
    return c.json({ error: 'セラピスト一覧の取得に失敗しました' }, 500)
  }
})

/** GET /api/admin/therapists/:therapistId - セラピスト詳細取得 */
app.get('/therapists/:therapistId', requireAdmin, async (c) => {
  try {
    const therapistId = c.req.param('therapistId')

    const therapist = await c.env.DB.prepare(`
      SELECT
        tp.*,
        u.name,
        u.email,
        u.phone,
        u.avatar_url
      FROM therapist_profiles tp
      JOIN users u ON tp.user_id = u.id
      WHERE tp.id = ?
    `).bind(therapistId).first()

    if (!therapist) {
      return c.json({ error: 'セラピストが見つかりません' }, 404)
    }

    return c.json({ therapist })
  } catch (error: unknown) {
    console.error('セラピスト詳細取得エラー:', error)
    return c.json({ error: 'セラピスト詳細の取得に失敗しました' }, 500)
  }
})

/** PUT /api/admin/therapists/:therapistId - セラピスト更新 */
app.put('/therapists/:therapistId', requireAdmin, async (c) => {
  try {
    const therapistId = c.req.param('therapistId')
    const body = await c.req.json<{ bio?: string; status?: string }>()

    await c.env.DB.prepare(`
      UPDATE therapist_profiles
      SET bio = ?, status = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(body.bio, body.status, therapistId).run()

    return c.json({
      success: true,
      message: 'セラピスト情報を更新しました',
    })
  } catch (error: unknown) {
    console.error('セラピスト更新エラー:', error)
    return c.json({ error: 'セラピスト情報の更新に失敗しました' }, 500)
  }
})

/** DELETE /api/admin/therapists/:therapistId - セラピスト削除 */
app.delete('/therapists/:therapistId', requireAdmin, async (c) => {
  try {
    const therapistId = c.req.param('therapistId')

    await c.env.DB.prepare(`
      DELETE FROM therapist_profiles WHERE id = ?
    `).bind(therapistId).run()

    return c.json({
      success: true,
      message: 'セラピストを削除しました',
    })
  } catch (error: unknown) {
    console.error('セラピスト削除エラー:', error)
    return c.json({ error: 'セラピストの削除に失敗しました' }, 500)
  }
})

// ============================================
// DB統計（旧 admin-routes.ts から統合）
// ============================================

/** GET /api/admin/stats - データベース統計 */
app.get('/stats', requireAdmin, async (c) => {
  const { DB } = c.env

  const tables = [
    'users',
    'therapist_profiles',
    'offices',
    'sites',
    'bookings',
    'reviews',
    'payments',
    'incidents',
    'affiliates',
    'notifications',
  ]

  const stats: Record<string, number> = {}

  for (const table of tables) {
    try {
      const result = await DB.prepare(`SELECT COUNT(*) as count FROM ${table}`).first()
      stats[table] = (result?.count as number) || 0
    } catch {
      stats[table] = 0
    }
  }

  return c.json({ stats, timestamp: new Date().toISOString() })
})

// ============================================
// インシデント管理
// ============================================
/** GET /api/admin/incidents - インシデント一覧 */
app.get('/incidents', requireAdmin, async (c) => {
  const { DB } = c.env
  const status = c.req.query('status') || ''
  const severity = c.req.query('severity') || ''
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '20')
  const offset = (page - 1) * limit
  try {
    let sql = `SELECT i.*, b.scheduled_at, b.service_name,
      u.name as reporter_name
      FROM incidents i
      LEFT JOIN bookings b ON i.booking_id = b.id
      LEFT JOIN users u ON i.reporter_id = u.id
      WHERE 1=1`
    const params: (string | number)[] = []
    if (status) { sql += ' AND i.status = ?'; params.push(status) }
    if (severity) { sql += ' AND i.severity = ?'; params.push(severity) }
    sql += ` ORDER BY i.created_at DESC LIMIT ? OFFSET ?`
    params.push(limit, offset)
    const result = await DB.prepare(sql).bind(...params).all()
    const countResult = await DB.prepare('SELECT COUNT(*) as total FROM incidents').first<{ total: number }>()
    return c.json({ incidents: result.results || [], total: countResult?.total || 0, page, limit })
  } catch (e) {
    console.error('インシデント取得エラー:', e)
    return c.json({ error: 'インシデントの取得に失敗しました' }, 500)
  }
})

/** GET /api/admin/incidents/:id - インシデント詳細 */
app.get('/incidents/:id', requireAdmin, async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  try {
    const incident = await DB.prepare(`
      SELECT i.*, b.scheduled_at, b.service_name, b.price, b.type as booking_type,
        u.name as reporter_name, u.email as reporter_email
      FROM incidents i
      LEFT JOIN bookings b ON i.booking_id = b.id
      LEFT JOIN users u ON i.reporter_id = u.id
      WHERE i.id = ?
    `).bind(id).first()
    if (!incident) return c.json({ error: 'インシデントが見つかりません' }, 404)
    return c.json({ incident })
  } catch (e) {
    return c.json({ error: '取得に失敗しました' }, 500)
  }
})

/** PATCH /api/admin/incidents/:id - インシデントステータス更新 */
app.patch('/incidents/:id', requireAdmin, async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  try {
    const { status } = await c.req.json()
    const resolvedAt = (status === 'RESOLVED' || status === 'CLOSED') ? new Date().toISOString() : null
    await DB.prepare(`
      UPDATE incidents SET status = ?, resolved_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(status, resolvedAt, id).run()
    return c.json({ success: true })
  } catch (e) {
    return c.json({ error: '更新に失敗しました' }, 500)
  }
})

// ============================================
// 従来配分設定
// ============================================
/** GET /api/admin/revenue-config - 配分設定一覧 */
app.get('/revenue-config', requireAdmin, async (c) => {
  const { DB } = c.env
  try {
    const result = await DB.prepare('SELECT * FROM revenue_config ORDER BY target_month DESC LIMIT 12').all()
    return c.json({ configs: result.results || [] })
  } catch (e) {
    return c.json({ error: '配分設定の取得に失敗しました' }, 500)
  }
})

/** POST /api/admin/revenue-config - 配分設定作成・更新 */
app.post('/revenue-config', requireAdmin, async (c) => {
  const { DB } = c.env
  try {
    const body = await c.req.json()
    const { target_month, therapist_percentage, host_percentage, affiliate_percentage, platform_percentage } = body
    if (!target_month) return c.json({ error: 'target_month is required' }, 400)
    const total = (therapist_percentage || 0) + (host_percentage || 0) + (affiliate_percentage || 0) + (platform_percentage || 0)
    if (Math.abs(total - 100) > 0.01) return c.json({ error: '配分割合の合計は100%になる必要があります' }, 400)
    const id = crypto.randomUUID()
    await DB.prepare(`
      INSERT INTO revenue_config (id, target_month, therapist_percentage, host_percentage, affiliate_percentage, platform_percentage)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(target_month) DO UPDATE SET
        therapist_percentage = excluded.therapist_percentage,
        host_percentage = excluded.host_percentage,
        affiliate_percentage = excluded.affiliate_percentage,
        platform_percentage = excluded.platform_percentage,
        updated_at = CURRENT_TIMESTAMP
    `).bind(id, target_month, therapist_percentage, host_percentage, affiliate_percentage, platform_percentage).run()
    return c.json({ success: true })
  } catch (e) {
    return c.json({ error: '保存に失敗しました' }, 500)
  }
})

// ============================================
// 返金申請管理
// ============================================

/** GET /api/admin/refunds - 返金申請一覧 */
app.get('/refunds', requireAdmin, async (c) => {
  try {
    const { status } = c.req.query()
    const where = status ? `WHERE r.status = '${status}'` : ''
    const result = await c.env.DB.prepare(`
      SELECT r.*, u.name as user_name, u.email as user_email,
             b.service_name, b.price as booking_price
      FROM refund_requests r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN bookings b ON r.booking_id = b.id
      ${where}
      ORDER BY r.requested_at DESC
      LIMIT 200
    `).all()
    return c.json({ requests: result.results || [] })
  } catch (e) {
    return c.json({ error: '返金申請一覧の取得に失敗しました' }, 500)
  }
})

/** PATCH /api/admin/refunds/:id - 返金申請の承認/却下 */
app.patch('/refunds/:id', requireAdmin, async (c) => {
  try {
    const { id } = c.req.param()
    const { action } = await c.req.json() as { action: 'APPROVE' | 'REJECT' }
    const adminId = c.get('userId')
    if (!['APPROVE', 'REJECT'].includes(action)) return c.json({ error: '無効なアクション' }, 400)
    const status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED'
    await c.env.DB.prepare(`
      UPDATE refund_requests
      SET status = ?, reviewed_at = datetime('now'), reviewed_by = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(status, adminId, id).run()
    return c.json({ success: true, status })
  } catch (e) {
    return c.json({ error: '更新に失敗しました' }, 500)
  }
})

/** POST /api/admin/refunds - 返金申請の新規作成（管理者が手動作成） */
app.post('/refunds', requireAdmin, async (c) => {
  try {
    const { booking_id, user_id, amount, reason } = await c.req.json() as any
    if (!booking_id || !user_id || !amount) return c.json({ error: 'booking_id, user_id, amountは必須です' }, 400)
    const id = crypto.randomUUID()
    await c.env.DB.prepare(`
      INSERT INTO refund_requests (id, booking_id, user_id, amount, reason)
      VALUES (?, ?, ?, ?, ?)
    `).bind(id, booking_id, user_id, amount, reason || null).run()
    return c.json({ success: true, id })
  } catch (e) {
    return c.json({ error: '返金申請の作成に失敗しました' }, 500)
  }
})

// ============================================
// 振込・精算管理（financial_statements）
// ============================================

/** GET /api/admin/payouts - 精算一覧 */
app.get('/payouts', requireAdmin, async (c) => {
  try {
    const { month, status } = c.req.query()
    let where = 'WHERE 1=1'
    const params: any[] = []
    if (month) { where += ' AND target_month = ?'; params.push(month) }
    if (status) { where += ' AND status = ?'; params.push(status) }
    const result = await c.env.DB.prepare(`
      SELECT * FROM financial_statements ${where} ORDER BY generated_at DESC LIMIT 500
    `).bind(...params).all()
    return c.json({ statements: result.results || [] })
  } catch (e) {
    return c.json({ error: '精算一覧の取得に失敗しました' }, 500)
  }
})

/** PATCH /api/admin/payouts/:id - 精算ステータス更新 */
app.patch('/payouts/:id', requireAdmin, async (c) => {
  try {
    const { id } = c.req.param()
    const { status } = await c.req.json() as { status: string }
    const paidAt = status === 'PAID' ? `datetime('now')` : 'NULL'
    await c.env.DB.prepare(`
      UPDATE financial_statements
      SET status = ?, paid_at = ${paidAt}
      WHERE id = ?
    `).bind(status, id).run()
    return c.json({ success: true })
  } catch (e) {
    return c.json({ error: '更新に失敗しました' }, 500)
  }
})

/** POST /api/admin/payouts/calculate - 指定月の精算バッチ実行 */
app.post('/payouts/calculate', requireAdmin, async (c) => {
  try {
    const { target_month } = await c.req.json() as { target_month: string }
    if (!target_month) return c.json({ error: 'target_monthは必須です' }, 400)
    // payment_splitsから集計してfinancial_statementsに挿入
    const splits = await c.env.DB.prepare(`
      SELECT user_id, user_role, SUM(amount) as total
      FROM payment_splits
      WHERE strftime('%Y-%m', created_at) = ?
      GROUP BY user_id, user_role
    `).bind(target_month).all()
    let inserted = 0
    for (const row of (splits.results || []) as any[]) {
      const user = await c.env.DB.prepare('SELECT name FROM users WHERE id = ?').bind(row.user_id).first() as any
      const id = crypto.randomUUID()
      await c.env.DB.prepare(`
        INSERT OR IGNORE INTO financial_statements
          (id, user_id, user_role, user_name, target_month, total_sales, payout_amount, status, generated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', datetime('now'))
      `).bind(id, row.user_id, row.user_role, user?.name || '', target_month, row.total, row.total).run()
      inserted++
    }
    return c.json({ success: true, inserted })
  } catch (e) {
    return c.json({ error: '精算バッチの実行に失敗しました' }, 500)
  }
})

/** GET /api/admin/financial-statements/:id - 帳票個別取得 */
app.get('/financial-statements/:id', requireAdmin, async (c) => {
  try {
    const { id } = c.req.param()
    const stmt = await c.env.DB.prepare('SELECT * FROM financial_statements WHERE id = ?').bind(id).first()
    if (!stmt) return c.json({ error: '帳票が見つかりません' }, 404)
    return c.json({ statement: stmt })
  } catch (e) {
    return c.json({ error: '帳票の取得に失敗しました' }, 500)
  }
})

export default app
