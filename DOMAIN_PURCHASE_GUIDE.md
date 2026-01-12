# 🌐 hogusy.com ドメイン購入・設定手順書

## 📍 現在の状況

- ✅ Cloudflare アカウント: アクティブ
- ✅ API トークン: 設定済み
- ✅ Pages プロジェクト: hogusy（デプロイ済み）
- ❌ hogusy.com ドメイン: **未購入**

---

## 🛒 Step 1: hogusy.com を Cloudflare で購入

### オプション A: Cloudflare Registrar で購入（推奨）

**料金**: 約 $10-15/年（卸売価格）

1. **Cloudflare Dashboard にアクセス**
   ```
   https://dash.cloudflare.com/26a3fcdbd2ec761fceb6e0d4138a5e46/domains/register
   ```

2. **ドメインを検索**
   - 検索ボックスに `hogusy.com` を入力
   - 「Search」をクリック

3. **購入手続き**
   - 利用可能なら「Purchase」をクリック
   - 登録者情報を入力（WHOIS情報）
     - 名前: てつじ様の本名
     - メールアドレス
     - 住所
     - 電話番号
   - 支払い情報を入力
   - 「Complete Purchase」をクリック

4. **購入完了を待つ**
   - 通常 5〜15分で完了
   - メールで確認通知が届く

### オプション B: 外部レジストラで購入（非推奨）

hogusy.com を他のレジストラ（お名前.com、GoDaddy など）で購入した場合：

1. ドメインを購入
2. ネームサーバーを Cloudflare に変更
   ```
   hera.ns.cloudflare.com
   memphis.ns.cloudflare.com
   ```
3. Cloudflare Dashboard でゾーンを追加
   - https://dash.cloudflare.com/26a3fcdbd2ec761fceb6e0d4138a5e46/add-site

---

## 🔧 Step 2: ドメイン購入後の自動設定（この部分は私が実行します）

**てつじさんがドメインを購入したら、以下のコマンドを実行します：**

### 2-1. ドメインの確認

```bash
# Cloudflare API でドメインを確認
curl -s -X GET "https://api.cloudflare.com/client/v4/zones" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  | python3 -c "import sys, json; zones = json.load(sys.stdin)['result']; print('\\n'.join([f\"{z['name']} ({z['id']})\" for z in zones if 'hogusy' in z['name']]))"
```

### 2-2. Cloudflare Pages にカスタムドメインを追加

```bash
cd /home/user/webapp

# apex ドメイン (hogusy.com) を追加
npx wrangler pages domain add hogusy.com --project-name hogusy

# www サブドメイン (www.hogusy.com) を追加
npx wrangler pages domain add www.hogusy.com --project-name hogusy
```

これにより、以下が自動的に設定されます：
- DNS レコード（CNAME）の作成
- SSL/TLS 証明書の発行（無料）
- ドメインの検証

### 2-3. DNS レコードの確認

```bash
# Cloudflare API で DNS レコードを確認
ZONE_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  | python3 -c "import sys, json; z = [x for x in json.load(sys.stdin)['result'] if x['name']=='hogusy.com']; print(z[0]['id'] if z else '')")

curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  | python3 -m json.tool
```

### 2-4. SSL/TLS 証明書の状態確認

```bash
# SSL 証明書の発行状況を確認
curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/ssl/certificate_packs" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  | python3 -m json.tool | grep -A 5 "status"
```

---

## 🔄 Step 3: リダイレクト設定（www → apex）

### Cloudflare Dashboard での設定

1. **Cloudflare Dashboard を開く**
   ```
   https://dash.cloudflare.com/26a3fcdbd2ec761fceb6e0d4138a5e46
   ```

2. **hogusy.com ゾーンをクリック**

3. **Rules → Redirect Rules に移動**
   - 「Create Rule」をクリック

4. **リダイレクトルールを作成**
   ```
   Rule name: Redirect www to apex
   
   When incoming requests match:
     - Field: Hostname
     - Operator: equals
     - Value: www.hogusy.com
   
   Then:
     - Type: Dynamic
     - Expression: concat("https://hogusy.com", http.request.uri.path)
     - Status code: 301
   ```

