-- セラピストメニュー：コーステーブル
CREATE TABLE IF NOT EXISTS therapist_menu_courses (
  id TEXT PRIMARY KEY,
  therapist_profile_id TEXT NOT NULL,
  name TEXT NOT NULL,
  duration INTEGER NOT NULL, -- 分単位
  price INTEGER NOT NULL, -- 円
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (therapist_profile_id) REFERENCES therapist_profiles(id) ON DELETE CASCADE
);

-- セラピストメニュー：オプションテーブル
CREATE TABLE IF NOT EXISTS therapist_menu_options (
  id TEXT PRIMARY KEY,
  therapist_profile_id TEXT NOT NULL,
  name TEXT NOT NULL,
  price INTEGER NOT NULL, -- 円
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (therapist_profile_id) REFERENCES therapist_profiles(id) ON DELETE CASCADE
);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_menu_courses_therapist ON therapist_menu_courses(therapist_profile_id);
CREATE INDEX IF NOT EXISTS idx_menu_options_therapist ON therapist_menu_options(therapist_profile_id);
