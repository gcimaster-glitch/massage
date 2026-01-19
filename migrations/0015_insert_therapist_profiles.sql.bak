-- Migration: Insert therapist data from constants.ts
-- Created: 2026-01-17
-- Description: Insert 11 therapists with their profiles

-- ========================================
-- 1. Insert Users for Therapists
-- ========================================

INSERT OR IGNORE INTO users (id, email, name, phone, role, avatar_url, kyc_status, created_at) VALUES
('therapist-1', 'misaki.tanaka@hogusy.com', '田中 美咲', '090-1234-5678', 'THERAPIST', '/therapists/therapist-1.jpg', 'VERIFIED', CURRENT_TIMESTAMP),
('therapist-2', 'takeshi.sato@hogusy.com', '佐藤 武志', '090-2345-6789', 'THERAPIST', '/therapists/therapist-2.jpg', 'VERIFIED', CURRENT_TIMESTAMP),
('therapist-3', 'kenji.yamada@hogusy.com', '山田 健二', '090-3456-7890', 'THERAPIST', '/therapists/therapist-3.jpg', 'VERIFIED', CURRENT_TIMESTAMP),
('therapist-4', 'yui.kobayashi@hogusy.com', '小林 結衣', '090-4567-8901', 'THERAPIST', 'https://www.genspark.ai/api/files/s/kMBUm4hm', 'VERIFIED', CURRENT_TIMESTAMP),
('therapist-5', 'ayumi.watanabe@hogusy.com', '渡辺 あゆみ', '090-5678-9012', 'THERAPIST', 'https://www.genspark.ai/api/files/s/0RIiDbmp', 'VERIFIED', CURRENT_TIMESTAMP),
('therapist-6', 'hiroki.kato@hogusy.com', '加藤 浩樹', '090-6789-0123', 'THERAPIST', 'https://www.genspark.ai/api/files/s/iLvjbJLH', 'VERIFIED', CURRENT_TIMESTAMP),
('therapist-7', 'sakura.nakamura@hogusy.com', '中村 さくら', '090-7890-1234', 'THERAPIST', 'https://www.genspark.ai/api/files/s/rmby81Es', 'VERIFIED', CURRENT_TIMESTAMP),
('therapist-8', 'rina.yamamoto@hogusy.com', '山本 梨奈', '090-8901-2345', 'THERAPIST', 'https://www.genspark.ai/api/files/s/iqRVJzGE', 'VERIFIED', CURRENT_TIMESTAMP),
('therapist-9', 'yuka.ito@hogusy.com', '伊藤 優香', '090-9012-3456', 'THERAPIST', 'https://www.genspark.ai/api/files/s/jl395HcH', 'VERIFIED', CURRENT_TIMESTAMP),
('therapist-10', 'mika.suzuki@hogusy.com', '鈴木 美香', '090-0123-4567', 'THERAPIST', 'https://www.genspark.ai/api/files/s/hg4hZj91', 'VERIFIED', CURRENT_TIMESTAMP),
('therapist-11', 'daichi.takahashi@hogusy.com', '高橋 大地', '090-1234-6789', 'THERAPIST', 'https://www.genspark.ai/api/files/s/dlavRDmC', 'VERIFIED', CURRENT_TIMESTAMP);

-- ========================================
-- 2. Insert Therapist Profiles
-- ========================================

