-- =====================================================
-- セラピスト事務所とCARE CUBE施設のモックデータ（本番環境用）
-- 本番環境のスキーマに合わせたバージョン
-- =====================================================

-- =====================================================
-- 1. 事務所オーナーユーザー作成（3名）
-- =====================================================

INSERT INTO users (id, email, name, phone, role, created_at) VALUES
('u-office-hq', 'hq@hogusy.com', '岩間 哲士', '03-1234-5678', 'THERAPIST_OFFICE', datetime('now')),
('u-office-roppongi', 'manager@roppongi-wellness.jp', '佐藤 健太', '03-2345-6789', 'THERAPIST_OFFICE', datetime('now')),
('u-office-shinjuku', 'info@shinjuku-healing.jp', '田中 美咲', '03-3456-7890', 'THERAPIST_OFFICE', datetime('now'));

-- =====================================================
-- 2. セラピスト事務所（3箇所）
-- =====================================================

INSERT INTO offices (id, user_id, name, area_code, manager_name, contact_email, commission_rate, status, therapist_count, created_at) VALUES
('off-hogusy-hq', 'u-office-hq', 'HOGUSY本部（プロパー）', 'TOKYO_STATION', '岩間 哲士', 'hq@hogusy.com', 0, 'APPROVED', 5, datetime('now')),
('off-roppongi-wellness', 'u-office-roppongi', '六本木ウェルネスセンター', 'ROPPONGI', '佐藤 健太', 'manager@roppongi-wellness.jp', 15, 'APPROVED', 4, datetime('now')),
('off-shinjuku-healing', 'u-office-shinjuku', '新宿ヒーリングラボ', 'SHINJUKU', '田中 美咲', 'info@shinjuku-healing.jp', 12, 'APPROVED', 4, datetime('now'));

-- =====================================================
-- 3. 施設ホストユーザー作成（5名）
-- =====================================================

INSERT INTO users (id, email, name, phone, role, created_at) VALUES
('u-host-grand-tokyo', 'info@grand-tokyo.jp', '株式会社グランドホテルズ', '03-1111-1111', 'HOST', datetime('now')),
('u-host-roppongi-hills', 'residence@roppongihills.com', '森ビル株式会社', '03-2222-2222', 'HOST', datetime('now')),
('u-host-shinjuku-park', 'info@shinjuku-park.jp', '新宿パーク管理株式会社', '03-3333-3333', 'HOST', datetime('now')),
('u-host-shinagawa-prince', 'info@shinagawa-prince.jp', 'プリンスホテル株式会社', '03-4444-4444', 'HOST', datetime('now')),
('u-host-ikebukuro-sunshine', 'info@sunshinecity.jp', 'サンシャインシティ株式会社', '03-5555-5555', 'HOST', datetime('now'));

-- =====================================================
-- 4. HOGUSYユーザー（CARE CUBE施設用）
-- =====================================================

INSERT OR IGNORE INTO users (id, email, name, phone, role, created_at) VALUES
('u-hogusy-cube', 'cube@hogusy.com', 'HOGUSY株式会社', '03-9999-9999', 'HOST', datetime('now'));

-- =====================================================
-- 5. 施設（5箇所の施設ホスト + 53箇所のCARE CUBE）
-- 注意: 本番環境のsitesテーブルは area, lat, lng を使用
-- =====================================================

-- 施設ホスト（5箇所）
INSERT INTO sites (id, name, type, address, area, lat, lng, host_id, created_at) VALUES
('host-grand-tokyo', 'ホテルグランド東京', 'HOTEL', '東京都千代田区丸の内1-9-1', 'TOKYO_STATION', 35.6812, 139.7671, 'u-host-grand-tokyo', datetime('now')),
('host-roppongi-hills', '六本木ヒルズレジデンス', 'HOME', '東京都港区六本木6-10-1', 'ROPPONGI', 35.6604, 139.7292, 'u-host-roppongi-hills', datetime('now')),
('host-shinjuku-park', '新宿パークタワー', 'OFFICE', '東京都新宿区西新宿3-7-1', 'SHINJUKU', 35.6859, 139.6917, 'u-host-shinjuku-park', datetime('now')),
('host-shinagawa-prince', '品川プリンスホテル', 'HOTEL', '東京都港区高輪4-10-30', 'SHINAGAWA', 35.6284, 139.7387, 'u-host-shinagawa-prince', datetime('now')),
('host-ikebukuro-sunshine', '池袋サンシャインシティ', 'OTHER', '東京都豊島区東池袋3-1-1', 'IKEBUKURO', 35.7295, 139.7187, 'u-host-ikebukuro-sunshine', datetime('now'));

