import { createRemoteJWKSet, jwtVerify } from 'jose';

interface D1Database {
  prepare(query: string): {
    all<T = any>(): Promise<{ results: T[] }>;
    bind(...args: any[]): any;
  };
}

interface R2Bucket {
  put(key: string, value: any, options?: any): Promise<any>;
}

export interface Env {
  DB: D1Database;
  STORAGE: R2Bucket;
  STRIPE_SECRET: string;
  RESEND_API_KEY: string;
  JWKS_URI: string;
  API_KEY: string; // Gemini API Key from Worker Secret
}

const ALLOWED_ORIGINS = ['https://ma-x.tech', 'https://www.ma-x.tech'];

function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin') ?? '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin',
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const corsHeaders = getCorsHeaders(request);
    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // 1. Stripe Checkout
      if (path === '/api/payments/create-session' && request.method === 'POST') {
        const { bookingId, amount } = await request.json() as any;
        const session = await fetch('https://api.stripe.com/v1/checkout/sessions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.STRIPE_SECRET}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            'mode': 'payment',
            'success_url': `${url.origin}/#/app/booking/success?id=${bookingId}`,
            'cancel_url': `${url.origin}/#/app/booking/new`,
            'line_items[0][price_data][currency]': 'jpy',
            'line_items[0][price_data][product_data][name]': 'Soothe Wellness Session',
            'line_items[0][price_data][unit_amount]': amount.toString(),
            'line_items[0][quantity]': '1',
          })
        }).then(r => r.json()) as any;

        return new Response(JSON.stringify({ checkoutUrl: session.url }), { headers: corsHeaders });
      }

      // 2. D1 Bookings
      if (path === '/api/bookings' && request.method === 'GET') {
        const { results } = await env.DB.prepare("SELECT * FROM bookings ORDER BY scheduled_start DESC").all();
        return new Response(JSON.stringify(results), { headers: corsHeaders });
      }

      return new Response('API Endpoint Not Found', { status: 404, headers: corsHeaders });

    } catch (e: any) {
      console.error('[worker] Unhandled error:', e);
      return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: corsHeaders });
    }
  }
};
