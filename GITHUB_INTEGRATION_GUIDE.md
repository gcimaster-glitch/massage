# 🔗 Cloudflare Pages と GitHub の連携ガイド

**「GitHubにpushするだけで、自動デプロイ。」**

---

## 🚨 現在の状況

### 問題
- **hogusy プロジェクト**: GitHub と接続されていない（手動デプロイのみ）
- **デプロイ方法**: `npm run deploy:prod` で手動デプロイ

### 影響
- ❌ Git push しても自動デプロイされない
- ❌ Pull Request のプレビュー環境が作成されない
- ❌ デプロイ履歴が GitHub と連携していない

---

## ✅ GitHub 連携のメリット

1. **自動デプロイ**
   - `git push origin main` で自動的に本番環境にデプロイ
   - 他のブランチへの push でプレビュー環境を自動生成

2. **プレビュー環境**
   - Pull Request ごとに一意のプレビュー URL を生成
   - マージ前に動作確認が可能

3. **ロールバック**
   - Cloudflare Dashboard から過去のデプロイに簡単に戻せる
   - Git の履歴と連動

4. **デプロイ履歴**
   - コミット情報と連動したデプロイ履歴
   - いつ・誰が・何をデプロイしたか一目瞭然

---

## 🔧 GitHub 連携の設定手順

### Step 1: Cloudflare Dashboard にアクセス
1. https://dash.cloudflare.com/ にアクセス
2. アカウント: `gcimaster@gmail.com` でログイン
3. 左メニューから **「Workers & Pages」** をクリック

### Step 2: hogusy プロジェクトを選択
1. プロジェクト一覧から **「hogusy」** をクリック
2. 上部タブから **「Settings」** を選択

### Step 3: GitHub 連携を設定
1. 左メニューから **「Builds & deployments」** を選択
2. **「Source」** セクションを探す
3. **「Connect to Git」** または **「Change source」** ボタンをクリック

### Step 4: GitHub アカウントを認証
1. **「Connect GitHub」** をクリック
2. GitHub の認証画面が表示される
3. **「Authorize Cloudflare Pages」** をクリック
4. 必要に応じてパスワードを入力

### Step 5: リポジトリを選択
1. **「Select a repository」** で以下を選択:
   - **アカウント**: `gcimaster-glitch`
   - **リポジトリ**: `massage`
2. **「Begin setup」** をクリック

### Step 6: ビルド設定を入力
以下の設定を入力します：

#### プロジェクト名
```
hogusy
```

#### 本番ブランチ
```
main
```

#### ビルドコマンド
```
npm run build
```

#### ビルド出力ディレクトリ
```
dist
```

#### ルートディレクトリ（オプション）
```
/
```

#### 環境変数
**重要**: 既存の Secrets を引き継ぐため、以下を確認：
- `RESEND_API_KEY`
- `GOOGLE_CLIENT_ID`（今後設定）
- `GOOGLE_CLIENT_SECRET`（今後設定）
- `GOOGLE_MAPS_API_KEY`（今後設定）

### Step 7: 保存して初回デプロイ
1. **「Save and Deploy」** をクリック
2. Cloudflare が自動的に GitHub から最新のコードを取得
3. ビルド・デプロイが開始される（約2〜3分）
4. 完了すると、デプロイ URL が表示される

---

## 🧪 動作確認

### 1. 自動デプロイのテスト
```bash
cd /home/user/webapp

# 簡単な変更を加える
echo "<!-- GitHub auto-deploy test -->" >> index.html

# コミット・プッシュ
git add index.html
git commit -m "test: GitHub auto-deploy test"
git push origin main
```

### 2. Cloudflare Dashboard で確認
1. https://dash.cloudflare.com/ → Workers & Pages → hogusy
2. **「Deployments」** タブをクリック
3. 最新のデプロイが自動的に開始されているか確認
4. ビルドログを確認

### 3. デプロイ完了確認
- デプロイが完了すると、**緑色のチェックマーク** が表示される
- **「View deployment」** をクリックして動作確認

