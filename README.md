# 🏥 Soothe x CARE CUBE Japan

> **「癒やしを、都市のインフラへ。」**  
> 日本版Soothe × CARE CUBEの統合ウェルネス・プラットフォーム

**🌐 開発サーバー**: https://3000-i5p7tkvsvj3ulos6jliw6-d0b9e1e2.sandbox.novita.ai  
**📦 GitHub**: https://github.com/gcimaster-glitch/massage

---

## 📊 現在の開発状況

### ✅ Phase A: フロントエンドUI改善 （**完了**）
- [x] Reactアプリのビルド環境構築
- [x] ローカル開発環境の動作確認
- [x] Wrangler Pages Dev サーバー起動成功
- [x] **事業戦略ページ (/strategy) の強化完了！**
  - Hero セクション「癒やしを、都市のインフラへ。」
  - CARE CUBE (IaaS) セクション
  - Safety Tech (AI Sentinel) セクション
  - Revenue Split セクション + 比較表
  - Multi-Agency セクション
- [x] レスポンシブデザイン最適化

### ✅ Phase B: バックエンドAPI統合 （**完了**）
- [x] **Honoバックエンドの完全統合完了！**
- [x] **全API実装完了** (認証、予約、決済、通知、ストレージ、セラピスト管理)
- [x] **モックデータフォールバック実装** - D1なしでも開発可能
- [x] D1データベース接続準備完了
- [x] Stripe決済API統合準備完了
- [x] Resendメール送信統合準備完了

### ✅ Phase C: Cloudflareデプロイ （**完了🎉**）
- [x] **Cloudflareリソース作成完了**
  - D1データベース: `soothe-db-production` ✅
  - R2バケット: `soothe-storage` ✅
- [x] **本番デプロイ成功！**
  - 🌐 本番URL: https://soothe-care-cube-jp.pages.dev
  - 🔧 API動作確認済み
  - 📊 D1データベースマイグレーション完了
  - 📦 テストデータ投入完了

---

## 🚀 プロジェクト概要

**Soothe x CARE CUBE Japan**は、セラピストとユーザーを安全につなぐ次世代ウェルネス・プラットフォームです。

### 主な特徴

1. **🏢 CARE CUBE (IaaS)**: 建築物ではなく「家具」として設置し、消防法を回避して都心部に高速展開
2. **🛡️ AI Sentinel**: Gemini Live APIによる音声監視で「密室リスク」を解消
3. **💰 Tri-Win エコシステム**: セラピスト・ホスト・プラットフォームの三者共栄モデル

---

## 🛠 技術スタック

### フロントエンド
- React 19 + Vite
- TailwindCSS
- React Router v7
- Lucide React

### バックエンド
- Hono (Cloudflare Workers最適化)
- Cloudflare Pages (ホスティング)
- Cloudflare D1 (SQLiteベースのグローバル分散DB)
- Cloudflare R2 (オブジェクトストレージ)

### 外部サービス
- **Stripe**: 決済処理 + Stripe Connect KYC
- **Resend**: トランザクションメール
- **Google Gemini 2.5/3**: リアルタイムAI監視、画像解析

---

## 📋 クイックスタート

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
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. D1データベースのセットアップ
```bash
# マイグレーションを適用
npm run db:migrate:local

# テストデータを投入
npm run db:seed
```

### 5. 開発サーバーの起動
```bash
# ビルド
npm run build

# PM2で開発サーバー起動（推奨）
pm2 start ecosystem.config.cjs

# またはWrangler直接起動
npm run dev

# D1データベースを使う場合
npm run dev:d1
```

### 6. ブラウザで確認
```
http://localhost:3000
http://localhost:3000/#/strategy  # 事業戦略ページ
http://localhost:3000/api/health  # API Health Check
```

---

## ☁️ Cloudflareデプロイ

### 事前準備

1. **Cloudflareにログイン**
   ```bash
   npx wrangler login
   ```

2. **D1データベースを作成**
   ```bash
   npx wrangler d1 create soothe-db-production
   # 出力された database_id を wrangler.jsonc にコピー
   ```

3. **R2バケットを作成**
   ```bash
   npx wrangler r2 bucket create soothe-storage
   ```

4. **環境変数（Secrets）を設定**
   ```bash
   npx wrangler secret put STRIPE_SECRET
   npx wrangler secret put RESEND_API_KEY
   npx wrangler secret put GEMINI_API_KEY
   ```

### デプロイ実行

```bash
# 初回デプロイ
npm run build
npx wrangler pages project create soothe-care-cube-jp \
  --production-branch main \
  --compatibility-date 2024-01-01

# デプロイ
npm run deploy

# 本番データベースのマイグレーション
npm run db:migrate:prod
```

