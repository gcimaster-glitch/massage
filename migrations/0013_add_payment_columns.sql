-- Add payment-related columns to bookings table
-- Migration: 0013_add_payment_columns.sql
-- Created: 2026-01-17

ALTER TABLE bookings ADD COLUMN payment_status TEXT DEFAULT 'PENDING';
ALTER TABLE bookings ADD COLUMN payment_intent_id TEXT;
ALTER TABLE bookings ADD COLUMN paid_at DATETIME;
