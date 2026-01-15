-- Add archive support for users table
-- Add is_archived column for soft delete functionality

ALTER TABLE users ADD COLUMN is_archived INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN archived_at DATETIME;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_is_archived ON users(is_archived);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