---

## 📂 ディレクトリ構造

```
webapp/
├── src/
│   └── index.tsx          # Hono BFF (Backend for Frontend) - 全API実装済み
├── functions/
│   └── api/
│       └── [[route]].ts   # Cloudflare Pages Functions エントリーポイント
├── pages/                 # ロール別ページ構成
│   ├── user/              # ユーザー向けページ
│   ├── therapist/         # セラピスト向けページ
│   ├── host/              # ホスト向けページ
│   ├── office/            # 事務所向けページ
│   ├── admin/             # 管理者向けページ
│   └── portal/            # 公開ポータル
│       └── BusinessStrategy.tsx  # 事業戦略ページ（Phase A完成）
├── components/            # 再利用可能なUIコンポーネント
├── services/              # API通信、システム状態管理
│   ├── api.ts             # Unified API Client（Phase B完成）
│   ├── aiService.ts       # Gemini API統合
│   └── stripe.ts          # Stripe統合
├── migrations/            # D1データベースマイグレーション
│   └── 0001_initial_schema.sql
├── schema.sql             # D1データベーススキーマ
├── seed.sql               # 開発用テストデータ
├── constants.ts           # サービス名・定数管理
├── wrangler.jsonc         # Cloudflare設定
├── ecosystem.config.cjs   # PM2設定（開発環境）
├── HANDOVER.md            # 詳細な引継書
├── BACKEND_INTEGRATION_PLAN.md  # Phase B 設計書
└── GENSPARK_DEVELOPER_INSTRUCTIONS.md  # Phase A 指示書
```

---

## 🌐 主要URL

### 🚀 本番環境（公開中！）
- **🌐 本番サイト**: https://soothe-care-cube-jp.pages.dev
- **📝 Strategy ページ**: https://soothe-care-cube-jp.pages.dev/#/strategy
- **🔧 API Health Check**: https://soothe-care-cube-jp.pages.dev/api/health
- **👥 セラピストAPI**: https://soothe-care-cube-jp.pages.dev/api/therapists

### 🛠️ 開発環境
- **🚀 開発サーバー**: https://3000-i5p7tkvsvj3ulos6jliw6-d0b9e1e2.sandbox.novita.ai
- **📝 Strategy ページ**: https://3000-i5p7tkvsvj3ulos6jliw6-d0b9e1e2.sandbox.novita.ai/#/strategy
- **🔧 API Health Check**: https://3000-i5p7tkvsvj3ulos6jliw6-d0b9e1e2.sandbox.novita.ai/api/health

### 📚 ドキュメント・リソース
- **💾 GitHub Repository**: https://github.com/gcimaster-glitch/massage
- **📦 プロジェクトバックアップ**: https://www.genspark.ai/api/files/s/ay9HK9Eq
- **📚 HANDOVER.md**: [引継書](./HANDOVER.md)
- **📚 Phase A 指示書**: [GENSPARK_DEVELOPER_INSTRUCTIONS.md](./GENSPARK_DEVELOPER_INSTRUCTIONS.md)
- **📚 Phase B 設計書**: [BACKEND_INTEGRATION_PLAN.md](./BACKEND_INTEGRATION_PLAN.md)

---

## 🏷️ サービス名変更

将来サービス名を変更する場合は、以下の3ファイルのみ更新:

1. `constants.ts` の `BRAND` オブジェクト
2. `wrangler.jsonc` の `name` フィールド
3. `package.json` の `name` フィールド

詳細は [HANDOVER.md](./HANDOVER.md#サービス名変更手順) を参照してください。

---

## 🗄️ データベース管理

### ローカル開発
```bash
# マイグレーション適用
npm run db:migrate:local

# テストデータ投入
npm run db:seed

# データベースリセット
npm run db:reset

# コンソール接続
npm run db:console:local
```

### 本番環境
```bash
# マイグレーション適用
npm run db:migrate:prod

# コンソール接続
npm run db:console:prod
```

---

## 🔐 セキュリティ

- **環境変数**: `.env.local` は絶対にコミットしない（`.gitignore`に記載済み）
- **Secrets管理**: 本番環境は `wrangler secret put` で管理
- **KYC**: Stripe Identityで本人確認
- **AI監視**: Gemini Live APIで音声解析、密室リスクを解消

---

## 📧 お問い合わせ

**プロジェクト管理者**: てつじさん  
**GitHub**: https://github.com/gcimaster-glitch

---

## 📝 ライセンス

© 2025 Soothe x CARE CUBE Japan. All Rights Reserved.

---

## 📚 ドキュメント

詳細な開発ガイドは [HANDOVER.md](./HANDOVER.md) を参照してください。