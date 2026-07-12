-- 0053: コードが参照しているのにどのマイグレーションにも存在しなかったテーブルを追加
-- ============================================

-- ============================================
-- 1. booking_logs（予約操作ログ）
--    bookings-routes.ts の予約却下・ステータス変更時に書き込まれる
-- ============================================
CREATE TABLE IF NOT EXISTS booking_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id TEXT NOT NULL,
  action TEXT NOT NULL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_booking_logs_booking ON booking_logs(booking_id);

-- ============================================
-- 2. user_subscriptions（サブスクリプション契約）
--    stripe-webhook-routes.ts の customer.subscription.* イベントで upsert される
-- ============================================
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan_id TEXT,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe ON user_subscriptions(stripe_subscription_id);

-- ============================================
-- 3. payment_splits（決済分割・index.tsxのランタイム管理APIが参照）
--    ランタイム側のCREATE TABLE IF NOT EXISTSと同一定義
-- ============================================
CREATE TABLE IF NOT EXISTS payment_splits (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  payment_intent_id TEXT NOT NULL,
  total_amount INTEGER NOT NULL,
  platform_fee INTEGER NOT NULL,
  office_amount INTEGER DEFAULT 0,
  therapist_amount INTEGER NOT NULL,
  status TEXT DEFAULT 'PENDING',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- ============================================
-- 4. gift_cards（ギフトカード・管理APIのデータリセット対象）
-- ============================================
CREATE TABLE IF NOT EXISTS gift_cards (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL,
  balance INTEGER NOT NULL,
  purchaser_user_id TEXT,
  redeemed_by_user_id TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
