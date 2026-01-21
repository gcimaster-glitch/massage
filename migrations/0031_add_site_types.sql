-- Drop the old CHECK constraint and create a new one with additional types
-- SQLite doesn't support ALTER TABLE ... DROP CONSTRAINT, so we need to recreate the table

-- Step 1: Create a new table with the updated constraint
CREATE TABLE IF NOT EXISTS sites_new (
  id TEXT PRIMARY KEY,
  host_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('HOTEL', 'OFFICE', 'HOME', 'OTHER', 'CARE_CUBE', 'PRIVATE_SPACE')),
  address TEXT NOT NULL,
  area_code TEXT NOT NULL,
  latitude REAL,
  longitude REAL,
  room_count INTEGER DEFAULT 1,
  amenities TEXT,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED')),
  image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Step 2: Copy existing data
INSERT INTO sites_new SELECT id, host_id, name, type, address, area_code, latitude, longitude, room_count, amenities, status, image_url, created_at, updated_at FROM sites;

-- Step 3: Drop old table
DROP TABLE sites;

-- Step 4: Rename new table
ALTER TABLE sites_new RENAME TO sites;
