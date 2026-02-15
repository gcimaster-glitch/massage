# 🏥 HOGUSY

> **「ほぐす、を、もっと身近に。」**  
> 日本版HOGUSY × CARE CUBEの統合ウェルネス・プラットフォーム

**🌐 本番環境**: https://hogusy.com  
**🔧 最新デプロイ**: https://c5986505.hogusy.pages.dev  
**📦 GitHub**: https://github.com/gcimaster-glitch/massage

---

## 🆕 最新アップデート (2026-02-13)

### 方針変更: セラピスト採用モデルの統一
- **HOGUSY直属セラピストの廃止** → すべてのセラピストはセラピストオフィス所属に統一
- **HOGUSY本部オフィス** を事務所として作成（DB登録済み、11名のセラピストを紐づけ）
- **募集ページ改修** → 個人セラピスト募集を廃止し、事務所経由の応募に一本化

### 管理画面「神モード」の実装
- **総管理者（ADMIN）** がすべてのデータにCRUDアクセス可能
- 管理メニュー「データ管理（全CRUD）」セクション追加:
  - ユーザー管理 / セラピスト管理 / オフィス管理 / 拠点ホスト管理 / 施設管理 / 予約管理
- オフィス管理: 一覧・作成・編集・削除・ステータス変更・セラピスト管理
- APIバックエンド: `/api/admin/offices`, `/api/admin/hosts`, `/api/admin/sites`, `/api/admin/bookings` CRUD対応

---

## 📊 現在の開発状況

### ✅ Phase N: 統一管理画面システム + ユーザーダッシュボード （**完了🎉**）
- [x] **統一ログインシステム**
  - ✅ UnifiedLogin コンポーネント作成（全ロール対応）
  - ✅ メール/パスワードログイン
  - ✅ Google OAuth ログイン
  - ✅ 統一されたデザイン・UX
  - ✅ ロール別アイコンと色分け
  
- [x] **管理者システム**
  - ✅ 本番運用可能な管理者アカウント（admin@hogusy.com / HogusyAdmin2026!）
  - ✅ 設定ファイルベースのメニュー管理（src/config/menu-config.ts）
  - ✅ ハードコード排除
  - ✅ 全メニューを一般的な用語に統一
  
- [x] **ユーザーダッシュボード**
  - ✅ UserHeader コンポーネント（ログアウト、サポート、TOPリンク）
  - ✅ UserDashboard コンポーネント（予約機能、告知スペース）
  - ✅ クイックアクション（マップ検索、施設一覧、予約履歴、アカウント設定）
  - ✅ 管理者からの告知表示スペース
  - ✅ 統計情報表示（予約数、ポイント、サブスク状態）

### ✅ Phase M: ログイン状態UI + ソーシャルアカウント連携 （**完了🎉**）
- [x] **ログイン状態確認API**
  - ✅ GET /api/auth/me エンドポイント
  - ✅ JWT トークン検証
  - ✅ ユーザー情報取得（ID、名前、メール、役割、アバター）
  - ✅ 連携済みソーシャルアカウント一覧取得

- [x] **認証コンテキスト（AuthContext）**
  - ✅ React Context API でグローバル認証状態管理
  - ✅ useAuth フックで全コンポーネントから利用可能
  - ✅ 自動ログイン（localStorage の auth_token）
  - ✅ ログイン状態の同期
  - ✅ ログアウト機能

- [x] **Google OAuth 完全統合**
  - ✅ Google Cloud Console 設定完了
  - ✅ リダイレクトURI 正常動作
  - ✅ トークン交換成功
  - ✅ ユーザー情報取得成功
  - ✅ データベース連携（users, social_accounts）
  - ✅ JWT発行とセッション管理
  - ✅ URLからトークン削除（セキュリティ向上）

- [x] **ソーシャルアカウント連携機能**
  - ✅ GET /api/auth/link/:provider（連携開始）
  - ✅ DELETE /api/auth/link/:provider（連携解除）
  - ✅ OAuth 状態管理テーブル拡張（user_id、action カラム追加）
  - ✅ 既存ユーザーによる後付けGoogle連携に対応
  - ✅ 連携済みプロバイダー一覧表示

- [x] **ソーシャルアカウント設定ページ**
  - ✅ /app/account/social ルート追加
  - ✅ Google / Yahoo / LINE / X / Facebook / Apple 連携UI
  - ✅ 連携状態の視覚的表示（チェックマーク/×）
  - ✅ 連携ボタン / 連携解除ボタン
  - ✅ ローディング状態とエラーハンドリング
  - ✅ セキュリティ説明

