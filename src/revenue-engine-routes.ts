/**
 * revenue-engine-routes.ts
 * 報酬分配エンジン
 *
 * 責務:
 * 1. Stripe Webhookを受信し、決済完了を検知する
 * 2. 決済完了時に transactions テーブルに CHARGE レコードを記録する
 * 3. revenue_share_rules に基づいて transaction_splits を自動生成する
 * 4. 請求書・領収書・支払明細の生成エンドポイントを提供する
 *
 * マウントパス: /api/revenue
 */

import { Hono } from 'hono'
import { verifyJWT } from './auth-helpers'

type Bindings = {
  DB: D1Database
  STRIPE_SECRET: string
  STRIPE_WEBHOOK_SECRET: string
  JWT_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

// ============================================================
// ユーティリティ: ID生成
// ============================================================
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

// ============================================================
// ユーティリティ: 適用すべき分配ルールを取得
// 優先度: オフィス固有ルール > 予約タイプ固有ルール > デフォルト
// ============================================================
async function getRevenueShareRule(
  db: D1Database,
  officeId: string | null,
  bookingType: string | null
): Promise<{
  id: string
  therapist_rate: number
  office_rate: number
  host_rate: number
  platform_rate: number
  promotion_rate: number
} | null> {
  // 優先度の高いルールから順に検索
  const rule = await db.prepare(`
    SELECT id, therapist_rate, office_rate, host_rate, platform_rate, promotion_rate
    FROM revenue_share_rules
    WHERE is_active = 1
      AND (valid_until IS NULL OR valid_until > datetime('now'))
      AND (
        (office_id = ? AND booking_type = ?)  -- 最優先: オフィス+タイプ固有
        OR (office_id = ? AND booking_type IS NULL)  -- オフィス固有
        OR (office_id IS NULL AND booking_type = ?)  -- タイプ固有
        OR (office_id IS NULL AND booking_type IS NULL)  -- デフォルト
      )
    ORDER BY priority DESC
    LIMIT 1
  `).bind(
    officeId || null,
    bookingType || null,
    officeId || null,
    bookingType || null
  ).first<{
    id: string
    therapist_rate: number
    office_rate: number
    host_rate: number
    platform_rate: number
    promotion_rate: number
  }>()

  return rule || null
}

// ============================================================
// ユーティリティ: 予約に紐づくユーザーIDを取得
// ============================================================
async function getBookingStakeholders(db: D1Database, bookingId: string): Promise<{
  userId: string | null          // 顧客
  therapistUserId: string | null // セラピスト（usersテーブルのID）
  officeUserId: string | null    // オフィス（usersテーブルのID）
  hostUserId: string | null      // ホスト（usersテーブルのID）
  officeId: string | null
  bookingType: string | null
  amount: number
  serviceName: string
  scheduledAt: string
} | null> {
  const booking = await db.prepare(`
    SELECT
      b.user_id,
      b.therapist_id,
      b.office_id,
      b.host_user_id,
      b.type AS booking_type,
      b.price AS amount,
      b.service_name,
      b.scheduled_at,
      tp.user_id AS therapist_user_id,
      o.user_id AS office_user_id
    FROM bookings b
    LEFT JOIN therapist_profiles tp ON b.therapist_id = tp.id
    LEFT JOIN offices o ON b.office_id = o.user_id
    WHERE b.id = ?
  `).bind(bookingId).first<{
    user_id: string
    therapist_id: string
    office_id: string | null
    host_user_id: string | null
    booking_type: string
    amount: number
    service_name: string
    scheduled_at: string
    therapist_user_id: string | null
    office_user_id: string | null
  }>()

  if (!booking) return null

  return {
    userId: booking.user_id,
    therapistUserId: booking.therapist_user_id,
    officeUserId: booking.office_user_id,
    hostUserId: booking.host_user_id,
    officeId: booking.office_id,
    bookingType: booking.booking_type,
    amount: booking.amount,
    serviceName: booking.service_name,
    scheduledAt: booking.scheduled_at,
  }
}

// ============================================================
// コア処理: 決済完了後の報酬分配を実行する
// ============================================================
async function processPaymentSplit(
  db: D1Database,
  bookingId: string,
  chargeAmount: number,
  stripePaymentIntentId: string,
  stripeChargeId: string | null
): Promise<{ transactionId: string; splits: Array<{ role: string; amount: number }> }> {
  const stakeholders = await getBookingStakeholders(db, bookingId)
  if (!stakeholders) {
    throw new Error(`Booking not found: ${bookingId}`)
  }

  const rule = await getRevenueShareRule(db, stakeholders.officeId, stakeholders.bookingType)
  if (!rule) {
    throw new Error('No revenue share rule found')
  }

  // 1. transactions テーブルに CHARGE レコードを記録
  const transactionId = generateId('txn')
  const now = new Date().toISOString()

  await db.prepare(`
    INSERT INTO transactions (
      id, type, amount, currency, booking_id,
      stripe_payment_intent_id, stripe_charge_id,
      status, description, processed_at, created_at
    ) VALUES (?, 'CHARGE', ?, 'jpy', ?, ?, ?, 'COMPLETED', ?, ?, ?)
  `).bind(
    transactionId,
    chargeAmount,
    bookingId,
    stripePaymentIntentId,
    stripeChargeId,
    `予約ID: ${bookingId} / ${stakeholders.serviceName}`,
    now,
    now
  ).run()

  // 2. 分配額を計算
  const therapistAmount = Math.floor(chargeAmount * rule.therapist_rate / 100)
  const officeAmount = Math.floor(chargeAmount * rule.office_rate / 100)
  const hostAmount = Math.floor(chargeAmount * rule.host_rate / 100)
  const promotionAmount = Math.floor(chargeAmount * rule.promotion_rate / 100)
  // 端数は本部に帰属
  const platformAmount = chargeAmount - therapistAmount - officeAmount - hostAmount - promotionAmount

  // 3. transaction_splits に分配明細を記録
  const splits: Array<{ role: string; userId: string | null; amount: number; rate: number }> = [
    { role: 'THERAPIST', userId: stakeholders.therapistUserId, amount: therapistAmount, rate: rule.therapist_rate },
    { role: 'OFFICE', userId: stakeholders.officeUserId, amount: officeAmount, rate: rule.office_rate },
    { role: 'HOST', userId: stakeholders.hostUserId, amount: hostAmount, rate: rule.host_rate },
    { role: 'PLATFORM', userId: null, amount: platformAmount, rate: rule.platform_rate },
    { role: 'PROMOTION', userId: null, amount: promotionAmount, rate: rule.promotion_rate },
  ]

  for (const split of splits) {
    // ユーザーIDが不明な場合（ホストなし等）はスキップしない、NULLで記録
    const splitId = generateId('spl')
    await db.prepare(`
      INSERT INTO transaction_splits (
        id, transaction_id, user_id, role,
        revenue_share_rule_id, amount, rate,
        payout_status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)
    `).bind(
      splitId,
      transactionId,
      split.userId,
      split.role,
      rule.id,
      split.amount,
      split.rate,
      now
    ).run()
  }

  // 4. bookingsテーブルのpayment_statusを更新
  await db.prepare(`
    UPDATE bookings
    SET payment_status = 'PAID',
        revenue_share_rule_id = ?,
        updated_at = ?
    WHERE id = ?
  `).bind(rule.id, now, bookingId).run()

  // 5. 領収書を自動生成
  await generateReceipt(db, transactionId, bookingId, stakeholders.userId!, chargeAmount)

  return {
    transactionId,
    splits: splits.map(s => ({ role: s.role, amount: s.amount })),
  }
}

// ============================================================
// ユーティリティ: 領収書を自動生成
// ============================================================
async function generateReceipt(
  db: D1Database,
  transactionId: string,
  bookingId: string,
  userId: string,
  amount: number
): Promise<void> {
  // 領収書番号を生成（REC-YYYYMMDD-XXXXX形式）
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
  const seq = Math.floor(Math.random() * 99999).toString().padStart(5, '0')
  const receiptNumber = `REC-${dateStr}-${seq}`

  // 顧客名を取得
  const user = await db.prepare('SELECT name FROM users WHERE id = ?').bind(userId).first<{ name: string }>()
  const recipientName = user?.name || '不明'

  // 消費税計算（10%）
  const taxAmount = Math.floor(amount * 10 / 110)

  const receiptId = generateId('rec')
  await db.prepare(`
    INSERT INTO receipts (
      id, transaction_id, booking_id, user_id,
      receipt_number, amount, tax_amount, recipient_name,
      issued_at, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    receiptId,
    transactionId,
    bookingId,
    userId,
    receiptNumber,
    amount,
    taxAmount,
    recipientName,
    now.toISOString(),
    now.toISOString()
  ).run()
}

// ============================================================
// POST /api/revenue/webhook/stripe
// Stripe Webhookエンドポイント
// ============================================================
app.post('/webhook/stripe', async (c) => {
  const { STRIPE_SECRET, STRIPE_WEBHOOK_SECRET, DB } = c.env

  if (!STRIPE_SECRET) {
    return c.json({ error: 'Stripe not configured' }, 503)
  }

  const body = await c.req.text()
  const signature = c.req.header('stripe-signature')

  // Webhook署名の検証（STRIPE_WEBHOOK_SECRETが設定されている場合のみ）
  if (STRIPE_WEBHOOK_SECRET && signature) {
    try {
      // Stripe署名検証（Web Crypto APIを使用）
      const isValid = await verifyStripeWebhookSignature(body, signature, STRIPE_WEBHOOK_SECRET)
      if (!isValid) {
        console.error('[Webhook] Invalid signature')
        return c.json({ error: 'Invalid signature' }, 400)
      }
    } catch (e) {
      console.error('[Webhook] Signature verification error:', e)
      return c.json({ error: 'Signature verification failed' }, 400)
    }
  }

  let event: { type: string; data: { object: Record<string, unknown> } }
  try {
    event = JSON.parse(body)
  } catch (e) {
    return c.json({ error: 'Invalid JSON' }, 400)
  }

  console.log(`[Webhook] Received event: ${event.type}`)

  try {
    switch (event.type) {
      // ============================================================
      // 顧客決済完了: 報酬分配を実行
      // ============================================================
      case 'checkout.session.completed': {
        const session = event.data.object as {
          id: string
          payment_intent: string
          payment_status: string
          metadata?: { booking_id?: string }
          amount_total: number
        }

        if (session.payment_status !== 'paid') {
          console.log('[Webhook] Session not paid, skipping')
          break
        }

        const bookingId = session.metadata?.booking_id
        if (!bookingId) {
          console.error('[Webhook] No booking_id in session metadata')
          break
        }

        // Stripe Charge IDを取得
        const chargeId = await getChargeIdFromPaymentIntent(STRIPE_SECRET, session.payment_intent)

        const result = await processPaymentSplit(
          DB,
          bookingId,
          session.amount_total,
          session.payment_intent,
          chargeId
        )

        console.log(`[Webhook] Payment split completed for booking ${bookingId}:`, result.splits)
        break
      }

      // ============================================================
      // PaymentIntent成功（Checkout以外のケース）
      // ============================================================
      case 'payment_intent.succeeded': {
        const pi = event.data.object as {
          id: string
          amount: number
          charges?: { data: Array<{ id: string }> }
          metadata?: { booking_id?: string }
        }

        const bookingId = pi.metadata?.booking_id
        if (!bookingId) {
          console.log('[Webhook] No booking_id in payment_intent metadata, skipping')
          break
        }

        // 既にCHARGEレコードが存在する場合はスキップ（二重処理防止）
        const existing = await DB.prepare(
          'SELECT id FROM transactions WHERE stripe_payment_intent_id = ? AND type = ?'
        ).bind(pi.id, 'CHARGE').first()

        if (existing) {
          console.log(`[Webhook] Transaction already exists for PI ${pi.id}, skipping`)
          break
        }

        const chargeId = pi.charges?.data?.[0]?.id || null
        await processPaymentSplit(DB, bookingId, pi.amount, pi.id, chargeId)
        break
      }

      // ============================================================
      // 返金処理
      // ============================================================
      case 'charge.refunded': {
        const charge = event.data.object as {
          id: string
          payment_intent: string
          amount_refunded: number
          refunds?: { data: Array<{ id: string }> }
        }

        // 元のCHARGEトランザクションを検索
        const originalTxn = await DB.prepare(
          'SELECT id, booking_id FROM transactions WHERE stripe_payment_intent_id = ? AND type = ?'
        ).bind(charge.payment_intent, 'CHARGE').first<{ id: string; booking_id: string }>()

        if (!originalTxn) {
          console.error('[Webhook] Original transaction not found for refund')
          break
        }

        // REFUNDトランザクションを記録
        const refundTxnId = generateId('txn')
        const now = new Date().toISOString()
        const refundId = charge.refunds?.data?.[0]?.id || null

        await DB.prepare(`
          INSERT INTO transactions (
            id, type, amount, currency, booking_id,
            stripe_payment_intent_id, stripe_refund_id,
            status, description, processed_at, created_at
          ) VALUES (?, 'REFUND', ?, 'jpy', ?, ?, ?, 'COMPLETED', ?, ?, ?)
        `).bind(
          refundTxnId,
          charge.amount_refunded,
          originalTxn.booking_id,
          charge.payment_intent,
          refundId,
          `返金: 元取引ID ${originalTxn.id}`,
          now,
          now
        ).run()

        // 元のsplitsをCANCELLEDに更新
        await DB.prepare(`
          UPDATE transaction_splits
          SET payout_status = 'CANCELLED'
          WHERE transaction_id = ? AND payout_status = 'PENDING'
        `).bind(originalTxn.id).run()

        // 予約のpayment_statusを更新
        await DB.prepare(`
          UPDATE bookings SET payment_status = 'REFUNDED', updated_at = ? WHERE id = ?
        `).bind(now, originalTxn.booking_id).run()

        console.log(`[Webhook] Refund processed for transaction ${originalTxn.id}`)
        break
      }

      // ============================================================
      // サブスクリプション更新（契約管理）
      // ============================================================
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as {
          id: string
          status: string
          current_period_start: number
          current_period_end: number
          canceled_at: number | null
        }

        const statusMap: Record<string, string> = {
          active: 'ACTIVE',
          past_due: 'PAST_DUE',
          canceled: 'CANCELLED',
          unpaid: 'PAST_DUE',
          trialing: 'ACTIVE',
        }

        const contractStatus = statusMap[sub.status] || 'CANCELLED'
        const now = new Date().toISOString()

        await DB.prepare(`
          UPDATE contracts
          SET status = ?,
              current_period_start = ?,
              current_period_end = ?,
              cancelled_at = ?,
              updated_at = ?
          WHERE stripe_subscription_id = ?
        `).bind(
          contractStatus,
          new Date(sub.current_period_start * 1000).toISOString(),
          new Date(sub.current_period_end * 1000).toISOString(),
          sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
          now,
          sub.id
        ).run()

        console.log(`[Webhook] Subscription ${sub.id} updated to ${contractStatus}`)
        break
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`)
    }
  } catch (e) {
    console.error('[Webhook] Processing error:', e)
    // Stripeには200を返して再試行を防ぐ（処理エラーはログで管理）
    return c.json({ received: true, error: String(e) }, 200)
  }

  return c.json({ received: true })
})