INSERT OR IGNORE INTO therapist_profiles (id, user_id, bio, specialties, experience_years, rating, review_count, approved_areas, status, created_at) VALUES
('tp-1', 'therapist-1', '看護師資格を持つベテランセラピスト。医療知識を活かした丁寧な施術で、お客様一人ひとりの体調に合わせたケアを提供します。', '["メディカルマッサージ", "リラクゼーション", "アロマセラピー"]', 10, 4.9, 342, '["shibuya", "shinjuku", "minato"]', 'APPROVED', CURRENT_TIMESTAMP),
('tp-2', 'therapist-2', 'スポーツトレーナー出身の男性セラピスト。筋膜リリースとスポーツマッサージで、アスリートから一般の方まで幅広く対応。', '["スポーツマッサージ", "筋膜リリース", "ストレッチ"]', 8, 4.8, 298, '["shibuya", "shinjuku", "minato"]', 'APPROVED', CURRENT_TIMESTAMP),
('tp-3', 'therapist-3', '整体院での経験を活かした施術が得意。深層筋へのアプローチで根本から体を改善します。', '["整体", "深層筋マッサージ", "姿勢改善"]', 12, 4.7, 134, '["shibuya", "shinjuku", "minato"]', 'APPROVED', CURRENT_TIMESTAMP),
('tp-4', 'therapist-4', '看護師としての経験を活かし、丁寧で安心感のある施術を心がけています。女性のお客様に人気です。', '["リラクゼーション", "リンパドレナージュ", "メディカルケア"]', 6, 4.7, 234, '["shibuya", "shinjuku", "minato"]', 'APPROVED', CURRENT_TIMESTAMP),
('tp-5', 'therapist-5', '受付スタッフとしても活躍。お客様とのコミュニケーションを大切にし、心身ともにリラックスできる施術を提供。', '["リラクゼーション", "ボディケア", "ヘッドスパ"]', 4, 4.6, 187, '["shibuya", "shinjuku", "minato"]', 'APPROVED', CURRENT_TIMESTAMP),
('tp-6', 'therapist-6', 'エステティシャン出身の男性セラピスト。美容と健康の両面からアプローチする施術が特徴です。', '["美容整体", "リンパドレナージュ", "デトックス"]', 7, 4.7, 265, '["shibuya", "shinjuku", "minato"]', 'APPROVED', CURRENT_TIMESTAMP),
('tp-7', 'therapist-7', '明るく親しみやすい雰囲気が魅力。初めての方でもリラックスして施術を受けていただけます。', '["リラクゼーション", "アロマセラピー", "ストレッチ"]', 5, 4.8, 213, '["shibuya", "shinjuku", "minato"]', 'APPROVED', CURRENT_TIMESTAMP),
('tp-8', 'therapist-8', '笑顔が素敵なセラピスト。お客様の悩みに寄り添った丁寧なカウンセリングと施術を提供。', '["リラクゼーション", "ボディケア", "フットケア"]', 6, 4.7, 198, '["shibuya", "shinjuku", "minato"]', 'APPROVED', CURRENT_TIMESTAMP),
('tp-9', 'therapist-9', '国家資格保有のあん摩マッサージ指圧師。確かな技術で根本から体の不調を改善します。', '["あん摩", "指圧", "マッサージ"]', 9, 4.9, 378, '["shibuya", "shinjuku", "minato"]', 'APPROVED', CURRENT_TIMESTAMP),
('tp-10', 'therapist-10', 'ヨガインストラクターとしても活動。呼吸と体のバランスを整える施術が特徴です。', '["ヨガセラピー", "ストレッチ", "バランス調整"]', 7, 4.8, 289, '["shibuya", "shinjuku", "minato"]', 'APPROVED', CURRENT_TIMESTAMP),
('tp-11', 'therapist-11', '鍼灸師・柔道整復師の資格保有。スポーツ障害や慢性痛の改善を得意としています。', '["鍼灸", "柔道整復", "スポーツ障害"]', 11, 4.9, 423, '["shibuya", "shinjuku", "minato"]', 'APPROVED', CURRENT_TIMESTAMP);

-- ========================================
-- 3. Insert Therapist Menu (各セラピストに全コースを割り当て)
-- ========================================

-- Therapist 1
INSERT OR IGNORE INTO therapist_menu (id, therapist_id, master_course_id, price, is_available, created_at) VALUES
('tm-1-1', 'tp-1', 'course-1', 8000, 1, CURRENT_TIMESTAMP),
('tm-1-2', 'tp-1', 'course-2', 12000, 1, CURRENT_TIMESTAMP),
('tm-1-3', 'tp-1', 'course-3', 5000, 1, CURRENT_TIMESTAMP);

-- Therapist 2
INSERT OR IGNORE INTO therapist_menu (id, therapist_id, master_course_id, price, is_available, created_at) VALUES
('tm-2-1', 'tp-2', 'course-1', 8000, 1, CURRENT_TIMESTAMP),
('tm-2-2', 'tp-2', 'course-2', 12000, 1, CURRENT_TIMESTAMP),
('tm-2-3', 'tp-2', 'course-3', 5000, 1, CURRENT_TIMESTAMP);

-- Therapist 3
INSERT OR IGNORE INTO therapist_menu (id, therapist_id, master_course_id, price, is_available, created_at) VALUES
('tm-3-1', 'tp-3', 'course-1', 8000, 1, CURRENT_TIMESTAMP),
('tm-3-2', 'tp-3', 'course-2', 12000, 1, CURRENT_TIMESTAMP),
('tm-3-3', 'tp-3', 'course-3', 5000, 1, CURRENT_TIMESTAMP);

