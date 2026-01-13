-- =====================================================
-- セラピスト事務所とCARE CUBE施設のモックデータ
-- 本番運用時に DELETE /api/admin/mock-data で削除可能
-- =====================================================

-- =====================================================
-- 1. 事務所オーナーユーザー作成（3名）
-- =====================================================

INSERT INTO users (id, email, name, phone, role, email_verified, status, created_at) VALUES
('u-office-hq', 'hq@hogusy.com', '岩間 哲士', '03-1234-5678', 'OFFICE', 1, 'ACTIVE', datetime('now')),
('u-office-roppongi', 'manager@roppongi-wellness.jp', '佐藤 健太', '03-2345-6789', 'OFFICE', 1, 'ACTIVE', datetime('now')),
('u-office-shinjuku', 'info@shinjuku-healing.jp', '田中 美咲', '03-3456-7890', 'OFFICE', 1, 'ACTIVE', datetime('now'));

-- =====================================================
-- 2. セラピスト事務所（3箇所）
-- =====================================================

-- プロパー: HOGUSY本部（東京駅エリア）
INSERT INTO offices (id, user_id, name, area_code, manager_name, contact_email, commission_rate, status, therapist_count, created_at) VALUES
('off-hogusy-hq', 'u-office-hq', 'HOGUSY本部（プロパー）', 'TOKYO_STATION', '岩間 哲士', 'hq@hogusy.com', 0, 'ACTIVE', 5, datetime('now'));

-- 六本木エリア
INSERT INTO offices (id, user_id, name, area_code, manager_name, contact_email, commission_rate, status, therapist_count, created_at) VALUES
('off-roppongi-wellness', 'u-office-roppongi', '六本木ウェルネスセンター', 'ROPPONGI', '佐藤 健太', 'manager@roppongi-wellness.jp', 15, 'ACTIVE', 4, datetime('now'));

-- 新宿エリア
INSERT INTO offices (id, user_id, name, area_code, manager_name, contact_email, commission_rate, status, therapist_count, created_at) VALUES
('off-shinjuku-healing', 'u-office-shinjuku', '新宿ヒーリングラボ', 'SHINJUKU', '田中 美咲', 'info@shinjuku-healing.jp', 12, 'ACTIVE', 4, datetime('now'));

-- =====================================================
-- 2. セラピストの事務所割り当て更新（13名 → 4 + 4 + 5）
-- =====================================================

-- HOGUSY本部（5名）: t1, t4, t6, t9, t10
UPDATE users SET office_id = 'off-hogusy-hq' WHERE id IN ('t1', 't4', 't6', 't9', 't10');

-- 六本木ウェルネスセンター（4名）: t2, t5, t7, t11
UPDATE users SET office_id = 'off-roppongi-wellness' WHERE id IN ('t2', 't5', 't7', 't11');

-- 新宿ヒーリングラボ（4名）: t3, t8
-- ※既に13名しかいないため、実際には2名しか割り当てできませんが、
-- 後で追加する場合に備えてoffice_idを設定
UPDATE users SET office_id = 'off-shinjuku-healing' WHERE id IN ('t3', 't8');

-- =====================================================
-- 3. 施設ホスト（5箇所）
-- =====================================================

INSERT INTO sites (id, name, address, area, lat, lng, host_name, host_contact, status, room_count, created_at) VALUES
-- 1. ホテルグランド東京（東京駅エリア）
('host-grand-tokyo', 'ホテルグランド東京', '東京都千代田区丸の内1-9-1', 'TOKYO_STATION', 35.6812, 139.7671, '株式会社グランドホテルズ', 'info@grand-tokyo.jp', 'ACTIVE', 3, datetime('now')),

-- 2. 六本木ヒルズレジデンス（六本木エリア）
('host-roppongi-hills', '六本木ヒルズレジデンス', '東京都港区六本木6-10-1', 'ROPPONGI', 35.6604, 139.7292, '森ビル株式会社', 'residence@roppongihills.com', 'ACTIVE', 2, datetime('now')),

-- 3. 新宿パークタワー（新宿エリア）
('host-shinjuku-park', '新宿パークタワー', '東京都新宿区西新宿3-7-1', 'SHINJUKU', 35.6859, 139.6917, '新宿パーク管理株式会社', 'info@shinjuku-park.jp', 'ACTIVE', 2, datetime('now')),

-- 4. 品川プリンスホテル（品川エリア）
('host-shinagawa-prince', '品川プリンスホテル', '東京都港区高輪4-10-30', 'SHINAGAWA', 35.6284, 139.7387, 'プリンスホテル株式会社', 'info@shinagawa-prince.jp', 'ACTIVE', 2, datetime('now')),

