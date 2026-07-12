-- 0043: 収益分配エンジン用テーブル追加
-- ============================================
-- 1. 収益分配ルールテーブル
-- NOTE: revenue_share_rules は 001_integration_update.sql で作成済み。
-- カラム構成の正規化とデフォルトルール（rule_default_001）の挿入は
-- 0052_audit_reconciliation.sql で行う。
-- （旧定義がここにあったが、既存テーブルと競合しマイグレーション全体が
--   失敗していたため削除した）
-- ============================================

-- ============================================
-- 2. トランザクションテーブル（決済記録）
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  -- Stripe情報
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_charge_id TEXT,
  -- 金額
  gross_amount INTEGER NOT NULL, -- 総額（円）
  net_amount INTEGER NOT NULL,   -- 手数料控除後（将来用）
  currency TEXT NOT NULL DEFAULT 'jpy',
  -- ステータス
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED')),
  -- タイムスタンプ
  paid_at DATETIME,
  refunded_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_transactions_booking ON transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_transactions_stripe_pi ON transactions(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- ============================================
-- 3. トランザクション分割テーブル（受取人別）
-- ============================================
CREATE TABLE IF NOT EXISTS transaction_splits (
  id TEXT PRIMARY KEY,
  transaction_id TEXT NOT NULL,
  -- 受取人情報
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('THERAPIST', 'HOST', 'OFFICE', 'PLATFORM')),
  -- 金額
  amount INTEGER NOT NULL, -- 受取額（円）
  rate REAL NOT NULL,      -- 適用された分配率（%）
  -- 支払いステータス
  payout_status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (payout_status IN ('PENDING', 'PROCESSING', 'PAID', 'FAILED', 'CANCELLED')),
  payout_statement_id TEXT, -- 精算書IDへの参照
  paid_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_transaction_splits_transaction ON transaction_splits(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_splits_user ON transaction_splits(user_id);
CREATE INDEX IF NOT EXISTS idx_transaction_splits_payout_status ON transaction_splits(payout_status);

-- ============================================
-- 4. 精算書テーブル（月次精算）
-- ============================================
CREATE TABLE IF NOT EXISTS payout_statements (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('THERAPIST', 'HOST', 'OFFICE', 'PLATFORM')),
  -- 対象期間
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  -- 金額集計
  gross_amount INTEGER NOT NULL DEFAULT 0, -- 総受取額
  net_amount INTEGER NOT NULL DEFAULT 0,   -- 振込額（手数料控除後）
  fee_amount INTEGER NOT NULL DEFAULT 0,   -- 手数料
  -- ステータス
  status TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT', 'CONFIRMED', 'PAID', 'CANCELLED')),
  -- 支払い情報
  paid_at DATETIME,
  payment_method TEXT,
  payment_reference TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, period_start, period_end)
);

CREATE INDEX IF NOT EXISTS idx_payout_statements_user ON payout_statements(user_id);
CREATE INDEX IF NOT EXISTS idx_payout_statements_period ON payout_statements(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_payout_statements_status ON payout_statements(status);

-- ============================================
-- 5. bookingsテーブルへのカラム追加
-- NOTE: host_user_id / revenue_share_rule_id は 0043_core_business_schema.sql で、
-- stripe_customer_id も同ファイルで追加済みのため、ここでは payment_intent_id のみ追加する。
-- （重複ALTERによりマイグレーションが失敗していたため整理した）
-- ============================================
ALTER TABLE bookings ADD COLUMN payment_intent_id TEXT;

CREATE INDEX IF NOT EXISTS idx_bookings_payment_intent ON bookings(payment_intent_id);