5. **保存**
   - 「Deploy」ボタンをクリック

### または Bulk Redirects を使用

```bash
# Cloudflare API で Bulk Redirect を作成
ZONE_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  | python3 -c "import sys, json; z = [x for x in json.load(sys.stdin)['result'] if x['name']=='hogusy.com']; print(z[0]['id'] if z else '')")

curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/pagerules" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{
    "targets": [
      {
        "target": "url",
        "constraint": {
          "operator": "matches",
          "value": "www.hogusy.com/*"
        }
      }
    ],
    "actions": [
      {
        "id": "forwarding_url",
        "value": {
          "url": "https://hogusy.com/$1",
          "status_code": 301
        }
      }
    ],
    "status": "active"
  }'
```

---

## 📝 Step 4: プロジェクトファイルの更新

### 4-1. index.html にカノニカル URL を追加

```bash
cd /home/user/webapp
```

index.html に以下を追加：
```html
<link rel="canonical" href="https://hogusy.com" />
<meta property="og:url" content="https://hogusy.com" />
```

### 4-2. sitemap.xml を作成

```bash
cat > public/sitemap.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://hogusy.com/</loc>
    <lastmod>2025-01-12</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://hogusy.com/about</loc>
    <lastmod>2025-01-12</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://hogusy.com/strategy</loc>
    <lastmod>2025-01-12</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://hogusy.com/therapists</loc>
    <lastmod>2025-01-12</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://hogusy.com/fee</loc>
    <lastmod>2025-01-12</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://hogusy.com/recruit</loc>
    <lastmod>2025-01-12</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://hogusy.com/news</loc>
    <lastmod>2025-01-12</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://hogusy.com/legal</loc>
    <lastmod>2025-01-12</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>
EOF
```

### 4-3. robots.txt を作成

```bash
cat > public/robots.txt << 'EOF'
User-agent: *
Allow: /

# Disallow admin and auth pages
Disallow: /admin
Disallow: /auth

Sitemap: https://hogusy.com/sitemap.xml
EOF
```

### 4-4. ビルド・デプロイ

```bash
npm run build
npm run deploy:prod
```

---

## 🔐 Step 5: セキュリティ設定

### Cloudflare Dashboard での設定

1. **SSL/TLS 設定**
   - SSL/TLS → Overview
   - Encryption mode: **Full (strict)** を選択

2. **Always Use HTTPS**
   - SSL/TLS → Edge Certificates
   - Always Use HTTPS: **ON**

3. **HSTS 有効化**
   - SSL/TLS → Edge Certificates
   - HTTP Strict Transport Security (HSTS): **Enable**
   - 設定:
     - Max Age: 6 months (15768000)
     - Include subdomains: ON
     - Preload: ON

4. **Minimum TLS Version**
   - SSL/TLS → Edge Certificates
   - Minimum TLS Version: **TLS 1.2**

5. **Automatic HTTPS Rewrites**
   - SSL/TLS → Edge Certificates
   - Automatic HTTPS Rewrites: **ON**

---

## 🌐 Step 6: Google サービスの更新

### Google OAuth 2.0

1. **Google Cloud Console にアクセス**
   ```
   https://console.cloud.google.com/apis/credentials
   ```

2. **OAuth クライアント ID を編集**
   - 既存の OAuth クライアント ID をクリック
   
   **承認済みの JavaScript 生成元に追加:**
   ```
   https://hogusy.com
   ```
   
   **承認済みのリダイレクト URI に追加:**
   ```
   https://hogusy.com/auth/callback/google
   ```
   
   - 保存

### Google Maps API

1. **Google Cloud Console → 認証情報**

2. **Google Maps API Key をクリック**

3. **アプリケーションの制限 → HTTP リファラーに追加:**
   ```
   https://hogusy.com/*
   ```

4. **保存**

---

## ✅ Step 7: 動作確認

### DNS 伝播の確認

```bash
# DNS の確認
dig hogusy.com
dig www.hogusy.com

# または
nslookup hogusy.com
nslookup www.hogusy.com
```

### HTTP アクセスの確認