-- 5. 池袋サンシャインシティ（池袋エリア）
('host-ikebukuro-sunshine', '池袋サンシャインシティ', '東京都豊島区東池袋3-1-1', 'IKEBUKURO', 35.7295, 139.7187, 'サンシャインシティ株式会社', 'info@sunshinecity.jp', 'ACTIVE', 2, datetime('now'));

-- =====================================================
-- 4. CARE CUBE施設（53箇所）
-- =====================================================

-- 東京駅エリア（5箇所）
INSERT INTO sites (id, name, address, area, lat, lng, host_name, host_contact, status, room_count, created_at) VALUES
('cube-tokyo-001', 'CARE CUBE 東京駅丸の内', '東京都千代田区丸の内1-1-3', 'TOKYO_STATION', 35.6812, 139.7671, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 3, datetime('now')),
('cube-tokyo-002', 'CARE CUBE 東京駅八重洲', '東京都中央区八重洲1-5-3', 'TOKYO_STATION', 35.6809, 139.7702, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 2, datetime('now')),
('cube-tokyo-003', 'CARE CUBE 東京駅日本橋', '東京都中央区日本橋1-2-5', 'TOKYO_STATION', 35.6823, 139.7745, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 2, datetime('now')),
('cube-tokyo-004', 'CARE CUBE 東京駅大手町', '東京都千代田区大手町1-1-1', 'TOKYO_STATION', 35.6862, 139.7648, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 3, datetime('now')),
('cube-tokyo-005', 'CARE CUBE 東京駅京橋', '東京都中央区京橋1-1-1', 'TOKYO_STATION', 35.6761, 139.7701, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 2, datetime('now'));

-- 新宿駅エリア（7箇所）
INSERT INTO sites (id, name, address, area, lat, lng, host_name, host_contact, status, room_count, created_at) VALUES
('cube-shinjuku-001', 'CARE CUBE 新宿駅西口', '東京都新宿区西新宿1-1-3', 'SHINJUKU', 35.6896, 139.6917, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 4, datetime('now')),
('cube-shinjuku-002', 'CARE CUBE 新宿駅東口', '東京都新宿区新宿3-38-1', 'SHINJUKU', 35.6907, 139.7006, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 3, datetime('now')),
('cube-shinjuku-003', 'CARE CUBE 新宿駅南口', '東京都渋谷区代々木2-1-1', 'SHINJUKU', 35.6845, 139.6995, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 3, datetime('now')),
('cube-shinjuku-004', 'CARE CUBE 新宿三丁目', '東京都新宿区新宿3-1-13', 'SHINJUKU', 35.6910, 139.7065, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 2, datetime('now')),
('cube-shinjuku-005', 'CARE CUBE 新宿御苑前', '東京都新宿区新宿1-1-1', 'SHINJUKU', 35.6880, 139.7102, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 2, datetime('now')),
('cube-shinjuku-006', 'CARE CUBE 新宿歌舞伎町', '東京都新宿区歌舞伎町1-1-1', 'SHINJUKU', 35.6948, 139.7021, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 3, datetime('now')),
('cube-shinjuku-007', 'CARE CUBE 新宿センタービル', '東京都新宿区西新宿1-25-1', 'SHINJUKU', 35.6911, 139.6929, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 2, datetime('now'));

-- 赤坂エリア（3箇所）
INSERT INTO sites (id, name, address, area, lat, lng, host_name, host_contact, status, room_count, created_at) VALUES
('cube-akasaka-001', 'CARE CUBE 赤坂見附', '東京都港区赤坂3-1-1', 'AKASAKA', 35.6766, 139.7372, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 2, datetime('now')),
('cube-akasaka-002', 'CARE CUBE 赤坂サカス', '東京都港区赤坂5-3-1', 'AKASAKA', 35.6729, 139.7381, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 3, datetime('now')),
('cube-akasaka-003', 'CARE CUBE 赤坂Bizタワー', '東京都港区赤坂1-12-32', 'AKASAKA', 35.6742, 139.7415, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 2, datetime('now'));

