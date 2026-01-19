-- ゲスト予約対応のためのスキーマ変更

-- bookings テーブルの修正
-- 1. user_id を NULL 許可に変更（ゲスト予約用）
-- 2. ゲスト情報カラムを追加

-- まず、既存のカラムを確認してから ALTER TABLE を実行
-- SQLite では制約の変更が難しいため、新しいテーブルを作成して移行

-- 一時テーブルを作成
CREATE TABLE IF NOT EXISTS bookings_new (
  id TEXT PRIMARY KEY,
  user_id TEXT,  -- NULL 許可（ゲスト予約用）
  user_name TEXT,  -- ゲスト名
  user_email TEXT,  -- ゲストメール
  user_phone TEXT,  -- ゲスト電話番号
  user_address TEXT,  -- ゲスト住所（MOBILE予約用）
  postal_code TEXT,  -- 郵便番号（MOBILE予約用）
  therapist_id TEXT NOT NULL,
  therapist_name TEXT NOT NULL,
  office_id TEXT,
  site_id TEXT,
  room_id TEXT,
  type TEXT NOT NULL CHECK (type IN ('ONSITE', 'MOBILE', 'HOTEL', 'HOME', 'OFFICE')),
  status TEXT NOT NULL DEFAULT 'PENDING_PAYMENT' CHECK (status IN ('PENDING_PAYMENT', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
  service_name TEXT NOT NULL,
  duration INTEGER NOT NULL,
  price INTEGER NOT NULL,
  location TEXT,
  address_visibility TEXT DEFAULT 'PARTIAL' CHECK (address_visibility IN ('FULL', 'PARTIAL', 'HIDDEN')),
  scheduled_at DATETIME NOT NULL,
  started_at DATETIME,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  payment_status TEXT DEFAULT 'PENDING',
  payment_intent_id TEXT,
  paid_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (therapist_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (office_id) REFERENCES offices(id) ON DELETE SET NULL,
  FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE SET NULL,
  FOREIGN KEY (room_id) REFERENCES site_rooms(id) ON DELETE SET NULL
);

-- 既存データを移行
INSERT INTO bookings_new (
  id, user_id, therapist_id, therapist_name, office_id, site_id, room_id,
  type, status, service_name, duration, price, location, address_visibility,
  scheduled_at, started_at, completed_at, created_at, updated_at
)
SELECT 
  id, user_id, therapist_id, therapist_name, office_id, site_id, room_id,
  type, status, service_name, duration, price, location, address_visibility,
  scheduled_at, started_at, completed_at, created_at, updated_at
FROM bookings;

-- 古いテーブルを削除
DROP TABLE bookings;

-- 新しいテーブルをリネーム
ALTER TABLE bookings_new RENAME TO bookings;

-- インデックスを再作成
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_therapist_id ON bookings(therapist_id);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_at ON bookings(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_user_email ON bookings(user_email);
