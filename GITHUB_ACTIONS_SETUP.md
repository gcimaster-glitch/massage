# GitHub Actions 自動デプロイ設定ガイド

## 🎯 概要

このガイドに従って、GitHub Actionsによる自動デプロイを設定します。
設定後は、`git push` するだけで自動的にビルド＆デプロイされます。

## ✅ メリット

- **環境変数は一切触らない** - 既存のCloudflare設定をそのまま使用
- **自動ビルド** - GitHub Actionsの強力なビルド環境
- **自動デプロイ** - ビルド成功後、自動的にCloudflare Pagesへデプロイ
- **リスクゼロ** - 既存の設定に影響なし

## 📋 必要な情報

以下の2つの情報が必要です：

### 1. CLOUDFLARE_API_TOKEN

#### 取得手順：

1. **Cloudflare Dashboard にアクセス**
   - URL: https://dash.cloudflare.com/

2. **プロフィール → API Tokens**
   - 右上のプロフィールアイコンをクリック
   - 「My Profile」を選択
   - 左メニューから「API Tokens」を選択

3. **Create Token をクリック**
   - 「Create Custom Token」を選択

4. **トークン設定**
   ```
   Token name: GitHub Actions Deploy
   
   Permissions:
   - Account | Cloudflare Pages | Edit
   
   Account Resources:
   - Include | <Your Account>
   
   Zone Resources:
   - (設定不要)
   
   Client IP Address Filtering:
   - (設定不要 / すべてのIPから可能)
   
   TTL:
   - (デフォルトでOK)
   ```

5. **Continue to summary → Create Token**

6. **トークンをコピー**
   - 表示されたトークンをコピー（一度しか表示されません）
   - 形式：`xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 2. CLOUDFLARE_ACCOUNT_ID

#### 取得手順：

1. **Cloudflare Dashboard にアクセス**
   - URL: https://dash.cloudflare.com/

2. **Workers & Pages を選択**

3. **右側のサイドバーを確認**
   - 「Account ID」が表示されています
   - または、URLから取得：
     `https://dash.cloudflare.com/【このID】/workers-and-pages`

4. **IDをコピー**
   - 形式：32文字の英数字

## 🔧 GitHub Secrets 設定

### 手順：

1. **GitHubリポジトリにアクセス**
   - URL: https://github.com/gcimaster-glitch/massage

2. **Settings タブをクリック**

3. **左メニューから「Secrets and variables」→「Actions」を選択**

4. **「New repository secret」をクリック**

5. **1つ目のシークレットを追加**
   ```
   Name: CLOUDFLARE_API_TOKEN
   Secret: (先ほどコピーしたAPIトークン)
   ```
   - 「Add secret」をクリック

6. **2つ目のシークレットを追加**
   ```
   Name: CLOUDFLARE_ACCOUNT_ID
   Secret: (先ほどコピーしたAccount ID)
   ```
   - 「Add secret」をクリック

## ✅ 設定完了確認

### 確認手順：

1. **GitHub リポジトリの Secrets 画面で確認**
   - `CLOUDFLARE_API_TOKEN` ✓
   - `CLOUDFLARE_ACCOUNT_ID` ✓
   - 両方が表示されていればOK

2. **ワークフローファイルが存在することを確認**
   - リポジトリの `.github/workflows/deploy.yml` が存在

## 🚀 使い方

### 初回デプロイ

設定完了後、以下のコマンドでワークフローファイルをプッシュ：

```bash
cd /home/user/webapp
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Actions auto-deploy workflow"
git push origin main
```

### 自動的に実行されること：

1. GitHub Actions が起動
2. Node.js 18 環境をセットアップ
3. 依存関係をインストール（`npm ci`）
4. ビルド実行（`npm run build`）
5. functions ディレクトリを dist にコピー
6. Cloudflare Pages にデプロイ（`wrangler pages deploy`）

### 確認方法：

