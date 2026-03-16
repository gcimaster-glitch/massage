/**
 * Stripe Webhook ルート
 * 
 * 対応イベント:
 * - checkout.session.completed    → 予約決済完了 → 収益分配エンジン起動
 * - payment_intent.succeeded      → 支払い成功 → bookingのpayment_status更新
 * - payment_intent.payment_failed → 支払い失敗 → bookingをCANCELLEDに更新
 * - customer.subscription.created → サブスク開始 → プラン有効化
 * - customer.subscription.deleted → サブスク解約 → プラン無効化
 * - account.updated               → Stripe Connect口座更新 → 振込可否フラグ更新
 */

import { Hono } from 'hono';
import { Bindings } from './types';

const app = new Hono<{ Bindings: Bindings }>();

// ============================================
// Stripe署名検証ユーティリティ（Web Crypto API）
// ============================================
async function verifyStripeSignature(
  payload: string,
  sigHeader: string,
  secret: string
): Promise<boolean> {
  try {
    const parts = sigHeader.split(',');
    const tPart = parts.find(p => p.startsWith('t='));
    const v1Part = parts.find(p => p.startsWith('v1='));
    if (!tPart || !v1Part) return false;

    const timestamp = tPart.substring(2);
    const signature = v1Part.substring(3);
    const signedPayload = `${timestamp}.${payload}`;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signatureBytes = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(signedPayload)
    );
    const expectedSig = Array.from(new Uint8Array(signatureBytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // タイムスタンプ検証（5分以内）
    const now = Math.floor(Date.now() / 1000);
    const webhookTime = parseInt(timestamp, 10);
    if (Math.abs(now - webhookTime) > 300) {
      console.error('Webhook timestamp too old:', Math.abs(now - webhookTime), 'seconds');
      return false;
    }

    return expectedSig === signature;
  } catch (e) {
    console.error('Stripe signature verification error:', e);
    return false;
  }
}

// ============================================
// 収益分配エンジン呼び出し
// ============================================
async function triggerRevenueDistribution(
  db: D1Database,
  bookingId: string,
  totalAmount: number
): Promise<void> {
  try {
    // 予約情報を取得
    const booking = await db.prepare(`
      SELECT b.*, t.stripe_account_id as therapist_stripe_id,
             t.office_id,
             b.site_id
      FROM bookings b
      LEFT JOIN therapists t ON b.therapist_id = t.id
      WHERE b.id = ?
    `).bind(bookingId).first<{
      therapist_id: string;
      therapist_stripe_id: string | null;
      office_id: string | null;
      site_id: string | null;
    }>();

    if (!booking) {
      console.error('Booking not found for revenue distribution:', bookingId);
      return;
    }

    // 収益分配ルールを取得（プラン別 → デフォルト順）
    const rule = await db.prepare(`
      SELECT * FROM revenue_share_rules
      WHERE is_active = 1
      ORDER BY CASE WHEN plan_id IS NULL THEN 1 ELSE 0 END
      LIMIT 1
    `).first<{
      therapist_rate: number;
      office_rate: number;
      host_rate: number;
      platform_rate: number;
      marketing_rate: number;
    }>();

    // デフォルト分配率（資料準拠）
    const rates = rule || {
      therapist_rate: 0.40,
      office_rate: 0.25,
      host_rate: 0.20,
      platform_rate: 0.10,
      marketing_rate: 0.05,
    };

    const therapistAmount = Math.floor(totalAmount * rates.therapist_rate);
    const officeAmount = Math.floor(totalAmount * rates.office_rate);
    const hostAmount = Math.floor(totalAmount * rates.host_rate);
    const platformAmount = Math.floor(totalAmount * rates.platform_rate);
    const marketingAmount = totalAmount - therapistAmount - officeAmount - hostAmount - platformAmount;

    // earnings_distributionsテーブルに記録
    const distributionId = crypto.randomUUID();
    await db.prepare(`
      INSERT INTO earnings_distributions (
        id, booking_id, total_amount,
        therapist_id, therapist_amount,
        office_id, office_amount,
        host_id, host_amount,
        platform_amount, marketing_amount,
        status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', datetime('now'))
    `).bind(
      distributionId,
      bookingId,
      totalAmount,
      booking.therapist_id,
      therapistAmount,
      booking.office_id,
      officeAmount,
      booking.site_id,
      hostAmount,
      platformAmount,
      marketingAmount
    ).run();

    console.log(`Revenue distribution created: ${distributionId} for booking ${bookingId}`);
    console.log(`  Total: ¥${totalAmount} | Therapist: ¥${therapistAmount} | Office: ¥${officeAmount} | Host: ¥${hostAmount} | Platform: ¥${platformAmount} | Marketing: ¥${marketingAmount}`);

  } catch (e) {
    console.error('Revenue distribution error:', e);
  }
}

// ============================================
// POST /api/webhook/stripe
// ============================================
app.post('/stripe', async (c) => {
  const payload = await c.req.text();
  const sigHeader = c.req.header('stripe-signature') || '';
  const webhookSecret = c.env.STRIPE_WEBHOOK_SECRET;

  // 署名検証（本番環境のみ）
  if (webhookSecret && sigHeader) {
    const isValid = await verifyStripeSignature(payload, sigHeader, webhookSecret);
    if (!isValid) {
      console.error('Invalid Stripe webhook signature');
      return c.json({ error: 'Invalid signature' }, 400);
    }
  } else if (webhookSecret && !sigHeader) {
    return c.json({ error: 'Missing stripe-signature header' }, 400);
  }

  let event: { type: string; data: { object: Record<string, unknown> } };
  try {
    event = JSON.parse(payload);
  } catch {
    return c.json({ error: 'Invalid JSON payload' }, 400);
  }

  const db = c.env.DB;
  const eventType = event.type;
  const obj = event.data.object;

  console.log(`Stripe webhook received: ${eventType}`);

  try {
    switch (eventType) {

      // ─────────────────────────────────────────
      // 1. 決済完了 → 収益分配エンジン起動
      // ─────────────────────────────────────────
      case 'checkout.session.completed': {
        const session = obj as {
          id: string;
          payment_status: string;
          amount_total: number;
          metadata?: { booking_id?: string };
          payment_intent?: string;
        };

        if (session.payment_status !== 'paid') break;

        const bookingId = session.metadata?.booking_id;
        if (!bookingId) {
          console.warn('checkout.session.completed: no booking_id in metadata');
          break;
        }

        // bookingのpayment_statusをPAIDに更新
        await db.prepare(`
          UPDATE bookings
          SET payment_status = 'PAID',
              stripe_session_id = ?,
              stripe_payment_intent_id = ?,
              updated_at = datetime('now')
          WHERE id = ?
        `).bind(session.id, session.payment_intent || null, bookingId).run();

        // 収益分配エンジン起動
        const totalAmount = Math.floor((session.amount_total || 0) / 100); // 円換算
        await triggerRevenueDistribution(db, bookingId, totalAmount);

        console.log(`checkout.session.completed: booking ${bookingId} paid ¥${totalAmount}`);
        break;
      }

      // ─────────────────────────────────────────
      // 2. PaymentIntent成功
      // ─────────────────────────────────────────
      case 'payment_intent.succeeded': {
        const pi = obj as {
          id: string;
          amount: number;
          metadata?: { booking_id?: string };
        };

        const bookingId = pi.metadata?.booking_id;
        if (!bookingId) break;

        await db.prepare(`
          UPDATE bookings
          SET payment_status = 'PAID',
              stripe_payment_intent_id = ?,
              updated_at = datetime('now')
          WHERE id = ? AND payment_status != 'PAID'
        `).bind(pi.id, bookingId).run();

        console.log(`payment_intent.succeeded: booking ${bookingId}`);
        break;
      }

      // ─────────────────────────────────────────
      // 3. 支払い失敗
      // ─────────────────────────────────────────
      case 'payment_intent.payment_failed': {
        const pi = obj as {
          id: string;
          metadata?: { booking_id?: string };
          last_payment_error?: { message?: string };
        };

        const bookingId = pi.metadata?.booking_id;
        if (!bookingId) break;

        await db.prepare(`
          UPDATE bookings
          SET payment_status = 'FAILED',
              updated_at = datetime('now')
          WHERE id = ?
        `).bind(bookingId).run();

        console.log(`payment_intent.payment_failed: booking ${bookingId} - ${pi.last_payment_error?.message}`);
        break;
      }

      // ─────────────────────────────────────────
      // 4. サブスクリプション開始
      // ─────────────────────────────────────────
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = obj as {
          id: string;
          customer: string;
          status: string;
          items?: { data?: Array<{ price?: { id: string } }> };
          metadata?: { user_id?: string; role?: string };
        };

        const userId = sub.metadata?.user_id;
        if (!userId) break;

        const isActive = ['active', 'trialing'].includes(sub.status);
        const priceId = sub.items?.data?.[0]?.price?.id;

        // subscription_plansからplan_idを逆引き
        let planId: string | null = null;
        if (priceId) {
          const plan = await db.prepare(`
            SELECT id FROM subscription_plans
            WHERE stripe_price_id_monthly = ? OR stripe_price_id_annual = ?
            LIMIT 1
          `).bind(priceId, priceId).first<{ id: string }>();
          planId = plan?.id || null;
        }

        // user_subscriptionsテーブルにupsert
        await db.prepare(`
          INSERT INTO user_subscriptions (id, user_id, plan_id, stripe_subscription_id, stripe_customer_id, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
          ON CONFLICT(stripe_subscription_id) DO UPDATE SET
            status = excluded.status,
            plan_id = COALESCE(excluded.plan_id, plan_id),
            updated_at = datetime('now')
        `).bind(
          crypto.randomUUID(),
          userId,
          planId,
          sub.id,
          sub.customer,
          isActive ? 'ACTIVE' : sub.status.toUpperCase()
        ).run();

        console.log(`subscription ${eventType}: user ${userId} plan ${planId} status ${sub.status}`);
        break;
      }

      // ─────────────────────────────────────────
      // 5. サブスクリプション解約
      // ─────────────────────────────────────────
      case 'customer.subscription.deleted': {
        const sub = obj as {
          id: string;
          metadata?: { user_id?: string };
        };

        await db.prepare(`
          UPDATE user_subscriptions
          SET status = 'CANCELLED', updated_at = datetime('now')
          WHERE stripe_subscription_id = ?
        `).bind(sub.id).run();

        console.log(`subscription deleted: ${sub.id}`);
        break;
      }

      // ─────────────────────────────────────────
      // 6. Stripe Connect口座更新
      // ─────────────────────────────────────────
      case 'account.updated': {
        const account = obj as {
          id: string;
          charges_enabled: boolean;
          payouts_enabled: boolean;
          details_submitted: boolean;
        };

        await db.prepare(`
          UPDATE stripe_connected_accounts
          SET charges_enabled = ?,
              payouts_enabled = ?,
              details_submitted = ?,
              updated_at = datetime('now')
          WHERE stripe_account_id = ?
        `).bind(
          account.charges_enabled ? 1 : 0,
          account.payouts_enabled ? 1 : 0,
          account.details_submitted ? 1 : 0,
          account.id
        ).run();

        console.log(`account.updated: ${account.id} charges=${account.charges_enabled} payouts=${account.payouts_enabled}`);
        break;
      }

      default:
        console.log(`Unhandled Stripe event: ${eventType}`);
    }

    return c.json({ received: true, type: eventType });

  } catch (e) {
    console.error(`Webhook handler error for ${eventType}:`, e);
    // Stripeには200を返す（再送を防ぐ）
    return c.json({ received: true, error: 'Internal processing error' });
  }
});

// ============================================
// GET /api/webhook/stripe/health
// ============================================
app.get('/stripe/health', async (c) => {
  return c.json({
    status: 'ok',
    webhook_secret_configured: !!c.env.STRIPE_WEBHOOK_SECRET,
    timestamp: new Date().toISOString(),
  });
});

export default app;
