-- KYC書類管理テーブル
CREATE TABLE IF NOT EXISTS kyc_documents (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  id_type TEXT NOT NULL,
  id_number TEXT,
  r2_key TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  reviewed_by TEXT,
  reviewed_at INTEGER,
  rejection_reason TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_kyc_docs_user_id ON kyc_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_docs_status ON kyc_documents(status);
CREATE INDEX IF NOT EXISTS idx_kyc_docs_created_at ON kyc_documents(created_at);
