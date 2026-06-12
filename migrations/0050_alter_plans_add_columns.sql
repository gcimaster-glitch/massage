-- plans テーブルに PlanManagement.tsx が期待するカラムを追加
ALTER TABLE plans ADD COLUMN display_name TEXT;
ALTER TABLE plans ADD COLUMN monthly_price INTEGER DEFAULT 0;
ALTER TABLE plans ADD COLUMN annual_price INTEGER;
ALTER TABLE plans ADD COLUMN features TEXT DEFAULT '[]';
ALTER TABLE plans ADD COLUMN stripe_price_id_monthly TEXT;
ALTER TABLE plans ADD COLUMN stripe_price_id_annual TEXT;

-- 既存レコードの display_name を plan_name から引き継ぐ
UPDATE plans SET display_name = plan_name WHERE display_name IS NULL;
-- 既存レコードの monthly_price を monthly_fee から引き継ぐ
UPDATE plans SET monthly_price = monthly_fee WHERE monthly_price = 0;
