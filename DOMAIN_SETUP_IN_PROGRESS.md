# 🎉 hogusy.com 設定進行中！

**「自動設定完了！あと少しで本番稼働です。」**

---

## ✅ 完了した自動設定

| 項目 | 状態 | 詳細 |
|------|------|------|
| ドメイン検出 | ✅ 完了 | Zone ID: 8ce0b0ed2e7b73648869f337d07e03c7 |
| hogusy.com 追加 | ✅ 完了 | Cloudflare Pages に紐付け完了 |
| www.hogusy.com 追加 | ✅ 完了 | Cloudflare Pages に紐付け完了 |
| DNS レコード作成 | ⏳ 伝播中 | 15分〜2時間で完了予定 |
| SSL/TLS 証明書 | ⏳ 発行中 | 5〜15分で完了予定 |

---

## 🔧 てつじさんが行う手動設定（約10分）

### ステップ 1: www → apex リダイレクト設定（必須）

**所要時間**: 約3分

1. **Cloudflare Dashboard を開く**
   ```
   https://dash.cloudflare.com/8ce0b0ed2e7b73648869f337d07e03c7
   ```

2. **左サイドバーから「Rules」→「Redirect Rules」を選択**

3. **「Create rule」ボタンをクリック**

4. **以下の設定を入力**
   ```
   Rule name: Redirect www to apex
   ```

5. **「When incoming requests match...」セクション**
   ```
   Field: Hostname
   Operator: equals
   Value: www.hogusy.com
   ```

6. **「Then...」セクション**
   ```
   Type: Dynamic
   Expression: concat("https://hogusy.com", http.request.uri.path)
   Status code: 301 (Permanent Redirect)
   ```

7. **「Deploy」ボタンをクリック**

---

### ステップ 2: SSL/TLS セキュリティ設定（必須）

**所要時間**: 約4分

#### 2-1. SSL/TLS モードの設定

1. **Cloudflare Dashboard → hogusy.com ゾーンを開く**

2. **左サイドバーから「SSL/TLS」を選択**

3. **「Overview」タブ**
   - **Encryption mode**: 「Full (strict)」を選択
   - 保存

#### 2-2. HTTPS 強制と HSTS 設定

1. **「Edge Certificates」タブをクリック**

2. **以下の設定を ON にする**
   - ✅ **Always Use HTTPS**: ON（必須）
   - ✅ **HTTP Strict Transport Security (HSTS)**: Enable をクリック
     - Max Age: **6 months (15768000 seconds)**
     - Include all subdomains: **ON**
     - Preload: **ON**
     - Apply をクリック
   - ✅ **Minimum TLS Version**: **TLS 1.2**
   - ✅ **Automatic HTTPS Rewrites**: ON

3. **設定を保存**

---

### ステップ 3: Google OAuth リダイレクト URI の更新（必須）

**所要時間**: 約2分

1. **Google Cloud Console を開く**
   ```
   https://console.cloud.google.com/apis/credentials
   ```

2. **OAuth クライアント ID をクリック**
   - プロジェクト「Soothe CARE CUBE Japan」を選択
   - 既存の OAuth クライアント ID をクリック

3. **「承認済みの JavaScript 生成元」に追加**
   ```
   https://hogusy.com
   ```

4. **「承認済みのリダイレクト URI」に追加**
   ```
   https://hogusy.com/auth/callback/google
   ```

5. **「保存」ボタンをクリック**

---

### ステップ 4: Google Maps API リファラー制限の更新（必須）

**所要時間**: 約1分

1. **Google Cloud Console → 認証情報**
   ```
   https://console.cloud.google.com/apis/credentials
   ```

2. **「Google Maps API Key」をクリック**

3. **「アプリケーションの制限」セクション**
   - 「HTTP リファラー（ウェブサイト）」が選択されていることを確認

4. **「ウェブサイトの制限」に追加**
   ```
   https://hogusy.com/*
   ```

5. **「保存」ボタンをクリック**

---

## ⏱️ 待機時間の目安

| 項目 | 現在の状態 | 完了予定時刻 |
|------|-----------|-------------|
| DNS 伝播 | ⏳ 進行中 | 15分〜2時間後 |
| SSL 証明書発行 | ⏳ 進行中 | 5〜15分後 |
| www リダイレクト | ⏸️ 未設定 | 設定後すぐ有効 |
| HTTPS 強制 | ⏸️ 未設定 | 設定後すぐ有効 |

---

## 🔍 動作確認（DNSとSSLが完了後）

### 確認項目

以下の URL をブラウザで開いて確認してください：

