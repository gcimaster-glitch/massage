-- Migration: Add password_hash column to users table
-- Created: 2026-01-20
-- Description: Add password authentication support for email/password login

-- Add password_hash column to users table
ALTER TABLE users ADD COLUMN password_hash TEXT;

-- Create index for faster email lookups during login
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index for role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
