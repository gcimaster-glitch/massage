# 🎯 HOGUSY サービス設定 - 完全ガイド

**「Resend と Google で、プロの機能を実現。」**

---

## 📋 設定が必要なサービス

| サービス | 用途 | 優先度 | 料金 |
|---------|------|--------|------|
| **Resend** | メール送信 | 🔴 高 | 月100通まで無料 |
| **Google Maps API** | 地図表示 | 🔴 高 | 月$200クレジット |
| **Google OAuth** | Googleログイン | 🟡 中 | 完全無料 |

---

## 🚀 クイックスタート

### オプション A: 対話的スクリプトで設定（推奨）

```bash
cd /home/user/webapp
./setup-services.sh
```

このスクリプトが対話的に以下を設定：
- ✅ Resend API Key
- ✅ Google Maps API Key
- ✅ Google OAuth Client ID/Secret
- ✅ index.html の自動更新
- ✅ 本番環境への自動設定（オプション）

### オプション B: 手動で設定

各サービスのガイドを参照：
1. `RESEND_SETUP_GUIDE.md` - Resend 設定
2. `GOOGLE_COMPLETE_SETUP_GUIDE.md` - Google 設定

---

## 📖 詳細ガイド

### Part 1: Resend（メール送信）

**ドキュメント**: `RESEND_SETUP_GUIDE.md`

#### 設定手順（約10分）

1. **Resend アカウント作成**
   ```
   https://resend.com/signup
   ```

2. **API キー取得**
   ```
   https://resend.com/api-keys
   → Create API Key
   → Name: HOGUSY Production
   → Permission: Full access
   → Create
   ```

3. **ドメイン認証（推奨）**
   ```
   https://resend.com/domains
   → Add Domain
   → hogusy.com
   → Cloudflare にDNSレコードを追加
   ```

4. **.dev.vars に追加**
   ```bash
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

5. **本番環境に設定**
   ```bash
   npx wrangler pages secret put RESEND_API_KEY --project-name hogusy
   ```

#### 使用例

```typescript
// 予約確認メール送信
await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${env.RESEND_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    from: 'HOGUSY <noreply@hogusy.com>',
    to: userEmail,
    subject: '予約が完了しました',
    html: '<h1>ご予約ありがとうございます</h1>'
  })
});
```

---

### Part 2: Google Maps API（地図表示）

**ドキュメント**: `GOOGLE_COMPLETE_SETUP_GUIDE.md`

#### 設定手順（約15分）

1. **Google Cloud Console にアクセス**
   ```
   https://console.cloud.google.com/
   ```

2. **プロジェクトを選択/作成**
   - 既存: 「Soothe CARE CUBE Japan」
   - 新規: 「HOGUSY」

3. **APIを有効化**
   - Maps JavaScript API
   - Places API
   - Geocoding API

4. **API キーを作成**
   ```
   認証情報 → 認証情報を作成 → APIキー
   ```

5. **API キーに制限を設定**
   ```
   HTTP リファラー:
     - http://localhost:3000/*
     - https://hogusy.pages.dev/*
     - https://hogusy.com/*
   
   API制限:
     - Maps JavaScript API
     - Places API
     - Geocoding API
   ```

6. **.dev.vars に追加**
   ```bash
   GOOGLE_MAPS_API_KEY=AIzaSy...
   ```

7. **index.html を更新**
   ```html
   <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSy...&libraries=places,geometry&language=ja&region=JP" async defer></script>
   ```

8. **本番環境に設定**
   ```bash
   npx wrangler pages secret put GOOGLE_MAPS_API_KEY --project-name hogusy
   ```

---

### Part 3: Google OAuth（Googleログイン）

**ドキュメント**: `GOOGLE_COMPLETE_SETUP_GUIDE.md`

#### 設定手順（約20分）

1. **OAuth 同意画面を設定**
   ```
   Google Cloud Console → OAuth 同意画面
   
   ユーザータイプ: 外部
   アプリ名: HOGUSY
   アプリドメイン: hogusy.com
   承認済みドメイン: hogusy.com
   ```

2. **スコープを設定**
   - ✅ email
   - ✅ profile
   - ✅ openid

3. **OAuth クライアント ID を作成**
   ```
   認証情報 → OAuth クライアント ID
   
   種類: ウェブアプリケーション
   名前: HOGUSY Web App
   
   JavaScript 生成元:
     - http://localhost:3000
     - https://hogusy.pages.dev
     - https://hogusy.com
   
   リダイレクト URI:
     - http://localhost:3000/auth/callback/google
     - https://hogusy.pages.dev/auth/callback/google
     - https://hogusy.com/auth/callback/google
   ```

4. **クライアント ID とシークレットをコピー**

5. **.dev.vars に追加**
   ```bash
   GOOGLE_CLIENT_ID=123456789012-abc...googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-abc...
   ```

6. **本番環境に設定**
   ```bash
   npx wrangler pages secret put GOOGLE_CLIENT_ID --project-name hogusy
   npx wrangler pages secret put GOOGLE_CLIENT_SECRET --project-name hogusy
   ```

---

## ✅ 設定完了チェックリスト

### Resend
- [ ] アカウント作成
- [ ] API キー取得
- [ ] ドメイン認証（hogusy.com）
- [ ] .dev.vars に追加
- [ ] Cloudflare Pages に設定
- [ ] テストメール送信成功

### Google Maps
- [ ] API 有効化（Maps, Places, Geocoding）
- [ ] API キー作成
- [ ] API キーに制限設定
- [ ] .dev.vars に追加
- [ ] index.html 更新
- [ ] Cloudflare Pages に設定
- [ ] 地図表示確認

### Google OAuth
- [ ] OAuth 同意画面設定
- [ ] スコープ設定
- [ ] OAuth クライアント ID 作成
- [ ] .dev.vars に追加
- [ ] Cloudflare Pages に設定
- [ ] Googleログイン動作確認

---

## 🧪 動作確認

### ローカル環境

```bash
cd /home/user/webapp