```bash
# apex ドメイン
curl -I https://hogusy.com

# www サブドメイン（リダイレクト確認）
curl -I https://www.hogusy.com

# HTTP → HTTPS リダイレクト確認
curl -I http://hogusy.com
```

### ブラウザでの確認

1. https://hogusy.com にアクセス
2. SSL 証明書を確認（鍵マークをクリック）
3. www.hogusy.com → hogusy.com へのリダイレクトを確認

---

## 📊 Step 8: SEO 設定

### Google Search Console

1. **Search Console にアクセス**
   ```
   https://search.google.com/search-console
   ```

2. **プロパティを追加**
   - 「ドメイン」を選択
   - `hogusy.com` を入力

3. **DNS 認証**
   - TXT レコードが表示される
   - Cloudflare Dashboard の DNS 設定に追加

4. **sitemap.xml を送信**
   - サイドバー → サイトマップ
   - `https://hogusy.com/sitemap.xml` を入力
   - 送信

### Google Analytics 4（オプション）

```html
<!-- index.html の <head> に追加 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## 🎯 完了チェックリスト

### ドメイン購入
- [ ] hogusy.com を Cloudflare Registrar で購入
- [ ] 購入完了メールを受信
- [ ] Cloudflare Dashboard でドメインを確認

### DNS 設定
- [ ] hogusy.com の DNS レコードが作成されている
- [ ] www.hogusy.com の DNS レコードが作成されている
- [ ] DNS の伝播が完了（dig/nslookup で確認）

### SSL/TLS
- [ ] SSL 証明書が発行されている
- [ ] https://hogusy.com でアクセスできる
- [ ] Always Use HTTPS が有効
- [ ] HSTS が有効

### リダイレクト
- [ ] www.hogusy.com → hogusy.com へリダイレクト
- [ ] http:// → https:// へリダイレクト

### プロジェクト
- [ ] sitemap.xml を作成
- [ ] robots.txt を作成
- [ ] index.html にカノニカル URL を追加
- [ ] ビルド・デプロイ完了

### Google サービス
- [ ] OAuth リダイレクト URI を更新
- [ ] Maps API のリファラー制限を更新
- [ ] Google Search Console にプロパティを追加
- [ ] sitemap.xml を送信

### 動作確認
- [ ] https://hogusy.com でサイトが表示される
- [ ] SSL 証明書が正常
- [ ] Google ログインが動作する
- [ ] Google Maps が表示される

---

## 🚨 トラブルシューティング

### 問題1: ドメインが購入できない

**原因**: ドメインが既に取得されている、またはプレミアムドメイン

**解決方法**:
1. WHOIS で所有者を確認: https://www.whois.com/whois/hogusy.com
2. 代替ドメインを検討:
   - hogusy.jp
   - hogusy.co
   - hogusy.io
   - gethogusy.com

### 問題2: DNS が伝播しない

**原因**: DNS の伝播には時間がかかる（最大 24〜48時間）

**解決方法**:
1. 待つ（通常は数分〜数時間で完了）
2. DNS 伝播状況を確認: https://dnschecker.org/#A/hogusy.com
3. Cloudflare Dashboard で DNS レコードを確認

### 問題3: SSL 証明書のエラー

**原因**: 証明書の発行には数分かかる

**解決方法**:
1. 5〜15分待つ
2. Cloudflare Dashboard → SSL/TLS → Edge Certificates で状態を確認
3. 「Universal SSL」が「Active」になっているか確認

### 問題4: Pages にドメインを追加できない

**原因**: ドメインが Cloudflare に登録されていない

**解決方法**:
1. Cloudflare API でゾーンを確認
2. ドメイン購入が完了しているか確認
3. ネームサーバーが Cloudflare に向いているか確認

---

## 📞 サポート

購入・設定中に問題が発生した場合は、以下の情報を提供してください：
- ドメインの購入状況
- エラーメッセージ（あれば）
- Cloudflare Dashboard のスクリーンショット

---

**次のアクション:**

てつじさんが hogusy.com の購入を完了したら、お知らせください。
その後、私がすぐにドメインの設定を進めます！ 🚀

---

最終更新日: 2025-01-12
プロジェクト: HOGUSY（ほぐす、を、もっと身近に。）
