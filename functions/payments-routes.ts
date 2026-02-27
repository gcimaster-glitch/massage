/**
 * 決済・領収書管理API
 * - Stripe決済セッション作成
 * - Stripe Connect オンボーディング
 * - 領収書HTML生成
 * - ユーザー支払い履歴取得
 */

import { Hono } from 'hono';
import { verifyJWT } from './auth-middleware';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
  STRIPE_SECRET: string;
  RESEND_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// ============================================
// Stripe 決済セッション作成
// ============================================
app.post('/create-session', async (c) => {
  const { bookingId, amount } = await c.req.json<{ bookingId: string; amount: number }>();
  const { STRIPE_SECRET } = c.env;

  if (!STRIPE_SECRET) {
    return c.json({ error: 'Stripe is not configured' }, 503);
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
    }),
  });

  const session = await response.json<{ url?: string; error?: { message: string } }>();

  if (!response.ok) {
    return c.json({ error: session.error?.message || 'Stripe error' }, 500);
  }

  return c.json({ checkoutUrl: session.url });
});

// ============================================
// Stripe Connect オンボーディング
// ============================================
app.get('/connect-onboarding', async (c) => {
  // TODO: Stripe Connect アカウント作成とオンボーディングURL生成
  return c.json({ url: 'https://connect.stripe.com/setup/...' });
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

  // モックデータ（本番では DB から取得）
  const payment = {
    id: paymentId,
    amount: 8000,
    service_name: '60分リラクゼーションマッサージ',
    booking_id: 'B-2024-001',
    scheduled_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    customer_name: '山田 太郎',
    therapist_name: '田中 有紀',
  };

  const issueDate = new Date(payment.created_at).toLocaleDateString('ja-JP');

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
  <div class="amount">¥${payment.amount.toLocaleString()}</div>
  <table>
    <tr><th>領収書番号</th><td>${payment.id}</td></tr>
    <tr><th>お客様名</th><td>${payment.customer_name} 様</td></tr>
    <tr><th>サービス内容</th><td>${payment.service_name}</td></tr>
    <tr><th>担当セラピスト</th><td>${payment.therapist_name}</td></tr>
    <tr><th>予約番号</th><td>${payment.booking_id}</td></tr>
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

export default app;
