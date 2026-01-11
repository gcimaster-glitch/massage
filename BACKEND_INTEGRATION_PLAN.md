# Phase B: バックエンドAPI統合 設計書

## 📊 概要

Phase Aでフロントエンドが完成した後、Honoバックエンドを統合し、実際のデータベースとAPIを接続します。

---

## 🏗️ アーキテクチャ設計

### 全体構造

```
┌─────────────────────────────────────────┐
│   Cloudflare Pages (Frontend)           │
│   - React SPA                           │
│   - Static Assets                       │
└───────────────┬─────────────────────────┘
                │
                │ API Calls (/api/*)
                ↓
┌─────────────────────────────────────────┐
│   Cloudflare Workers (Backend)          │
│   - Hono BFF (Backend for Frontend)    │
│   - API Routes                          │
└───────┬───────────────────┬─────────────┘
        │                   │
        ↓                   ↓
┌───────────────┐   ┌──────────────────┐
│ D1 Database   │   │ External APIs    │
│ (SQLite)      │   │ - Stripe         │
└───────────────┘   │ - Resend         │
                    │ - Gemini AI      │
                    └──────────────────┘
```

---

## 📁 ファイル構造

```
webapp/
├── src/
│   ├── index.tsx           # Hono メインアプリ
│   ├── routes/
│   │   ├── auth.ts         # 認証関連API
│   │   ├── bookings.ts     # 予約管理API
│   │   ├── payments.ts     # Stripe決済API
│   │   ├── notifications.ts # Resendメール API
│   │   └── storage.ts      # R2ストレージAPI
│   ├── middleware/
│   │   ├── auth.ts         # JWT認証ミドルウェア
│   │   └── cors.ts         # CORSミドルウェア
│   └── lib/
│       ├── db.ts           # D1ヘルパー関数
│       ├── stripe.ts       # Stripe SDK
│       ├── resend.ts       # Resend SDK
│       └── gemini.ts       # Gemini AI SDK
├── functions/              # Cloudflare Pages Functions
│   └── api/
│       └── [[route]].ts    # すべてのAPIリクエストをHonoにルーティング
└── wrangler.jsonc          # Cloudflare設定
```

---

## 🔧 実装ステップ

### Step 1: Honoアプリケーションの作成

**ファイル**: `src/index.tsx`

```typescript
import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  DB: D1Database
  STORAGE: R2Bucket
  STRIPE_SECRET: string
  RESEND_API_KEY: string
  GEMINI_API_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS設定
app.use('/api/*', cors({
  origin: '*', // 本番環境では適切なオリジンに変更
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// ヘルスチェック
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ルートのインポート
import authRoutes from './routes/auth'
import bookingRoutes from './routes/bookings'
import paymentRoutes from './routes/payments'

app.route('/api/auth', authRoutes)
app.route('/api/bookings', bookingRoutes)
app.route('/api/payments', paymentRoutes)

export default app
```

---

### Step 2: 認証API

**ファイル**: `src/routes/auth.ts`

```typescript
import { Hono } from 'hono'
import { sign, verify } from 'jose'

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
}

const auth = new Hono<{ Bindings: Bindings }>()

// ログイン
auth.post('/login', async (c) => {
  const { email, password } = await c.req.json()
  
  // ユーザー検証
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM users WHERE email = ?'
  ).bind(email).all()
  
  if (results.length === 0) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }
  
  const user = results[0]
  
  // JWTトークン生成
  const secret = new TextEncoder().encode(c.env.JWT_SECRET)
  const token = await new SignJWT({ userId: user.id, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret)
  
  return c.json({ token, user })
})

// 現在のユーザー情報取得
auth.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  const token = authHeader.replace('Bearer ', '')
  
  try {
    const secret = new TextEncoder().encode(c.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    
    const { results } = await c.env.DB.prepare(
      'SELECT id, email, name, role FROM users WHERE id = ?'
    ).bind(payload.userId).all()
    
    return c.json(results[0])
  } catch (e) {
    return c.json({ error: 'Invalid token' }, 401)
  }
})

export default auth
```

---

### Step 3: 予約管理API

**ファイル**: `src/routes/bookings.ts`

```typescript
import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
}

const bookings = new Hono<{ Bindings: Bindings }>()

// 予約一覧取得
bookings.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM bookings ORDER BY scheduled_start DESC LIMIT 50'
  ).all()
  
  return c.json(results)
})

// 予約作成
bookings.post('/', async (c) => {
  const booking = await c.req.json()
  
  const result = await c.env.DB.prepare(`
    INSERT INTO bookings (
      id, user_id, therapist_id, site_id, type, status,
      service_name, duration, scheduled_start, price, payment_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    booking.id,
    booking.userId,
    booking.therapistId,
    booking.siteId,
    booking.type,
    'PENDING',
    booking.serviceName,
    booking.duration,
    booking.scheduledStart,
    booking.price,
    'PENDING'
  ).run()
  
  return c.json({ success: true, id: booking.id })
})

