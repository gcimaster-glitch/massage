-- Seed data for production (compatible with existing schema)
-- Created: 2026-01-13
-- Note: Only inserts master data and minimal test data

-- ========================================
-- 1. Master Data (PERMANENT)
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

-- System Settings
INSERT OR IGNORE INTO system_settings (key, value, description) VALUES
('platform_fee', '10', 'Platform commission percentage'),
('kyc_required', 'true', 'Whether KYC verification is required'),
('maintenance_mode', 'false', 'System maintenance mode flag');
