# 🏥 HOGUSY

> **「ほぐす、を、もっと身近に。」**  
> 日本版HOGUSY × CARE CUBEの統合ウェルネス・プラットフォーム

**🌐 本番環境**: https://hogusy.pages.dev  
**🔧 最新デプロイ**: https://ba8dfe9b.hogusy.pages.dev  
**📦 GitHub**: https://github.com/gcimaster-glitch/massage

---

## 📊 現在の開発状況

### ✅ Phase I: TOPページ強化 & 地図予約統合 （**完了🎉**）
- [x] **人気のセラピスト表示（実データベース連携）**
  - ✅ APIから評価順でトップ4を取得
  - ✅ セラピスト画像・評価・レビュー数表示
  - ✅ 各カードから直接予約ボタン
  - ✅ クリックで詳細ページへ遷移
  - ✅ ローディング状態表示

- [x] **地図から探すセクション**
  - ✅ 魅力的なグラデーション背景デザイン
  - ✅ 3つの主要機能説明（リアルタイム表示・セラピスト選択・その場で予約）
  - ✅ マップページへの大きなCTA
  - ✅ レスポンシブ対応

- [x] **MAPページからの予約機能（既存実装確認）**
  - ✅ QuickBookingPanel統合済み
  - ✅ 施設選択 → セラピスト選択 → 予約確認の3ステップフロー
  - ✅ リアルタイム空き状況確認
  - ✅ モバイル・デスクトップ対応

### ✅ Phase H: ヒーロー動画背景 & TOPページ改善 （**完了🎉**）
- [x] **動画背景ヒーローバナー**
  - ✅ プロフェッショナルな施術動画を背景に使用
  - ✅ ffmpegで67MB → 3MB（95%削減）に最適化
  - ✅ 自動再生・ループ・ミュート対応
  - ✅ フォールバック画像設定

- [x] **改善されたキャッチコピー**
  - ✅ メインコピー: 「ほぐす、を、もっと身近に。」
  - ✅ サブコピー: 「街のあらゆる場所に、プロの施術空間。探して、選んで、すぐに整う。」
  - ✅ よりユーザー視点で親しみやすい表現

- [x] **3ステップ利用ガイドセクション**
  - ✅ 視覚的な手順説明（探す → 予約する → 整う）
  - ✅ 各ステップのアイコンとカラー分け
  - ✅ ユーザーの行動導線を明確化

### ✅ Phase G: パフォーマンス最適化 （**完了🎉**）
- [x] **コード分割（Code Splitting）実装**
  - ✅ manualChunksでバンドルを分割
  - ✅ メインバンドル: 1,213KB → 593KB（51%削減）
  - ✅ gzip圧縮後: 280KB → 172KB（40%削減）
  - ✅ Admin/Therapist/Host/Office別チャンク化

- [x] **Google Maps非同期読み込み最適化**
  - ✅ preconnect追加で高速化
  - ✅ loading=async パラメータ追加
  - ✅ 重複読み込み問題解決

### ✅ Phase F: 3ステップクイック予約フロー実装 （**完了🎉**）
- [x] **QuickBookingPanel コンポーネント**
  - ✅ 汎用的なクイック予約パネル（スライドイン）
  - ✅ 最短3ステップで予約完了（施設選択 → 日時選択 → 確認）
  - ✅ レスポンシブ対応（モバイル・タブレット・PC）
  - ✅ リアルタイムバリデーション
  - ✅ スムーズなアニメーション

- [x] **SiteMapSearch 改修**
  - ✅ 施設選択時に「今すぐ予約」ボタン追加
  - ✅ クイック予約パネルとの統合
  - ✅ セラピスト一覧モーダルから直接予約可能
  - ✅ 詳細ページへの遷移は「詳細を見る」で別表示

