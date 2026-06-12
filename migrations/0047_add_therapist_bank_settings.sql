-- セラピストプロフィールに振込先銀行口座情報カラムを追加
ALTER TABLE therapist_profiles ADD COLUMN bank_name TEXT;
ALTER TABLE therapist_profiles ADD COLUMN bank_branch TEXT;
ALTER TABLE therapist_profiles ADD COLUMN bank_branch_code TEXT;
ALTER TABLE therapist_profiles ADD COLUMN bank_account_type TEXT DEFAULT 'NORMAL'
  CHECK (bank_account_type IN ('NORMAL', 'CURRENT') OR bank_account_type IS NULL);
ALTER TABLE therapist_profiles ADD COLUMN bank_account_number TEXT;
ALTER TABLE therapist_profiles ADD COLUMN bank_account_holder TEXT;
