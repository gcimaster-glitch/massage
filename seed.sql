-- Seed data for HOGUSY platform
-- Created: 2026-01-13
-- Description: Sample data for testing and demonstration
-- IMPORTANT: This data can be deleted by admin via DELETE ALL MOCK DATA button

-- ========================================
-- 1. Master Data (PERMANENT - Not deleted by admin)
-- ========================================

-- Master Areas
INSERT OR IGNORE INTO master_areas (code, name, prefecture, city) VALUES
('SHINJUKU', '新宿エリア', '東京都', '新宿区'),
('SHIBUYA', '渋谷エリア', '東京都', '渋谷区'),
('MINATO', '港区エリア', '東京都', '港区'),
('CHIYODA', '千代田エリア', '東京都', '千代田区');

-- Master Courses
INSERT OR IGNORE INTO master_courses (id, name, duration, category, description, base_price) VALUES
('mc_1', '深層筋ボディケア', 60, 'GENERAL', '深層筋膜へアプローチする本格施術', 7000),
('mc_2', '極上アロマオイル', 90, 'RELAXATION', '上質なアロマで心身を癒やす', 10000),
('mc_3', 'ドライヘッドスパ', 60, 'HEAD', '頭部集中ケアでリフレッシュ', 6500),
('mc_10', '筋膜リリース・リカバリー', 90, 'RECOVERY', 'スポーツ後の疲労回復に特化', 9500);

-- Master Options
INSERT OR IGNORE INTO master_options (id, name, duration, base_price, description) VALUES
('mo_1', '延長15分', 15, 2000, '施術時間を15分延長'),
('mo_2', '指名予約', 0, 0, 'セラピストを指名する'),
('mo_24', 'プレミアムCBDバーム', 0, 1500, '高品質CBDバームを使用');

-- Revenue Config (default split)
INSERT OR IGNORE INTO revenue_config (id, target_month, therapist_percentage, host_percentage, affiliate_percentage, platform_percentage) VALUES
('rc_default', '2026-01', 65.0, 20.0, 5.0, 10.0);

-- ========================================
-- 2. Mock Users (DELETABLE by admin)
-- ========================================

-- Admin User
INSERT OR IGNORE INTO users (id, email, name, phone, role, email_verified, kyc_status) VALUES
('admin1', 'admin@hogusy.com', '運営管理者', '09012345678', 'ADMIN', 1, 'VERIFIED');

-- General Users
INSERT OR IGNORE INTO users (id, email, name, phone, role, email_verified, kyc_status) VALUES
('u1', 'user1@example.com', '山田 太郎', '08011112222', 'USER', 1, 'VERIFIED'),
('u2', 'user2@example.com', '佐藤 花子', '08033334444', 'USER', 1, 'VERIFIED'),
('u3', 'user3@example.com', '鈴木 一郎', '08055556666', 'USER', 0, 'PENDING');

-- Therapist Users
INSERT OR IGNORE INTO users (id, email, name, phone, role, email_verified, kyc_status) VALUES
('t1', 'tanaka@example.com', '田中 有紀', '09011112222', 'THERAPIST', 1, 'VERIFIED'),
('t2', 'sato@example.com', '佐藤 花子', '09033334444', 'THERAPIST', 1, 'VERIFIED'),
('t3', 'watanabe@example.com', '渡辺 健', '09055556666', 'THERAPIST', 1, 'VERIFIED');

-- Host Users
INSERT OR IGNORE INTO users (id, email, name, phone, role, email_verified, kyc_status) VALUES
('h1', 'hotel@example.com', 'ホテル担当者', '0312345678', 'HOST', 1, 'VERIFIED'),
('h2', 'office@example.com', 'オフィス担当者', '0398765432', 'HOST', 1, 'VERIFIED');

-- Office Users
INSERT OR IGNORE INTO users (id, email, name, phone, role, email_verified, kyc_status) VALUES
('off1', 'shinjuku@example.com', '新宿ウェルネス', '0312340001', 'THERAPIST_OFFICE', 1, 'VERIFIED'),
('off2', 'tokyo@example.com', 'TOKYO癒やしギルド', '0312340002', 'THERAPIST_OFFICE', 1, 'VERIFIED');

-- Affiliate User
INSERT OR IGNORE INTO users (id, email, name, phone, role, email_verified, kyc_status) VALUES
('aff1', 'affiliate@example.com', 'アフィリエイター太郎', '09099990000', 'AFFILIATE', 1, 'VERIFIED');

-- ========================================
-- 3. Offices (DELETABLE by admin)
-- ========================================

INSERT OR IGNORE INTO offices (id, user_id, name, area_code, manager_name, contact_email, commission_rate, therapist_count, status) VALUES
('off1', 'off1', '新宿ウェルネス・エージェンシー', 'SHINJUKU', '佐藤 健', 'sato@shinjuku-w.jp', 15.0, 2, 'APPROVED'),
('off2', 'off2', 'TOKYO癒やしギルド', 'SHIBUYA', '鈴木 恵子', 'info@healing-g.jp', 12.0, 1, 'APPROVED');

