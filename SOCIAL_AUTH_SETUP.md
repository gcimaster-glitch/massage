# ソーシャルログイン実装ガイド

## 📋 概要

Soothe x CARE CUBE Japanでは、以下のソーシャルログインプロバイダーをサポートしています：

- ✅ Google
- ✅ Yahoo! JAPAN
- ✅ X (Twitter)
- ✅ Facebook
- ✅ LINE
- ✅ Apple Sign In

---

## 🏗️ アーキテクチャ

### 認証フロー

```
1. ユーザーがログインボタンをクリック
   ↓
2. `/api/auth/oauth/{provider}` にリダイレクト
   ↓
3. プロバイダーの認証画面へ遷移
   ↓
4. ユーザーが認証・承認
   ↓
5. `/api/auth/oauth/{provider}/callback` にリダイレクト
   ↓
6. 認証コードをアクセストークンに交換
   ↓
7. プロバイダーからユーザー情報を取得
   ↓
8. データベースでユーザーを作成/更新
   ↓
9. JWTトークンを生成してフロントエンドにリダイレクト
```

### データベーススキーマ

#### `social_accounts` テーブル
ソーシャルアカウントの連携情報を保存

| カラム | 型 | 説明 |
|--------|-----|------|
| id | TEXT | プライマリーキー |
| user_id | TEXT | ユーザーID（外部キー） |
| provider | TEXT | プロバイダー名（GOOGLE, YAHOO, etc.) |
| provider_user_id | TEXT | プロバイダー側のユーザーID |
| provider_email | TEXT | プロバイダーから取得したメール |
| access_token | TEXT | アクセストークン（暗号化推奨） |
| refresh_token | TEXT | リフレッシュトークン（暗号化推奨） |
| last_used_at | DATETIME | 最終利用日時 |

#### `auth_sessions` テーブル
ログインセッション管理

| カラム | 型 | 説明 |
|--------|-----|------|
| id | TEXT | セッションID |
| user_id | TEXT | ユーザーID |
| token | TEXT | セッショントークン |
| expires_at | DATETIME | 有効期限 |
| ip_address | TEXT | IPアドレス |

#### `oauth_states` テーブル
CSRF保護用の一時的な状態管理

| カラム | 型 | 説明 |
|--------|-----|------|
| state | TEXT | ランダムな状態値 |
| provider | TEXT | プロバイダー名 |
| role | TEXT | 登録時のロール |
| expires_at | DATETIME | 有効期限（10分） |

---

## 🔧 セットアップ手順

### 1. Google OAuth 2.0の設定

#### Google Cloud Consoleでの設定
1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを作成または選択
3. 「APIとサービス」→「認証情報」へ移動
4. 「認証情報を作成」→「OAuth 2.0 クライアント ID」を選択
5. アプリケーションの種類：「ウェブアプリケーション」
6. 承認済みのリダイレクトURIを追加：
   - 開発: `http://localhost:3000/api/auth/oauth/google/callback`
   - 本番: `https://soothe-care-cube-jp.pages.dev/api/auth/oauth/google/callback`
7. クライアントIDとシークレットをコピー

#### 環境変数に設定
```.env
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
```

#### 本番環境への設定
```bash
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
```

---

### 2. Yahoo! JAPAN ID連携の設定