1. **GitHub リポジトリの「Actions」タブ**
   - ワークフローの実行状況を確認
   - ビルドログをリアルタイムで確認可能

2. **Cloudflare Dashboard**
   - Workers & Pages → hogusy → Deployments
   - 新しいデプロイが表示される

## 📊 ワークフロー実行時間

- **依存関係インストール**: 1-2分
- **ビルド**: 2-3分
- **デプロイ**: 1-2分
- **合計**: 約5-7分

## 🎯 今後の使い方

### 通常の開発フロー：

```bash
# コードを編集
vim pages/therapist/TravelSettings.tsx

# コミット
git add .
git commit -m "feat: improve travel settings layout"

# プッシュ（自動的にデプロイされる！）
git push origin main
```

### デプロイ状況の確認：

1. GitHubリポジトリの「Actions」タブ
2. 最新のワークフロー実行をクリック
3. リアルタイムでログを確認

### デプロイ完了の確認：

- 緑色のチェックマーク ✓ → デプロイ成功
- 本番URL: https://hogusy.com
- Pages URL: https://hogusy.pages.dev

## 🛡️ セキュリティ

### GitHub Secrets の利点：

- **暗号化保存**: シークレットは暗号化されて保存
- **ログに表示されない**: ワークフローログにも表示されない
- **リポジトリ内で使用可能**: `.github/workflows/` 内でのみ参照可能

### APIトークンの権限：

- Cloudflare Pages の Edit 権限のみ
- 他のCloudflareリソースへのアクセスなし
- 必要最小限の権限設定

## ❌ トラブルシューティング

### ビルドが失敗する場合：

1. **GitHub Actions のログを確認**
   - Actions タブ → 失敗したワークフロー → ログを確認

2. **よくあるエラー**
   - `npm ci` エラー → package-lock.json の確認
   - ビルドエラー → ローカルで `npm run build` を実行して確認
   - デプロイエラー → APIトークンやAccount IDの確認

3. **APIトークンのエラー**
   - エラーメッセージ: `Authentication error`
   - 対処: GitHub Secrets の `CLOUDFLARE_API_TOKEN` を再確認

4. **Account IDのエラー**
   - エラーメッセージ: `Account not found`
   - 対処: GitHub Secrets の `CLOUDFLARE_ACCOUNT_ID` を再確認

### デバッグ方法：

```bash
# ローカルでビルドテスト
npm run build

# functionsコピーのテスト
cp -r functions dist/

# dist内容の確認
ls -la dist/
```

## 📚 参考リンク

- **GitHub Actions ドキュメント**: https://docs.github.com/actions
- **Cloudflare Wrangler Action**: https://github.com/cloudflare/wrangler-action
- **Cloudflare Pages ドキュメント**: https://developers.cloudflare.com/pages/

## 🎉 設定完了後

設定が完了したら、以下を確認してください：

- [ ] GitHub Secrets が2つ設定されている
- [ ] `.github/workflows/deploy.yml` が存在する
- [ ] 初回プッシュでワークフローが実行される
- [ ] ビルドが成功する
- [ ] デプロイが完了する
- [ ] 本番URLで動作確認

すべて完了したら、今後は `git push` するだけで自動デプロイされます！

---

## 💡 Tips

### 手動でワークフローを実行する：

1. GitHubリポジトリの「Actions」タブ
2. 「Deploy to Cloudflare Pages」を選択
3. 「Run workflow」ボタンをクリック
4. 「Run workflow」を確認

### 特定のコミットをデプロイする：

ワークフローは `main` ブランチへのプッシュで自動実行されますが、
手動実行で特定のブランチやコミットをデプロイすることもできます。

### デプロイを一時停止する：

ワークフローファイルを削除するか、以下のコメントアウト：

```yaml
# on:
#   push:
#     branches:
#       - main
```

---

**設定完了後、何か問題があればお知らせください！**