-- 東京駅エリア CARE CUBE（5箇所）
INSERT INTO sites (id, name, type, address, area, lat, lng, host_id, created_at) VALUES
('cube-tokyo-001', 'CARE CUBE 東京駅丸の内', 'OTHER', '東京都千代田区丸の内1-1-3', 'TOKYO_STATION', 35.6812, 139.7671, 'u-hogusy-cube', datetime('now')),
('cube-tokyo-002', 'CARE CUBE 東京駅八重洲', 'OTHER', '東京都中央区八重洲1-5-3', 'TOKYO_STATION', 35.6809, 139.7702, 'u-hogusy-cube', datetime('now')),
('cube-tokyo-003', 'CARE CUBE 東京駅日本橋', 'OTHER', '東京都中央区日本橋1-2-5', 'TOKYO_STATION', 35.6823, 139.7745, 'u-hogusy-cube', datetime('now')),
('cube-tokyo-004', 'CARE CUBE 東京駅大手町', 'OTHER', '東京都千代田区大手町1-1-1', 'TOKYO_STATION', 35.6862, 139.7648, 'u-hogusy-cube', datetime('now')),
('cube-tokyo-005', 'CARE CUBE 東京駅京橋', 'OTHER', '東京都中央区京橋1-1-1', 'TOKYO_STATION', 35.6761, 139.7701, 'u-hogusy-cube', datetime('now'));

-- 新宿駅エリア CARE CUBE（7箇所）
INSERT INTO sites (id, name, type, address, area, lat, lng, host_id, created_at) VALUES
('cube-shinjuku-001', 'CARE CUBE 新宿駅西口', 'OTHER', '東京都新宿区西新宿1-1-3', 'SHINJUKU', 35.6896, 139.6917, 'u-hogusy-cube', datetime('now')),
('cube-shinjuku-002', 'CARE CUBE 新宿駅東口', 'OTHER', '東京都新宿区新宿3-38-1', 'SHINJUKU', 35.6907, 139.7006, 'u-hogusy-cube', datetime('now')),
('cube-shinjuku-003', 'CARE CUBE 新宿駅南口', 'OTHER', '東京都渋谷区代々木2-1-1', 'SHINJUKU', 35.6845, 139.6995, 'u-hogusy-cube', datetime('now')),
('cube-shinjuku-004', 'CARE CUBE 新宿三丁目', 'OTHER', '東京都新宿区新宿3-1-13', 'SHINJUKU', 35.6910, 139.7065, 'u-hogusy-cube', datetime('now')),
('cube-shinjuku-005', 'CARE CUBE 新宿御苑前', 'OTHER', '東京都新宿区新宿1-1-1', 'SHINJUKU', 35.6880, 139.7102, 'u-hogusy-cube', datetime('now')),
('cube-shinjuku-006', 'CARE CUBE 新宿歌舞伎町', 'OTHER', '東京都新宿区歌舞伎町1-1-1', 'SHINJUKU', 35.6948, 139.7021, 'u-hogusy-cube', datetime('now')),
('cube-shinjuku-007', 'CARE CUBE 新宿センタービル', 'OTHER', '東京都新宿区西新宿1-25-1', 'SHINJUKU', 35.6911, 139.6929, 'u-hogusy-cube', datetime('now'));

-- 赤坂エリア CARE CUBE（3箇所）
INSERT INTO sites (id, name, type, address, area, lat, lng, host_id, created_at) VALUES
('cube-akasaka-001', 'CARE CUBE 赤坂見附', 'OTHER', '東京都港区赤坂3-1-1', 'AKASAKA', 35.6766, 139.7372, 'u-hogusy-cube', datetime('now')),
('cube-akasaka-002', 'CARE CUBE 赤坂サカス', 'OTHER', '東京都港区赤坂5-3-1', 'AKASAKA', 35.6729, 139.7381, 'u-hogusy-cube', datetime('now')),
('cube-akasaka-003', 'CARE CUBE 赤坂Bizタワー', 'OTHER', '東京都港区赤坂1-12-32', 'AKASAKA', 35.6742, 139.7415, 'u-hogusy-cube', datetime('now'));

