# 🚀 hogusy.com 手動設定クイックガイド

**「4つのステップで完了！約10分で本番稼働。」**

---

## ✅ 自動設定完了項目

- ✅ hogusy.com と www.hogusy.com を Cloudflare Pages に追加
- ✅ DNS レコード作成開始（伝播中: 15分〜2時間）
- ✅ SSL/TLS 証明書発行開始（5〜15分）

---

## 🔧 手動設定 4ステップ

### 📍 ステップ 1: リダイレクト設定（3分）

```
URL: https://dash.cloudflare.com/8ce0b0ed2e7b73648869f337d07e03c7
↓
Rules → Redirect Rules → Create rule
↓
設定:
  Rule name: Redirect www to apex
  When: Hostname equals www.hogusy.com
  Then: Dynamic redirect
    Expression: concat("https://hogusy.com", http.request.uri.path)
    Status: 301
↓
Deploy
```

---

### 🔒 ステップ 2: SSL/TLS 設定（4分）

```
URL: https://dash.cloudflare.com/8ce0b0ed2e7b73648869f337d07e03c7
↓
SSL/TLS → Overview
↓
Encryption mode: Full (strict) ✅
↓
SSL/TLS → Edge Certificates
↓
設定を全て ON:
  ✅ Always Use HTTPS
  ✅ HSTS (Max Age: 6 months, Include subdomains, Preload)
  ✅ Minimum TLS: 1.2
  ✅ Auto HTTPS Rewrites
```

---

### 🔑 ステップ 3: Google OAuth（2分）

```
URL: https://console.cloud.google.com/apis/credentials
↓
OAuth クライアント ID をクリック
↓
承認済みの JavaScript 生成元に追加:
  https://hogusy.com
↓
承認済みのリダイレクト URI に追加:
  https://hogusy.com/auth/callback/google
↓
保存
```

---

### 🗺️ ステップ 4: Google Maps API（1分）

```
URL: https://console.cloud.google.com/apis/credentials
↓
Google Maps API Key をクリック
↓
HTTP リファラーに追加:
  https://hogusy.com/*
↓
保存
```

---

## ⏱️ タイムライン

| 時刻 | イベント |
|------|---------|
| **17:40** | 自動設定完了 ✅ |
| **17:50〜17:55** | SSL証明書発行完了（予定） |
| **17:55〜19:40** | DNS伝播完了（予定） |
| **19:40以降** | https://hogusy.com で本番稼働 🚀 |

---

## 🧪 動作確認（DNS/SSL完了後）

### ブラウザで確認

```
1. https://hogusy.com
   → サイトが表示される ✅
   → 🔒 鍵マークが表示される ✅

2. https://www.hogusy.com
   → https://hogusy.com にリダイレクト ✅

3. http://hogusy.com
   → https://hogusy.com にリダイレクト ✅

4. http://www.hogusy.com
   → https://hogusy.com にリダイレクト ✅
```

### コマンドラインで確認

```bash
# DNS伝播確認
dig hogusy.com
dig www.hogusy.com

# HTTPアクセス確認
curl -I https://hogusy.com
curl -I https://www.hogusy.com | grep -i location
```

### オンラインツールで確認

```
DNS: https://dnschecker.org/#A/hogusy.com
SSL: https://www.ssllabs.com/ssltest/analyze.html?d=hogusy.com
```

---

## 📊 設定完了チェックリスト

```
Cloudflare Dashboard:
  [ ] www → apex リダイレクト作成
  [ ] SSL/TLS: Full (strict)
  [ ] Always Use HTTPS: ON
  [ ] HSTS: ON
  [ ] Minimum TLS: 1.2
  [ ] Auto HTTPS Rewrites: ON

Google Cloud Console:
  [ ] OAuth: https://hogusy.com 追加
  [ ] OAuth: https://hogusy.com/auth/callback/google 追加
  [ ] Maps API: https://hogusy.com/* 追加

動作確認:
  [ ] https://hogusy.com でアクセス可能
  [ ] SSL 証明書が有効
  [ ] www がリダイレクト
  [ ] Google ログインが動作
  [ ] Google Maps が表示
```

---

## 🆘 問題が発生したら

### Q: 設定画面が見つからない

**A**: 上記のURLを直接ブラウザで開いてください。
ゾーンID `8ce0b0ed2e7b73648869f337d07e03c7` が自動的に選択されます。

### Q: DNSが伝播しない

**A**: 最大24時間かかる場合があります。通常は2時間以内に完了します。
確認: https://dnschecker.org/#A/hogusy.com

### Q: SSL証明書エラー

**A**: DNSが伝播するまで待ってください。DNS完了後、5〜15分で証明書が発行されます。

---

## 📞 サポート

設定中に問題が発生したら、スクリーンショットと一緒にお知らせください！

---

**プロジェクト**: HOGUSY  
**ドメイン**: hogusy.com  
**Zone ID**: 8ce0b0ed2e7b73648869f337d07e03c7  
**状態**: 🟡 手動設定待ち

**次**: てつじさんが4ステップを実行 → DNSとSSL完了を待つ → 本番稼働！ 🚀
