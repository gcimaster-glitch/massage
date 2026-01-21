-- 事務所情報テーブル（既存のofficesテーブルを拡張）
-- 事務所とセラピストの関連テーブル
CREATE TABLE IF NOT EXISTS office_therapist_affiliations (
  id TEXT PRIMARY KEY,
  office_id TEXT NOT NULL,
  therapist_profile_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED')),
  commission_rate INTEGER NOT NULL DEFAULT 70, -- セラピスト取り分（%）
  office_commission_rate INTEGER NOT NULL DEFAULT 20, -- 事務所取り分（%）
  platform_commission_rate INTEGER NOT NULL DEFAULT 10, -- プラットフォーム取り分（%）
  start_date DATE,
  end_date DATE,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (office_id) REFERENCES offices(id) ON DELETE CASCADE,
  FOREIGN KEY (therapist_profile_id) REFERENCES therapist_profiles(id) ON DELETE CASCADE,
  UNIQUE(office_id, therapist_profile_id)
);

-- 事務所の追加情報テーブル
CREATE TABLE IF NOT EXISTS office_details (
  id TEXT PRIMARY KEY,
  office_id TEXT NOT NULL UNIQUE,
  representative_name TEXT, -- 代表者名
  business_registration_number TEXT, -- 事業者登録番号
  tax_id TEXT, -- 法人番号
  bank_name TEXT, -- 銀行名
  bank_branch TEXT, -- 支店名
  bank_account_type TEXT, -- 口座種別（普通/当座）
  bank_account_number TEXT, -- 口座番号
  bank_account_holder TEXT, -- 口座名義
  total_therapists INTEGER DEFAULT 0, -- 所属セラピスト数
  monthly_revenue INTEGER DEFAULT 0, -- 月間売上
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (office_id) REFERENCES offices(id) ON DELETE CASCADE
);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_office_therapist_office ON office_therapist_affiliations(office_id);
CREATE INDEX IF NOT EXISTS idx_office_therapist_therapist ON office_therapist_affiliations(therapist_profile_id);
CREATE INDEX IF NOT EXISTS idx_office_therapist_status ON office_therapist_affiliations(status);
CREATE INDEX IF NOT EXISTS idx_office_details_office ON office_details(office_id);
