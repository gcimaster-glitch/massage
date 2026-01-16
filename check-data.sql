-- 既存のセラピストプロフィールをチェック
SELECT 'Therapist Profiles:' as info;
SELECT id, user_id FROM therapist_profiles LIMIT 10;

-- 既存のマスターコースをチェック
SELECT 'Master Courses:' as info;
SELECT id, name FROM master_courses;

-- 既存のマスターオプションをチェック
SELECT 'Master Options:' as info;
SELECT id, name FROM master_options;
