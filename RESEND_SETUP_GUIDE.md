# 📧 Resend 設定ガイド

## 🌐 Resend とは？

Resend は、開発者向けのメール送信API サービスです。
HOGUSY では以下の用途で使用します：

- ✉️ 予約確認メール
- 🔔 予約リマインダー
- 📝 キャンセル通知
- 🎉 ウェルカムメール
- 🔐 パスワードリセット

**料金**: 月100通まで無料、それ以降は $1/1000通

---

## 📝 Step 1: Resend アカウント作成

1. **Resend にアクセス**
   ```
   https://resend.com/
   ```

2. **「Sign Up」をクリック**
   - GitHub アカウントでサインアップ（推奨）
   - または、メールアドレスでサインアップ

3. **アカウント情報を入力**
   - Name: てつじ（または本名）
   - Company: HOGUSY（オプション）

4. **メール確認**
   - 確認メールが届くので、リンクをクリック

---

## 🔑 Step 2: API キーの作成

1. **Resend Dashboard にログイン**
   ```
   https://resend.com/dashboard
   ```

2. **左サイドバーから「API Keys」を選択**

3. **「Create API Key」をクリック**

4. **API キー情報を入力**
   ```
   Name: HOGUSY Production
   Permission: Full access
   ```

5. **「Create」をクリック**

6. **API キーをコピー**
   ```
   re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   
   ⚠️ **重要**: このキーは一度しか表示されません！
   必ず安全な場所にメモしてください。

---

## 📧 Step 3: ドメイン認証（推奨）

メールの到達率を上げるため、ドメイン認証を行います。

1. **Resend Dashboard → 「Domains」を選択**

2. **「Add Domain」をクリック**

3. **ドメインを入力**
   ```
   hogusy.com
   ```

4. **DNS レコードが表示される**
   ```
   TXT  _resend   v=DKIM1; k=rsa; p=MIGfMA0GCS...
   MX   hogusy.com  10 feedback-smtp.us-east-1.amazonses.com
   ```

5. **Cloudflare Dashboard でDNS レコードを追加**
   ```
   https://dash.cloudflare.com/8ce0b0ed2e7b73648869f337d07e03c7/dns
   ```
   
   **追加するレコード:**
   - Type: TXT
   - Name: _resend
   - Content: （Resend から提供された値）
   
   - Type: MX
   - Name: @
   - Content: 10 feedback-smtp.us-east-1.amazonses.com

6. **Resend に戻って「Verify」をクリック**

7. **認証完了を待つ（数分〜数時間）**

---

## ⚙️ Step 4: HOGUSY プロジェクトに設定

### ローカル環境（.dev.vars）

```bash
cd /home/user/webapp
nano .dev.vars
```

以下を追加:
```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 本番環境（Cloudflare Pages）

```bash
cd /home/user/webapp
npx wrangler pages secret put RESEND_API_KEY --project-name hogusy
```

プロンプトが表示されたら、API キーを貼り付けて Enter

---

## 🧪 Step 5: 動作テスト

### テストメール送信

```bash
cd /home/user/webapp

# テストスクリプトを作成
cat > test-resend.ts << 'EOF'
const RESEND_API_KEY = process.env.RESEND_API_KEY || 'YOUR_API_KEY_HERE';

async function testResend() {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: 'HOGUSY <noreply@hogusy.com>',
      to: 'YOUR_EMAIL@example.com',
      subject: 'HOGUSY テストメール',
      html: '<h1>こんにちは！</h1><p>HOGUSYからのテストメールです。</p>'
    })
  });

  const data = await response.json();
  console.log('Response:', data);
}

testResend();
EOF

# 実行
npx tsx test-resend.ts
```

---

## 📊 Resend メールテンプレート例

### 予約確認メール

```typescript
const bookingConfirmationEmail = {
  from: 'HOGUSY <noreply@hogusy.com>',
  to: userEmail,
  subject: '予約が完了しました - HOGUSY',
  html: `
    <h1>予約確認</h1>
    <p>${userName} 様</p>
    <p>ご予約ありがとうございます。</p>
    
    <h2>予約詳細</h2>
    <ul>
      <li>セラピスト: ${therapistName}</li>
      <li>日時: ${scheduledDate}</li>
      <li>メニュー: ${serviceName}</li>
      <li>料金: ¥${price.toLocaleString()}</li>
    </ul>
    
    <p>予約の詳細は以下のリンクから確認できます：</p>
    <a href="https://hogusy.com/app/bookings/${bookingId}">予約を確認</a>
  `
};
```

---

## ✅ 設定完了チェックリスト

- [ ] Resend アカウント作成
- [ ] API キー取得
- [ ] ドメイン認証（hogusy.com）
- [ ] .dev.vars に API キー追加
- [ ] Cloudflare Pages に API キー設定
- [ ] テストメール送信成功

---

## 🔒 セキュリティのベストプラクティス

1. **API キーは絶対に Git にコミットしない**
   - `.dev.vars` は `.gitignore` に含まれています ✅

2. **本番と開発で別の API キーを使用**
   - Development: `HOGUSY Development`
   - Production: `HOGUSY Production`

3. **不要になった API キーは削除**
   - Resend Dashboard から削除可能

---

## 💰 料金プラン

| プラン | 料金 | メール数/月 |
|--------|------|-------------|
| Free | $0 | 100通 |
| Pro | $20/月 | 50,000通 |
| Enterprise | カスタム | 無制限 |

**推奨**: まずは Free プランでスタート

---

## 📞 トラブルシューティング

### 問題1: メールが届かない

**原因**: スパムフォルダに入っている

**解決方法**:
1. スパムフォルダを確認
2. ドメイン認証を完了する
3. SPF/DKIM レコードを確認

### 問題2: API キーエラー

**原因**: API キーが間違っている

**解決方法**:
1. Resend Dashboard で API キーを確認
2. `re_` で始まることを確認
3. 新しい API キーを作成

---

最終更新日: 2026-01-12
プロジェクト: HOGUSY
