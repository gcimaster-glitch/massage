-- =====================================================
-- therapist_officesテーブルの作成とデータ移行
-- 本番環境の外部キー制約に対応
-- =====================================================

-- 1. therapist_officesテーブルを作成（既に存在する場合はスキップ）
CREATE TABLE IF NOT EXISTS therapist_offices (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  area_code TEXT NOT NULL,
  manager_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  commission_rate REAL DEFAULT 15.0,
  therapist_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 2. officesテーブルのデータをtherapist_officesにコピー
INSERT OR REPLACE INTO therapist_offices (id, user_id, name, area_code, manager_name, contact_email, commission_rate, therapist_count, status, created_at)
SELECT id, user_id, name, area_code, manager_name, contact_email, commission_rate, therapist_count, status, created_at
FROM offices;

-- 3. セラピストの事務所割り当て
UPDATE therapist_profiles SET office_id = 'off-hogusy-hq' WHERE user_id IN ('t1', 't4', 't6', 't9', 't10');
UPDATE therapist_profiles SET office_id = 'off-roppongi-wellness' WHERE user_id IN ('t2', 't5', 't7', 't11');
UPDATE therapist_profiles SET office_id = 'off-shinjuku-healing' WHERE user_id IN ('t3', 't8');
