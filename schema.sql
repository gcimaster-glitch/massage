-- ============================================
-- Soothe x CARE CUBE Japan - Database Schema
-- ============================================

-- Users Table (統合ユーザー管理)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('USER', 'THERAPIST', 'HOST', 'THERAPIST_OFFICE', 'ADMIN', 'AFFILIATE')),
  phone TEXT,
  avatar_url TEXT,
  stripe_customer_id TEXT,
  stripe_connect_account_id TEXT, -- For therapists/hosts receiving payments
  kyc_status TEXT DEFAULT 'PENDING' CHECK(kyc_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
  kyc_verified_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Therapist Profiles (セラピスト詳細)
CREATE TABLE IF NOT EXISTS therapist_profiles (
  user_id TEXT PRIMARY KEY,
  bio TEXT,
  specialties TEXT, -- JSON array
  rating REAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  approved_areas TEXT, -- JSON array: ['SHINJUKU', 'SHIBUYA']
  office_id TEXT, -- 所属事務所 (NULL if independent)
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (office_id) REFERENCES therapist_offices(id)
);

-- Therapist Offices (事務所/エージェンシー)
CREATE TABLE IF NOT EXISTS therapist_offices (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  area TEXT NOT NULL,
  manager_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  commission_rate REAL DEFAULT 15, -- Office commission percentage
  status TEXT DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'SUSPENDED')),
  therapist_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sites (施術場所: ホテル、CARE CUBE等)
CREATE TABLE IF NOT EXISTS sites (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('HOTEL', 'CARE_CUBE', 'PRIVATE_SPACE')),
  address TEXT NOT NULL,
  area TEXT NOT NULL,
  host_id TEXT NOT NULL,
  cube_serial_number TEXT, -- CARE CUBE hardware ID
  lat REAL,
  lng REAL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (host_id) REFERENCES users(id)
);

-- Bookings (予約管理)
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  therapist_id TEXT NOT NULL,
  site_id TEXT NOT NULL,
  office_id TEXT, -- If therapist is affiliated
  type TEXT NOT NULL CHECK(type IN ('ONSITE', 'OUTCALL')),
  status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  service_name TEXT NOT NULL,
  duration INTEGER NOT NULL, -- minutes
  scheduled_start DATETIME NOT NULL,
  scheduled_end DATETIME,
  price INTEGER NOT NULL, -- JPY (税込)
  payment_intent_id TEXT, -- Stripe Payment Intent ID
  payment_status TEXT DEFAULT 'PENDING' CHECK(payment_status IN ('PENDING', 'PAID', 'REFUNDED')),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (therapist_id) REFERENCES users(id),
  FOREIGN KEY (site_id) REFERENCES sites(id),
  FOREIGN KEY (office_id) REFERENCES therapist_offices(id)
);

-- Messages (チャット/連絡)
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'TEXT' CHECK(type IN ('TEXT', 'SYSTEM', 'LOCATION')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  FOREIGN KEY (sender_id) REFERENCES users(id)
);

-- Incidents (AI監視・緊急事案)
CREATE TABLE IF NOT EXISTS incidents (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  severity TEXT NOT NULL CHECK(severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  type TEXT NOT NULL, -- 'HARASSMENT', 'SOS', 'SUSPICIOUS_ACTIVITY'
  description TEXT,
  ai_confidence REAL, -- Gemini detection confidence (0-1)
  audio_url TEXT, -- R2 URL to recorded audio
  status TEXT DEFAULT 'OPEN' CHECK(status IN ('OPEN', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE')),
  resolved_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- Revenue Config (収益分配設定)
CREATE TABLE IF NOT EXISTS revenue_configs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  target_month TEXT NOT NULL UNIQUE, -- 'YYYY-MM'
  therapist_percentage REAL DEFAULT 65,
  host_percentage REAL DEFAULT 20,
  office_percentage REAL DEFAULT 10,
  platform_percentage REAL DEFAULT 5,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Monthly Statements (月次精算書)
CREATE TABLE IF NOT EXISTS monthly_statements (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_role TEXT NOT NULL,
  target_month TEXT NOT NULL, -- 'YYYY-MM'
  total_sales INTEGER NOT NULL,
  payout_amount INTEGER NOT NULL,
  status TEXT DEFAULT 'DRAFT' CHECK(status IN ('DRAFT', 'SENT', 'PAID')),
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  paid_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_therapist ON bookings(therapist_id);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_start ON bookings(scheduled_start);
CREATE INDEX IF NOT EXISTS idx_messages_booking ON messages(booking_id);
CREATE INDEX IF NOT EXISTS idx_incidents_booking ON incidents(booking_id);
CREATE INDEX IF NOT EXISTS idx_therapist_profiles_office ON therapist_profiles(office_id);
CREATE INDEX IF NOT EXISTS idx_sites_host ON sites(host_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);