---

## 🔍 トラブルシューティング

### エラー1: ビルドが失敗する
**原因**: 環境変数が設定されていない、または依存関係の問題

**解決方法**:
1. Cloudflare Dashboard → hogusy → Settings → Environment variables
2. 必要な環境変数を追加:
   ```
   RESEND_API_KEY=re_AKEPFY69_***
   NODE_VERSION=20
   ```
3. **「Retry deployment」** をクリック

### エラー2: "Repository not found"
**原因**: Cloudflare Pages に GitHub リポジトリへのアクセス権限がない

**解決方法**:
1. GitHub → Settings → Applications → Authorized OAuth Apps
2. **「Cloudflare Pages」** を探す
3. **「Grant」** をクリックして `gcimaster-glitch/massage` リポジトリへのアクセスを許可

### エラー3: ビルドコマンドが見つからない
**原因**: `package.json` の scripts に `build` がない

**解決方法**:
すでに `package.json` に `build` スクリプトがあるので問題なし:
```json
"scripts": {
  "build": "vite build"
}
```

---

## 📊 GitHub 連携前後の比較

| 項目 | 連携前（現在） | 連携後 |
|------|---------------|--------|
| デプロイ方法 | 手動（`npm run deploy:prod`） | 自動（`git push`） |
| プレビュー環境 | なし | PR ごとに自動生成 |
| ロールバック | 複雑 | Dashboard からワンクリック |
| デプロイ履歴 | コミット情報なし | Git 履歴と連動 |
| チーム開発 | 困難 | 容易 |

---

## ⚙️ 推奨設定

### ブランチ保護ルール（GitHub）
GitHub で設定すると、より安全に運用できます：

1. GitHub → `gcimaster-glitch/massage` → Settings → Branches
2. **「Add rule」** をクリック
3. Branch name pattern: `main`
4. 以下をチェック:
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging

### プレビュー環境の設定（Cloudflare）
1. Cloudflare Dashboard → hogusy → Settings → Builds & deployments
2. **「Preview deployments」** セクション:
   - ✅ Enable preview deployments for all branches
   - または特定のブランチのみ有効化（例: `develop`, `staging`）

---

## 🎯 次のステップ

### 今すぐ実施
1. **Cloudflare Dashboard にアクセス**
2. **hogusy プロジェクトで GitHub 連携を設定**
3. **初回デプロイが成功するか確認**

### 設定完了後
1. テストコミットで自動デプロイを確認
2. プレビュー環境が動作するか確認
3. 今後は `git push origin main` だけでデプロイ完了！

---

## 📚 参考資料

### Cloudflare Pages 公式ドキュメント
- **Git 統合**: https://developers.cloudflare.com/pages/platform/git-integration/
- **デプロイ設定**: https://developers.cloudflare.com/pages/platform/build-configuration/
- **環境変数**: https://developers.cloudflare.com/pages/platform/build-configuration/#environment-variables

### GitHub との連携
- **OAuth Apps**: https://github.com/settings/applications
- **Deploy Keys**: https://docs.github.com/en/developers/overview/managing-deploy-keys

---

## 🎉 まとめ

### 現在の状況
- **hogusy**: GitHub 未連携（手動デプロイのみ）
- **リポジトリ**: gcimaster-glitch/massage

### 必要なアクション（てつじさん）
1. **Cloudflare Dashboard にアクセス**（約5分）
2. **hogusy プロジェクトで GitHub 連携を設定**
3. **初回デプロイ完了を確認**

### 完了後のメリット
- ✅ `git push` で自動デプロイ
- ✅ PR ごとにプレビュー環境
- ✅ 簡単なロールバック
- ✅ チーム開発が容易に

---

**設定は約5分で完了します！**

何かご不明点があれば、いつでもお聞きください。😊

---

**プロジェクト**: HOGUSY  
**状態**: 🟡 GitHub 連携待ち  
**最終更新**: 2026-01-12  
**次のマイルストーン**: GitHub 連携完了 → 自動デプロイ稼働
