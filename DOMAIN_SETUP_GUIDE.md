# hogusy.com ドメイン設定ガイド

## 🌐 Cloudflare でドメインを購入

### ステップ 1: Cloudflare Dashboard にアクセス

1. **ブラウザで Cloudflare にログイン**
   - URL: https://dash.cloudflare.com/
   - アカウントでログイン

2. **ドメイン購入ページに移動**
   - 左サイドバーから「Domain Registration」をクリック
   - または直接: https://dash.cloudflare.com/26a3fcdbd2ec761fceb6e0d4138a5e46/domains/register

3. **ドメインを検索**
   - 検索ボックスに「hogusy.com」と入力
   - 「Search」ボタンをクリック

4. **料金と利用可能性を確認**
   - hogusy.com が利用可能か確認
   - 年間料金を確認（通常 $10-15/年）
   - 利用可能なら「Purchase」ボタンをクリック

5. **購入情報を入力**
   - **登録者情報**: 氏名、メールアドレス、住所
   - **支払い方法**: クレジットカード情報を入力
   - **自動更新**: 有効にすることを推奨
   - 「Complete Purchase」をクリック

6. **購入完了を待つ**
   - 数分〜数時間でドメインが有効化されます
   - メールで確認通知が届きます

---

## 📧 購入後の確認

購入が完了したら、以下のコマンドでドメインを確認できます：

```bash
# Cloudflare に登録されているドメインの一覧
npx wrangler zones list

# hogusy.com の詳細情報
npx wrangler zones info hogusy.com
```

---

## 🔧 DNS レコードの自動設定

ドメイン購入後、以下のコマンドで DNS レコードを設定します：

### 1. Cloudflare Pages にカスタムドメインを追加

```bash
cd /home/user/webapp

# apex ドメイン (hogusy.com) を追加
npx wrangler pages domain add hogusy.com --project-name hogusy

# www サブドメイン (www.hogusy.com) を追加
npx wrangler pages domain add www.hogusy.com --project-name hogusy
```

これにより、以下の DNS レコードが自動的に作成されます：
- `hogusy.com` → Cloudflare Pages への CNAME
- `www.hogusy.com` → Cloudflare Pages への CNAME

### 2. DNS レコードの確認

```bash
# DNS レコードを確認
npx wrangler dns list --zone hogusy.com
```

### 3. SSL/TLS 証明書の発行

Cloudflare が自動的に SSL/TLS 証明書を発行します（無料）。
証明書の発行には 5〜15分かかる場合があります。

---

## 🔄 www → apex リダイレクト設定

www.hogusy.com から hogusy.com へのリダイレクトを設定します。

### Cloudflare Dashboard での設定

1. **Cloudflare Dashboard を開く**
   - https://dash.cloudflare.com/
   - `hogusy.com` ゾーンをクリック

2. **Rules → Page Rules に移動**
   - 「Create Page Rule」をクリック

3. **リダイレクトルールを作成**
   ```
   URL pattern: www.hogusy.com/*
   Settings:
     - Forwarding URL: 301 - Permanent Redirect
     - Destination URL: https://hogusy.com/$1
   ```

4. **保存**
   - 「Save and Deploy」をクリック

---

## ✅ 動作確認

### DNS 伝播の確認

DNS の伝播には最大 24〜48時間かかる場合がありますが、通常は数分〜数時間で完了します。

```bash
# DNS の伝播状況を確認
dig hogusy.com
dig www.hogusy.com

# または nslookup
nslookup hogusy.com
nslookup www.hogusy.com
```

### HTTP アクセスの確認

```bash
# apex ドメインをテスト
curl -I https://hogusy.com

# www サブドメインをテスト
curl -I https://www.hogusy.com

# リダイレクトを確認
curl -I https://www.hogusy.com | grep -i location
# 期待される結果: Location: https://hogusy.com
```

---

## 🔐 セキュリティ設定（推奨）

