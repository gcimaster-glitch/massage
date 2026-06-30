-- Migration: Fix OAuth schema issues
-- 1. Add redirect_uri column to oauth_states (code uses redirect_uri but table only has redirect_path)
-- 2. Add missing columns to social_accounts (provider_email, provider_name, provider_avatar_url)
-- 3. Add email_verified_at column to users table
-- 4. Remove CHECK constraint on social_accounts.provider to allow uppercase values
--    (SQLite doesn't support DROP CONSTRAINT, so we recreate the table)

-- Add redirect_uri to oauth_states
ALTER TABLE oauth_states ADD COLUMN redirect_uri TEXT;

-- Copy existing redirect_path data to redirect_uri
UPDATE oauth_states SET redirect_uri = redirect_path WHERE redirect_uri IS NULL AND redirect_path IS NOT NULL;

-- Add missing columns to social_accounts
ALTER TABLE social_accounts ADD COLUMN provider_email TEXT;
ALTER TABLE social_accounts ADD COLUMN provider_name TEXT;
ALTER TABLE social_accounts ADD COLUMN provider_avatar_url TEXT;

-- Add email_verified_at to users
ALTER TABLE users ADD COLUMN email_verified_at DATETIME;
