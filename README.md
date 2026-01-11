# 🏥 Soothe x CARE CUBE Japan

> **「癒やしを、都市のインフラへ。」**  
> 日本版Soothe × CARE CUBEの統合ウェルネス・プラットフォーム

**🌐 開発サーバー**: https://3000-i5p7tkvsvj3ulos6jliw6-d0b9e1e2.sandbox.novita.ai  
**📦 GitHub**: https://github.com/gcimaster-glitch/massage

---

## 📊 現在の開発状況

### ✅ Phase A: フロントエンドUI改善 （進行中）
- [x] Reactアプリのビルド環境構築
- [x] ローカル開発環境の動作確認
- [x] Wrangler Pages Dev サーバー起動成功
- [ ] 事業戦略ページ (/strategy) の強化 **← 次はココ！**
- [ ] トップページ (/) の改善
- [ ] レスポンシブデザイン最適化

### ⏳ Phase B: バックエンドAPI統合 （準備中）
- [ ] Honoバックエンドの再統合
- [ ] D1データベース接続
- [ ] Stripe決済API統合
- [ ] Resendメール送信統合
- [ ] Gemini AI監視統合

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

# Wrangler開発サーバー起動
npm run dev:d1
```

### 6. ブラウザで確認
```
http://localhost:3000
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
│   └── index.tsx          # Hono BFF (Backend for Frontend)
├── pages/                 # ロール別ページ構成
│   ├── user/              # ユーザー向けページ
│   ├── therapist/         # セラピスト向けページ
│   ├── host/              # ホスト向けページ
│   ├── office/            # 事務所向けページ
│   ├── admin/             # 管理者向けページ
│   └── portal/            # 公開ポータル
├── components/            # 再利用可能なUIコンポーネント
├── services/              # API通信、システム状態管理
│   ├── api.ts             # Unified API Client
│   ├── aiService.ts       # Gemini API統合
│   └── stripe.ts          # Stripe統合
├── schema.sql             # D1データベーススキーマ
├── seed.sql               # 開発用テストデータ
├── constants.ts           # サービス名・定数管理
├── wrangler.jsonc         # Cloudflare設定
└── HANDOVER.md            # 詳細な引継書
```

---

## 🌐 主要URL

- **GitHub Repository**: https://github.com/gcimaster-glitch/massage
- **本番環境**: https://soothe-care-cube-jp.pages.dev (デプロイ後)
- **ドキュメント**: [HANDOVER.md](./HANDOVER.md) を参照

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