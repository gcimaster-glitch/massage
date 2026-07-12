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
      LEFT JOIN therapist_profiles tp ON b.therapist_id = tp.user_id
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
// 振込・精算管理（payout_statements / financial_statements 両対応）
// ============================================

/** GET /api/admin/payouts - 精算一覧（新テーブル対応） */
app.get('/payouts', requireAdmin, async (c) => {
  try {
    const { month, status } = c.req.query()
    let where = 'WHERE 1=1'
    const params: any[] = []
    if (month) { where += ` AND strftime('%Y-%m', ps.period_start) = ?`; params.push(month) }
    if (status) { where += ' AND ps.status = ?'; params.push(status) }
    const result = await c.env.DB.prepare(`
      SELECT
        ps.id,
        ps.user_id,
        ps.role as user_role,
        u.name as user_name,
        strftime('%Y-%m', ps.period_start) as target_month,
        ps.gross_amount as total_sales,
        ps.net_amount as payout_amount,
        ps.status,
        ps.created_at as generated_at,
        ps.paid_at,
        ps.period_start,
        ps.period_end
      FROM payout_statements ps
      LEFT JOIN users u ON ps.user_id = u.id
      ${where}
      ORDER BY ps.period_start DESC
      LIMIT 500
    `).bind(...params).all()
    return c.json({ statements: result.results || [] })
  } catch (e) {
    console.error('payouts fetch error:', e)
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
      UPDATE payout_statements
      SET status = ?, paid_at = ${paidAt}, updated_at = datetime('now')
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
    if (!/^\d{4}-\d{2}$/.test(target_month)) {
      return c.json({ error: 'target_monthは YYYY-MM 形式で指定してください' }, 400)
    }
    const [year, month] = target_month.split('-')
    const periodStart = `${year}-${month}-01`
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
    const periodEnd = `${year}-${month}-${String(lastDay).padStart(2, '0')}`
    // transaction_splitsから集計（新テーブル）
    const splits = await c.env.DB.prepare(`
      SELECT ts.user_id, ts.role, SUM(ts.amount) as total
      FROM transaction_splits ts
      JOIN transactions t ON ts.transaction_id = t.id
      WHERE t.status = 'SUCCEEDED'
        AND t.paid_at >= ?
        AND t.paid_at <= ?
        AND ts.payout_status = 'PENDING'
      GROUP BY ts.user_id, ts.role
    `).bind(`${periodStart} 00:00:00`, `${periodEnd} 23:59:59`).all()
    let inserted = 0
    let updated = 0
    for (const row of (splits.results || []) as any[]) {
      const existing = await c.env.DB.prepare(
        'SELECT id FROM payout_statements WHERE user_id = ? AND period_start = ? AND period_end = ?'
      ).bind(row.user_id, periodStart, periodEnd).first() as any
      if (existing) {
        await c.env.DB.prepare(`
          UPDATE payout_statements
          SET gross_amount = ?, net_amount = ?, updated_at = datetime('now')
          WHERE id = ?
        `).bind(row.total, row.total, existing.id).run()
        updated++
      } else {
        const id = crypto.randomUUID()
        await c.env.DB.prepare(`
          INSERT INTO payout_statements
            (id, user_id, role, period_start, period_end, gross_amount, net_amount, fee_amount, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'DRAFT', datetime('now'), datetime('now'))
        `).bind(id, row.user_id, row.role, periodStart, periodEnd, row.total, row.total).run()
        inserted++
      }
    }
    // therapist_earningsからも集計（既存テーブルとの互換性）
    const earningsSplits = await c.env.DB.prepare(`
      SELECT tp.user_id, 'THERAPIST' as role, SUM(te.therapist_amount) as total
      FROM therapist_earnings te
      JOIN therapist_profiles tp ON te.therapist_profile_id = tp.id
      WHERE strftime('%Y-%m', te.booking_date) = ?
        AND te.status IN ('CONFIRMED', 'PAID')
      GROUP BY tp.user_id
    `).bind(target_month).all()
    for (const row of (earningsSplits.results || []) as any[]) {
      const existing = await c.env.DB.prepare(
        'SELECT id FROM payout_statements WHERE user_id = ? AND period_start = ? AND period_end = ?'
      ).bind(row.user_id, periodStart, periodEnd).first() as any
      if (!existing) {
        const id = crypto.randomUUID()
        await c.env.DB.prepare(`
          INSERT OR IGNORE INTO payout_statements
            (id, user_id, role, period_start, period_end, gross_amount, net_amount, fee_amount, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'DRAFT', datetime('now'), datetime('now'))
        `).bind(id, row.user_id, row.role, periodStart, periodEnd, row.total, row.total).run()
        inserted++
      }
    }
    return c.json({ success: true, inserted, updated, total: inserted + updated })
  } catch (e) {
    console.error('payouts/calculate error:', e)
    return c.json({ error: '精算バッチの実行に失敗しました' }, 500)
  }
})

