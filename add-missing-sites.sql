-- 新宿区の残り7施設を追加（既に2件あるので）
DELETE FROM sites WHERE id IN ('cube-shinjuku-002', 'cube-shinjuku-003', 'cube-shinjuku-004', 'cube-shinjuku-005', 'cube-shinjuku-006', 'cube-shinjuku-007', 'cube-shinjuku-008', 'cube-shinjuku-009');

INSERT INTO sites (id, host_id, name, type, address, area, lat, lng, cube_serial_number, is_active, room_count, amenities, status, created_at) VALUES
('cube-shinjuku-002', 'host-carecube-001', 'CARE CUBE 新宿三丁目', 'HOTEL', '東京都新宿区新宿3-35-6', '新宿区', 35.6911, 139.7056, 'CUBE-SJK-002', 1, 2, '["Wi-Fi","シャワー","アメニティ"]', 'APPROVED', datetime('now')),
('cube-shinjuku-003', 'host-carecube-001', 'CARE CUBE 新宿御苑', 'HOTEL', '東京都新宿区新宿2-1-2', '新宿区', 35.6873, 139.7108, 'CUBE-SJK-003', 1, 2, '["Wi-Fi","シャワー","アメニティ"]', 'APPROVED', datetime('now')),
('cube-shinjuku-004', 'host-carecube-001', 'CARE CUBE 高田馬場', 'HOTEL', '東京都新宿区高田馬場2-14-5', '新宿区', 35.7127, 139.7040, 'CUBE-SJK-004', 1, 2, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now')),
('cube-shinjuku-005', 'host-carecube-001', 'CARE CUBE 四谷', 'HOTEL', '東京都新宿区四谷1-6-1', '新宿区', 35.6868, 139.7301, 'CUBE-SJK-005', 1, 2, '["Wi-Fi","シャワー","アメニティ"]', 'APPROVED', datetime('now')),
('cube-shinjuku-006', 'host-carecube-001', 'CARE CUBE 神楽坂', 'HOTEL', '東京都新宿区神楽坂3-5', '新宿区', 35.7022, 139.7401, 'CUBE-SJK-006', 1, 1, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now')),
('cube-shinjuku-007', 'host-carecube-001', 'CARE CUBE 早稲田', 'HOTEL', '東京都新宿区早稲田町77', '新宿区', 35.7072, 139.7187, 'CUBE-SJK-007', 1, 1, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now')),
('cube-shinjuku-008', 'host-carecube-001', 'CARE CUBE 西新宿', 'HOTEL', '東京都新宿区西新宿7-10-1', '新宿区', 35.6938, 139.6936, 'CUBE-SJK-008', 1, 2, '["Wi-Fi","シャワー","アメニティ"]', 'APPROVED', datetime('now')),
('cube-shinjuku-009', 'host-carecube-001', 'CARE CUBE 新大久保', 'HOTEL', '東京都新宿区百人町1-10-10', '新宿区', 35.7011, 139.7005, 'CUBE-SJK-009', 1, 1, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now'));

-- 渋谷区の残り1施設追加
DELETE FROM sites WHERE id = 'cube-shibuya-010';
INSERT INTO sites (id, host_id, name, type, address, area, lat, lng, cube_serial_number, is_active, room_count, amenities, status, created_at) VALUES
('cube-shibuya-010', 'host-carecube-001', 'CARE CUBE 神泉', 'HOTEL', '東京都渋谷区神泉町10-10', '渋谷区', 35.6542, 139.6925, 'CUBE-SBY-010', 1, 1, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now'));

-- 港区の残り1施設追加
DELETE FROM sites WHERE id = 'cube-minato-009';
INSERT INTO sites (id, host_id, name, type, address, area, lat, lng, cube_serial_number, is_active, room_count, amenities, status, created_at) VALUES
('cube-minato-009', 'host-carecube-001', 'CARE CUBE 虎ノ門', 'HOTEL', '東京都港区虎ノ門1-17-1', '港区', 35.6684, 139.7505, 'CUBE-TRN-001', 1, 1, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now'));

-- 千代田区の残り1施設追加
DELETE FROM sites WHERE id = 'cube-chiyoda-006';
INSERT INTO sites (id, host_id, name, type, address, area, lat, lng, cube_serial_number, is_active, room_count, amenities, status, created_at) VALUES
('cube-chiyoda-006', 'host-carecube-002', 'CARE CUBE 飯田橋', 'HOTEL', '東京都千代田区飯田橋4-4-15', '千代田区', 35.7021, 139.7465, 'CUBE-IDB-001', 1, 1, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now'));

-- 中央区の残り1施設追加
DELETE FROM sites WHERE id = 'cube-chuo-005';
INSERT INTO sites (id, host_id, name, type, address, area, lat, lng, cube_serial_number, is_active, room_count, amenities, status, created_at) VALUES
('cube-chuo-005', 'host-carecube-002', 'CARE CUBE 茅場町', 'HOTEL', '東京都中央区日本橋茅場町1-5-8', '中央区', 35.6809, 139.7778, 'CUBE-KYB-001', 1, 1, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now'));

-- 品川区の5施設すべて追加（0件だったので）
DELETE FROM sites WHERE id IN ('cube-shinagawa-001', 'cube-shinagawa-002', 'cube-shinagawa-003', 'cube-shinagawa-004', 'cube-shinagawa-005');
INSERT INTO sites (id, host_id, name, type, address, area, lat, lng, cube_serial_number, is_active, room_count, amenities, status, created_at) VALUES
('cube-shinagawa-001', 'host-carecube-002', 'CARE CUBE 五反田', 'HOTEL', '東京都品川区西五反田1-26-2', '品川区', 35.6258, 139.7235, 'CUBE-GTD-001', 1, 2, '["Wi-Fi","シャワー","アメニティ"]', 'APPROVED', datetime('now')),
('cube-shinagawa-002', 'host-carecube-002', 'CARE CUBE 大崎', 'HOTEL', '東京都品川区大崎1-6-1', '品川区', 35.6197, 139.7286, 'CUBE-OSK-001', 1, 2, '["Wi-Fi","シャワー","アメニティ"]', 'APPROVED', datetime('now')),
('cube-shinagawa-003', 'host-carecube-002', 'CARE CUBE 目黒', 'HOTEL', '東京都品川区上大崎2-16-9', '品川区', 35.6337, 139.7158, 'CUBE-MGR-001', 1, 2, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now')),
('cube-shinagawa-004', 'host-carecube-002', 'CARE CUBE 武蔵小山', 'HOTEL', '東京都品川区小山3-23-3', '品川区', 35.6131, 139.7085, 'CUBE-MSK-001', 1, 1, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now')),
('cube-shinagawa-005', 'host-carecube-002', 'CARE CUBE 戸越', 'HOTEL', '東京都品川区戸越2-6-3', '品川区', 35.6097, 139.7151, 'CUBE-TGS-001', 1, 1, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now'));

-- 世田谷区の残り1施設追加
DELETE FROM sites WHERE id = 'cube-setagaya-005';
INSERT INTO sites (id, host_id, name, type, address, area, lat, lng, cube_serial_number, is_active, room_count, amenities, status, created_at) VALUES
('cube-setagaya-005', 'host-carecube-002', 'CARE CUBE 経堂', 'HOTEL', '東京都世田谷区宮坂3-1-45', '世田谷区', 35.6502, 139.6389, 'CUBE-KYD-001', 1, 1, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now'));

SELECT 'CARE CUBE 54施設完全投入完了' as status;
SELECT COUNT(*) as total_sites FROM sites WHERE cube_serial_number IS NOT NULL;
