-- CARE CUBE 54施設データの投入
-- 東京23区全域に展開

-- ホストユーザーの追加（エリアごと）
INSERT OR IGNORE INTO users (id, email, name, role, email_verified, created_at) VALUES
('host-shibuya-001', 'host.shibuya@carecube.jp', 'CARE CUBE 渋谷管理', 'HOST', 1, datetime('now')),
('host-shinjuku-001', 'host.shinjuku@carecube.jp', 'CARE CUBE 新宿管理', 'HOST', 1, datetime('now')),
('host-minato-001', 'host.minato@carecube.jp', 'CARE CUBE 港管理', 'HOST', 1, datetime('now')),
('host-shinagawa-001', 'host.shinagawa@carecube.jp', 'CARE CUBE 品川管理', 'HOST', 1, datetime('now')),
('host-setagaya-001', 'host.setagaya@carecube.jp', 'CARE CUBE 世田谷管理', 'HOST', 1, datetime('now')),
('host-chiyoda-001', 'host.chiyoda@carecube.jp', 'CARE CUBE 千代田管理', 'HOST', 1, datetime('now')),
('host-chuo-001', 'host.chuo@carecube.jp', 'CARE CUBE 中央管理', 'HOST', 1, datetime('now')),
('host-toshima-001', 'host.toshima@carecube.jp', 'CARE CUBE 豊島管理', 'HOST', 1, datetime('now')),
('host-meguro-001', 'host.meguro@carecube.jp', 'CARE CUBE 目黒管理', 'HOST', 1, datetime('now')),
('host-taito-001', 'host.taito@carecube.jp', 'CARE CUBE 台東管理', 'HOST', 1, datetime('now')),
('host-sumida-001', 'host.sumida@carecube.jp', 'CARE CUBE 墨田管理', 'HOST', 1, datetime('now')),
('host-koto-001', 'host.koto@carecube.jp', 'CARE CUBE 江東管理', 'HOST', 1, datetime('now'));

-- CARE CUBE施設データ（54施設）
-- 渋谷区（6施設）
INSERT OR IGNORE INTO sites (id, host_id, name, type, address, area, lat, lng, room_count, amenities, status, created_at) VALUES
('site-shibuya-001', 'host-shibuya-001', 'CARE CUBE 渋谷駅前', 'OFFICE', '東京都渋谷区道玄坂1-2-3 渋谷ビル3F', 'shibuya', 35.6595, 139.7004, 8, '["個室","シャワー","Wi-Fi","ドリンクバー","ロッカー"]', 'APPROVED', datetime('now')),
('site-shibuya-002', 'host-shibuya-001', 'CARE CUBE 渋谷センター街', 'OFFICE', '東京都渋谷区宇田川町15-1 センタービル2F', 'shibuya', 35.6617, 139.6980, 6, '["個室","Wi-Fi","ドリンクバー"]', 'APPROVED', datetime('now')),
('site-shibuya-003', 'host-shibuya-001', 'CARE CUBE 渋谷ヒカリエ', 'OFFICE', '東京都渋谷区渋谷2-21-1 ヒカリエ8F', 'shibuya', 35.6595, 139.7035, 10, '["個室","シャワー","Wi-Fi","ドリンクバー","ロッカー","24時間"]', 'APPROVED', datetime('now')),
('site-shibuya-004', 'host-shibuya-001', 'CARE CUBE 表参道', 'OFFICE', '東京都渋谷区神宮前4-3-2 表参道ビル5F', 'shibuya', 35.6657, 139.7105, 5, '["個室","Wi-Fi","ロッカー"]', 'APPROVED', datetime('now')),
('site-shibuya-005', 'host-shibuya-001', 'CARE CUBE 代々木', 'OFFICE', '東京都渋谷区代々木1-32-5 代々木ビル4F', 'shibuya', 35.6833, 139.7024, 7, '["個室","シャワー","Wi-Fi","ドリンクバー"]', 'APPROVED', datetime('now')),
('site-shibuya-006', 'host-shibuya-001', 'CARE CUBE 恵比寿', 'OFFICE', '東京都渋谷区恵比寿南1-5-5 恵比寿ビル3F', 'shibuya', 35.6469, 139.7106, 8, '["個室","シャワー","Wi-Fi","ドリンクバー","ロッカー"]', 'APPROVED', datetime('now')),

