# 🗺️ Google サービス設定完了ガイド

**「地図と認証、全部まとめて、すぐに使える。」**

---

## 📋 現在の設定状況

### ✅ 完了
- Resend API キー設定

### ⏳ 次に必要な設定
1. **Google Maps API** （地図表示・住所検索に必須）
2. **Google OAuth 2.0** （Googleログインに必須）

---

## 🗺️ Google Maps API の設定

### Step 1: Google Cloud Console にアクセス
1. https://console.cloud.google.com/ にアクセス
2. Google アカウントでログイン

### Step 2: プロジェクトを作成
1. 上部のプロジェクト選択ドロップダウンをクリック
2. 「新しいプロジェクト」を選択
3. プロジェクト名: **`HOGUSY`** と入力
4. 「作成」をクリック

### Step 3: 必要な API を有効化
以下の3つの API を有効化します：

#### 3-1. Maps JavaScript API（必須）
1. 左メニュー「APIとサービス」→「ライブラリ」
2. 検索ボックスに「**Maps JavaScript API**」と入力
3. 「Maps JavaScript API」をクリック
4. 「有効にする」をクリック

#### 3-2. Places API（必須）
1. 同じく「ライブラリ」画面で「**Places API**」と検索
2. 「Places API」をクリック
3. 「有効にする」をクリック

#### 3-3. Geocoding API（推奨）
1. 「ライブラリ」画面で「**Geocoding API**」と検索
2. 「Geocoding API」をクリック
3. 「有効にする」をクリック

### Step 4: API キーを作成
1. 左メニュー「APIとサービス」→「認証情報」
2. 上部の「+ 認証情報を作成」→「API キー」
3. API キーが生成されます → **必ずコピー保存**

### Step 5: API キーを制限（セキュリティ）
1. 作成した API キーの右側の「編集」アイコンをクリック
2. **アプリケーションの制限** セクション:
   - 「HTTP リファラー（ウェブサイト）」を選択
   - 「項目を追加」をクリックして以下を追加:
     ```
     http://localhost:3000/*
     https://hogusy.com/*
     https://*.hogusy.pages.dev/*
     ```
3. **API の制限** セクション:
   - 「キーを制限」を選択
   - 以下の3つの API を選択:
     - Maps JavaScript API
     - Places API
     - Geocoding API
4. 「保存」をクリック

---

## 🔑 Google OAuth 2.0 の設定

### Step 1: OAuth 同意画面を設定
1. 左メニュー「APIとサービス」→「OAuth 同意画面」
2. ユーザータイプ: **「外部」** を選択 → 「作成」

### Step 2: アプリ情報を入力
1. **アプリ名**: `HOGUSY`
2. **ユーザーサポートメール**: てつじさんのメールアドレス
3. **アプリのロゴ**（オプション）: 後で追加可能
4. **アプリのホームページ**: `https://hogusy.com`
5. **アプリのプライバシーポリシー**: `https://hogusy.com/legal`
6. **アプリの利用規約**: `https://hogusy.com/legal`
7. **承認済みドメイン** → 「ドメインを追加」:
   ```
   hogusy.com
   hogusy.pages.dev
   ```
8. **デベロッパーの連絡先情報**: てつじさんのメールアドレス
9. 「保存して次へ」

### Step 3: スコープを追加
1. 「スコープを追加または削除」をクリック
2. 以下のスコープにチェック:
   - `email`
   - `profile`
   - `openid`
3. 「更新」→「保存して次へ」

### Step 4: テストユーザーを追加（開発中のみ）
1. 「ADD USERS」をクリック
2. てつじさんのメールアドレスを入力
3. 「追加」→「保存して次へ」

### Step 5: OAuth クライアント ID を作成
1. 左メニュー「APIとサービス」→「認証情報」
2. 「+ 認証情報を作成」→「OAuth クライアント ID」
3. **アプリケーションの種類**: 「ウェブ アプリケーション」
4. **名前**: `HOGUSY Web App`
5. **承認済みの JavaScript 生成元** → 「URI を追加」:
   ```
   http://localhost:3000
   https://hogusy.com
   https://hogusy.pages.dev
   ```
6. **承認済みのリダイレクト URI** → 「URI を追加」:
   ```
   http://localhost:3000/auth/callback/google
   https://hogusy.com/auth/callback/google
   https://hogusy.pages.dev/auth/callback/google
   ```
