# 🌐 hogusy.com ドメイン設定 - 準備完了

**「プロのドメインで、世界へ。」**

---

## ✅ 完了した準備作業

| 項目 | 状態 | 詳細 |
|------|------|------|
| SEO最適化 | ✅ 完了 | sitemap.xml, robots.txt, OGP |
| カノニカルURL | ✅ 完了 | hogusy.com に設定済み |
| OGP画像 | ⏸️ 準備中 | public/og-image.png を作成予定 |
| 自動設定スクリプト | ✅ 完了 | setup-domain.sh |
| ドキュメント | ✅ 完了 | 購入・設定ガイド完備 |

---

## 📋 てつじさんの次のステップ

### Step 1: hogusy.com を購入

**推奨**: Cloudflare Registrar で購入（約 $10-15/年）

1. **Cloudflare Dashboard にアクセス**
   ```
   https://dash.cloudflare.com/26a3fcdbd2ec761fceb6e0d4138a5e46/domains/register
   ```

2. **ドメインを検索**
   - 検索ボックスに `hogusy.com` を入力
   - 「Search」をクリック

3. **購入手続き**
   - 利用可能なら「Purchase」をクリック
   - 登録者情報を入力（名前、メール、住所、電話）
   - 支払い情報を入力
   - 「Complete Purchase」をクリック

4. **購入完了を待つ**
   - 通常 5〜15分で完了
   - メールで確認通知が届く

---

### Step 2: 購入後に私に連絡

てつじさんが hogusy.com の購入を完了したら、私にお知らせください。

**私が以下を自動的に実行します：**

```bash
cd /home/user/webapp
./setup-domain.sh
```

このスクリプトが自動的に以下を実行：
- ✅ ドメインの検出・検証
- ✅ Cloudflare Pages へのカスタムドメイン追加
- ✅ DNS レコードの確認
- ✅ SSL/TLS 証明書の状態確認
- ✅ DNS 伝播の確認
- ✅ HTTP アクセステスト

---

### Step 3: 手動設定（Web UIが必要）

以下は Cloudflare Dashboard で手動設定が必要です：

#### 3-1. www → apex リダイレクト

1. https://dash.cloudflare.com/ にアクセス
2. `hogusy.com` ゾーンをクリック
3. **Rules** → **Redirect Rules** → **Create Rule**
4. 設定:
   ```
   Rule name: Redirect www to apex
   
   When incoming requests match:
     Field: Hostname
     Operator: equals
     Value: www.hogusy.com
   
   Then:
     Type: Dynamic
     Expression: concat("https://hogusy.com", http.request.uri.path)
     Status code: 301
   ```
5. **Deploy** をクリック

#### 3-2. SSL/TLS セキュリティ設定

1. `hogusy.com` ゾーンを開く
2. **SSL/TLS** → **Overview**
   - Encryption mode: **Full (strict)**
3. **SSL/TLS** → **Edge Certificates**
   - Always Use HTTPS: **ON**
   - HTTP Strict Transport Security (HSTS): **Enable**
     - Max Age: 6 months
     - Include subdomains: ON
     - Preload: ON
   - Minimum TLS Version: **TLS 1.2**
   - Automatic HTTPS Rewrites: **ON**

---

### Step 4: Google サービスの更新

#### 4-1. Google OAuth 2.0

1. https://console.cloud.google.com/apis/credentials
2. OAuth クライアント ID を編集
3. **承認済みの JavaScript 生成元** に追加:
   ```
   https://hogusy.com
   ```
4. **承認済みのリダイレクト URI** に追加:
   ```
   https://hogusy.com/auth/callback/google
   ```
5. 保存

#### 4-2. Google Maps API

1. https://console.cloud.google.com/apis/credentials
2. API Key を編集
3. **HTTP リファラー** に追加:
   ```
   https://hogusy.com/*
   ```
4. 保存

---

### Step 5: 動作確認

以下の URL でアクセスできることを確認：

| URL | 期待される動作 |
|-----|--------------|
| https://hogusy.com | ✅ メインサイトが表示される |
| https://www.hogusy.com | ✅ → https://hogusy.com にリダイレクト |
| http://hogusy.com | ✅ → https://hogusy.com にリダイレクト |
| http://www.hogusy.com | ✅ → https://hogusy.com にリダイレクト |

