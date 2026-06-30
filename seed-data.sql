-- ========================================
-- HOGUSY デモデータ（完全整合版）
-- ========================================

-- ==========================================
-- 1. 全テーブルのデータクリア
-- ==========================================
DELETE FROM booking_items;
DELETE FROM booking_timelocks;
DELETE FROM booking_messages;
DELETE FROM bookings;
DELETE FROM reviews;
DELETE FROM therapist_menu_courses;
DELETE FROM therapist_menu_options;
DELETE FROM therapist_options;
DELETE FROM therapist_schedules;
DELETE FROM therapist_earnings;
DELETE FROM therapist_client_notes;
DELETE FROM therapist_edit_logs;
DELETE FROM therapist_profile_edits;
DELETE FROM therapist_profiles;
DELETE FROM site_rooms;
DELETE FROM sites;
DELETE FROM offices;
DELETE FROM office_details;
DELETE FROM office_therapist_affiliations;
DELETE FROM users;
DELETE FROM user_favorites;
DELETE FROM user_points;
DELETE FROM point_transactions;
DELETE FROM payments;
DELETE FROM payment_transactions;
DELETE FROM payment_splits;
DELETE FROM notifications;
DELETE FROM auth_sessions;
DELETE FROM email_verifications;
DELETE FROM password_reset_tokens;
DELETE FROM social_accounts;
DELETE FROM oauth_states;

-- ==========================================
-- 2. ユーザー（セラピスト3名 + 顧客2名 + 管理者1名）
-- ==========================================
-- パスワード: Hogusy2026! (pbkdf2形式)
-- 注: 実際のハッシュはデプロイ後にAPIから生成する

INSERT INTO users (id, name, email, phone, role, password_hash, email_verified, created_at, updated_at) VALUES
('therapist-1', '高橋 大地', 'daichi.takahashi@hogusy.com', '090-1234-0001', 'THERAPIST', 'pbkdf2:10000:salt_placeholder_1:hash_placeholder_1', 1, '2026-01-15 09:00:00', '2026-06-30 00:00:00'),
('therapist-2', '佐藤 美咲', 'misaki.sato@hogusy.com', '090-1234-0002', 'THERAPIST', 'pbkdf2:10000:salt_placeholder_2:hash_placeholder_2', 1, '2026-02-01 09:00:00', '2026-06-30 00:00:00'),
('therapist-3', '田中 健太', 'kenta.tanaka@hogusy.com', '090-1234-0003', 'THERAPIST', 'pbkdf2:10000:salt_placeholder_3:hash_placeholder_3', 1, '2026-02-15 09:00:00', '2026-06-30 00:00:00'),
('customer-1', '山田 花子', 'hanako.yamada@example.com', '090-5678-0001', 'CUSTOMER', 'pbkdf2:10000:salt_placeholder_4:hash_placeholder_4', 1, '2026-03-01 09:00:00', '2026-06-30 00:00:00'),
('customer-2', '鈴木 太郎', 'taro.suzuki@example.com', '090-5678-0002', 'CUSTOMER', 'pbkdf2:10000:salt_placeholder_5:hash_placeholder_5', 1, '2026-03-15 09:00:00', '2026-06-30 00:00:00'),
('admin-1', '岩間 管理者', 'admin@hogusy.com', '090-0000-0001', 'ADMIN', 'pbkdf2:10000:salt_placeholder_6:hash_placeholder_6', 1, '2026-01-01 09:00:00', '2026-06-30 00:00:00');

