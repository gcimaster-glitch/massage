-- 0044_add_payment_intent_id_to_bookings.sql
-- bookingsテーブルにpayment_intent_idカラムを追加
-- (payment-routes.tsのconfirmエンドポイントで使用)
ALTER TABLE bookings ADD COLUMN payment_intent_id TEXT;
CREATE INDEX IF NOT EXISTS idx_bookings_payment_intent ON bookings(payment_intent_id);
