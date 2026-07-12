-- 0052: スキーマとコードの不整合を解消する調整マイグレーション
-- ============================================
-- 監査で見つかった「コードが参照しているのに存在しないカラム」を追加し、
-- 収益分配エンジンが前提とするデフォルトルールを投入する。

-- ============================================
-- 1. office_details に管理画面（OfficeManagement.tsx）が使う連絡先カラムを追加
--    （offices テーブルには phone / address / description が存在しない）
-- ============================================
ALTER TABLE office_details ADD COLUMN phone TEXT;
ALTER TABLE office_details ADD COLUMN address TEXT;
ALTER TABLE office_details ADD COLUMN description TEXT;

-- ============================================
-- 2. payout_statements に notes カラムを追加
--    （PATCH /api/revenue/statements/:id が notes を書き込むが、
--      実効スキーマ＝0043_core_business_schema 版には存在しない）
-- ============================================
ALTER TABLE payout_statements ADD COLUMN notes TEXT;

-- ============================================
-- 3. デフォルト収益分配ルールの投入
--    bookings.revenue_share_rule_id が未設定の予約はコード側で
--    'rule_default_001' にフォールバックするため、必ず存在させる。
--    分配率は事業資料定義の正式値:
--    セラピスト40% / セラピストオフィス25% / 拠点ホスト20% / 本部10% / 販促5%
-- ============================================
INSERT OR IGNORE INTO revenue_share_rules (
  id, therapist_rate, office_rate, host_rate, platform_rate, promotion_rate,
  priority, is_active, notes
) VALUES (
  'rule_default_001', 40, 25, 20, 10, 5,
  0, 1, 'デフォルト分配ルール（セラピスト40% / オフィス25% / ホスト20% / 本部10% / 販促5%）'
);