/** GET /api/admin/financial-statements/:id - 帳票個別取得 */
app.get('/financial-statements/:id', requireAdmin, async (c) => {
  try {
    const { id } = c.req.param()
    const stmt = await c.env.DB.prepare(`
      SELECT ps.*, u.name as user_name, u.email as user_email
      FROM payout_statements ps
      LEFT JOIN users u ON ps.user_id = u.id
      WHERE ps.id = ?
    `).bind(id).first()
    if (!stmt) return c.json({ error: '帳票が見つかりません' }, 404)
    return c.json({ statement: stmt })
  } catch (e) {
    return c.json({ error: '帳票の取得に失敗しました' }, 500)
  }
})


// ============================================
// 拠点ホスト管理（HostManagement.tsx用）
// approval_statusはusersテーブルに存在しないため、保有サイトの承認状況から導出する
// ============================================

/** GET /api/admin/hosts - 拠点ホスト一覧 */
app.get('/hosts', requireAdmin, async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT
        u.id, u.email, u.name, u.phone, u.role, u.avatar_url,
        u.email_verified, u.phone_verified, u.created_at, u.updated_at,
        COUNT(s.id) AS site_count,
        CASE
          WHEN SUM(CASE WHEN s.status = 'PENDING' THEN 1 ELSE 0 END) > 0 THEN 'PENDING'
          WHEN SUM(CASE WHEN s.status = 'APPROVED' THEN 1 ELSE 0 END) > 0 THEN 'APPROVED'
          WHEN SUM(CASE WHEN s.status = 'REJECTED' THEN 1 ELSE 0 END) > 0 THEN 'REJECTED'
          ELSE 'PENDING'
        END AS approval_status
      FROM users u
      LEFT JOIN sites s ON s.host_id = u.id
      WHERE u.role = 'HOST' AND COALESCE(u.is_archived, 0) = 0
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `).all()
    return c.json({ hosts: result.results || [] })
  } catch (e) {
    console.error('admin hosts list error:', e)
    return c.json({ error: '拠点ホスト一覧の取得に失敗しました' }, 500)
  }
})

/** GET /api/admin/hosts/:hostId - 拠点ホスト詳細 */
app.get('/hosts/:hostId', requireAdmin, async (c) => {
  const hostId = c.req.param('hostId')
  try {
    const host = await c.env.DB.prepare(
      `SELECT id, email, name, phone, role, avatar_url, email_verified, phone_verified, created_at, updated_at
       FROM users WHERE id = ? AND role = 'HOST'`
    ).bind(hostId).first()
    if (!host) return c.json({ error: '拠点ホストが見つかりません' }, 404)

    const sites = await c.env.DB.prepare(
      'SELECT * FROM sites WHERE host_id = ? ORDER BY created_at DESC'
    ).bind(hostId).all()

    return c.json({ host, sites: sites.results || [] })
  } catch (e) {
    console.error('admin host detail error:', e)
    return c.json({ error: '拠点ホスト詳細の取得に失敗しました' }, 500)
  }
})

/** POST /api/admin/hosts/:hostId/approve - 拠点ホスト承認（保留中サイトを承認） */
app.post('/hosts/:hostId/approve', requireAdmin, async (c) => {
  const hostId = c.req.param('hostId')
  try {
    const result = await c.env.DB.prepare(
      "UPDATE sites SET status = 'APPROVED' WHERE host_id = ? AND status = 'PENDING'"
    ).bind(hostId).run()
    return c.json({ success: true, approved_sites: result.meta?.changes ?? 0 })
  } catch (e) {
    console.error('admin host approve error:', e)
    return c.json({ error: '承認処理に失敗しました' }, 500)
  }
})

/** POST /api/admin/hosts/:hostId/reject - 拠点ホスト却下（保留中サイトを却下） */
app.post('/hosts/:hostId/reject', requireAdmin, async (c) => {
  const hostId = c.req.param('hostId')
  try {
    const result = await c.env.DB.prepare(
      "UPDATE sites SET status = 'REJECTED' WHERE host_id = ? AND status = 'PENDING'"
    ).bind(hostId).run()
    return c.json({ success: true, rejected_sites: result.meta?.changes ?? 0 })
  } catch (e) {
    console.error('admin host reject error:', e)
    return c.json({ error: '却下処理に失敗しました' }, 500)
  }
})

/** DELETE /api/admin/hosts/:hostId - 拠点ホスト削除（アーカイブ） */
app.delete('/hosts/:hostId', requireAdmin, async (c) => {
  const hostId = c.req.param('hostId')
  try {
    const host = await c.env.DB.prepare(
      "SELECT id FROM users WHERE id = ? AND role = 'HOST'"
    ).bind(hostId).first()
    if (!host) return c.json({ error: '拠点ホストが見つかりません' }, 404)

    // 物理削除ではなくアーカイブ（予約・収益履歴との整合性を保つ）
    await c.env.DB.prepare(
      "UPDATE users SET is_archived = 1, archived_at = datetime('now') WHERE id = ?"
    ).bind(hostId).run()
    await c.env.DB.prepare(
      "UPDATE sites SET status = 'SUSPENDED' WHERE host_id = ?"
    ).bind(hostId).run()

    return c.json({ success: true, message: '拠点ホストをアーカイブしました' })
  } catch (e) {
    console.error('admin host delete error:', e)
    return c.json({ error: '削除処理に失敗しました' }, 500)
  }
})

// ============================================
// 事務所管理（OfficeManagement.tsx / OfficeDetail.tsx用）
// フロントエンドの representative_name / email / phone / address / description は
// offices.manager_name / contact_email と office_details の各カラムにマッピングする
// ============================================

/** GET /api/admin/offices - 事務所一覧 */
app.get('/offices', requireAdmin, async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT
        o.id, o.name, o.status, o.commission_rate, o.created_at,
        o.contact_email AS email,
        COALESCE(od.representative_name, o.manager_name) AS representative_name,
        od.phone, od.address, od.description,
        COALESCE(od.total_therapists, o.therapist_count, 0) AS total_therapists,
        COALESCE(od.monthly_revenue, 0) AS monthly_revenue
      FROM offices o
      LEFT JOIN office_details od ON od.office_id = o.id
      ORDER BY o.created_at DESC
    `).all()
    return c.json({ offices: result.results || [] })
  } catch (e) {
    console.error('admin offices list error:', e)
    return c.json({ error: '事務所一覧の取得に失敗しました' }, 500)
  }
})

