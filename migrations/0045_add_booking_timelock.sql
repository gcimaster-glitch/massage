-- ============================================
-- 0045: タイムロック（仮予約）テーブルの追加
-- 予約フローの10分間仮予約機能に使用
-- ============================================

CREATE TABLE IF NOT EXISTS booking_timelocks (
  id TEXT PRIMARY KEY,
  therapist_id TEXT NOT NULL,
  site_id TEXT,
  scheduled_at DATETIME NOT NULL,
  duration INTEGER NOT NULL DEFAULT 60,
  expires_at DATETIME NOT NULL,
  session_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CONFIRMED', 'EXPIRED', 'RELEASED')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (therapist_id) REFERENCES therapist_profiles(id) ON DELETE CASCADE
);

-- インデックス：セラピストと時間での重複チェック用
CREATE INDEX IF NOT EXISTS idx_timelocks_therapist_time 
  ON booking_timelocks(therapist_id, scheduled_at, status);

-- インデックス：有効期限チェック用
CREATE INDEX IF NOT EXISTS idx_timelocks_expires 
  ON booking_timelocks(expires_at, status);

-- ============================================
-- bookingsテーブルにゲスト予約フィールドを追加
-- ============================================
ALTER TABLE bookings ADD COLUMN guest_name TEXT;
ALTER TABLE bookings ADD COLUMN guest_email TEXT;
ALTER TABLE bookings ADD COLUMN guest_phone TEXT;
ALTER TABLE bookings ADD COLUMN timelock_id TEXT;
