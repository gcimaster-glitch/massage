// ============================================
// Notification & Storage Routes
// ============================================
import { Hono } from 'hono'

type Bindings = {
  STORAGE: R2Bucket
  RESEND_API_KEY: string
}

const notifyApp = new Hono<{ Bindings: Bindings }>()

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