/** GET /api/admin/offices/:officeId - 事務所詳細 */
app.get('/offices/:officeId', requireAdmin, async (c) => {
  const officeId = c.req.param('officeId')
  try {
    const office = await c.env.DB.prepare(`
      SELECT
        o.*, o.contact_email AS email,
        COALESCE(od.representative_name, o.manager_name) AS representative_name,
        od.phone, od.address, od.description,
        COALESCE(od.total_therapists, o.therapist_count, 0) AS total_therapists,
        COALESCE(od.monthly_revenue, 0) AS monthly_revenue
      FROM offices o
      LEFT JOIN office_details od ON od.office_id = o.id
      WHERE o.id = ?
    `).bind(officeId).first()
    if (!office) return c.json({ error: '事務所が見つかりません' }, 404)
    return c.json({ office })
  } catch (e) {
    console.error('admin office detail error:', e)
    return c.json({ error: '事務所詳細の取得に失敗しました' }, 500)
  }
})

/** POST /api/admin/offices - 事務所新規作成 */
app.post('/offices', requireAdmin, async (c) => {
  try {
    const body = await c.req.json() as {
      name?: string; representative_name?: string; email?: string;
      phone?: string; address?: string; description?: string;
      commission_rate?: number; area_code?: string;
    }
    if (!body.name || !body.email) {
      return c.json({ error: 'name と email は必須です' }, 400)
    }

    // offices.user_id は NOT NULL UNIQUE のため、事務所用ユーザーを用意する
    let officeUserId: string
    const existingUser = await c.env.DB.prepare(
      'SELECT id, role FROM users WHERE email = ?'
    ).bind(body.email).first<{ id: string; role: string }>()
    if (existingUser) {
      const linked = await c.env.DB.prepare(
        'SELECT id FROM offices WHERE user_id = ?'
      ).bind(existingUser.id).first()
      if (linked) {
        return c.json({ error: 'このメールアドレスには既に事務所が登録されています' }, 409)
      }
      officeUserId = existingUser.id
    } else {
      officeUserId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      await c.env.DB.prepare(
        `INSERT INTO users (id, email, name, role, created_at)
         VALUES (?, ?, ?, 'THERAPIST_OFFICE', datetime('now'))`
      ).bind(officeUserId, body.email, body.representative_name || body.name).run()
    }

    const officeId = `office_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    await c.env.DB.prepare(
      `INSERT INTO offices (id, user_id, name, area_code, manager_name, contact_email, commission_rate, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'APPROVED')`
    ).bind(
      officeId, officeUserId, body.name,
      body.area_code || 'TOKYO',
      body.representative_name || body.name,
      body.email,
      body.commission_rate ?? 15.0
    ).run()

    const detailId = `odetail_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    await c.env.DB.prepare(
      `INSERT INTO office_details (id, office_id, representative_name, phone, address, description)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      detailId, officeId,
      body.representative_name || null,
      body.phone || null,
      body.address || null,
      body.description || null
    ).run()

    return c.json({ success: true, id: officeId }, 201)
  } catch (e) {
    console.error('admin office create error:', e)
    return c.json({ error: '事務所の作成に失敗しました' }, 500)
  }
})

/** PUT /api/admin/offices/:officeId - 事務所更新（ステータスのみの更新にも対応） */
app.put('/offices/:officeId', requireAdmin, async (c) => {
  const officeId = c.req.param('officeId')
  try {
    const body = await c.req.json() as {
      name?: string; representative_name?: string; email?: string;
      phone?: string; address?: string; description?: string;
      commission_rate?: number; status?: string;
    }

    const office = await c.env.DB.prepare('SELECT id FROM offices WHERE id = ?').bind(officeId).first()
    if (!office) return c.json({ error: '事務所が見つかりません' }, 404)

    if (body.status !== undefined) {
      const validStatuses = ['PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED']
      if (!validStatuses.includes(body.status)) {
        return c.json({ error: '無効なステータスです' }, 400)
      }
    }

    await c.env.DB.prepare(`
      UPDATE offices SET
        name = COALESCE(?, name),
        manager_name = COALESCE(?, manager_name),
        contact_email = COALESCE(?, contact_email),
        commission_rate = COALESCE(?, commission_rate),
        status = COALESCE(?, status),
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      body.name ?? null,
      body.representative_name ?? null,
      body.email ?? null,
      body.commission_rate ?? null,
      body.status ?? null,
      officeId
    ).run()

    // 連絡先詳細はoffice_detailsにUPSERT
    if (body.representative_name !== undefined || body.phone !== undefined ||
        body.address !== undefined || body.description !== undefined) {
      const detail = await c.env.DB.prepare(
        'SELECT id FROM office_details WHERE office_id = ?'
      ).bind(officeId).first<{ id: string }>()
      if (detail) {
        await c.env.DB.prepare(`
          UPDATE office_details SET
            representative_name = COALESCE(?, representative_name),
            phone = COALESCE(?, phone),
            address = COALESCE(?, address),
            description = COALESCE(?, description),
            updated_at = datetime('now')
          WHERE office_id = ?
        `).bind(
          body.representative_name ?? null,
          body.phone ?? null,
          body.address ?? null,
          body.description ?? null,
          officeId
        ).run()
      } else {
        const detailId = `odetail_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        await c.env.DB.prepare(
          `INSERT INTO office_details (id, office_id, representative_name, phone, address, description)
           VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(
          detailId, officeId,
          body.representative_name ?? null,
          body.phone ?? null,
          body.address ?? null,
          body.description ?? null
        ).run()
      }
    }

    return c.json({ success: true })
  } catch (e) {
    console.error('admin office update error:', e)
    return c.json({ error: '事務所の更新に失敗しました' }, 500)
  }
})