-- 新宿区（7施設）
('site-shinjuku-001', 'host-shinjuku-001', 'CARE CUBE 新宿西口', 'OFFICE', '東京都新宿区西新宿1-1-1 新宿タワー5F', 'shinjuku', 35.6896, 139.6917, 12, '["個室","シャワー","Wi-Fi","ドリンクバー","ロッカー","24時間"]', 'APPROVED', datetime('now')),
('site-shinjuku-002', 'host-shinjuku-001', 'CARE CUBE 新宿三丁目', 'OFFICE', '東京都新宿区新宿3-17-23 マルイ本館8F', 'shinjuku', 35.6904, 139.7056, 8, '["個室","Wi-Fi","ドリンクバー"]', 'APPROVED', datetime('now')),
('site-shinjuku-003', 'host-shinjuku-001', 'CARE CUBE 新宿東口', 'OFFICE', '東京都新宿区新宿3-38-1 新宿アルタ前ビル4F', 'shinjuku', 35.6918, 139.7048, 10, '["個室","シャワー","Wi-Fi","ロッカー"]', 'APPROVED', datetime('now')),
('site-shinjuku-004', 'host-shinjuku-001', 'CARE CUBE 高田馬場', 'OFFICE', '東京都新宿区高田馬場1-26-5 FIビル3F', 'shinjuku', 35.7127, 139.7039, 6, '["個室","Wi-Fi","ドリンクバー"]', 'APPROVED', datetime('now')),
('site-shinjuku-005', 'host-shinjuku-001', 'CARE CUBE 四谷', 'OFFICE', '東京都新宿区四谷1-2-3 四谷ビル2F', 'shinjuku', 35.6869, 139.7298, 5, '["個室","Wi-Fi","ロッカー"]', 'APPROVED', datetime('now')),
('site-shinjuku-006', 'host-shinjuku-001', 'CARE CUBE 神楽坂', 'OFFICE', '東京都新宿区神楽坂3-6 神楽坂ビル4F', 'shinjuku', 35.7022, 139.7394, 7, '["個室","シャワー","Wi-Fi","ドリンクバー"]', 'APPROVED', datetime('now')),
('site-shinjuku-007', 'host-shinjuku-001', 'CARE CUBE 新大久保', 'OFFICE', '東京都新宿区百人町1-10-10 新大久保ビル3F', 'shinjuku', 35.7009, 139.7008, 6, '["個室","Wi-Fi","ドリンクバー"]', 'APPROVED', datetime('now')),

-- 港区（6施設）
('site-minato-001', 'host-minato-001', 'CARE CUBE 六本木', 'OFFICE', '東京都港区六本木6-1-24 ラピロス六本木7F', 'minato', 35.6627, 139.7294, 10, '["個室","シャワー","Wi-Fi","ドリンクバー","ロッカー","24時間"]', 'APPROVED', datetime('now')),
('site-minato-002', 'host-minato-001', 'CARE CUBE 赤坂', 'OFFICE', '東京都港区赤坂3-21-20 赤坂ロングビーチビル5F', 'minato', 35.6761, 139.7368, 8, '["個室","Wi-Fi","ドリンクバー"]', 'APPROVED', datetime('now')),
('site-minato-003', 'host-minato-001', 'CARE CUBE 麻布十番', 'OFFICE', '東京都港区麻布十番2-3-5 麻布十番ビル4F', 'minato', 35.6552, 139.7377, 7, '["個室","シャワー","Wi-Fi","ロッカー"]', 'APPROVED', datetime('now')),
('site-minato-004', 'host-minato-001', 'CARE CUBE 品川駅前', 'OFFICE', '東京都港区港南2-16-1 品川イーストワンタワー3F', 'minato', 35.6284, 139.7387, 12, '["個室","シャワー","Wi-Fi","ドリンクバー","ロッカー","24時間"]', 'APPROVED', datetime('now')),
('site-minato-005', 'host-minato-001', 'CARE CUBE 田町', 'OFFICE', '東京都港区芝5-31-17 PMO田町2F', 'minato', 35.6458, 139.7476, 6, '["個室","Wi-Fi","ドリンクバー"]', 'APPROVED', datetime('now')),
('site-minato-006', 'host-minato-001', 'CARE CUBE お台場', 'OFFICE', '東京都港区台場2-3-1 トレードピアお台場4F', 'minato', 35.6256, 139.7756, 8, '["個室","シャワー","Wi-Fi","ドリンクバー","ロッカー"]', 'APPROVED', datetime('now')),

