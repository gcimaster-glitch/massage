# 🎉 Resend 設定完了レポート

**「メールを、手軽に、確実に。」**

---

## ✅ 完了した設定

### 1. API キーの設定
- **ローカル環境** (.dev.vars): ✅ 完了
  ```
  RESEND_API_KEY=re_AKEPFY69_***
  ```

- **本番環境** (Cloudflare Pages): ✅ 完了
  ```bash
  npx wrangler pages secret put RESEND_API_KEY --project-name hogusy
  ```

### 2. メール送信 API の確認
- **エンドポイント**: `POST /api/notify/email`
- **実装場所**: `/home/user/webapp/src/index.tsx`
- **動作確認**: ✅ API は正常に動作（Resend への接続成功）

---

## 🚨 次に必要な作業

### Resend ドメイン検証（必須）

現在のエラー:
```json
{
  "statusCode": 403,
  "message": "The hogusy.jp domain is not verified. Please, add and verify your domain on https://resend.com/domains"
}
```

**解決方法**: `hogusy.jp` ドメインを Resend で検証する必要があります。

---

## 📋 Resend ドメイン検証の手順

### Step 1: Resend ダッシュボードにアクセス
1. https://resend.com/login にアクセス
2. ログイン後、「Domains」タブをクリック
3. 「Add Domain」をクリック

### Step 2: ドメインを追加
1. ドメイン名に **`hogusy.jp`** を入力
2. Region: **US East (N. Virginia)** を選択（推奨）
3. 「Add」をクリック

### Step 3: DNS レコードを設定
Resend が表示する DNS レコードを Cloudflare に追加します：

#### 必要な DNS レコード（例）:

| Type | Name | Value | Priority |
|------|------|-------|----------|
| MX | @ | mx1.resend.com | 10 |
| MX | @ | mx2.resend.com | 20 |
| TXT | @ | v=spf1 include:_spf.resend.com ~all | - |
| TXT | resend._domainkey | (Resend が提供する DKIM 値) | - |

#### Cloudflare での設定方法:
1. https://dash.cloudflare.com/ にアクセス
2. **hogusy.com** ドメインを選択（Zone ID: `8ce0b0ed2e7b73648869f337d07e03c7`）
3. 左メニューから「DNS」→「Records」を選択
4. 「Add record」をクリックして、Resend の指示に従って各レコードを追加

### Step 4: ドメイン検証の確認
1. DNS レコードの追加後、Resend ダッシュボードに戻る
2. 「Verify Domain」をクリック
3. 検証には **5分〜24時間** かかる場合があります（通常は10分程度）
4. 検証完了後、ステータスが **"Verified"** になります

---

## 🧪 テスト方法

### ドメイン検証前（テスト送信）
開発環境では、Resend の **Sandbox Mode** を使用できます：

```bash
# Resend のデフォルトドメインを使用してテスト
curl -X POST http://localhost:3000/api/notify/email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@example.com",
    "subject": "HOGUSY テストメール",
    "html": "<h1>こんにちは！</h1><p>これはHOGUSYからのテストメールです。</p>"
  }'
```

**注意**: Sandbox Mode では、登録したメールアドレスにのみ送信できます。

### ドメイン検証後（本番送信）
```bash
# hogusy.jp ドメインからメール送信
curl -X POST https://hogusy.pages.dev/api/notify/email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "customer@example.com",
    "subject": "【HOGUSY】ご予約確認",
    "html": "<h1>ご予約ありがとうございます</h1><p>以下の内容でご予約を承りました。</p>"
  }'
```

---

## 📊 Resend 無料プランの制限

| 項目 | 無料プラン |
|------|-----------|
| 月間送信数 | 3,000通 |
| 1日あたりの送信数 | 100通 |
| 送信元ドメイン | 1個 |
| API キー | 無制限 |
| Webhook | 対応 |
| ログ保存期間 | 30日 |

**参考**: 有料プラン（$20/月）では月間50,000通まで送信可能

---

## 🔧 コード実装の詳細

### 現在の実装（src/index.tsx）
```typescript
// Notification Routes (Resend)
app.post('/api/notify/email', async (c) => {
  const { to, subject, html } = await c.req.json()
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${c.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'HOGUSY <noreply@hogusy.jp>',  // ← ドメイン検証後に使用可能
      to,
      subject,
      html,
    }),
  })
  
  const result = await response.json()
  return c.json(result)
})
```