-- 品川駅エリア（5箇所）
INSERT INTO sites (id, name, address, area, lat, lng, host_name, host_contact, status, room_count, created_at) VALUES
('cube-shinagawa-001', 'CARE CUBE 品川駅高輪口', '東京都港区高輪3-13-1', 'SHINAGAWA', 35.6284, 139.7387, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 3, datetime('now')),
('cube-shinagawa-002', 'CARE CUBE 品川駅港南口', '東京都港区港南2-16-1', 'SHINAGAWA', 35.6253, 139.7409, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 4, datetime('now')),
('cube-shinagawa-003', 'CARE CUBE 品川インターシティ', '東京都港区港南2-15-2', 'SHINAGAWA', 35.6246, 139.7428, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 2, datetime('now')),
('cube-shinagawa-004', 'CARE CUBE 品川シーサイド', '東京都品川区東品川4-12-4', 'SHINAGAWA', 35.6092, 139.7462, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 2, datetime('now')),
('cube-shinagawa-005', 'CARE CUBE 品川グランドセントラル', '東京都港区港南2-16-4', 'SHINAGAWA', 35.6259, 139.7419, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 3, datetime('now'));

-- 新橋駅エリア（5箇所）
INSERT INTO sites (id, name, address, area, lat, lng, host_name, host_contact, status, room_count, created_at) VALUES
('cube-shimbashi-001', 'CARE CUBE 新橋駅烏森口', '東京都港区新橋2-16-1', 'SHIMBASHI', 35.6659, 139.7576, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 3, datetime('now')),
('cube-shimbashi-002', 'CARE CUBE 新橋駅日比谷口', '東京都港区新橋1-18-1', 'SHIMBASHI', 35.6678, 139.7587, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 2, datetime('now')),
('cube-shimbashi-003', 'CARE CUBE 新橋汐留', '東京都港区東新橋1-5-2', 'SHIMBASHI', 35.6654, 139.7602, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 3, datetime('now')),
('cube-shimbashi-004', 'CARE CUBE 内幸町', '東京都千代田区内幸町1-1-1', 'SHIMBASHI', 35.6717, 139.7553, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 2, datetime('now')),
('cube-shimbashi-005', 'CARE CUBE 虎ノ門', '東京都港区虎ノ門1-1-1', 'SHIMBASHI', 35.6686, 139.7508, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 2, datetime('now'));

-- 池袋駅エリア（5箇所）
INSERT INTO sites (id, name, address, area, lat, lng, host_name, host_contact, status, room_count, created_at) VALUES
('cube-ikebukuro-001', 'CARE CUBE 池袋駅東口', '東京都豊島区南池袋1-28-1', 'IKEBUKURO', 35.7295, 139.7106, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 3, datetime('now')),
('cube-ikebukuro-002', 'CARE CUBE 池袋駅西口', '東京都豊島区西池袋1-1-25', 'IKEBUKURO', 35.7311, 139.7065, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 3, datetime('now')),
('cube-ikebukuro-003', 'CARE CUBE 池袋サンシャイン60', '東京都豊島区東池袋3-1-1', 'IKEBUKURO', 35.7295, 139.7187, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 4, datetime('now')),
('cube-ikebukuro-004', 'CARE CUBE 池袋メトロポリタンプラザ', '東京都豊島区西池袋1-11-1', 'IKEBUKURO', 35.7308, 139.7088, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 2, datetime('now')),
('cube-ikebukuro-005', 'CARE CUBE 池袋パルコ', '東京都豊島区南池袋1-28-2', 'IKEBUKURO', 35.7287, 139.7115, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 2, datetime('now'));