- [x] **マイアカウント画面統合**
  - ✅ ソーシャルアカウント連携メニュー追加
  - ✅ アイコン付きメニューボタン（Link2アイコン）
  - ✅ 既存メニューとの統合

- [x] **UTF-8対応とバグ修正**
  - ✅ UTF-8セーフなBase64エンコーディング（日本語ユーザー名対応）
  - ✅ データベースカラム名修正（session_token → token）
  - ✅ verifyJWT インポート追加

**デプロイURL**: https://3391c4dc.hogusy.pages.dev  
**ソーシャルアカウント設定**: https://3391c4dc.hogusy.pages.dev/app/account/social  
**検証済み**: ✅ Google登録完全動作、トークン発行、ユーザー作成、ログイン成功

### ✅ Phase L: 完全なユーザー登録システム （**完了🎉**）
- [x] **メール/パスワード登録API**
  - ✅ POST /api/auth/register エンドポイント
  - ✅ バリデーション（メール形式、パスワード長）
  - ✅ 重複メールアドレスチェック
  - ✅ パスワードハッシュ化（SHA-256）
  - ✅ ユーザーID自動生成

- [x] **メール認証システム**
  - ✅ email_verifications テーブル追加
  - ✅ 認証トークン生成（24時間有効）
  - ✅ GET /api/auth/verify-email エンドポイント
  - ✅ トークン検証と期限チェック
  - ✅ メール認証完了後のフラグ更新

- [x] **ログインAPI**
  - ✅ POST /api/auth/login エンドポイント
  - ✅ メール/パスワード認証
  - ✅ メール未認証ユーザーのブロック
  - ✅ セッション作成（30日間有効）
  - ✅ JWT トークン発行

- [x] **フロントエンド統合**
  - ✅ SignupUser コンポーネント更新
  - ✅ リアルタイムバリデーション
  - ✅ エラーハンドリング
  - ✅ ローディング状態表示
  - ✅ 成功画面表示
  - ✅ Google OAuth との統合

**デプロイURL**: https://0883db8f.hogusy.pages.dev
**登録ページ**: https://0883db8f.hogusy.pages.dev/auth/signup-user
**検証済み**: 新規登録、メール認証、ログイン、エラーハンドリング

### ✅ Phase K: 高度なフィルター機能 + お気に入り + 予約最適化 （**完了🎉**）
- [x] **距離範囲の調整機能（1km/3km/5km/全て）**
  - ✅ ワンクリックで距離範囲を切り替え
  - ✅ 現在の選択が青色でハイライト
  - ✅ リアルタイムで施設リストが更新
  - ✅ UIボタン: [1km] [3km] [5km] [全て表示]

- [x] **営業時間フィルター（今すぐ予約可能のみ）**
  - ✅ 「今すぐ予約可能」スイッチを追加
  - ✅ ONにすると営業中の施設のみ表示
  - ✅ 施設のopening_time/closing_timeを使用
  - ✅ 現在時刻と比較して営業中かどうかを判定

- [x] **施設タイプフィルター（複数選択可能）**
  - ✅ CARE CUBE / ホテル / オフィスビル / 駅ナカ / その他
  - ✅ チェックボックス形式で複数選択
  - ✅ 選択したタイプの施設のみ表示

- [x] **お気に入り機能（施設をブックマーク）**
  - ✅ 各施設カードにハートアイコン追加
  - ✅ クリックでお気に入りに追加/削除
  - ✅ localStorageに保存（永続化）
  - ✅ 「お気に入りのみ」フィルターで絞り込み
  - ✅ ログインしていなくても使用可能

- [x] **予約3ステップフローの最適化**
  - ✅ 既存のQuickBookingPanelを活用
  - ✅ ステップ1: 施設選択（マップまたはリストから）
  - ✅ ステップ2: セラピスト選択（在籍セラピスト一覧から）
  - ✅ ステップ3: 日時選択 → 予約完了
  - ✅ スムーズな遷移とリアルタイムバリデーション

- [x] **フローティングリスト制御機能（NEW!）**
  - ✅ 最小化ボタン: リストを小さくして地図を広く表示
  - ✅ 閉じるボタン: リストを完全に非表示
  - ✅ 再表示ボタン: 閉じた後も簡単に再表示可能
  - ✅ スムーズなアニメーション

