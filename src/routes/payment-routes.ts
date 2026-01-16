/**
 * payment-routes.ts: Stripe決済関連のAPIルート
 * - POST /api/payment/create-intent: PaymentIntent作成
 * - POST /api/payment/confirm: 決済確認
 * - GET /api/payment/status/:paymentIntentId: 決済ステータス取得
 */

import { Hono } from 'hono';
import Stripe from 'stripe';

type Bindings = {
  STRIPE_SECRET: string;
  RESEND_API_KEY: string;
  DB: D1Database;
};

const payment = new Hono<{ Bindings: Bindings }>();

/**
 * POST /api/payment/create-intent
 * PaymentIntentを作成（決済準備）
 */
payment.post('/create-intent', async (c) => {
  try {
    const { amount, currency = 'jpy', booking_id, metadata } = await c.req.json();

    if (!amount || amount <= 0) {
      return c.json({ error: 'Invalid amount' }, 400);
    }

    const stripe = new Stripe(c.env.STRIPE_SECRET, {
      apiVersion: '2024-12-18.acacia',
    });

    // PaymentIntentを作成
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // 円単位（小数点なし）
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        booking_id: booking_id || '',
        ...metadata,
      },
    });

    console.log('✅ PaymentIntent created:', paymentIntent.id);

    return c.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('❌ Payment Intent creation failed:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * POST /api/payment/confirm
 * 決済確認（予約レコードのステータス更新）
 */
payment.post('/confirm', async (c) => {
  try {
    const { paymentIntentId, bookingId } = await c.req.json();

    if (!paymentIntentId || !bookingId) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const stripe = new Stripe(c.env.STRIPE_SECRET, {
      apiVersion: '2024-12-18.acacia',
    });

    // PaymentIntentのステータスを確認
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return c.json({ error: 'Payment not completed', status: paymentIntent.status }, 400);
    }

    // 予約レコードのステータスを更新
    const updateResult = await c.env.DB.prepare(`
      UPDATE bookings 
      SET payment_status = 'PAID', 
          payment_intent_id = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(paymentIntentId, bookingId).run();

    console.log('✅ Payment confirmed for booking:', bookingId);

    return c.json({
      success: true,
      paymentIntentId,
      bookingId,
      status: paymentIntent.status,
    });
  } catch (error: any) {
    console.error('❌ Payment confirmation failed:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * GET /api/payment/status/:paymentIntentId
 * 決済ステータス取得
 */
payment.get('/status/:paymentIntentId', async (c) => {
  try {
    const paymentIntentId = c.req.param('paymentIntentId');

    const stripe = new Stripe(c.env.STRIPE_SECRET, {
      apiVersion: '2024-12-18.acacia',
    });

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return c.json({
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });
  } catch (error: any) {
    console.error('❌ Payment status retrieval failed:', error);
    return c.json({ error: error.message }, 500);
  }
});

export default payment;