/** DELETE /api/admin/offices/:officeId - 事務所削除 */
app.delete('/offices/:officeId', requireAdmin, async (c) => {
  const officeId = c.req.param('officeId')
  try {
    const office = await c.env.DB.prepare('SELECT id FROM offices WHERE id = ?').bind(officeId).first()
    if (!office) return c.json({ error: '事務所が見つかりません' }, 404)

    await c.env.DB.prepare('DELETE FROM office_details WHERE office_id = ?').bind(officeId).run().catch(() => {})
    await c.env.DB.prepare('DELETE FROM offices WHERE id = ?').bind(officeId).run()

    return c.json({ success: true, message: '事務所を削除しました' })
  } catch (e) {
    console.error('admin office delete error:', e)
    return c.json({ error: '事務所の削除に失敗しました' }, 500)
  }
})

// ============================================
// 決済オペレーション（Payments.tsx用）
// ============================================

/** POST /api/admin/payments/refund - 返金実行 {payment_id, amount?} */
app.post('/payments/refund', requireAdmin, async (c) => {
  try {
    const { payment_id, amount } = await c.req.json() as { payment_id?: string; amount?: number }
    if (!payment_id) return c.json({ error: 'payment_idが必要です' }, 400)

    const payment = await c.env.DB.prepare(
      'SELECT id, booking_id, amount, stripe_payment_intent_id, status FROM payments WHERE id = ?'
    ).bind(payment_id).first<{
      id: string; booking_id: string; amount: number;
      stripe_payment_intent_id: string | null; status: string;
    }>()
    if (!payment) return c.json({ error: '決済が見つかりません' }, 404)
    if (payment.status === 'REFUNDED') return c.json({ error: 'この決済は既に返金済みです' }, 400)
    if (!payment.stripe_payment_intent_id) {
      return c.json({ error: 'Stripe決済IDが記録されていないため返金できません' }, 400)
    }
    if (!c.env.STRIPE_SECRET) {
      return c.json({ error: 'Stripeが設定されていません' }, 500)
    }

    // Stripe返金API呼び出し
    const params = new URLSearchParams({ payment_intent: payment.stripe_payment_intent_id })
    if (amount && amount > 0 && amount <= payment.amount) {
      params.set('amount', String(amount))
    }
    const stripeRes = await fetch('https://api.stripe.com/v1/refunds', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${c.env.STRIPE_SECRET}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })
    const refund = await stripeRes.json() as { id?: string; status?: string; error?: { message?: string } }
    if (!stripeRes.ok) {
      return c.json({ error: `Stripe返金エラー: ${refund.error?.message || '不明なエラー'}` }, 502)
    }

    await c.env.DB.prepare(
      "UPDATE payments SET status = 'REFUNDED', updated_at = datetime('now') WHERE id = ?"
    ).bind(payment_id).run()
    if (payment.booking_id) {
      await c.env.DB.prepare(
        "UPDATE bookings SET payment_status = 'REFUNDED' WHERE id = ?"
      ).bind(payment.booking_id).run().catch(() => {})
    }

    return c.json({ success: true, refund_id: refund.id, message: '返金処理が完了しました' })
  } catch (e) {
    console.error('admin refund error:', e)
    return c.json({ error: '返金処理に失敗しました' }, 500)
  }
})

