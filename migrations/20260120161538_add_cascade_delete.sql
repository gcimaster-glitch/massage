-- CASCADE削除を有効化するマイグレーション

-- 1. therapist_edit_logsを再作成（CASCADE削除付き）
DROP TABLE IF EXISTS therapist_edit_logs_backup;
CREATE TABLE therapist_edit_logs_backup AS SELECT * FROM therapist_edit_logs;

DROP TABLE therapist_edit_logs;

CREATE TABLE therapist_edit_logs (
  id TEXT PRIMARY KEY,
  therapist_id TEXT NOT NULL,
  admin_id TEXT NOT NULL,
  action TEXT NOT NULL,
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (therapist_id) REFERENCES therapist_profiles(user_id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

-- データを戻す
INSERT INTO therapist_edit_logs SELECT * FROM therapist_edit_logs_backup;
DROP TABLE therapist_edit_logs_backup;

-- 2. therapist_profilesを確認（既にCASCADEが設定されているか確認）
-- もし設定されていなければ、再作成

-- 3. bookingsも同様にCASCADE削除を追加
DROP TABLE IF EXISTS bookings_backup;
CREATE TABLE bookings_backup AS SELECT * FROM bookings;

DROP TABLE IF EXISTS booking_items_backup;
CREATE TABLE booking_items_backup AS SELECT * FROM booking_items;

DROP TABLE IF EXISTS booking_items;
DROP TABLE IF EXISTS bookings;

CREATE TABLE bookings (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_name TEXT,
  user_email TEXT,
  user_phone TEXT,
  user_address TEXT,
  postal_code TEXT,
  therapist_id TEXT NOT NULL,
  therapist_name TEXT NOT NULL,
  office_id TEXT,
  site_id TEXT,
  room_id TEXT,
  type TEXT NOT NULL CHECK (type IN ('ONSITE', 'OUTCALL', 'MOBILE', 'HOTEL', 'HOME', 'OFFICE')),
  status TEXT NOT NULL DEFAULT 'PENDING_PAYMENT' CHECK (status IN ('PENDING_PAYMENT', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
  service_name TEXT NOT NULL,
  duration INTEGER NOT NULL,
  price INTEGER NOT NULL,
  location TEXT,
  address_visibility TEXT DEFAULT 'PARTIAL' CHECK (address_visibility IN ('FULL', 'PARTIAL', 'HIDDEN')),
  scheduled_start DATETIME NOT NULL,
  scheduled_end DATETIME,
  started_at DATETIME,
  completed_at DATETIME,
  payment_status TEXT,
  payment_intent_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (office_id) REFERENCES offices(id) ON DELETE SET NULL,
  FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE SET NULL,
  FOREIGN KEY (room_id) REFERENCES site_rooms(id) ON DELETE SET NULL
);

CREATE TABLE booking_items (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('COURSE', 'OPTION')),
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  duration INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- データを戻す
INSERT INTO bookings SELECT * FROM bookings_backup;
INSERT INTO booking_items SELECT * FROM booking_items_backup;

DROP TABLE bookings_backup;
DROP TABLE booking_items_backup;

-- 4. email_verificationsもCASCADE削除
DROP TABLE IF EXISTS email_verifications_backup;
CREATE TABLE email_verifications_backup AS SELECT * FROM email_verifications;

DROP TABLE email_verifications;

CREATE TABLE email_verifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO email_verifications SELECT * FROM email_verifications_backup;
DROP TABLE email_verifications_backup;

-- 5. social_accountsもCASCADE削除
DROP TABLE IF EXISTS social_accounts_backup;
CREATE TABLE social_accounts_backup AS SELECT * FROM social_accounts;

DROP TABLE social_accounts;

CREATE TABLE social_accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_user_id TEXT NOT NULL,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  access_token TEXT,
  refresh_token TEXT,
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(provider, provider_user_id)
);

INSERT INTO social_accounts SELECT * FROM social_accounts_backup;
DROP TABLE social_accounts_backup;
