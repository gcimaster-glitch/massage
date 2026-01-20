-- 本番環境用: bookingsテーブルにゲスト予約対応カラムを追加

-- user_id を NULL 許可に変更するため、新しいテーブルを作成
CREATE TABLE IF NOT EXISTS bookings_new (
  id TEXT PRIMARY KEY,
  user_id TEXT,  -- NULL 許可（ゲスト予約用）
  user_name TEXT,  -- ゲスト名
  user_email TEXT,  -- ゲストメール
  user_phone TEXT,  -- ゲスト電話番号
  user_address TEXT,  -- ゲスト住所（MOBILE予約用）
  postal_code TEXT,  -- 郵便番号（MOBILE予約用）
  therapist_id TEXT NOT NULL,
  site_id TEXT,
  office_id TEXT,
  type TEXT NOT NULL CHECK(type IN ('ONSITE', 'OUTCALL', 'MOBILE')),
  status TEXT DEFAULT 'PENDING_PAYMENT' CHECK(status IN ('PENDING_PAYMENT', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  service_name TEXT NOT NULL,
  duration INTEGER NOT NULL,
  scheduled_start DATETIME NOT NULL,
  scheduled_end DATETIME,
  price INTEGER NOT NULL,
  payment_intent_id TEXT,
  payment_status TEXT DEFAULT 'PENDING' CHECK(payment_status IN ('PENDING', 'PAID', 'REFUNDED')),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (therapist_id) REFERENCES users(id),
  FOREIGN KEY (site_id) REFERENCES sites(id),
  FOREIGN KEY (office_id) REFERENCES therapist_offices(id)
);

-- 既存データを移行
INSERT INTO bookings_new (
  id, user_id, therapist_id, site_id, office_id,
  type, status, service_name, duration, scheduled_start, scheduled_end,
  price, payment_intent_id, payment_status, notes, created_at, completed_at
)
SELECT 
  id, user_id, therapist_id, site_id, office_id,
  type, status, service_name, duration, scheduled_start, scheduled_end,
  price, payment_intent_id, payment_status, notes, created_at, completed_at
FROM bookings;

-- 古いテーブルを削除
DROP TABLE bookings;

-- 新しいテーブルをリネーム
ALTER TABLE bookings_new RENAME TO bookings;

-- インデックスを再作成
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_therapist_id ON bookings(therapist_id);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_start ON bookings(scheduled_start);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_user_email ON bookings(user_email);