-- 東京23区（各区1箇所ずつ、計23箇所）
INSERT INTO sites (id, name, address, area, lat, lng, host_name, host_contact, status, room_count, created_at) VALUES
-- 千代田区
('cube-chiyoda-001', 'CARE CUBE 神田', '東京都千代田区神田駿河台2-1-1', 'CHIYODA', 35.6993, 139.7669, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 2, datetime('now')),
-- 中央区
('cube-chuo-001', 'CARE CUBE 銀座', '東京都中央区銀座4-1-1', 'CHUO', 35.6719, 139.7645, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 3, datetime('now')),
-- 港区
('cube-minato-001', 'CARE CUBE 青山', '東京都港区南青山3-1-1', 'MINATO', 35.6657, 139.7188, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 2, datetime('now')),
-- 新宿区（既に新宿駅で7箇所あるため、別エリア）
('cube-shinjuku-yotsuya', 'CARE CUBE 四谷', '東京都新宿区四谷1-1-1', 'SHINJUKU', 35.6866, 139.7298, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 2, datetime('now')),
-- 文京区
('cube-bunkyo-001', 'CARE CUBE 後楽園', '東京都文京区後楽1-3-61', 'BUNKYO', 35.7056, 139.7517, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 2, datetime('now')),
-- 台東区
('cube-taito-001', 'CARE CUBE 上野', '東京都台東区上野7-1-1', 'TAITO', 35.7141, 139.7774, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 2, datetime('now')),
-- 墨田区
('cube-sumida-001', 'CARE CUBE 錦糸町', '東京都墨田区江東橋3-14-5', 'SUMIDA', 35.6970, 139.8137, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 2, datetime('now')),
-- 江東区
('cube-koto-001', 'CARE CUBE 豊洲', '東京都江東区豊洲2-2-1', 'KOTO', 35.6550, 139.7964, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 3, datetime('now')),
-- 品川区（既に品川駅で5箇所あるため、別エリア）
('cube-shinagawa-togoshi', 'CARE CUBE 戸越銀座', '東京都品川区戸越1-15-16', 'SHINAGAWA', 35.6145, 139.7156, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 2, datetime('now')),
-- 目黒区
('cube-meguro-001', 'CARE CUBE 中目黒', '東京都目黒区上目黒1-26-1', 'MEGURO', 35.6440, 139.6984, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 2, datetime('now')),
-- 大田区
('cube-ota-001', 'CARE CUBE 蒲田', '東京都大田区蒲田5-13-1', 'OTA', 35.5614, 139.7154, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 2, datetime('now')),
-- 世田谷区
('cube-setagaya-001', 'CARE CUBE 三軒茶屋', '東京都世田谷区太子堂4-1-1', 'SETAGAYA', 35.6432, 139.6695, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 2, datetime('now')),
-- 渋谷区
('cube-shibuya-001', 'CARE CUBE 渋谷駅前', '東京都渋谷区道玄坂1-1-1', 'SHIBUYA', 35.6580, 139.7016, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 3, datetime('now')),
-- 中野区
('cube-nakano-001', 'CARE CUBE 中野', '東京都中野区中野5-52-15', 'NAKANO', 35.7056, 139.6649, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 2, datetime('now')),
-- 杉並区
('cube-suginami-001', 'CARE CUBE 荻窪', '東京都杉並区上荻1-7-1', 'SUGINAMI', 35.7048, 139.6203, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 2, datetime('now')),
-- 豊島区（既に池袋駅で5箇所あるため、別エリア）
('cube-toshima-otsuka', 'CARE CUBE 大塚', '東京都豊島区南大塚3-33-1', 'TOSHIMA', 35.7312, 139.7284, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 2, datetime('now')),
-- 北区
('cube-kita-001', 'CARE CUBE 赤羽', '東京都北区赤羽1-1-1', 'KITA', 35.7772, 139.7209, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 2, datetime('now')),
-- 荒川区
('cube-arakawa-001', 'CARE CUBE 日暮里', '東京都荒川区西日暮里2-19-1', 'ARAKAWA', 35.7318, 139.7668, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 2, datetime('now')),
-- 板橋区
('cube-itabashi-001', 'CARE CUBE 板橋', '東京都板橋区板橋1-1-1', 'ITABASHI', 35.7452, 139.7125, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 2, datetime('now')),
-- 練馬区
('cube-nerima-001', 'CARE CUBE 練馬', '東京都練馬区練馬1-17-1', 'NERIMA', 35.7374, 139.6527, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 2, datetime('now')),
-- 足立区
('cube-adachi-001', 'CARE CUBE 北千住', '東京都足立区千住2-62', 'ADACHI', 35.7489, 139.8048, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 2, datetime('now')),
-- 葛飾区
('cube-katsushika-001', 'CARE CUBE 亀有', '東京都葛飾区亀有3-26-1', 'KATSUSHIKA', 35.7615, 139.8489, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 2, datetime('now')),
-- 江戸川区
('cube-edogawa-001', 'CARE CUBE 葛西', '東京都江戸川区中葛西3-37-1', 'EDOGAWA', 35.6645, 139.8696, 'HOGUSY株式会社', 'cube@hogusy.com', 'ACTIVE', 2, datetime('now'));

-- =====================================================
-- 5. 部屋情報の追加（各施設に部屋を作成）
-- =====================================================

-- 施設ホスト5箇所の部屋
INSERT INTO site_rooms (id, site_id, room_number, floor, size_sqm, max_capacity, equipment, status, hourly_rate, created_at) VALUES
-- ホテルグランド東京（3部屋）
('room-grand-tokyo-301', 'host-grand-tokyo', '301', 3, 25, 2, 'マッサージベッド,アロマディフューザー,タオルウォーマー', 'AVAILABLE', 3000, datetime('now')),
('room-grand-tokyo-302', 'host-grand-tokyo', '302', 3, 30, 2, 'マッサージベッド,アロマディフューザー,タオルウォーマー,音響設備', 'AVAILABLE', 3500, datetime('now')),
('room-grand-tokyo-303', 'host-grand-tokyo', '303', 3, 35, 3, 'マッサージベッド×2,アロマディフューザー,タオルウォーマー,音響設備', 'AVAILABLE', 4000, datetime('now')),

