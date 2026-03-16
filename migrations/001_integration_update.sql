-- ============================================================
-- Migration: 001_integration_update.sql
-- Description: 事業資料との統合に伴うスキーマ変更
-- Date: 2026-03-16
-- ============================================================

-- 1. plans テーブルの新設（料金プラン管理）
CREATE TABLE IF NOT EXISTS plans (
    id TEXT PRIMARY KEY,
    target_role TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    initial_fee INTEGER DEFAULT 0,
    monthly_fee INTEGER DEFAULT 0,
    description TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. revenue_share_rules テーブルの新設（収益分配ルール管理）
CREATE TABLE IF NOT EXISTS revenue_share_rules (
    id TEXT PRIMARY KEY,
    rule_name TEXT NOT NULL,
    priority INTEGER NOT NULL DEFAULT 100,
    therapist_rate REAL NOT NULL,
    office_rate REAL NOT NULL,
    host_rate REAL NOT NULL,
    platform_fee_rate REAL NOT NULL,
    marketing_rate REAL NOT NULL,
    conditions TEXT DEFAULT '{}',
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. デフォルト収益分配ルールの投入（資料定義の数値）
INSERT OR REPLACE INTO revenue_share_rules
    (id, rule_name, priority, therapist_rate, office_rate, host_rate, platform_fee_rate, marketing_rate, conditions, is_active)
VALUES
    ('default_rule', 'デフォルト分配ルール', 100, 0.40, 0.25, 0.20, 0.10, 0.05, '{}', 1);

-- 4. 料金プランの投入（資料定義の数値）
INSERT OR REPLACE INTO plans
    (id, target_role, plan_name, initial_fee, monthly_fee, description, is_active)
VALUES
    ('office_virtual',    'THERAPIST_OFFICE', 'バーチャル店舗',    75000,  15000, '実店舗なし。ネットワーク配車で展開。所属セラピスト100名まで。', 1),
    ('office_real',       'THERAPIST_OFFICE', 'リアル店舗',       150000,  25000, '実店舗と出張のハイブリッド運営。所属セラピスト100名まで。', 1),
    ('host_cube',         'HOST',             'CARE CUBE 1ブース導入', 250000, 11000, 'CARE CUBEブース本体・設置・運営備品・デジタルサイネージ込み。', 1),
    ('therapist_personal','THERAPIST',        '個人利用プラン',        0,    500, 'プラットフォーム利用料。集客・決済・スケジュール管理が使えます。', 1);
