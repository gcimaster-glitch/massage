/**
 * 決済・領収書管理API
 * - Stripe決済セッション作成
 * - Stripe Connect オンボーディング
 * - 領収書HTML生成
 * - ユーザー支払い履歴取得
 * - セラピスト報酬管理
 */

import { Hono } from 'hono';
import { verifyJWT } from './auth-middleware';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
  STRIPE_SECRET: string;
  STRIPE_PUBLIC_KEY: string;
  RESEND_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// ============================================
// Stripe 決済セッション作成
// ============================================
app.post('/create-session', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const token = authHeader.replace('Bearer ', '');
  const payload = await verifyJWT(token, c.env.JWT_SECRET);
  if (!payload) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  const { bookingId, amount } = await c.req.json<{ bookingId: string; amount: number }>();
  const { STRIPE_SECRET } = c.env;

  if (!STRIPE_SECRET) {
    return c.json({ error: 'Stripe is not configured' }, 503);
  }

  if (!bookingId || !amount || amount <= 0) {
    return c.json({ error: 'bookingId and amount are required' }, 400);
  }

  const origin = new URL(c.req.url).origin;

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'mode': 'payment',
      'success_url': `${origin}/app/booking/success?id=${bookingId}`,
      'cancel_url': `${origin}/app/booking/new`,
      'line_items[0][price_data][currency]': 'jpy',
      'line_items[0][price_data][product_data][name]': 'HOGUSY Wellness Session',
      'line_items[0][price_data][unit_amount]': amount.toString(),
      'line_items[0][quantity]': '1',
      'metadata[booking_id]': bookingId,
      'metadata[user_id]': payload.userId as string,
    }),
  });

  const session = await response.json<{ id?: string; url?: string; error?: { message: string } }>();

  if (!response.ok) {
    return c.json({ error: session.error?.message || 'Stripe error' }, 500);
  }

  // bookingsテーブルにstripe_session_idを記録
  try {
    await c.env.DB.prepare(`
      UPDATE bookings SET stripe_session_id = ?, payment_status = 'PENDING', updated_at = datetime('now')
      WHERE id = ? AND user_id = ?
    `).bind(session.id || null, bookingId, payload.userId).run();
  } catch (e) {
    console.error('Failed to update booking stripe session:', e);
  }

  return c.json({ checkoutUrl: session.url, sessionId: session.id });
});

