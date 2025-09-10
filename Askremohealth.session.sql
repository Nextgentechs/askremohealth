
-- 1. Remove the columns you don't need
ALTER TABLE test
DROP COLUMN icon,
DROP COLUMN updated_at;

-- 2. Add the new columns
ALTER TABLE test
ADD COLUMN loinc_test_id VARCHAR(20),
ADD COLUMN general_category VARCHAR(30),
ADD COLUMN specific_category VARCHAR(50),
ADD COLUMN sample_type VARCHAR(50);
