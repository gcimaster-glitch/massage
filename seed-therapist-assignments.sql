-- =====================================================
-- セラピストの事務所割り当て
-- 11名のセラピストを3つの事務所に割り当て
-- =====================================================

-- =====================================================
-- HOGUSY本部（プロパー）: 5名
-- 東京駅エリア、コミッション率0%
-- =====================================================

UPDATE therapist_profiles SET office_id = 'off-hogusy-hq' WHERE user_id = 't1';  -- 田中 美咲
UPDATE therapist_profiles SET office_id = 'off-hogusy-hq' WHERE user_id = 't4';  -- 高橋 さくら
UPDATE therapist_profiles SET office_id = 'off-hogusy-hq' WHERE user_id = 't6';  -- 渡辺 由美
UPDATE therapist_profiles SET office_id = 'off-hogusy-hq' WHERE user_id = 't9';  -- 小林 優子
UPDATE therapist_profiles SET office_id = 'off-hogusy-hq' WHERE user_id = 't10'; -- 加藤 真理子

-- =====================================================
-- 六本木ウェルネスセンター: 4名
-- 六本木エリア、コミッション率15%
-- =====================================================

UPDATE therapist_profiles SET office_id = 'off-roppongi-wellness' WHERE user_id = 't2';  -- 佐藤 健太
UPDATE therapist_profiles SET office_id = 'off-roppongi-wellness' WHERE user_id = 't5';  -- 伊藤 麻衣
UPDATE therapist_profiles SET office_id = 'off-roppongi-wellness' WHERE user_id = 't7';  -- 山本 彩花
UPDATE therapist_profiles SET office_id = 'off-roppongi-wellness' WHERE user_id = 't11'; -- 吉田 拓也

-- =====================================================
-- 新宿ヒーリングラボ: 2名
-- 新宿エリア、コミッション率12%
-- =====================================================

UPDATE therapist_profiles SET office_id = 'off-shinjuku-healing' WHERE user_id = 't3';  -- 鈴木 大輔
UPDATE therapist_profiles SET office_id = 'off-shinjuku-healing' WHERE user_id = 't8';  -- 中村 愛

-- =====================================================
-- 完了統計:
-- - HOGUSY本部: 5名（女性5名）
-- - 六本木: 4名（男性1名、女性3名）
-- - 新宿: 2名（男性1名、女性1名）
-- - 合計: 11名のセラピスト
-- =====================================================