// ============================================
// Stripe Connect オンボーディング
// セラピストがStripe Connectアカウントを作成し、
// 報酬を受け取れるようにするためのオンボーディングURL生成
// ============================================
app.post('/connect-onboarding', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.replace('Bearer ', '');
  const payload = await verifyJWT(token, c.env.JWT_SECRET);
  if (!payload) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  const { STRIPE_SECRET, DB } = c.env;
  if (!STRIPE_SECRET) {
    return c.json({ error: 'Stripe is not configured' }, 503);
  }

  const userId = payload.userId as string;
  const origin = new URL(c.req.url).origin;

  try {
    // 既存のStripe Connectアカウントを確認
    const existing = await DB.prepare(`
      SELECT stripe_account_id, charges_enabled, payouts_enabled, details_submitted
      FROM stripe_connected_accounts
      WHERE user_id = ?
    `).bind(userId).first<{
      stripe_account_id: string;
      charges_enabled: number;
      payouts_enabled: number;
      details_submitted: number;
    }>();

    let stripeAccountId: string;

    if (existing) {
      stripeAccountId = existing.stripe_account_id;

      // 既に完全に設定済みの場合
      if (existing.charges_enabled && existing.payouts_enabled) {
        return c.json({
          status: 'complete',
          message: 'Stripe Connectアカウントは既に設定済みです',
          charges_enabled: true,
          payouts_enabled: true,
        });
      }
    } else {
      // 新規Stripe Connectアカウント作成（Express型）
      const user = await DB.prepare(
        'SELECT email, name FROM users WHERE id = ?'
      ).bind(userId).first<{ email: string; name: string }>();

      const createRes = await fetch('https://api.stripe.com/v1/accounts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'type': 'express',
          'country': 'JP',
          'email': user?.email || '',
          'capabilities[card_payments][requested]': 'true',
          'capabilities[transfers][requested]': 'true',
          'business_type': 'individual',
          'metadata[user_id]': userId,
        }),
      });

      const account = await createRes.json<{ id?: string; error?: { message: string } }>();
      if (!createRes.ok || !account.id) {
        return c.json({ error: account.error?.message || 'Stripe account creation failed' }, 500);
      }

      stripeAccountId = account.id;

      // DBに保存
      const now = new Date().toISOString();
      const connId = `sca_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      await DB.prepare(`
        INSERT INTO stripe_connected_accounts (id, user_id, stripe_account_id, type, charges_enabled, payouts_enabled, details_submitted, created_at, updated_at)
        VALUES (?, ?, ?, 'express', 0, 0, 0, ?, ?)
      `).bind(connId, userId, stripeAccountId, now, now).run();
    }

    // オンボーディングリンク生成
    const linkRes = await fetch('https://api.stripe.com/v1/account_links', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'account': stripeAccountId,
        'refresh_url': `${origin}/app/therapist/stripe-setup?refresh=true`,
        'return_url': `${origin}/app/therapist/stripe-setup?success=true`,
        'type': 'account_onboarding',
      }),
    });

    const link = await linkRes.json<{ url?: string; error?: { message: string } }>();
    if (!linkRes.ok || !link.url) {
      return c.json({ error: link.error?.message || 'Failed to create onboarding link' }, 500);
    }

    return c.json({
      url: link.url,
      stripe_account_id: stripeAccountId,
      status: 'pending',
    });

  } catch (e) {
    console.error('Stripe Connect onboarding error:', e);
    return c.json({ error: 'Stripe Connect setup failed' }, 500);
  }
});

// ============================================
// GET /api/payments/connect-status
// セラピストのStripe Connect状況確認
// ============================================
app.get('/connect-status', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.replace('Bearer ', '');
  const payload = await verifyJWT(token, c.env.JWT_SECRET);
  if (!payload) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  const { STRIPE_SECRET, DB } = c.env;
  const userId = payload.userId as string;

  const account = await DB.prepare(`
    SELECT stripe_account_id, charges_enabled, payouts_enabled, details_submitted, created_at
    FROM stripe_connected_accounts
    WHERE user_id = ?
  `).bind(userId).first<{
    stripe_account_id: string;
    charges_enabled: number;
    payouts_enabled: number;
    details_submitted: number;
    created_at: string;
  }>();

  if (!account) {
    return c.json({ connected: false, status: 'not_started' });
  }

  // Stripeから最新状況を取得して同期
  if (STRIPE_SECRET && account.stripe_account_id) {
    try {
      const res = await fetch(`https://api.stripe.com/v1/accounts/${account.stripe_account_id}`, {
        headers: { 'Authorization': `Bearer ${STRIPE_SECRET}` },
      });
      if (res.ok) {
        const stripeAccount = await res.json<{
          charges_enabled: boolean;
          payouts_enabled: boolean;
          details_submitted: boolean;
        }>();

        // DBを最新状態に同期
        await DB.prepare(`
          UPDATE stripe_connected_accounts
          SET charges_enabled = ?, payouts_enabled = ?, details_submitted = ?, updated_at = datetime('now')
          WHERE user_id = ?
        `).bind(
          stripeAccount.charges_enabled ? 1 : 0,
          stripeAccount.payouts_enabled ? 1 : 0,
          stripeAccount.details_submitted ? 1 : 0,
          userId
        ).run();

        return c.json({
          connected: true,
          stripe_account_id: account.stripe_account_id,
          charges_enabled: stripeAccount.charges_enabled,
          payouts_enabled: stripeAccount.payouts_enabled,
          details_submitted: stripeAccount.details_submitted,
          status: stripeAccount.charges_enabled && stripeAccount.payouts_enabled ? 'active' : 'pending',
        });
      }
    } catch (e) {
      console.error('Stripe account status sync error:', e);
    }
  }

  return c.json({
    connected: true,
    stripe_account_id: account.stripe_account_id,
    charges_enabled: !!account.charges_enabled,
    payouts_enabled: !!account.payouts_enabled,
    details_submitted: !!account.details_submitted,
    status: account.charges_enabled && account.payouts_enabled ? 'active' : 'pending',
  });
});

