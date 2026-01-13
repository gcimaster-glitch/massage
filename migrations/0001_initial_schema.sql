-- Migration: Initial schema for HOGUSY platform
-- Created: 2026-01-13
-- Description: Complete database schema with all tables

-- ========================================
-- 1. User Management Tables
-- ========================================

-- Main users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('USER', 'THERAPIST', 'HOST', 'THERAPIST_OFFICE', 'AFFILIATE', 'ADMIN')),
  avatar_url TEXT,
  email_verified INTEGER DEFAULT 0,
  phone_verified INTEGER DEFAULT 0,
  kyc_status TEXT DEFAULT 'PENDING' CHECK (kyc_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Social account linkage
CREATE TABLE IF NOT EXISTS social_accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'yahoo', 'x', 'facebook', 'line', 'apple')),
  provider_user_id TEXT NOT NULL,
  email TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at DATETIME,
  last_used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(provider, provider_user_id)
);

-- Authentication sessions
CREATE TABLE IF NOT EXISTS auth_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- OAuth states (temporary storage for OAuth flow)
CREATE TABLE IF NOT EXISTS oauth_states (
  state TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  redirect_path TEXT,
  role TEXT,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 2. Therapist Profile Tables
-- ========================================

CREATE TABLE IF NOT EXISTS therapist_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  office_id TEXT,
  bio TEXT,
  specialties TEXT, -- JSON array
  experience_years INTEGER,
  certifications TEXT, -- JSON array
  rating REAL DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  approved_areas TEXT, -- JSON array of area codes
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (office_id) REFERENCES offices(id) ON DELETE SET NULL
);

-- Therapist menu (courses and options)
CREATE TABLE IF NOT EXISTS therapist_menu (
  id TEXT PRIMARY KEY,
  therapist_id TEXT NOT NULL,
  master_course_id TEXT NOT NULL,
  price INTEGER NOT NULL,
  is_available INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (therapist_id) REFERENCES therapist_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (master_course_id) REFERENCES master_courses(id) ON DELETE CASCADE,
  UNIQUE(therapist_id, master_course_id)
);

CREATE TABLE IF NOT EXISTS therapist_options (
  id TEXT PRIMARY KEY,
  therapist_id TEXT NOT NULL,
  master_option_id TEXT NOT NULL,
  price INTEGER NOT NULL,
  is_available INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (therapist_id) REFERENCES therapist_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (master_option_id) REFERENCES master_options(id) ON DELETE CASCADE,
  UNIQUE(therapist_id, master_option_id)
);

-- ========================================
-- 3. Host & Site Tables
-- ========================================

CREATE TABLE IF NOT EXISTS sites (
  id TEXT PRIMARY KEY,
  host_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('HOTEL', 'OFFICE', 'HOME', 'OTHER')),
  address TEXT NOT NULL,
  area_code TEXT NOT NULL,
  latitude REAL,
  longitude REAL,
  room_count INTEGER DEFAULT 1,
  amenities TEXT, -- JSON array
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS site_rooms (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  room_number TEXT NOT NULL,
  is_available INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
  UNIQUE(site_id, room_number)
);

-- ========================================
-- 4. Office (Agency) Tables
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
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ========================================
-- 5. Master Data Tables
-- ========================================

CREATE TABLE IF NOT EXISTS master_courses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  duration INTEGER NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('GENERAL', 'RELAXATION', 'SPORTS', 'HEAD', 'RECOVERY')),
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

