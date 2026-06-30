// ============================================
// KYC (本人確認) Routes
// ============================================
import { Hono } from 'hono'
import { verifyJWT } from './auth-helpers'
import { checkRateLimit, RATE_LIMITS } from './rate-limit'

type Bindings = {
  DB: D1Database
  STORAGE: R2Bucket
  JWT_SECRET: string
  RESEND_API_KEY: string
}

const kycApp = new Hono<{ Bindings: Bindings }>()

// ============================================
// POST /api/kyc - KYC書類提出（ユーザー用）
// Base64エンコードされた画像データを受け取りR2に保存
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

    const { id_type, id_number, document_data, file_name, mime_type } = await c.req.json()

    if (!document_data) {
      return c.json({ error: '書類データが必要です' }, 400)
    }
    if (!id_type) {
      return c.json({ error: '書類種別が必要です' }, 400)
    }

    // Base64デコード
    let fileBuffer: ArrayBuffer
    try {
      const base64Data = (document_data as string).replace(/^data:[^;]+;base64,/, '')
      const binaryStr = atob(base64Data)
      const bytes = new Uint8Array(binaryStr.length)
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i)
      }
      fileBuffer = bytes.buffer
    } catch {
      return c.json({ error: '書類データの形式が不正です' }, 400)
    }

    // ファイルサイズチェック（最大10MB）
    if (fileBuffer.byteLength > 10 * 1024 * 1024) {
      return c.json({ error: 'ファイルサイズは10MB以下にしてください' }, 400)
    }

    // R2への保存
    if (!c.env.STORAGE) {
      return c.json({ error: 'ストレージが設定されていません' }, 503)
    }

    const timestamp = Date.now()
    const sanitizedFileName = ((file_name as string) || 'document').replace(/[^a-zA-Z0-9._-]/g, '_')
    const r2Key = `kyc/${payload.userId}/${timestamp}-${sanitizedFileName}`
    const docId = `kyc_${timestamp}_${Math.random().toString(36).slice(2, 9)}`

    await c.env.STORAGE.put(r2Key, fileBuffer, {
      httpMetadata: {
        contentType: (mime_type as string) || 'application/octet-stream',
      },
      customMetadata: {
        userId: payload.userId as string,
        idType: id_type as string,
        uploadedAt: new Date().toISOString(),
      },
    })

    // kyc_documentsテーブルに記録
    await c.env.DB.prepare(`
      INSERT INTO kyc_documents (id, user_id, id_type, id_number, r2_key, file_name, file_size, mime_type, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)
    `).bind(
      docId,
      payload.userId,
      id_type,
      id_number || null,
      r2Key,
      sanitizedFileName,
      fileBuffer.byteLength,
      (mime_type as string) || 'application/octet-stream',
      timestamp,
      timestamp
    ).run()

    // usersテーブルのkyc_statusをPENDINGに更新
    await c.env.DB.prepare(`
      UPDATE users
      SET kyc_status = 'PENDING', updated_at = datetime('now')
      WHERE id = ?
    `).bind(payload.userId).run()

    return c.json({
      success: true,
      kyc_status: 'PENDING',
      document_id: docId,
      message: '本人確認書類を受け付けました。審査には1〜3営業日かかります。'
    })

  } catch (e) {
    console.error('KYC submission error:', e)
    return c.json({ error: 'KYC提出に失敗しました' }, 500)
  }
})

// ============================================
// GET /api/kyc/status - KYC審査状況確認（ユーザー用）
// ============================================
kycApp.get('/status', async (c) => {
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

    const user = await c.env.DB.prepare(
      'SELECT kyc_status FROM users WHERE id = ?'
    ).bind(payload.userId).first<{ kyc_status: string }>()

    const docs = await c.env.DB.prepare(`
      SELECT id, id_type, status, rejection_reason, created_at, updated_at
      FROM kyc_documents
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 5
    `).bind(payload.userId).all()

    return c.json({
      kyc_status: user?.kyc_status || 'NONE',
      documents: docs.results || []
    })

  } catch (e) {
    console.error('KYC status error:', e)
    return c.json({ error: 'KYC状況の取得に失敗しました' }, 500)
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

    // kyc_documentsテーブルとusersを結合して取得
    const result = await c.env.DB.prepare(`
      SELECT
        kd.id as doc_id,
        kd.user_id,
        kd.id_type,
        kd.status,
        kd.file_name,
        kd.created_at,
        u.email,
        u.name,
        u.phone,
        u.kyc_status as user_kyc_status
      FROM kyc_documents kd
      JOIN users u ON kd.user_id = u.id
      WHERE kd.status = 'PENDING'
      ORDER BY kd.created_at DESC
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
    const { status, reason, doc_id } = await c.req.json()

    if (!c.env.DB) {
      return c.json({ error: 'Database not available' }, 500)
    }

    if (!['VERIFIED', 'REJECTED'].includes(status)) {
      return c.json({ error: 'Invalid status. Must be VERIFIED or REJECTED' }, 400)
    }

    const now = Date.now()

    // kyc_documentsのステータス更新
    if (doc_id) {
      await c.env.DB.prepare(`
        UPDATE kyc_documents
        SET status = ?, rejection_reason = ?, reviewed_at = ?, updated_at = ?
        WHERE id = ? AND user_id = ?
      `).bind(status, reason || null, now, now, doc_id, userId).run()
    } else {
      // doc_idなしの場合は最新のPENDINGドキュメントを更新
      await c.env.DB.prepare(`
        UPDATE kyc_documents
        SET status = ?, rejection_reason = ?, reviewed_at = ?, updated_at = ?
        WHERE user_id = ? AND status = 'PENDING'
      `).bind(status, reason || null, now, now, userId).run()
    }

    // usersテーブルのkyc_statusを更新
    await c.env.DB.prepare(`
      UPDATE users
      SET kyc_status = ?, updated_at = datetime('now')
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
