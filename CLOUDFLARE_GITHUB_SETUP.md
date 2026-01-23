# Cloudflare Pages GitHub 自動ビルド設定ガイド

## 📋 前提条件

- ✅ GitHubリポジトリ: `https://github.com/gcimaster-glitch/massage`
- ✅ Cloudflare Pagesプロジェクト: `hogusy`
- ✅ 最新コードはGitHubにプッシュ済み

## 🔧 設定手順

### 1. Cloudflare Dashboard にアクセス
URL: https://dash.cloudflare.com/

### 2. Workers & Pages を選択
左メニューから「Workers & Pages」をクリック

### 3. hogusy プロジェクトを選択
プロジェクト一覧から「hogusy」を見つけてクリック

### 4. Settings タブを開く
上部のタブメニューから「Settings」をクリック

### 5. Builds & deployments セクションを開く
左側のサイドバーから「Builds & deployments」を選択

### 6. GitHub連携を設定

現在の状態を確認：
- **現在**: Direct Upload (手動アップロード)
- **変更先**: GitHub連携

「**Connect to Git**」ボタンをクリック

### 7. GitHub認証

1. GitHubアカウントでログイン
2. Cloudflare Pagesへのアクセスを許可
3. リポジトリへのアクセス権限を付与

### 8. リポジトリを選択

```
Organization/User: gcimaster-glitch
Repository: massage
```

### 9. ビルド設定

以下の設定を入力してください：

| 設定項目 | 値 |
|---------|-----|
| **Production branch** | `main` |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | (空欄のまま) |
| **Node version** | `18` または `20` |

### 10. 環境変数（オプション）

必要に応じて設定：
```
ENVIRONMENT=production
```

その他のAPI Keyがあれば追加してください。

### 11. 保存してデプロイ

「**Save and Deploy**」ボタンをクリック

初回ビルドが自動的に開始されます。

## ✅ 設定完了後の動作

### 自動デプロイ
- `main` ブランチへの `git push` で自動ビルド・デプロイ
- 数分でデプロイ完了（通常2-5分）

### プレビューデプロイ
- Pull Request作成時に自動プレビュー環境が作成される
- PR毎に独立したURLが発行される

### ビルドログ
- Cloudflare Dashboard で詳細なビルドログを確認可能
- エラー時のデバッグが容易

### ロールバック
- 過去のデプロイ履歴から簡単にロールバック可能

## 🎯 次回以降の使い方

### コードを更新してデプロイ

```bash
# ローカルで開発
git add .
git commit -m "feat: 新機能を追加"
git push origin main

# 自動的にCloudflare Pagesがビルド・デプロイ
```

### デプロイ状況の確認

1. Cloudflare Dashboard → Workers & Pages → hogusy
2. 「Deployments」タブで最新のデプロイ状況を確認
3. ビルドログでエラーや警告をチェック

## ⚠️ 重要な注意事項

### Functions ディレクトリ
- `functions/` ディレクトリは自動的にデプロイされます
- APIルート（`functions/[[route]].ts`）も含まれます

### 設定ファイル
- `wrangler.jsonc` の設定が自動的に適用されます
- D1 Database バインディング: `hogusy-db-production`
- R2 Bucket バインディング: `hogusy-storage`

### ビルド時間
- 初回ビルド: 5-10分程度
- 2回目以降: 2-5分程度（キャッシュ利用）

### カスタムドメイン
- 既存のカスタムドメイン（hogusy.com）は自動的に継承されます
- DNS設定は変更不要です

## 🔗 関連リンク

- **GitHubリポジトリ**: https://github.com/gcimaster-glitch/massage
- **Cloudflare Dashboard**: https://dash.cloudflare.com/
- **本番URL**: https://hogusy.com
- **Pages URL**: https://hogusy.pages.dev

## 📞 トラブルシューティング

### ビルドが失敗する場合

1. **ビルドログを確認**
   - Cloudflare Dashboard → hogusy → Deployments
   - 失敗したデプロイをクリックしてログを確認

2. **よくあるエラー**
   - Node.jsバージョン不一致 → Node version設定を確認
   - npm installエラー → package.jsonの依存関係を確認
   - ビルドタイムアウト → ビルド時間が長すぎる場合は最適化が必要

3. **ローカルで確認**
   ```bash
   npm run build
   ```
   ローカルでビルドが成功することを確認

### デプロイが反映されない場合

1. **キャッシュをクリア**
   - ブラウザで強制リロード（Ctrl+Shift+R）

2. **デプロイURLを確認**
   - 最新のデプロイURLにアクセス
   - Cloudflare Dashboard → Deploymentsで確認

3. **DNS伝播待ち**
   - カスタムドメインの場合、DNS伝播に時間がかかる場合があります（最大48時間）

## 🎉 完了

これで、GitHubへのpushだけで自動的にCloudflare Pagesにデプロイされるようになりました！

コードを更新したら、`git push origin main` するだけで本番環境に反映されます。
