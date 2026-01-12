# Google サービス設定ガイド

このドキュメントは、Soothe x CARE CUBE Japan プロジェクトで Google Maps と Google ログインを設定する手順をまとめたものです。

## 📋 必要な情報

### Google Maps API
- **API Key**: `YOUR_API_KEY_HERE`
- **使用箇所**: `index.html` の Google Maps スクリプトタグ

### Google OAuth 2.0
- **Client ID**: `YOUR_CLIENT_ID_HERE.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-YOUR_CLIENT_SECRET_HERE`
- **使用箇所**: `.dev.vars` および Wrangler secrets

## 🔗 リンク集

### Google Cloud Console
- **プロジェクトURL**: https://console.cloud.google.com/
- **認証情報**: https://console.cloud.google.com/apis/credentials
- **API ライブラリ**: https://console.cloud.google.com/apis/library
- **OAuth 同意画面**: https://console.cloud.google.com/apis/credentials/consent

### ドキュメント
- **Google Maps JavaScript API**: https://developers.google.com/maps/documentation/javascript
- **Google Identity（OAuth）**: https://developers.google.com/identity/protocols/oauth2
- **Places API**: https://developers.google.com/maps/documentation/places/web-service

## ⚙️ ローカル開発環境の設定

### 1. `.dev.vars` ファイルを編集

```bash
# Google OAuth 2.0
GOOGLE_CLIENT_ID=123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz

# Google Maps API
GOOGLE_MAPS_API_KEY=AIzaSyB1234567890abcdefghijklmnopqrstuv
```

### 2. `index.html` を編集

`YOUR_API_KEY_HERE` を実際の API Key に置き換えてください：

```html
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyB1234567890abcdefghijklmnopqrstuv&libraries=places,geometry&language=ja&region=JP" async defer></script>
```

### 3. 開発サーバーを起動

```bash
cd /home/user/webapp
npm run build
pm2 restart soothe-care-cube-jp
```

## 🌐 本番環境の設定

### Cloudflare Pages Secrets の設定

```bash
# Google OAuth
npx wrangler pages secret put GOOGLE_CLIENT_ID --project-name soothe-care-cube-jp
npx wrangler pages secret put GOOGLE_CLIENT_SECRET --project-name soothe-care-cube-jp

# Google Maps API
npx wrangler pages secret put GOOGLE_MAPS_API_KEY --project-name soothe-care-cube-jp
```

### デプロイ

```bash
npm run deploy:prod
```

## 🔍 動作確認

### ローカル環境
1. http://localhost:3000 にアクセス
2. 地図ページ（/app/map）で地図が表示されることを確認
3. ログインページ（/auth/login）で Google ログインボタンをクリック
4. Google のログイン画面が表示されることを確認

### 本番環境
1. https://soothe-care-cube-jp.pages.dev にアクセス
2. 同様の確認を実施

## ❌ トラブルシューティング

### 地図が表示されない
- API Key が正しいか確認
- Maps JavaScript API が有効化されているか確認
- HTTP リファラー制限が正しいか確認

### Google ログインが動かない
- OAuth クライアント ID が正しいか確認
- JavaScript 生成元が登録されているか確認
- リダイレクト URI が登録されているか確認

### API エラーが出る
- Google Cloud Console で該当の API が有効化されているか確認
- API Key の制限設定を確認

## 📞 サポート

問題が解決しない場合は、以下を確認してください：
- ブラウザの開発者ツール（F12）でコンソールのエラーメッセージ
- Google Cloud Console の API 使用状況
- Cloudflare Pages のログ

---

最終更新日: 2026-01-12
