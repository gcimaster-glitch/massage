-- 0043: 収益分配エンジン用インデックス追加
-- ============================================
-- 注意: このマイグレーションは 0043_core_business_schema.sql の「後」に適用される
-- （wrangler はファイル名順で適用するため）。
-- 以前のバージョンは core と競合する内容
-- （同名テーブルの別定義 CREATE、name カラムへの INSERT、
--   host_user_id / revenue_share_rule_id / stripe_customer_id の重複 ALTER、
--   0044 と重複する payment_intent_id の ALTER）を含んでおり、
-- 適用が必ず失敗してマイグレーションチェーン全体が停止するため、
-- core スキーマと互換な追加分（インデックスのみ）に整理した。
-- テーブル定義は 0043_core_business_schema.sql を、
-- デフォルト分配ルールの投入は 0052_reconcile_schema.sql を参照。

-- transactions（core版: type/amount/status/processed_at）
CREATE INDEX IF NOT EXISTS idx_transactions_booking ON transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_transactions_stripe_pi ON transactions(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- transaction_splits
CREATE INDEX IF NOT EXISTS idx_transaction_splits_transaction ON transaction_splits(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_splits_user ON transaction_splits(user_id);
CREATE INDEX IF NOT EXISTS idx_transaction_splits_payout_status ON transaction_splits(payout_status);

-- payout_statements
CREATE INDEX IF NOT EXISTS idx_payout_statements_user ON payout_statements(user_id);
CREATE INDEX IF NOT EXISTS idx_payout_statements_period ON payout_statements(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_payout_statements_status ON payout_statements(status);
