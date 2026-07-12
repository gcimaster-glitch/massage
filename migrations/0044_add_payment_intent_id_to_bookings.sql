-- 0044_add_payment_intent_id_to_bookings.sql
-- NOTE: bookings.payment_intent_id は 0043_revenue_distribution_engine.sql で
-- 追加済みのため、このマイグレーションは no-op に変更した。
-- （重複ALTERにより「duplicate column name」でマイグレーションが失敗していた）
SELECT 1;
