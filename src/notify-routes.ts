// ============================================
// Notification & Storage Routes
// ============================================
import { Hono } from 'hono'

type Bindings = {
  STORAGE: R2Bucket
  RESEND_API_KEY: string
  DB: D1Database
}

type Variables = {
  userId: string
  userRole: string
}

const notifyApp = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// 認証ミドルウェア（簡易版）
const requireAuth = async (c: any, next: () => Promise<void>) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: '認証が必要です' }, 401)
  }
  const token = authHeader.substring(7)
  try {
    const { DB } = c.env
    const session = await DB.prepare(
      'SELECT user_id FROM sessions WHERE token = ? AND expires_at > CURRENT_TIMESTAMP'
    ).bind(token).first<{ user_id: string }>()
    if (!session) return c.json({ error: '無効なトークンです' }, 401)
    const user = await DB.prepare(
      'SELECT id, role FROM users WHERE id = ?'
    ).bind(session.user_id).first<{ id: string; role: string }>()
    if (!user) return c.json({ error: 'ユーザーが見つかりません' }, 401)
    c.set('userId', user.id)
    c.set('userRole', user.role)
    await next()
  } catch (e) {
    return c.json({ error: '認証エラー' }, 401)
  }
}

// ============================================
// GET /api/notify/notifications - 通知一覧取得
// ============================================
notifyApp.get('/notifications', requireAuth, async (c) => {
  const { DB } = c.env
  const userId = c.get('userId')
  const type = c.req.query('type') || ''
  const unreadOnly = c.req.query('unread_only') === 'true'

  try {
    let sql = 'SELECT * FROM notifications WHERE user_id = ?'
    const params: (string | number)[] = [userId]
    if (type) { sql += ' AND type = ?'; params.push(type) }
    if (unreadOnly) { sql += ' AND is_read = 0' }
    sql += ' ORDER BY created_at DESC LIMIT 50'

    const result = await DB.prepare(sql).bind(...params).all()
    const unreadCount = await DB.prepare(
      'SELECT COUNT(*) as cnt FROM notifications WHERE user_id = ? AND is_read = 0'
    ).bind(userId).first<{ cnt: number }>()

    return c.json({
      notifications: result.results || [],
      unread_count: unreadCount?.cnt || 0,
    })
  } catch (e) {
    console.error('Notifications fetch error:', e)
    return c.json({ error: '通知の取得に失敗しました' }, 500)
  }
})

// ============================================
// PATCH /api/notify/notifications/:id/read - 既読にする
// ============================================
notifyApp.patch('/notifications/:id/read', requireAuth, async (c) => {
  const { DB } = c.env
  const userId = c.get('userId')
  const notifId = c.req.param('id')

  try {
    await DB.prepare(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?'
    ).bind(notifId, userId).run()
    return c.json({ success: true })
  } catch (e) {
    return c.json({ error: '更新に失敗しました' }, 500)
  }
})

// ============================================
// PATCH /api/notify/notifications/read-all - 全て既読にする
// ============================================
notifyApp.patch('/notifications/read-all', requireAuth, async (c) => {
  const { DB } = c.env
  const userId = c.get('userId')

  try {
    await DB.prepare(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ?'
    ).bind(userId).run()
    return c.json({ success: true })
  } catch (e) {
    return c.json({ error: '更新に失敗しました' }, 500)
  }
})

// ============================================
// POST /api/notify/email - メール送信（内部用）
// ============================================
notifyApp.post('/email', async (c) => {
  try {
    if (!c.env.RESEND_API_KEY) {
      return c.json({ error: 'Email service not configured' }, 503)
    }

    const { to, subject, html } = await c.req.json()

    if (!to || !subject || !html) {
      return c.json({ error: 'to, subject, html are required' }, 400)
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${c.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'HOGUSY <noreply@hogusy.com>',
        to,
        subject,
        html,
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('Resend API error:', errorBody)
      return c.json({ error: 'Failed to send email' }, 500)
    }

    const result = await response.json()
    return c.json(result)
  } catch (e) {
    console.error('Email notification error:', e)
    return c.json({ error: 'Email notification failed' }, 500)
  }
})

// ============================================
// GET /api/storage/upload-url - R2アップロードURL取得
// ============================================
notifyApp.get('/upload-url', async (c) => {
  const fileName = c.req.query('file')

  if (!fileName) {
    return c.json({ error: 'File name required' }, 400)
  }

  if (!c.env.STORAGE) {
    return c.json({ error: 'Storage not configured' }, 503)
  }

  // ファイル名のサニタイズ（パストラバーサル対策）
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
  const key = `uploads/${Date.now()}-${sanitizedFileName}`

  // Cloudflare WorkersではR2の署名付きURLはネイティブサポートなし。
  // /api/storage/uploadエンドポイントを経由してアップロードする。
  const origin = new URL(c.req.url).origin
  return c.json({
    url: `${origin}/api/storage/upload`,
    key,
    method: 'POST',
  })
})

// ============================================
// POST /api/storage/upload - R2へ直接アップロード
// ============================================
notifyApp.post('/upload', async (c) => {
  if (!c.env.STORAGE) {
    return c.json({ error: 'Storage not configured' }, 503)
  }

  const key = c.req.query('key')
  if (!key) {
    return c.json({ error: 'Key parameter required' }, 400)
  }

  const contentType = c.req.header('Content-Type') || 'application/octet-stream'
  const body = await c.req.arrayBuffer()

  // ファイルサイズチェック（20MB以下）
  if (body.byteLength > 20 * 1024 * 1024) {
    return c.json({ error: 'ファイルサイズは20MB以下にしてください' }, 400)
  }

  await c.env.STORAGE.put(key, body, {
    httpMetadata: { contentType },
    customMetadata: {
      uploadedAt: new Date().toISOString(),
    },
  })

  const origin = new URL(c.req.url).origin
  return c.json({
    success: true,
    key,
    url: `${origin}/api/storage/${key}`,
  })
})

export default notifyApp
