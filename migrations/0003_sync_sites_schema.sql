-- Migration: Sync sites table schema with production
-- Created: 2026-01-13
-- Description: Rename columns in sites table to match production schema

-- Create temporary table with production schema
CREATE TABLE IF NOT EXISTS sites_new (
  id TEXT PRIMARY KEY,
  host_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  address TEXT NOT NULL,
  area TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  cube_serial_number TEXT,
  is_active INTEGER DEFAULT 1,
  room_count INTEGER,
  amenities TEXT,
  status TEXT DEFAULT 'PENDING',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Copy data from old table to new table
INSERT INTO sites_new (id, host_id, name, type, address, area, lat, lng, cube_serial_number, is_active, room_count, amenities, status, created_at, updated_at)
SELECT id, host_id, name, type, address, area_code as area, latitude as lat, longitude as lng, NULL as cube_serial_number, 1 as is_active, room_count, amenities, status, created_at, updated_at
FROM sites;

-- Drop old table
DROP TABLE sites;

-- Rename new table to sites
ALTER TABLE sites_new RENAME TO sites;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sites_type ON sites(type);
CREATE INDEX IF NOT EXISTS idx_sites_area ON sites(area);
CREATE INDEX IF NOT EXISTS idx_sites_host_id ON sites(host_id);
