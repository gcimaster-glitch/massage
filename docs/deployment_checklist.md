# HOGUSY 本番稼働準備チェックリスト

**最終更新日:** 2026年03月16日
**作成者:** Manus AI

## 概要

このドキュメントは、HOGUSYプラットフォームを本番環境へデプロイする際の最終確認事項と手順をまとめたものです。デプロイ作業者は、以下の項目をすべて確認し、チェックを完了した上でデプロイを実行してください。

---

## 1. 環境変数 (Environment Variables)

Cloudflare Pagesのプロジェクト設定で、以下の環境変数が本番環境（Production）に正しく設定されていることを確認します。

| 環境変数名 | 説明 | 設定値の例 | チェック | 
| :--- | :--- | :--- | :--- | 
| `JWT_SECRET` | JWT署名用の秘密鍵。32文字以上のランダムな文字列 | `openssl rand -hex 32`で生成 | ☐ | 
| `RESEND_API_KEY` | メール送信用APIキー（Resend） | `re_xxxxxxxxxxxx` | ☐ | 
| `STRIPE_API_KEY` | Stripe APIキー（Secret Key） | `sk_live_xxxxxxxxxxxx` | ☐ | 
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook署名検証用シークレット | `whsec_xxxxxxxxxxxx` | ☐ | 

**テスト用環境変数（E2Eテストでのみ使用）**

| 環境変数名 | 説明 | 設定値の例 | チェック | 
| :--- | :--- | :--- | :--- | 
| `TEST_USER_EMAIL` | 一般ユーザーのテストアカウント | `test-user@hogusy-test.com` | ☐ | 
| `TEST_USER_PASSWORD` | 一般ユーザーのパスワード | `TestUser@2024!` | ☐ | 
| `TEST_THERAPIST_EMAIL` | セラピストのテストアカウント | `test-therapist@hogusy-test.com` | ☐ | 
| `TEST_THERAPIST_PASSWORD` | セラピストのパスワード | `TestTherapist@2024!` | ☐ | 
| `TEST_HOST_EMAIL` | 拠点ホストのテストアカウント | `test-host@hogusy-test.com` | ☐ | 
| `TEST_HOST_PASSWORD` | 拠点ホストのパスワード | `TestHost@2024!` | ☐ | 
| `TEST_OFFICE_EMAIL` | セラピストオフィスのテストアカウント | `test-office@hogusy-test.com` | ☐ | 
| `TEST_OFFICE_PASSWORD` | セラピストオフィスのパスワード | `TestOffice@2024!` | ☐ | 
| `TEST_ADMIN_EMAIL` | 管理者のテストアカウント | `admin@hogusy-test.com` | ☐ | 
| `TEST_ADMIN_PASSWORD` | 管理者のパスワード | `TestAdmin@2024!` | ☐ | 
| `TEST_AFFILIATE_EMAIL` | アフィリエイターのテストアカウント | `test-affiliate@hogusy-test.com` | ☐ | 
| `TEST_AFFILIATE_PASSWORD` | アフィリエイターのパスワード | `TestAffiliate@2024!` | ☐ | 

**注意:** Cloudflare D1とR2のバインディングは `wrangler.toml` で設定されており、環境変数として手動で設定する必要はありません。

---

## 2. Cloudflare 設定 (Cloudflare Settings)

| 項目 | 設定内容 | 確認事項 | チェック | 
| :--- | :--- | :--- | :--- | 
| **DNS** | `hogusy.com` | CNAMEレコードがCloudflare Pagesの `*.pages.dev` を向いているか | ☐ | 
| **Pages** | プロジェクト: `hogusy` | 本番ブランチが `main` に設定されているか | ☐ | 
| | | カスタムドメイン `hogusy.com` が設定され、有効になっているか | ☐ | 
| | | ビルドコマンドが `npm run build` に設定されているか | ☐ | 
| **D1 Database** | `hogusy-db-production` | データベースが存在し、最新のマイグレーションが適用済みか | ☐ | 
| **R2 Storage** | `hogusy-storage` | KYC書類保存用のバケットが存在するか | ☐ | 

---

## 3. Stripe 設定 (Stripe Settings)

| 項目 | 設定内容 | 確認事項 | チェック | 
| :--- | :--- | :--- | :--- | 
| **Webhook** | エンドポイントURL | `https://hogusy.com/api/stripe/webhook` が登録されているか | ☐ | 
| | リッスンイベント | `checkout.session.completed` が有効になっているか | ☐ | 
| | 署名シークレット | Webhook署名シークレットが `STRIPE_WEBHOOK_SECRET` 環境変数に設定されているか | ☐ | 
| **APIキー** | 本番用キー | 本番用の公開可能キー（`pk_live_...`）とシークレットキー（`sk_live_...`）が使用されているか | ☐ | 

---

## 4. デプロイ前最終確認 (Pre-deployment Final Checks)

| 確認事項 | コマンド / 手順 | 期待される結果 | チェック | 
| :--- | :--- | :--- | :--- | 
| **開発用ページの削除** | `public/dev-login.html` ファイルが存在しないことを確認 | ファイルが存在しない | ☐ | 
| **E2Eテストの実行** | `pnpm test:e2e:prod` | すべてのテストが成功すること | ☐ | 
| **READMEの更新** | `README.md` を確認 | プロジェクトの概要、技術スタック、セットアップ手順が最新であること | ☐ | 
| **不要コードの削除** | コードレビュー | 不要な `console.log` やデバッグ用のコードが残っていないこと | ☐ | 

---

## 5. デプロイ手順 (Deployment Steps)

1.  **mainブランチへのマージ**
    ```bash
    # developブランチ（または最新の開発ブランチ）からmainブランチへマージ
    git checkout main
    git pull origin main
    git merge develop
    ```

2.  **コンフリクトの解決**
    コンフリクトが発生した場合は、慎重に解決し、再度テストを実行します。

3.  **mainブランチへのプッシュ**
    ```bash
    # mainブランチをリモートリポジトリにプッシュ
    git push origin main
    ```

4.  **Cloudflareでの自動デプロイ確認**
    - [Cloudflare Pagesのダッシュボード](https://dash.cloudflare.com/?to=/:account/pages)にアクセスします。
    - `hogusy` プロジェクトのデプロイが自動的に開始されることを確認します。
    - デプロイが正常に完了するまで待ちます。

---

## 6. デプロイ後確認 (Post-deployment Checks)

| 確認事項 | 手順 | 期待される結果 | チェック | 
| :--- | :--- | :--- | :--- | 
| **本番サイト表示** | ブラウザで https://hogusy.com にアクセス | サイトが正常に表示され、エラーが発生しないこと | ☐ | 
| **主要機能の動作確認** | ログイン、ログアウト、セラピスト検索、予約フローの基本操作を手動でテスト | すべての機能が期待通りに動作すること | ☐ | 
| **Cloudflareログ監視** | Cloudflareダッシュボードのログを確認 | デプロイ後に新たなエラーログが発生していないか監視 | ☐ | 
| **Stripe Webhook監視** | StripeダッシュボードのWebhookログを確認 | テスト決済時にWebhookが正常に受信され、200番台のステータスを返していること | ☐ | 