**確認方法:**
```bash
# ブラウザで確認
# または
curl -I https://hogusy.com
curl -I https://www.hogusy.com | grep -i location
```

---

## 📊 現在の状態

### Cloudflare Pages
- ✅ プロジェクト名: hogusy
- ✅ 本番URL: https://hogusy.pages.dev
- ✅ デプロイ: 最新版デプロイ済み

### SEO設定
- ✅ sitemap.xml: https://hogusy.pages.dev/sitemap.xml
- ✅ robots.txt: https://hogusy.pages.dev/robots.txt
- ✅ OGPタグ: 設定済み
- ✅ カノニカルURL: hogusy.com に設定済み

### データベース
- ✅ D1: hogusy-db-production (a52752b1-c49f-4fdd-b3e1-6a5be501cb72)
- ✅ R2: hogusy-storage

### GitHub
- ✅ リポジトリ: https://github.com/gcimaster-glitch/massage
- ✅ 最新コミット: プッシュ済み

---

## 📁 作成されたファイル

| ファイル | 説明 |
|---------|------|
| `DOMAIN_PURCHASE_GUIDE.md` | hogusy.com 購入・設定の完全ガイド |
| `DOMAIN_SETUP_GUIDE.md` | ドメイン設定の技術詳細 |
| `setup-domain.sh` | ドメイン自動設定スクリプト（実行可能） |
| `public/sitemap.xml` | SEO用サイトマップ |
| `public/robots.txt` | クローラー制御ファイル |
| `index.html` | OGP・カノニカルURL追加済み |

---

## ⏱️ タイムライン予測

### ドメイン購入後

| 時間 | イベント |
|------|---------|
| 即座 | ドメインが Cloudflare アカウントに追加される |
| 5〜15分 | SSL/TLS 証明書が発行される |
| 15分〜2時間 | DNS が世界中に伝播する |
| 2〜24時間 | 完全な DNS 伝播（99%は2時間以内） |

### Google サービス更新後

| 時間 | イベント |
|------|---------|
| 即座 | OAuth リダイレクトが有効になる |
| 即座 | Maps API リファラー制限が有効になる |

---

## 🔒 セキュリティチェックリスト

購入・設定後に確認：

- [ ] SSL/TLS 証明書が有効（鍵マーク）
- [ ] HTTPS 強制が有効（http:// が https:// にリダイレクト）
- [ ] HSTS が有効
- [ ] TLS 1.2 以上のみ許可
- [ ] www → apex リダイレクトが動作
- [ ] OAuth リダイレクト URI が更新されている
- [ ] Maps API リファラー制限が更新されている

---

## 💡 よくある質問

### Q: hogusy.com が取得できない場合は？

**A**: 代替ドメインを検討してください：
- hogusy.com（日本向けに最適）
- hogusy.co
- hogusy.io
- gethogusy.com

### Q: DNS の伝播にどれくらいかかりますか？

**A**: 通常 15分〜2時間、最大24時間です。
確認: https://dnschecker.org/#A/hogusy.com

### Q: SSL 証明書はいつ発行されますか？

**A**: ドメイン追加後 5〜15分で自動発行されます。
Cloudflare Dashboard → SSL/TLS → Edge Certificates で確認できます。

### Q: 旧URL (hogusy.pages.dev) はどうなりますか？

**A**: 引き続きアクセス可能ですが、SEO的には hogusy.com を優先します。
hogusy.pages.dev からのリダイレクトは不要です（Googleが自動的に処理）。

---

## 🚀 準備完了！

てつじさん、hogusy.com の購入準備が整いました！

**次のステップ:**
1. Cloudflare Dashboard で hogusy.com を購入
2. 購入完了したら私に連絡
3. 私が setup-domain.sh を実行して自動設定
4. てつじさんが手動設定（リダイレクト・SSL・Google）
5. 動作確認

何か質問があれば、いつでもお知らせください！ 🎉

---

最終更新日: 2025-01-12
プロジェクト: HOGUSY（ほぐす、を、もっと身近に。）
