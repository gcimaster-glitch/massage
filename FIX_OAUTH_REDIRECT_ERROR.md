# 🔧 OAuth redirect_uri_mismatch エラー修正ガイド

## ❌ エラー内容
```
アクセスをブロック: このアプリのリクエストは無効です
エラー 400: redirect_uri_mismatch
```

---

## 🔍 原因
Google Cloud Console の OAuth クライアント設定に、本番環境の `redirect_uri` が登録されていません。

現在登録されている URI:
- ✅ `http://localhost:3000/api/auth/oauth/google/callback` （ローカル開発用）

必要な URI:
- ❌ `https://hogusy.com/api/auth/oauth/google/callback` （本番環境）
- ❌ `https://hogusy.pages.dev/api/auth/oauth/google/callback` （Pages URL）

---

## ✅ 修正手順（5分で完了）

### Step 1: Google Cloud Console にアクセス
1. ブラウザで開く: https://console.cloud.google.com/apis/credentials
2. プロジェクト「HOGUSY」を選択
3. Google アカウント: hogusy.app@gmail.com でログイン

### Step 2: OAuth クライアント ID を編集
1. 「認証情報」ページで、以下のクライアント ID を探す:
   ```
   HOGUSY Web App
   1086808588938-n0ihdrn1mstrqup5g1ov9c4tjou76k3k.apps.googleusercontent.com
   ```
2. 右側の「✏️ 編集」アイコンをクリック

### Step 3: リダイレクト URI を追加
1. 画面をスクロールして「承認済みのリダイレクト URI」セクションを探す
2. 「+ URI を追加」ボタンを**2回**クリック
3. 以下の2つの URI を追加:

   **1つ目:**
   ```
   https://hogusy.com/api/auth/oauth/google/callback
   ```

   **2つ目:**
   ```
   https://hogusy.pages.dev/api/auth/oauth/google/callback
   ```

4. 入力後、画面下部の「**保存**」ボタンをクリック

### Step 4: 設定完了を確認
保存が完了すると、以下のメッセージが表示されます:
```
OAuth 2.0 クライアント ID が更新されました
```

---

## 🧪 修正後のテスト

### テスト手順:
1. ブラウザで開く: https://hogusy.com/auth/login
2. 「**Google でログイン**」ボタンをクリック
3. Google アカウント（hogusy.app@gmail.com）でログイン
4. 自動的にダッシュボード（/app）へリダイレクトされる

### 期待される動作:
- ✅ エラーなしでログイン成功
- ✅ ユーザー情報が取得される
- ✅ ダッシュボードが表示される

---

## 📋 最終的な設定（確認用）

### 承認済みの JavaScript 生成元（3つ）:
```
http://localhost:3000
https://hogusy.com
https://hogusy.pages.dev
```

### 承認済みのリダイレクト URI（3つ）:
```
http://localhost:3000/api/auth/oauth/google/callback
https://hogusy.com/api/auth/oauth/google/callback
https://hogusy.pages.dev/api/auth/oauth/google/callback
```

---

## 🎯 よくある質問

### Q1: 「保存」ボタンが見つかりません
**A**: 画面を一番下までスクロールしてください。青い「保存」ボタンがあります。

### Q2: URI を追加しても保存できません
**A**: 以下を確認してください:
- URI が正しく入力されているか（コピー＆ペースト推奨）
- 余計なスペースが入っていないか
- `https://` が正しく含まれているか

### Q3: 保存後もエラーが出ます
**A**: 設定反映まで1〜2分かかる場合があります。少し待ってから再度テストしてください。

### Q4: ローカル開発環境（localhost）でもエラーが出ます
**A**: ローカル環境は既に設定済みです。もしエラーが出る場合は:
1. ブラウザのキャッシュをクリア
2. シークレットモードで試す
3. PM2 サービスを再起動: `pm2 restart hogusy`

---

## ✅ 修正完了チェックリスト

修正作業が完了したら、以下をチェック:

- ⬜ Google Cloud Console にアクセス
- ⬜ OAuth クライアント ID を編集
- ⬜ `https://hogusy.com/api/auth/oauth/google/callback` を追加
- ⬜ `https://hogusy.pages.dev/api/auth/oauth/google/callback` を追加
- ⬜ 設定を保存
- ⬜ https://hogusy.com/auth/login でログインテスト
- ⬜ ログイン成功を確認

---

## 🎉 修正完了後

OAuth ログインが正常に動作するようになります！

**次のステップ:**
1. ログインページでテスト
2. ユーザー情報が正しく取得されるか確認
3. Google Maps などの機能をテスト

---

**作成日**: 2026年1月13日 15:30 JST  
**対象エラー**: redirect_uri_mismatch  
**所要時間**: 約5分