/** POST /api/admin/payments/retry - 決済状態の再確認・再同期 {payment_id} */
app.post('/payments/retry', requireAdmin, async (c) => {
  try {
    const { payment_id } = await c.req.json() as { payment_id?: string }
    if (!payment_id) return c.json({ error: 'payment_idが必要です' }, 400)

    const payment = await c.env.DB.prepare(
      'SELECT id, booking_id, stripe_payment_intent_id, status FROM payments WHERE id = ?'
    ).bind(payment_id).first<{
      id: string; booking_id: string;
      stripe_payment_intent_id: string | null; status: string;
    }>()
    if (!payment) return c.json({ error: '決済が見つかりません' }, 404)
    if (!payment.stripe_payment_intent_id) {
      return c.json({ error: 'Stripe決済IDが記録されていないため再確認できません' }, 400)
    }
    if (!c.env.STRIPE_SECRET) {
      return c.json({ error: 'Stripeが設定されていません' }, 500)
    }

    // Stripeから最新の決済状態を取得してDBに反映
    const stripeRes = await fetch(
      `https://api.stripe.com/v1/payment_intents/${payment.stripe_payment_intent_id}`,
      { headers: { 'Authorization': `Bearer ${c.env.STRIPE_SECRET}` } }
    )
    const intent = await stripeRes.json() as { status?: string; error?: { message?: string } }
    if (!stripeRes.ok) {
      return c.json({ error: `Stripe照会エラー: ${intent.error?.message || '不明なエラー'}` }, 502)
    }

    let newStatus = payment.status
    if (intent.status === 'succeeded') newStatus = 'COMPLETED'
    else if (intent.status === 'canceled') newStatus = 'FAILED'

    if (newStatus !== payment.status) {
      await c.env.DB.prepare(
        "UPDATE payments SET status = ?, updated_at = datetime('now') WHERE id = ?"
      ).bind(newStatus, payment_id).run()
      if (newStatus === 'COMPLETED' && payment.booking_id) {
        await c.env.DB.prepare(
          "UPDATE bookings SET payment_status = 'PAID', status = 'CONFIRMED' WHERE id = ?"
        ).bind(payment.booking_id).run().catch(() => {})
      }
    }

    return c.json({
      success: true,
      stripe_status: intent.status,
      payment_status: newStatus,
      message: newStatus !== payment.status ? '決済状態を更新しました' : '決済状態に変更はありません',
    })
  } catch (e) {
    console.error('admin payment retry error:', e)
    return c.json({ error: '決済の再確認に失敗しました' }, 500)
  }
})

