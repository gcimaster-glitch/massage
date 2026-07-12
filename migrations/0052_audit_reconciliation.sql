-- ============================================================
-- 0052: システム監査に基づくスキーマ整合性の修復
--
-- 背景:
--   revenue_share_rules / transactions / transaction_splits /
--   payout_statements / reviews には複数世代の定義が混在しており、
--   実際にコード（revenue-engine-routes / admin-comprehensive-routes /
--   reviews-routes 等）が発行するSQLと一致していなかった。
--   このマイグレーションでコードが期待する形へ正規化する。
--
--   併せて、コードから参照されているが存在しなかったテーブル
--   （booking_logs / earnings_distributions / user_subscriptions）を作成し、
--   therapist_profiles / offices に不足カラムを追加する。
-- ============================================================

PRAGMA defer_foreign_keys = true;

-- ============================================================
-- 1. revenue_share_rules を正規化（コードは「%表記の整数/実数」を期待）
--    旧スキーマ（001: rule_name / platform_fee_rate / marketing_rate、率は小数）
--    からデータを移行する。0.0〜1.0の小数で保存されていた率は%へ換算。
-- ============================================================
CREATE TABLE IF NOT EXISTS revenue_share_rules_new (
  id TEXT PRIMARY KEY,
  name TEXT,
  rule_name TEXT,
  description TEXT,
  -- 分配率（% 表記。合計100を想定）
  therapist_rate REAL NOT NULL DEFAULT 40,
  office_rate REAL NOT NULL DEFAULT 25,
  host_rate REAL NOT NULL DEFAULT 20,
  platform_rate REAL NOT NULL DEFAULT 10,
  promotion_rate REAL NOT NULL DEFAULT 5,
  -- 適用条件
  booking_type TEXT,
  office_id TEXT,
  plan_id TEXT,
  conditions TEXT DEFAULT '{}',
  -- 優先度・状態
  priority INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_by TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO revenue_share_rules_new (
  id, name, rule_name, therapist_rate, office_rate, host_rate,
  platform_rate, promotion_rate, conditions, priority, is_active, created_at, updated_at
)
SELECT
  id,
  rule_name,
  rule_name,
  CASE WHEN therapist_rate <= 1.0 THEN therapist_rate * 100 ELSE therapist_rate END,
  CASE WHEN office_rate <= 1.0 THEN office_rate * 100 ELSE office_rate END,
  CASE WHEN host_rate <= 1.0 THEN host_rate * 100 ELSE host_rate END,
  CASE WHEN platform_fee_rate <= 1.0 THEN platform_fee_rate * 100 ELSE platform_fee_rate END,
  CASE WHEN marketing_rate <= 1.0 THEN marketing_rate * 100 ELSE marketing_rate END,
  conditions, priority, is_active, created_at, updated_at
FROM revenue_share_rules;

DROP TABLE revenue_share_rules;
ALTER TABLE revenue_share_rules_new RENAME TO revenue_share_rules;

CREATE INDEX IF NOT EXISTS idx_revenue_rules_office ON revenue_share_rules(office_id);
CREATE INDEX IF NOT EXISTS idx_revenue_rules_active ON revenue_share_rules(is_active);

-- コードが参照するデフォルトルール（rule_default_001）を必ず用意する
INSERT OR IGNORE INTO revenue_share_rules (
  id, name, rule_name, description,
  therapist_rate, office_rate, host_rate, platform_rate, promotion_rate,
  priority, is_active, notes
) VALUES (
  'rule_default_001',
  'デフォルト分配ルール',
  'デフォルト分配ルール',
  'セラピスト40% / オフィス25% / ホスト20% / 本部10% / 販促5%',
  40, 25, 20, 10, 5,
  0, 1,
  '事業資料定義の標準分配率'
);

-- ============================================================
-- 2. transactions を収益分配エンジンの期待形へ正規化
--    （旧: 台帳型 type/amount 必須 → 新: gross/net + 台帳互換カラムは任意）
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions_new (
  id TEXT PRIMARY KEY,
  booking_id TEXT,
  contract_id TEXT,
  -- Stripe参照
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_charge_id TEXT,
  stripe_refund_id TEXT,
  stripe_transfer_id TEXT,
  stripe_payout_id TEXT,
  -- 金額
  gross_amount INTEGER NOT NULL DEFAULT 0, -- 総額（円）
  net_amount INTEGER NOT NULL DEFAULT 0,   -- 手数料控除後
  amount INTEGER,                          -- 旧台帳互換
  currency TEXT NOT NULL DEFAULT 'jpy',
  -- 種別・状態（旧台帳のCHECKは撤廃し、コードの値を許容する）
  type TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  description TEXT,
  -- タイムスタンプ
  paid_at DATETIME,
  refunded_at DATETIME,
  processed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO transactions_new (
  id, booking_id, contract_id,
  stripe_payment_intent_id, stripe_charge_id, stripe_refund_id,
  stripe_transfer_id, stripe_payout_id,
  gross_amount, net_amount, amount, currency,
  type, status, description, processed_at, paid_at, created_at
)
SELECT
  id, booking_id, contract_id,
  stripe_payment_intent_id, stripe_charge_id, stripe_refund_id,
  stripe_transfer_id, stripe_payout_id,
  COALESCE(amount, 0), COALESCE(amount, 0), amount, currency,
  type,
  CASE WHEN status = 'COMPLETED' THEN 'SUCCEEDED' ELSE status END,
  description, processed_at, processed_at, created_at
FROM transactions;

DROP TABLE transactions;
ALTER TABLE transactions_new RENAME TO transactions;

CREATE INDEX IF NOT EXISTS idx_transactions_booking ON transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_transactions_stripe_pi ON transactions(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- ============================================================
-- 3. transaction_splits を正規化
--    （updated_at / payout_statement_id を追加し、roleのCHECKを撤廃。
--      コードは 'THERAPIST_OFFICE' / 'PROMOTION' も書き込むため）
-- ============================================================
CREATE TABLE IF NOT EXISTS transaction_splits_new (
  id TEXT PRIMARY KEY,
  transaction_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL,
  revenue_share_rule_id TEXT,
  amount INTEGER NOT NULL DEFAULT 0,
  rate REAL NOT NULL DEFAULT 0,
  payout_status TEXT NOT NULL DEFAULT 'PENDING',
  payout_statement_id TEXT,
  payout_transaction_id TEXT,
  paid_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
);

INSERT OR IGNORE INTO transaction_splits_new (
  id, transaction_id, user_id, role, revenue_share_rule_id,
  amount, rate, payout_status, payout_transaction_id, paid_at, created_at
)
SELECT
  id, transaction_id, user_id, role, revenue_share_rule_id,
  amount, rate, payout_status, payout_transaction_id, paid_at, created_at
FROM transaction_splits;

DROP TABLE transaction_splits;
ALTER TABLE transaction_splits_new RENAME TO transaction_splits;

CREATE INDEX IF NOT EXISTS idx_transaction_splits_transaction ON transaction_splits(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_splits_user ON transaction_splits(user_id);
CREATE INDEX IF NOT EXISTS idx_transaction_splits_payout_status ON transaction_splits(payout_status);

-- ============================================================
-- 4. payout_statements を正規化
--    （statement_number 必須 → 任意、total_amount / fee_amount / notes 追加。
--      revenue-engine と admin-comprehensive の両方の書き込みを受け入れる）
-- ============================================================
CREATE TABLE IF NOT EXISTS payout_statements_new (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  role TEXT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  statement_number TEXT UNIQUE,
  -- 金額（gross/net は admin 系、total は engine 系が使用）
  gross_amount INTEGER NOT NULL DEFAULT 0,
  deductions INTEGER NOT NULL DEFAULT 0,
  fee_amount INTEGER NOT NULL DEFAULT 0,
  net_amount INTEGER NOT NULL DEFAULT 0,
  total_amount INTEGER NOT NULL DEFAULT 0,
  -- 状態・支払い情報
  status TEXT NOT NULL DEFAULT 'DRAFT',
  payout_transaction_id TEXT,
  payment_method TEXT,
  payment_reference TEXT,
  pdf_url TEXT,
  notes TEXT,
  paid_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, period_start, period_end)
);

INSERT OR IGNORE INTO payout_statements_new (
  id, user_id, role, period_start, period_end, statement_number,
  gross_amount, deductions, net_amount, total_amount,
  status, payout_transaction_id, pdf_url, paid_at, created_at, updated_at
)
SELECT
  id, user_id, role, period_start, period_end, statement_number,
  gross_amount, deductions, net_amount, gross_amount,
  status, payout_transaction_id, pdf_url, paid_at, created_at, updated_at
FROM payout_statements;

DROP TABLE payout_statements;
ALTER TABLE payout_statements_new RENAME TO payout_statements;

CREATE INDEX IF NOT EXISTS idx_payout_statements_user ON payout_statements(user_id);
CREATE INDEX IF NOT EXISTS idx_payout_statements_period ON payout_statements(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_payout_statements_status ON payout_statements(status);

-- ============================================================
-- 5. reviews を拡張（reviews-routes が期待する詳細カラムを追加）
--    therapist_id は users.id を格納する運用のため、FKを users に変更する。
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews_new (
  id TEXT PRIMARY KEY,
  booking_id TEXT UNIQUE NOT NULL,
  user_id TEXT,
  therapist_id TEXT NOT NULL,   -- users.id（セラピストのユーザーID）
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  -- 顧客属性（任意）
  customer_age_range TEXT,
  customer_gender TEXT,
  customer_occupation TEXT,
  body_concerns TEXT DEFAULT '[]',  -- JSON array
  ng_items TEXT DEFAULT '[]',       -- JSON array
  is_public INTEGER DEFAULT 1,
  -- セラピストからの返信
  therapist_reply TEXT,
  therapist_replied_at INTEGER,
  created_at INTEGER,
  updated_at INTEGER,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

INSERT OR IGNORE INTO reviews_new (
  id, booking_id, user_id, therapist_id, rating, comment, is_public, created_at, updated_at
)
SELECT
  id, booking_id, user_id, therapist_id, rating, comment, is_public,
  CAST(strftime('%s', created_at) AS INTEGER) * 1000,
  CAST(strftime('%s', created_at) AS INTEGER) * 1000
FROM reviews;

DROP TABLE reviews;
ALTER TABLE reviews_new RENAME TO reviews;

CREATE INDEX IF NOT EXISTS idx_reviews_therapist ON reviews(therapist_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);

-- ============================================================
-- 6. booking_logs（bookings-routes が拒否理由・ステータス変更履歴を記録）
-- ============================================================
CREATE TABLE IF NOT EXISTS booking_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id TEXT NOT NULL,
  action TEXT NOT NULL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_booking_logs_booking ON booking_logs(booking_id);

-- ============================================================
-- 7. earnings_distributions（stripe-webhook-routes の収益分配記録）
-- ============================================================
CREATE TABLE IF NOT EXISTS earnings_distributions (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  total_amount INTEGER NOT NULL,
  therapist_id TEXT,
  therapist_amount INTEGER DEFAULT 0,
  office_id TEXT,
  office_amount INTEGER DEFAULT 0,
  host_id TEXT,
  host_amount INTEGER DEFAULT 0,
  platform_amount INTEGER DEFAULT 0,
  marketing_amount INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_earnings_dist_booking ON earnings_distributions(booking_id);

-- ============================================================
-- 8. user_subscriptions（Stripeサブスクリプション状態の記録）
-- ============================================================
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON user_subscriptions(user_id);

-- ============================================================
-- 9. therapist_profiles: 出張/施術受け入れ設定カラムを追加
--    （therapist-management-routes が使用）
-- ============================================================
ALTER TABLE therapist_profiles ADD COLUMN outcall_available INTEGER DEFAULT 1;
ALTER TABLE therapist_profiles ADD COLUMN incall_available INTEGER DEFAULT 1;
ALTER TABLE therapist_profiles ADD COLUMN base_location TEXT;
ALTER TABLE therapist_profiles ADD COLUMN base_lat REAL;
ALTER TABLE therapist_profiles ADD COLUMN base_lng REAL;
ALTER TABLE therapist_profiles ADD COLUMN travel_methods TEXT;
ALTER TABLE therapist_profiles ADD COLUMN outcall_hours TEXT;
ALTER TABLE therapist_profiles ADD COLUMN incall_hours TEXT;

-- ============================================================
-- 10. offices: 連絡先・所在地カラムを追加（office-management-routes が使用）
-- ============================================================
ALTER TABLE offices ADD COLUMN address TEXT;
ALTER TABLE offices ADD COLUMN phone TEXT;
ALTER TABLE offices ADD COLUMN email TEXT;
ALTER TABLE offices ADD COLUMN description TEXT;
