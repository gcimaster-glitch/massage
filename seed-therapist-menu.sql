-- セラピストメニューデータの投入
-- 全11名のセラピストに標準的なメニューを設定

-- ===== therapist-1 =====
INSERT INTO therapist_menu (id, therapist_id, name, description, duration, base_price, category, is_available) VALUES
('menu-1-1', 'therapist-1', '全身リラクゼーション（60分）', '全身をしっかりとほぐす定番コース', 60, 8000, 'COURSE', 1),
('menu-1-2', 'therapist-1', '全身リラクゼーション（90分）', 'じっくり時間をかけて全身をケア', 90, 12000, 'COURSE', 1),
('menu-1-3', 'therapist-1', '肩・首集中ケア（45分）', 'デスクワークの方におすすめ', 45, 6000, 'COURSE', 1);

INSERT INTO therapist_options (id, therapist_id, name, description, duration, base_price, is_available) VALUES
('option-1-1', 'therapist-1', 'ヘッドマッサージ', '頭部を丁寧にほぐします', 15, 2000, 1),
('option-1-2', 'therapist-1', 'フットケア', '足裏・ふくらはぎのケア', 15, 2000, 1),
('option-1-3', 'therapist-1', 'アロマオイル', 'お好みの香りで癒し効果UP', 0, 1000, 1);

-- ===== therapist-2 =====
INSERT INTO therapist_menu (id, therapist_id, name, description, duration, base_price, category, is_available) VALUES
('menu-2-1', 'therapist-2', '全身もみほぐし（60分）', 'しっかりとした圧で全身をほぐします', 60, 8500, 'COURSE', 1),
('menu-2-2', 'therapist-2', '全身もみほぐし（90分）', '時間をかけて丁寧にケア', 90, 12500, 'COURSE', 1),
('menu-2-3', 'therapist-2', '腰・肩集中ケア（45分）', '腰痛・肩こりにお悩みの方へ', 45, 6500, 'COURSE', 1);

INSERT INTO therapist_options (id, therapist_id, name, description, duration, base_price, is_available) VALUES
('option-2-1', 'therapist-2', 'ストレッチ', '施術後のストレッチで効果UP', 15, 2000, 1),
('option-2-2', 'therapist-2', '足つぼマッサージ', '足裏の反射区を刺激', 20, 2500, 1);

-- ===== therapist-3 =====
INSERT INTO therapist_menu (id, therapist_id, name, description, duration, base_price, category, is_available) VALUES
('menu-3-1', 'therapist-3', '整体（60分）', '骨格から整える本格整体', 60, 9000, 'COURSE', 1),
('menu-3-2', 'therapist-3', '整体（90分）', 'じっくり時間をかけた整体', 90, 13000, 'COURSE', 1),
('menu-3-3', 'therapist-3', '姿勢改善コース（75分）', '姿勢の歪みを根本から改善', 75, 11000, 'COURSE', 1);

INSERT INTO therapist_options (id, therapist_id, name, description, duration, base_price, is_available) VALUES
('option-3-1', 'therapist-3', '骨盤調整', '骨盤の歪みを整えます', 20, 3000, 1),
('option-3-2', 'therapist-3', 'カッピング', '血行促進・デトックス効果', 20, 3000, 1);

-- ===== therapist-4 =====
INSERT INTO therapist_menu (id, therapist_id, name, description, duration, base_price, category, is_available) VALUES
('menu-4-1', 'therapist-4', 'リンパマッサージ（60分）', '老廃物を流してスッキリ', 60, 8500, 'COURSE', 1),
('menu-4-2', 'therapist-4', 'リンパマッサージ（90分）', '全身のリンパを丁寧にケア', 90, 12500, 'COURSE', 1),
('menu-4-3', 'therapist-4', 'フェイシャルリンパ（45分）', '顔のむくみ・たるみケア', 45, 7000, 'COURSE', 1);

INSERT INTO therapist_options (id, therapist_id, name, description, duration, base_price, is_available) VALUES
('option-4-1', 'therapist-4', '美容鍼', '顔のツボを刺激して美肌効果', 30, 4000, 1),
('option-4-2', 'therapist-4', 'デコルテケア', '首・肩・デコルテを集中ケア', 15, 2000, 1);

-- ===== therapist-5 =====
INSERT INTO therapist_menu (id, therapist_id, name, description, duration, base_price, category, is_available) VALUES
('menu-5-1', 'therapist-5', 'タイ古式マッサージ（60分）', 'ストレッチと指圧を組み合わせた施術', 60, 8000, 'COURSE', 1),
('menu-5-2', 'therapist-5', 'タイ古式マッサージ（90分）', 'じっくり体を伸ばしてリラックス', 90, 12000, 'COURSE', 1),
('menu-5-3', 'therapist-5', 'ヘッドスパ（45分）', '頭皮から癒しを', 45, 6500, 'COURSE', 1);

INSERT INTO therapist_options (id, therapist_id, name, description, duration, base_price, is_available) VALUES
('option-5-1', 'therapist-5', '足裏マッサージ', 'タイ式の足裏ケア', 20, 2500, 1),
('option-5-2', 'therapist-5', 'ホットストーン', '温めた石で深部をほぐす', 20, 3000, 1);