### ✅ Phase E: セラピスト詳細・施設予約実装 （**完了🎉**）
- [x] **セラピスト詳細ページ (/app/therapist/:therapistId)**
  - ✅ APIデータ連携（実データベースから取得）
  - ✅ プロフィール・評価・レビュー表示
  - ✅ 予約可能状況の動的表示
  - ✅ 空き状況カレンダー（7日間）
  - ✅ メニュー・料金表示
  - ✅ 今すぐ予約ボタン
  - ✅ レスポンシブ対応

- [x] **施設詳細ページ (/app/site/:siteId)**
  - ✅ APIデータ連携（実データベースから取得）
  - ✅ 施設情報・アメニティ表示
  - ✅ セラピスト選択モーダル
  - ✅ 自動割当オプション（推奨）
  - ✅ セラピスト一覧表示
  - ✅ 予約可能状況の視覚化
  - ✅ レスポンシブ対応

- [x] **法的必須ページ**
  - ✅ 特定商取引法に基づく表記 (/commercial-transaction)
  - ✅ 利用規約・プライバシーポリシー (/legal)
  - ✅ フッターにリンク追加
  - ✅ レスポンシブ対応（スマホ・タブレット・PC）

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
  - D1データベース: `hogusy-db-production` ✅
  - R2バケット: `hogusy-storage` ✅
- [x] **本番デプロイ成功！**
  - 🌐 本番URL: https://hogusy.pages.dev
  - 🔧 API動作確認済み
  - 📊 D1データベースマイグレーション完了
  - 📦 テストデータ投入完了

### ✅ Phase D: ソーシャルログイン実装 （**完了🎉**）
- [x] **OAuth 2.0統合完了**
  - ✅ Google OAuth 2.0
  - ✅ Yahoo! JAPAN ID連携
  - ✅ X (Twitter) OAuth 2.0
  - ✅ Facebook Login
  - ✅ LINE Login
  - ✅ Apple Sign In
- [x] **データベーススキーマ拡張**
  - ✅ social_accounts テーブル
  - ✅ auth_sessions テーブル
  - ✅ oauth_states テーブル（CSRF保護）
- [x] **セキュリティ機能**
  - ✅ CSRF保護（state parameter）
  - ✅ セッション管理
  - ✅ JWT認証
- [x] **フロントエンドUI更新**
  - ✅ ソーシャルログインボタン
  - ✅ メール/パスワードログイン（準備中）
  - ✅ OAuth Callback処理

---

## 🚀 プロジェクト概要

**HOGUSY**は、セラピストとユーザーを安全につなぐ次世代ウェルネス・プラットフォームです。

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

### ソーシャル認証
- **Google OAuth 2.0**: Googleアカウントでログイン
- **Yahoo! JAPAN ID連携**: Yahoo! JAPANアカウントでログイン
- **X (Twitter) OAuth 2.0**: 𝕏アカウントでログイン
- **Facebook Login**: Facebookアカウントでログイン
- **LINE Login**: LINEアカウントでログイン
- **Apple Sign In**: Apple IDでログイン

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
   npx wrangler d1 create hogusy-db-production
   # 出力された database_id を wrangler.jsonc にコピー
   ```

3. **R2バケットを作成**
   ```bash
   npx wrangler r2 bucket create hogusy-storage
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
npx wrangler pages project create hogusy \
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
- **🌐 本番サイト**: https://hogusy.pages.dev
- **🆕 最新デプロイ**: https://827613c2.hogusy.pages.dev
- **📝 事業戦略ページ**: https://hogusy.pages.dev/#/strategy
- **🔧 API Health Check**: https://hogusy.pages.dev/api/health
- **👥 セラピストAPI**: https://hogusy.pages.dev/api/therapists
- **🏢 施設API**: https://hogusy.pages.dev/api/sites
- **📜 特定商取引法**: https://hogusy.pages.dev/commercial-transaction
- **⚖️ 利用規約**: https://hogusy.pages.dev/legal

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

© 2025 HOGUSY. All Rights Reserved.

---

## 📚 ドキュメント

詳細な開発ガイドは [HANDOVER.md](./HANDOVER.md) を参照してください。