**フィルターUI構成**:
```
[フィルター 🎯]
├─ 距離: [1km] [3km] [5km] [全て]
├─ 営業時間: [□ 今すぐ予約可能]
├─ 施設タイプ: [☑ CARE CUBE] [☑ ホテル] [□ オフィス] [□ 駅ナカ] [□ その他]
└─ お気に入り: [♡ お気に入りのみ]
```

**デプロイURL**: https://dc0ed0a0.hogusy.pages.dev
**検証済み**: 全フィルター動作、お気に入り保存、マップ連動、予約フロー、最小化/閉じる機能

### ✅ Phase J: MAP近隣施設フローティングリスト （**完了🎉**）
- [x] **3km以内の施設リスト表示**
  - ✅ 現在地から3km以内の施設を自動検出
  - ✅ 距離順にソート表示
  - ✅ Haversine formulaで正確な距離計算
  - ✅ リアルタイム距離表示（0.0km形式）

- [x] **フローティングUI実装**
  - ✅ マップ右側に固定配置
  - ✅ スクロール可能なカードリスト
  - ✅ 各施設カードに距離・住所・アメニティ表示
  - ✅ 営業状態表示（営業中/終了）
  - ✅ クリックでマップ連動（パン＆ズーム）

- [x] **ダイレクト予約機能**
  - ✅ 各カードから「今すぐ予約」ボタン
  - ✅ QuickBookingPanel連携
  - ✅ レスポンシブ対応（モバイル・デスクトップ）

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
http://localhost:3000/strategy  # 事業戦略ページ
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

## 🔐 管理者アカウント情報

### **本番運用用 総管理者アカウント**

**重要**: このアカウントはシステム全体の管理権限を持ちます。第三者に共有しないでください。

#### **ログイン情報**
- **メールアドレス**: `admin@hogusy.com`
- **パスワード**: `HogusyAdmin2026!`
- **ロール**: `ADMIN`（総管理者）

#### **ログインURL**
```
https://hogusy.com/auth/login/admin
```

#### **管理画面アクセス**
- **ダッシュボード**: https://hogusy.com/admin
- **ユーザー管理**: https://hogusy.com/admin/users
- **施設管理**: https://hogusy.com/admin/site-management
- **売上管理**: https://hogusy.com/admin/payouts
- **アナリティクス**: https://hogusy.com/admin/analytics

#### **ログイン方法**
1. **メール/パスワード**（推奨）
   - メールアドレス: `admin@hogusy.com`
   - パスワード: `HogusyAdmin2026!`

2. **Google OAuth**
   - 管理者権限のGoogleアカウントでログイン可能

3. **開発用デモログイン**
   - ローカル開発時のみ使用
   - 本番環境では使用不可

#### **セキュリティ推奨事項**
- ⚠️ パスワードは定期的に変更してください
- ⚠️ 二要素認証（2FA）の追加を推奨
- ⚠️ ログイン履歴を定期的に確認
- ⚠️ 不要になった管理者アカウントは削除

#### **パスワード変更方法**
```bash
# 新しいパスワードのハッシュを生成
node -e "
const crypto = require('crypto');
const password = '新しいパスワード';
const hash = crypto.createHash('sha256').update(password).digest('hex');
console.log('Password Hash:', hash);
"

# データベースを更新
npx wrangler d1 execute hogusy-db-production --remote --command="
UPDATE users 
SET password_hash = '生成されたハッシュ' 
WHERE email = 'admin@hogusy.com';
"
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
- **📝 事業戦略ページ**: https://hogusy.pages.dev/strategy
- **🔧 API Health Check**: https://hogusy.pages.dev/api/health
- **👥 セラピストAPI**: https://hogusy.pages.dev/api/therapists
- **🏢 施設API**: https://hogusy.pages.dev/api/sites
- **📜 特定商取引法**: https://hogusy.pages.dev/commercial-transaction
- **⚖️ 利用規約**: https://hogusy.pages.dev/legal

### 🛠️ 開発環境
- **🚀 開発サーバー**: https://3000-i5p7tkvsvj3ulos6jliw6-d0b9e1e2.sandbox.novita.ai
- **📝 Strategy ページ**: https://3000-i5p7tkvsvj3ulos6jliw6-d0b9e1e2.sandbox.novita.ai/strategy
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