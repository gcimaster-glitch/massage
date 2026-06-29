-- 出張予約（MOBILE）のお客様住所を保存するカラムを追加
ALTER TABLE bookings ADD COLUMN customer_address TEXT;
ALTER TABLE bookings ADD COLUMN postal_code TEXT;
ALTER TABLE bookings ADD COLUMN customer_lat REAL;
ALTER TABLE bookings ADD COLUMN customer_lng REAL;
