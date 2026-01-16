-- CARE CUBE 施設データ投入（サンプル：19施設）
-- 本番DBスキーマに合わせた修正版
-- sites: id, name, type, address, area, host_id, cube_serial_number, lat, lng, is_active, room_count, amenities, status

-- まず、ホストユーザーを作成
INSERT OR IGNORE INTO users (
  id, email, name, role, email_verified, created_at
) VALUES
('host-shibuya-001', 'host.shibuya001@hogusy.com', 'CARE CUBE 渋谷管理', 'HOST', 1, datetime('now')),
('host-shinjuku-001', 'host.shinjuku001@hogusy.com', 'CARE CUBE 新宿管理', 'HOST', 1, datetime('now')),
('host-minato-001', 'host.minato001@hogusy.com', 'CARE CUBE 港管理', 'HOST', 1, datetime('now')),
('host-shinagawa-001', 'host.shinagawa001@hogusy.com', 'CARE CUBE 品川管理', 'HOST', 1, datetime('now')),
('host-setagaya-001', 'host.setagaya001@hogusy.com', 'CARE CUBE 世田谷管理', 'HOST', 1, datetime('now')),
('host-chiyoda-001', 'host.chiyoda001@hogusy.com', 'CARE CUBE 千代田管理', 'HOST', 1, datetime('now')),
('host-chuo-001', 'host.chuo001@hogusy.com', 'CARE CUBE 中央管理', 'HOST', 1, datetime('now')),
('host-toshima-001', 'host.toshima001@hogusy.com', 'CARE CUBE 豊島管理', 'HOST', 1, datetime('now'));

-- 施設データを挿入（本番DBスキーマに合わせる）
INSERT OR IGNORE INTO sites (
  id, host_id, name, type, address, area, lat, lng, room_count, amenities, status, is_active, created_at
) VALUES
-- 渋谷エリア
('site-shibuya-001', 'host-shibuya-001', 'CARE CUBE 渋谷駅前', 'CARE_CUBE', '東京都渋谷区道玄坂1-2-3 渋谷ビル3F', '渋谷区', 35.6595, 139.7004, 8, '["個室", "シャワー", "Wi-Fi", "ドリンクバー", "ロッカー"]', 'APPROVED', 1, datetime('now')),
('site-shibuya-002', 'host-shibuya-001', 'CARE CUBE 渋谷センター街', 'CARE_CUBE', '東京都渋谷区宇田川町15-1 センタービル2F', '渋谷区', 35.6617, 139.6980, 6, '["個室", "Wi-Fi", "ドリンクバー"]', 'APPROVED', 1, datetime('now')),

-- 新宿エリア
('site-shinjuku-001', 'host-shinjuku-001', 'CARE CUBE 新宿西口', 'CARE_CUBE', '東京都新宿区西新宿1-1-1 新宿タワー5F', '新宿区', 35.6896, 139.6917, 12, '["個室", "シャワー", "Wi-Fi", "ドリンクバー", "ロッカー", "24時間"]', 'APPROVED', 1, datetime('now')),
('site-shinjuku-002', 'host-shinjuku-001', 'CARE CUBE 新宿三丁目', 'CARE_CUBE', '東京都新宿区新宿3-17-23 マルイ本館8F', '新宿区', 35.6906, 139.7063, 8, '["個室", "Wi-Fi", "ドリンクバー"]', 'APPROVED', 1, datetime('now')),
('site-shinjuku-003', 'host-shinjuku-001', 'CARE CUBE 新宿東口', 'CARE_CUBE', '東京都新宿区新宿3-38-1 新宿アルタ前ビル4F', '新宿区', 35.6910, 139.7048, 10, '["個室", "シャワー", "Wi-Fi", "ロッカー"]', 'APPROVED', 1, datetime('now')),

-- 港エリア
('site-minato-001', 'host-minato-001', 'CARE CUBE 六本木ヒルズ', 'CARE_CUBE', '東京都港区六本木6-10-1 六本木ヒルズ ウエストウォーク4F', '港区', 35.6604, 139.7292, 15, '["個室", "シャワー", "Wi-Fi", "ドリンクバー", "ロッカー", "アメニティ充実"]', 'APPROVED', 1, datetime('now')),
('site-minato-002', 'host-minato-001', 'CARE CUBE 赤坂見附', 'CARE_CUBE', '東京都港区赤坂3-2-1 赤坂プラザビル3F', '港区', 35.6777, 139.7368, 8, '["個室", "Wi-Fi", "ドリンクバー", "ロッカー"]', 'APPROVED', 1, datetime('now')),
('site-minato-003', 'host-minato-001', 'CARE CUBE 表参道', 'CARE_CUBE', '東京都港区北青山3-5-10 表参道ビル2F', '港区', 35.6652, 139.7123, 6, '["個室", "シャワー", "Wi-Fi", "ドリンクバー", "アメニティ充実"]', 'APPROVED', 1, datetime('now')),

