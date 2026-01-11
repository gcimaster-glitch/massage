# 🏥 Soothe x CARE CUBE Japan - プロジェクト引継書

> **「癒やしを、都市のインフラへ。」**  
> 日本版Soothe × CARE CUBEの統合ウェルネス・プラットフォーム

---

## 📋 目次

1. [プロジェクト概要](#プロジェクト概要)
2. [技術スタック](#技術スタック)
3. [ディレクトリ構造](#ディレクトリ構造)
4. [開発環境のセットアップ](#開発環境のセットアップ)
5. [Cloudflareデプロイ手順](#cloudflareデプロイ手順)
6. [データベース設計](#データベース設計)
7. [API仕様](#api仕様)
8. [サービス名変更手順](#サービス名変更手順)
9. [トラブルシューティング](#トラブルシューティング)

---

## 🎯 プロジェクト概要

### ビジネスモデル

**Tri-Win エコシステム（三者共栄）:**

- **セラピスト**: 65-75% の収益、店舗リスクゼロ
- **ホスト**: 20-30% の収益、遊休資産の自動収益化
- **プラットフォーム**: 10-15% の収益、インフラ・集客・安全保障

### 核心技術

1. **CARE CUBE (IaaS)**: 建築物ではなく「家具」として設置し、消防法を回避して都心部に高速展開
2. **AI Sentinel (Gemini Live API)**: 音声監視により「密室リスク」を解消、ハラスメント/事故をミリ秒単位で検知
3. **Multi-Agency**: 日本独自の「事務所」制度をシステム化、既存店舗やエージェントが参画可能

---

## 🛠 技術スタック

### フロントエンド
- **React 19** (最新バージョン)
- **Vite** (高速ビルド)
- **TailwindCSS** (スタイリング)
- **React Router v7** (ルーティング)
- **Lucide React** (アイコン)

### バックエンド
- **Hono** (軽量フレームワーク、Cloudflare Workers最適化)
- **Cloudflare Pages** (フロントエンドホスティング)
- **Cloudflare Workers** (エッジコンピューティング)
- **Cloudflare D1** (SQLiteベースのグローバル分散データベース)
- **Cloudflare R2** (オブジェクトストレージ - 画像/ファイル)

### 外部サービス統合
- **Stripe** (決済処理 + Stripe Connect KYC)
- **Resend** (トランザクションメール送信)
- **Google Gemini 2.5/3 API** (リアルタイムAI監視、画像解析)

---

## 📂 ディレクトリ構造

```
webapp/
├── src/
│   └── index.tsx          # Hono BFF (Backend for Frontend)
├── public/                # 静的アセット (画像、favicon等)
│   └── static/            # CDN配信される静的ファイル
├── pages/                 # ロール別ページ構成
│   ├── user/              # ユーザー向けページ
│   ├── therapist/         # セラピスト向けページ
│   ├── host/              # ホスト向けページ
│   ├── office/            # 事務所向けページ
│   ├── admin/             # 管理者向けページ
│   ├── auth/              # 認証関連ページ
│   ├── portal/            # 公開ポータル
│   └── shared/            # 共通ページ
├── components/            # 再利用可能なUIコンポーネント
├── services/              # API通信、システム状態管理
│   ├── api.ts             # Unified API Client
│   ├── aiService.ts       # Gemini API統合
│   ├── stripe.ts          # Stripe統合
│   └── systemState.ts     # グローバル状態管理
├── migrations/            # D1データベースマイグレーション
├── schema.sql             # D1データベーススキーマ定義
├── seed.sql               # 開発用テストデータ
├── constants.ts           # サービス名・定数管理
├── types.ts               # TypeScript型定義
├── wrangler.jsonc         # Cloudflare設定 (推奨: JSONCで記述)
├── vite.config.ts         # Viteビルド設定
├── package.json           # 依存関係とスクリプト
├── ecosystem.config.cjs   # PM2設定 (開発環境用)
└── README.md              # プロジェクトREADME
```

---

## 🚀 開発環境のセットアップ

### 前提条件
- Node.js 18+ インストール済み
- npm または yarn
- Cloudflareアカウント (無料プランでOK)

### 1. リポジトリをクローン
```bash
git clone https://github.com/gcimaster-glitch/massage.git
cd massage
```

### 2. 依存関係のインストール
```bash
npm install
```

### 3. 環境変数の設定

`.env.local` ファイルを作成:
```bash
# Gemini API (開発用のみ、本番環境はCloudflare Secretsで管理)
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

**注意**: 本番環境では絶対に`.env`をコミットしないでください！

### 4. D1データベースのセットアップ（ローカル）

```bash
# マイグレーションを適用
npm run db:migrate:local

# テストデータを投入
npm run db:seed
```

### 5. 開発サーバーの起動

#### 方法A: Vite開発サーバー（フロントエンドのみ）
```bash
npm run dev
```

#### 方法B: Wrangler開発サーバー（フロントエンド + BFF）
```bash
# ビルドしてから起動
npm run build
npm run dev:d1
```

#### 方法C: PM2でバックグラウンド起動（推奨 - サンドボックス環境）
```bash
# ビルド
npm run build

# PM2で起動
pm2 start ecosystem.config.cjs

# ログ確認
pm2 logs --nostream

# 停止
pm2 delete soothe-care-cube-jp
```

### 6. ブラウザで確認
```
http://localhost:3000
```

---

## ☁️ Cloudflareデプロイ手順

### 事前準備

1. **Cloudflareアカウントにログイン**
   ```bash
   npx wrangler login
   ```

2. **D1データベースの作成（本番環境）**
   ```bash
   # D1データベースを作成
   npx wrangler d1 create soothe-db-production
   
   # 出力された database_id を wrangler.jsonc にコピー
   ```

3. **R2バケットの作成**
   ```bash
   npx wrangler r2 bucket create soothe-storage
   ```

4. **環境変数（Secrets）の設定**
   ```bash
   # Stripe Secret Key
   npx wrangler secret put STRIPE_SECRET
   
   # Resend API Key
   npx wrangler secret put RESEND_API_KEY
   
   # Gemini API Key
   npx wrangler secret put GEMINI_API_KEY
   ```

### デプロイコマンド

#### 初回デプロイ
```bash
# 1. ビルド
npm run build

# 2. Cloudflare Pagesプロジェクトの作成
npx wrangler pages project create soothe-care-cube-jp \
  --production-branch main \
  --compatibility-date 2024-01-01

# 3. デプロイ
npm run deploy
```

#### 2回目以降のデプロイ
```bash
npm run deploy
```

### 本番データベースのマイグレーション
```bash
# スキーマをデプロイ
npm run db:migrate:prod

# 必要に応じて初期データを投入
npx wrangler d1 execute soothe-db-production --file=./seed.sql
```

### デプロイ後の確認
```
https://soothe-care-cube-jp.pages.dev
```

---

## 🗄️ データベース設計

### 主要テーブル

#### users (ユーザー管理)
全ロール（USER, THERAPIST, HOST, THERAPIST_OFFICE, ADMIN）を統合管理

| カラム | 型 | 説明 |
|--------|-----|------|
| id | TEXT | ユーザーID (PRIMARY KEY) |
| email | TEXT | メールアドレス (UNIQUE) |
| name | TEXT | 氏名 |
| role | TEXT | ロール (CHECK制約) |
| stripe_connect_account_id | TEXT | Stripe Connect アカウントID |
| kyc_status | TEXT | 本人確認ステータス |

#### bookings (予約管理)
セラピストとユーザーのマッチング、施術予約

| カラム | 型 | 説明 |
|--------|-----|------|
| id | TEXT | 予約ID (PRIMARY KEY) |
| user_id | TEXT | ユーザーID (FK) |
| therapist_id | TEXT | セラピストID (FK) |
| site_id | TEXT | 施術場所ID (FK) |
| status | TEXT | ステータス (PENDING/CONFIRMED/COMPLETED等) |
| payment_intent_id | TEXT | Stripe Payment Intent ID |

#### incidents (AI監視・緊急事案)
Gemini Live APIによる音声解析結果

| カラム | 型 | 説明 |
|--------|-----|------|
| id | TEXT | インシデントID (PRIMARY KEY) |
| booking_id | TEXT | 関連予約ID (FK) |
| severity | TEXT | 重要度 (LOW/MEDIUM/HIGH/CRITICAL) |
| ai_confidence | REAL | AI検知の信頼度 (0-1) |
| audio_url | TEXT | R2に保存された音声ファイルURL |

### ERD概要
```
users (1) ─── (N) bookings (N) ─── (1) sites
  │                    │
  │                    └─── (N) messages
  │                    └─── (N) incidents
  │
  └─── (1) therapist_profiles (N) ─── (1) therapist_offices
```

---

## 🌐 API仕様

### ベースURL
- **開発環境**: `http://localhost:3000/api`
- **本番環境**: `https://soothe-care-cube-jp.pages.dev/api`

### 認証
- JWT (JSON Web Token) をAuthorizationヘッダーに含める
- `Authorization: Bearer <token>`

### 主要エンドポイント

#### 認証 & KYC
```
GET  /api/auth/me                    # ログインユーザー情報取得
POST /api/auth/kyc-verify            # KYC本人確認 (画像アップロード)
```

#### 予約管理
```
GET    /api/bookings                 # 予約一覧取得
POST   /api/bookings                 # 新規予約作成
GET    /api/bookings/:id             # 予約詳細取得
PATCH  /api/bookings/:id/status      # 予約ステータス更新
GET    /api/bookings/:id/messages    # 予約に紐づくメッセージ取得
PATCH  /api/bookings/:id/location    # 位置情報更新
```

#### 決済 (Stripe)
```
POST /api/payments/create-session    # Stripe Checkout Session作成
GET  /api/payments/connect-onboarding # Stripe Connect オンボーディングURL取得
```

#### 通知 (Resend)
```
POST /api/notify/email               # メール送信
```

#### ストレージ (R2)
```
GET  /api/storage/upload-url         # アップロード用署名付きURL取得
```

#### セラピスト
```
GET /api/therapists                  # セラピスト一覧取得
GET /api/therapists/:id              # セラピスト詳細取得
```

---

## 🏷️ サービス名変更手順

**将来、サービス名を変更する場合の手順:**

### 1. constants.ts を更新
```typescript
// constants.ts
export const BRAND = {
  NAME: '新サービス名',              // ← ここを変更
  SUB_NAME: 'x 新サブ名',            // ← ここを変更
  FULL_NAME: '新サービス名 x 新サブ名', // ← ここを変更
  SLOGAN: '新しいキャッチフレーズ',    // ← ここを変更
  SUPPORT_EMAIL: 'support@新ドメイン.jp',
  INVOICE_PREFIX: 'T1234567890123'
};
```

### 2. wrangler.jsonc を更新
```jsonc
{
  "name": "new-service-name",  // ← ここを変更
  ...
}
```

### 3. package.json を更新
```json
{
  "name": "new-service-name",  // ← ここを変更
  ...
}
```

### 4. 全ページで自動反映
すべてのページコンポーネントは `BRAND.*` を参照しているため、**自動的に反映**されます。

### 5. 再デプロイ
```bash
npm run deploy:prod
```

**これだけで完了！** 他のファイルを変更する必要はありません。

---

## 🐛 トラブルシューティング

### ポート3000が既に使用されている
```bash
# ポートを開放
npm run clean-port

# または手動で
fuser -k 3000/tcp
```

### D1データベースに接続できない
```bash
# ローカルデータベースをリセット
npm run db:reset
```

### Cloudflareデプロイ時にエラー
```bash
# Wranglerを最新に更新
npm install wrangler@latest

# ログインし直し
npx wrangler login

# database_id が正しいか確認
npx wrangler d1 list
```

### フロントエンドのビルドエラー
```bash
# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install

# キャッシュをクリアしてビルド
npm run build
```

---

## 📧 サポート・お問い合わせ

**プロジェクト管理者**: てつじさん  
**GitHub Repository**: https://github.com/gcimaster-glitch/massage

---

## 📝 変更履歴

| 日付 | 変更内容 | 担当者 |
|------|----------|--------|
| 2025-01-11 | 初版作成、Cloudflare対応に全面刷新 | AI Assistant |

---

**© 2025 Soothe x CARE CUBE Japan. All Rights Reserved.**