// ============================================================
// Stripe Webhook署名検証（Web Crypto API使用）
// ============================================================
async function verifyStripeWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const parts = signature.split(',')
  const timestampPart = parts.find(p => p.startsWith('t='))
  const signaturePart = parts.find(p => p.startsWith('v1='))

  if (!timestampPart || !signaturePart) return false

  const timestamp = timestampPart.slice(2)
  const expectedSig = signaturePart.slice(3)

  // タイムスタンプが5分以内であることを確認（リプレイアタック防止）
  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - parseInt(timestamp)) > 300) {
    console.error('[Webhook] Timestamp too old')
    return false
  }

  const signedPayload = `${timestamp}.${payload}`
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const messageData = encoder.encode(signedPayload)

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signatureBuffer = await crypto.subtle.sign('HMAC', key, messageData)
  const computedSig = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  return computedSig === expectedSig
}

// ============================================================
// Stripe Charge IDをPaymentIntentから取得
// ============================================================
async function getChargeIdFromPaymentIntent(
  stripeSecret: string,
  paymentIntentId: string
): Promise<string | null> {
  try {
    const res = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}`, {
      headers: { 'Authorization': `Bearer ${stripeSecret}` },
    })
    const pi = await res.json<{ latest_charge?: string }>()
    return pi.latest_charge || null
  } catch {
    return null
  }
}

// ============================================================
// 認証ミドルウェア
// ============================================================
async function requireAuth(c: any, next: () => Promise<void>) {
  const authHeader = c.req.header('Authorization')
  if (!authHeader) return c.json({ error: 'Unauthorized' }, 401)
  const token = authHeader.replace('Bearer ', '')
  const payload = await verifyJWT(token, c.env.JWT_SECRET)
  if (!payload) return c.json({ error: 'Invalid or expired token' }, 401)
  c.set('jwtPayload', payload)
  await next()
}

async function requireAdmin(c: any, next: () => Promise<void>) {
  const authHeader = c.req.header('Authorization')
  if (!authHeader) return c.json({ error: 'Unauthorized' }, 401)
  const token = authHeader.replace('Bearer ', '')
  const payload = await verifyJWT(token, c.env.JWT_SECRET)
  if (!payload || payload.role !== 'ADMIN') return c.json({ error: 'Admin required' }, 403)
  c.set('jwtPayload', payload)
  await next()
}

// ============================================================
// GET /api/revenue/transactions
// 取引台帳の取得（管理者・オフィス・セラピスト・ホスト）
// ============================================================
app.get('/transactions', requireAuth, async (c) => {
  const payload = c.get('jwtPayload') as { userId: string; role: string }
  const { DB } = c.env
  const { page = '1', limit = '20', type, status } = c.req.query()
  const offset = (parseInt(page) - 1) * parseInt(limit)

  let query: string
  let params: unknown[]

  if (payload.role === 'ADMIN') {
    // 管理者: 全取引を閲覧可能
    query = `
      SELECT t.*, b.service_name, b.scheduled_at
      FROM transactions t
      LEFT JOIN bookings b ON t.booking_id = b.id
      WHERE 1=1
        ${type ? "AND t.type = ?" : ""}
        ${status ? "AND t.status = ?" : ""}
      ORDER BY t.created_at DESC
      LIMIT ? OFFSET ?
    `
    params = [
      ...(type ? [type] : []),
      ...(status ? [status] : []),
      parseInt(limit),
      offset,
    ]
  } else {
    // 一般ユーザー: 自分に関連する取引のみ
    query = `
      SELECT t.*, b.service_name, b.scheduled_at
      FROM transactions t
      LEFT JOIN bookings b ON t.booking_id = b.id
      WHERE b.user_id = ?
        ${type ? "AND t.type = ?" : ""}
        ${status ? "AND t.status = ?" : ""}
      ORDER BY t.created_at DESC
      LIMIT ? OFFSET ?
    `
    params = [
      payload.userId,
      ...(type ? [type] : []),
      ...(status ? [status] : []),
      parseInt(limit),
      offset,
    ]
  }

  const transactions = await DB.prepare(query).bind(...params).all()
  return c.json({ transactions: transactions.results, page: parseInt(page) })
})

// ============================================================
// GET /api/revenue/splits/my
// 自分への分配明細を取得（セラピスト・オフィス・ホスト）
// ============================================================
app.get('/splits/my', requireAuth, async (c) => {
  const payload = c.get('jwtPayload') as { userId: string; role: string }
  const { DB } = c.env
  const { page = '1', limit = '20', payout_status } = c.req.query()
  const offset = (parseInt(page) - 1) * parseInt(limit)

  const splits = await DB.prepare(`
    SELECT
      ts.*,
      t.amount AS transaction_amount,
      t.created_at AS transaction_date,
      b.service_name,
      b.scheduled_at,
      u.name AS customer_name
    FROM transaction_splits ts
    JOIN transactions t ON ts.transaction_id = t.id
    LEFT JOIN bookings b ON t.booking_id = b.id
    LEFT JOIN users u ON b.user_id = u.id
    WHERE ts.user_id = ?
      ${payout_status ? "AND ts.payout_status = ?" : ""}
    ORDER BY ts.created_at DESC
    LIMIT ? OFFSET ?
  `).bind(
    payload.userId,
    ...(payout_status ? [payout_status] : []),
    parseInt(limit),
    offset
  ).all()

  // サマリー計算
  const summary = await DB.prepare(`
    SELECT
      SUM(CASE WHEN payout_status = 'PENDING' THEN amount ELSE 0 END) AS pending_amount,
      SUM(CASE WHEN payout_status = 'PAID' THEN amount ELSE 0 END) AS paid_amount,
      COUNT(CASE WHEN payout_status = 'PENDING' THEN 1 END) AS pending_count
    FROM transaction_splits
    WHERE user_id = ?
  `).bind(payload.userId).first<{
    pending_amount: number
    paid_amount: number
    pending_count: number
  }>()

  return c.json({
    splits: splits.results,
    summary,
    page: parseInt(page),
  })
})

// ============================================================
// GET /api/revenue/receipts/my
// 自分の領収書一覧を取得（顧客）
// ============================================================
app.get('/receipts/my', requireAuth, async (c) => {
  const payload = c.get('jwtPayload') as { userId: string }
  const { DB } = c.env
  const { page = '1', limit = '20' } = c.req.query()
  const offset = (parseInt(page) - 1) * parseInt(limit)

  const receipts = await DB.prepare(`
    SELECT r.*, b.service_name, b.scheduled_at
    FROM receipts r
    LEFT JOIN bookings b ON r.booking_id = b.id
    WHERE r.user_id = ?
    ORDER BY r.issued_at DESC
    LIMIT ? OFFSET ?
  `).bind(payload.userId, parseInt(limit), offset).all()

  return c.json({ receipts: receipts.results, page: parseInt(page) })
})

// ============================================================
// GET /api/revenue/receipts/:receiptId
// 領収書の詳細取得
// ============================================================
app.get('/receipts/:receiptId', requireAuth, async (c) => {
  const payload = c.get('jwtPayload') as { userId: string; role: string }
  const { DB } = c.env
  const receiptId = c.req.param('receiptId')

  const receipt = await DB.prepare(`
    SELECT r.*, b.service_name, b.scheduled_at, b.duration, b.type AS booking_type
    FROM receipts r
    LEFT JOIN bookings b ON r.booking_id = b.id
    WHERE r.id = ?
      ${payload.role !== 'ADMIN' ? 'AND r.user_id = ?' : ''}
  `).bind(receiptId, ...(payload.role !== 'ADMIN' ? [payload.userId] : [])).first()

  if (!receipt) return c.json({ error: 'Receipt not found' }, 404)
  return c.json({ receipt })
})

// ============================================================
// POST /api/revenue/payout-statements/generate
// 支払明細書を生成（管理者のみ）
// ============================================================
app.post('/payout-statements/generate', requireAdmin, async (c) => {
  const { DB } = c.env
  const { userId, role, periodStart, periodEnd } = await c.req.json()

  if (!userId || !role || !periodStart || !periodEnd) {
    return c.json({ error: 'userId, role, periodStart, periodEnd are required' }, 400)
  }

  // 対象期間の未払い分配を集計
  const splits = await DB.prepare(`
    SELECT ts.*, t.booking_id, b.service_name, b.scheduled_at, u.name AS customer_name
    FROM transaction_splits ts
    JOIN transactions t ON ts.transaction_id = t.id
    LEFT JOIN bookings b ON t.booking_id = b.id
    LEFT JOIN users u ON b.user_id = u.id
    WHERE ts.user_id = ?
      AND ts.role = ?
      AND ts.payout_status = 'PENDING'
      AND DATE(ts.created_at) BETWEEN ? AND ?
    ORDER BY ts.created_at ASC
  `).bind(userId, role, periodStart, periodEnd).all<{
    id: string
    amount: number
    rate: number
    booking_id: string | null
    service_name: string | null
    scheduled_at: string | null
    customer_name: string | null
    created_at: string
  }>()

  if (!splits.results || splits.results.length === 0) {
    return c.json({ error: 'No pending splits found for the specified period' }, 404)
  }

  const grossAmount = splits.results.reduce((sum, s) => sum + s.amount, 0)
  const deductions = 0 // 将来的に手数料等を控除
  const netAmount = grossAmount - deductions

  // 明細書番号を生成
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const seq = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
  const statementNumber = `PAY-${dateStr}-${seq}`

  const statementId = generateId('pst')
  const now = new Date().toISOString()

  // 支払明細書を作成
  await DB.prepare(`
    INSERT INTO payout_statements (
      id, user_id, role, period_start, period_end,
      statement_number, gross_amount, deductions, net_amount,
      status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT', ?, ?)
  `).bind(
    statementId, userId, role, periodStart, periodEnd,
    statementNumber, grossAmount, deductions, netAmount,
    now, now
  ).run()

  // 明細行を作成
  for (const split of splits.results) {
    const lineId = generateId('pli')
    await DB.prepare(`
      INSERT INTO payout_statement_line_items (
        id, payout_statement_id, transaction_split_id,
        booking_id, booking_date, service_name, customer_name,
        gross_amount, rate, net_amount, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      lineId, statementId, split.id,
      split.booking_id,
      split.scheduled_at ? split.scheduled_at.slice(0, 10) : null,
      split.service_name,
      split.customer_name,
      split.amount, split.rate, split.amount,
      now
    ).run()
  }

  return c.json({
    statementId,
    statementNumber,
    grossAmount,
    netAmount,
    lineCount: splits.results.length,
    status: 'DRAFT',
  })
})

