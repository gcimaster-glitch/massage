-- ============================================
-- デモデータ投入SQL
-- ============================================

-- ホストユーザー作成
INSERT OR IGNORE INTO users (id, email, name, role, phone, email_verified, created_at) VALUES
('host-shibuya', 'host.shibuya@hogusy.com', '渋谷マネージャー', 'HOST', '03-1234-5678', 1, datetime('now')),
('host-shinjuku', 'host.shinjuku@hogusy.com', '新宿マネージャー', 'HOST', '03-2345-6789', 1, datetime('now')),
('host-roppongi', 'host.roppongi@hogusy.com', '六本木マネージャー', 'HOST', '03-3456-7890', 1, datetime('now'));

-- 施設データ投入
INSERT OR IGNORE INTO sites (id, host_id, name, type, address, area, lat, lng, amenities, status, room_count, created_at) VALUES
('site-shibuya-1', 'host-shibuya', 'HOGUSY 渋谷スタジオ', 'HOTEL', '東京都渋谷区道玄坂2-10-7', '渋谷区', 35.6595, 139.6983, 
 '["シャワー完備","アメニティ","Wi-Fi","ロッカー"]', 'PENDING', 3, datetime('now')),

('site-shinjuku-1', 'host-shinjuku', 'HOGUSY 新宿プレミアム', 'HOTEL', '東京都新宿区西新宿1-1-3', '新宿区', 35.6896, 139.6917,
 '["高級アメニティ","シャワー完備","タオル無料","Wi-Fi","待合スペース"]', 'PENDING', 3, datetime('now')),

('site-roppongi-1', 'host-roppongi', 'HOGUSY 六本木ヒルズ', 'HOTEL', '東京都港区六本木6-10-1', '港区', 35.6604, 139.7292,
 '["高級アメニティ","シャワー完備","バスローブ","スパ施設","Wi-Fi","駐車場"]', 'PENDING', 3, datetime('now'));

-- 施設の部屋データ
INSERT OR IGNORE INTO site_rooms (id, site_id, room_number, name, capacity, hourly_rate, is_available, created_at) VALUES
('room-shibuya-1', 'site-shibuya-1', '101', 'スタンダードルーム A', 1, 2000, 1, datetime('now')),
('room-shibuya-2', 'site-shibuya-1', '102', 'スタンダードルーム B', 1, 2000, 1, datetime('now')),
('room-shibuya-3', 'site-shibuya-1', '201', 'デラックスルーム', 1, 3000, 1, datetime('now')),

('room-shinjuku-1', 'site-shinjuku-1', '301', 'プレミアムルーム A', 1, 3500, 1, datetime('now')),
('room-shinjuku-2', 'site-shinjuku-1', '302', 'プレミアムルーム B', 1, 3500, 1, datetime('now')),
('room-shinjuku-3', 'site-shinjuku-1', '401', 'スイートルーム', 1, 5000, 1, datetime('now')),

('room-roppongi-1', 'site-roppongi-1', '501', 'エグゼクティブルーム A', 1, 4000, 1, datetime('now')),
('room-roppongi-2', 'site-roppongi-1', '502', 'エグゼクティブルーム B', 1, 4000, 1, datetime('now')),
('room-roppongi-3', 'site-roppongi-1', '601', 'ロイヤルスイート', 1, 6000, 1, datetime('now'));

-- セラピストユーザー作成
INSERT OR IGNORE INTO users (id, email, name, role, phone, email_verified, avatar_url, created_at) VALUES
('therapist-user-1', 'miku.tanaka@hogusy.com', '田中 美咲', 'THERAPIST', '090-1234-5678', 1, 'https://i.pravatar.cc/150?img=1', datetime('now')),
('therapist-user-2', 'kenta.sato@hogusy.com', '佐藤 健太', 'THERAPIST', '090-2345-6789', 1, 'https://i.pravatar.cc/150?img=12', datetime('now')),
('therapist-user-3', 'ai.takahashi@hogusy.com', '高橋 愛', 'THERAPIST', '090-3456-7890', 1, 'https://i.pravatar.cc/150?img=5', datetime('now')),
('therapist-user-4', 'daichi.yamada@hogusy.com', '山田 大地', 'THERAPIST', '090-4567-8901', 1, 'https://i.pravatar.cc/150?img=14', datetime('now')),
('therapist-user-5', 'yuki.suzuki@hogusy.com', '鈴木 優希', 'THERAPIST', '090-5678-9012', 1, 'https://i.pravatar.cc/150?img=9', datetime('now'));

-- セラピストプロフィール作成
INSERT OR IGNORE INTO therapist_profiles (id, user_id, bio, specialties, experience_years, rating, review_count, approved_areas, status, created_at) VALUES
('therapist-1', 'therapist-user-1', '国家資格を持つベテランセラピスト。丁寧なカウンセリングと確かな技術で、お客様一人ひとりに合わせた施術を提供します。肩こり・腰痛の改善が得意です。', 
 '["肩こり","腰痛","全身疲労","ストレッチ"]', 8, 4.8, 156, '["13113","13104","13103"]', 'APPROVED', datetime('now')),

('therapist-2', 'therapist-user-2', 'スポーツトレーナー経験を活かした施術が特徴。アスリートのケアにも定評があり、深部の筋肉へのアプローチが得意です。', 
 '["スポーツマッサージ","深層筋","ストレッチ","疲労回復"]', 6, 4.9, 203, '["13113","13104","13103"]', 'APPROVED', datetime('now')),

