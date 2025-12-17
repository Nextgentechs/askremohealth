-- Emergency Database Schema Fix
-- This script will force the database to match the current application schema

-- Step 1: Drop and recreate prescription_status enum
DROP TYPE IF EXISTS prescription_status CASCADE;
CREATE TYPE prescription_status AS ENUM ('active', 'dispensed', 'expired', 'cancelled');

-- Step 2: Ensure all required tables exist with correct structure
-- Create comment table with content field
CREATE TABLE IF NOT EXISTS comment (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    content text NOT NULL,
    desc text,
    user_id varchar NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    post_id uuid NOT NULL,
    parent_comment_id uuid,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp
);

-- Step 3: Rename old tables to new singular names if they exist
DO $$
BEGIN
    -- Rename admin_users to admin_user if exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users') THEN
        ALTER TABLE admin_users RENAME TO admin_user;
    END IF;
    
    -- Rename labs to lab if exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'labs') THEN
        ALTER TABLE labs RENAME TO lab;
    END IF;
    
    -- Rename lab_appointments to lab_appointment if exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lab_appointments') THEN
        ALTER TABLE lab_appointments RENAME TO lab_appointment;
    END IF;
    
    -- Rename lab_tests_available to lab_test_available if exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lab_tests_available') THEN
        ALTER TABLE lab_tests_available RENAME TO lab_test_available;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Table rename skipped: %', SQLERRM;
END $$;

-- Step 4: Fix lab table - rename user_id column and add location if needed
DO $$
BEGIN
    -- Check if lab table has old column name
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lab' AND column_name = 'user_id') THEN
        ALTER TABLE lab RENAME COLUMN user_id TO userId;
    END IF;
    
    -- Add location column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lab' AND column_name = 'location') THEN
        ALTER TABLE lab ADD COLUMN location jsonb;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Lab table fixes skipped: %', SQLERRM;
END $$;

-- Step 5: Fix lab_appointment table - rename columns
DO $$
BEGIN
    -- Rename place_id to lab_id
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lab_appointment' AND column_name = 'place_id') THEN
        ALTER TABLE lab_appointment RENAME COLUMN place_id TO lab_id;
    END IF;
    
    -- Rename appointment_date to scheduled_at
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lab_appointment' AND column_name = 'appointment_date') THEN
        ALTER TABLE lab_appointment RENAME COLUMN appointment_date TO scheduled_at;
    END IF;
    
    -- Rename patient_notes to notes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lab_appointment' AND column_name = 'patient_notes') THEN
        ALTER TABLE lab_appointment RENAME COLUMN patient_notes TO notes;
    END IF;
    
    -- Rename doctor_notes to notes if exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lab_appointment' AND column_name = 'doctor_notes') THEN
        ALTER TABLE lab_appointment RENAME COLUMN doctor_notes TO notes;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Lab appointment fixes skipped: %', SQLERRM;
END $$;

-- Step 6: Fix lab_availability table - rename columns
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lab_availability' AND column_name = 'lab_id') THEN
        -- Already correct, skip
        RAISE NOTICE 'lab_availability already has correct column names';
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lab_availability' AND column_name = 'place_id') THEN
        ALTER TABLE lab_availability RENAME COLUMN place_id TO lab_id;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lab_availability' AND column_name = 'day_of_week') THEN
        ALTER TABLE lab_availability RENAME COLUMN day_of_week TO dayOfWeek;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lab_availability' AND column_name = 'start_time') THEN
        ALTER TABLE lab_availability RENAME COLUMN start_time TO startTime;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lab_availability' AND column_name = 'end_time') THEN
        ALTER TABLE lab_availability RENAME COLUMN end_time TO endTime;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Lab availability fixes skipped: %', SQLERRM;
END $$;

-- Step 7: Fix lab_test_available table - rename columns and add missing ones
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lab_test_available' AND column_name = 'place_id') THEN
        ALTER TABLE lab_test_available RENAME COLUMN place_id TO lab_id;
    END IF;
    
    -- Change lab_id type to uuid if needed
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lab_test_available' AND column_name = 'lab_id' AND data_type != 'uuid') THEN
        ALTER TABLE lab_test_available ALTER COLUMN lab_id TYPE uuid USING lab_id::uuid;
    END IF;
    
    -- Add testName column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lab_test_available' AND column_name = 'testName') THEN
        ALTER TABLE lab_test_available ADD COLUMN testName varchar;
    END IF;
    
    -- Add price column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lab_test_available' AND column_name = 'price') THEN
        ALTER TABLE lab_test_available ADD COLUMN price integer;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Lab test available fixes skipped: %', SQLERRM;
END $$;

-- Step 8: Create prescription tables if they don't exist
CREATE TABLE IF NOT EXISTS prescription (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    appointment_id uuid NOT NULL,
    doctor_id varchar NOT NULL,
    patient_id varchar NOT NULL,
    diagnosis text,
    notes text,
    status prescription_status DEFAULT 'active' NOT NULL,
    valid_until timestamp,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS prescription_item (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    prescription_id uuid NOT NULL REFERENCES prescription(id) ON DELETE CASCADE,
    medication_name varchar NOT NULL,
    dosage varchar NOT NULL,
    frequency varchar NOT NULL,
    duration varchar NOT NULL,
    quantity integer,
    instructions text,
    created_at timestamp DEFAULT now() NOT NULL
);

-- Done!
SELECT 'Database schema forcefully updated!' as status;
