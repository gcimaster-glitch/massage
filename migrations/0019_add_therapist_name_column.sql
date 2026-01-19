-- Add therapist_name column to bookings table for production
ALTER TABLE bookings ADD COLUMN therapist_name TEXT NOT NULL DEFAULT 'セラピスト';