-- 品川エリア
('site-shinagawa-001', 'host-shinagawa-001', 'CARE CUBE 品川駅前', 'CARE_CUBE', '東京都港区港南2-16-3 品川グランドセントラルタワー3F', '品川区', 35.6284, 139.7387, 12, '["個室", "シャワー", "Wi-Fi", "ドリンクバー", "ロッカー", "荷物預かり"]', 'APPROVED', 1, datetime('now')),
('site-shinagawa-002', 'host-shinagawa-001', 'CARE CUBE 大井町', 'CARE_CUBE', '東京都品川区大井1-6-3 大井町ビル5F', '品川区', 35.6058, 139.7340, 6, '["個室", "Wi-Fi", "ドリンクバー"]', 'APPROVED', 1, datetime('now')),

-- 世田谷エリア
('site-setagaya-001', 'host-setagaya-001', 'CARE CUBE 三軒茶屋', 'CARE_CUBE', '東京都世田谷区三軒茶屋2-11-20 三茶ビル4F', '世田谷区', 35.6431, 139.6689, 8, '["個室", "Wi-Fi", "ドリンクバー", "ロッカー"]', 'APPROVED', 1, datetime('now')),
('site-setagaya-002', 'host-setagaya-001', 'CARE CUBE 下北沢', 'CARE_CUBE', '東京都世田谷区北沢2-14-15 下北沢プラザ3F', '世田谷区', 35.6616, 139.6681, 5, '["個室", "Wi-Fi", "ドリンクバー"]', 'APPROVED', 1, datetime('now')),

-- 千代田エリア
('site-chiyoda-001', 'host-chiyoda-001', 'CARE CUBE 東京駅前', 'CARE_CUBE', '東京都千代田区丸の内1-9-2 グラントウキョウサウスタワー5F', '千代田区', 35.6809, 139.7673, 15, '["個室", "シャワー", "Wi-Fi", "ドリンクバー", "ロッカー", "荷物預かり"]', 'APPROVED', 1, datetime('now')),
('site-chiyoda-002', 'host-chiyoda-001', 'CARE CUBE 秋葉原', 'CARE_CUBE', '東京都千代田区外神田1-15-16 秋葉原ビル6F', '千代田区', 35.6983, 139.7731, 8, '["個室", "Wi-Fi", "ドリンクバー"]', 'APPROVED', 1, datetime('now')),

-- 中央エリア
('site-chuo-001', 'host-chuo-001', 'CARE CUBE 銀座', 'CARE_CUBE', '東京都中央区銀座4-6-1 銀座三越11F', '中央区', 35.6714, 139.7640, 10, '["個室", "シャワー", "Wi-Fi", "ドリンクバー", "ロッカー", "アメニティ充実"]', 'APPROVED', 1, datetime('now')),
('site-chuo-002', 'host-chuo-001', 'CARE CUBE 日本橋', 'CARE_CUBE', '東京都中央区日本橋2-1-3 日本橋ビル5F', '中央区', 35.6823, 139.7739, 8, '["個室", "Wi-Fi", "ドリンクバー", "ロッカー"]', 'APPROVED', 1, datetime('now')),

-- 豊島エリア
('site-toshima-001', 'host-toshima-001', 'CARE CUBE 池袋東口', 'CARE_CUBE', '東京都豊島区南池袋1-28-1 西武池袋本店9F', '豊島区', 35.7295, 139.7109, 10, '["個室", "Wi-Fi", "ドリンクバー", "ロッカー"]', 'APPROVED', 1, datetime('now')),
('site-toshima-002', 'host-toshima-001', 'CARE CUBE 池袋西口', 'CARE_CUBE', '東京都豊島区西池袋1-11-1 メトロポリタンプラザ8F', '豊島区', 35.7305, 139.7089, 12, '["個室", "シャワー", "Wi-Fi", "ドリンクバー", "ロッカー"]', 'APPROVED', 1, datetime('now')),
('site-toshima-003', 'host-toshima-001', 'CARE CUBE 巣鴨', 'CARE_CUBE', '東京都豊島区巣鴨3-34-1 巣鴨プラザ3F', '豊島区', 35.7339, 139.7393, 6, '["個室", "Wi-Fi", "ドリンクバー"]', 'APPROVED', 1, datetime('now'));