# ビルド
npm run build

# 開発サーバー再起動
pm2 restart hogusy

# ブラウザで確認
# http://localhost:3000/app/map - 地図が表示される
# http://localhost:3000/auth/login - Googleログインボタンが動作する
```

### 本番環境

```bash
# デプロイ
npm run deploy:prod

# ブラウザで確認
# https://hogusy.com/app/map - 地図が表示される
# https://hogusy.com/auth/login - Googleログインボタンが動作する
```

---

## 📊 環境変数一覧

### .dev.vars（ローカル開発）

```bash
# Resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Google Maps
GOOGLE_MAPS_API_KEY=AIzaSy...

# Google OAuth
GOOGLE_CLIENT_ID=123456789012-abc...googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc...

# その他（既存）
STRIPE_SECRET=sk_test_...
GEMINI_API_KEY=...
JWT_SECRET=...
```

### Cloudflare Pages Secrets（本番環境）

```bash
# 設定コマンド
npx wrangler pages secret put RESEND_API_KEY --project-name hogusy
npx wrangler pages secret put GOOGLE_MAPS_API_KEY --project-name hogusy
npx wrangler pages secret put GOOGLE_CLIENT_ID --project-name hogusy
npx wrangler pages secret put GOOGLE_CLIENT_SECRET --project-name hogusy

# 確認コマンド
npx wrangler pages secret list --project-name hogusy
```

---

## 💰 コストサマリー

| サービス | 無料枠 | 料金 | 推定コスト/月 |
|---------|--------|------|--------------|
| Resend | 100通/月 | $1/1000通 | $0 |
| Google Maps | $200クレジット | 従量課金 | $0 |
| Google OAuth | 無制限 | 無料 | $0 |
| **合計** | - | - | **$0** |

小規模サービスなら完全無料で運用可能！ 🎉

---

## 🔒 セキュリティのベストプラクティス

1. **API キーを Git にコミットしない**
   - ✅ `.dev.vars` は `.gitignore` に含まれています

2. **API キーに制限を設定**
   - ✅ Google Maps: HTTP リファラー制限
   - ✅ Google OAuth: リダイレクト URI 制限

3. **本番と開発で別のキーを使用**
   - Development: `HOGUSY Development`
   - Production: `HOGUSY Production`

4. **定期的に使用量を確認**
   - Resend: https://resend.com/usage
   - Google: https://console.cloud.google.com/billing

---

## 📞 トラブルシューティング

### 問題: 設定スクリプトが動かない

```bash
# 実行権限を確認
ls -l /home/user/webapp/setup-services.sh

# 実行権限を付与
chmod +x /home/user/webapp/setup-services.sh

# 再実行
./setup-services.sh
```

### 問題: .dev.vars が見つからない

```bash
# ファイルを確認
ls -la /home/user/webapp/.dev.vars

# なければテンプレートからコピー
cp /home/user/webapp/.env.example /home/user/webapp/.dev.vars
```

### 問題: API キーが無効

- Resend: https://resend.com/api-keys で確認
- Google: https://console.cloud.google.com/apis/credentials で確認

---

## 🚀 次のステップ

1. **今すぐ**: 設定スクリプトを実行
   ```bash
   cd /home/user/webapp
   ./setup-services.sh
   ```

2. **設定完了後**: ビルド・デプロイ
   ```bash
   npm run build
   pm2 restart hogusy
   npm run deploy:prod
   ```

3. **動作確認**: 各機能をテスト
   - 地図表示
   - Googleログイン
   - メール送信（本番のみ）

4. **本番稼働**: hogusy.com で公開

---

## 📁 関連ドキュメント

- `RESEND_SETUP_GUIDE.md` - Resend 詳細設定
- `GOOGLE_COMPLETE_SETUP_GUIDE.md` - Google 詳細設定
- `setup-services.sh` - 対話的設定スクリプト
- `DOMAIN_SETUP_IN_PROGRESS.md` - ドメイン設定状況

---

**設定の準備が整いました！**

てつじさん、設定スクリプトを実行してサービスを有効化しましょう！

```bash
cd /home/user/webapp
./setup-services.sh
```

何か質問があれば、いつでもお知らせください！ 🚀

---

最終更新日: 2026-01-12
プロジェクト: HOGUSY（ほぐす、を、もっと身近に。）
状態: 🟢 設定準備完了
