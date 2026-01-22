-- 報酬管理テーブル
CREATE TABLE IF NOT EXISTS therapist_earnings (
  id TEXT PRIMARY KEY,
  therapist_profile_id TEXT NOT NULL,
  booking_id TEXT NOT NULL,
  office_id TEXT,
  
  -- 金額詳細
  booking_price INTEGER NOT NULL, -- 予約総額
  therapist_amount INTEGER NOT NULL, -- セラピスト受取額
  office_amount INTEGER DEFAULT 0, -- 事務所受取額
  platform_amount INTEGER DEFAULT 0, -- プラットフォーム受取額
  
  -- 料率
  therapist_rate INTEGER NOT NULL, -- セラピスト料率（%）
  office_rate INTEGER DEFAULT 0, -- 事務所料率（%）
  platform_rate INTEGER DEFAULT 0, -- プラットフォーム料率（%）
  
  -- ステータス
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'PAID', 'CANCELLED')),
  
  -- 日付
  booking_date DATE NOT NULL,
  confirmed_at DATETIME,
  paid_at DATETIME,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (therapist_profile_id) REFERENCES therapist_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (office_id) REFERENCES offices(id) ON DELETE SET NULL
);

-- 月次精算レポートテーブル
CREATE TABLE IF NOT EXISTS monthly_settlement_reports (
  id TEXT PRIMARY KEY,
  therapist_profile_id TEXT NOT NULL,
  office_id TEXT,
  
  -- 対象期間
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  
  -- 集計データ
  total_bookings INTEGER DEFAULT 0, -- 総予約数
  total_revenue INTEGER DEFAULT 0, -- 総売上
  therapist_earnings INTEGER DEFAULT 0, -- セラピスト報酬総額
  office_earnings INTEGER DEFAULT 0, -- 事務所報酬総額
  platform_earnings INTEGER DEFAULT 0, -- プラットフォーム報酬総額
  
  -- ステータス
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'CONFIRMED', 'PAID')),
  
  -- 支払い情報
  payment_method TEXT, -- 支払い方法
  payment_date DATE,
  payment_reference TEXT, -- 支払い参照番号
  
  notes TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (therapist_profile_id) REFERENCES therapist_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (office_id) REFERENCES offices(id) ON DELETE SET NULL,
  UNIQUE(therapist_profile_id, year, month)
);

-- 支払い履歴テーブル
CREATE TABLE IF NOT EXISTS payment_transactions (
  id TEXT PRIMARY KEY,
  settlement_report_id TEXT NOT NULL,
  therapist_profile_id TEXT NOT NULL,
  
  -- 支払い情報
  amount INTEGER NOT NULL,
  payment_method TEXT NOT NULL, -- 銀行振込、PayPal、Stripe等
  payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED')),
  
  -- 詳細
  transaction_reference TEXT, -- 取引参照番号
  bank_account TEXT, -- 振込先口座情報（暗号化推奨）
  payment_date DATE,
  
  notes TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (settlement_report_id) REFERENCES monthly_settlement_reports(id) ON DELETE CASCADE,
  FOREIGN KEY (therapist_profile_id) REFERENCES therapist_profiles(id) ON DELETE CASCADE
);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_earnings_therapist ON therapist_earnings(therapist_profile_id);
CREATE INDEX IF NOT EXISTS idx_earnings_booking ON therapist_earnings(booking_id);
CREATE INDEX IF NOT EXISTS idx_earnings_date ON therapist_earnings(booking_date);
CREATE INDEX IF NOT EXISTS idx_earnings_status ON therapist_earnings(status);

CREATE INDEX IF NOT EXISTS idx_settlement_therapist ON monthly_settlement_reports(therapist_profile_id);
CREATE INDEX IF NOT EXISTS idx_settlement_period ON monthly_settlement_reports(year, month);
CREATE INDEX IF NOT EXISTS idx_settlement_status ON monthly_settlement_reports(status);

CREATE INDEX IF NOT EXISTS idx_payment_settlement ON payment_transactions(settlement_report_id);
CREATE INDEX IF NOT EXISTS idx_payment_therapist ON payment_transactions(therapist_profile_id);
CREATE INDEX IF NOT EXISTS idx_payment_status ON payment_transactions(payment_status);