-- 千代田区（5施設）
('site-chiyoda-001', 'host-chiyoda-001', 'CARE CUBE 東京駅', 'OFFICE', '東京都千代田区丸の内1-9-2 グラントウキョウサウスタワー8F', 'chiyoda', 35.6812, 139.7671, 15, '["個室","シャワー","Wi-Fi","ドリンクバー","ロッカー","24時間"]', 'APPROVED', datetime('now')),
('site-chiyoda-002', 'host-chiyoda-001', 'CARE CUBE 大手町', 'OFFICE', '東京都千代田区大手町1-6-1 大手町ビル10F', 'chiyoda', 35.6862, 139.7646, 10, '["個室","Wi-Fi","ドリンクバー","ロッカー"]', 'APPROVED', datetime('now')),
('site-chiyoda-003', 'host-chiyoda-001', 'CARE CUBE 神田', 'OFFICE', '東京都千代田区神田須田町1-5 神田ビル3F', 'chiyoda', 35.6943, 139.7705, 6, '["個室","Wi-Fi","ドリンクバー"]', 'APPROVED', datetime('now')),
('site-chiyoda-004', 'host-chiyoda-001', 'CARE CUBE 秋葉原', 'OFFICE', '東京都千代田区外神田1-15-16 秋葉原ビル5F', 'chiyoda', 35.6983, 139.7731, 8, '["個室","シャワー","Wi-Fi","ドリンクバー","ロッカー"]', 'APPROVED', datetime('now')),
('site-chiyoda-005', 'host-chiyoda-001', 'CARE CUBE 有楽町', 'OFFICE', '東京都千代田区有楽町2-10-1 東京交通会館4F', 'chiyoda', 35.6750, 139.7634, 7, '["個室","Wi-Fi","ドリンクバー"]', 'APPROVED', datetime('now')),

-- 中央区（4施設）
('site-chuo-001', 'host-chuo-001', 'CARE CUBE 銀座', 'OFFICE', '東京都中央区銀座4-6-16 銀座三越9F', 'chuo', 35.6719, 139.7648, 12, '["個室","シャワー","Wi-Fi","ドリンクバー","ロッカー","24時間"]', 'APPROVED', datetime('now')),
('site-chuo-002', 'host-chuo-001', 'CARE CUBE 日本橋', 'OFFICE', '東京都中央区日本橋2-1-17 丹生ビル5F', 'chuo', 35.6828, 139.7745, 8, '["個室","Wi-Fi","ドリンクバー"]', 'APPROVED', datetime('now')),
('site-chuo-003', 'host-chuo-001', 'CARE CUBE 八重洲', 'OFFICE', '東京都中央区八重洲1-5-3 八重洲ビル3F', 'chuo', 35.6804, 139.7700, 6, '["個室","シャワー","Wi-Fi","ロッカー"]', 'APPROVED', datetime('now')),
('site-chuo-004', 'host-chuo-001', 'CARE CUBE 月島', 'OFFICE', '東京都中央区月島1-5-2 キャピタルゲートプレイス4F', 'chuo', 35.6641, 139.7808, 5, '["個室","Wi-Fi","ドリンクバー"]', 'APPROVED', datetime('now')),