-- ===== therapist-6 =====
INSERT INTO therapist_menu (id, therapist_id, name, description, duration, base_price, category, is_available) VALUES
('menu-6-1', 'therapist-6', 'アロママッサージ（60分）', '天然アロマオイルでリラックス', 60, 9000, 'COURSE', 1),
('menu-6-2', 'therapist-6', 'アロママッサージ（90分）', 'じっくりアロマで癒される', 90, 13000, 'COURSE', 1),
('menu-6-3', 'therapist-6', 'バリニーズマッサージ（75分）', 'バリ島伝統のオイルマッサージ', 75, 11000, 'COURSE', 1);

INSERT INTO therapist_options (id, therapist_id, name, description, duration, base_price, is_available) VALUES
('option-6-1', 'therapist-6', 'ボディスクラブ', '古い角質を除去してツルツル肌に', 20, 3000, 1),
('option-6-2', 'therapist-6', 'リフレクソロジー', '足裏の反射区をケア', 20, 2500, 1);

-- ===== therapist-7 =====
INSERT INTO therapist_menu (id, therapist_id, name, description, duration, base_price, category, is_available) VALUES
('menu-7-1', 'therapist-7', 'スポーツマッサージ（60分）', 'アスリート向けの本格施術', 60, 9000, 'COURSE', 1),
('menu-7-2', 'therapist-7', 'スポーツマッサージ（90分）', '疲労回復・パフォーマンス向上', 90, 13000, 'COURSE', 1),
('menu-7-3', 'therapist-7', 'コンディショニング（45分）', '運動前後のケア', 45, 6500, 'COURSE', 1);

INSERT INTO therapist_options (id, therapist_id, name, description, duration, base_price, is_available) VALUES
('option-7-1', 'therapist-7', 'テーピング', '筋肉・関節のサポート', 15, 2000, 1),
('option-7-2', 'therapist-7', 'アイシング', '炎症部位のクールダウン', 10, 1000, 1);

-- ===== therapist-8 =====
INSERT INTO therapist_menu (id, therapist_id, name, description, duration, base_price, category, is_available) VALUES
('menu-8-1', 'therapist-8', '指圧マッサージ（60分）', '経絡・ツボを刺激して体調改善', 60, 8500, 'COURSE', 1),
('menu-8-2', 'therapist-8', '指圧マッサージ（90分）', 'じっくり全身のツボをケア', 90, 12500, 'COURSE', 1),
('menu-8-3', 'therapist-8', '鍼灸（60分）', '東洋医学の伝統的な施術', 60, 10000, 'COURSE', 1);

INSERT INTO therapist_options (id, therapist_id, name, description, duration, base_price, is_available) VALUES
('option-8-1', 'therapist-8', 'お灸', '温熱効果で血行促進', 15, 2000, 1),
('option-8-2', 'therapist-8', '吸い玉', '血流改善・デトックス', 20, 2500, 1);

-- ===== therapist-9 =====
INSERT INTO therapist_menu (id, therapist_id, name, description, duration, base_price, category, is_available) VALUES
('menu-9-1', 'therapist-9', 'リフレクソロジー（60分）', '足裏から全身を整える', 60, 7500, 'COURSE', 1),
('menu-9-2', 'therapist-9', 'リフレクソロジー（90分）', 'じっくり足裏をケア', 90, 11000, 'COURSE', 1),
('menu-9-3', 'therapist-9', 'ハンドリフレ（45分）', '手のひらから癒しを', 45, 6000, 'COURSE', 1);

INSERT INTO therapist_options (id, therapist_id, name, description, duration, base_price, is_available) VALUES
('option-9-1', 'therapist-9', 'ふくらはぎケア', 'むくみ・疲れを集中ケア', 15, 2000, 1),
('option-9-2', 'therapist-9', 'パラフィンパック', '手足の保湿・血行促進', 20, 2500, 1);

-- ===== therapist-10 =====
INSERT INTO therapist_menu (id, therapist_id, name, description, duration, base_price, category, is_available) VALUES
('menu-10-1', 'therapist-10', 'オイルマッサージ（60分）', 'なめらかなオイルで全身をケア', 60, 8500, 'COURSE', 1),
('menu-10-2', 'therapist-10', 'オイルマッサージ（90分）', 'リラックス効果抜群', 90, 12500, 'COURSE', 1),
('menu-10-3', 'therapist-10', 'ボディケア（45分）', '服を着たままの全身ケア', 45, 6000, 'COURSE', 1);

INSERT INTO therapist_options (id, therapist_id, name, description, duration, base_price, is_available) VALUES
('option-10-1', 'therapist-10', 'アロマ追加', '香りでリラックス効果UP', 0, 1000, 1),
('option-10-2', 'therapist-10', 'ストレッチ', '施術後のストレッチ', 15, 2000, 1);

-- ===== therapist-11 =====
INSERT INTO therapist_menu (id, therapist_id, name, description, duration, base_price, category, is_available) VALUES
('menu-11-1', 'therapist-11', 'もみほぐし（60分）', '程よい圧で全身をほぐします', 60, 8000, 'COURSE', 1),
('menu-11-2', 'therapist-11', 'もみほぐし（90分）', 'じっくり時間をかけてケア', 90, 12000, 'COURSE', 1),
('menu-11-3', 'therapist-11', '部分集中ケア（30分）', '気になる部位を集中ケア', 30, 4500, 'COURSE', 1);

INSERT INTO therapist_options (id, therapist_id, name, description, duration, base_price, is_available) VALUES
('option-11-1', 'therapist-11', '延長（15分）', '施術時間を延長', 15, 2000, 1),
('option-11-2', 'therapist-11', 'ホットタオル', '温めて血行促進', 0, 500, 1);
