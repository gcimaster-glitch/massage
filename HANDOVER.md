# Soothe x CARE CUBE Japan 技術引き継ぎドキュメント (v4.5)

このプロジェクトは、日本市場における「CARE CUBE（ハードウェア）」と「Soothe（AIマッチングプラットフォーム）」の統合を実現するためのプロトタイプ兼BFF（Backend-for-Frontend）基盤です。

## ⚙️ システムアーキテクチャ
- **Frontend**: React 19 / Tailwind CSS / Lucide Icons
- **BFF (Logic)**: Cloudflare Workers (`worker-bff.ts`)
- **Database**: Cloudflare D1 (SQL)
- **AI Engine**: Google Gemini 2.5 Flash / 3 Pro (最新SDK準拠)
  - `Gemini Live API`: 施術中の音声による安全監視 (Sentinel)
  - `Multimodal Analysis`: 免許証・身分証のAI解析 (KYC)
  - `Grounding`: 周辺安全施設（交番・病院）のリアルタイム検索

## 🚀 開発の継続手順（引き継ぎ者へ）

### 1. ローカル環境の復元
1. プロジェクトファイルをダウンロードして解凍。
2. ターミナルを開き、以下のコマンドを実行：
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

### 2. インフラの構築 (Cloudflare)
Cloudflareのアカウントを用意し、以下を実行してください：
```bash
# データベース作成
npx wrangler d1 create soothe_db

# スキーマの適用
npx wrangler d1 execute soothe_db --file=schema.sql

# BFF(Worker)のデプロイ
npx wrangler deploy
```

### 3. GitHub 管理
新しいリポジトリをGitHubで作成した後、以下のスクリプトを実行して全てのコードをアップロードしてください：
```bash
chmod +x push-to-github.sh
./push-to-github.sh [作成したリポジトリのURL]
```

## 🛡️ セキュリティ設計
- **段階的住所開示**: `worker-bff.ts` にて実装済み。予約ステータスが「開始直前」になるまで詳細住所はAPIから返されません。
- **監査ログ (Sentienl Log)**: 全ての書き込み操作（POST/PATCH）は、DB内の `sentinel_logs` テーブルに自動記録されます。

## 💰 ビジネスロジック
`pages/portal/BusinessStrategy.tsx` に詳細を記載しています。
- 日本独自の「事務所（Agency）モデル」に対応した、収益の二次分配ロジックをシステム化しています。

---
© 2025 Soothe Japan Ecosystem.