### フロントエンドからの使用例
```typescript
// 予約確認メールの送信
const sendBookingConfirmation = async (booking: Booking) => {
  const response = await fetch('/api/notify/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: booking.userEmail,
      subject: '【HOGUSY】ご予約確認',
      html: `
        <h1>ご予約ありがとうございます</h1>
        <p>以下の内容でご予約を承りました：</p>
        <ul>
          <li>日時: ${booking.datetime}</li>
          <li>セラピスト: ${booking.therapistName}</li>
          <li>料金: ¥${booking.amount.toLocaleString()}</li>
        </ul>
      `
    })
  })
  
  const result = await response.json()
  return result
}
```

---

## 🎯 メール送信シナリオ

HOGUSY で使用するメール送信機能：

### 1. ユーザー向けメール
- ✉️ 予約確認メール
- ✉️ 予約リマインダー（24時間前）
- ✉️ セッション完了メール
- ✉️ レビュー依頼メール
- ✉️ パスワードリセット

### 2. セラピスト向けメール
- ✉️ 新規予約通知
- ✉️ 予約キャンセル通知
- ✉️ 月次レポート
- ✉️ 売上入金通知

### 3. ホスト向けメール
- ✉️ 予約リクエスト通知
- ✉️ レビュー投稿通知
- ✉️ 売上レポート

---

## 🔐 セキュリティ考慮事項

### 1. API キーの保護
- ✅ ローカル: `.dev.vars`（Git 除外済み）
- ✅ 本番: Cloudflare Pages Secrets（環境変数として暗号化保存）
- ❌ **絶対にコードに直接記述しない**

### 2. レート制限
現在の実装では無制限ですが、本番環境では以下の対策を推奨：

```typescript
// レート制限の実装例（将来の改善案）
const rateLimit = new Map<string, { count: number, resetAt: number }>()

app.post('/api/notify/email', async (c) => {
  const clientIP = c.req.header('cf-connecting-ip') || 'unknown'
  
  // レート制限チェック（1時間に10通まで）
  const limit = rateLimit.get(clientIP)
  const now = Date.now()
  
  if (limit && limit.count >= 10 && limit.resetAt > now) {
    return c.json({ error: 'Rate limit exceeded' }, 429)
  }
  
  // メール送信処理...
})
```

---

## 📚 参考資料

### Resend 公式ドキュメント
- **メインドキュメント**: https://resend.com/docs
- **API リファレンス**: https://resend.com/docs/api-reference/emails/send-email
- **ドメイン検証**: https://resend.com/docs/dashboard/domains/introduction
- **React 統合**: https://resend.com/docs/send-with-react

### Cloudflare Pages との統合
- **環境変数**: https://developers.cloudflare.com/pages/platform/functions/bindings/#environment-variables
- **Secrets 管理**: https://developers.cloudflare.com/pages/platform/functions/bindings/#secrets

---

## ✅ 設定チェックリスト

### 完了済み
- [x] Resend アカウント作成
- [x] API キーの取得
- [x] ローカル環境の `.dev.vars` に設定
- [x] 本番環境の Cloudflare Pages Secrets に設定
- [x] メール送信 API の実装確認
- [x] API エンドポイントの動作確認

### 次に実施
- [ ] Resend で `hogusy.jp` ドメインを追加
- [ ] Cloudflare DNS に必要なレコードを追加
- [ ] ドメイン検証を完了
- [ ] 本番環境でメール送信テスト
- [ ] 各種メールテンプレートの作成
- [ ] エラーハンドリングの強化
- [ ] レート制限の実装（オプション）

---

## 🎉 まとめ

### 現在の状態
- **API 実装**: ✅ 完了
- **ローカル設定**: ✅ 完了
- **本番設定**: ✅ 完了
- **ドメイン検証**: ⏳ 待機中

### てつじさんへのメッセージ
Resend の API キー設定が完了しました！🎉

次は **Resend でドメイン検証** を実施してください：
1. https://resend.com/domains にアクセス
2. `hogusy.jp` を追加
3. 表示される DNS レコードを Cloudflare に設定
4. 検証完了を待つ（5分〜24時間）

ドメイン検証が完了すれば、`noreply@hogusy.jp` から本番メールを送信できます！

---

**プロジェクト**: HOGUSY  
**状態**: 🟡 ドメイン検証待ち  
**最終更新**: 2026-01-12  
**次のマイルストーン**: ドメイン検証完了 → メール送信機能の本番稼働
