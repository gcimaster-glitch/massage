-- Add columns for account linking
-- Add user_id and action columns to oauth_states table if they don't exist

-- SQLite doesn't support ADD COLUMN IF NOT EXISTS, so we use a different approach
-- First check if the columns exist, then add them if they don't

-- Add user_id column (for storing user ID during account linking)
ALTER TABLE oauth_states ADD COLUMN user_id TEXT;

-- Add action column (to distinguish between 'login' and 'link' actions)
ALTER TABLE oauth_states ADD COLUMN action TEXT DEFAULT 'login';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_oauth_states_user_id ON oauth_states(user_id);
