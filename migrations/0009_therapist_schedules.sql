-- Add therapist_schedules table for schedule management

CREATE TABLE IF NOT EXISTS therapist_schedules (
  id TEXT PRIMARY KEY,
  therapist_id TEXT NOT NULL,
  day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, ..., 6=Saturday
  start_time TEXT NOT NULL,      -- HH:MM format
  end_time TEXT NOT NULL,        -- HH:MM format
  is_available INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (therapist_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_therapist_schedules_therapist ON therapist_schedules(therapist_id);
CREATE INDEX IF NOT EXISTS idx_therapist_schedules_day ON therapist_schedules(day_of_week);