// ============================================
// 領収書HTML生成（paymentId指定）
// ============================================
app.get('/receipts/:paymentId', async (c) => {
  const paymentId = c.req.param('paymentId');
  const authHeader = c.req.header('Authorization');

  if (!authHeader) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.replace('Bearer ', '');
  const payload = await verifyJWT(token, c.env.JWT_SECRET);
  if (!payload) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  const { DB } = c.env;
  const userId = payload.userId;

  const payment = await DB.prepare(`
    SELECT
      p.id,
      p.amount,
      p.created_at,
      p.status,
      b.id as booking_id,
      b.service_name,
      b.scheduled_at,
      b.therapist_name,
      u.name as customer_name
    FROM payments p
    JOIN bookings b ON p.booking_id = b.id
    JOIN users u ON p.user_id = u.id
    WHERE p.id = ? AND p.user_id = ?
  `).bind(paymentId, userId).first<Record<string, unknown>>();

  if (!payment) {
    return c.json({ error: '領収書が見つかりません' }, 404);
  }

  const issueDate = new Date(payment.created_at as string).toLocaleDateString('ja-JP');

  const receiptHTML = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>領収書 - HOGUSY</title>
  <style>
    body { font-family: 'Hiragino Sans', 'Meiryo', sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { text-align: center; border-bottom: 3px solid #0d9488; padding-bottom: 20px; margin-bottom: 30px; }
    .amount { font-size: 48px; font-weight: bold; text-align: center; padding: 20px; background: #f0fdfa; border: 2px solid #0d9488; margin: 30px 0; color: #0d9488; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px; border: 1px solid #ddd; text-align: left; }
    th { background: #f5f5f5; }
    @media print { body { padding: 0; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="color: #0d9488;">🌿 HOGUSY</h1>
    <p style="font-size: 20px; font-weight: bold;">領収書</p>
    <p style="color: #6b7280;">発行日: ${issueDate}</p>
  </div>
  <div class="amount">¥${(payment.amount as number).toLocaleString()}</div>
  <table>
    <tr><th>領収書番号</th><td>${payment.id as string}</td></tr>
    <tr><th>お客様名</th><td>${payment.customer_name as string} 様</td></tr>
    <tr><th>サービス内容</th><td>${payment.service_name as string}</td></tr>
    <tr><th>担当セラピスト</th><td>${payment.therapist_name as string}</td></tr>
    <tr><th>予約番号</th><td>${payment.booking_id as string}</td></tr>
  </table>
  <p style="margin-top: 20px; font-size: 12px; color: #666;">但し書き: 上記金額を正に領収いたしました。</p>
  <div class="no-print" style="text-align: center; margin-top: 30px;">
    <button onclick="window.print()" style="padding: 12px 30px; background: #14b8a6; color: white; border: none; border-radius: 6px; cursor: pointer;">印刷する</button>
  </div>
</body>
</html>`;

  return c.html(receiptHTML);
});

// ============================================
// ユーザー支払い履歴取得
// ============================================
app.get('/user/payments', async (c) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.replace('Bearer ', '');
  const payload = await verifyJWT(token, c.env.JWT_SECRET);
  if (!payload) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  const userId = payload.userId;
  const { DB } = c.env;

  try {
    const result = await DB.prepare(`
      SELECT 
        b.id as booking_id,
        b.service_name,
        b.price as amount,
        b.payment_status as status,
        b.scheduled_at,
        b.created_at
      FROM bookings b
      WHERE b.user_id = ? AND b.payment_status IS NOT NULL
      ORDER BY b.created_at DESC
    `).bind(userId).all<Record<string, unknown>>();

    const payments = (result.results || []).map((row) => ({
      id: `pay-${row.booking_id}`,
      booking_id: row.booking_id,
      amount: row.amount,
      status: row.status === 'COMPLETED' ? 'COMPLETED' : row.status === 'PENDING' ? 'PENDING' : 'FAILED',
      payment_method: 'カード決済',
      service_name: row.service_name,
      scheduled_at: row.scheduled_at,
      created_at: row.created_at,
    }));

    return c.json({ payments });
  } catch (e: unknown) {
    console.error('Payment history fetch error:', e);
    return c.json({ error: 'Failed to fetch payment history' }, 500);
  }
});

// ============================================
// セラピスト報酬履歴取得
// ============================================
app.get('/therapist/earnings', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.replace('Bearer ', '');
  const payload = await verifyJWT(token, c.env.JWT_SECRET);
  if (!payload) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  const userId = payload.userId as string;
  const { DB } = c.env;

  try {
    // therapist_profilesからprofile_idを取得
    const profile = await DB.prepare(
      'SELECT id FROM therapist_profiles WHERE user_id = ?'
    ).bind(userId).first<{ id: string }>();

    if (!profile) {
      return c.json({ error: 'セラピストプロフィールが見つかりません' }, 404);
    }

    const result = await DB.prepare(`
      SELECT
        te.id,
        te.booking_id,
        te.booking_price,
        te.therapist_amount,
        te.therapist_rate,
        te.status,
        te.booking_date,
        te.paid_at,
        te.created_at,
        b.service_name
      FROM therapist_earnings te
      LEFT JOIN bookings b ON te.booking_id = b.id
      WHERE te.therapist_profile_id = ?
      ORDER BY te.booking_date DESC
      LIMIT 100
    `).bind(profile.id).all<Record<string, unknown>>();

    // 集計
    const earnings = result.results || [];
    const totalEarnings = earnings
      .filter(e => e.status === 'PAID')
      .reduce((sum, e) => sum + (e.therapist_amount as number || 0), 0);
    const pendingEarnings = earnings
      .filter(e => e.status === 'PENDING' || e.status === 'CONFIRMED')
      .reduce((sum, e) => sum + (e.therapist_amount as number || 0), 0);

    return c.json({
      earnings,
      summary: {
        total_paid: totalEarnings,
        total_pending: pendingEarnings,
        total_bookings: earnings.length,
      }
    });
  } catch (e) {
    console.error('Therapist earnings fetch error:', e);
    return c.json({ error: 'Failed to fetch earnings' }, 500);
  }
});

export default app;
