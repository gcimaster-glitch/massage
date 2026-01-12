# 🗺️ Google Maps API と OAuth 完全設定ガイド

**「プロの地図とログインで、最高のUXを。」**

---

## 📋 設定する Google サービス

1. **Google Maps JavaScript API** - 地図表示、施設検索
2. **Google Places API** - 施設情報、レビュー
3. **Google Geocoding API** - 住所→座標変換
4. **Google OAuth 2.0** - Googleログイン

---

## 🌐 Part 1: Google Cloud Console の基本設定

### Step 1-1: Google Cloud Console にアクセス

1. **ブラウザで開く**
   ```
   https://console.cloud.google.com/
   ```

2. **Googleアカウントでログイン**
   - Gmail アカウントを使用

3. **既存のプロジェクトを選択**
   - プロジェクト名: 「Soothe CARE CUBE Japan」
   - または新規作成: 「HOGUSY」

---

## 🗺️ Part 2: Google Maps API の設定

### Step 2-1: 必要なAPIを有効化

1. **APIライブラリに移動**
   ```
   左メニュー → 「APIとサービス」 → 「ライブラリ」
   ```

2. **以下のAPIを順番に有効化**

   **① Maps JavaScript API**
   - 検索: `Maps JavaScript API`
   - 「有効にする」をクリック
   - 用途: 地図表示

   **② Places API**
   - 検索: `Places API`
   - 「有効にする」をクリック
   - 用途: 施設検索、詳細情報

   **③ Geocoding API**
   - 検索: `Geocoding API`
   - 「有効にする」をクリック
   - 用途: 住所→座標変換

### Step 2-2: API キーの作成

1. **認証情報ページに移動**
   ```
   左メニュー → 「APIとサービス」 → 「認証情報」
   ```

2. **「認証情報を作成」→「APIキー」をクリック**

3. **API キーが作成される**
   ```
   AIzaSy... (43文字)
   ```
   
   すぐにコピーしてメモ！

### Step 2-3: API キーの制限設定（重要）

1. **作成したAPIキーの横の✏️（編集）をクリック**

2. **名前を設定**
   ```
   HOGUSY Maps API Key
   ```

3. **アプリケーションの制限**
   - 「HTTP リファラー（ウェブサイト）」を選択
   
   **ウェブサイトの制限に追加:**
   ```
   http://localhost:3000/*
   https://hogusy.pages.dev/*
   https://hogusy.com/*
   https://*.hogusy.com/*
   ```

4. **API の制限**
   - 「キーを制限」を選択
   
   **APIを選択:**
   - ✅ Maps JavaScript API
   - ✅ Places API
   - ✅ Geocoding API

5. **「保存」をクリック**

---

## 🔐 Part 3: Google OAuth 2.0 の設定

### Step 3-1: OAuth 同意画面の設定

1. **OAuth 同意画面に移動**
   ```
   左メニュー → 「APIとサービス」 → 「OAuth 同意画面」
   ```

2. **ユーザータイプを選択**
   - **外部**: 一般ユーザー向け（推奨）
   - 「作成」をクリック

3. **アプリ情報を入力**

   **基本情報:**
   ```
   アプリ名: HOGUSY
   ユーザーサポートメール: （あなたのGmail）
   アプリのロゴ: （オプション）
   ```

   **アプリドメイン:**
   ```
   アプリのホームページ: https://hogusy.com
   プライバシーポリシー: https://hogusy.com/legal
   利用規約: https://hogusy.com/legal
   ```

   **承認済みドメイン:**
   ```
   hogusy.com
   ```
   
   「ドメインを追加」をクリック

   **デベロッパーの連絡先情報:**
   ```
   （あなたのメールアドレス）
   ```

4. **「保存して次へ」をクリック**

### Step 3-2: スコープの設定

1. **「スコープを追加または削除」をクリック**

2. **以下のスコープを選択:**
   - ✅ `email` - メールアドレスの取得
   - ✅ `profile` - プロフィール情報の取得
   - ✅ `openid` - OpenID Connect用

3. **「更新」→「保存して次へ」**

### Step 3-3: テストユーザーの追加（開発中）

1. **「テストユーザーを追加」をクリック**

2. **自分のGmailアドレスを追加**

3. **「保存して次へ」**

4. **「ダッシュボードに戻る」**

### Step 3-4: OAuth クライアント ID の作成

1. **認証情報ページに移動**
   ```
   左メニュー → 「APIとサービス」 → 「認証情報」
   ```

2. **「認証情報を作成」→「OAuth クライアント ID」をクリック**

3. **アプリケーションの種類を選択**
   ```
   アプリケーションの種類: ウェブ アプリケーション
   名前: HOGUSY Web App
   ```

4. **承認済みの JavaScript 生成元を追加**
   ```
   http://localhost:3000
   https://hogusy.pages.dev
   https://hogusy.com
   ```

5. **承認済みのリダイレクト URI を追加**
   ```
   http://localhost:3000/auth/callback/google
   https://hogusy.pages.dev/auth/callback/google
   https://hogusy.com/auth/callback/google
   ```

6. **「作成」をクリック**

7. **クライアント ID とシークレットが表示される**
   ```
   クライアント ID: 123456789012-abc...googleusercontent.com
   クライアント シークレット: GOCSPX-abc...
   ```
   
   ⚠️ **重要**: 必ずコピーしてメモ！

