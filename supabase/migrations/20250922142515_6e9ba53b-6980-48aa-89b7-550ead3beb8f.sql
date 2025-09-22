-- Clean up duplicate entries in participants_bday_duplicate table
-- First, let's see how many duplicates we have
DO $$
BEGIN
    RAISE NOTICE 'Total records before cleanup: %', (SELECT COUNT(*) FROM participants_bday_duplicate);
    RAISE NOTICE 'Unique emails: %', (SELECT COUNT(DISTINCT email) FROM participants_bday_duplicate WHERE email IS NOT NULL);
END $$;

-- Remove duplicates, keeping only one record per email
-- We'll keep the record with the latest registered_at date for each email
DELETE FROM participants_bday_duplicate
WHERE id NOT IN (
    SELECT DISTINCT ON (email) id
    FROM participants_bday_duplicate
    WHERE email IS NOT NULL
    ORDER BY email, registered_at DESC
);

-- Also remove any records with NULL email as they can't receive emails anyway
DELETE FROM participants_bday_duplicate WHERE email IS NULL;

-- Reset last_birthday_sent_year to NULL for all remaining records
-- This ensures they can receive birthday emails again
UPDATE participants_bday_duplicate 
SET last_birthday_sent_year = NULL;

-- Add unique constraint on email to prevent future duplicates
ALTER TABLE participants_bday_duplicate 
ADD CONSTRAINT unique_email UNIQUE (email);

-- Show final stats
DO $$
BEGIN
    RAISE NOTICE 'Total records after cleanup: %', (SELECT COUNT(*) FROM participants_bday_duplicate);
    RAISE NOTICE 'Records with today birth_mmdd: %', (SELECT COUNT(*) FROM participants_bday_duplicate WHERE birth_mmdd = '09-22');
END $$;