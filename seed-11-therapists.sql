-- 11名のセラピストデータ投入（既存の5名に加えて6名追加）

-- セラピスト6-11のユーザーアカウント
INSERT OR IGNORE INTO users (id, email, name, role, phone, email_verified, avatar_url, created_at) VALUES
('therapist-user-6', 'rina.yamamoto@hogusy.com', '山本 梨奈', 'THERAPIST', '090-6789-0123', 1, 'https://i.pravatar.cc/150?img=10', datetime('now')),
('therapist-user-7', 'kenji.nakamura@hogusy.com', '中村 健二', 'THERAPIST', '090-7890-1234', 1, 'https://i.pravatar.cc/150?img=15', datetime('now')),
('therapist-user-8', 'ayaka.watanabe@hogusy.com', '渡辺 彩花', 'THERAPIST', '090-8901-2345', 1, 'https://i.pravatar.cc/150?img=20', datetime('now')),
('therapist-user-9', 'hiroki.ito@hogusy.com', '伊藤 弘樹', 'THERAPIST', '090-9012-3456', 1, 'https://i.pravatar.cc/150?img=13', datetime('now')),
('therapist-user-10', 'sakura.kobayashi@hogusy.com', '小林 さくら', 'THERAPIST', '090-0123-4567', 1, 'https://i.pravatar.cc/150?img=16', datetime('now')),
('therapist-user-11', 'takeshi.kato@hogusy.com', '加藤 武', 'THERAPIST', '090-1234-6789', 1, 'https://i.pravatar.cc/150?img=18', datetime('now'));

-- セラピスト6-11のプロフィール
INSERT OR IGNORE INTO therapist_profiles (id, user_id, bio, specialties, experience_years, rating, review_count, approved_areas, status, created_at) VALUES
('therapist-6', 'therapist-user-6', 'タイ古式マッサージの資格を持つセラピスト。ストレッチを取り入れた施術で柔軟性を高めます。', 
 '["タイ古式","ストレッチ","柔軟性向上","リラックス"]', 7, 4.7, 145, '["渋谷区","新宿区","港区"]', 'APPROVED', datetime('now')),

('therapist-7', 'therapist-user-7', '鍼灸師・柔道整復師の資格保有。スポーツ障害や慢性痛の改善を得意としています。', 
 '["鍼灸","柔道整復","スポーツ障害","慢性痛"]', 12, 4.9, 321, '["渋谷区","新宿区","港区"]', 'APPROVED', datetime('now')),

('therapist-8', 'therapist-user-8', 'エステティシャンからセラピストへ転身。美容効果も期待できる施術が女性に人気です。', 
 '["美容整体","小顔矯正","リンパドレナージュ","デトックス"]', 4, 4.6, 98, '["渋谷区","新宿区","港区"]', 'APPROVED', datetime('now')),

('therapist-9', 'therapist-user-9', '国家資格保有のあん摩マッサージ指圧師。確かな技術で根本から体の不調を改善します。', 
 '["あん摩","指圧","マッサージ","根本改善"]', 15, 5.0, 412, '["渋谷区","新宿区","港区"]', 'APPROVED', datetime('now')),

('therapist-10', 'therapist-user-10', 'ヨガインストラクターとしても活動。呼吸と体のバランスを整える施術が特徴です。', 
 '["ヨガ","呼吸法","バランス調整","ストレッチ"]', 6, 4.8, 178, '["渋谷区","新宿区","港区"]', 'APPROVED', datetime('now')),

('therapist-11', 'therapist-user-11', '格闘技経験を活かした力強い施術。深部の筋肉までしっかりほぐします。', 
 '["深層筋","トリガーポイント","筋膜リリース","スポーツケア"]', 9, 4.7, 234, '["渋谷区","新宿区","港区"]', 'APPROVED', datetime('now'));

-- セラピスト6-11のメニュー設定
INSERT OR IGNORE INTO therapist_menu (id, therapist_id, master_course_id, price, is_available, created_at) VALUES
-- therapist-6 のメニュー
('menu-t6-mc1', 'therapist-6', 'mc_1', 3800, 1, datetime('now')),
('menu-t6-mc2', 'therapist-6', 'mc_2', 6800, 1, datetime('now')),
('menu-t6-mc3', 'therapist-6', 'mc_3', 9800, 1, datetime('now')),

-- therapist-7 のメニュー
('menu-t7-mc1', 'therapist-7', 'mc_1', 4500, 1, datetime('now')),
('menu-t7-mc2', 'therapist-7', 'mc_2', 8000, 1, datetime('now')),
('menu-t7-mc3', 'therapist-7', 'mc_3', 12000, 1, datetime('now')),

-- therapist-8 のメニュー
('menu-t8-mc1', 'therapist-8', 'mc_1', 3500, 1, datetime('now')),
('menu-t8-mc2', 'therapist-8', 'mc_2', 7000, 1, datetime('now')),

-- therapist-9 のメニュー
('menu-t9-mc1', 'therapist-9', 'mc_1', 5000, 1, datetime('now')),
('menu-t9-mc2', 'therapist-9', 'mc_2', 9000, 1, datetime('now')),
('menu-t9-mc3', 'therapist-9', 'mc_3', 13000, 1, datetime('now')),

-- therapist-10 のメニュー
('menu-t10-mc1', 'therapist-10', 'mc_1', 3800, 1, datetime('now')),
('menu-t10-mc2', 'therapist-10', 'mc_2', 7200, 1, datetime('now')),
('menu-t10-mc3', 'therapist-10', 'mc_3', 10500, 1, datetime('now')),

-- therapist-11 のメニュー
('menu-t11-mc1', 'therapist-11', 'mc_1', 4200, 1, datetime('now')),
('menu-t11-mc2', 'therapist-11', 'mc_2', 7800, 1, datetime('now')),
('menu-t11-mc3', 'therapist-11', 'mc_3', 11500, 1, datetime('now'));

-- セラピスト6-11のオプション設定
INSERT OR IGNORE INTO therapist_options (id, therapist_id, master_option_id, price, is_available, created_at) VALUES
-- therapist-6 のオプション
('opt-t6-aroma', 'therapist-6', 'option-aroma', 1000, 1, datetime('now')),
('opt-t6-stretch', 'therapist-6', 'option-stretch', 1500, 1, datetime('now')),

-- therapist-7 のオプション
('opt-t7-foot', 'therapist-7', 'option-foot', 2000, 1, datetime('now')),
('opt-t7-stretch', 'therapist-7', 'option-stretch', 1200, 1, datetime('now')),

-- therapist-8 のオプション
('opt-t8-aroma', 'therapist-8', 'option-aroma', 1200, 1, datetime('now')),
('opt-t8-head', 'therapist-8', 'option-head', 1800, 1, datetime('now')),

-- therapist-9 のオプション
('opt-t9-head', 'therapist-9', 'option-head', 1500, 1, datetime('now')),
('opt-t9-foot', 'therapist-9', 'option-foot', 1500, 1, datetime('now')),
('opt-t9-stretch', 'therapist-9', 'option-stretch', 1000, 1, datetime('now')),

-- therapist-10 のオプション
('opt-t10-aroma', 'therapist-10', 'option-aroma', 1000, 1, datetime('now')),
('opt-t10-stretch', 'therapist-10', 'option-stretch', 1800, 1, datetime('now')),

-- therapist-11 のオプション
('opt-t11-foot', 'therapist-11', 'option-foot', 1600, 1, datetime('now')),
('opt-t11-stretch', 'therapist-11', 'option-stretch', 1400, 1, datetime('now'));

SELECT 'セラピスト6-11名のデータ投入完了' as status;
