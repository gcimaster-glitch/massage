-- CARE CUBE 54施設のデータ投入

-- 東京都内の主要エリアにCARE CUBE施設を配置
-- 各エリアに複数施設を設置し、合計54施設

-- ホストユーザー（施設管理者）を作成
INSERT OR IGNORE INTO users (id, email, name, role, phone, email_verified, created_at) VALUES
('host-carecube-001', 'carecube.tokyo@hogusy.com', 'CARE CUBE 東京本部', 'HOST', '03-1234-5678', 1, datetime('now')),
('host-carecube-002', 'carecube.kanto@hogusy.com', 'CARE CUBE 関東エリア', 'HOST', '03-2345-6789', 1, datetime('now'));

-- 渋谷区（10施設）
INSERT OR IGNORE INTO sites (id, host_id, name, type, address, area, lat, lng, cube_serial_number, is_active, room_count, amenities, status, created_at) VALUES
('cube-shibuya-001', 'host-carecube-001', 'CARE CUBE 渋谷駅前', 'HOTEL', '東京都渋谷区道玄坂2-10-7', '渋谷区', 35.6580, 139.6983, 'CUBE-SBY-001', 1, 3, '["Wi-Fi","シャワー","アメニティ","ドリンク"]', 'APPROVED', datetime('now')),
('cube-shibuya-002', 'host-carecube-001', 'CARE CUBE 表参道', 'HOTEL', '東京都渋谷区神宮前5-1-5', '渋谷区', 35.6654, 139.7102, 'CUBE-SBY-002', 1, 2, '["Wi-Fi","シャワー","アメニティ"]', 'APPROVED', datetime('now')),
('cube-shibuya-003', 'host-carecube-001', 'CARE CUBE 代々木', 'HOTEL', '東京都渋谷区代々木1-30-1', '渋谷区', 35.6832, 139.7021, 'CUBE-SBY-003', 1, 2, '["Wi-Fi","シャワー","アメニティ"]', 'APPROVED', datetime('now')),
('cube-shibuya-004', 'host-carecube-001', 'CARE CUBE 恵比寿', 'HOTEL', '東京都渋谷区恵比寿南1-5-5', '渋谷区', 35.6467, 139.7107, 'CUBE-SBY-004', 1, 2, '["Wi-Fi","シャワー","アメニティ","ドリンク"]', 'APPROVED', datetime('now')),
('cube-shibuya-005', 'host-carecube-001', 'CARE CUBE 原宿', 'HOTEL', '東京都渋谷区神宮前1-14-5', '渋谷区', 35.6703, 139.7026, 'CUBE-SBY-005', 1, 2, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now')),
('cube-shibuya-006', 'host-carecube-001', 'CARE CUBE 代官山', 'HOTEL', '東京都渋谷区代官山町20-20', '渋谷区', 35.6503, 139.7026, 'CUBE-SBY-006', 1, 2, '["Wi-Fi","シャワー","アメニティ"]', 'APPROVED', datetime('now')),
('cube-shibuya-007', 'host-carecube-001', 'CARE CUBE 笹塚', 'HOTEL', '東京都渋谷区笹塚1-50-1', '渋谷区', 35.6740, 139.6740, 'CUBE-SBY-007', 1, 1, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now')),
('cube-shibuya-008', 'host-carecube-001', 'CARE CUBE 幡ヶ谷', 'HOTEL', '東京都渋谷区幡ヶ谷2-10-10', '渋谷区', 35.6772, 139.6785, 'CUBE-SBY-008', 1, 1, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now')),
('cube-shibuya-009', 'host-carecube-001', 'CARE CUBE 初台', 'HOTEL', '東京都渋谷区初台1-40-5', '渋谷区', 35.6805, 139.6868, 'CUBE-SBY-009', 1, 1, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now')),
('cube-shibuya-010', 'host-carecube-001', 'CARE CUBE 神泉', 'HOTEL', '東京都渋谷区神泉町10-10', '渋谷区', 35.6542, 139.6925, 'CUBE-SBY-010', 1, 1, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now'));

-- 新宿区（9施設）
INSERT OR IGNORE INTO sites (id, host_id, name, type, address, area, lat, lng, cube_serial_number, is_active, room_count, amenities, status, created_at) VALUES
('cube-shinjuku-001', 'host-carecube-001', 'CARE CUBE 新宿駅前', 'HOTEL', '東京都新宿区西新宿1-1-3', '新宿区', 35.6896, 139.6917, 'CUBE-SJK-001', 1, 3, '["Wi-Fi","シャワー","アメニティ","ドリンク","マッサージチェア"]', 'APPROVED', datetime('now')),
('cube-shinjuku-002', 'host-carecube-001', 'CARE CUBE 新宿三丁目', 'HOTEL', '東京都新宿区新宿3-35-6', '新宿区', 35.6911, 139.7056, 'CUBE-SJK-002', 1, 2, '["Wi-Fi","シャワー","アメニティ"]', 'APPROVED', datetime('now')),
('cube-shinjuku-003', 'host-carecube-001', 'CARE CUBE 新宿御苑', 'HOTEL', '東京都新宿区新宿2-1-2', '新宿区', 35.6873, 139.7108, 'CUBE-SJK-003', 1, 2, '["Wi-Fi","シャワー","アメニティ"]', 'APPROVED', datetime('now')),
('cube-shinjuku-004', 'host-carecube-001', 'CARE CUBE 高田馬場', 'HOTEL', '東京都新宿区高田馬場2-14-5', '新宿区', 35.7127, 139.7040, 'CUBE-SJK-004', 1, 2, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now')),
('cube-shinjuku-005', 'host-carecube-001', 'CARE CUBE 四谷', 'HOTEL', '東京都新宿区四谷1-6-1', '新宿区', 35.6868, 139.7301, 'CUBE-SJK-005', 1, 2, '["Wi-Fi","シャワー","アメニティ"]', 'APPROVED', datetime('now')),
('cube-shinjuku-006', 'host-carecube-001', 'CARE CUBE 神楽坂', 'HOTEL', '東京都新宿区神楽坂3-5', '新宿区', 35.7022, 139.7401, 'CUBE-SJK-006', 1, 1, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now')),
('cube-shinjuku-007', 'host-carecube-001', 'CARE CUBE 早稲田', 'HOTEL', '東京都新宿区早稲田町77', '新宿区', 35.7072, 139.7187, 'CUBE-SJK-007', 1, 1, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now')),
('cube-shinjuku-008', 'host-carecube-001', 'CARE CUBE 西新宿', 'HOTEL', '東京都新宿区西新宿7-10-1', '新宿区', 35.6938, 139.6936, 'CUBE-SJK-008', 1, 2, '["Wi-Fi","シャワー","アメニティ"]', 'APPROVED', datetime('now')),
('cube-shinjuku-009', 'host-carecube-001', 'CARE CUBE 新大久保', 'HOTEL', '東京都新宿区百人町1-10-10', '新宿区', 35.7011, 139.7005, 'CUBE-SJK-009', 1, 1, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now'));

-- 港区（9施設）
INSERT OR IGNORE INTO sites (id, host_id, name, type, address, area, lat, lng, cube_serial_number, is_active, room_count, amenities, status, created_at) VALUES
('cube-minato-001', 'host-carecube-001', 'CARE CUBE 六本木ヒルズ', 'HOTEL', '東京都港区六本木6-10-1', '港区', 35.6604, 139.7292, 'CUBE-RPG-001', 1, 3, '["Wi-Fi","シャワー","アメニティ","ドリンク","VIPラウンジ"]', 'APPROVED', datetime('now')),
('cube-minato-002', 'host-carecube-001', 'CARE CUBE 赤坂', 'HOTEL', '東京都港区赤坂5-3-1', '港区', 35.6733, 139.7368, 'CUBE-AKS-001', 1, 2, '["Wi-Fi","シャワー","アメニティ"]', 'APPROVED', datetime('now')),
('cube-minato-003', 'host-carecube-001', 'CARE CUBE 麻布十番', 'HOTEL', '東京都港区麻布十番2-3-5', '港区', 35.6551, 139.7366, 'CUBE-AZB-001', 1, 2, '["Wi-Fi","シャワー","アメニティ","ドリンク"]', 'APPROVED', datetime('now')),
('cube-minato-004', 'host-carecube-001', 'CARE CUBE 品川', 'HOTEL', '東京都港区港南2-3-13', '港区', 35.6284, 139.7387, 'CUBE-SGW-001', 1, 2, '["Wi-Fi","シャワー","アメニティ"]', 'APPROVED', datetime('now')),
('cube-minato-005', 'host-carecube-001', 'CARE CUBE 白金高輪', 'HOTEL', '東京都港区白金1-17-2', '港区', 35.6401, 139.7358, 'CUBE-SRK-001', 1, 2, '["Wi-Fi","シャワー","アメニティ"]', 'APPROVED', datetime('now')),
('cube-minato-006', 'host-carecube-001', 'CARE CUBE 田町', 'HOTEL', '東京都港区芝5-29-20', '港区', 35.6456, 139.7476, 'CUBE-TMC-001', 1, 1, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now')),
('cube-minato-007', 'host-carecube-001', 'CARE CUBE 浜松町', 'HOTEL', '東京都港区浜松町2-5-5', '港区', 35.6551, 139.7571, 'CUBE-HMM-001', 1, 1, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now')),
('cube-minato-008', 'host-carecube-001', 'CARE CUBE 新橋', 'HOTEL', '東京都港区新橋2-16-1', '港区', 35.6664, 139.7582, 'CUBE-SBH-001', 1, 2, '["Wi-Fi","シャワー","アメニティ"]', 'APPROVED', datetime('now')),
('cube-minato-009', 'host-carecube-001', 'CARE CUBE 虎ノ門', 'HOTEL', '東京都港区虎ノ門1-17-1', '港区', 35.6684, 139.7505, 'CUBE-TRN-001', 1, 1, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now'));

-- 千代田区（6施設）
INSERT OR IGNORE INTO sites (id, host_id, name, type, address, area, lat, lng, cube_serial_number, is_active, room_count, amenities, status, created_at) VALUES
('cube-chiyoda-001', 'host-carecube-002', 'CARE CUBE 東京駅', 'HOTEL', '東京都千代田区丸の内1-9-1', '千代田区', 35.6812, 139.7671, 'CUBE-TYO-001', 1, 3, '["Wi-Fi","シャワー","アメニティ","ドリンク"]', 'APPROVED', datetime('now')),
('cube-chiyoda-002', 'host-carecube-002', 'CARE CUBE 秋葉原', 'HOTEL', '東京都千代田区外神田1-15-9', '千代田区', 35.6983, 139.7731, 'CUBE-AKB-001', 1, 2, '["Wi-Fi","シャワー","アメニティ"]', 'APPROVED', datetime('now')),
('cube-chiyoda-003', 'host-carecube-002', 'CARE CUBE 神田', 'HOTEL', '東京都千代田区内神田2-10-5', '千代田区', 35.6911, 139.7701, 'CUBE-KND-001', 1, 2, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now')),
('cube-chiyoda-004', 'host-carecube-002', 'CARE CUBE 大手町', 'HOTEL', '東京都千代田区大手町1-6-1', '千代田区', 35.6861, 139.7638, 'CUBE-OTC-001', 1, 2, '["Wi-Fi","シャワー","アメニティ"]', 'APPROVED', datetime('now')),
('cube-chiyoda-005', 'host-carecube-002', 'CARE CUBE 有楽町', 'HOTEL', '東京都千代田区有楽町2-7-1', '千代田区', 35.6751, 139.7633, 'CUBE-YRC-001', 1, 1, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now')),
('cube-chiyoda-006', 'host-carecube-002', 'CARE CUBE 飯田橋', 'HOTEL', '東京都千代田区飯田橋4-4-15', '千代田区', 35.7021, 139.7465, 'CUBE-IDB-001', 1, 1, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now'));

-- 中央区（5施設）
INSERT OR IGNORE INTO sites (id, host_id, name, type, address, area, lat, lng, cube_serial_number, is_active, room_count, amenities, status, created_at) VALUES
('cube-chuo-001', 'host-carecube-002', 'CARE CUBE 銀座', 'HOTEL', '東京都中央区銀座4-6-16', '中央区', 35.6714, 139.7645, 'CUBE-GNZ-001', 1, 3, '["Wi-Fi","シャワー","アメニティ","ドリンク","VIPラウンジ"]', 'APPROVED', datetime('now')),
('cube-chuo-002', 'host-carecube-002', 'CARE CUBE 日本橋', 'HOTEL', '東京都中央区日本橋2-7-1', '中央区', 35.6826, 139.7739, 'CUBE-NHB-001', 1, 2, '["Wi-Fi","シャワー","アメニティ"]', 'APPROVED', datetime('now')),
('cube-chuo-003', 'host-carecube-002', 'CARE CUBE 築地', 'HOTEL', '東京都中央区築地4-10-10', '中央区', 35.6659, 139.7702, 'CUBE-TKJ-001', 1, 1, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now')),
('cube-chuo-004', 'host-carecube-002', 'CARE CUBE 八丁堀', 'HOTEL', '東京都中央区八丁堀2-20-8', '中央区', 35.6734, 139.7792, 'CUBE-HCB-001', 1, 1, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now')),
('cube-chuo-005', 'host-carecube-002', 'CARE CUBE 茅場町', 'HOTEL', '東京都中央区日本橋茅場町1-5-8', '中央区', 35.6809, 139.7778, 'CUBE-KYB-001', 1, 1, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now'));

-- 品川区（5施設）
INSERT OR IGNORE INTO sites (id, host_id, name, type, address, area, lat, lng, cube_serial_number, is_active, room_count, amenities, status, created_at) VALUES
('cube-shinagawa-001', 'host-carecube-002', 'CARE CUBE 五反田', 'HOTEL', '東京都品川区西五反田1-26-2', '品川区', 35.6258, 139.7235, 'CUBE-GTD-001', 1, 2, '["Wi-Fi","シャワー","アメニティ"]', 'APPROVED', datetime('now')),
('cube-shinagawa-002', 'host-carecube-002', 'CARE CUBE 大崎', 'HOTEL', '東京都品川区大崎1-6-1', '品川区', 35.6197, 139.7286, 'CUBE-OSK-001', 1, 2, '["Wi-Fi","シャワー","アメニティ"]', 'APPROVED', datetime('now')),
('cube-shinagawa-003', 'host-carecube-002', 'CARE CUBE 目黒', 'HOTEL', '東京都品川区上大崎2-16-9', '品川区', 35.6337, 139.7158, 'CUBE-MGR-001', 1, 2, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now')),
('cube-shinagawa-004', 'host-carecube-002', 'CARE CUBE 武蔵小山', 'HOTEL', '東京都品川区小山3-23-3', '品川区', 35.6131, 139.7085, 'CUBE-MSK-001', 1, 1, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now')),
('cube-shinagawa-005', 'host-carecube-002', 'CARE CUBE 戸越', 'HOTEL', '東京都品川区戸越2-6-3', '品川区', 35.6097, 139.7151, 'CUBE-TGS-001', 1, 1, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now'));

-- 世田谷区（5施設）
INSERT OR IGNORE INTO sites (id, host_id, name, type, address, area, lat, lng, cube_serial_number, is_active, room_count, amenities, status, created_at) VALUES
('cube-setagaya-001', 'host-carecube-002', 'CARE CUBE 三軒茶屋', 'HOTEL', '東京都世田谷区三軒茶屋2-13-7', '世田谷区', 35.6430, 139.6697, 'CUBE-SGY-001', 1, 2, '["Wi-Fi","シャワー","アメニティ"]', 'APPROVED', datetime('now')),
('cube-setagaya-002', 'host-carecube-002', 'CARE CUBE 下北沢', 'HOTEL', '東京都世田谷区北沢2-11-15', '世田谷区', 35.6616, 139.6680, 'CUBE-SMK-001', 1, 2, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now')),
('cube-setagaya-003', 'host-carecube-002', 'CARE CUBE 二子玉川', 'HOTEL', '東京都世田谷区玉川2-21-1', '世田谷区', 35.6122, 139.6288, 'CUBE-FTK-001', 1, 2, '["Wi-Fi","シャワー","アメニティ","ドリンク"]', 'APPROVED', datetime('now')),
('cube-setagaya-004', 'host-carecube-002', 'CARE CUBE 成城学園前', 'HOTEL', '東京都世田谷区成城6-5-34', '世田谷区', 35.6413, 139.6019, 'CUBE-SJG-001', 1, 1, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now')),
('cube-setagaya-005', 'host-carecube-002', 'CARE CUBE 経堂', 'HOTEL', '東京都世田谷区宮坂3-1-45', '世田谷区', 35.6502, 139.6389, 'CUBE-KYD-001', 1, 1, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now'));

-- 豊島区（5施設）
INSERT OR IGNORE INTO sites (id, host_id, name, type, address, area, lat, lng, cube_serial_number, is_active, room_count, amenities, status, created_at) VALUES
('cube-toshima-001', 'host-carecube-002', 'CARE CUBE 池袋東口', 'HOTEL', '東京都豊島区南池袋1-28-1', '豊島区', 35.7296, 139.7109, 'CUBE-IKB-001', 1, 3, '["Wi-Fi","シャワー","アメニティ","ドリンク"]', 'APPROVED', datetime('now')),
('cube-toshima-002', 'host-carecube-002', 'CARE CUBE 池袋西口', 'HOTEL', '東京都豊島区西池袋1-17-10', '豊島区', 35.7304, 139.7072, 'CUBE-IKB-002', 1, 2, '["Wi-Fi","シャワー","アメニティ"]', 'APPROVED', datetime('now')),
('cube-toshima-003', 'host-carecube-002', 'CARE CUBE 大塚', 'HOTEL', '東京都豊島区南大塚3-33-1', '豊島区', 35.7311, 139.7285, 'CUBE-OTK-001', 1, 1, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now')),
('cube-toshima-004', 'host-carecube-002', 'CARE CUBE 巣鴨', 'HOTEL', '東京都豊島区巣鴨3-34-2', '豊島区', 35.7334, 139.7392, 'CUBE-SGM-001', 1, 1, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now')),
('cube-toshima-005', 'host-carecube-002', 'CARE CUBE 駒込', 'HOTEL', '東京都豊島区駒込1-43-9', '豊島区', 35.7364, 139.7470, 'CUBE-KMG-001', 1, 1, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now'));

SELECT 'CARE CUBE 54施設のデータ投入完了' as status;
SELECT COUNT(*) as total_sites FROM sites WHERE cube_serial_number IS NOT NULL;