-- ==========================================
-- 3. セラピストプロフィール
-- ==========================================
INSERT INTO therapist_profiles (id, user_id, name, email, phone, avatar_url, bio, specialties, experience_years, certifications, rating, review_count, approved_areas, status, commission_rate, outcall_available, incall_available, base_location, base_lat, base_lng, travel_methods, outcall_hours, incall_hours) VALUES
('tp-1', 'therapist-1', '高橋 大地', 'daichi.takahashi@hogusy.com', '090-1234-0001', '/therapists/therapist-1.jpg', '鍼灸師・柔道整復師の資格保有。スポーツ障害や慢性痛の改善を得意としています。10年以上の臨床経験で、一人ひとりに合わせた施術を提供します。', '["鍼灸","柔道整復","スポーツケア"]', 11, '["鍼灸師","柔道整復師","アスレティックトレーナー"]', 4.9, 156, '["shibuya","shinjuku","minato","meguro","setagaya"]', 'APPROVED', 70, 1, 1, '東京都渋谷区神宮前3-5-10', 35.6708, 139.7073, '["電車","タクシー"]', '{"start":"09:00","end":"21:00"}', '{"start":"10:00","end":"20:00"}'),
('tp-2', 'therapist-2', '佐藤 美咲', 'misaki.sato@hogusy.com', '090-1234-0002', '/therapists/therapist-2.jpg', 'アロマセラピスト・リフレクソロジスト。女性特有の不調やストレスケアを専門としています。心と体のバランスを整える施術が好評です。', '["アロマ","リフレクソロジー","フェイシャル"]', 8, '["AEAJ認定アロマセラピスト","リフレクソロジスト"]', 4.8, 98, '["shibuya","minato","meguro","setagaya","ota"]', 'APPROVED', 70, 1, 1, '東京都目黒区自由が丘2-8-15', 35.6073, 139.6686, '["電車"]', '{"start":"10:00","end":"20:00"}', '{"start":"10:00","end":"19:00"}'),
('tp-3', 'therapist-3', '田中 健太', 'kenta.tanaka@hogusy.com', '090-1234-0003', '/therapists/therapist-3.jpg', '整体師・パーソナルトレーナー。姿勢改善と運動指導を組み合わせた独自メソッドで、根本的な体質改善をサポートします。', '["整体","パーソナルトレーニング","姿勢矯正"]', 6, '["柔道整復師","NSCA-CPT"]', 4.7, 72, '["shinjuku","chiyoda","bunkyo","toshima","nakano"]', 'APPROVED', 70, 1, 0, '東京都新宿区西新宿1-12-3', 35.6938, 139.7003, '["電車","自転車"]', '{"start":"08:00","end":"22:00"}', '{}');

-- ==========================================
-- 4. セラピストスケジュール（全曜日）
-- ==========================================
-- therapist-1: 月〜土 9:00-21:00、日 休み
INSERT INTO therapist_schedules (id, therapist_id, day_of_week, start_time, end_time, is_available) VALUES
('sched-1-0', 'therapist-1', 0, '10:00', '17:00', 0),
('sched-1-1', 'therapist-1', 1, '09:00', '21:00', 1),
('sched-1-2', 'therapist-1', 2, '09:00', '21:00', 1),
('sched-1-3', 'therapist-1', 3, '09:00', '21:00', 1),
('sched-1-4', 'therapist-1', 4, '09:00', '21:00', 1),
('sched-1-5', 'therapist-1', 5, '09:00', '21:00', 1),
('sched-1-6', 'therapist-1', 6, '10:00', '18:00', 1);

-- therapist-2: 火〜土 10:00-20:00、日月 休み
INSERT INTO therapist_schedules (id, therapist_id, day_of_week, start_time, end_time, is_available) VALUES
('sched-2-0', 'therapist-2', 0, '10:00', '17:00', 0),
('sched-2-1', 'therapist-2', 1, '10:00', '17:00', 0),
('sched-2-2', 'therapist-2', 2, '10:00', '20:00', 1),
('sched-2-3', 'therapist-2', 3, '10:00', '20:00', 1),
('sched-2-4', 'therapist-2', 4, '10:00', '20:00', 1),
('sched-2-5', 'therapist-2', 5, '10:00', '20:00', 1),
('sched-2-6', 'therapist-2', 6, '10:00', '18:00', 1);

-- therapist-3: 月〜金 8:00-22:00、土日 休み
INSERT INTO therapist_schedules (id, therapist_id, day_of_week, start_time, end_time, is_available) VALUES
('sched-3-0', 'therapist-3', 0, '08:00', '22:00', 0),
('sched-3-1', 'therapist-3', 1, '08:00', '22:00', 1),
('sched-3-2', 'therapist-3', 2, '08:00', '22:00', 1),
('sched-3-3', 'therapist-3', 3, '08:00', '22:00', 1),
('sched-3-4', 'therapist-3', 4, '08:00', '22:00', 1),
('sched-3-5', 'therapist-3', 5, '08:00', '22:00', 1),
('sched-3-6', 'therapist-3', 6, '08:00', '22:00', 0);

