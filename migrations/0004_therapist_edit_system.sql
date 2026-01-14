-- Migration: Therapist Edit and Approval System
-- Created: 2026-01-13
-- Description: Tables for therapist profile editing with approval workflow and edit logs

-- ========================================
-- 1. Therapist Profile Edits (Pending Approvals)
-- ========================================

-- This table stores pending edits that require approval
CREATE TABLE IF NOT EXISTS therapist_profile_edits (
  id TEXT PRIMARY KEY,
  therapist_id TEXT NOT NULL,
  editor_id TEXT NOT NULL,
  editor_role TEXT NOT NULL, -- 'THERAPIST' (self-edit), 'THERAPIST_OFFICE' (office admin), 'ADMIN' (super admin)
  
  -- Changed fields (only store fields that were changed)
  changed_fields TEXT NOT NULL, -- JSON object with field names and new values
  
  -- Status
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  
  -- Approval info
  reviewed_by TEXT, -- User ID who approved/rejected
  reviewed_at DATETIME,
  reject_reason TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (therapist_id) REFERENCES therapist_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (editor_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_therapist_profile_edits_therapist ON therapist_profile_edits(therapist_id);
CREATE INDEX IF NOT EXISTS idx_therapist_profile_edits_status ON therapist_profile_edits(status);
CREATE INDEX IF NOT EXISTS idx_therapist_profile_edits_editor ON therapist_profile_edits(editor_id);

-- ========================================
-- 2. Therapist Edit Logs (Complete History)
-- ========================================

-- This table stores ALL edits (both approved and direct) for audit trail
CREATE TABLE IF NOT EXISTS therapist_edit_logs (
  id TEXT PRIMARY KEY,
  therapist_id TEXT NOT NULL,
  editor_id TEXT NOT NULL,
  editor_name TEXT NOT NULL,
  editor_role TEXT NOT NULL,
  
  -- What changed
  field_name TEXT NOT NULL, -- Name of the field that was changed (e.g., 'bio', 'specialties')
  old_value TEXT, -- Previous value (can be NULL for new fields)
  new_value TEXT, -- New value
  
  -- Edit metadata
  edit_type TEXT NOT NULL CHECK (edit_type IN ('DIRECT', 'APPROVED')), -- DIRECT = admin/office immediate edit, APPROVED = therapist self-edit after approval
  approval_id TEXT, -- Reference to therapist_profile_edits if this came from an approval
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (therapist_id) REFERENCES therapist_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (editor_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approval_id) REFERENCES therapist_profile_edits(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_therapist_edit_logs_therapist ON therapist_edit_logs(therapist_id);
CREATE INDEX IF NOT EXISTS idx_therapist_edit_logs_editor ON therapist_edit_logs(editor_id);
CREATE INDEX IF NOT EXISTS idx_therapist_edit_logs_created ON therapist_edit_logs(created_at);