-- Therapist 4
INSERT OR IGNORE INTO therapist_menu (id, therapist_id, master_course_id, price, is_available, created_at) VALUES
('tm-4-1', 'tp-4', 'course-1', 8000, 1, CURRENT_TIMESTAMP),
('tm-4-2', 'tp-4', 'course-2', 12000, 1, CURRENT_TIMESTAMP),
('tm-4-3', 'tp-4', 'course-3', 5000, 1, CURRENT_TIMESTAMP);

-- Therapist 5
INSERT OR IGNORE INTO therapist_menu (id, therapist_id, master_course_id, price, is_available, created_at) VALUES
('tm-5-1', 'tp-5', 'course-1', 8000, 1, CURRENT_TIMESTAMP),
('tm-5-2', 'tp-5', 'course-2', 12000, 1, CURRENT_TIMESTAMP),
('tm-5-3', 'tp-5', 'course-3', 5000, 1, CURRENT_TIMESTAMP);

-- Therapist 6
INSERT OR IGNORE INTO therapist_menu (id, therapist_id, master_course_id, price, is_available, created_at) VALUES
('tm-6-1', 'tp-6', 'course-1', 8000, 1, CURRENT_TIMESTAMP),
('tm-6-2', 'tp-6', 'course-2', 12000, 1, CURRENT_TIMESTAMP),
('tm-6-3', 'tp-6', 'course-3', 5000, 1, CURRENT_TIMESTAMP);

-- Therapist 7
INSERT OR IGNORE INTO therapist_menu (id, therapist_id, master_course_id, price, is_available, created_at) VALUES
('tm-7-1', 'tp-7', 'course-1', 8000, 1, CURRENT_TIMESTAMP),
('tm-7-2', 'tp-7', 'course-2', 12000, 1, CURRENT_TIMESTAMP),
('tm-7-3', 'tp-7', 'course-3', 5000, 1, CURRENT_TIMESTAMP);

-- Therapist 8
INSERT OR IGNORE INTO therapist_menu (id, therapist_id, master_course_id, price, is_available, created_at) VALUES
('tm-8-1', 'tp-8', 'course-1', 8000, 1, CURRENT_TIMESTAMP),
('tm-8-2', 'tp-8', 'course-2', 12000, 1, CURRENT_TIMESTAMP),
('tm-8-3', 'tp-8', 'course-3', 5000, 1, CURRENT_TIMESTAMP);

-- Therapist 9
INSERT OR IGNORE INTO therapist_menu (id, therapist_id, master_course_id, price, is_available, created_at) VALUES
('tm-9-1', 'tp-9', 'course-1', 8000, 1, CURRENT_TIMESTAMP),
('tm-9-2', 'tp-9', 'course-2', 12000, 1, CURRENT_TIMESTAMP),
('tm-9-3', 'tp-9', 'course-3', 5000, 1, CURRENT_TIMESTAMP);

-- Therapist 10
INSERT OR IGNORE INTO therapist_menu (id, therapist_id, master_course_id, price, is_available, created_at) VALUES
('tm-10-1', 'tp-10', 'course-1', 8000, 1, CURRENT_TIMESTAMP),
('tm-10-2', 'tp-10', 'course-2', 12000, 1, CURRENT_TIMESTAMP),
('tm-10-3', 'tp-10', 'course-3', 5000, 1, CURRENT_TIMESTAMP);

-- Therapist 11
INSERT OR IGNORE INTO therapist_menu (id, therapist_id, master_course_id, price, is_available, created_at) VALUES
('tm-11-1', 'tp-11', 'course-1', 8000, 1, CURRENT_TIMESTAMP),
('tm-11-2', 'tp-11', 'course-2', 12000, 1, CURRENT_TIMESTAMP),
('tm-11-3', 'tp-11', 'course-3', 5000, 1, CURRENT_TIMESTAMP);

-- ========================================
-- 4. Insert Therapist Options (各セラピストに全オプションを割り当て)
-- ========================================

-- All therapists (1-11) get all options
INSERT OR IGNORE INTO therapist_options (id, therapist_id, master_option_id, price, is_available, created_at) 
SELECT 
  'to-' || tp.id || '-' || mo.id,
  tp.id,
  mo.id,
  mo.base_price,
  1,
  CURRENT_TIMESTAMP
FROM therapist_profiles tp
CROSS JOIN master_options mo
WHERE tp.id IN ('tp-1', 'tp-2', 'tp-3', 'tp-4', 'tp-5', 'tp-6', 'tp-7', 'tp-8', 'tp-9', 'tp-10', 'tp-11');