-- ==========================================
-- 5. メニュー（コース）
-- ==========================================
INSERT INTO therapist_menu_courses (id, therapist_profile_id, name, duration, price, description, display_order, is_active) VALUES
-- therapist-1
('course-1-1', 'tp-1', '鍼灸コース', 60, 9000, '東洋医学に基づいた鍼灸施術。肩こり・腰痛・自律神経の乱れに効果的', 0, 1),
('course-1-2', 'tp-1', 'スポーツケアコース', 90, 12000, 'アスリート向けの集中ケア。筋膜リリース+鍼灸で回復を促進', 1, 1),
('course-1-3', 'tp-1', '整体コース', 60, 8000, '全身の歪みを整え、肩こり・腰痛を改善します', 2, 1),
('course-1-4', 'tp-1', 'トータルケア', 120, 16000, '鍼灸+整体+ストレッチの総合コース', 3, 1),
-- therapist-2
('course-2-1', 'tp-2', 'アロマリラクゼーション', 60, 8500, 'オーガニック精油を使用した全身アロマトリートメント', 0, 1),
('course-2-2', 'tp-2', 'フェイシャルケア', 45, 7000, '小顔矯正+リンパドレナージュ', 1, 1),
('course-2-3', 'tp-2', 'リフレクソロジー', 60, 7500, '足裏の反射区を刺激し、全身の巡りを改善', 2, 1),
('course-2-4', 'tp-2', 'プレミアムコース', 120, 15000, 'アロマ+フェイシャル+リフレの贅沢コース', 3, 1),
-- therapist-3
('course-3-1', 'tp-3', '姿勢矯正コース', 60, 8000, '猫背・巻き肩・骨盤の歪みを根本改善', 0, 1),
('course-3-2', 'tp-3', 'パーソナル整体', 90, 11000, '整体+運動指導で体質改善', 1, 1),
('course-3-3', 'tp-3', 'ストレッチ集中', 45, 6000, 'パートナーストレッチで柔軟性向上', 2, 1),
('course-3-4', 'tp-3', 'ボディメイクコース', 120, 14000, '整体+トレーニング+食事指導', 3, 1);

-- ==========================================
-- 6. メニュー（オプション）
-- ==========================================
INSERT INTO therapist_menu_options (id, therapist_profile_id, name, price, description, display_order, is_active) VALUES
-- therapist-1
('opt-1-1', 'tp-1', 'ヘッドマッサージ追加', 1500, '頭皮のツボを刺激してリフレッシュ', 0, 1),
('opt-1-2', 'tp-1', 'お灸追加', 2000, '温灸で血行促進・冷え性改善', 1, 1),
('opt-1-3', 'tp-1', 'テーピング', 1000, 'スポーツテーピングで関節サポート', 2, 1),
-- therapist-2
('opt-2-1', 'tp-2', 'ホットストーン', 2000, '温めた天然石で深部まで温め', 0, 1),
('opt-2-2', 'tp-2', 'パック追加', 1500, 'コラーゲンパックで保湿ケア', 1, 1),
('opt-2-3', 'tp-2', 'アロマ精油グレードアップ', 1000, 'プレミアム精油に変更', 2, 1),
-- therapist-3
('opt-3-1', 'tp-3', 'EMSトレーニング', 2500, 'EMS機器で効率的な筋力アップ', 0, 1),
('opt-3-2', 'tp-3', 'テーピング', 1000, 'キネシオテーピングで姿勢サポート', 1, 1),
('opt-3-3', 'tp-3', '食事指導レポート', 2000, 'パーソナル食事プラン作成', 2, 1);

-- ==========================================
-- 7. サイト（店舗/施術場所）
-- ==========================================
INSERT INTO sites (id, name, address, lat, lng, phone, description, area_code, status, created_at) VALUES
('site-shibuya', '渋谷サロン', '東京都渋谷区道玄坂2-10-7 新大宗ビル5F', 35.6580, 139.6994, '03-1234-5001', '渋谷駅徒歩3分。完全個室のプライベートサロン', 'shibuya', 'ACTIVE', '2026-01-01 00:00:00'),
('site-shinjuku', '新宿サロン', '東京都新宿区西新宿1-5-11 新宿三葉ビル8F', 35.6896, 139.6922, '03-1234-5002', '新宿駅西口徒歩2分。落ち着いた空間で施術', 'shinjuku', 'ACTIVE', '2026-01-01 00:00:00'),
('site-meguro', '目黒サロン', '東京都目黒区目黒1-4-16 目黒Gビル3F', 35.6334, 139.7158, '03-1234-5003', '目黒駅徒歩5分。緑に囲まれた癒しの空間', 'meguro', 'ACTIVE', '2026-01-01 00:00:00');