-- 品川区（3施設）
('site-shinagawa-001', 'host-shinagawa-001', 'CARE CUBE 大崎', 'OFFICE', '東京都品川区大崎1-2-2 アートヴィレッジ大崎セントラルタワー5F', 'shinagawa', 35.6197, 139.7284, 10, '["個室","シャワー","Wi-Fi","ドリンクバー","ロッカー"]', 'APPROVED', datetime('now')),
('site-shinagawa-002', 'host-shinagawa-001', 'CARE CUBE 五反田', 'OFFICE', '東京都品川区西五反田2-27-3 A-PLACE五反田4F', 'shinagawa', 35.6258, 139.7235, 8, '["個室","Wi-Fi","ドリンクバー"]', 'APPROVED', datetime('now')),
('site-shinagawa-003', 'host-shinagawa-001', 'CARE CUBE 武蔵小山', 'OFFICE', '東京都品川区小山3-27-5 武蔵小山ビル3F', 'shinagawa', 35.6145, 139.7087, 6, '["個室","シャワー","Wi-Fi","ドリンクバー"]', 'APPROVED', datetime('now')),

-- 世田谷区（3施設）
('site-setagaya-001', 'host-setagaya-001', 'CARE CUBE 三軒茶屋', 'OFFICE', '東京都世田谷区太子堂4-1-1 キャロットタワー5F', 'setagaya', 35.6431, 139.6695, 8, '["個室","シャワー","Wi-Fi","ドリンクバー","ロッカー"]', 'APPROVED', datetime('now')),
('site-setagaya-002', 'host-setagaya-001', 'CARE CUBE 下北沢', 'OFFICE', '東京都世田谷区北沢2-11-15 下北沢ビル4F', 'setagaya', 35.6617, 139.6681, 6, '["個室","Wi-Fi","ドリンクバー"]', 'APPROVED', datetime('now')),
('site-setagaya-003', 'host-setagaya-001', 'CARE CUBE 二子玉川', 'OFFICE', '東京都世田谷区玉川2-21-1 二子玉川ライズ・ドッグウッドプラザ3F', 'setagaya', 35.6122, 139.6276, 10, '["個室","シャワー","Wi-Fi","ドリンクバー","ロッカー","24時間"]', 'APPROVED', datetime('now')),

-- 豊島区（4施設）
('site-toshima-001', 'host-toshima-001', 'CARE CUBE 池袋東口', 'OFFICE', '東京都豊島区南池袋1-28-1 西武池袋本店9F', 'toshima', 35.7295, 139.7109, 12, '["個室","シャワー","Wi-Fi","ドリンクバー","ロッカー","24時間"]', 'APPROVED', datetime('now')),
('site-toshima-002', 'host-toshima-001', 'CARE CUBE 池袋西口', 'OFFICE', '東京都豊島区西池袋1-11-1 メトロポリタンプラザ8F', 'toshima', 35.7304, 139.7091, 10, '["個室","Wi-Fi","ドリンクバー","ロッカー"]', 'APPROVED', datetime('now')),
('site-toshima-003', 'host-toshima-001', 'CARE CUBE 大塚', 'OFFICE', '東京都豊島区南大塚3-33-1 大塚ビル4F', 'toshima', 35.7314, 139.7285, 6, '["個室","Wi-Fi","ドリンクバー"]', 'APPROVED', datetime('now')),
('site-toshima-004', 'host-toshima-001', 'CARE CUBE 巣鴨', 'OFFICE', '東京都豊島区巣鴨3-34-1 巣鴨ビル3F', 'toshima', 35.7337, 139.7393, 5, '["個室","シャワー","Wi-Fi","ドリンクバー"]', 'APPROVED', datetime('now')),

