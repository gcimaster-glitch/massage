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
// GET /api/storage/upload-url - R2署名付きURL取得
// ============================================
notifyApp.get('/upload-url', async (c) => {
  const fileName = c.req.query('file')

  if (!fileName) {
    return c.json({ error: 'File name required' }, 400)
  }

  // ファイル名のサニタイズ（パストラバーサル対策）
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
  const key = `uploads/${Date.now()}-${sanitizedFileName}`

  // R2署名付きURLの生成
  // TODO: 本番環境ではR2の署名付きURLを生成する
  return c.json({
    url: `https://storage.hogusy.com/${key}`,
    key,
  })
})

export default notifyApp