---

## ⚙️ Part 4: HOGUSY プロジェクトに設定

### Step 4-1: ローカル環境（.dev.vars）

```bash
cd /home/user/webapp
nano .dev.vars
```

以下を追加・更新:
```bash
# Google Maps API
GOOGLE_MAPS_API_KEY=AIzaSy...

# Google OAuth 2.0
GOOGLE_CLIENT_ID=123456789012-abc...googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc...
```

### Step 4-2: 本番環境（Cloudflare Pages）

```bash
cd /home/user/webapp

# Google Maps API Key
npx wrangler pages secret put GOOGLE_MAPS_API_KEY --project-name hogusy

# Google OAuth Client ID
npx wrangler pages secret put GOOGLE_CLIENT_ID --project-name hogusy

# Google OAuth Client Secret
npx wrangler pages secret put GOOGLE_CLIENT_SECRET --project-name hogusy
```

各コマンドの後、プロンプトで値を貼り付けて Enter

### Step 4-3: index.html を更新

```bash
cd /home/user/webapp
nano index.html
```

12行目の `YOUR_API_KEY_HERE` を実際のAPIキーに置き換え:
```html
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSy...&libraries=places,geometry&language=ja&region=JP" async defer></script>
```

---

## 🧪 Part 5: 動作テスト

### テスト 1: Google Maps が表示されるか

1. **ローカル開発サーバーを起動**
   ```bash
   cd /home/user/webapp
   npm run build
   pm2 restart hogusy
   ```

2. **ブラウザで開く**
   ```
   http://localhost:3000/app/map
   ```

3. **地図が表示されることを確認**
   - ✅ 地図が表示される
   - ✅ 現在地ボタンが動作する
   - ✅ 施設マーカーが表示される

### テスト 2: Google ログインが動作するか

1. **ログインページを開く**
   ```
   http://localhost:3000/auth/login
   ```

2. **「Googleでログイン」ボタンをクリック**

3. **Google のログイン画面が表示される**
   - ✅ OAuth同意画面が表示される
   - ✅ ログイン後、ホームにリダイレクトされる

---

## 💰 料金プラン

### Google Maps API（無料枠）

| API | 無料枠/月 | 料金 |
|-----|----------|------|
| Maps JavaScript API | 28,500 マップロード | $7/1000ロード |
| Places API | 無制限（検索） | $17/1000リクエスト |
| Geocoding API | 40,000 リクエスト | $5/1000リクエスト |

**Google Cloud 無料クレジット**: 月 $200

**推奨**: 小規模サービスなら無料枠内で運用可能

### Google OAuth

**完全無料** - 利用制限なし

---

## ✅ 設定完了チェックリスト

### Google Cloud Console
- [ ] プロジェクト作成（または既存プロジェクト選択）
- [ ] Maps JavaScript API 有効化
- [ ] Places API 有効化
- [ ] Geocoding API 有効化
- [ ] API キー作成
- [ ] API キーに制限設定（HTTP リファラー、API制限）
- [ ] OAuth 同意画面設定
- [ ] OAuth クライアント ID 作成

### HOGUSY プロジェクト
- [ ] .dev.vars に Google Maps API Key 追加
- [ ] .dev.vars に Google OAuth Client ID 追加
- [ ] .dev.vars に Google OAuth Client Secret 追加
- [ ] index.html の API Key 更新
- [ ] Cloudflare Pages に環境変数設定

### 動作確認
- [ ] ローカルで地図が表示される
- [ ] ローカルで Google ログインが動作する
- [ ] 本番（hogusy.com）で地図が表示される
- [ ] 本番（hogusy.com）で Google ログインが動作する

---

## 🔒 セキュリティのベストプラクティス

1. **API キーは必ず制限する**
   - HTTP リファラー制限 ✅
   - API 制限 ✅

2. **OAuth リダイレクト URI を厳密に設定**
   - 信頼できるドメインのみ追加

3. **API キーを Git にコミットしない**
   - `.dev.vars` は `.gitignore` に含まれています ✅

4. **定期的にAPI使用量を確認**
   - Google Cloud Console → 課金

---

## 📊 API 使用量の確認

```
Google Cloud Console → APIとサービス → ダッシュボード
```

リアルタイムで使用量とコストを確認できます。

---

## 📞 トラブルシューティング

### 問題1: 地図が表示されない

**原因**: API キーが無効、または制限設定が間違っている

**解決方法**:
1. ブラウザのコンソール（F12）でエラーを確認
2. API キーが正しいか確認
3. HTTP リファラー制限を確認
4. API が有効化されているか確認

### 問題2: Google ログインエラー

**原因**: リダイレクト URI が登録されていない

**解決方法**:
1. OAuth クライアント ID の設定を確認
2. リダイレクト URI が正確に登録されているか確認
3. `http://localhost:3000/auth/callback/google` が含まれているか確認

### 問題3: 課金エラー

**原因**: 無料枠を超えた

**解決方法**:
1. Google Cloud Console で課金を確認
2. クレジットカードを登録（必須）
3. 使用量制限を設定

---

最終更新日: 2026-01-12
プロジェクト: HOGUSY