7. 「作成」をクリック
8. 表示された **クライアント ID** と **クライアント シークレット** を **必ずコピー保存**

---

## 🔧 ローカル環境への設定

### .dev.vars ファイルを編集
取得した値を `/home/user/webapp/.dev.vars` に設定します：

```bash
# てつじさんが取得した実際の値に置き換えてください
GOOGLE_CLIENT_ID=123456789012-xxxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxx
GOOGLE_MAPS_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### index.html の API キーを更新
`/home/user/webapp/index.html` の Google Maps スクリプトタグを更新：

```html
<!-- 現在の状態（プレースホルダー） -->
<script async defer
  src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY_HERE&libraries=places,geometry&language=ja&region=JP">
</script>

<!-- 更新後（実際の API キー） -->
<script async defer
  src="https://maps.googleapis.com/maps/api/js?key=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx&libraries=places,geometry&language=ja&region=JP">
</script>
```

---

## ☁️ 本番環境への設定

Cloudflare Pages に環境変数を設定します：

```bash
cd /home/user/webapp

# Google Maps API Key
echo "AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" | npx wrangler pages secret put GOOGLE_MAPS_API_KEY --project-name hogusy

# Google OAuth Client ID
echo "123456789012-xxxxxxxxxxxxxxxxx.apps.googleusercontent.com" | npx wrangler pages secret put GOOGLE_CLIENT_ID --project-name hogusy