// ============================================================
// GET /api/revenue/payout-statements/my
// 自分の支払明細書一覧を取得
// ============================================================
app.get('/payout-statements/my', requireAuth, async (c) => {
  const payload = c.get('jwtPayload') as { userId: string }
  const { DB } = c.env
  const { page = '1', limit = '20' } = c.req.query()
  const offset = (parseInt(page) - 1) * parseInt(limit)

  const statements = await DB.prepare(`
    SELECT * FROM payout_statements
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).bind(payload.userId, parseInt(limit), offset).all()

  return c.json({ statements: statements.results, page: parseInt(page) })
})

// ============================================================
// GET /api/revenue/payout-statements/:statementId
// 支払明細書の詳細取得（明細行含む）
// ============================================================
app.get('/payout-statements/:statementId', requireAuth, async (c) => {
  const payload = c.get('jwtPayload') as { userId: string; role: string }
  const { DB } = c.env
  const statementId = c.req.param('statementId')

  const statement = await DB.prepare(`
    SELECT ps.*, u.name AS user_name, u.email AS user_email
    FROM payout_statements ps
    JOIN users u ON ps.user_id = u.id
    WHERE ps.id = ?
      ${payload.role !== 'ADMIN' ? 'AND ps.user_id = ?' : ''}
  `).bind(statementId, ...(payload.role !== 'ADMIN' ? [payload.userId] : [])).first()

  if (!statement) return c.json({ error: 'Statement not found' }, 404)

  const lineItems = await DB.prepare(`
    SELECT * FROM payout_statement_line_items
    WHERE payout_statement_id = ?
    ORDER BY booking_date ASC
  `).bind(statementId).all()

  return c.json({ statement, lineItems: lineItems.results })
})

// ============================================================
// GET /api/revenue/dashboard/summary
// 報酬サマリー（管理者用）
// ============================================================
app.get('/dashboard/summary', requireAdmin, async (c) => {
  const { DB } = c.env
  const { year, month } = c.req.query()

  const periodFilter = year && month
    ? `AND strftime('%Y', t.created_at) = '${year}' AND strftime('%m', t.created_at) = '${month.padStart(2, '0')}'`
    : ''

  const summary = await DB.prepare(`
    SELECT
      SUM(CASE WHEN t.type = 'CHARGE' THEN t.amount ELSE 0 END) AS total_revenue,
      SUM(CASE WHEN t.type = 'REFUND' THEN t.amount ELSE 0 END) AS total_refunds,
      COUNT(CASE WHEN t.type = 'CHARGE' THEN 1 END) AS charge_count,
      SUM(CASE WHEN ts.role = 'THERAPIST' AND ts.payout_status = 'PENDING' THEN ts.amount ELSE 0 END) AS pending_therapist_payout,
      SUM(CASE WHEN ts.role = 'OFFICE' AND ts.payout_status = 'PENDING' THEN ts.amount ELSE 0 END) AS pending_office_payout,
      SUM(CASE WHEN ts.role = 'HOST' AND ts.payout_status = 'PENDING' THEN ts.amount ELSE 0 END) AS pending_host_payout,
      SUM(CASE WHEN ts.role = 'PLATFORM' THEN ts.amount ELSE 0 END) AS platform_revenue
    FROM transactions t
    LEFT JOIN transaction_splits ts ON t.id = ts.transaction_id
    WHERE t.status = 'COMPLETED' ${periodFilter}
  `).first<{
    total_revenue: number
    total_refunds: number
    charge_count: number
    pending_therapist_payout: number
    pending_office_payout: number
    pending_host_payout: number
    platform_revenue: number
  }>()

  return c.json({ summary })
})

// ============================================================
// GET /api/revenue/revenue-share-rules
// 分配ルール一覧（管理者）
// ============================================================
app.get('/revenue-share-rules', requireAdmin, async (c) => {
  const { DB } = c.env
  const rules = await DB.prepare(`
    SELECT rsr.*, o.name AS office_name
    FROM revenue_share_rules rsr
    LEFT JOIN offices o ON rsr.office_id = o.id
    ORDER BY rsr.priority DESC, rsr.created_at DESC
  `).all()
  return c.json({ rules: rules.results })
})

// ============================================================
// POST /api/revenue/revenue-share-rules
// 分配ルールの新規作成（管理者）
// ============================================================
app.post('/revenue-share-rules', requireAdmin, async (c) => {
  const payload = c.get('jwtPayload') as { userId: string }
  const { DB } = c.env
  const body = await c.req.json()

  const {
    officeId = null,
    bookingType = null,
    therapistRate,
    officeRate,
    hostRate,
    platformRate,
    promotionRate,
    validFrom,
    validUntil = null,
    priority = 0,
    notes = null,
  } = body

  // 合計が100になることを検証
  const total = (therapistRate || 0) + (officeRate || 0) + (hostRate || 0) + (platformRate || 0) + (promotionRate || 0)
  if (total !== 100) {
    return c.json({ error: `分配率の合計が100になりません（現在: ${total}）` }, 400)
  }

  const ruleId = generateId('rsr')
  const now = new Date().toISOString()

  await DB.prepare(`
    INSERT INTO revenue_share_rules (
      id, office_id, booking_type,
      therapist_rate, office_rate, host_rate, platform_rate, promotion_rate,
      valid_from, valid_until, priority, is_active, created_by, notes,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)
  `).bind(
    ruleId, officeId, bookingType,
    therapistRate, officeRate, hostRate, platformRate, promotionRate,
    validFrom || now, validUntil, priority, payload.userId, notes,
    now, now
  ).run()

  return c.json({ ruleId, message: '分配ルールを作成しました' }, 201)
})

// ============================================================
// POST /api/revenue/process-booking-payment
// 予約決済の手動処理（テスト・管理者用）
// ============================================================
app.post('/process-booking-payment', requireAdmin, async (c) => {
  const { DB } = c.env
  const { bookingId, amount, paymentIntentId = `manual_${Date.now()}` } = await c.req.json()

  if (!bookingId || !amount) {
    return c.json({ error: 'bookingId and amount are required' }, 400)
  }

  try {
    const result = await processPaymentSplit(DB, bookingId, amount, paymentIntentId, null)
    return c.json({ success: true, ...result })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// ============================================================
// GET /api/revenue/splits
// 全分配明細一覧（管理者）
// ============================================================
app.get('/splits', requireAdmin, async (c) => {
  const { DB } = c.env
  const { page = '1', limit = '50', period, role, payout_status } = c.req.query()
  const offset = (parseInt(page) - 1) * parseInt(limit)

  const now = new Date()
  let periodFilter = ''
  if (period === 'this_month') {
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    periodFilter = `AND strftime('%Y-%m', ts.created_at) = '${y}-${m}'`
  } else if (period === 'last_month') {
    const d = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    periodFilter = `AND strftime('%Y-%m', ts.created_at) = '${y}-${m}'`
  } else if (period === 'this_year') {
    periodFilter = `AND strftime('%Y', ts.created_at) = '${now.getFullYear()}'`
  }

  const roleFilter = role ? `AND ts.role = '${role}'` : ''
  const statusFilter = payout_status ? `AND ts.payout_status = '${payout_status}'` : ''

  const splits = await DB.prepare(`
    SELECT
      ts.*,
      t.amount AS gross_amount,
      t.created_at AS transaction_date,
      b.service_name,
      b.scheduled_at AS booking_date,
      u.name AS recipient_name
    FROM transaction_splits ts
    JOIN transactions t ON ts.transaction_id = t.id
    LEFT JOIN bookings b ON t.booking_id = b.id
    LEFT JOIN users u ON ts.user_id = u.id
    WHERE 1=1 ${periodFilter} ${roleFilter} ${statusFilter}
    ORDER BY ts.created_at DESC
    LIMIT ? OFFSET ?
  `).bind(parseInt(limit), offset).all()

  const summary = await DB.prepare(`
    SELECT
      SUM(t.amount) AS total_revenue,
      SUM(CASE WHEN ts.role = 'PLATFORM' THEN ts.amount ELSE 0 END) AS platform_earnings,
      SUM(CASE WHEN ts.role = 'THERAPIST' THEN ts.amount ELSE 0 END) AS therapist_payouts,
      SUM(CASE WHEN ts.role = 'OFFICE' THEN ts.amount ELSE 0 END) AS office_payouts,
      SUM(CASE WHEN ts.role = 'HOST' THEN ts.amount ELSE 0 END) AS host_payouts,
      COUNT(CASE WHEN ts.payout_status = 'PENDING' THEN 1 END) AS pending_splits
    FROM transaction_splits ts
    JOIN transactions t ON ts.transaction_id = t.id
    WHERE 1=1 ${periodFilter}
  `).first<{
    total_revenue: number
    platform_earnings: number
    therapist_payouts: number
    office_payouts: number
    host_payouts: number
    pending_splits: number
  }>()

  return c.json({
    splits: splits.results,
    summary,
    page: parseInt(page),
  })
})

// ============================================================
// GET /api/revenue/rules
// 分配ルール一覧（管理者）- /revenue-share-rules のエイリアス
// ============================================================
app.get('/rules', requireAdmin, async (c) => {
  const { DB } = c.env
  const rules = await DB.prepare(`
    SELECT rsr.*, o.name AS office_name
    FROM revenue_share_rules rsr
    LEFT JOIN offices o ON rsr.office_id = o.id
    ORDER BY rsr.priority DESC, rsr.created_at DESC
  `).all()
  return c.json({ rules: rules.results })
})

// ============================================================
// POST /api/revenue/rules
// 分配ルール新規作成（管理者）- /revenue-share-rules のエイリアス
// ============================================================
app.post('/rules', requireAdmin, async (c) => {
  const payload = c.get('jwtPayload') as { userId: string }
  const { DB } = c.env
  const body = await c.req.json()
  const {
    therapist_rate,
    office_rate,
    host_rate,
    platform_rate,
    promotion_rate,
    notes = null,
    priority = 0,
  } = body

  const total = (therapist_rate || 0) + (office_rate || 0) + (host_rate || 0) + (platform_rate || 0) + (promotion_rate || 0)
  if (total !== 100) {
    return c.json({ error: `分配率の合計が100になりません（現在: ${total}）` }, 400)
  }

  const ruleId = generateId('rsr')
  const now = new Date().toISOString()
  await DB.prepare(`
    INSERT INTO revenue_share_rules (
      id, office_id, booking_type,
      therapist_rate, office_rate, host_rate, platform_rate, promotion_rate,
      valid_from, valid_until, priority, is_active, created_by, notes,
      created_at, updated_at
    ) VALUES (?, NULL, NULL, ?, ?, ?, ?, ?, ?, NULL, ?, 1, ?, ?, ?, ?)
  `).bind(
    ruleId,
    therapist_rate, office_rate, host_rate, platform_rate, promotion_rate,
    now, priority, payload.userId, notes,
    now, now
  ).run()

  return c.json({ ruleId, message: '分配ルールを作成しました' }, 201)
})

// ============================================================
// POST /api/revenue/settle
// 未確定分配を一括確定（管理者）
// ============================================================
app.post('/settle', requireAdmin, async (c) => {
  const { DB } = c.env
  const { period } = await c.req.json()

  const now = new Date()
  let periodFilter = ''
  if (period === 'this_month') {
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    periodFilter = `AND strftime('%Y-%m', created_at) = '${y}-${m}'`
  } else if (period === 'last_month') {
    const d = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    periodFilter = `AND strftime('%Y-%m', created_at) = '${y}-${m}'`
  } else if (period === 'this_year') {
    periodFilter = `AND strftime('%Y', created_at) = '${now.getFullYear()}'`
  }

  const result = await DB.prepare(`
    UPDATE transaction_splits
    SET payout_status = 'PROCESSING', updated_at = datetime('now')
    WHERE payout_status = 'PENDING' ${periodFilter}
  `).run()

  return c.json({
    message: '精算処理が完了しました',
    updated: result.meta?.changes ?? 0,
  })
})

export default app
