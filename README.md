# Soothe x CARE CUBE Japan - Project Handover Guide

日本版 Soothe と CARE CUBE 拠点を統合した、次世代ウェルネス・プラットフォームのフロントエンド・プロトタイプおよびBFF (Backends for Frontends) 構成。

## 🚀 クイックスタート
プロジェクトをクローンした後、以下のコマンドを実行してください。
```bash
chmod +x setup.sh
./setup.sh
```

## 🛠 技術スタック
- **Frontend**: React 19 (Vite), Tailwind CSS, Lucide React
- **AI Integration**: Google Gemini 2.5/3 API (Real-time Audio, Image Analysis, Content Generation)
- **Infrastructure**: Cloudflare Pages (Frontend), Cloudflare Workers (BFF), Cloudflare D1 (SQL Database)
- **Auth/Security**: JWT (jose), Stripe Connect (KYC/Payouts)

## 🔑 環境変数 (.env)
Gemini APIを使用するために、AI Studioから発行されたAPIキーが必要です。
```bash
VITE_GEMINI_API_KEY=your_api_key_here
```

## 📂 ディレクトリ構成
- `/components`: 再利用可能なUIコンポーネント
- `/pages`: ロール（User, Therapist, Host, Office, Admin）別のページ構成
- `/services`: API通信、AIロジック（Gemini）、システム状態管理
- `worker.ts`: Cloudflare Workers 用のBFFロジック

## 🚢 デプロイ手順
### 1. Cloudflare D1 データベースの初期化
```bash
npx wrangler d1 create soothe_db
npx wrangler d1 execute soothe_db --file=schema.sql
```
### 2. Workers (BFF) のデプロイ
```bash
npx wrangler deploy
```
### 3. Frontend (Pages) のデプロイ
```bash
npm run build
npx wrangler pages deploy dist
```

---
© 2025 Soothe Japan Ecosystem. Highly Confidential.