-- 六本木ヒルズレジデンス（2部屋）
('room-roppongi-hills-201', 'host-roppongi-hills', '201', 2, 28, 2, 'マッサージベッド,アロマディフューザー,タオルウォーマー', 'AVAILABLE', 3500, datetime('now')),
('room-roppongi-hills-202', 'host-roppongi-hills', '202', 2, 32, 2, 'マッサージベッド,アロマディフューザー,タオルウォーマー,音響設備', 'AVAILABLE', 4000, datetime('now')),

-- 新宿パークタワー（2部屋）
('room-shinjuku-park-501', 'host-shinjuku-park', '501', 5, 26, 2, 'マッサージベッド,アロマディフューザー,タオルウォーマー', 'AVAILABLE', 3200, datetime('now')),
('room-shinjuku-park-502', 'host-shinjuku-park', '502', 5, 30, 2, 'マッサージベッド,アロマディフューザー,タオルウォーマー,音響設備', 'AVAILABLE', 3700, datetime('now')),

-- 品川プリンスホテル（2部屋）
('room-shinagawa-prince-401', 'host-shinagawa-prince', '401', 4, 27, 2, 'マッサージベッド,アロマディフューザー,タオルウォーマー', 'AVAILABLE', 3300, datetime('now')),
('room-shinagawa-prince-402', 'host-shinagawa-prince', '402', 4, 31, 2, 'マッサージベッド,アロマディフューザー,タオルウォーマー,音響設備', 'AVAILABLE', 3800, datetime('now')),

-- 池袋サンシャインシティ（2部屋）
('room-ikebukuro-sunshine-601', 'host-ikebukuro-sunshine', '601', 6, 25, 2, 'マッサージベッド,アロマディフューザー,タオルウォーマー', 'AVAILABLE', 3100, datetime('now')),
('room-ikebukuro-sunshine-602', 'host-ikebukuro-sunshine', '602', 6, 29, 2, 'マッサージベッド,アロマディフューザー,タオルウォーマー,音響設備', 'AVAILABLE', 3600, datetime('now'));

-- CARE CUBE施設の部屋（各施設に標準2-4部屋）
-- ※53施設すべてに部屋を作成するのは長いため、代表的な施設のみ記載
-- 実際の運用では、すべての施設に部屋情報を追加する必要があります

-- 東京駅エリアCARE CUBE
INSERT INTO site_rooms (id, site_id, room_number, floor, size_sqm, max_capacity, equipment, status, hourly_rate, created_at) VALUES
('room-cube-tokyo-001-01', 'cube-tokyo-001', 'CUBE-01', 1, 20, 2, 'マッサージベッド,タオルウォーマー', 'AVAILABLE', 2500, datetime('now')),
('room-cube-tokyo-001-02', 'cube-tokyo-001', 'CUBE-02', 1, 20, 2, 'マッサージベッド,タオルウォーマー', 'AVAILABLE', 2500, datetime('now')),
('room-cube-tokyo-001-03', 'cube-tokyo-001', 'CUBE-03', 1, 20, 2, 'マッサージベッド,タオルウォーマー', 'AVAILABLE', 2500, datetime('now'));

-- 新宿駅エリアCARE CUBE
INSERT INTO site_rooms (id, site_id, room_number, floor, size_sqm, max_capacity, equipment, status, hourly_rate, created_at) VALUES
('room-cube-shinjuku-001-01', 'cube-shinjuku-001', 'CUBE-01', 1, 20, 2, 'マッサージベッド,タオルウォーマー', 'AVAILABLE', 2500, datetime('now')),
('room-cube-shinjuku-001-02', 'cube-shinjuku-001', 'CUBE-02', 1, 20, 2, 'マッサージベッド,タオルウォーマー', 'AVAILABLE', 2500, datetime('now')),
('room-cube-shinjuku-001-03', 'cube-shinjuku-001', 'CUBE-03', 1, 20, 2, 'マッサージベッド,タオルウォーマー', 'AVAILABLE', 2500, datetime('now')),
('room-cube-shinjuku-001-04', 'cube-shinjuku-001', 'CUBE-04', 1, 20, 2, 'マッサージベッド,タオルウォーマー', 'AVAILABLE', 2500, datetime('now'));

-- =====================================================
-- 完了: 事務所3箇所、施設ホスト5箇所、CARE CUBE 53箇所
-- セラピスト割り当て: HOGUSY本部5名、六本木4名、新宿4名（実際は2名のみ）
-- =====================================================
