// ============================================
// User Management Routes (Admin only)
// ============================================
import { Hono } from 'hono'
import { verifyJWT } from './auth-helpers'

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
}

const userManagementApp = new Hono<{ Bindings: Bindings }>()

// Middleware: Check admin role
const requireAdmin = async (c: Parameters<typeof app.get>[1], next: () => Promise<void>) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: '認証が必要です' }, 401)
  }

  const token = authHeader.substring(7)
  try {
    const decoded = verifyJWT(token, c.env.JWT_SECRET)
    if (decoded.role !== 'ADMIN') {
      return c.json({ error: '管理者権限が必要です' }, 403)
    }
    c.set('user', decoded)
    await next()
  } catch (e) {
    return c.json({ error: '無効なトークンです' }, 401)
  }
}

// Apply admin middleware to all routes
userManagementApp.use('*', requireAdmin)

// ============================================
// GET /users - Get all users with filters
// ============================================
userManagementApp.get('/', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '50')
    const search = c.req.query('search') || ''
    const role = c.req.query('role') || ''
    const archived = c.req.query('archived') === 'true'
    const offset = (page - 1) * limit

    let query = `
      SELECT 
        u.id, u.email, u.name, u.phone, u.role, 
        u.avatar_url, u.email_verified, u.phone_verified,
        u.kyc_status, u.is_archived, u.created_at, u.updated_at,
        u.archived_at,
        COUNT(DISTINCT sa.id) as social_accounts_count
      FROM users u
      LEFT JOIN social_accounts sa ON u.id = sa.user_id
      WHERE u.is_archived = ?
    `
    const params: (string | number | null)[] = [archived ? 1 : 0]

    if (search) {
      query += ` AND (u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)`
      const searchParam = `%${search}%`
      params.push(searchParam, searchParam, searchParam)
    }

    if (role) {
      query += ` AND u.role = ?`
      params.push(role)
    }

    query += ` GROUP BY u.id ORDER BY u.created_at DESC LIMIT ? OFFSET ?`
    params.push(limit, offset)

    const { results: users } = await c.env.DB.prepare(query).bind(...params).all()

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM users WHERE is_archived = ?`
    const countParams: any[] = [archived ? 1 : 0]
    
    if (search) {
      countQuery += ` AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)`
      const searchParam = `%${search}%`
      countParams.push(searchParam, searchParam, searchParam)
    }
    
    if (role) {
      countQuery += ` AND role = ?`
      countParams.push(role)
    }

    const { results: countResults } = await c.env.DB.prepare(countQuery).bind(...countParams).all()
    const total = (countResults[0]  as Record<string, unknown>).total

    return c.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (e) {
    console.error('Get users error:', e)
    return c.json({ error: 'サーバーエラーが発生しました' }, 500)
  }
})

// ============================================
// GET /users/:id - Get user details
// ============================================
userManagementApp.get('/:id', async (c) => {
  try {
    const userId = c.req.param('id')

    // Get user basic info
    const { results: users } = await c.env.DB.prepare(`
      SELECT 
        id, email, name, phone, role, avatar_url,
        email_verified, phone_verified, kyc_status,
        is_archived, created_at, updated_at, archived_at
      FROM users WHERE id = ?
    `).bind(userId).all()

    if (users.length === 0) {
      return c.json({ error: 'ユーザーが見つかりません' }, 404)
    }

    const user = users[0]

    // Get social accounts
    const { results: socialAccounts } = await c.env.DB.prepare(`
      SELECT provider, provider_email, created_at, last_used_at
      FROM social_accounts WHERE user_id = ?
    `).bind(userId).all()

    // Get booking statistics (if bookings table exists)
    let bookingStats = { total: 0, completed: 0, cancelled: 0 }
    try {
      const { results: stats } = await c.env.DB.prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
        FROM bookings WHERE user_id = ?
      `).bind(userId).all()
      if (stats.length > 0) {
        bookingStats = stats[0] as any
      }
    } catch (e) {
      // Bookings table might not exist yet
    }

    return c.json({
      user,
      socialAccounts,
      bookingStats,
    })
  } catch (e) {
    console.error('Get user details error:', e)
    return c.json({ error: 'サーバーエラーが発生しました' }, 500)
  }
})

// ============================================
// PUT /users/:id - Update user
// ============================================
userManagementApp.put('/:id', async (c) => {
  try {
    const userId = c.req.param('id')
    const body = await c.req.json()
    const { name, phone, role, email_verified, phone_verified, kyc_status } = body

    // Build update query dynamically
    const updates: string[] = []
    const params: (string | number | null)[] = []

    if (name !== undefined) {
      updates.push('name = ?')
      params.push(name)
    }
    if (phone !== undefined) {
      updates.push('phone = ?')
      params.push(phone)
    }
    if (role !== undefined) {
      updates.push('role = ?')
      params.push(role)
    }
    if (email_verified !== undefined) {
      updates.push('email_verified = ?')
      params.push(email_verified ? 1 : 0)
    }
    if (phone_verified !== undefined) {
      updates.push('phone_verified = ?')
      params.push(phone_verified ? 1 : 0)
    }
    if (kyc_status !== undefined) {
      updates.push('kyc_status = ?')
      params.push(kyc_status)
    }

    if (updates.length === 0) {
      return c.json({ error: '更新するフィールドがありません' }, 400)
    }

    updates.push('updated_at = datetime("now")')
    params.push(userId)

    await c.env.DB.prepare(`
      UPDATE users SET ${updates.join(', ')}
      WHERE id = ?
    `).bind(...params).run()

    return c.json({ success: true, message: 'ユーザー情報を更新しました' })
  } catch (e) {
    console.error('Update user error:', e)
    return c.json({ error: 'サーバーエラーが発生しました' }, 500)
  }
})

// ============================================
// POST /users/:id/archive - Archive user (soft delete)
// ============================================
userManagementApp.post('/:id/archive', async (c) => {
  try {
    const userId = c.req.param('id')

    await c.env.DB.prepare(`
      UPDATE users 
      SET is_archived = 1, archived_at = datetime('now')
      WHERE id = ?
    `).bind(userId).run()

    return c.json({ success: true, message: 'ユーザーをアーカイブしました' })
  } catch (e) {
    console.error('Archive user error:', e)
    return c.json({ error: 'サーバーエラーが発生しました' }, 500)
  }
})

// ============================================
// POST /users/:id/restore - Restore archived user
// ============================================
userManagementApp.post('/:id/restore', async (c) => {
  try {
    const userId = c.req.param('id')

    await c.env.DB.prepare(`
      UPDATE users 
      SET is_archived = 0, archived_at = NULL
      WHERE id = ?
    `).bind(userId).run()

    return c.json({ success: true, message: 'ユーザーを復元しました' })
  } catch (e) {
    console.error('Restore user error:', e)
    return c.json({ error: 'サーバーエラーが発生しました' }, 500)
  }
})

// ============================================
// DELETE /users/:id - Permanently delete user
// ============================================
userManagementApp.delete('/:id', async (c) => {
  try {
    const userId = c.req.param('id')

    // Delete social accounts first (foreign key)
    await c.env.DB.prepare('DELETE FROM social_accounts WHERE user_id = ?').bind(userId).run()
    
    // Delete user
    await c.env.DB.prepare('DELETE FROM users WHERE id = ?').bind(userId).run()

    return c.json({ success: true, message: 'ユーザーを完全に削除しました' })
  } catch (e) {
    console.error('Delete user error:', e)
    return c.json({ error: 'サーバーエラーが発生しました' }, 500)
  }
})

export default userManagementApp