1. **https://hogusy.com**
   - ✅ メインサイトが表示される
   - ✅ SSL 証明書が有効（鍵マークが表示される）

2. **https://www.hogusy.com**
   - ✅ https://hogusy.com にリダイレクトされる

3. **http://hogusy.com**
   - ✅ https://hogusy.com にリダイレクトされる

4. **http://www.hogusy.com**
   - ✅ https://hogusy.com にリダイレクトされる

5. **主要ページ**
   - https://hogusy.com/about
   - https://hogusy.com/therapists
   - https://hogusy.com/app/map

6. **SEOファイル**
   - https://hogusy.com/sitemap.xml
   - https://hogusy.com/robots.txt

### SSL証明書の確認方法

1. ブラウザで https://hogusy.com を開く
2. アドレスバーの🔒鍵マークをクリック
3. 「接続は保護されています」が表示されることを確認
4. 証明書の詳細を確認:
   - 発行者: Cloudflare Inc ECC CA-3
   - 有効期限: 約90日間

---

## 🌍 DNS 伝播状況の確認方法

### コマンドラインで確認

```bash
# ターミナルで実行
dig hogusy.com
dig www.hogusy.com
```

### オンラインツールで確認

https://dnschecker.org/#A/hogusy.com

世界中のDNSサーバーでの伝播状況を確認できます。
✅ のマークが多くなるほど、伝播が進んでいます。

---

## 📊 現在の状態サマリー

```
🌐 ドメイン情報
   - ドメイン名: hogusy.com
   - Zone ID: 8ce0b0ed2e7b73648869f337d07e03c7
   - ネームサーバー: Cloudflare（自動設定済み）

☁️ Cloudflare Pages
   - プロジェクト: hogusy
   - 本番URL: hogusy.pages.dev（引き続き利用可能）
   - カスタムドメイン: hogusy.com, www.hogusy.com（追加済み）

🔒 SSL/TLS
   - 証明書: 自動発行中（5〜15分）
   - タイプ: Universal SSL（無料）
   - 暗号化: 256-bit

📝 SEO
   - sitemap.xml: デプロイ済み
   - robots.txt: デプロイ済み
   - OGPタグ: 設定済み
   - カノニカルURL: hogusy.com に設定済み

🗄️ データベース
   - D1: hogusy-db-production
   - R2: hogusy-storage
```

---

## 🚨 トラブルシューティング

### 問題1: DNSが2時間以上伝播しない

**解決方法**:
1. Cloudflare Dashboard → DNS → Records で確認
2. CNAME レコードが正しく設定されているか確認
3. Cloudflare サポートに問い合わせ

### 問題2: SSL証明書が発行されない

**解決方法**:
1. DNSが伝播するまで待つ（必須）
2. Cloudflare Dashboard → SSL/TLS → Edge Certificates で状態を確認
3. 「Universal SSL」が「Active」になっているか確認

### 問題3: www.hogusy.com がリダイレクトしない

**解決方法**:
1. Redirect Rule が正しく作成されているか確認
2. Rule が「Active」になっているか確認
3. ブラウザのキャッシュをクリア（Ctrl+Shift+R）

---

## 📞 次のステップ

1. **今すぐ**: てつじさんが手動設定（約10分）
2. **15分〜2時間後**: DNSとSSLが完了
3. **完了後**: 私が動作確認をサポート
4. **完了後**: Google Search Console にサイトマップを送信

---

## ✅ 手動設定チェックリスト

設定が完了したら、以下にチェックを入れてください：

- [ ] ステップ1: www → apex リダイレクト設定
- [ ] ステップ2: SSL/TLS セキュリティ設定
  - [ ] Encryption mode: Full (strict)
  - [ ] Always Use HTTPS: ON
  - [ ] HSTS: Enable
  - [ ] Minimum TLS: 1.2
  - [ ] Auto HTTPS Rewrites: ON
- [ ] ステップ3: Google OAuth URI 更新
- [ ] ステップ4: Google Maps API リファラー更新

---

## 🎊 まとめ

**自動設定は完了しました！** 🎉

あとは、てつじさんが上記の4つのステップ（約10分）を実行するだけです。

設定が完了したら、DNSとSSLが伝播するまで15分〜2時間待ちます。
その後、https://hogusy.com でサイトが表示されます！

何か問題があれば、いつでもお知らせください！ 🚀

---

**現在時刻**: 2026-01-12 17:40  
**プロジェクト**: HOGUSY（ほぐす、を、もっと身近に。）  
**状態**: 🟡 手動設定待ち（自動設定は完了）
