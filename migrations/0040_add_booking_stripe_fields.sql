-- 0040_add_booking_stripe_fields.sql
-- bookingsテーブルにStripe決済関連カラムを追加

ALTER TABLE bookings ADD COLUMN stripe_session_id TEXT;
ALTER TABLE bookings ADD COLUMN payment_status TEXT DEFAULT 'UNPAID';

CREATE INDEX IF NOT EXISTS idx_bookings_stripe_session ON bookings(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