# Google OAuth Client Secret
echo "GOCSPX-xxxxxxxxxxxxxxxxxxxx" | npx wrangler pages secret put GOOGLE_CLIENT_SECRET --project-name hogusy
```

---

## 🧪 動作確認

### 1. ビルド
```bash
cd /home/user/webapp
npm run build
```

### 2. ローカルサーバー再起動
```bash
pm2 restart hogusy
```

### 3. Google Maps の確認
ブラウザで以下にアクセス：
```
http://localhost:3000/app/map
```

**確認項目**:
- ✅ 地図が表示される
- ✅ 現在地ボタンが動作する
- ✅ 住所検索が動作する
- ✅ セラピストのマーカーが表示される

### 4. Google ログインの確認
ブラウザで以下にアクセス：
```
http://localhost:3000/auth/login
```

**確認項目**:
- ✅ 「Googleでログイン」ボタンが表示される
- ✅ ボタンをクリックすると Google ログイン画面に遷移
- ✅ ログイン後にアプリに戻ってくる
- ✅ ユーザー情報が正しく表示される

---

## 💰 コスト見積もり

### Google Maps API
- **無料枠**: 月額 $200 相当のクレジット（毎月自動付与）
- **Maps JavaScript API**: 1,000回読み込みあたり $7
- **Places API**: 1,000リクエストあたり $17
- **Geocoding API**: 1,000リクエストあたり $5

**実際の計算例**（月間1,000ユーザー、各10回地図表示）:
- Maps JavaScript API: 10,000回 → $70
- Places API: 5,000回 → $85
- 合計: $155 → **無料枠内に収まる**

### Google OAuth
- **完全無料**（制限なし）

**結論**: スモールサービスの場合、Google サービスは **完全無料** で利用可能

---

## ❌ よくあるエラーと解決方法

### エラー1: This API project is not authorized to use this API
**原因**: API が有効化されていない  
**解決方法**:
1. Google Cloud Console → APIとサービス → ライブラリ
2. 該当 API（Maps JavaScript API など）を検索
3. 「有効にする」をクリック

### エラー2: RefererNotAllowedMapError
**原因**: API キーの HTTP リファラー制限が正しくない  
**解決方法**:
1. Google Cloud Console → 認証情報
2. API キーをクリック
3. アプリケーションの制限 → HTTP リファラー
4. 以下を追加:
   ```
   http://localhost:3000/*
   https://hogusy.com/*
   https://*.hogusy.pages.dev/*
   ```
5. 保存

### エラー3: redirect_uri_mismatch（OAuth）
**原因**: リダイレクト URI が登録されていない  
**解決方法**:
1. Google Cloud Console → 認証情報
2. OAuth クライアント ID をクリック
3. 承認済みのリダイレクト URI に以下を追加:
   ```
   http://localhost:3000/auth/callback/google
   https://hogusy.com/auth/callback/google
   https://hogusy.pages.dev/auth/callback/google
   ```
4. 保存

### エラー4: 地図が表示されない
**チェックリスト**:
- [ ] API キーが `.dev.vars` に設定されているか
- [ ] Maps JavaScript API が有効化されているか
- [ ] `index.html` に Google Maps スクリプトタグがあるか
- [ ] API キーが `index.html` に正しく設定されているか
- [ ] ブラウザのコンソールにエラーが出ていないか（F12 で確認）

### エラー5: Google ログインボタンが動かない
**チェックリスト**:
- [ ] OAuth 同意画面が設定されているか
- [ ] OAuth クライアント ID が作成されているか
- [ ] `.dev.vars` に正しい値が設定されているか
- [ ] JavaScript 生成元が登録されているか

---

## 🔍 デバッグ方法

### 1. API キーの動作確認
ブラウザで以下の URL にアクセス:
```
https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY_HERE&libraries=places
```

- **正常時**: JavaScript コードが表示される
- **エラー時**: JSON 形式のエラーメッセージが表示される

### 2. OAuth の動作確認
ローカルサーバーを起動して、ブラウザで:
```
http://localhost:3000/auth/login
```

Google ログインボタンをクリックして動作を確認

### 3. コンソールログの確認
ブラウザの開発者ツール（F12）→ Console タブで、JavaScript エラーをチェック

---

## ✅ 設定チェックリスト

### Google Cloud Console
- [ ] プロジェクト作成（HOGUSY）
- [ ] Maps JavaScript API 有効化
- [ ] Places API 有効化
- [ ] Geocoding API 有効化
- [ ] API キー作成
- [ ] API キーに HTTP リファラー制限を設定
- [ ] OAuth 同意画面設定
- [ ] OAuth クライアント ID 作成

### プロジェクト設定
- [ ] `.dev.vars` に `GOOGLE_CLIENT_ID` を設定
- [ ] `.dev.vars` に `GOOGLE_CLIENT_SECRET` を設定
- [ ] `.dev.vars` に `GOOGLE_MAPS_API_KEY` を設定
- [ ] `index.html` の API Key を実際の値に置換

### 本番環境設定
- [ ] `wrangler pages secret put GOOGLE_CLIENT_ID`
- [ ] `wrangler pages secret put GOOGLE_CLIENT_SECRET`
- [ ] `wrangler pages secret put GOOGLE_MAPS_API_KEY`

### 動作確認
- [ ] ローカルで地図表示が動作
- [ ] ローカルで Google ログインが動作
- [ ] 本番環境で地図表示が動作
- [ ] 本番環境で Google ログインが動作

---

## 🚀 次のステップ

設定完了後、以下の機能が使用可能になります：

### 1. 地図機能
- セラピストの位置をマップ表示
- 現在地からの検索
- 住所検索
- ルート案内

### 2. Google ログイン
- ワンクリックログイン
- ユーザー情報の自動取得
- セキュアな認証

### 3. その他の連携（今後）
- Google Calendar 連携（予約のカレンダー同期）
- Google Analytics（アクセス解析）

---

## 📚 参考資料

### Google Maps Platform
- **メインドキュメント**: https://developers.google.com/maps/documentation
- **Maps JavaScript API**: https://developers.google.com/maps/documentation/javascript
- **Places API**: https://developers.google.com/maps/documentation/places/web-service
- **Geocoding API**: https://developers.google.com/maps/documentation/geocoding

### Google OAuth 2.0
- **OAuth 2.0 ガイド**: https://developers.google.com/identity/protocols/oauth2
- **Sign In with Google**: https://developers.google.com/identity/gsi/web/guides/overview

### プロジェクト内ドキュメント
- **詳細設定ガイド**: `/home/user/webapp/GOOGLE_SETUP_GUIDE.md`
- **完全設定ガイド**: `/home/user/webapp/GOOGLE_COMPLETE_SETUP_GUIDE.md`

---

## 🎉 まとめ

### てつじさんへのメッセージ
Google サービスの設定準備が完了しました！🎉

**次のアクション**:
1. **Google Cloud Console** で設定を実施（約15分）
2. 取得した **3つのキー** を教えてください:
   - Google Maps API Key
   - Google OAuth Client ID
   - Google OAuth Client Secret
3. 私が `.dev.vars` と本番環境に設定します

設定完了後、地図機能と Google ログインが動作します！

---

**プロジェクト**: HOGUSY  
**状態**: 🟡 Google サービス設定待ち  
**最終更新**: 2026-01-12  
**次のマイルストーン**: Google 設定完了 → 地図・ログイン機能の本番稼働
