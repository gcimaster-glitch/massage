# HOGUSY 統合方針・実装設計書

**作成日:** 2026年3月16日
**作成者:** Manus AI システムアーキテクト

## 1. 概要

本ドキュメントは、「HOGUSY 事業資料・システム統合方針書」に基づき、現行システムを改修するための具体的な実装設計を定義します。修正は「ロール定義」「料金体系」「収益分配」の3つの主要領域に焦点を当てます。

## 2. 実装タスク一覧とGitHub Issue計画

本改修は以下のタスクに分割して実施します。各タスクはGitHubのIssueとして管理します。

| Issue | タスク内容 | 担当 | 見積 | 優先度 |
| :--- | :--- | :--- | :--- | :--- |
| `#101` | **DB:** `plans` `revenue_share_rules`テーブル追加 | DB Admin | 2h | **Highest** |
| `#102` | **Backend:** `UserRole`型定義の修正 | API Team | 3h | **Highest** |
| `#103` | **Backend:** 収益分配エンジン(`revenue-engine`)の改修 | API Team | 8h | **Highest** |
| `#104` | **Frontend:** UI上の役割・サービス名称の統一 | UI Team | 4h | High |
| `#105` | **Admin:** 「料金プラン管理」画面の実装 | Admin Team | 6h | High |
| `#106` | **Admin:** 「収益分配ルール」管理画面の実装 | Admin Team | 6h | High |
| `#107` | **Test:** E2Eテストシナリオの作成と実施 | QA Team | 10h | Medium |

## 3. DBスキーマ変更 (`/migrations/001_integration_update.sql`)

```sql
-- Migration: 001_integration_update.sql
-- Description: 事業資料との統合に伴うスキーマ変更

-- 1. UserRole型の更新（手動での型定義ファイル修正が必要）
--    src/types.ts の UserRole を `USER | THERAPIST | THERAPIST_OFFICE | HOST | ADMIN | AFFILIATE` に変更

-- 2. plans テーブルの新設
CREATE TABLE plans (
    id TEXT PRIMARY KEY,
    target_role TEXT NOT NULL, -- THERAPIST_OFFICE, HOST, THERAPIST
    plan_name TEXT NOT NULL,
    initial_fee INTEGER DEFAULT 0,
    monthly_fee INTEGER DEFAULT 0,
    description TEXT,
    is_active INTEGER DEFAULT 1, -- 0: false, 1: true
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. revenue_share_rules テーブルの新設
CREATE TABLE revenue_share_rules (
    id TEXT PRIMARY KEY,
    priority INTEGER NOT NULL DEFAULT 100,
    therapist_rate REAL NOT NULL,
    office_rate REAL NOT NULL,
    host_rate REAL NOT NULL,
    platform_fee_rate REAL NOT NULL,
    marketing_rate REAL NOT NULL,
    conditions TEXT, -- JSON形式で適用条件を格納 (e.g. {"site_type": "CARE_CUBE"})
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. デフォルトデータの投入
INSERT INTO revenue_share_rules (id, priority, therapist_rate, office_rate, host_rate, platform_fee_rate, marketing_rate, conditions, is_active)
VALUES ('default_rule', 100, 0.40, 0.25, 0.20, 0.10, 0.05, '{}', 1);

INSERT INTO plans (id, target_role, plan_name, initial_fee, monthly_fee, description, is_active)
VALUES
('office_virtual', 'THERAPIST_OFFICE', 'バーチャル店舗', 75000, 15000, '実店舗なし。100名まで', 1),
('office_real', 'THERAPIST_OFFICE', 'リアル店舗', 150000, 25000, '実店舗あり。100名まで', 1),
('host_cube', 'HOST', 'CARE CUBE 1ブース導入', 250000, 11000, 'CARE CUBEブース本体と運営サポート', 1),
('therapist_personal', 'THERAPIST', '個人利用', 0, 500, 'プラットフォーム利用料', 1);

```

