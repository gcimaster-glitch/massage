/**
 * revenue-engine-routes.ts
 * 収益分配エンジン API
 *
 * エンドポイント:
 *   POST /api/revenue/webhook/stripe       - Stripe Webhookハンドラ
 *   POST /api/revenue/process/:bookingId   - 手動で収益分配を実行（管理者用）
 *   GET  /api/revenue/splits/:bookingId    - 予約の分配情報取得
 *   GET  /api/revenue/statements           - 精算書一覧（ロール別）
 *   POST /api/revenue/statements/generate  - 月次精算書生成（管理者用）
 *   PATCH /api/revenue/statements/:id      - 精算書ステータス更新（管理者用）
 *   GET  /api/revenue/rules                - 収益分配ルール一覧（管理者用）
 *   POST /api/revenue/rules                - 収益分配ルール作成（管理者用）
 *   PATCH /api/revenue/rules/:id           - 収益分配ルール更新（管理者用）
 */
import { Hono } from 'hono';
import Stripe from 'stripe';
import { verifyJWT } from './auth-middleware';
import type { Bindings } from './types';

const app = new Hono<{ Bindings: Bindings }>();

// ============================================
// 認証ミドルウェア
// ============================================
const requireAuth = async (c: Parameters<typeof app.get>[1], next: () => Promise<void>) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: '認証が必要です' }, 401);
  }
  const token = authHeader.substring(7);
  const payload = await verifyJWT(token, c.env.JWT_SECRET);
  if (!payload) {
    return c.json({ error: '無効なトークンです' }, 401);
  }
  c.set('userId', payload.userId);
  c.set('userRole', payload.role);
  await next();
};

const requireAdmin = async (c: Parameters<typeof app.get>[1], next: () => Promise<void>) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: '認証が必要です' }, 401);
  }
  const token = authHeader.substring(7);
  const payload = await verifyJWT(token, c.env.JWT_SECRET);
  if (!payload) {
    return c.json({ error: '無効なトークンです' }, 401);
  }
  if (payload.role !== 'ADMIN' && payload.role !== 'Admin') {
    return c.json({ error: '管理者権限が必要です' }, 403);
  }
  c.set('userId', payload.userId);
  c.set('userRole', payload.role);
  await next();
};

