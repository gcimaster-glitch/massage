# 📧 メール通知とStripe決済の設定ガイド

## 🔑 必要なAPIキー

HOGUSYを本番環境で動作させるには、以下のAPIキーが必要です：

### 1. **Resend API Key**（メール送信）
- **用途**: 予約確定・キャンセル・KYC審査結果のメール通知
- **取得方法**: https://resend.com/
- **環境変数名**: `RESEND_API_KEY`

### 2. **Stripe Secret Key**（決済）
- **用途**: クレジットカード決済処理
- **取得方法**: https://stripe.com/
- **環境変数名**: `STRIPE_SECRET`

---

## 🛠️ Cloudflare Pages での設定手順

### **ステップ1: Cloudflare Dashboardにアクセス**
1. https://dash.cloudflare.com/ にログイン
2. 左サイドバーから **Workers & Pages** をクリック
3. **hogusy** プロジェクトをクリック

### **ステップ2: 環境変数を追加**
1. **Settings** タブをクリック
2. **Environment variables** セクションまでスクロール
3. **Add variable** ボタンをクリック

### **ステップ3: RESEND_API_KEYを設定**
1. **Variable name**: `RESEND_API_KEY`
2. **Value**: あなたのResend APIキー（例：`re_123abc...`）
3. **Environment**: `Production` を選択
4. **Save** をクリック

### **ステップ4: STRIPE_SECRETを設定**
1. **Variable name**: `STRIPE_SECRET`
2. **Value**: あなたのStripe Secret Key（例：`sk_live_...` または `sk_test_...`）
3. **Environment**: `Production` を選択
4. **Save** をクリック

### **ステップ5: 再デプロイ**
環境変数を設定した後、プロジェクトを再デプロイして反映させます：

```bash
cd /home/user/webapp
npm run build
npx wrangler pages deploy dist --project-name hogusy
```

---

## 🧪 ローカル開発環境での設定（`.dev.vars`）

ローカル開発環境で動作確認するには、`.dev.vars`ファイルを作成します：

### **1. .dev.varsファイルを作成**
```bash
cd /home/user/webapp
touch .dev.vars
```

### **2. APIキーを記述**
```bash
# .dev.vars
RESEND_API_KEY=re_your_resend_api_key_here
STRIPE_SECRET=sk_test_your_stripe_test_key_here
```

### **3. .gitignoreに追加（重要！）**
`.dev.vars`は既に`.gitignore`に含まれているはずですが、念のため確認してください：

```bash
# .gitignore
.dev.vars
```

### **4. ローカルで起動**
```bash
npm run build
npx wrangler pages dev dist --local
```

---

## 📧 Resend APIキーの取得方法

### **ステップ1: Resendにサインアップ**
1. https://resend.com/ にアクセス
2. **Sign Up** をクリックして無料アカウントを作成
3. メールアドレスを認証

### **ステップ2: APIキーを生成**
1. ダッシュボードで **API Keys** をクリック
2. **Create API Key** をクリック
3. 名前を入力（例：`HOGUSY Production`）
4. **Full Access** を選択
5. **Create** をクリック
6. 生成されたAPIキー（`re_...`）をコピーして保存

### **ステップ3: ドメイン認証（オプション・推奨）**
1. **Domains** タブをクリック
2. **Add Domain** をクリック
3. `hogusy.com` を入力
4. DNS設定にSPF/DKIMレコードを追加
5. 認証完了後、`noreply@hogusy.com` からメール送信可能

**注**: ドメイン認証なしでも、Resendの共有ドメイン（`onboarding@resend.dev`）からメール送信可能です。

---

## 💳 Stripe APIキーの取得方法

### **ステップ1: Stripeにサインアップ**
1. https://stripe.com/ にアクセス
2. **Start now** をクリックしてアカウントを作成
3. ビジネス情報を入力

### **ステップ2: APIキーを取得**
1. ダッシュボードで **Developers** → **API keys** をクリック
2. **Test mode** を選択（本番前）
3. **Secret key** をコピー（`sk_test_...`）

### **ステップ3: 本番環境用キー（本番運用時）**
1. ビジネス情報を完全に入力
2. **Activate your account** を完了
3. **Live mode** に切り替え
4. **Secret key** をコピー（`sk_live_...`）

---

## ✅ 設定確認方法

### **1. 環境変数が設定されているか確認**
```bash
# Cloudflare Pages Dashboardで確認
# Settings → Environment variables
```

### **2. メール送信のテスト**
予約を確定すると、自動的にメールが送信されます。

### **3. Stripe決済のテスト**
テストモードでテストカード番号を使用：
- **カード番号**: `4242 4242 4242 4242`
- **有効期限**: 任意の未来の日付
- **CVC**: 任意の3桁

---

## 🚨 トラブルシューティング

### **メールが送信されない場合**
1. `RESEND_API_KEY` が正しく設定されているか確認
2. Resendダッシュボードで送信ログを確認
3. メールアドレスが正しいか確認
4. スパムフォルダを確認

### **Stripe決済が失敗する場合**
1. `STRIPE_SECRET` が正しく設定されているか確認
2. テストモード/本番モードが一致しているか確認
3. カード情報が正しいか確認
4. Stripeダッシュボードでログを確認

---

## 📞 サポート

問題が解決しない場合：
- **Resend**: https://resend.com/docs
- **Stripe**: https://stripe.com/docs

---

**設定が完了したら、次のコマンドで再デプロイしてください：**

```bash
cd /home/user/webapp
npm run build
npx wrangler pages deploy dist --project-name hogusy
```

これでメール通知と決済機能が本番環境で動作します！ 🎉
