-- ============================================
-- Migration: 0046_add_reviews
-- お客様レビューシステム
-- ============================================

-- reviews テーブル
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  therapist_id TEXT NOT NULL,
  user_id TEXT,
  rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  comment TEXT,
  -- お客様の特徴
  customer_age_range TEXT,
  customer_gender TEXT,
  customer_occupation TEXT,
  -- お客様の身体の悩み（JSON配列: ["肩こり","腰痛"] など）
  body_concerns TEXT DEFAULT '[]',
  -- NG事項（JSON配列: ["強圧禁止","妊娠中"] など）
  ng_items TEXT DEFAULT '[]',
  -- 公開フラグ（1=公開, 0=非公開）
  is_public INTEGER NOT NULL DEFAULT 1,
  -- セラピストからの返信
  therapist_reply TEXT,
  therapist_replied_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_reviews_therapist_id ON reviews(therapist_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(therapist_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(therapist_id, rating);