-- 目黒区（3施設）
('site-meguro-001', 'host-meguro-001', 'CARE CUBE 目黒', 'OFFICE', '東京都目黒区目黒1-4-16 目黒Gビル5F', 'meguro', 35.6337, 139.7155, 8, '["個室","シャワー","Wi-Fi","ドリンクバー","ロッカー"]', 'APPROVED', datetime('now')),
('site-meguro-002', 'host-meguro-001', 'CARE CUBE 中目黒', 'OFFICE', '東京都目黒区上目黒1-26-1 中目黒アトラスタワー3F', 'meguro', 35.6443, 139.6987, 7, '["個室","Wi-Fi","ドリンクバー"]', 'APPROVED', datetime('now')),
('site-meguro-003', 'host-meguro-001', 'CARE CUBE 自由が丘', 'OFFICE', '東京都目黒区自由が丘2-9-15 自由が丘ビル4F', 'meguro', 35.6078, 139.6684, 6, '["個室","シャワー","Wi-Fi","ドリンクバー"]', 'APPROVED', datetime('now')),

-- 台東区（3施設）
('site-taito-001', 'host-taito-001', 'CARE CUBE 上野', 'OFFICE', '東京都台東区上野7-1-1 アトレ上野7F', 'taito', 35.7139, 139.7771, 10, '["個室","シャワー","Wi-Fi","ドリンクバー","ロッカー"]', 'APPROVED', datetime('now')),
('site-taito-002', 'host-taito-001', 'CARE CUBE 浅草', 'OFFICE', '東京都台東区浅草1-4-1 浅草ビル3F', 'taito', 35.7116, 139.7966, 8, '["個室","Wi-Fi","ドリンクバー"]', 'APPROVED', datetime('now')),
('site-taito-003', 'host-taito-001', 'CARE CUBE 御徒町', 'OFFICE', '東京都台東区上野3-27-1 十仁タワー4F', 'taito', 35.7075, 139.7743, 6, '["個室","シャワー","Wi-Fi","ドリンクバー"]', 'APPROVED', datetime('now')),

-- 墨田区（2施設）
('site-sumida-001', 'host-sumida-001', 'CARE CUBE 錦糸町', 'OFFICE', '東京都墨田区江東橋3-14-5 テルミナ2 5F', 'sumida', 35.6967, 139.8137, 8, '["個室","シャワー","Wi-Fi","ドリンクバー","ロッカー"]', 'APPROVED', datetime('now')),
('site-sumida-002', 'host-sumida-001', 'CARE CUBE 押上', 'OFFICE', '東京都墨田区押上1-1-2 東京ソラマチ10F', 'sumida', 35.7101, 139.8107, 10, '["個室","Wi-Fi","ドリンクバー","ロッカー","24時間"]', 'APPROVED', datetime('now')),

-- 江東区（3施設）
('site-koto-001', 'host-koto-001', 'CARE CUBE 豊洲', 'OFFICE', '東京都江東区豊洲2-4-9 アーバンドックららぽーと豊洲3F', 'koto', 35.6543, 139.7968, 12, '["個室","シャワー","Wi-Fi","ドリンクバー","ロッカー","24時間"]', 'APPROVED', datetime('now')),
('site-koto-002', 'host-koto-001', 'CARE CUBE 門前仲町', 'OFFICE', '東京都江東区富岡1-26-21 門前仲町ビル4F', 'koto', 35.6719, 139.7962, 6, '["個室","Wi-Fi","ドリンクバー"]', 'APPROVED', datetime('now')),
('site-koto-003', 'host-koto-001', 'CARE CUBE 亀戸', 'OFFICE', '東京都江東区亀戸5-1-1 アトレ亀戸6F', 'koto', 35.6974, 139.8261, 8, '["個室","シャワー","Wi-Fi","ドリンクバー","ロッカー"]', 'APPROVED', datetime('now'));
