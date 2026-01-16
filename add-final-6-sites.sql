-- 最後の6施設を追加して合計54施設に

-- 新宿区を10施設に（+1）
INSERT OR IGNORE INTO sites (id, host_id, name, type, address, area, lat, lng, cube_serial_number, is_active, room_count, amenities, status, created_at) VALUES
('cube-shinjuku-010', 'host-carecube-001', 'CARE CUBE 信濃町', 'HOTEL', '東京都新宿区信濃町34', '新宿区', 35.6805, 139.7211, 'CUBE-SJK-010', 1, 1, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now'));

-- 港区を10施設に（+1）
INSERT OR IGNORE INTO sites (id, host_id, name, type, address, area, lat, lng, cube_serial_number, is_active, room_count, amenities, status, created_at) VALUES
('cube-minato-010', 'host-carecube-001', 'CARE CUBE 表参道駅', 'HOTEL', '東京都港区北青山3-6-12', '港区', 35.6654, 139.7119, 'CUBE-MIN-010', 1, 1, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now'));

-- 豊島区を6施設に（+1）
INSERT OR IGNORE INTO sites (id, host_id, name, type, address, area, lat, lng, cube_serial_number, is_active, room_count, amenities, status, created_at) VALUES
('cube-toshima-006', 'host-carecube-002', 'CARE CUBE 東池袋', 'HOTEL', '東京都豊島区東池袋1-13-16', '豊島区', 35.7313, 139.7177, 'CUBE-TSM-006', 1, 1, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now'));

-- 世田谷区を6施設に（+1）
INSERT OR IGNORE INTO sites (id, host_id, name, type, address, area, lat, lng, cube_serial_number, is_active, room_count, amenities, status, created_at) VALUES
('cube-setagaya-006', 'host-carecube-002', 'CARE CUBE 用賀', 'HOTEL', '東京都世田谷区用賀4-10-1', '世田谷区', 35.6262, 139.6356, 'CUBE-STG-006', 1, 1, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now'));

-- 中央区を6施設に（+1）
INSERT OR IGNORE INTO sites (id, host_id, name, type, address, area, lat, lng, cube_serial_number, is_active, room_count, amenities, status, created_at) VALUES
('cube-chuo-006', 'host-carecube-002', 'CARE CUBE 人形町', 'HOTEL', '東京都中央区日本橋人形町2-14-5', '中央区', 35.6853, 139.7826, 'CUBE-CHO-006', 1, 1, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now'));

-- 品川区を6施設に（+1）
INSERT OR IGNORE INTO sites (id, host_id, name, type, address, area, lat, lng, cube_serial_number, is_active, room_count, amenities, status, created_at) VALUES
('cube-shinagawa-006', 'host-carecube-002', 'CARE CUBE 不動前', 'HOTEL', '東京都品川区西五反田5-24-7', '品川区', 35.6231, 139.7167, 'CUBE-SGW-006', 1, 1, '["Wi-Fi","アメニティ"]', 'APPROVED', datetime('now'));

SELECT 'CARE CUBE 54施設完全投入完了！' as status;
SELECT COUNT(*) as total_sites FROM sites WHERE cube_serial_number IS NOT NULL;
SELECT area, COUNT(*) as count FROM sites WHERE cube_serial_number IS NOT NULL GROUP BY area ORDER BY area;