-- 品川駅エリア CARE CUBE（5箇所）
INSERT INTO sites (id, name, type, address, area, lat, lng, host_id, created_at) VALUES
('cube-shinagawa-001', 'CARE CUBE 品川駅高輪口', 'OTHER', '東京都港区高輪3-13-1', 'SHINAGAWA', 35.6284, 139.7387, 'u-hogusy-cube', datetime('now')),
('cube-shinagawa-002', 'CARE CUBE 品川駅港南口', 'OTHER', '東京都港区港南2-16-1', 'SHINAGAWA', 35.6253, 139.7409, 'u-hogusy-cube', datetime('now')),
('cube-shinagawa-003', 'CARE CUBE 品川インターシティ', 'OTHER', '東京都港区港南2-15-2', 'SHINAGAWA', 35.6246, 139.7428, 'u-hogusy-cube', datetime('now')),
('cube-shinagawa-004', 'CARE CUBE 品川シーサイド', 'OTHER', '東京都品川区東品川4-12-4', 'SHINAGAWA', 35.6092, 139.7462, 'u-hogusy-cube', datetime('now')),
('cube-shinagawa-005', 'CARE CUBE 品川グランドセントラル', 'OTHER', '東京都港区港南2-16-4', 'SHINAGAWA', 35.6259, 139.7419, 'u-hogusy-cube', datetime('now'));

-- 新橋駅エリア CARE CUBE（5箇所）
INSERT INTO sites (id, name, type, address, area, lat, lng, host_id, created_at) VALUES
('cube-shimbashi-001', 'CARE CUBE 新橋駅烏森口', 'OTHER', '東京都港区新橋2-16-1', 'SHIMBASHI', 35.6659, 139.7576, 'u-hogusy-cube', datetime('now')),
('cube-shimbashi-002', 'CARE CUBE 新橋駅日比谷口', 'OTHER', '東京都港区新橋1-18-1', 'SHIMBASHI', 35.6678, 139.7587, 'u-hogusy-cube', datetime('now')),
('cube-shimbashi-003', 'CARE CUBE 新橋汐留', 'OTHER', '東京都港区東新橋1-5-2', 'SHIMBASHI', 35.6654, 139.7602, 'u-hogusy-cube', datetime('now')),
('cube-shimbashi-004', 'CARE CUBE 内幸町', 'OTHER', '東京都千代田区内幸町1-1-1', 'SHIMBASHI', 35.6717, 139.7553, 'u-hogusy-cube', datetime('now')),
('cube-shimbashi-005', 'CARE CUBE 虎ノ門', 'OTHER', '東京都港区虎ノ門1-1-1', 'SHIMBASHI', 35.6686, 139.7508, 'u-hogusy-cube', datetime('now'));

-- 池袋駅エリア CARE CUBE（5箇所）
INSERT INTO sites (id, name, type, address, area, lat, lng, host_id, created_at) VALUES
('cube-ikebukuro-001', 'CARE CUBE 池袋駅東口', 'OTHER', '東京都豊島区南池袋1-28-1', 'IKEBUKURO', 35.7295, 139.7106, 'u-hogusy-cube', datetime('now')),
('cube-ikebukuro-002', 'CARE CUBE 池袋駅西口', 'OTHER', '東京都豊島区西池袋1-1-25', 'IKEBUKURO', 35.7311, 139.7065, 'u-hogusy-cube', datetime('now')),
('cube-ikebukuro-003', 'CARE CUBE 池袋サンシャイン60', 'OTHER', '東京都豊島区東池袋3-1-1', 'IKEBUKURO', 35.7295, 139.7187, 'u-hogusy-cube', datetime('now')),
('cube-ikebukuro-004', 'CARE CUBE 池袋メトロポリタンプラザ', 'OTHER', '東京都豊島区西池袋1-11-1', 'IKEBUKURO', 35.7308, 139.7088, 'u-hogusy-cube', datetime('now')),
('cube-ikebukuro-005', 'CARE CUBE 池袋パルコ', 'OTHER', '東京都豊島区南池袋1-28-2', 'IKEBUKURO', 35.7287, 139.7115, 'u-hogusy-cube', datetime('now'));