#### Yahoo!デベロッパーネットワークでの設定
1. [Yahoo!デベロッパーネットワーク](https://e.developer.yahoo.co.jp/) にアクセス
2. アプリケーションを作成
3. 「アプリケーション情報」でClient IDとSecretを取得
4. リダイレクトURIを設定：
   - 開発: `http://localhost:3000/api/auth/oauth/yahoo/callback`
   - 本番: `https://soothe-care-cube-jp.pages.dev/api/auth/oauth/yahoo/callback`

#### 環境変数に設定
```.env
YAHOO_CLIENT_ID=your_yahoo_client_id
YAHOO_CLIENT_SECRET=your_yahoo_client_secret
```

---

### 3. X (Twitter) OAuth 2.0の設定

#### Twitter Developer Portalでの設定
1. [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard) にアクセス
2. アプリを作成
3. 「Settings」→「User authentication settings」を設定
4. Type of App: Web App
5. Callback URIs:
   - 開発: `http://localhost:3000/api/auth/oauth/x/callback`
   - 本番: `https://soothe-care-cube-jp.pages.dev/api/auth/oauth/x/callback`
6. Client IDとClient Secretを取得

#### 環境変数に設定
```.env
X_CLIENT_ID=your_x_client_id
X_CLIENT_SECRET=your_x_client_secret
```

---

### 4. Facebook Loginの設定

#### Facebook for Developersでの設定
1. [Facebook for Developers](https://developers.facebook.com/) にアクセス
2. アプリを作成
3. 「Facebook Login」を追加
4. 「設定」→「基本」でApp IDとApp Secretを取得
5. 「有効なOAuthリダイレクトURI」を設定：
   - 開発: `http://localhost:3000/api/auth/oauth/facebook/callback`
   - 本番: `https://soothe-care-cube-jp.pages.dev/api/auth/oauth/facebook/callback`

#### 環境変数に設定
```.env
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret
```

---

### 5. LINE Loginの設定

#### LINE Developers Consoleでの設定
1. [LINE Developers](https://developers.line.biz/console/) にアクセス
2. プロバイダーとチャネルを作成
3. 「LINE Login」を選択
4. Channel IDとChannel Secretを取得
5. Callback URLを設定：
   - 開発: `http://localhost:3000/api/auth/oauth/line/callback`
   - 本番: `https://soothe-care-cube-jp.pages.dev/api/auth/oauth/line/callback`

#### 環境変数に設定
```.env
LINE_CLIENT_ID=your_line_channel_id
LINE_CLIENT_SECRET=your_line_channel_secret
```

---

### 6. Apple Sign Inの設定

#### Apple Developer Accountでの設定
1. [Apple Developer](https://developer.apple.com/account/) にアクセス
2. 「Certificates, IDs & Profiles」へ移動
3. Service IDを作成
4. Return URLsを設定：
   - 開発: `http://localhost:3000/api/auth/oauth/apple/callback`
   - 本番: `https://soothe-care-cube-jp.pages.dev/api/auth/oauth/apple/callback`
5. Private Keyを生成してダウンロード

#### 環境変数に設定
```.env
APPLE_CLIENT_ID=your_apple_service_id
APPLE_CLIENT_SECRET=your_apple_team_id.your_key_id
```

---

## 🚀 実装状況

### ✅ 完了
- [x] データベーススキーマ設計
- [x] バックエンドAPI実装
- [x] OAuth 2.0フロー実装
- [x] フロントエンドUI実装
- [x] セッション管理
- [x] CSRF保護（state parameter）
- [x] 6つのプロバイダー対応
  - [x] Google
  - [x] Yahoo! JAPAN
  - [x] X (Twitter)
  - [x] Facebook
  - [x] LINE
  - [x] Apple

### 🚧 実装予定
- [ ] メール/パスワードログイン
- [ ] パスワードリセット機能
- [ ] メール確認機能
- [ ] 既存ユーザーへのソーシャルアカウント連携
- [ ] ソーシャルアカウント連携解除
- [ ] 2段階認証（2FA）
- [ ] セッション管理画面（複数デバイス対応）

---

## 📝 使用方法

### フロントエンド（ユーザー側）

#### ソーシャルログインボタン
```tsx
<button onClick={() => {
  window.location.href = '/api/auth/oauth/google?role=USER';
}}>
  Googleでログイン
</button>
```

#### ロール指定
登録時にロールを指定する場合：
```tsx
// セラピストとして登録
window.location.href = '/api/auth/oauth/google?role=THERAPIST';

// ホストとして登録
window.location.href = '/api/auth/oauth/google?role=HOST';
```

#### コールバック処理
```tsx
useEffect(() => {
  const token = new URLSearchParams(window.location.search).get('token');
  const isNewUser = new URLSearchParams(window.location.search).get('isNewUser');
  
  if (token) {
    localStorage.setItem('authToken', token);
    // ユーザー情報を取得
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.json()).then(user => {
      console.log('Logged in user:', user);
    });
  }
}, []);
```

---

## 🔐 セキュリティ

### CSRF保護
- OAuth stateパラメータによるCSRF攻撃防止
- 10分間の有効期限付き
- 使用後は自動削除

### トークン管理
- アクセストークンとリフレッシュトークンは暗号化推奨
- JWTは30日間有効
- セッショントークンはデータベースで管理

### HTTPS必須
本番環境では必ずHTTPSを使用してください。

---

## 🐛 トラブルシューティング

### リダイレクトURIが一致しない
各プロバイダーの管理画面で、正確なCallback URIを設定してください。

### トークン取得エラー
- Client IDとClient Secretが正しいか確認
- 環境変数が正しく設定されているか確認
- プロバイダーの管理画面でアプリが有効化されているか確認

### ユーザー情報が取得できない
- 必要なスコープ（email, profile等）が承認されているか確認
- プロバイダーのAPIバージョンが最新か確認

---

## 📞 サポート

質問や問題がある場合は、開発チームにお問い合わせください。

- Email: dev@soothe-jp.com
- GitHub Issues: https://github.com/gcimaster-glitch/massage/issues
