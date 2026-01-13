-- Migration: Add missing tables only (compatible with existing schema)
-- Created: 2026-01-13
-- Description: Add only the tables that don't exist, preserve existing structure

-- ========================================
-- Master Data Tables (new)
-- ========================================

CREATE TABLE IF NOT EXISTS master_areas (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  prefecture TEXT NOT NULL,
  city TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS master_courses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  duration INTEGER NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  base_price INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS master_options (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  duration INTEGER DEFAULT 0,
  base_price INTEGER DEFAULT 0,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- Therapist Menu Tables (new)
-- ========================================

CREATE TABLE IF NOT EXISTS therapist_menu (
  id TEXT PRIMARY KEY,
  therapist_id TEXT NOT NULL,
  master_course_id TEXT NOT NULL,
  price INTEGER NOT NULL,
  is_available INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(therapist_id, master_course_id)
);

CREATE TABLE IF NOT EXISTS therapist_options (
  id TEXT PRIMARY KEY,
  therapist_id TEXT NOT NULL,
  master_option_id TEXT NOT NULL,
  price INTEGER NOT NULL,
  is_available INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(therapist_id, master_option_id)
);

-- ========================================
-- Offices (new, different from therapist_offices)
-- ========================================

CREATE TABLE IF NOT EXISTS offices (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  area_code TEXT NOT NULL,
  manager_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  commission_rate REAL DEFAULT 15.0,
  therapist_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'PENDING',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- Site Rooms (new)
-- ========================================

CREATE TABLE IF NOT EXISTS site_rooms (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  room_number TEXT NOT NULL,
  is_available INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(site_id, room_number)
);

-- ========================================
-- Booking Related (new)
-- ========================================

CREATE TABLE IF NOT EXISTS booking_items (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  item_type TEXT NOT NULL,
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  price INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  booking_id TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  therapist_id TEXT NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT,
  is_public INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  stripe_payment_intent_id TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  payment_method TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- Financial Tables (new)
-- ========================================

CREATE TABLE IF NOT EXISTS revenue_config (
  id TEXT PRIMARY KEY,
  target_month TEXT NOT NULL UNIQUE,
  therapist_percentage REAL NOT NULL,
  host_percentage REAL NOT NULL,
  affiliate_percentage REAL NOT NULL,
  platform_percentage REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS financial_statements (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_role TEXT NOT NULL,
  user_name TEXT NOT NULL,
  target_month TEXT NOT NULL,
  total_sales INTEGER NOT NULL,
  payout_amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  details TEXT,
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  paid_at DATETIME,
  UNIQUE(user_id, target_month)
);

-- ========================================
-- Incident Related (new)
-- ========================================

CREATE TABLE IF NOT EXISTS incident_actions (
  id TEXT PRIMARY KEY,
  incident_id TEXT NOT NULL,
  admin_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- Affiliate Tables (new)
-- ========================================

CREATE TABLE IF NOT EXISTS affiliates (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  affiliate_code TEXT UNIQUE NOT NULL,
  commission_rate REAL DEFAULT 5.0,
  total_referrals INTEGER DEFAULT 0,
  total_earnings INTEGER DEFAULT 0,
  status TEXT DEFAULT 'ACTIVE',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS affiliate_referrals (
  id TEXT PRIMARY KEY,
  affiliate_id TEXT NOT NULL,
  referred_user_id TEXT NOT NULL,
  booking_id TEXT,
  commission_amount INTEGER DEFAULT 0,
  status TEXT DEFAULT 'PENDING',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- Notification & System Tables (new)
-- ========================================

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_logs (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- Indexes
-- ========================================

CREATE INDEX IF NOT EXISTS idx_therapist_menu_therapist ON therapist_menu(therapist_id);
CREATE INDEX IF NOT EXISTS idx_therapist_options_therapist ON therapist_options(therapist_id);
CREATE INDEX IF NOT EXISTS idx_site_rooms_site ON site_rooms(site_id);
CREATE INDEX IF NOT EXISTS idx_offices_user ON offices(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_items_booking ON booking_items(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_therapist ON reviews(therapist_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_incident_actions_incident ON incident_actions(incident_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_user ON affiliates(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_code ON affiliates(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate ON affiliate_referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin ON admin_logs(admin_id);
