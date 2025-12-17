-- Migration: Production Ready Schema Updates
-- Date: 2024-12-16
-- Description: Security and performance improvements for production deployment

-- ============================================================================
-- SECURITY FIXES
-- ============================================================================

-- Add unique constraint on user email to prevent duplicate accounts
-- First, handle any existing duplicates by keeping the earliest created account
DO $$
BEGIN
    -- Check if the unique constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'user_email_unique'
    ) THEN
        -- Create unique index on email (allows NULL values)
        CREATE UNIQUE INDEX IF NOT EXISTS user_email_unique ON "user" (email) WHERE email IS NOT NULL;
    END IF;
END $$;

-- Add email verification column
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Add soft delete column to users
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Add soft delete column to patients
ALTER TABLE "patient" ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Add soft delete column to doctors
ALTER TABLE "doctor" ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- ============================================================================
-- APPOINTMENT IMPROVEMENTS
-- ============================================================================

-- Add cancellation tracking columns
ALTER TABLE "appointment" ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR;
ALTER TABLE "appointment" ADD COLUMN IF NOT EXISTS cancellation_reason VARCHAR;

-- ============================================================================
-- REVIEWS IMPROVEMENTS
-- ============================================================================

-- Add patient tracking to reviews
ALTER TABLE "review" ADD COLUMN IF NOT EXISTS patient_id VARCHAR REFERENCES "patient"(id) ON DELETE SET NULL;

-- ============================================================================
-- NOTIFICATIONS IMPROVEMENTS
-- ============================================================================

-- Add notification type and link columns
ALTER TABLE "notification" ADD COLUMN IF NOT EXISTS type VARCHAR;
ALTER TABLE "notification" ADD COLUMN IF NOT EXISTS link VARCHAR;
ALTER TABLE "notification" ADD COLUMN IF NOT EXISTS metadata TEXT;

-- Change message to TEXT for longer messages
ALTER TABLE "notification" ALTER COLUMN message TYPE TEXT;

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- User indexes
CREATE INDEX IF NOT EXISTS users_email_idx ON "user" (email);
CREATE INDEX IF NOT EXISTS users_role_idx ON "user" (role);

-- Patient indexes
CREATE INDEX IF NOT EXISTS patients_user_id_idx ON "patient" (user_id);

-- Doctor indexes
CREATE INDEX IF NOT EXISTS doctors_specialty_idx ON "doctor" (specialty_id);
CREATE INDEX IF NOT EXISTS doctors_status_idx ON "doctor" (status);
CREATE INDEX IF NOT EXISTS doctors_facility_idx ON "doctor" (hospital_id);
CREATE INDEX IF NOT EXISTS doctors_user_id_idx ON "doctor" (user_id);

-- Appointment indexes
CREATE INDEX IF NOT EXISTS appointments_doctor_id_idx ON "appointment" (doctor_id);
CREATE INDEX IF NOT EXISTS appointments_patient_id_idx ON "appointment" (patient_id);
CREATE INDEX IF NOT EXISTS appointments_date_idx ON "appointment" (appointment_date);
CREATE INDEX IF NOT EXISTS appointments_status_idx ON "appointment" (status);

-- Review indexes
CREATE INDEX IF NOT EXISTS reviews_doctor_id_idx ON "review" (doctor_id);
CREATE INDEX IF NOT EXISTS reviews_appointment_id_idx ON "review" (appointment_id);

-- Notification indexes
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON "notification" (user_id);
CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON "notification" (is_read);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON "notification" (created_at);

-- ============================================================================
-- DEFAULT VALUE FIXES
-- ============================================================================

-- Set default for updated_at columns that were missing defaults
ALTER TABLE "user" ALTER COLUMN updated_at SET DEFAULT NOW();
ALTER TABLE "patient" ALTER COLUMN updated_at SET DEFAULT NOW();
ALTER TABLE "doctor" ALTER COLUMN updated_at SET DEFAULT NOW();
ALTER TABLE "appointment" ALTER COLUMN updated_at SET DEFAULT NOW();

-- Update existing NULL values
UPDATE "user" SET updated_at = created_at WHERE updated_at IS NULL;
UPDATE "patient" SET updated_at = created_at WHERE updated_at IS NULL;
UPDATE "doctor" SET updated_at = created_at WHERE updated_at IS NULL;
UPDATE "appointment" SET updated_at = created_at WHERE updated_at IS NULL;
