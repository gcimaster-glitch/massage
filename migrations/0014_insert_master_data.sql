-- Migration: Insert master data (courses and options)
-- Created: 2026-01-17
-- Description: Insert master courses and options from constants.ts into database

-- ========================================
-- 1. Insert Master Courses
-- ========================================

-- Clear existing data (optional - only for fresh setup)
-- DELETE FROM master_courses;

INSERT OR IGNORE INTO master_courses (id, name, duration, category, description, base_price, created_at) VALUES
('course-1', '整体コース（60分）', 60, 'GENERAL', '全身の疲れをほぐす整体コース', 8000, CURRENT_TIMESTAMP),
('course-2', 'リラクゼーション（90分）', 90, 'RELAXATION', 'じっくりとリラックスできるコース', 12000, CURRENT_TIMESTAMP),
('course-3', 'ショートコース（30分）', 30, 'GENERAL', '肩・首を集中的にほぐすコース', 5000, CURRENT_TIMESTAMP),
('mc_1', '深層筋ボディケア', 30, 'SPORTS', '短時間で疲れをリフレッシュ', 3000, CURRENT_TIMESTAMP),
('mc_2', '極上アロマオイル', 60, 'RELAXATION', 'じっくりと全身をほぐす', 6000, CURRENT_TIMESTAMP),
('mc_3', 'ドライヘッドスパ', 90, 'HEAD', '全身しっかりケア', 9000, CURRENT_TIMESTAMP);

-- ========================================
-- 2. Insert Master Options
-- ========================================

-- Clear existing data (optional - only for fresh setup)
-- DELETE FROM master_options;

INSERT OR IGNORE INTO master_options (id, name, duration, base_price, description, created_at) VALUES
('option-1', 'ヘッドマッサージ追加', 15, 2000, '頭皮をほぐしてリフレッシュ', CURRENT_TIMESTAMP),
('option-2', 'フットケア追加', 15, 1500, '足裏をじっくりほぐす', CURRENT_TIMESTAMP),
('option-3', 'アロマオイル', 0, 1000, 'リラックス効果のあるアロマオイル', CURRENT_TIMESTAMP),
('option-aroma', 'アロマオイル', 0, 1000, '上質なアロマオイルで癒し効果UP', CURRENT_TIMESTAMP),
('option-head', 'ヘッドマッサージ', 15, 1500, '頭皮のコリをほぐして頭スッキリ', CURRENT_TIMESTAMP),
('option-foot', '足つぼマッサージ', 15, 1500, '足裏の反射区を刺激', CURRENT_TIMESTAMP),
('option-stretch', 'ストレッチ', 10, 1000, 'プロによるストレッチ', CURRENT_TIMESTAMP);

-- ========================================
-- 3. Insert Master Areas (Tokyo wards)
-- ========================================

-- Clear existing data (optional - only for fresh setup)
-- DELETE FROM master_areas;

INSERT OR IGNORE INTO master_areas (code, name, prefecture, city, created_at) VALUES
('shibuya', '渋谷区', '東京都', '渋谷区', CURRENT_TIMESTAMP),
('shinjuku', '新宿区', '東京都', '新宿区', CURRENT_TIMESTAMP),
('minato', '港区', '東京都', '港区', CURRENT_TIMESTAMP),
('chiyoda', '千代田区', '東京都', '千代田区', CURRENT_TIMESTAMP),
('chuo', '中央区', '東京都', '中央区', CURRENT_TIMESTAMP),
('shinagawa', '品川区', '東京都', '品川区', CURRENT_TIMESTAMP),
('setagaya', '世田谷区', '東京都', '世田谷区', CURRENT_TIMESTAMP),
('toshima', '豊島区', '東京都', '豊島区', CURRENT_TIMESTAMP);
