-- ============================================
-- Soothe x CARE CUBE Japan - Seed Data (開発/テスト用)
-- ============================================

-- Insert test users
INSERT OR IGNORE INTO users (id, email, name, role, kyc_status) VALUES
  ('u1', 'user1@example.com', '山田 太郎', 'USER', 'VERIFIED'),
  ('t1', 'therapist1@example.com', '田中 有紀', 'THERAPIST', 'VERIFIED'),
  ('t2', 'therapist2@example.com', '佐藤 美咲', 'THERAPIST', 'VERIFIED'),
  ('h1', 'host1@example.com', 'ホテルグランド東京', 'HOST', 'VERIFIED'),
  ('off1', 'office1@example.com', '新宿ウェルネス・エージェンシー', 'THERAPIST_OFFICE', 'VERIFIED'),
  ('admin1', 'admin@soothe.jp', 'システム管理者', 'ADMIN', 'VERIFIED');

-- Insert therapist offices
INSERT OR IGNORE INTO therapist_offices (id, name, area, manager_name, contact_email, commission_rate, therapist_count) VALUES
  ('off1', '新宿ウェルネス・エージェンシー', 'SHINJUKU', '佐藤 健', 'sato@shinjuku-w.jp', 15, 2),
  ('off2', 'TOKYO癒やしギルド', 'SHIBUYA', '鈴木 恵子', 'info@healing-g.jp', 12, 1);

-- Insert therapist profiles
INSERT OR IGNORE INTO therapist_profiles (user_id, bio, specialties, rating, review_count, approved_areas, office_id, is_active) VALUES
  ('t1', '10年以上の経験を持つベテランセラピスト', '["深層筋", "アロマオイル"]', 4.9, 120, '["SHINJUKU", "SHIBUYA"]', 'off1', TRUE),
  ('t2', 'ドライヘッドスパのスペシャリスト', '["ヘッドスパ", "リフレクソロジー"]', 4.8, 85, '["SHIBUYA"]', NULL, TRUE);

-- Insert sites
INSERT OR IGNORE INTO sites (id, name, type, address, area, host_id, cube_serial_number, lat, lng, is_active) VALUES
  ('site1', 'ホテルグランド東京', 'HOTEL', '新宿区西新宿 1-1-1', 'SHINJUKU', 'h1', NULL, 35.689, 139.692, TRUE),
  ('site2', 'CARE CUBE 渋谷', 'CARE_CUBE', '渋谷区渋谷 2-2-2', 'SHIBUYA', 'h1', 'CC-SBY-001', 35.659, 139.700, TRUE);

-- Insert test bookings
INSERT OR IGNORE INTO bookings (id, user_id, therapist_id, site_id, office_id, type, status, service_name, duration, scheduled_start, price, payment_status) VALUES
  ('b-101', 'u1', 't1', 'site1', 'off1', 'ONSITE', 'CONFIRMED', '深層筋ボディケア (60分)', 60, datetime('now', '+2 hours'), 8000, 'PAID'),
  ('b-102', 'u1', 't2', 'site2', NULL, 'ONSITE', 'PENDING', 'ドライヘッドスパ (60分)', 60, datetime('now', '+1 day'), 7500, 'PENDING');

-- Insert revenue config
INSERT OR IGNORE INTO revenue_configs (target_month, therapist_percentage, host_percentage, office_percentage, platform_percentage) VALUES
  ('2025-01', 65, 20, 10, 5);

-- Insert test messages
INSERT OR IGNORE INTO messages (id, booking_id, sender_id, content, type) VALUES
  ('msg-1', 'b-101', 'u1', 'よろしくお願いいたします！', 'TEXT'),
  ('msg-2', 'b-101', 't1', 'こちらこそ、よろしくお願いします。時間通りに伺います。', 'TEXT');