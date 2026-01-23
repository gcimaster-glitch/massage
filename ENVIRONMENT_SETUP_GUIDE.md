# 環境変数とバインディング設定確認ガイド

## ✅ 安全性確認：GitHub連携でも既存機能は動作します

### 理由

1. **D1 Database & R2 Storage**
   - `wrangler.jsonc` に設定されているため、GitHub連携後も**自動的に継承**されます
   - 既存のデータベースとストレージはそのまま使用可能
   - 設定変更は不要

2. **環境変数（Secrets）**
   - 現在、Direct Upload（手動デプロイ）で動作している
   - GitHub連携時、**既存の環境変数設定も継承される**可能性が高い
   - ただし、念のため設定確認と追加設定が推奨

---

## 🔍 事前確認：現在の設定状況

### Cloudflare Dashboardで確認する手順

#### 1. 環境変数の確認

```
Cloudflare Dashboard
→ Workers & Pages
→ hogusy
→ Settings
→ Environment variables
```

**確認すべき項目：**
- STRIPE_SECRET
- RESEND_API_KEY
- GEMINI_API_KEY
- JWT_SECRET
- GOOGLE_MAPS_API_KEY
- GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
- その他SNS認証用変数

#### 2. バインディングの確認

```
Cloudflare Dashboard
→ Workers & Pages
→ hogusy
→ Settings
→ Functions
→ Bindings
```

**確認すべき項目：**
- D1 Database: `DB` → `hogusy-db-production`
- R2 Bucket: `STORAGE` → `hogusy-storage`

---

## 🔧 GitHub連携時の設定手順

### オプションA：既存の環境変数が継承される場合

GitHub連携設定後、**何も追加設定せずに1回デプロイしてみる**

✅ **デプロイ成功 & 機能が正常動作**
→ すべての設定が継承されています。追加作業不要！

❌ **デプロイ失敗 or 機能エラー**
→ オプションBに進む

### オプションB：環境変数を再設定する場合

#### 手順1：現在の環境変数をメモ

Direct Upload時代の設定を確認：
```
Settings → Environment variables
```

すべての変数名と値をメモしておく

#### 手順2：GitHub連携設定

CLOUDFLARE_GITHUB_SETUP.md のガイドに従って設定

#### 手順3：環境変数を追加

```
Settings → Environment variables → Add variable
```

**各変数を追加：**

| Variable name | Value | Environment |
|--------------|-------|-------------|
| STRIPE_SECRET | sk_live_xxx... または sk_test_xxx... | Production |
| RESEND_API_KEY | re_xxx... | Production |
| GEMINI_API_KEY | AIzaSyXXX... | Production |
| JWT_SECRET | (ランダムな長い文字列) | Production |
| GOOGLE_MAPS_API_KEY | AIzaSyXXX... | Production |

※ 必要に応じてSNS認証用変数も追加

#### 手順4：Functions バインディング確認

```
Settings → Functions → Bindings
```

**D1 Database:**
- Variable name: `DB`
- D1 database: `hogusy-db-production`

**R2 Bucket:**
- Variable name: `STORAGE`
- R2 bucket: `hogusy-storage`

※ 通常、wrangler.jsonc の設定が自動的に適用されるため、手動設定は不要

#### 手順5：再デプロイ

Deployments → "Retry deployment" または git push

---

## 🎯 推奨手順（段階的アプローチ）

### ステップ1：現状確認
1. Cloudflare Dashboardで現在の環境変数を確認
2. スクリーンショットを撮影しておく（念のため）

### ステップ2：GitHub連携設定
1. CLOUDFLARE_GITHUB_SETUP.md の手順で設定
2. **最初のビルドを実行**

### ステップ3：動作確認
1. デプロイが成功したか確認
2. 本番URLにアクセス: https://hogusy.com
3. 以下の機能をテスト：
   - ✅ ログイン機能（JWT認証）
   - ✅ 予約機能（D1 Database）
   - ✅ 画像表示（R2 Storage）
   - ✅ 地図表示（Google Maps API）
   - ✅ 決済機能（Stripe）※テストモード推奨
   - ✅ メール送信（Resend）

### ステップ4：問題があれば対応
- エラーが出た場合、Deployments → ビルドログを確認
- 足りない環境変数があれば追加
- 再デプロイして確認

---

## 🔐 セキュリティ上の注意

### 環境変数の扱い

1. **本番環境の値を使う**
   - Production環境には本番用のAPIキーを設定
   - テスト用のキーと混同しない

2. **Preview環境の設定**
   - Pull Request用のPreview環境には、テスト用のAPIキーを設定可能
   - Environment を "Preview" に設定

3. **値の確認**
   - 設定後、値の最初と最後の数文字を確認
   - 間違った値を設定していないかチェック

---

## 📊 移行のリスク評価

### リスク：低

**理由：**
- wrangler.jsonc の設定が自動的に適用される
- Cloudflare Pages は同じプロジェクト内での設定変更
- Direct Upload → GitHub連携は**デプロイ方法の変更のみ**
- データベースやストレージのデータには影響しない

### 万が一の対策

1. **ロールバック可能**
   - Cloudflare Dashboard → Deployments
   - 過去のデプロイバージョンに即座に戻せる

2. **手動デプロイも継続可能**
   - GitHub連携設定後も、`wrangler pages deploy` による手動デプロイは可能
   - 緊急時は手動デプロイに切り替えられる

3. **データは保護される**
   - D1 Databaseのデータ：デプロイ方法に関係なく保持
   - R2 Storageの画像：デプロイ方法に関係なく保持

---

## ✅ 結論

**GitHub連携は安全に実施できます。**

- D1 Database、R2 Storageは自動的に継承される
- 環境変数は確認と追加設定が必要だが、簡単
- デプロイ失敗時もロールバック可能
- 既存データへの影響はゼロ

**推奨：**
1. まず現在の設定を確認
2. GitHub連携を設定
3. 1回デプロイして動作確認
4. 問題があれば環境変数を追加

**最悪のケース：**
- デプロイ失敗 → ロールバック or 手動デプロイに戻す
- 機能エラー → 環境変数を追加して再デプロイ

いずれも**数分で修正可能**です。

---

## 📞 サポート

設定中に問題が発生した場合：
1. Cloudflare Dashboard → Deployments → ビルドログを確認
2. エラーメッセージを共有
3. 環境変数の設定状況をスクリーンショットで共有

すぐに対応できます！
