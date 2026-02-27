-- ============================================
-- Migration 0038: セキュリティ強化
-- Created: 2026-02-27
-- Description: インデックス追加、セッション管理改善、不要カラム整理
-- ============================================

-- ============================================
-- 認証セッション管理の強化
-- ============================================

-- auth_sessions テーブルにインデックスを追加（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_token ON auth_sessions(token);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires_at ON auth_sessions(expires_at);

-- ============================================
-- ユーザーテーブルのセキュリティ強化
-- ============================================

-- ログイン失敗カウント（ブルートフォース対策）
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_failed_count INTEGER DEFAULT 0;
-- アカウントロック時刻
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until INTEGER DEFAULT NULL;
-- 最終ログイン時刻
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at INTEGER DEFAULT NULL;
-- 最終ログインIP
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_ip TEXT DEFAULT NULL;

-- ============================================
-- OAuth states テーブルのインデックス
-- ============================================
CREATE INDEX IF NOT EXISTS idx_oauth_states_state ON oauth_states(state);
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires_at ON oauth_states(expires_at);

-- ============================================
-- メール認証テーブルのインデックス
-- ============================================
CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(token);
CREATE INDEX IF NOT EXISTS idx_email_verifications_user_id ON email_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at ON email_verifications(expires_at);

-- ============================================
-- 予約テーブルのインデックス（パフォーマンス向上）
-- ============================================
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_therapist_id ON bookings(therapist_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);

-- ============================================
-- セラピストプロフィールのインデックス
-- ============================================
CREATE INDEX IF NOT EXISTS idx_therapist_profiles_user_id ON therapist_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_therapist_profiles_status ON therapist_profiles(status);
CREATE INDEX IF NOT EXISTS idx_therapist_profiles_office_id ON therapist_profiles(office_id);
