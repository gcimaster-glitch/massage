# 🔗 Cloudflare Pages Git 連携セットアップ

## 問題：Direct Upload プロジェクトは Git 連携不可

現在の `hogusy` プロジェクトは **Direct Upload** モードで作成されているため、
後から Git 連携に変更することができません。

## ✅ 解決方法：2つの選択肢

### 選択肢 1: 新しいプロジェクトを作成（推奨）

#### メリット
- ✅ Git push で自動デプロイ
- ✅ PR プレビュー環境
- ✅ ロールバックが簡単

#### 手順

**Step 1: Cloudflare Dashboard でプロジェクト作成**
1. https://dash.cloudflare.com/ にアクセス
2. Workers & Pages → **「Create application」** をクリック
3. **「Pages」** タブ → **「Connect to Git」** を選択

**Step 2: GitHub リポジトリを選択**
1. **「Connect GitHub」** をクリック → 認証
2. リポジトリ選択:
   - アカウント: `gcimaster-glitch`
   - リポジトリ: `massage`
3. **「Begin setup」** をクリック

**Step 3: ビルド設定**
```
プロジェクト名: hogusy-git （または hogusy-v2）
本番ブランチ: main
ビルドコマンド: npm run build
ビルド出力ディレクトリ: dist
Root directory: /
```

**Step 4: 環境変数を設定**
新しいプロジェクトに環境変数を追加:
```bash
# Resend API Key
npx wrangler pages secret put RESEND_API_KEY --project-name hogusy-git
# 値を入力: re_AKEPFY69_2PNpV6wAVteKeQEApQkuRpDu
```

**Step 5: カスタムドメインを移行**
1. 新プロジェクト（hogusy-git）に `hogusy.com` を追加
2. 旧プロジェクト（hogusy）から `hogusy.com` を削除

**Step 6: 旧プロジェクトを削除（オプション）**
- 新プロジェクトが正常に動作することを確認後
- 旧 `hogusy` プロジェクトを削除

---

### 選択肢 2: 現在のまま Direct Upload を継続

#### メリット
- 設定変更不要
- 既存の環境変数・カスタムドメインがそのまま

#### デメリット
- ❌ Git push で自動デプロイされない
- ❌ 毎回 `npm run deploy:prod` が必要
- ❌ PR プレビュー環境なし

#### 運用方法
```bash
# コード変更後、毎回実行
cd /home/user/webapp
npm run build
npm run deploy:prod
```

---

## 🎯 推奨：選択肢 1（新プロジェクト作成）

### 理由
1. **開発効率**: Git push だけで自動デプロイ
2. **チーム開発**: PR プレビューで変更確認が容易
3. **安全性**: ロールバックが簡単
4. **長期運用**: 本番運用には Git 連携が必須

### 移行にかかる時間
- プロジェクト作成: 3分
- 環境変数設定: 2分
- カスタムドメイン移行: 2分
- 合計: **約7分**

---

## 📋 移行チェックリスト

### 新プロジェクト作成
- [ ] Cloudflare で新プロジェクト作成（hogusy-git）
- [ ] GitHub リポジトリ接続（gcimaster-glitch/massage）
- [ ] ビルド設定を入力
- [ ] 初回デプロイ成功を確認

### 環境変数の移行
- [ ] RESEND_API_KEY を設定
- [ ] (今後) GOOGLE_MAPS_API_KEY を設定
- [ ] (今後) GOOGLE_CLIENT_ID を設定
- [ ] (今後) GOOGLE_CLIENT_SECRET を設定

### カスタムドメイン移行
- [ ] 新プロジェクトに hogusy.com を追加
- [ ] 新プロジェクトに www.hogusy.com を追加
- [ ] DNS が新プロジェクトを指すことを確認
- [ ] 旧プロジェクトからドメインを削除

### D1 & R2 バインディング
- [ ] D1: hogusy-db-production を接続
- [ ] R2: hogusy-storage を接続

### 動作確認
- [ ] https://hogusy-git.pages.dev にアクセス
- [ ] API エンドポイントが動作
- [ ] カスタムドメインでアクセス可能
- [ ] Git push で自動デプロイ動作確認

### クリーンアップ
- [ ] 旧 hogusy プロジェクトを削除（オプション）

---

## 🚀 私がサポートできること

### 環境変数の設定
新プロジェクトを作成したら、教えてください。
私が以下を実行します：
```bash
# 新プロジェクト名を hogusy-git とした場合
npx wrangler pages secret put RESEND_API_KEY --project-name hogusy-git
```

### package.json の更新
新プロジェクト名に合わせて更新します：
```json
{
  "scripts": {
    "deploy": "npm run build && wrangler pages deploy dist --project-name hogusy-git",
    "deploy:prod": "npm run build && wrangler pages deploy dist --project-name hogusy-git --branch main"
  }
}
```

### wrangler.jsonc の更新
```jsonc
{
  "name": "hogusy-git",
  // 他の設定...
}
```

---

## 💡 まとめ

### てつじさんにお願いしたいこと

1. **どちらの方法を選択するか決定**
   - 選択肢 1: 新プロジェクト作成（推奨・約7分）
   - 選択肢 2: 現状維持（手動デプロイ継続）

2. **選択肢 1 を選ぶ場合**
   - Cloudflare Dashboard で新プロジェクト作成
   - 完了したら教えてください
   - 私が環境変数・設定ファイルを更新します

3. **選択肢 2 を選ぶ場合**
   - 特に作業不要
   - 今後も `npm run deploy:prod` で手動デプロイ

---

どちらの方法を選びますか？
または、他にご質問があればお聞きください！😊
