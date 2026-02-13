-- ============================================
-- HOGUSY本部オフィスの作成
-- ============================================
-- 方針変更: ホグシー直属セラピストは廃止。
-- HOGUSY本部自体も1つのセラピストオフィスとして管理する。
-- 既存の直属セラピスト(office_id = NULL)はHOGUSY本部オフィスに紐づける。

-- 1. HOGUSY本部オフィス用のシステムユーザーを作成
INSERT OR IGNORE INTO users (id, email, name, phone, role, email_verified, kyc_status, created_at, updated_at)
VALUES (
  'user-hogusy-hq',
  'hq@hogusy.com',
  'HOGUSY本部',
  '03-0000-0000',
  'THERAPIST_OFFICE',
  1,
  'VERIFIED',
  datetime('now'),
  datetime('now')
);

-- 2. HOGUSY本部オフィスを登録
INSERT OR IGNORE INTO offices (id, user_id, name, area_code, manager_name, contact_email, commission_rate, status, therapist_count, created_at, updated_at)
VALUES (
  'office-hogusy-hq',
  'user-hogusy-hq',
  'HOGUSY本部',
  'TOKYO',
  '総管理者',
  'admin@hogusy.com',
  0,
  'APPROVED',
  0,
  datetime('now'),
  datetime('now')
);

-- 3. 既存の直属セラピスト(office_id = NULL)をHOGUSY本部に紐づける
UPDATE therapist_profiles
SET office_id = 'office-hogusy-hq'
WHERE office_id IS NULL;

-- 4. HOGUSY本部のセラピスト数を更新
UPDATE offices
SET therapist_count = (
  SELECT COUNT(*) FROM therapist_profiles WHERE office_id = 'office-hogusy-hq'
)
WHERE id = 'office-hogusy-hq';
