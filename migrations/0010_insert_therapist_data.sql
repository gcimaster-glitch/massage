-- 11名のセラピストデータ投入
-- Step 1: users テーブルにユーザーデータを挿入
-- Step 2: therapist_profiles テーブルにセラピストプロフィールを挿入

-- Step 1: Users
INSERT OR IGNORE INTO users (
  id, email, name, role, avatar_url, email_verified, created_at
) VALUES
('therapist-3', 'yamada.kenji@hogusy.com', '山田 健二', 'THERAPIST', '/therapists/therapist-3.jpg', 1, datetime('now')),
('therapist-11', 'takahashi.daichi@hogusy.com', '高橋 大地', 'THERAPIST', '/therapists/therapist-11.jpg', 1, datetime('now')),
('therapist-9', 'ito.yuka@hogusy.com', '伊藤 優香', 'THERAPIST', '/therapists/therapist-9.jpg', 1, datetime('now')),
('therapist-1', 'sato.misaki@hogusy.com', '佐藤 美咲', 'THERAPIST', '/therapists/therapist-1.jpg', 1, datetime('now')),
('therapist-2', 'suzuki.takuya@hogusy.com', '鈴木 拓也', 'THERAPIST', '/therapists/therapist-2.jpg', 1, datetime('now')),
('therapist-4', 'tanaka.haruna@hogusy.com', '田中 春奈', 'THERAPIST', '/therapists/therapist-4.jpg', 1, datetime('now')),
('therapist-5', 'nakamura.kenta@hogusy.com', '中村 健太', 'THERAPIST', '/therapists/therapist-5.jpg', 1, datetime('now')),
('therapist-6', 'kobayashi.mariko@hogusy.com', '小林 真理子', 'THERAPIST', '/therapists/therapist-6.jpg', 1, datetime('now')),
('therapist-7', 'kato.takashi@hogusy.com', '加藤 隆', 'THERAPIST', '/therapists/therapist-7.jpg', 1, datetime('now')),
('therapist-8', 'watanabe.ai@hogusy.com', '渡辺 愛', 'THERAPIST', '/therapists/therapist-8.jpg', 1, datetime('now')),
('therapist-10', 'matsumoto.yuta@hogusy.com', '松本 裕太', 'THERAPIST', '/therapists/therapist-10.jpg', 1, datetime('now'));

-- Step 2: Therapist Profiles
INSERT OR IGNORE INTO therapist_profiles (
  id, user_id, bio, specialties, experience_years, rating, review_count, approved_areas, status, created_at
) VALUES
('profile-3', 'therapist-3', '12年の経験を持つ整体師。深層筋へのアプローチを得意とし、慢性的な肩こり・腰痛の改善に定評があります。', '["整体", "深層筋マッサージ", "姿勢改善"]', 12, 4.9, 456, '["渋谷区", "新宿区", "港区"]', 'APPROVED', datetime('now')),
('profile-11', 'therapist-11', '11年の経験を持つ鍼灸師・柔道整復師。スポーツ障害の治療とリハビリテーションに特化しています。', '["鍼灸", "柔道整復", "スポーツ障害"]', 11, 4.9, 423, '["渋谷区", "新宿区", "港区"]', 'APPROVED', datetime('now')),
('profile-9', 'therapist-9', '9年の経験を持つあん摩マッサージ指圧師。優しい手技とリラクゼーションを重視した施術が特徴です。', '["あん摩", "指圧", "マッサージ"]', 9, 4.9, 378, '["渋谷区", "新宿区", "港区"]', 'APPROVED', datetime('now')),
('profile-1', 'therapist-1', '8年の経験を持つアロマセラピスト。アロマオイルを使用したリンパドレナージュが得意です。', '["アロマセラピー", "リンパドレナージュ", "リラクゼーション"]', 8, 4.8, 342, '["渋谷区", "新宿区", "港区", "世田谷区"]', 'APPROVED', datetime('now')),
('profile-2', 'therapist-2', '10年の経験を持つカイロプラクター。骨格調整と姿勢改善のスペシャリストです。', '["カイロプラクティック", "骨格調整", "姿勢改善"]', 10, 4.8, 398, '["新宿区", "港区", "品川区"]', 'APPROVED', datetime('now')),
('profile-4', 'therapist-4', '7年の経験を持つリフレクソロジスト。足裏からの全身アプローチで体調改善をサポートします。', '["リフレクソロジー", "足つぼ", "全身調整"]', 7, 4.7, 289, '["渋谷区", "新宿区", "世田谷区"]', 'APPROVED', datetime('now')),
('profile-5', 'therapist-5', '9年の経験を持つタイ古式マッサージセラピスト。ストレッチを組み合わせた施術が特徴です。', '["タイ古式マッサージ", "ストレッチ", "筋膜リリース"]', 9, 4.8, 356, '["渋谷区", "港区", "中央区"]', 'APPROVED', datetime('now')),
('profile-6', 'therapist-6', '6年の経験を持つヘッドスパセラピスト。頭部と首のケアで眼精疲労・頭痛改善に効果的です。', '["ヘッドスパ", "ドライヘッドスパ", "眼精疲労ケア"]', 6, 4.7, 267, '["渋谷区", "新宿区", "港区"]', 'APPROVED', datetime('now')),
('profile-7', 'therapist-7', '11年の経験を持つ鍼灸師。東洋医学に基づいた施術で根本的な体質改善を目指します。', '["鍼灸", "東洋医学", "体質改善"]', 11, 4.9, 412, '["新宿区", "港区", "千代田区"]', 'APPROVED', datetime('now')),
('profile-8', 'therapist-8', '5年の経験を持つアーユルヴェーダセラピスト。インドの伝統医学に基づいたオイルマッサージが特徴です。', '["アーユルヴェーダ", "オイルマッサージ", "デトックス"]', 5, 4.6, 198, '["渋谷区", "港区", "世田谷区"]', 'APPROVED', datetime('now')),
('profile-10', 'therapist-10', '8年の経験を持つスポーツトレーナー。アスリートのコンディショニングとパフォーマンス向上をサポートします。', '["スポーツマッサージ", "コンディショニング", "パフォーマンス向上"]', 8, 4.8, 334, '["渋谷区", "新宿区", "港区", "品川区"]', 'APPROVED', datetime('now'));
