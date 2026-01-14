-- Mock Therapist Data with Real Photos
-- Created: 2026-01-13
-- IMPORTANT: This is mock data and can be deleted by admin via DELETE /api/admin/mock-data

-- ========================================
-- Mock Users for Therapists
-- ========================================

INSERT OR IGNORE INTO users (id, email, name, phone, role, email_verified, kyc_status, avatar_url, created_at) VALUES
('t1', 'therapist1@hogusy.com', '田中 美咲', '09011112222', 'THERAPIST', 1, 'VERIFIED', 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&h=400&fit=crop&auto=format', CURRENT_TIMESTAMP),
('t2', 'therapist2@hogusy.com', '佐藤 健太', '09022223333', 'THERAPIST', 1, 'VERIFIED', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&auto=format', CURRENT_TIMESTAMP),
('t3', 'therapist3@hogusy.com', '鈴木 大輔', '09033334444', 'THERAPIST', 1, 'VERIFIED', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&auto=format', CURRENT_TIMESTAMP),
('t4', 'therapist4@hogusy.com', '高橋 愛', '09044445555', 'THERAPIST', 1, 'VERIFIED', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&auto=format', CURRENT_TIMESTAMP),
('t5', 'therapist5@hogusy.com', '伊藤 麻衣', '09055556666', 'THERAPIST', 1, 'VERIFIED', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&auto=format', CURRENT_TIMESTAMP),
('t6', 'therapist6@hogusy.com', '渡辺 優子', '09066667777', 'THERAPIST', 1, 'VERIFIED', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&auto=format', CURRENT_TIMESTAMP),
('t7', 'therapist7@hogusy.com', '山本 さくら', '09077778888', 'THERAPIST', 1, 'VERIFIED', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&auto=format', CURRENT_TIMESTAMP),
('t8', 'therapist8@hogusy.com', '中村 綾香', '09088889999', 'THERAPIST', 1, 'VERIFIED', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&auto=format', CURRENT_TIMESTAMP),
('t9', 'therapist9@hogusy.com', '小林 結衣', '09099990000', 'THERAPIST', 1, 'VERIFIED', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&auto=format', CURRENT_TIMESTAMP),
('t10', 'therapist10@hogusy.com', '加藤 春菜', '09010101111', 'THERAPIST', 1, 'VERIFIED', 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop&auto=format', CURRENT_TIMESTAMP),
('t11', 'therapist11@hogusy.com', '吉田 誠', '09011112222', 'THERAPIST', 1, 'VERIFIED', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&auto=format', CURRENT_TIMESTAMP);

-- ========================================
-- Therapist Profiles
-- Note: Compatible with both schema versions (is_active for production, status for new schema)
-- ========================================

INSERT OR IGNORE INTO therapist_profiles (id, user_id, bio, specialties, rating, review_count, approved_areas, office_id) VALUES
('t1', 't1', '10年以上の経験を持つベテランセラピスト。深層筋へのアプローチが得意で、お客様一人ひとりに合わせた丁寧な施術を心がけています。', '["リラクゼーション", "深層筋マッサージ", "アロマセラピー"]', 4.9, 124, '["SHINJUKU", "SHIBUYA", "MINATO"]', NULL),
('t2', 't2', 'スポーツトレーナー出身のセラピスト。筋膜リリースとスポーツマッサージのスペシャリストです。アスリートの疲労回復もお任せください。', '["スポーツマッサージ", "筋膜リリース", "ストレッチ"]', 4.8, 98, '["SHIBUYA", "MINATO", "CHIYODA"]', NULL),
('t3', 't3', 'トレーニングジムでの経験を活かした施術が得意。体のメンテナンスからパフォーマンス向上までサポートします。', '["スポーツマッサージ", "ボディケア", "コンディショニング"]', 4.7, 76, '["SHINJUKU", "CHIYODA"]', NULL),
('t4', 't4', '看護師資格を持つセラピスト。医学的知識に基づいた安心・安全な施術を提供します。初めての方も安心してご利用ください。', '["メディカルケア", "リラクゼーション", "リンパドレナージュ"]', 4.9, 142, '["MINATO", "SHIBUYA"]', NULL),
('t5', 't5', 'ホテルスパでの経験10年。上質なおもてなしと確かな技術で、心身ともにリフレッシュしていただけます。', '["アロマセラピー", "リラクゼーション", "ヘッドスパ"]', 4.8, 156, '["SHINJUKU", "MINATO"]', NULL),
('t6', 't6', 'アロマセラピーとリラクゼーションのスペシャリスト。自然の香りと心地よいタッチで深いリラックスへと導きます。', '["アロマセラピー", "リラクゼーション", "ホリスティックケア"]', 4.9, 189, '["SHIBUYA", "MINATO", "SHINJUKU"]', NULL),
('t7', 't7', '明るく親しみやすい雰囲気が人気。お客様とのコミュニケーションを大切にし、リピーター率の高い施術を提供します。', '["リラクゼーション", "ボディケア", "フェイシャル"]', 4.8, 134, '["SHINJUKU", "SHIBUYA"]', NULL),
('t8', 't8', 'エステティシャンからセラピストへ転身。美容と健康の両面からアプローチする施術が好評です。', '["ボディケア", "美容整体", "リンパドレナージュ"]', 4.7, 92, '["MINATO", "CHIYODA"]', NULL),
('t9', 't9', '国家資格保有のあん摩マッサージ指圧師。確かな技術と豊富な知識で、お体の不調を根本から改善します。', '["あん摩マッサージ", "指圧", "整体"]', 5.0, 203, '["SHINJUKU", "SHIBUYA", "MINATO", "CHIYODA"]', NULL),
('t10', 't10', 'ヨガインストラクターとしても活動。呼吸と動きを取り入れた独自のボディワークで心身をケアします。', '["ボディワーク", "ストレッチ", "リラクゼーション"]', 4.8, 87, '["SHIBUYA", "MINATO"]', NULL),
('t11', 't11', '鍼灸師・柔道整復師の資格を持つ男性セラピスト。スポーツ選手のケアも多数担当しています。', '["スポーツマッサージ", "整体", "鍼灸"]', 4.9, 167, '["CHIYODA", "MINATO", "SHINJUKU"]', NULL);

-- ========================================
-- Therapist Menu (Courses)
-- ========================================

-- Therapist 1: 田中 美咲 - リラクゼーション系
INSERT OR IGNORE INTO therapist_menu (id, therapist_id, master_course_id, price, is_available) VALUES
('tm1_1', 't1', 'mc_1', 7800, 1),
('tm1_2', 't1', 'mc_2', 10800, 1),
('tm1_3', 't1', 'mc_3', 6800, 1);

-- Therapist 2: 佐藤 健太 - スポーツ系
INSERT OR IGNORE INTO therapist_menu (id, therapist_id, master_course_id, price, is_available) VALUES
('tm2_1', 't2', 'mc_1', 8200, 1),
('tm2_2', 't2', 'mc_10', 10500, 1);

-- Therapist 3: 鈴木 大輔 - トレーニング系
INSERT OR IGNORE INTO therapist_menu (id, therapist_id, master_course_id, price, is_available) VALUES
('tm3_1', 't3', 'mc_1', 7500, 1),
('tm3_2', 't3', 'mc_10', 9800, 1);

-- Therapist 4: 高橋 愛 - メディカル系
INSERT OR IGNORE INTO therapist_menu (id, therapist_id, master_course_id, price, is_available) VALUES
('tm4_1', 't4', 'mc_1', 8500, 1),
('tm4_2', 't4', 'mc_2', 11500, 1);

-- Therapist 5: 伊藤 麻衣 - ホテルスパ系
INSERT OR IGNORE INTO therapist_menu (id, therapist_id, master_course_id, price, is_available) VALUES
('tm5_1', 't5', 'mc_2', 11800, 1),
('tm5_2', 't5', 'mc_3', 7200, 1);

-- Therapist 6: 渡辺 優子 - アロマ系
INSERT OR IGNORE INTO therapist_menu (id, therapist_id, master_course_id, price, is_available) VALUES
('tm6_1', 't6', 'mc_2', 12000, 1),
('tm6_2', 't6', 'mc_3', 7500, 1);

-- Therapist 7: 山本 さくら - 総合系
INSERT OR IGNORE INTO therapist_menu (id, therapist_id, master_course_id, price, is_available) VALUES
('tm7_1', 't7', 'mc_1', 7600, 1),
('tm7_2', 't7', 'mc_2', 10500, 1),
('tm7_3', 't7', 'mc_3', 6500, 1);

-- Therapist 8: 中村 綾香 - 美容系
INSERT OR IGNORE INTO therapist_menu (id, therapist_id, master_course_id, price, is_available) VALUES
('tm8_1', 't8', 'mc_1', 8000, 1),
('tm8_2', 't8', 'mc_2', 11000, 1);

-- Therapist 9: 小林 結衣 - 国家資格系
INSERT OR IGNORE INTO therapist_menu (id, therapist_id, master_course_id, price, is_available) VALUES
('tm9_1', 't9', 'mc_1', 9000, 1),
('tm9_2', 't9', 'mc_2', 12500, 1),
('tm9_3', 't9', 'mc_10', 11000, 1);

-- Therapist 10: 加藤 春菜 - ヨガ系
INSERT OR IGNORE INTO therapist_menu (id, therapist_id, master_course_id, price, is_available) VALUES
('tm10_1', 't10', 'mc_1', 7800, 1),
('tm10_2', 't10', 'mc_10', 10200, 1);

-- Therapist 11: 吉田 誠 - 男性セラピスト・鍼灸系
INSERT OR IGNORE INTO therapist_menu (id, therapist_id, master_course_id, price, is_available) VALUES
('tm11_1', 't11', 'mc_1', 8800, 1),
('tm11_2', 't11', 'mc_10', 11500, 1);

-- ========================================
-- Therapist Options
-- ========================================

-- Add options for all therapists
INSERT OR IGNORE INTO therapist_options (id, therapist_id, master_option_id, price, is_available) VALUES
('to1_1', 't1', 'mo_1', 2000, 1),
('to1_2', 't1', 'mo_2', 0, 1),
('to1_3', 't1', 'mo_24', 1500, 1),

('to2_1', 't2', 'mo_1', 2200, 1),
('to2_2', 't2', 'mo_2', 0, 1),

('to3_1', 't3', 'mo_1', 2000, 1),
('to3_2', 't3', 'mo_2', 0, 1),

('to4_1', 't4', 'mo_1', 2300, 1),
('to4_2', 't4', 'mo_2', 0, 1),
('to4_3', 't4', 'mo_24', 1500, 1),

('to5_1', 't5', 'mo_1', 2500, 1),
('to5_2', 't5', 'mo_2', 0, 1),
('to5_3', 't5', 'mo_24', 1800, 1),

('to6_1', 't6', 'mo_1', 2500, 1),
('to6_2', 't6', 'mo_2', 0, 1),
('to6_3', 't6', 'mo_24', 2000, 1),

('to7_1', 't7', 'mo_1', 2000, 1),
('to7_2', 't7', 'mo_2', 0, 1),

('to8_1', 't8', 'mo_1', 2200, 1),
('to8_2', 't8', 'mo_2', 0, 1),
('to8_3', 't8', 'mo_24', 1500, 1),

('to9_1', 't9', 'mo_1', 2500, 1),
('to9_2', 't9', 'mo_2', 0, 1),

('to10_1', 't10', 'mo_1', 2000, 1),
('to10_2', 't10', 'mo_2', 0, 1),

('to11_1', 't11', 'mo_1', 2300, 1),
('to11_2', 't11', 'mo_2', 0, 1);
