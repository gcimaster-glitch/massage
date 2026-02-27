// ============================================
// KYC (本人確認) Routes
// ============================================
import { Hono } from 'hono'
import { verifyJWT } from './auth-helpers'
import { checkRateLimit, RATE_LIMITS } from './rate-limit'

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
  RESEND_API_KEY: string
}

const kycApp = new Hono<{ Bindings: Bindings }>()

// ============================================
// POST /api/kyc - KYC書類提出（ユーザー用）
// ============================================
kycApp.post('/', async (c) => {
  const authHeader = c.req.header('Authorization')

  if (!authHeader) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const token = authHeader.replace('Bearer ', '')
    const payload = await verifyJWT(token, c.env.JWT_SECRET)
    if (!payload) {
      return c.json({ error: 'Invalid or expired token' }, 401)
    }

    // === レート制限（KYC提出は1時間に3回まで）===
    if (c.env.DB) {
      const rateLimitResult = await checkRateLimit(
        c.env.DB,
        payload.userId as string,
        'kyc_submit',
        RATE_LIMITS.KYC_SUBMIT // 3回/時間
      )
      if (!rateLimitResult.allowed) {
        return c.json({
          error: `KYC提出が多すぎます。${rateLimitResult.retryAfter}秒後に再試行してください。`,
          retryAfter: rateLimitResult.retryAfter
        }, 429)
      }
    }

    const { id_type, id_number, document_data } = await c.req.json()

    if (!document_data) {
      return c.json({ error: 'Document data is required' }, 400)
    }

    // kyc_status を PENDING に更新
    await c.env.DB.prepare(`
      UPDATE users 
      SET kyc_status = 'PENDING'
      WHERE id = ?
    `).bind(payload.userId).run()

    // TODO: 本番環境では、KYC書類をR2にアップロードし、審査キューに追加
    // await c.env.STORAGE.put(`kyc/${payload.userId}/${Date.now()}.jpg`, document_data)

    return c.json({ success: true, kyc_status: 'PENDING' })
  } catch (e) {
    console.error('KYC submission error:', e)
    return c.json({ error: 'KYC submission failed' }, 500)
  }
})

// ============================================
// GET /api/admin/kyc - KYC審査一覧取得（管理者用）
// ============================================
kycApp.get('/admin', async (c) => {
  try {
    if (!c.env.DB) {
      return c.json({ applications: [] })
    }

    const result = await c.env.DB.prepare(`
      SELECT id, email, name, phone, kyc_status, created_at
      FROM users
      WHERE kyc_status = 'PENDING'
      ORDER BY created_at DESC
    `).all()

    return c.json({ applications: result.results || [] })
  } catch (e) {
    console.error('KYC applications fetch error:', e)
    return c.json({ error: 'Failed to fetch KYC applications' }, 500)
  }
})

// ============================================
// PATCH /api/admin/kyc/:userId - KYC審査（承認/却下）
// ============================================
kycApp.patch('/admin/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const { status, reason } = await c.req.json()

    if (!c.env.DB) {
      return c.json({ error: 'Database not available' }, 500)
    }

    if (!['VERIFIED', 'REJECTED'].includes(status)) {
      return c.json({ error: 'Invalid status. Must be VERIFIED or REJECTED' }, 400)
    }

    await c.env.DB.prepare(`
      UPDATE users 
      SET kyc_status = ?
      WHERE id = ?
    `).bind(status, userId).run()

    // メール通知
    try {
      const user = await c.env.DB.prepare(`
        SELECT email, name FROM users WHERE id = ?
      `).bind(userId).first<{ email: string; name: string }>()

      if (user && user.email && c.env.RESEND_API_KEY) {
        const isApproved = status === 'VERIFIED'
        const emailHtml = isApproved
          ? `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #10b981;">✅ KYC審査が承認されました</h2>
              <p>こんにちは、${user.name}さん</p>
              <p>本人確認（KYC）の審査が完了し、承認されました。</p>
              <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                <h3 style="margin-top: 0;">審査結果</h3>
                <p><strong>ステータス:</strong> ✅ 承認</p>
                <p>これで出張サービスのご予約が可能になりました。</p>
              </div>
              <p>引き続きHOGUSYをご利用ください。</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                このメールは自動送信されています。<br>
                © 2024 HOGUSY. All rights reserved.
              </p>
            </div>`
          : `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ef4444;">❌ KYC審査が却下されました</h2>
              <p>こんにちは、${user.name}さん</p>
              <p>本人確認（KYC）の審査が完了しましたが、残念ながら却下されました。</p>
              <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
                <h3 style="margin-top: 0;">審査結果</h3>
                <p><strong>ステータス:</strong> ❌ 却下</p>
                ${reason ? `<p><strong>理由:</strong> ${reason}</p>` : ''}
                <p>書類を再確認の上、再度申請してください。</p>
              </div>
              <p>ご不明な点はサポートセンターまでお問い合わせください。</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                このメールは自動送信されています。<br>
                © 2024 HOGUSY. All rights reserved.
              </p>
            </div>`

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${c.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'HOGUSY <noreply@hogusy.com>',
            to: user.email,
            subject: isApproved ? '【HOGUSY】本人確認が承認されました' : '【HOGUSY】本人確認が却下されました',
            html: emailHtml,
          }),
        })
      }
    } catch (emailError) {
      // メール送信失敗はログのみ（ステータス更新は成功とみなす）
      console.error('KYC email notification error:', emailError)
    }

    return c.json({ success: true, status })
  } catch (e) {
    console.error('KYC approval error:', e)
    return c.json({ error: 'Failed to update KYC status' }, 500)
  }
})

export default kycApp