('therapist-3', 'therapist-user-3', 'リラクゼーションを重視した優しい施術が人気。アロマオイルを使った癒しの時間を提供します。女性のお客様に特におすすめです。', 
 '["アロマ","リラクゼーション","リンパ","美容"]', 5, 4.7, 134, '["13113","13104","13103"]', 'APPROVED', datetime('now')),

('therapist-4', 'therapist-user-4', '整体とマッサージを組み合わせた独自の手技で、根本から体の不調を改善。骨格の歪みや姿勢の改善に特化しています。', 
 '["整体","骨盤矯正","姿勢改善","肩こり"]', 10, 4.9, 287, '["13113","13104","13103"]', 'APPROVED', datetime('now')),

('therapist-5', 'therapist-user-5', '若手ながら確かな技術を持つセラピスト。丁寧なコミュニケーションで、初めての方にも安心して施術を受けていただけます。', 
 '["全身マッサージ","足つぼ","ヘッドマッサージ","リフレッシュ"]', 3, 4.6, 89, '["13113","13104","13103"]', 'APPROVED', datetime('now'));

-- マスターコース（施術メニュー）
INSERT OR IGNORE INTO master_courses (id, name, duration, description, base_price, created_at) VALUES
('course-30', '30分コース', 30, '短時間で疲れをリフレッシュ', 3000, datetime('now')),
('course-60', '60分コース', 60, 'じっくりと全身をほぐす基本コース', 6000, datetime('now')),
('course-90', '90分コース', 90, '全身しっかりケア・至福の90分', 9000, datetime('now')),
('course-120', '120分コース', 120, 'プレミアム・極上の2時間', 12000, datetime('now'));

-- マスターオプション
INSERT OR IGNORE INTO master_options (id, name, description, duration_add, base_price, created_at) VALUES
('option-aroma', 'アロマオイル', '上質なアロマオイルで癒し効果UP', 0, 1000, datetime('now')),
('option-head', 'ヘッドマッサージ', '頭皮のコリをほぐして頭スッキリ', 15, 1500, datetime('now')),
('option-foot', '足つぼマッサージ', '足裏の反射区を刺激してデトックス', 15, 1500, datetime('now')),
('option-stretch', 'ストレッチ', 'プロによるストレッチで柔軟性UP', 10, 1000, datetime('now'));

-- セラピストのメニュー設定
INSERT OR IGNORE INTO therapist_menu (id, therapist_id, master_course_id, price, is_available, created_at) VALUES
-- 田中 美咲のメニュー
('menu-t1-c30', 'therapist-1', 'course-30', 3500, 1, datetime('now')),
('menu-t1-c60', 'therapist-1', 'course-60', 6500, 1, datetime('now')),
('menu-t1-c90', 'therapist-1', 'course-90', 9500, 1, datetime('now')),
('menu-t1-c120', 'therapist-1', 'course-120', 12500, 1, datetime('now')),

-- 佐藤 健太のメニュー
('menu-t2-c60', 'therapist-2', 'course-60', 7000, 1, datetime('now')),
('menu-t2-c90', 'therapist-2', 'course-90', 10000, 1, datetime('now')),
('menu-t2-c120', 'therapist-2', 'course-120', 13000, 1, datetime('now')),

-- 高橋 愛のメニュー
('menu-t3-c60', 'therapist-3', 'course-60', 6500, 1, datetime('now')),
('menu-t3-c90', 'therapist-3', 'course-90', 9500, 1, datetime('now')),

-- 山田 大地のメニュー
('menu-t4-c60', 'therapist-4', 'course-60', 7500, 1, datetime('now')),
('menu-t4-c90', 'therapist-4', 'course-90', 11000, 1, datetime('now')),
('menu-t4-c120', 'therapist-4', 'course-120', 14000, 1, datetime('now')),

-- 鈴木 優希のメニュー
('menu-t5-c60', 'therapist-5', 'course-60', 6000, 1, datetime('now')),
('menu-t5-c90', 'therapist-5', 'course-90', 9000, 1, datetime('now'));

-- セラピストのオプション設定
INSERT OR IGNORE INTO therapist_options (id, therapist_id, master_option_id, price, is_available, created_at) VALUES
-- 全セラピスト共通オプション
('opt-t1-aroma', 'therapist-1', 'option-aroma', 1000, 1, datetime('now')),
('opt-t1-head', 'therapist-1', 'option-head', 1500, 1, datetime('now')),
('opt-t1-foot', 'therapist-1', 'option-foot', 1500, 1, datetime('now')),

('opt-t2-aroma', 'therapist-2', 'option-aroma', 1000, 1, datetime('now')),
('opt-t2-stretch', 'therapist-2', 'option-stretch', 1000, 1, datetime('now')),

('opt-t3-aroma', 'therapist-3', 'option-aroma', 1200, 1, datetime('now')),
('opt-t3-head', 'therapist-3', 'option-head', 1500, 1, datetime('now')),

('opt-t4-stretch', 'therapist-4', 'option-stretch', 1200, 1, datetime('now')),
('opt-t4-head', 'therapist-4', 'option-head', 1500, 1, datetime('now')),

('opt-t5-aroma', 'therapist-5', 'option-aroma', 1000, 1, datetime('now')),
('opt-t5-foot', 'therapist-5', 'option-foot', 1500, 1, datetime('now'));

-- 完了メッセージ
SELECT 'デモデータの投入が完了しました！' as message;
SELECT '施設: 3件' as info UNION ALL
SELECT '施設部屋: 9件' UNION ALL
SELECT 'セラピスト: 5名' UNION ALL
SELECT 'メニュー: 全セラピスト対応' UNION ALL
SELECT 'オプション: 全セラピスト対応';
