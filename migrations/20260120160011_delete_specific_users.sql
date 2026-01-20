-- ユーザー削除マイグレーション
-- 外部キー制約に従った正しい順序で削除

-- 1. therapist_edit_logs から削除（therapist_profilesを参照）
DELETE FROM therapist_edit_logs 
WHERE therapist_id IN (
  SELECT tp.id FROM therapist_profiles tp
  INNER JOIN users u ON tp.user_id = u.id
  WHERE u.email IN (
    'iwama@inre.co.jp',
    'iwama@climedis.co.jp', 
    'iwama@ichigaya-hi.com',
    'keiri@inre.co.jp'
  )
);

-- 2. therapist_profiles から削除（usersを参照）
DELETE FROM therapist_profiles 
WHERE user_id IN (
  SELECT id FROM users WHERE email IN (
    'iwama@inre.co.jp',
    'iwama@climedis.co.jp',
    'iwama@ichigaya-hi.com',
    'keiri@inre.co.jp'
  )
);

-- 3. email_verifications から削除
DELETE FROM email_verifications 
WHERE user_id IN (
  SELECT id FROM users WHERE email IN (
    'iwama@inre.co.jp',
    'iwama@climedis.co.jp',
    'iwama@ichigaya-hi.com',
    'keiri@inre.co.jp'
  )
);

-- 4. social_accounts から削除
DELETE FROM social_accounts 
WHERE user_id IN (
  SELECT id FROM users WHERE email IN (
    'iwama@inre.co.jp',
    'iwama@climedis.co.jp',
    'iwama@ichigaya-hi.com',
    'keiri@inre.co.jp'
  )
);

-- 5. bookings から削除
DELETE FROM bookings 
WHERE user_id IN (
  SELECT id FROM users WHERE email IN (
    'iwama@inre.co.jp',
    'iwama@climedis.co.jp',
    'iwama@ichigaya-hi.com',
    'keiri@inre.co.jp'
  )
);

-- 6. 最後に users から削除
DELETE FROM users 
WHERE email IN (
  'iwama@inre.co.jp',
  'iwama@climedis.co.jp',
  'iwama@ichigaya-hi.com',
  'keiri@inre.co.jp'
);
