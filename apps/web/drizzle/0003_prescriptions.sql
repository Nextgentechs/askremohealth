-- Add prescription management tables
-- Migration: 0003_prescriptions.sql

-- Prescription status enum
DO $$ BEGIN
  CREATE TYPE "prescription_status" AS ENUM('active', 'dispensed', 'expired', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Prescriptions table
CREATE TABLE IF NOT EXISTS "prescription" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "appointment_id" uuid NOT NULL REFERENCES "appointment"("id") ON DELETE CASCADE,
  "doctor_id" varchar NOT NULL REFERENCES "doctor"("id") ON DELETE CASCADE,
  "patient_id" varchar NOT NULL REFERENCES "patient"("id") ON DELETE CASCADE,
  "diagnosis" text,
  "notes" text,
  "status" "prescription_status" DEFAULT 'active' NOT NULL,
  "valid_until" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Prescription items table (individual medications)
CREATE TABLE IF NOT EXISTS "prescription_item" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "prescription_id" uuid NOT NULL REFERENCES "prescription"("id") ON DELETE CASCADE,
  "medication_name" varchar NOT NULL,
  "dosage" varchar NOT NULL,
  "frequency" varchar NOT NULL,
  "duration" varchar NOT NULL,
  "quantity" integer,
  "instructions" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS "prescriptions_doctor_id_idx" ON "prescription" ("doctor_id");
CREATE INDEX IF NOT EXISTS "prescriptions_patient_id_idx" ON "prescription" ("patient_id");
CREATE INDEX IF NOT EXISTS "prescriptions_appointment_id_idx" ON "prescription" ("appointment_id");
CREATE INDEX IF NOT EXISTS "prescriptions_status_idx" ON "prescription" ("status");
CREATE INDEX IF NOT EXISTS "prescription_items_prescription_id_idx" ON "prescription_item" ("prescription_id");