## 4. バックエンド改修詳細

### 4.1. `src/types.ts` (Issue #102)

`UserRole` の型定義を以下に修正します。

```typescript
// 修正前
export type UserRole =
  | 'USER'
  | 'THERAPIST'
  | 'OFFICE' // <- これを修正
  | 'HOST'
  | 'ADMIN'
  | 'AFFILIATE';

// 修正後
export type UserRole =
  | 'USER'
  | 'THERAPIST'
  | 'THERAPIST_OFFICE' // <- 修正
  | 'HOST'
  | 'ADMIN'
  | 'AFFILIATE';
```

### 4.2. `src/revenue-engine-routes.ts` (Issue #103)

決済処理の中核である収益分配ロジックを全面的に改修します。

```typescript
// ... (既存のコード)

// 修正対象：予約完了時の収益分配処理
app.post('/process-payment', async (c) => {
  // ... (支払い処理)

  // 1. 適用ルールの動的取得
  const bookingDetails = await getBookingDetails(bookingId); // 予約詳細を取得
  const rule = await c.env.DB.prepare(
    `SELECT * FROM revenue_share_rules WHERE is_active = 1 ORDER BY priority ASC`
  ).all();

  let applicableRule = rule.results.find(r => checkConditions(r.conditions, bookingDetails));
  if (!applicableRule) {
      applicableRule = rule.results.find(r => r.id === 'default_rule');
  }

  // 2. 新しいルールに基づいて報酬を計算
  const grossAmount = bookingDetails.price;
  const therapistAmount = Math.floor(grossAmount * applicableRule.therapist_rate);
  const officeAmount = Math.floor(grossAmount * applicableRule.office_rate);
  const hostAmount = Math.floor(grossAmount * applicableRule.host_rate);
  const platformFee = Math.floor(grossAmount * applicableRule.platform_fee_rate);
  const marketingFee = grossAmount - therapistAmount - officeAmount - hostAmount - platformFee;

  // 3. 各ステークホルダーへの送金処理（Stripe Connect）
  // ... (Stripe Transferのロジック)
});

function checkConditions(conditions, bookingDetails) {
  const parsedConditions = JSON.parse(conditions);
  // ここで bookingDetails と parsedConditions を比較してルールが適用可能か判定するロジックを実装
  return true; // or false
}
```

## 5. フロントエンド改修詳細 (Issue #104)

UI上のテキストを資料の用語に統一します。`grep`コマンドで対象ファイルを特定し、一括置換を行います。

- 「施設ホスト」→「拠点ホスト」
- 「セラピスト事務所」「オフィス」→「セラピストオフィス」
- `Role: OFFICE` → `Role: THERAPIST_OFFICE`

対象ファイルは主に `pages/admin/`, `pages/office/`, `components/` ディレクトリ配下のファイルとなります。

## 6. 管理画面改修詳細 (Issue #105, #106)

管理者ダッシュボード（`/admin`）に以下の2つのページを新設します。

- **料金プラン管理 (`/admin/plans`)**: `plans`テーブルのCRUD操作を行うUI。ReactとHonoのAPIエンドポイントで実装。
- **収益分配ルール管理 (`/admin/revenue-rules`)**: `revenue_share_rules`テーブルのCRUD操作を行うUI。ルールの優先順位や適用条件（JSON）も編集可能にする。

## 7. テスト計画 (Issue #107)

- **単体テスト:** `revenue-engine`の計算ロジックをテストケースを拡充して検証。
- **結合テスト:** 予約から決済、報酬分配までの一連の流れをテスト。
- **E2Eテスト:** Playwright等を使用し、各ロールでのログインからダッシュボード表示、料金プランの表示までを自動テスト。
  - 特に、CARE CUBEでの予約とホテルでの予約で、異なる分配ルールが適用されることを確認するシナリオが重要。
