-- ============================================================
-- 0053: bookings / booking_timelocks の therapist_id FK 修正
--
-- 背景:
--   bookings.therapist_id / booking_timelocks.therapist_id の
--   外部キーは therapist_profiles(id) を参照していたが、
--   アプリケーションコードは一貫して users.id を格納している
--   （bookings-routes: 「bookings.therapist_id = user_idで保存されている」）。
--   このため通常予約の作成・タイムロック取得が
--   FOREIGN KEY constraint failed で全て失敗していた。
--   FKを users(id) に張り替える。
-- ============================================================

PRAGMA defer_foreign_keys = true;

-- ----------------------------------------
-- bookings 再構築
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS bookings_new (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  therapist_id TEXT NOT NULL,   -- users.id（セラピストのユーザーID）
  therapist_name TEXT NOT NULL,
  office_id TEXT,
  site_id TEXT,
  room_id TEXT,
  type TEXT NOT NULL CHECK (type IN ('ONSITE', 'HOTEL', 'HOME', 'OFFICE')),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
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
  stripe_session_id TEXT,
  payment_status TEXT DEFAULT 'UNPAID',
  host_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  revenue_share_rule_id TEXT REFERENCES revenue_share_rules(id) ON DELETE SET NULL,
  payment_intent_id TEXT,
  guest_name TEXT,
  guest_email TEXT,
  guest_phone TEXT,
  timelock_id TEXT,
  customer_address TEXT,
  postal_code TEXT,
  customer_lat REAL,
  customer_lng REAL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (therapist_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (office_id) REFERENCES offices(id) ON DELETE SET NULL,
  FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE SET NULL,
  FOREIGN KEY (room_id) REFERENCES site_rooms(id) ON DELETE SET NULL
);

INSERT OR IGNORE INTO bookings_new (
  id, user_id, therapist_id, therapist_name, office_id, site_id, room_id,
  type, status, service_name, duration, price, location, address_visibility,
  scheduled_at, started_at, completed_at, created_at, updated_at,
  stripe_session_id, payment_status, host_user_id, revenue_share_rule_id,
  payment_intent_id, guest_name, guest_email, guest_phone, timelock_id,
  customer_address, postal_code, customer_lat, customer_lng
)
SELECT
  id, user_id, therapist_id, therapist_name, office_id, site_id, room_id,
  type, status, service_name, duration, price, location, address_visibility,
  scheduled_at, started_at, completed_at, created_at, updated_at,
  stripe_session_id, payment_status, host_user_id, revenue_share_rule_id,
  payment_intent_id, guest_name, guest_email, guest_phone, timelock_id,
  customer_address, postal_code, customer_lat, customer_lng
FROM bookings;

DROP TABLE bookings;
ALTER TABLE bookings_new RENAME TO bookings;

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_therapist_id ON bookings(therapist_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);
CREATE INDEX IF NOT EXISTS idx_bookings_stripe_session ON bookings(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_intent ON bookings(payment_intent_id);

-- ----------------------------------------
-- booking_timelocks 再構築
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS booking_timelocks_new (
  id TEXT PRIMARY KEY,
  therapist_id TEXT NOT NULL,   -- users.id（セラピストのユーザーID）
  site_id TEXT,
  scheduled_at DATETIME NOT NULL,
  duration INTEGER NOT NULL DEFAULT 60,
  expires_at DATETIME NOT NULL,
  session_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CONFIRMED', 'EXPIRED', 'RELEASED')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (therapist_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT OR IGNORE INTO booking_timelocks_new (
  id, therapist_id, site_id, scheduled_at, duration, expires_at, session_id, status, created_at
)
SELECT id, therapist_id, site_id, scheduled_at, duration, expires_at, session_id, status, created_at
FROM booking_timelocks;

DROP TABLE booking_timelocks;
ALTER TABLE booking_timelocks_new RENAME TO booking_timelocks;

CREATE INDEX IF NOT EXISTS idx_timelocks_therapist_time
  ON booking_timelocks(therapist_id, scheduled_at, status);
CREATE INDEX IF NOT EXISTS idx_timelocks_expires
  ON booking_timelocks(expires_at, status);
