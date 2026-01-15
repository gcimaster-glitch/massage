-- Add password_hash column for email/password authentication
ALTER TABLE users ADD COLUMN password_hash TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email_password ON users(email, password_hash);