// ============================================
// 予約オペレーション（BookingLogs.tsx用）
// ============================================

/** POST /api/admin/bookings/:bookingId/confirm - 予約を確定 */
app.post('/bookings/:bookingId/confirm', requireAdmin, async (c) => {
  const bookingId = c.req.param('bookingId')
  try {
    const booking = await c.env.DB.prepare(
      'SELECT id, status FROM bookings WHERE id = ?'
    ).bind(bookingId).first<{ id: string; status: string }>()
    if (!booking) return c.json({ error: '予約が見つかりません' }, 404)
    if (booking.status !== 'PENDING') {
      return c.json({ error: `PENDING状態の予約のみ確定できます（現在: ${booking.status}）` }, 400)
    }

    await c.env.DB.prepare(
      "UPDATE bookings SET status = 'CONFIRMED' WHERE id = ?"
    ).bind(bookingId).run()

    return c.json({ success: true, message: '予約を確定しました' })
  } catch (e) {
    console.error('admin booking confirm error:', e)
    return c.json({ error: '予約の確定に失敗しました' }, 500)
  }
})

/** POST /api/admin/bookings/:bookingId/cancel - 予約をキャンセル */
app.post('/bookings/:bookingId/cancel', requireAdmin, async (c) => {
  const bookingId = c.req.param('bookingId')
  try {
    const booking = await c.env.DB.prepare(
      'SELECT id, status, timelock_id FROM bookings WHERE id = ?'
    ).bind(bookingId).first<{ id: string; status: string; timelock_id: string | null }>()
    if (!booking) return c.json({ error: '予約が見つかりません' }, 404)
    if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
      return c.json({ error: 'この予約はキャンセルできません' }, 400)
    }

    await c.env.DB.prepare(
      "UPDATE bookings SET status = 'CANCELLED' WHERE id = ?"
    ).bind(bookingId).run()

    if (booking.timelock_id) {
      await c.env.DB.prepare(
        "UPDATE booking_timelocks SET status = 'RELEASED' WHERE id = ?"
      ).bind(booking.timelock_id).run().catch(() => {})
    }

    return c.json({ success: true, message: '予約をキャンセルしました' })
  } catch (e) {
    console.error('admin booking cancel error:', e)
    return c.json({ error: '予約のキャンセルに失敗しました' }, 500)
  }
})

export default app
