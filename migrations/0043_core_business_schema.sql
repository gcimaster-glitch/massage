-- ============================================================
-- 0043_core_business_schema.sql
-- HOGUSYコアビジネスロジック: 契約・商品・報酬分配・財務台帳
-- 年間売上20億円を支えるデータ基盤の再設計
-- ============================================================

-- ============================================================
-- 1. Stripe Connected Accounts（未作成テーブルの正式追加）
--    セラピスト・オフィス・ホストのStripe Connect情報
-- ============================================================
CREATE TABLE IF NOT EXISTS stripe_connected_accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  stripe_account_id TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'express' CHECK (type IN ('express', 'standard', 'custom')),
  charges_enabled INTEGER NOT NULL DEFAULT 0,
  payouts_enabled INTEGER NOT NULL DEFAULT 0,
  details_submitted INTEGER NOT NULL DEFAULT 0,
  -- 銀行口座情報（Stripe側で管理するが参照用に保持）
  bank_last4 TEXT,
  bank_name TEXT,
  -- オンボーディング状況
  onboarding_status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (onboarding_status IN ('PENDING', 'IN_PROGRESS', 'COMPLETE', 'RESTRICTED')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_stripe_accounts_user ON stripe_connected_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_accounts_stripe_id ON stripe_connected_accounts(stripe_account_id);

-- ============================================================
-- 2. Products（商品・サービスマスタ）
--    HOGUSY本部が定義する販売可能な商品・プランの一覧
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  -- 商品種別
  type TEXT NOT NULL CHECK (type IN (
    'SUBSCRIPTION_OFFICE',    -- セラピストオフィス加盟プラン（月額）
    'SUBSCRIPTION_THERAPIST', -- セラピスト個人加盟プラン（月額）
    'SUBSCRIPTION_HOST',      -- 拠点ホスト加盟プラン（月額）
    'CARE_CUBE_UNIT',         -- CARE CUBE 1台購入
    'CARE_CUBE_RENTAL',       -- CARE CUBE レンタル
    'SYSTEM_FEE'              -- システム利用料（予約ごと）
  )),
  -- Stripe Product ID（Stripe側と同期）
  stripe_product_id TEXT UNIQUE,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 3. Prices（価格マスタ）
--    商品に紐づく価格設定（月額・年額・単発など）
-- ============================================================
CREATE TABLE IF NOT EXISTS prices (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  -- 価格情報
  amount INTEGER NOT NULL,  -- 金額（円）
  currency TEXT NOT NULL DEFAULT 'jpy',
  -- 課金サイクル
  billing_period TEXT NOT NULL CHECK (billing_period IN ('ONE_TIME', 'MONTHLY', 'YEARLY')),
  -- Stripe Price ID（Stripe側と同期）
  stripe_price_id TEXT UNIQUE,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_prices_product ON prices(product_id);

-- ============================================================
-- 4. Contracts（契約管理）
--    各ステークホルダー（オフィス・セラピスト・ホスト）の
--    HOGUSYとの契約情報を管理する
-- ============================================================
CREATE TABLE IF NOT EXISTS contracts (
  id TEXT PRIMARY KEY,
  -- 契約者
  user_id TEXT NOT NULL,
  -- 契約商品
  product_id TEXT NOT NULL,
  price_id TEXT NOT NULL,
  -- 契約ステータス
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED')),
  -- Stripe Subscription ID（サブスクの場合）
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  -- 契約期間
  started_at DATETIME,
  current_period_start DATETIME,
  current_period_end DATETIME,
  cancelled_at DATETIME,
  -- 特記事項・備考
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  FOREIGN KEY (price_id) REFERENCES prices(id) ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS idx_contracts_user ON contracts(user_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_stripe_sub ON contracts(stripe_subscription_id);

-- ============================================================
-- 5. Revenue Share Rules（報酬分配ルール）
--    NOTE: revenue_share_rules は 001_integration_update.sql で作成済みのため
--    ここでは再定義しない。カラム構成の正規化は 0052_audit_reconciliation.sql で行う。
--    （旧定義がここにあったが、既存テーブルと競合しマイグレーション全体が
--      失敗していたため削除した）
-- ============================================================

-- ============================================================
-- 6. Transactions（財務台帳 / 不変の取引記録）
--    すべての金銭の動きを記録するイミュータブルな台帳
--    修正は反対仕訳（REFUND/CORRECTION）で行う
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  -- 取引種別
  type TEXT NOT NULL CHECK (type IN (
    'CHARGE',      -- 顧客からの入金
    'REFUND',      -- 顧客への返金
    'PAYOUT',      -- セラピスト/オフィス/ホストへの支払い
    'CORRECTION',  -- 修正仕訳
    'FEE'          -- 手数料
  )),
  -- 金額（常に正の値。方向はtypeで判断）
  amount INTEGER NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'jpy',
  -- 関連エンティティ
  booking_id TEXT,
  contract_id TEXT,
  -- Stripe参照
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  stripe_refund_id TEXT,
  stripe_transfer_id TEXT,
  stripe_payout_id TEXT,
  -- ステータス
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED')),
  -- 説明・メモ
  description TEXT,
  -- 処理日時
  processed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_transactions_booking ON transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_stripe_pi ON transactions(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at);

-- ============================================================
-- 7. Transaction Splits（報酬分配明細）
--    各Transactionに対する、各ステークホルダーへの分配額を記録
-- ============================================================
CREATE TABLE IF NOT EXISTS transaction_splits (
  id TEXT PRIMARY KEY,
  -- 元となるCHARGEトランザクション
  transaction_id TEXT NOT NULL,
  -- 分配先
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN (
    'THERAPIST',  -- セラピスト
    'OFFICE',     -- セラピストオフィス
    'HOST',       -- 拠点ホスト
    'PLATFORM',   -- HOGUSY本部
    'PROMOTION'   -- 販促費（内部振替）
  )),
  -- 適用されたルール
  revenue_share_rule_id TEXT,
  -- 金額
  amount INTEGER NOT NULL CHECK (amount >= 0),
  rate INTEGER NOT NULL,  -- 適用された分配率（%）
  -- 支払いステータス（この分配額がいつ支払われたか）
  payout_status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (payout_status IN ('PENDING', 'PROCESSING', 'PAID', 'CANCELLED')),
  payout_transaction_id TEXT,  -- 対応するPAYOUTトランザクションのID
  paid_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (revenue_share_rule_id) REFERENCES revenue_share_rules(id) ON DELETE SET NULL,
  FOREIGN KEY (payout_transaction_id) REFERENCES transactions(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_splits_transaction ON transaction_splits(transaction_id);
CREATE INDEX IF NOT EXISTS idx_splits_user ON transaction_splits(user_id);
CREATE INDEX IF NOT EXISTS idx_splits_role ON transaction_splits(role);
CREATE INDEX IF NOT EXISTS idx_splits_payout_status ON transaction_splits(payout_status);

-- ============================================================
-- 8. Invoices（請求書）
--    契約に基づく請求書の管理
-- ============================================================
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  -- 請求先
  user_id TEXT NOT NULL,
  contract_id TEXT,
  -- 請求書番号（人間が読める番号）
  invoice_number TEXT NOT NULL UNIQUE,
  -- 金額
  subtotal INTEGER NOT NULL,
  tax_amount INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL,
  -- ステータス
  status TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT', 'SENT', 'PAID', 'VOID', 'UNCOLLECTIBLE')),
  -- Stripe Invoice ID
  stripe_invoice_id TEXT UNIQUE,
  -- 期日
  due_date DATE,
  paid_at DATETIME,
  -- 対象期間
  period_start DATE,
  period_end DATE,
  -- PDF URL（生成後に保存）
  pdf_url TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_invoices_user ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);

-- ============================================================
-- 9. Invoice Line Items（請求書明細行）
-- ============================================================
CREATE TABLE IF NOT EXISTS invoice_line_items (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_amount INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  -- 関連する商品
  product_id TEXT,
  price_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  FOREIGN KEY (price_id) REFERENCES prices(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_line_items(invoice_id);

-- ============================================================
-- 10. Receipts（領収書）
--     顧客への領収書（CHARGEトランザクション完了時に自動生成）
-- ============================================================
CREATE TABLE IF NOT EXISTS receipts (
  id TEXT PRIMARY KEY,
  -- 関連エンティティ
  transaction_id TEXT NOT NULL UNIQUE,
  booking_id TEXT,
  user_id TEXT NOT NULL,
  -- 領収書番号
  receipt_number TEXT NOT NULL UNIQUE,
  -- 金額
  amount INTEGER NOT NULL,
  tax_amount INTEGER NOT NULL DEFAULT 0,
  -- 宛名
  recipient_name TEXT NOT NULL,
  -- PDF URL
  pdf_url TEXT,
  -- 発行日
  issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_receipts_transaction ON receipts(transaction_id);
CREATE INDEX IF NOT EXISTS idx_receipts_user ON receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_booking ON receipts(booking_id);

-- ============================================================
-- 11. Payout Statements（支払明細書）
--     セラピスト・オフィス・ホストへの支払明細
-- ============================================================
CREATE TABLE IF NOT EXISTS payout_statements (
  id TEXT PRIMARY KEY,
  -- 受取人
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('THERAPIST', 'OFFICE', 'HOST')),
  -- 対象期間
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  -- 明細番号
  statement_number TEXT NOT NULL UNIQUE,
  -- 金額サマリー
  gross_amount INTEGER NOT NULL,   -- 総支払額
  deductions INTEGER NOT NULL DEFAULT 0,  -- 控除額（手数料等）
  net_amount INTEGER NOT NULL,     -- 実支払額
  -- 関連するPAYOUTトランザクション
  payout_transaction_id TEXT,
  -- ステータス
  status TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT', 'CONFIRMED', 'PAID')),
  -- PDF URL
  pdf_url TEXT,
  paid_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (payout_transaction_id) REFERENCES transactions(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_payout_statements_user ON payout_statements(user_id);
CREATE INDEX IF NOT EXISTS idx_payout_statements_period ON payout_statements(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_payout_statements_status ON payout_statements(status);

-- ============================================================
-- 12. Payout Statement Line Items（支払明細行）
--     各支払明細書に含まれる個別の予約・取引の詳細
-- ============================================================
CREATE TABLE IF NOT EXISTS payout_statement_line_items (
  id TEXT PRIMARY KEY,
  payout_statement_id TEXT NOT NULL,
  -- 元の分配記録
  transaction_split_id TEXT NOT NULL,
  -- 予約情報（非正規化してスナップショット保存）
  booking_id TEXT,
  booking_date DATE,
  service_name TEXT,
  customer_name TEXT,
  -- 金額
  gross_amount INTEGER NOT NULL,
  rate INTEGER NOT NULL,
  net_amount INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payout_statement_id) REFERENCES payout_statements(id) ON DELETE CASCADE,
  FOREIGN KEY (transaction_split_id) REFERENCES transaction_splits(id) ON DELETE RESTRICT,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_payout_items_statement ON payout_statement_line_items(payout_statement_id);

-- ============================================================
-- 13. 既存テーブルへのカラム追加
-- ============================================================

-- bookingsテーブルにhost_idカラムを追加（拠点ホストとの紐付け）
ALTER TABLE bookings ADD COLUMN host_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;

-- bookingsテーブルにrevenue_share_rule_idを追加（適用された分配ルールの記録）
ALTER TABLE bookings ADD COLUMN revenue_share_rule_id TEXT REFERENCES revenue_share_rules(id) ON DELETE SET NULL;

-- usersテーブルにstripe_customer_idを追加（顧客のStripe Customer ID）
-- NOTE: SQLiteは既存テーブルへのUNIQUEカラム追加を許可しないため、UNIQUE制約は
-- 付与せずインデックスで代替する
ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- ============================================================
-- 14. デフォルトの報酬分配ルール挿入は 0052_audit_reconciliation.sql に移動
-- （このファイル時点の revenue_share_rules は 001 の旧スキーマのため）
-- ============================================================

-- ============================================================
-- 15. デフォルト商品マスタを挿入
-- ============================================================
INSERT OR IGNORE INTO products (id, name, description, type, is_active) VALUES
  ('prod_office_basic', 'セラピストオフィス加盟プラン（ベーシック）', 'セラピストオフィスとしてHOGUSYに加盟するための月額プラン', 'SUBSCRIPTION_OFFICE', 1),
  ('prod_therapist_basic', 'セラピスト個人加盟プラン', 'セラピスト個人としてHOGUSYに登録するための月額プラン', 'SUBSCRIPTION_THERAPIST', 1),
  ('prod_host_basic', '拠点ホスト加盟プラン', '拠点ホストとしてHOGUSYに加盟するための月額プラン', 'SUBSCRIPTION_HOST', 1),
  ('prod_care_cube_unit', 'CARE CUBE 本体購入', 'CARE CUBE 1台の購入', 'CARE_CUBE_UNIT', 1),
  ('prod_care_cube_rental', 'CARE CUBE レンタル', 'CARE CUBE の月額レンタル', 'CARE_CUBE_RENTAL', 1);

INSERT OR IGNORE INTO prices (id, product_id, amount, billing_period, is_active) VALUES
  ('price_office_basic_monthly', 'prod_office_basic', 33000, 'MONTHLY', 1),
  ('price_therapist_basic_monthly', 'prod_therapist_basic', 0, 'MONTHLY', 1),
  ('price_host_basic_monthly', 'prod_host_basic', 0, 'MONTHLY', 1),
  ('price_care_cube_unit_once', 'prod_care_cube_unit', 198000, 'ONE_TIME', 1),
  ('price_care_cube_rental_monthly', 'prod_care_cube_rental', 16500, 'MONTHLY', 1);