-- ========================================
-- 4. Therapist Profiles (DELETABLE by admin)
-- ========================================

INSERT OR IGNORE INTO therapist_profiles (id, user_id, office_id, bio, specialties, experience_years, certifications, rating, review_count, approved_areas, status) VALUES
('t1', 't1', 'off1', '10年以上の経験を持つベテランセラピスト。深層筋へのアプローチが得意です。', '["リラクゼーション", "スポーツマッサージ"]', 10, '["国家資格あん摩マッサージ指圧師", "アロマテラピー検定1級"]', 4.9, 120, '["SHINJUKU", "SHIBUYA"]', 'APPROVED'),
('t2', 't2', 'off1', '女性限定の丁寧な施術で人気。アロマオイルが得意です。', '["アロマセラピー", "リラクゼーション"]', 5, '["アロマテラピーインストラクター"]', 4.8, 85, '["SHINJUKU", "MINATO"]', 'APPROVED'),
('t3', 't3', 'off2', 'スポーツトレーナー出身。筋膜リリースのスペシャリスト。', '["筋膜リリース", "スポーツマッサージ"]', 7, '["NSCA-CPT", "筋膜リリース認定セラピスト"]', 4.7, 65, '["SHIBUYA", "MINATO"]', 'APPROVED');

-- ========================================
-- 5. Therapist Menu (DELETABLE by admin)
-- ========================================

-- Therapist 1 menu
INSERT OR IGNORE INTO therapist_menu (id, therapist_id, master_course_id, price, is_available) VALUES
('tm1_1', 't1', 'mc_1', 7480, 1),
('tm1_2', 't1', 'mc_10', 9800, 1);

INSERT OR IGNORE INTO therapist_options (id, therapist_id, master_option_id, price, is_available) VALUES
('to1_1', 't1', 'mo_1', 2000, 1),
('to1_2', 't1', 'mo_2', 0, 1);

-- Therapist 2 menu
INSERT OR IGNORE INTO therapist_menu (id, therapist_id, master_course_id, price, is_available) VALUES
('tm2_1', 't2', 'mc_2', 10500, 1),
('tm2_2', 't2', 'mc_1', 7200, 1);

INSERT OR IGNORE INTO therapist_options (id, therapist_id, master_option_id, price, is_available) VALUES
('to2_1', 't2', 'mo_1', 1800, 1),
('to2_2', 't2', 'mo_24', 1500, 1);

-- Therapist 3 menu
INSERT OR IGNORE INTO therapist_menu (id, therapist_id, master_course_id, price, is_available) VALUES
('tm3_1', 't3', 'mc_10', 9500, 1),
('tm3_2', 't3', 'mc_1', 7000, 1);

INSERT OR IGNORE INTO therapist_options (id, therapist_id, master_option_id, price, is_available) VALUES
('to3_1', 't3', 'mo_1', 2200, 1);

-- ========================================
-- 6. Sites (DELETABLE by admin)
-- ========================================

INSERT OR IGNORE INTO sites (id, host_id, name, type, address, area_code, latitude, longitude, room_count, amenities, status) VALUES
('site1', 'h1', 'ホテルグランド東京', 'HOTEL', '新宿区西新宿 1-1-1', 'SHINJUKU', 35.6895, 139.6917, 5, '["Wi-Fi", "駐車場", "24時間対応"]', 'APPROVED'),
('site2', 'h2', 'CARE CUBE 渋谷', 'OFFICE', '渋谷区渋谷 2-2-2', 'SHIBUYA', 35.6598, 139.7006, 3, '["Wi-Fi", "受付常駐", "ドリンクサービス"]', 'APPROVED');

-- Site Rooms
INSERT OR IGNORE INTO site_rooms (id, site_id, room_number, is_available) VALUES
('room1', 'site1', 'CUBE-001', 1),
('room2', 'site1', 'CUBE-002', 1),
('room3', 'site1', 'CUBE-003', 1),
('room4', 'site2', 'Room-A', 1),
('room5', 'site2', 'Room-B', 1);

-- ========================================
-- 7. Bookings (DELETABLE by admin)
-- ========================================

INSERT OR IGNORE INTO bookings (id, user_id, therapist_id, therapist_name, office_id, site_id, room_id, type, status, service_name, duration, price, location, address_visibility, scheduled_at) VALUES
('b-101', 'u1', 't1', '田中 有紀', 'off1', 'site1', 'room1', 'ONSITE', 'CONFIRMED', '深層筋ボディケア (60分)', 60, 8000, 'ホテルグランド東京 3F, CUBE-001', 'FULL', '2026-01-20 14:00:00'),
('b-102', 'u2', 't2', '佐藤 花子', 'off1', 'site2', 'room4', 'ONSITE', 'COMPLETED', '極上アロマオイル (90分)', 90, 10500, 'CARE CUBE 渋谷 Room-A', 'FULL', '2026-01-15 10:00:00'),
('b-103', 'u1', 't3', '渡辺 健', 'off2', NULL, NULL, 'HOME', 'CONFIRMED', '筋膜リリース・リカバリー (90分)', 90, 9500, '東京都港区', 'PARTIAL', '2026-01-22 16:00:00');