// ============================================
// 収益分配処理コア関数
// ============================================
export async function processPaymentSplit(
  db: D1Database,
  bookingId: string,
  stripePaymentIntentId: string,
  grossAmount: number
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  try {
    // 予約情報を取得
    const booking = await db.prepare(`
      SELECT
        b.id,
        b.therapist_id,
        b.host_user_id,
        b.office_id,
        b.revenue_share_rule_id,
        b.type,
        b.price,
        tp.user_id as therapist_user_id
      FROM bookings b
      LEFT JOIN therapist_profiles tp ON b.therapist_id = tp.id
      WHERE b.id = ?
    `).bind(bookingId).first<{
      id: string;
      therapist_id: string;
      host_user_id: string | null;
      office_id: string | null;
      revenue_share_rule_id: string | null;
      type: string;
      price: number;
      therapist_user_id: string | null;
    }>();

    if (!booking) {
      return { success: false, error: `予約が見つかりません: ${bookingId}` };
    }

    // 既存のトランザクションを確認（重複処理防止）
    const existingTx = await db.prepare(`
      SELECT id FROM transactions WHERE stripe_payment_intent_id = ?
    `).bind(stripePaymentIntentId).first<{ id: string }>();

    if (existingTx) {
      console.log(`[Revenue] Transaction already exists for PI: ${stripePaymentIntentId}`);
      return { success: true, transactionId: existingTx.id };
    }

    // 適用する収益分配ルールを取得
    const ruleId = booking.revenue_share_rule_id || 'rule_default_001';
    let rule = await db.prepare(`
      SELECT * FROM revenue_share_rules WHERE id = ? AND is_active = 1
    `).bind(ruleId).first<{
      id: string;
      therapist_rate: number;
      host_rate: number;
      office_rate: number;
      platform_rate: number;
    }>();

    // ルールが見つからない場合はデフォルトを使用
    if (!rule) {
      rule = await db.prepare(`
        SELECT * FROM revenue_share_rules
        WHERE is_active = 1
        ORDER BY priority DESC
        LIMIT 1
      `).first<{
        id: string;
        therapist_rate: number;
        host_rate: number;
        office_rate: number;
        platform_rate: number;
      }>();
    }

    // フォールバック: ハードコードされたデフォルト
    const rates = rule || {
      id: 'fallback',
      therapist_rate: 70.0,
      host_rate: 0.0,
      office_rate: 0.0,
      platform_rate: 30.0,
    };

    // 金額計算（端数は platform に加算）
    const therapistAmount = Math.floor(grossAmount * rates.therapist_rate / 100);
    const hostAmount = Math.floor(grossAmount * rates.host_rate / 100);
    const officeAmount = Math.floor(grossAmount * rates.office_rate / 100);
    const platformAmount = grossAmount - therapistAmount - hostAmount - officeAmount;

    // トランザクションIDを生成
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // トランザクションレコードを作成
    await db.prepare(`
      INSERT INTO transactions (
        id, booking_id, stripe_payment_intent_id,
        gross_amount, net_amount, currency,
        status, paid_at, created_at, updated_at
      ) VALUES (
        ?, ?, ?,
        ?, ?, 'jpy',
        'SUCCEEDED', datetime('now'), datetime('now'), datetime('now')
      )
    `).bind(
      transactionId,
      bookingId,
      stripePaymentIntentId,
      grossAmount,
      grossAmount // net_amount（将来的にStripe手数料を控除）
    ).run();

    // セラピストのuser_idを決定
    const therapistUserId = booking.therapist_user_id || booking.therapist_id;

    // 分割レコードを作成
    const splits: Array<{
      userId: string;
      role: string;
      amount: number;
      rate: number;
    }> = [];

    if (therapistUserId && therapistAmount > 0) {
      splits.push({
        userId: therapistUserId,
        role: 'THERAPIST',
        amount: therapistAmount,
        rate: rates.therapist_rate,
      });
    }

    if (booking.host_user_id && hostAmount > 0) {
      splits.push({
        userId: booking.host_user_id,
        role: 'HOST',
        amount: hostAmount,
        rate: rates.host_rate,
      });
    }

    // オフィスのuser_idを取得
    if (booking.office_id && officeAmount > 0) {
      const office = await db.prepare(`
        SELECT user_id FROM offices WHERE id = ?
      `).bind(booking.office_id).first<{ user_id: string }>();
      if (office?.user_id) {
        splits.push({
          userId: office.user_id,
          role: 'OFFICE',
          amount: officeAmount,
          rate: rates.office_rate,
        });
      }
    }

    // プラットフォーム分（管理者アカウントに紐付け）
    if (platformAmount > 0) {
      const platformUser = await db.prepare(`
        SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1
      `).first<{ id: string }>();
      if (platformUser) {
        splits.push({
          userId: platformUser.id,
          role: 'PLATFORM',
          amount: platformAmount,
          rate: rates.platform_rate,
        });
      }
    }

    // 分割レコードを一括挿入
    for (const split of splits) {
      const splitId = `split_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      await db.prepare(`
        INSERT INTO transaction_splits (
          id, transaction_id, user_id, role,
          amount, rate, payout_status,
          created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?,
          ?, ?, 'PENDING',
          datetime('now'), datetime('now')
        )
      `).bind(
        splitId,
        transactionId,
        split.userId,
        split.role,
        split.amount,
        split.rate
      ).run();
    }

    // therapist_earningsテーブルにも記録（既存システムとの互換性）
    if (therapistUserId && therapistAmount > 0) {
      try {
        const therapistProfile = await db.prepare(`
          SELECT id FROM therapist_profiles WHERE user_id = ? LIMIT 1
        `).bind(therapistUserId).first<{ id: string }>();

        if (therapistProfile) {
          const earningsId = `earn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          await db.prepare(`
            INSERT OR IGNORE INTO therapist_earnings (
              id, therapist_profile_id, booking_id, office_id,
              booking_price, therapist_amount, office_amount, platform_amount,
              therapist_rate, office_rate, platform_rate,
              status, booking_date,
              created_at, updated_at
            ) VALUES (
              ?, ?, ?, ?,
              ?, ?, ?, ?,
              ?, ?, ?,
              'CONFIRMED', date('now'),
              datetime('now'), datetime('now')
            )
          `).bind(
            earningsId,
            therapistProfile.id,
            bookingId,
            booking.office_id || null,
            grossAmount,
            therapistAmount,
            officeAmount,
            platformAmount,
            rates.therapist_rate,
            rates.office_rate,
            rates.platform_rate
          ).run();
        }
      } catch (e) {
        // therapist_earningsへの書き込みは失敗しても続行
        console.warn('[Revenue] therapist_earnings insert failed (non-critical):', e);
      }
    }

    // 予約ステータスをCONFIRMEDに更新
    await db.prepare(`
      UPDATE bookings
      SET status = 'CONFIRMED',
          payment_status = 'PAID',
          payment_intent_id = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `).bind(stripePaymentIntentId, bookingId).run();

    console.log(`[Revenue] Split processed: booking=${bookingId}, tx=${transactionId}, amount=${grossAmount}`);
    return { success: true, transactionId };
  } catch (error: unknown) {
    console.error('[Revenue] processPaymentSplit error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================
// Stripe Webhook ハンドラ
// ============================================
app.post('/webhook/stripe', async (c) => {
  const body = await c.req.text();
  const sig = c.req.header('stripe-signature');

  if (!sig) {
    return c.json({ error: 'Missing stripe-signature header' }, 400);
  }

  let event: Stripe.Event;

  try {
    if (!c.env.STRIPE_SECRET || !c.env.STRIPE_WEBHOOK_SECRET) {
      return c.json({ error: 'Stripe configuration missing' }, 500);
    }
    const stripe = new Stripe(c.env.STRIPE_SECRET, {
      apiVersion: '2026-02-25.clover',
    });
    // Webhook署名の検証
    event = await stripe.webhooks.constructEventAsync(
      body,
      sig,
      c.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: unknown) {
    console.error('[Webhook] Signature verification failed:', err);
    return c.json(
      { error: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown'}` },
      400
    );
  }

  console.log(`[Webhook] Event received: ${event.type}, id: ${event.id}`);

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const bookingId = paymentIntent.metadata?.booking_id;

        if (!bookingId) {
          console.warn('[Webhook] payment_intent.succeeded: no booking_id in metadata');
          break;
        }

        const result = await processPaymentSplit(
          c.env.DB,
          bookingId,
          paymentIntent.id,
          paymentIntent.amount
        );

        if (!result.success) {
          console.error('[Webhook] processPaymentSplit failed:', result.error);
        }
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.metadata?.booking_id;

        if (!bookingId || !session.payment_intent) {
          console.warn('[Webhook] checkout.session.completed: missing booking_id or payment_intent');
          break;
        }

        const paymentIntentId = typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent.id;

        const result = await processPaymentSplit(
          c.env.DB,
          bookingId,
          paymentIntentId,
          session.amount_total || 0
        );

        if (!result.success) {
          console.error('[Webhook] processPaymentSplit failed:', result.error);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const bookingId = paymentIntent.metadata?.booking_id;

        if (bookingId) {
          await c.env.DB.prepare(`
            UPDATE bookings
            SET payment_status = 'FAILED', updated_at = datetime('now')
            WHERE id = ?
          `).bind(bookingId).run();
          console.log(`[Webhook] Payment failed for booking: ${bookingId}`);
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = typeof charge.payment_intent === 'string'
          ? charge.payment_intent
          : charge.payment_intent?.id;

        if (paymentIntentId) {
          await c.env.DB.prepare(`
            UPDATE transactions
            SET status = 'REFUNDED', refunded_at = datetime('now'), updated_at = datetime('now')
            WHERE stripe_payment_intent_id = ?
          `).bind(paymentIntentId).run();

          // 分割レコードもキャンセル
          await c.env.DB.prepare(`
            UPDATE transaction_splits
            SET payout_status = 'CANCELLED', updated_at = datetime('now')
            WHERE transaction_id IN (
              SELECT id FROM transactions WHERE stripe_payment_intent_id = ?
            ) AND payout_status = 'PENDING'
          `).bind(paymentIntentId).run();

          console.log(`[Webhook] Refund processed for PI: ${paymentIntentId}`);
        }
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }
  } catch (err: unknown) {
    console.error('[Webhook] Event processing error:', err);
    // Webhookは200を返してStripeの再送を防ぐ
  }

  return c.json({ received: true });
});

// ============================================
// 手動収益分配実行（管理者用）
// ============================================
app.post('/process/:bookingId', requireAdmin, async (c) => {
  const bookingId = c.req.param('bookingId');

  try {
    const booking = await c.env.DB.prepare(`
      SELECT id, price, payment_intent_id, payment_status
      FROM bookings WHERE id = ?
    `).bind(bookingId).first<{
      id: string;
      price: number;
      payment_intent_id: string | null;
      payment_status: string;
    }>();

    if (!booking) {
      return c.json({ error: '予約が見つかりません' }, 404);
    }

    const paymentIntentId = booking.payment_intent_id || `manual_${Date.now()}`;

    const result = await processPaymentSplit(
      c.env.DB,
      bookingId,
      paymentIntentId,
      booking.price
    );

    if (!result.success) {
      return c.json({ error: result.error }, 500);
    }

    return c.json({ success: true, transactionId: result.transactionId });
  } catch (e: unknown) {
    console.error('[Revenue] Manual process error:', e);
    return c.json({ error: '収益分配の実行に失敗しました' }, 500);
  }
});

// ============================================
// 予約の分配情報取得
// ============================================
app.get('/splits/:bookingId', requireAuth, async (c) => {
  const bookingId = c.req.param('bookingId');
  const userId = c.get('userId') as string;
  const userRole = c.get('userRole') as string;

  try {
    // 管理者以外は自分の予約のみ参照可能
    if (userRole !== 'ADMIN' && userRole !== 'Admin') {
      const booking = await c.env.DB.prepare(`
        SELECT user_id, therapist_id FROM bookings WHERE id = ?
      `).bind(bookingId).first<{ user_id: string; therapist_id: string }>();

      if (!booking) {
        return c.json({ error: '予約が見つかりません' }, 404);
      }

      // therapist_profilesからuser_idを取得
      const therapistProfile = await c.env.DB.prepare(`
        SELECT user_id FROM therapist_profiles WHERE id = ?
      `).bind(booking.therapist_id).first<{ user_id: string }>();

      const therapistUserId = therapistProfile?.user_id || booking.therapist_id;

      if (booking.user_id !== userId && therapistUserId !== userId) {
        return c.json({ error: 'アクセス権限がありません' }, 403);
      }
    }

    const transaction = await c.env.DB.prepare(`
      SELECT t.*, ts_list.splits
      FROM transactions t
      LEFT JOIN (
        SELECT transaction_id,
          json_group_array(json_object(
            'id', id,
            'user_id', user_id,
            'role', role,
            'amount', amount,
            'rate', rate,
            'payout_status', payout_status,
            'paid_at', paid_at
          )) as splits
        FROM transaction_splits
        GROUP BY transaction_id
      ) ts_list ON t.id = ts_list.transaction_id
      WHERE t.booking_id = ?
      ORDER BY t.created_at DESC
      LIMIT 1
    `).bind(bookingId).first<{
      id: string;
      booking_id: string;
      stripe_payment_intent_id: string;
      gross_amount: number;
      status: string;
      paid_at: string;
      splits: string;
    }>();

    if (!transaction) {
      return c.json({ transaction: null, splits: [] });
    }

    const splits = transaction.splits ? JSON.parse(transaction.splits) : [];

    return c.json({
      transaction: {
        id: transaction.id,
        booking_id: transaction.booking_id,
        stripe_payment_intent_id: transaction.stripe_payment_intent_id,
        gross_amount: transaction.gross_amount,
        status: transaction.status,
        paid_at: transaction.paid_at,
      },
      splits,
    });
  } catch (e: unknown) {
    console.error('[Revenue] splits fetch error:', e);
    return c.json({ error: '分配情報の取得に失敗しました' }, 500);
  }
});

// ============================================
// 精算書一覧取得（ロール別）
// ============================================
app.get('/statements', requireAuth, async (c) => {
  const userId = c.get('userId') as string;
  const userRole = c.get('userRole') as string;
  const { month, status, target_user_id } = c.req.query();

  try {
    let targetUserId = userId;

    // 管理者は任意のユーザーの精算書を参照可能
    if ((userRole === 'ADMIN' || userRole === 'Admin') && target_user_id) {
      targetUserId = target_user_id;
    }

    let query = `
      SELECT
        ps.*,
        u.name as user_name,
        u.email as user_email
      FROM payout_statements ps
      LEFT JOIN users u ON ps.user_id = u.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (userRole !== 'ADMIN' && userRole !== 'Admin') {
      query += ' AND ps.user_id = ?';
      params.push(targetUserId);
    } else if (target_user_id) {
      query += ' AND ps.user_id = ?';
      params.push(target_user_id);
    }

    if (month) {
      query += ` AND strftime('%Y-%m', ps.period_start) = ?`;
      params.push(month);
    }

    if (status) {
      query += ' AND ps.status = ?';
      params.push(status);
    }

    query += ' ORDER BY ps.period_start DESC LIMIT 100';

    const result = await c.env.DB.prepare(query).bind(...params).all<Record<string, unknown>>();

    return c.json({ statements: result.results || [] });
  } catch (e: unknown) {
    console.error('[Revenue] statements fetch error:', e);
    return c.json({ error: '精算書の取得に失敗しました' }, 500);
  }
});

// ============================================
// 月次精算書生成（管理者用）
// ============================================
app.post('/statements/generate', requireAdmin, async (c) => {
  try {
    const { target_month } = await c.req.json() as { target_month: string };

    if (!target_month || !/^\d{4}-\d{2}$/.test(target_month)) {
      return c.json({ error: 'target_monthは YYYY-MM 形式で指定してください' }, 400);
    }

    const [year, month] = target_month.split('-');
    const periodStart = `${year}-${month}-01`;
    // 月末日を計算
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
    const periodEnd = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

    // 対象期間のtransaction_splitsを集計
    const splits = await c.env.DB.prepare(`
      SELECT
        ts.user_id,
        ts.role,
        SUM(ts.amount) as total_amount
      FROM transaction_splits ts
      JOIN transactions t ON ts.transaction_id = t.id
      WHERE t.status = 'SUCCEEDED'
        AND t.paid_at >= ?
        AND t.paid_at <= ?
        AND ts.payout_status = 'PENDING'
      GROUP BY ts.user_id, ts.role
    `).bind(`${periodStart} 00:00:00`, `${periodEnd} 23:59:59`).all<{
      user_id: string;
      role: string;
      total_amount: number;
    }>();

    let inserted = 0;
    let updated = 0;

    for (const row of (splits.results || [])) {
      const statementId = `stmt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      // UPSERT
      const existing = await c.env.DB.prepare(`
        SELECT id FROM payout_statements
        WHERE user_id = ? AND period_start = ? AND period_end = ?
      `).bind(row.user_id, periodStart, periodEnd).first<{ id: string }>();

      if (existing) {
        await c.env.DB.prepare(`
          UPDATE payout_statements
          SET total_amount = ?, updated_at = datetime('now')
          WHERE id = ?
        `).bind(row.total_amount, existing.id).run();
        updated++;
      } else {
        await c.env.DB.prepare(`
          INSERT INTO payout_statements (
            id, user_id,
            period_start, period_end,
            total_amount,
            status, created_at, updated_at
          ) VALUES (
            ?, ?,
            ?, ?,
            ?,
            'DRAFT', datetime('now'), datetime('now')
          )
        `).bind(
          statementId,
          row.user_id,
          periodStart,
          periodEnd,
          row.total_amount
        ).run();
        inserted++;
      }
    }

    return c.json({
      success: true,
      target_month,
      period_start: periodStart,
      period_end: periodEnd,
      inserted,
      updated,
      total: inserted + updated,
    });
  } catch (e: unknown) {
    console.error('[Revenue] statements generate error:', e);
    return c.json({ error: '精算書の生成に失敗しました' }, 500);
  }
});

// ============================================
// 精算書ステータス更新（管理者用）
// ============================================
app.patch('/statements/:id', requireAdmin, async (c) => {
  const id = c.req.param('id');

  try {
    const { status, notes } = await c.req.json() as {
      status: string;
      notes?: string;
    };

    const validStatuses = ['DRAFT', 'CONFIRMED', 'PAID', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return c.json({ error: '無効なステータスです' }, 400);
    }

    const paidAt = status === 'PAID' ? "datetime('now')" : 'NULL';

    await c.env.DB.prepare(`
      UPDATE payout_statements
      SET status = ?,
          notes = ?,
          paid_at = ${paidAt},
          updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      status,
      notes || null,
      id
    ).run();

    // PAIDになった場合、transaction_splitsのpayout_statusも更新
    if (status === 'PAID') {
      await c.env.DB.prepare(`
        UPDATE transaction_splits
        SET payout_status = 'PAID',
            payout_statement_id = ?,
            paid_at = datetime('now'),
            updated_at = datetime('now')
        WHERE user_id = (SELECT user_id FROM payout_statements WHERE id = ?)
          AND payout_status = 'PENDING'
      `).bind(id, id).run();
    }

    return c.json({ success: true });
  } catch (e: unknown) {
    console.error('[Revenue] statement update error:', e);
    return c.json({ error: '精算書の更新に失敗しました' }, 500);
  }
});

// ============================================
// 収益分配ルール一覧（管理者用）
// ============================================
app.get('/rules', requireAdmin, async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT * FROM revenue_share_rules ORDER BY priority DESC, created_at DESC
    `).all<Record<string, unknown>>();

    return c.json({ rules: result.results || [] });
  } catch (e: unknown) {
    console.error('[Revenue] rules fetch error:', e);
    return c.json({ error: '収益分配ルールの取得に失敗しました' }, 500);
  }
});

// ============================================
// 収益分配ルール作成（管理者用）
// ============================================
app.post('/rules', requireAdmin, async (c) => {
  try {
    const body = await c.req.json() as {
      therapist_rate: number;
      host_rate: number;
      office_rate: number;
      platform_rate: number;
      promotion_rate?: number;
      booking_type?: string;
      office_id?: string;
      priority?: number;
    };

    const promotion_rate = (body as { promotion_rate?: number }).promotion_rate || 0;
    const total = body.therapist_rate + body.host_rate + body.office_rate + body.platform_rate + promotion_rate;
    if (Math.abs(total - 100) > 0.01) {
      return c.json({ error: `分配率の合計は100%である必要があります（現在: ${total}%）` }, 400);
    }

    const id = `rule_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    await c.env.DB.prepare(`
      INSERT INTO revenue_share_rules (
        id,
        therapist_rate, host_rate, office_rate, platform_rate, promotion_rate,
        booking_type, office_id, priority, is_active,
        created_at, updated_at
      ) VALUES (
        ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, 1,
        datetime('now'), datetime('now')
      )
    `).bind(
      id,
      body.therapist_rate,
      body.host_rate,
      body.office_rate,
      body.platform_rate,
      promotion_rate,
      body.booking_type || null,
      body.office_id || null,
      body.priority || 0
    ).run();

    return c.json({ success: true, id }, 201);
  } catch (e: unknown) {
    console.error('[Revenue] rule create error:', e);
    return c.json({ error: '収益分配ルールの作成に失敗しました' }, 500);
  }
});

// ============================================
// 収益分配ルール更新（管理者用）
// ============================================
app.patch('/rules/:id', requireAdmin, async (c) => {
  const id = c.req.param('id');

  try {
    const body = await c.req.json() as {
      therapist_rate?: number;
      host_rate?: number;
      office_rate?: number;
      platform_rate?: number;
      promotion_rate?: number;
      booking_type?: string;
      office_id?: string;
      priority?: number;
      is_active?: number;
    };

    // 分配率が変更される場合は合計を検証
    if (
      body.therapist_rate !== undefined ||
      body.host_rate !== undefined ||
      body.office_rate !== undefined ||
      body.platform_rate !== undefined ||
      body.promotion_rate !== undefined
    ) {
      const existing = await c.env.DB.prepare(`
        SELECT therapist_rate, host_rate, office_rate, platform_rate, promotion_rate
        FROM revenue_share_rules WHERE id = ?
      `).bind(id).first<{
        therapist_rate: number;
        host_rate: number;
        office_rate: number;
        platform_rate: number;
        promotion_rate: number;
      }>();

      if (!existing) {
        return c.json({ error: 'ルールが見つかりません' }, 404);
      }

      const newRates = {
        therapist_rate: body.therapist_rate ?? existing.therapist_rate,
        host_rate: body.host_rate ?? existing.host_rate,
        office_rate: body.office_rate ?? existing.office_rate,
        platform_rate: body.platform_rate ?? existing.platform_rate,
        promotion_rate: body.promotion_rate ?? existing.promotion_rate,
      };

      const total = newRates.therapist_rate + newRates.host_rate + newRates.office_rate + newRates.platform_rate + newRates.promotion_rate;
      if (Math.abs(total - 100) > 0.01) {
        return c.json({ error: `分配率の合計は100%である必要があります（現在: ${total}%）` }, 400);
      }
    }

    const updates: string[] = [];
    const params: (string | number | null)[] = [];

    if (body.therapist_rate !== undefined) { updates.push('therapist_rate = ?'); params.push(body.therapist_rate); }
    if (body.host_rate !== undefined) { updates.push('host_rate = ?'); params.push(body.host_rate); }
    if (body.office_rate !== undefined) { updates.push('office_rate = ?'); params.push(body.office_rate); }
    if (body.platform_rate !== undefined) { updates.push('platform_rate = ?'); params.push(body.platform_rate); }
    if (body.promotion_rate !== undefined) { updates.push('promotion_rate = ?'); params.push(body.promotion_rate); }
    if (body.booking_type !== undefined) { updates.push('booking_type = ?'); params.push(body.booking_type); }
    if (body.office_id !== undefined) { updates.push('office_id = ?'); params.push(body.office_id); }
    if (body.priority !== undefined) { updates.push('priority = ?'); params.push(body.priority); }
    if (body.is_active !== undefined) { updates.push('is_active = ?'); params.push(body.is_active); }

    if (updates.length === 0) {
      return c.json({ error: '更新するフィールドがありません' }, 400);
    }

    updates.push("updated_at = datetime('now')");
    params.push(id);

    await c.env.DB.prepare(`
      UPDATE revenue_share_rules SET ${updates.join(', ')} WHERE id = ?
    `).bind(...params).run();

    return c.json({ success: true });
  } catch (e: unknown) {
    console.error('[Revenue] rule update error:', e);
    return c.json({ error: '収益分配ルールの更新に失敗しました' }, 500);
  }
});

// ============================================
// 収益サマリー取得（管理者用）
// ============================================
app.get('/summary', requireAdmin, async (c) => {
  const { month } = c.req.query();

  try {
    let dateFilter = '';
    const params: string[] = [];

    if (month) {
      dateFilter = `AND strftime('%Y-%m', t.paid_at) = ?`;
      params.push(month);
    }

    const summary = await c.env.DB.prepare(`
      SELECT
        COUNT(DISTINCT t.id) as total_transactions,
        SUM(t.gross_amount) as total_gross,
        SUM(CASE WHEN ts.role = 'THERAPIST' THEN ts.amount ELSE 0 END) as therapist_total,
        SUM(CASE WHEN ts.role = 'HOST' THEN ts.amount ELSE 0 END) as host_total,
        SUM(CASE WHEN ts.role = 'OFFICE' THEN ts.amount ELSE 0 END) as office_total,
        SUM(CASE WHEN ts.role = 'PLATFORM' THEN ts.amount ELSE 0 END) as platform_total
      FROM transactions t
      LEFT JOIN transaction_splits ts ON t.id = ts.transaction_id
      WHERE t.status = 'SUCCEEDED' ${dateFilter}
    `).bind(...params).first<{
      total_transactions: number;
      total_gross: number;
      therapist_total: number;
      host_total: number;
      office_total: number;
      platform_total: number;
    }>();

    return c.json({ summary: summary || {} });
  } catch (e: unknown) {
    console.error('[Revenue] summary fetch error:', e);
    return c.json({ error: '収益サマリーの取得に失敗しました' }, 500);
  }
});

export default app;