-- 東京23区 CARE CUBE（各区1箇所、計23箇所）
INSERT INTO sites (id, name, type, address, area, lat, lng, host_id, created_at) VALUES
('cube-chiyoda-001', 'CARE CUBE 神田', 'OTHER', '東京都千代田区神田駿河台2-1-1', 'CHIYODA', 35.6993, 139.7669, 'u-hogusy-cube', datetime('now')),
('cube-chuo-001', 'CARE CUBE 銀座', 'OTHER', '東京都中央区銀座4-1-1', 'CHUO', 35.6719, 139.7645, 'u-hogusy-cube', datetime('now')),
('cube-minato-001', 'CARE CUBE 青山', 'OTHER', '東京都港区南青山3-1-1', 'MINATO', 35.6657, 139.7188, 'u-hogusy-cube', datetime('now')),
('cube-shinjuku-yotsuya', 'CARE CUBE 四谷', 'OTHER', '東京都新宿区四谷1-1-1', 'SHINJUKU', 35.6866, 139.7298, 'u-hogusy-cube', datetime('now')),
('cube-bunkyo-001', 'CARE CUBE 後楽園', 'OTHER', '東京都文京区後楽1-3-61', 'BUNKYO', 35.7056, 139.7517, 'u-hogusy-cube', datetime('now')),
('cube-taito-001', 'CARE CUBE 上野', 'OTHER', '東京都台東区上野7-1-1', 'TAITO', 35.7141, 139.7774, 'u-hogusy-cube', datetime('now')),
('cube-sumida-001', 'CARE CUBE 錦糸町', 'OTHER', '東京都墨田区江東橋3-14-5', 'SUMIDA', 35.6970, 139.8137, 'u-hogusy-cube', datetime('now')),
('cube-koto-001', 'CARE CUBE 豊洲', 'OTHER', '東京都江東区豊洲2-2-1', 'KOTO', 35.6550, 139.7964, 'u-hogusy-cube', datetime('now')),
('cube-shinagawa-togoshi', 'CARE CUBE 戸越銀座', 'OTHER', '東京都品川区戸越1-15-16', 'SHINAGAWA', 35.6145, 139.7156, 'u-hogusy-cube', datetime('now')),
('cube-meguro-001', 'CARE CUBE 中目黒', 'OTHER', '東京都目黒区上目黒1-26-1', 'MEGURO', 35.6440, 139.6984, 'u-hogusy-cube', datetime('now')),
('cube-ota-001', 'CARE CUBE 蒲田', 'OTHER', '東京都大田区蒲田5-13-1', 'OTA', 35.5614, 139.7154, 'u-hogusy-cube', datetime('now')),
('cube-setagaya-001', 'CARE CUBE 三軒茶屋', 'OTHER', '東京都世田谷区太子堂4-1-1', 'SETAGAYA', 35.6432, 139.6695, 'u-hogusy-cube', datetime('now')),
('cube-shibuya-001', 'CARE CUBE 渋谷駅前', 'OTHER', '東京都渋谷区道玄坂1-1-1', 'SHIBUYA', 35.6580, 139.7016, 'u-hogusy-cube', datetime('now')),
('cube-nakano-001', 'CARE CUBE 中野', 'OTHER', '東京都中野区中野5-52-15', 'NAKANO', 35.7056, 139.6649, 'u-hogusy-cube', datetime('now')),
('cube-suginami-001', 'CARE CUBE 荻窪', 'OTHER', '東京都杉並区上荻1-7-1', 'SUGINAMI', 35.7048, 139.6203, 'u-hogusy-cube', datetime('now')),
('cube-toshima-otsuka', 'CARE CUBE 大塚', 'OTHER', '東京都豊島区南大塚3-33-1', 'TOSHIMA', 35.7312, 139.7284, 'u-hogusy-cube', datetime('now')),
('cube-kita-001', 'CARE CUBE 赤羽', 'OTHER', '東京都北区赤羽1-1-1', 'KITA', 35.7772, 139.7209, 'u-hogusy-cube', datetime('now')),
('cube-arakawa-001', 'CARE CUBE 日暮里', 'OTHER', '東京都荒川区西日暮里2-19-1', 'ARAKAWA', 35.7318, 139.7668, 'u-hogusy-cube', datetime('now')),
('cube-itabashi-001', 'CARE CUBE 板橋', 'OTHER', '東京都板橋区板橋1-1-1', 'ITABASHI', 35.7452, 139.7125, 'u-hogusy-cube', datetime('now')),
('cube-nerima-001', 'CARE CUBE 練馬', 'OTHER', '東京都練馬区練馬1-17-1', 'NERIMA', 35.7374, 139.6527, 'u-hogusy-cube', datetime('now')),
('cube-adachi-001', 'CARE CUBE 北千住', 'OTHER', '東京都足立区千住2-62', 'ADACHI', 35.7489, 139.8048, 'u-hogusy-cube', datetime('now')),
('cube-katsushika-001', 'CARE CUBE 亀有', 'OTHER', '東京都葛飾区亀有3-26-1', 'KATSUSHIKA', 35.7615, 139.8489, 'u-hogusy-cube', datetime('now')),
('cube-edogawa-001', 'CARE CUBE 葛西', 'OTHER', '東京都江戸川区中葛西3-37-1', 'EDOGAWA', 35.6645, 139.8696, 'u-hogusy-cube', datetime('now'));

-- =====================================================
-- 完了統計:
-- - 事務所オーナー: 3名
-- - セラピスト事務所: 3箇所（HOGUSY本部、六本木、新宿）
-- - 施設ホストユーザー: 6名（5施設 + HOGUSY CUBE）
-- - 施設ホスト: 5箇所
-- - CARE CUBE: 53箇所
-- - 合計施設: 58箇所
-- =====================================================
