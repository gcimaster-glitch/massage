-- ============================================
-- パスワードリセットトークン管理テーブル
-- ============================================

-- パスワードリセットトークンテーブル
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL, -- Unix timestamp (milliseconds)
  used_at INTEGER DEFAULT NULL, -- NULL = 未使用, Unix timestamp = 使用済み
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  ip_address TEXT, -- リクエスト元IPアドレス（セキュリティログ用）
  user_agent TEXT, -- ブラウザ情報（セキュリティログ用）
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- インデックス作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- ============================================
-- レート制限管理テーブル
-- ============================================

-- レート制限トラッキングテーブル
CREATE TABLE IF NOT EXISTS rate_limit_tracking (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL, -- IPアドレス、ユーザーID、またはAPI Key
  endpoint TEXT NOT NULL, -- '/api/auth/login', '/api/auth/password-reset', etc.
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start INTEGER NOT NULL, -- レート制限ウィンドウの開始時刻 (Unix timestamp)
  expires_at INTEGER NOT NULL, -- このレコードの有効期限 (Unix timestamp)
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_rate_limit_identifier_endpoint ON rate_limit_tracking(identifier, endpoint);
CREATE INDEX IF NOT EXISTS idx_rate_limit_expires_at ON rate_limit_tracking(expires_at);

-- ============================================
-- セキュリティログテーブル（監査用）
-- ============================================

-- セキュリティイベントログ
CREATE TABLE IF NOT EXISTS security_logs (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL, -- 'login_success', 'login_failed', 'password_reset_request', 'password_reset_success', 'rate_limit_exceeded', etc.
  user_id TEXT, -- NULL許可（ログイン失敗など、ユーザー特定前のイベント）
  email TEXT,
  ip_address TEXT,
  user_agent TEXT,
  details TEXT, -- JSON形式で詳細情報を保存
  severity TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'error', 'critical'
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_email ON security_logs(email);
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON security_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_security_logs_severity ON security_logs(severity);