-- Booking Items
INSERT OR IGNORE INTO booking_items (id, booking_id, item_type, item_id, item_name, price) VALUES
('bi-101-1', 'b-101', 'COURSE', 'mc_1', '深層筋ボディケア (60分)', 7480),
('bi-101-2', 'b-101', 'OPTION', 'mo_2', '指名予約', 0),
('bi-102-1', 'b-102', 'COURSE', 'mc_2', '極上アロマオイル (90分)', 10500),
('bi-103-1', 'b-103', 'COURSE', 'mc_10', '筋膜リリース・リカバリー (90分)', 9500);

-- ========================================
-- 8. Reviews (DELETABLE by admin)
-- ========================================

INSERT OR IGNORE INTO reviews (id, booking_id, user_id, therapist_id, rating, comment, is_public) VALUES
('rev-102', 'b-102', 'u2', 't2', 5, '非常に丁寧な施術で、心身ともにリフレッシュできました。また利用したいです！', 1);

-- ========================================
-- 9. Payments (DELETABLE by admin)
-- ========================================

INSERT OR IGNORE INTO payments (id, booking_id, user_id, amount, status, payment_method) VALUES
('pay-101', 'b-101', 'u1', 8000, 'COMPLETED', 'card'),
('pay-102', 'b-102', 'u2', 10500, 'COMPLETED', 'card'),
('pay-103', 'b-103', 'u1', 9500, 'PENDING', 'card');

-- ========================================
-- 10. Incidents (DELETABLE by admin)
-- ========================================

INSERT OR IGNORE INTO incidents (id, booking_id, reporter_id, reporter_role, severity, type, description, status) VALUES
('inc-1', 'b-101', 'u1', 'USER', 'MEDIUM', '不審な接触', 'セラピストから不適切な提案がありました。', 'RESOLVED'),
('inc-2', 'b-101', 't1', 'THERAPIST', 'CRITICAL', 'SOS発報', 'お客様の様子がおかしいため緊急報告します。', 'OPEN');

-- Incident Actions
INSERT OR IGNORE INTO incident_actions (id, incident_id, admin_id, action_type, notes) VALUES
('ia-1', 'inc-1', 'admin1', '警告', 'セラピストに対して厳重注意を行いました。');

-- ========================================
-- 11. Affiliates (DELETABLE by admin)
-- ========================================

INSERT OR IGNORE INTO affiliates (id, user_id, affiliate_code, commission_rate, total_referrals, total_earnings, status) VALUES
('aff1', 'aff1', 'AFF-TARO-2026', 5.0, 2, 1050, 'ACTIVE');

-- Affiliate Referrals
INSERT OR IGNORE INTO affiliate_referrals (id, affiliate_id, referred_user_id, booking_id, commission_amount, status) VALUES
('ref-1', 'aff1', 'u2', 'b-102', 525, 'CONFIRMED'),
('ref-2', 'aff1', 'u3', NULL, 0, 'PENDING');

-- ========================================
-- 12. Notifications (DELETABLE by admin)
-- ========================================

INSERT OR IGNORE INTO notifications (id, user_id, type, title, message, is_read) VALUES
('notif-1', 'u1', 'BOOKING_CONFIRMED', '予約確定', 'ご予約が確定しました。1月20日 14:00 - 田中 有紀', 0),
('notif-2', 't1', 'NEW_BOOKING', '新規予約', '新しい予約が入りました。1月20日 14:00', 1),
('notif-3', 'admin1', 'INCIDENT_REPORTED', 'インシデント報告', 'ユーザーからインシデント報告がありました。', 0);

-- ========================================
-- 13. Financial Statements (DELETABLE by admin)
-- ========================================

INSERT OR IGNORE INTO financial_statements (id, user_id, user_role, user_name, target_month, total_sales, payout_amount, status, details) VALUES
('stmt-off1-202601', 'off1', 'THERAPIST_OFFICE', '新宿ウェルネス・エージェンシー', '2026-01', 18500, 15725, 'DRAFT', '[{"booking_id":"b-101","date":"2026-01-20","amount":8000,"description":"田中 有紀 施術分"},{"booking_id":"b-102","date":"2026-01-15","amount":10500,"description":"佐藤 花子 施術分"}]');

-- ========================================
-- System Settings (PERMANENT - Not deleted by admin)
-- ========================================

INSERT OR IGNORE INTO system_settings (key, value, description) VALUES
('platform_fee', '10', 'Platform commission percentage'),
('kyc_required', 'true', 'Whether KYC verification is required'),
('maintenance_mode', 'false', 'System maintenance mode flag');
