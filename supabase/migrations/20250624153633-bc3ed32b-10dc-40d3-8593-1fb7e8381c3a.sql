
-- Phase 1: Clean up programs table and fix UUID issues
-- First, let's see what's currently in the programs table
SELECT id, title FROM programs ORDER BY title;

-- Delete any programs that have UUID-like titles (these are incorrect entries)
DELETE FROM programs 
WHERE title ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Ensure we have the correct masterclass programs
INSERT INTO programs (title) 
VALUES 
  ('Business Writing with AI: 2-Day Masterclass'),
  ('The AI-Ready Leader: Win the Future with Strategic Action'),
  ('ChatGPT Skill Boost (Intermediate)'),
  ('AI and ChatGPT for HR Professionals - 2 Day Masterclass')
ON CONFLICT (title) DO NOTHING;

-- Phase 2: Add status_reason column to prospects table
ALTER TABLE prospects 
ADD COLUMN IF NOT EXISTS status_reason TEXT;

-- Update any prospects that might have invalid program_id references
-- First, let's get a valid program ID to use as default
WITH valid_program AS (
  SELECT id FROM programs LIMIT 1
)
UPDATE prospects 
SET program_id = (SELECT id FROM valid_program)
WHERE program_id NOT IN (SELECT id FROM programs);

-- Phase 4: Update payment status data to have proper values
-- Set default payment status for existing records that are null or empty
UPDATE prospects 
SET payment_status = 'Pending'
WHERE payment_status IS NULL OR payment_status = '';

-- Update existing payment status values to be consistent
UPDATE prospects 
SET payment_status = CASE 
  WHEN LOWER(payment_status) LIKE '%hrdc%' THEN 'HRDC'
  WHEN LOWER(payment_status) LIKE '%individual%' THEN 'Individual'
  WHEN LOWER(payment_status) LIKE '%paid%' THEN 'Paid'
  WHEN LOWER(payment_status) LIKE '%pending%' THEN 'Pending'
  ELSE 'Pending'
END
WHERE payment_status IS NOT NULL;