// 予約詳細取得
bookings.get('/:id', async (c) => {
  const id = c.req.param('id')
  
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM bookings WHERE id = ?'
  ).bind(id).all()
  
  if (results.length === 0) {
    return c.json({ error: 'Not found' }, 404)
  }
  
  return c.json(results[0])
})

export default bookings
```

---

### Step 4: Stripe決済API

**ファイル**: `src/routes/payments.ts`

```typescript
import { Hono } from 'hono'

type Bindings = {
  STRIPE_SECRET: string
}

const payments = new Hono<{ Bindings: Bindings }>()

// Stripe Checkout Session作成
payments.post('/create-session', async (c) => {
  const { bookingId, amount } = await c.req.json()
  
  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${c.env.STRIPE_SECRET}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'mode': 'payment',
      'success_url': `${new URL(c.req.url).origin}/#/app/booking/success?id=${bookingId}`,
      'cancel_url': `${new URL(c.req.url).origin}/#/app/booking/new`,
      'line_items[0][price_data][currency]': 'jpy',
      'line_items[0][price_data][product_data][name]': 'Soothe Wellness Session',
      'line_items[0][price_data][unit_amount]': amount.toString(),
      'line_items[0][quantity]': '1',
    })
  })
  
  const session = await response.json()
  return c.json({ checkoutUrl: session.url })
})

export default payments
```

---

### Step 5: Cloudflare Pages Functions統合

**ファイル**: `functions/api/[[route]].ts`

```typescript
import app from '../../src/index'

export const onRequest: PagesFunction = async (context) => {
  return app.fetch(context.request, context.env, context)
}
```

---

## 🗄️ D1データベース設定

### wrangler.jsonc 更新

```jsonc
{
  "name": "soothe-care-cube-jp",
  "compatibility_date": "2024-01-01",
  "pages_build_output_dir": "./dist",
  
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "soothe-db-production",
      "database_id": "YOUR_DATABASE_ID"
    }
  ],
  
  "r2_buckets": [
    {
      "binding": "STORAGE",
      "bucket_name": "soothe-storage"
    }
  ]
}
```

### データベース作成コマンド

```bash
# D1データベース作成
npx wrangler d1 create soothe-db-production

# database_id を wrangler.jsonc にコピー

# マイグレーション適用
npx wrangler d1 migrations apply soothe-db-production --local  # ローカル
npx wrangler d1 migrations apply soothe-db-production          # 本番
```

---

## 🔐 環境変数設定

### ローカル開発 (.dev.vars)

```bash
STRIPE_SECRET=sk_test_your_test_key
RESEND_API_KEY=re_your_test_key
GEMINI_API_KEY=your_gemini_key
JWT_SECRET=your_random_secret_key_here
```

### 本番環境 (Secrets)

```bash
npx wrangler secret put STRIPE_SECRET
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put JWT_SECRET
```

---

## 🧪 テスト手順

### 1. ローカルでのテスト

```bash
# ビルド
npm run build

# 開発サーバー起動
npx wrangler pages dev dist --d1=soothe-db-production --local

# APIテスト
curl http://localhost:8788/api/health
curl http://localhost:8788/api/bookings
```

### 2. 本番環境でのテスト

```bash
# デプロイ
npm run deploy

# APIテスト
curl https://soothe-care-cube-jp.pages.dev/api/health
```

---

## 📋 実装チェックリスト

### バックエンド基盤
- [ ] Honoアプリケーション作成
- [ ] CORSミドルウェア設定
- [ ] JWT認証実装
- [ ] エラーハンドリング実装

### API実装
- [ ] 認証API (ログイン、ユーザー情報取得)
- [ ] 予約管理API (CRUD操作)
- [ ] Stripe決済API
- [ ] Resendメール送信API
- [ ] R2ストレージAPI

### データベース
- [ ] D1データベース作成
- [ ] マイグレーション適用
- [ ] シードデータ投入
- [ ] インデックス最適化

### 外部サービス
- [ ] Stripe API連携
- [ ] Resend API連携
- [ ] Gemini AI API連携

### デプロイ
- [ ] ローカルテスト成功
- [ ] 本番デプロイ成功
- [ ] APIエンドポイント動作確認

---

## 🚀 Phase B の目標

**フロントエンドとバックエンドが完全に統合され、実際のデータベースと外部APIを使用した、本番環境で動作するアプリケーションを完成させる。**

---

このドキュメントに沿って、Phase Bの実装を進めてください。