CREATE TABLE IF NOT EXISTS master_areas (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  prefecture TEXT NOT NULL,
  city TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 6. Booking & Transaction Tables
-- ========================================

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  therapist_id TEXT NOT NULL,
  therapist_name TEXT NOT NULL,
  office_id TEXT,
  site_id TEXT,
  room_id TEXT,
  type TEXT NOT NULL CHECK (type IN ('ONSITE', 'HOTEL', 'HOME', 'OFFICE')),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
  service_name TEXT NOT NULL,
  duration INTEGER NOT NULL,
  price INTEGER NOT NULL,
  location TEXT,
  address_visibility TEXT DEFAULT 'PARTIAL' CHECK (address_visibility IN ('FULL', 'PARTIAL', 'HIDDEN')),
  scheduled_at DATETIME NOT NULL,
  started_at DATETIME,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (therapist_id) REFERENCES therapist_profiles(id) ON DELETE RESTRICT,
  FOREIGN KEY (office_id) REFERENCES offices(id) ON DELETE SET NULL,
  FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE SET NULL,
  FOREIGN KEY (room_id) REFERENCES site_rooms(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS booking_items (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('COURSE', 'OPTION')),
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  price INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- ========================================
-- 7. Review & Rating Tables
-- ========================================

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  booking_id TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  therapist_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  is_public INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (therapist_id) REFERENCES therapist_profiles(id) ON DELETE CASCADE
);

-- ========================================
-- 8. Payment & Financial Tables
-- ========================================

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  stripe_payment_intent_id TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')),
  payment_method TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

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
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING', 'PAID', 'CANCELLED')),
  details TEXT, -- JSON array of line items
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  paid_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, target_month)
);

-- ========================================
-- 9. Safety & Incident Tables
-- ========================================

CREATE TABLE IF NOT EXISTS incidents (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  reporter_id TEXT NOT NULL,
  reporter_role TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED')),
  resolved_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS incident_actions (
  id TEXT PRIMARY KEY,
  incident_id TEXT NOT NULL,
  admin_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ========================================
-- 10. Affiliate Tables
-- ========================================

CREATE TABLE IF NOT EXISTS affiliates (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  affiliate_code TEXT UNIQUE NOT NULL,
  commission_rate REAL DEFAULT 5.0,
  total_referrals INTEGER DEFAULT 0,
  total_earnings INTEGER DEFAULT 0,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS affiliate_referrals (
  id TEXT PRIMARY KEY,
  affiliate_id TEXT NOT NULL,
  referred_user_id TEXT NOT NULL,
  booking_id TEXT,
  commission_amount INTEGER DEFAULT 0,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'PAID')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (affiliate_id) REFERENCES affiliates(id) ON DELETE CASCADE,
  FOREIGN KEY (referred_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
);

-- ========================================
-- 11. Notification Tables
-- ========================================

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ========================================
-- 12. System & Admin Tables
-- ========================================

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
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ========================================
-- Indexes for Performance
-- ========================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_social_accounts_user ON social_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_provider ON social_accounts(provider, provider_user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_token ON auth_sessions(token);
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires ON oauth_states(expires_at);

CREATE INDEX IF NOT EXISTS idx_therapist_profiles_user ON therapist_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_therapist_profiles_office ON therapist_profiles(office_id);
CREATE INDEX IF NOT EXISTS idx_therapist_profiles_status ON therapist_profiles(status);
CREATE INDEX IF NOT EXISTS idx_therapist_menu_therapist ON therapist_menu(therapist_id);
CREATE INDEX IF NOT EXISTS idx_therapist_options_therapist ON therapist_options(therapist_id);

CREATE INDEX IF NOT EXISTS idx_sites_host ON sites(host_id);
CREATE INDEX IF NOT EXISTS idx_sites_area ON sites(area_code);
CREATE INDEX IF NOT EXISTS idx_site_rooms_site ON site_rooms(site_id);

CREATE INDEX IF NOT EXISTS idx_offices_user ON offices(user_id);
CREATE INDEX IF NOT EXISTS idx_offices_status ON offices(status);

CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_therapist ON bookings(therapist_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled ON bookings(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_booking_items_booking ON booking_items(booking_id);

CREATE INDEX IF NOT EXISTS idx_reviews_therapist ON reviews(therapist_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking ON reviews(booking_id);

CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

CREATE INDEX IF NOT EXISTS idx_incidents_booking ON incidents(booking_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incident_actions_incident ON incident_actions(incident_id);

CREATE INDEX IF NOT EXISTS idx_affiliates_user ON affiliates(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_code ON affiliates(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate ON affiliate_referrals(affiliate_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON admin_logs(created_at);