-- ==========================================
-- 8. 予約（テスト用 - 各ステータス）
-- ==========================================
INSERT INTO bookings (id, user_id, therapist_id, site_id, type, status, scheduled_at, duration, total_price, guest_name, guest_email, guest_phone, customer_address, postal_code, notes, created_at, updated_at) VALUES
-- 承認待ち予約（PENDING）
('booking-001', 'customer-1', 'therapist-1', 'site-shibuya', 'ONSITE', 'PENDING', '2026-07-05 14:00:00', 60, 9000, NULL, NULL, NULL, NULL, NULL, '肩こりがひどいです', '2026-06-28 10:00:00', '2026-06-28 10:00:00'),
-- 承認済み予約（CONFIRMED）
('booking-002', 'customer-2', 'therapist-2', 'site-meguro', 'ONSITE', 'CONFIRMED', '2026-07-03 11:00:00', 60, 8500, NULL, NULL, NULL, NULL, NULL, 'リラックスしたい', '2026-06-25 15:00:00', '2026-06-26 09:00:00'),
-- 出張予約（MOBILE - CONFIRMED）
('booking-003', 'customer-1', 'therapist-1', NULL, 'MOBILE', 'CONFIRMED', '2026-07-07 10:00:00', 90, 12000, NULL, NULL, NULL, '東京都渋谷区神宮前1-2-3 マンション405', '150-0001', 'スポーツ後のケア希望', '2026-06-27 18:00:00', '2026-06-28 08:00:00'),
-- 完了済み予約（COMPLETED）
('booking-004', 'customer-2', 'therapist-3', 'site-shinjuku', 'ONSITE', 'COMPLETED', '2026-06-20 15:00:00', 60, 8000, NULL, NULL, NULL, NULL, NULL, '姿勢が気になる', '2026-06-18 12:00:00', '2026-06-20 16:00:00'),
-- ゲスト予約（PENDING）
('booking-005', NULL, 'therapist-2', 'site-shibuya', 'ONSITE', 'PENDING', '2026-07-08 13:00:00', 45, 7000, '伊藤 さくら', 'sakura.ito@example.com', '080-9999-1234', NULL, NULL, 'フェイシャル希望', '2026-06-29 20:00:00', '2026-06-29 20:00:00'),
-- 出張ゲスト予約（PENDING）
('booking-006', NULL, 'therapist-3', NULL, 'MOBILE', 'PENDING', '2026-07-10 09:00:00', 90, 11000, '中村 翔太', 'shota.nakamura@example.com', '070-8888-5678', '東京都新宿区高田馬場4-5-6 ハイツ302', '169-0075', '腰痛改善希望', '2026-06-30 08:00:00', '2026-06-30 08:00:00');

-- ==========================================
-- 9. 予約アイテム
-- ==========================================
INSERT INTO booking_items (id, booking_id, item_type, item_id, item_name, price) VALUES
('bi-001', 'booking-001', 'COURSE', 'course-1-1', '鍼灸コース', 9000),
('bi-002', 'booking-002', 'COURSE', 'course-2-1', 'アロマリラクゼーション', 8500),
('bi-003', 'booking-003', 'COURSE', 'course-1-2', 'スポーツケアコース', 12000),
('bi-004', 'booking-004', 'COURSE', 'course-3-1', '姿勢矯正コース', 8000),
('bi-005', 'booking-005', 'COURSE', 'course-2-2', 'フェイシャルケア', 7000),
('bi-006', 'booking-006', 'COURSE', 'course-3-2', 'パーソナル整体', 11000);

-- ==========================================
-- 10. レビュー（完了済み予約に対して）
-- ==========================================
INSERT INTO reviews (id, booking_id, therapist_id, user_id, rating, comment, customer_age_range, customer_gender, customer_occupation, body_concerns, is_public, created_at, updated_at) VALUES
('review-001', 'booking-004', 'therapist-3', 'customer-2', 5, '姿勢の改善を実感できました。施術後は体が軽くなり、デスクワーク中の肩こりも減りました。定期的に通いたいです。', '30代', '男性', '会社員', '["肩こり","猫背"]', 1, 1719100000, 1719100000),
('review-002', 'booking-004', 'therapist-3', 'customer-1', 4, '丁寧な説明と施術で安心できました。ストレッチの指導も分かりやすかったです。', '40代', '女性', '主婦', '["腰痛","冷え性"]', 1, 1719200000, 1719200000),
('review-003', 'booking-002', 'therapist-2', 'customer-2', 5, 'アロマの香りに癒されました。施術後は体全体がポカポカして、ぐっすり眠れました。', '30代', '男性', '会社員', '["ストレス","不眠"]', 1, 1719300000, 1719300000),
('review-004', 'booking-003', 'therapist-1', 'customer-1', 5, '出張で自宅まで来ていただけて助かりました。鍼灸の腕は確かで、スポーツ後の疲労が一気に取れました。', '30代', '女性', '会社員', '["筋肉痛","疲労"]', 1, 1719400000, 1719400000),
('review-005', 'booking-001', 'therapist-1', 'customer-2', 4, '予約が取りやすく、施術も丁寧。肩こりが楽になりました。次回はスポーツケアコースを試したい。', '20代', '男性', '学生', '["肩こり"]', 1, 1719500000, 1719500000);
