-- 総管理者アカウント作成（ハッシュ化されたパスワードは実際には bcrypt を使用する必要があります）
-- テスト用: メール admin@hogusy.com / パスワード Admin@2026!

-- すでに admin@hogusy.com が存在する場合は削除
DELETE FROM users WHERE email = 'admin@hogusy.com';

-- 総管理者アカウントを作成
INSERT INTO users (
  id, email, name, role, email_verified, phone, created_at
) VALUES (
  'root-admin-001',
  'admin@hogusy.com',
  '総管理者 (Root Admin)',
  'ADMIN',
  1,
  '03-0000-0000',
  datetime('now')
);

SELECT '総管理者アカウントが作成されました' as status;
SELECT 'メール: admin@hogusy.com' as login_info;
SELECT 'パスワード: Admin@2026!' as password_info;
SELECT '※ 初回ログイン後、パスワードを必ず変更してください' as note;
