/**
 * payment-routes.ts: Stripe決済関連のAPIルート
 * - POST /api/payment/create-intent: PaymentIntent作成
 * - POST /api/payment/confirm: 決済確認
 * - GET /api/payment/status/:paymentIntentId: 決済ステータス取得
 */

import { Hono } from 'hono';
import Stripe from 'stripe';
import { processPaymentSplit } from '../revenue-engine-routes';
import type { Bindings } from '../types';

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

    if (!c.env.STRIPE_SECRET) {
      return c.json({ error: 'Stripe configuration missing' }, 500);
    }

    const stripe = new Stripe(c.env.STRIPE_SECRET, {
      apiVersion: '2026-02-25.clover',
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
  } catch (error: unknown) {
    console.error('❌ Payment Intent creation failed:', error);
    return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

/**
 * POST /api/payment/confirm
 * 決済確認（予約レコードのステータス更新 + 報酬分配実行）
 */
payment.post('/confirm', async (c) => {
  try {
    const { paymentIntentId, bookingId } = await c.req.json();

    if (!paymentIntentId || !bookingId) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    if (!c.env.STRIPE_SECRET) {
      return c.json({ error: 'Stripe configuration missing' }, 500);
    }

    const stripe = new Stripe(c.env.STRIPE_SECRET, {
      apiVersion: '2026-02-25.clover',
    });

    // PaymentIntentのステータスを確認
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return c.json({ error: 'Payment not completed', status: paymentIntent.status }, 400);
    }

    // 既に処理済みか確認（二重処理防止）
    const existingTx = await c.env.DB.prepare(
      'SELECT id FROM transactions WHERE stripe_payment_intent_id = ?'
    ).bind(paymentIntentId).first();

    let splitResult = null;
    if (!existingTx) {
      // 報酬分配を実行（processPaymentSplitのシグネチャ: db, bookingId, stripePaymentIntentId, grossAmount）
      try {
        splitResult = await processPaymentSplit(
          c.env.DB,
          bookingId,
          paymentIntentId,
          paymentIntent.amount
        );
        console.log(`✅ Payment split completed for booking ${bookingId}`);
      } catch (splitError: unknown) {
        // 分配エラーは警告に留め、決済確認自体は成功とする
        console.error('⚠️ Payment split failed (non-fatal):', splitError instanceof Error ? splitError.message : splitError);
      }
    } else {
      console.log(`[Confirm] Transaction already exists for PI ${paymentIntentId}, skipping split`);
    }

    // 予約レコードのステータスを更新（payment_status=PAID, status=CONFIRMED）
    await c.env.DB.prepare(`
      UPDATE bookings 
      SET payment_status = 'PAID',
          status = 'CONFIRMED',
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
      splitResult,
    });
  } catch (error: unknown) {
    console.error('❌ Payment confirmation failed:', error);
    return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

/**
 * GET /api/payment/status/:paymentIntentId
 * 決済ステータス取得
 */
payment.get('/status/:paymentIntentId', async (c) => {
  try {
    const paymentIntentId = c.req.param('paymentIntentId');

    if (!c.env.STRIPE_SECRET) {
      return c.json({ error: 'Stripe configuration missing' }, 500);
    }

    const stripe = new Stripe(c.env.STRIPE_SECRET, {
      apiVersion: '2026-02-25.clover',
    });

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return c.json({
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });
  } catch (error: unknown) {
    console.error('❌ Payment status retrieval failed:', error);
    return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

export default payment;
