-- テストデータ投入SQL
-- 作成日: 2026-01-20
-- 説明: ローカル開発環境用のテストデータ

-- ========================================
-- 1. テストユーザー作成（一般ユーザー）
-- ========================================
-- パスワード: test1234（bcryptハッシュ）
INSERT OR IGNORE INTO users (id, email, name, phone, role, password_hash, email_verified, created_at) VALUES 
('user-test-1', 'user1@example.com', 'テストユーザー1', '09012345678', 'USER', '$2a$10$N9qo8uLOickgx2ZMRZoMye/IU5YV3j2VyqQJ3LAhHh2kVvt9m4vVW', 1, datetime('now')),
('user-test-2', 'user2@example.com', 'テストユーザー2', '09087654321', 'USER', '$2a$10$N9qo8uLOickgx2ZMRZoMye/IU5YV3j2VyqQJ3LAhHh2kVvt9m4vVW', 1, datetime('now'));

-- ========================================
-- 2. テストユーザー作成（セラピスト）
-- ========================================
-- パスワード: test1234
INSERT OR IGNORE INTO users (id, email, name, phone, role, password_hash, email_verified, created_at) VALUES 
('therapist-test-1', 'therapist1@example.com', '田中 花子', '08011112222', 'THERAPIST', '$2a$10$N9qo8uLOickgx2ZMRZoMye/IU5YV3j2VyqQJ3LAhHh2kVvt9m4vVW', 1, datetime('now')),
('therapist-test-2', 'therapist2@example.com', '佐藤 太郎', '08033334444', 'THERAPIST', '$2a$10$N9qo8uLOickgx2ZMRZoMye/IU5YV3j2VyqQJ3LAhHh2kVvt9m4vVW', 1, datetime('now'));

-- ========================================
-- 3. セラピストプロフィール作成
-- ========================================
INSERT OR IGNORE INTO therapist_profiles (id, user_id, bio, specialties, experience_years, rating, review_count, approved_areas, status, created_at) VALUES 
('profile-test-1', 'therapist-test-1', '経験豊富なセラピストです。お客様一人ひとりに合わせた丁寧な施術を心がけています。', '["リラクゼーション", "メディカルマッサージ", "アロマセラピー"]', 8, 4.8, 156, '["tokyo-shibuya", "tokyo-shinjuku", "tokyo-minato"]', 'APPROVED', datetime('now')),
('profile-test-2', 'therapist-test-2', 'スポーツマッサージを得意とするセラピストです。アスリートのケアに定評があります。', '["スポーツマッサージ", "ストレッチ", "ディープティシュー"]', 5, 4.6, 89, '["tokyo-shibuya", "tokyo-shinjuku"]', 'APPROVED', datetime('now'));

-- ========================================
-- 4. テスト予約データ作成
-- ========================================
-- 今日から2時間後の予約（CONFIRMED）
INSERT OR IGNORE INTO bookings (id, user_id, therapist_id, therapist_name, type, status, service_name, duration, price, location, scheduled_at, created_at) VALUES 
('booking-test-1', 'user-test-1', 'therapist-test-1', '田中 花子', 'ONSITE', 'CONFIRMED', 'リラクゼーションマッサージ 60分', 60, 8000, '渋谷CARE CUBE 3F-301', datetime('now', '+2 hours'), datetime('now', '-1 day'));

-- 明日の予約（CONFIRMED）
INSERT OR IGNORE INTO bookings (id, user_id, therapist_id, therapist_name, type, status, service_name, duration, price, location, scheduled_at, created_at) VALUES 
('booking-test-2', 'user-test-2', 'therapist-test-2', '佐藤 太郎', 'MOBILE', 'CONFIRMED', 'スポーツマッサージ 90分', 90, 12000, '東京都渋谷区〇〇1-2-3', datetime('now', '+1 day'), datetime('now', '-2 hours'));

-- 昨日の予約（COMPLETED）
INSERT OR IGNORE INTO bookings (id, user_id, therapist_id, therapist_name, type, status, service_name, duration, price, location, scheduled_at, started_at, completed_at, created_at) VALUES 
('booking-test-3', 'user-test-1', 'therapist-test-1', '田中 花子', 'ONSITE', 'COMPLETED', 'メディカルマッサージ 60分', 60, 8000, '新宿CARE CUBE 2F-205', datetime('now', '-1 day'), datetime('now', '-1 day', '+1 hour'), datetime('now', '-1 day', '+2 hours'), datetime('now', '-3 days'));

-- ========================================
-- 5. 管理者ユーザー作成
-- ========================================
-- パスワード: admin1234
INSERT OR IGNORE INTO users (id, email, name, phone, role, password_hash, email_verified, created_at) VALUES 
('admin-test-1', 'admin@hogusy.com', 'システム管理者', '08099998888', 'ADMIN', '$2a$10$N9qo8uLOickgx2ZMRZoMye/IU5YV3j2VyqQJ3LAhHh2kVvt9m4vVW', 1, datetime('now'));