### 1. HTTPS の強制

Cloudflare Dashboard で HTTPS を強制：
1. `hogusy.com` ゾーンを開く
2. SSL/TLS → Edge Certificates
3. 「Always Use HTTPS」を ON に設定

### 2. HSTS の有効化

より強固なセキュリティのため：
1. SSL/TLS → Edge Certificates
2. 「HTTP Strict Transport Security (HSTS)」を有効化
3. 設定:
   - Max Age: 6 months (15768000 seconds)
   - Include subdomains: ON
   - Preload: ON

### 3. 最小 TLS バージョンの設定

1. SSL/TLS → Edge Certificates
2. Minimum TLS Version: TLS 1.2 以上

---

## 📊 Google サービスの更新

ドメイン設定後、Google サービスの設定も更新してください。

### Google OAuth 2.0

1. **Google Cloud Console にアクセス**
   - https://console.cloud.google.com/apis/credentials

2. **OAuth クライアント ID を編集**
   - 既存の OAuth クライアント ID をクリック
   - 「承認済みの JavaScript 生成元」に追加:
     ```
     https://hogusy.com
     ```
   - 「承認済みのリダイレクト URI」に追加:
     ```
     https://hogusy.com/auth/callback/google
     ```
   - 保存

### Google Maps API

API キーの制限を更新：
1. Google Cloud Console → 認証情報
2. Google Maps API Key をクリック
3. 「アプリケーションの制限」→「HTTP リファラー」に追加:
   ```
   https://hogusy.com/*
   ```
4. 保存

---

## 🔄 プロジェクトファイルの更新

### index.html の更新

```html
<!-- メタタグを更新 -->
<meta property="og:url" content="https://hogusy.com" />
<link rel="canonical" href="https://hogusy.com" />
```

### sitemap.xml の作成

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://hogusy.com/</loc>
    <lastmod>2025-01-12</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://hogusy.com/about</loc>
    <lastmod>2025-01-12</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://hogusy.com/strategy</loc>
    <lastmod>2025-01-12</lastmod>
    <priority>0.8</priority>
  </url>
  <!-- 他のページも追加 -->
</urlset>
```

---

## 📈 SEO 設定

### Google Search Console

1. https://search.google.com/search-console にアクセス
2. 「プロパティを追加」をクリック
3. 「ドメイン」を選択
4. `hogusy.com` を入力
5. DNS 認証（Cloudflare が自動対応）
6. sitemap.xml を送信:
   ```
   https://hogusy.com/sitemap.xml
   ```

### robots.txt

```txt
User-agent: *
Allow: /

Sitemap: https://hogusy.com/sitemap.xml
```

---

## 🎯 完了チェックリスト

### Cloudflare
- [ ] hogusy.com ドメインを購入
- [ ] DNS レコードが設定されている
- [ ] SSL/TLS 証明書が発行されている
- [ ] Pages にカスタムドメインを追加
- [ ] www → apex リダイレクトが動作している

### Google サービス
- [ ] OAuth リダイレクト URI を更新
- [ ] Maps API のリファラー制限を更新

### プロジェクト
- [ ] index.html のメタタグを更新
- [ ] sitemap.xml を作成
- [ ] robots.txt を作成
- [ ] 変更をデプロイ

### SEO
- [ ] Google Search Console にプロパティを追加
- [ ] sitemap.xml を送信

---

## 🚀 最終確認

以下の URL でアクセスできることを確認：

1. https://hogusy.com - ✅ メインサイト
2. https://www.hogusy.com - ✅ → https://hogusy.com にリダイレクト
3. http://hogusy.com - ✅ → https://hogusy.com にリダイレクト
4. http://www.hogusy.com - ✅ → https://hogusy.com にリダイレクト

すべてが正常に動作していれば、hogusy.com の設定は完了です！ 🎉

---

最終更新日: 2025-01-12
