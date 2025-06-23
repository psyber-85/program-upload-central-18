
-- First, let's see what's currently in the programs table and clean it up
-- Remove any programs that look like UUIDs or are not the actual masterclass programs
DELETE FROM public.programs 
WHERE title ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
   OR length(title) = 36;

-- Ensure we have the proper masterclass programs (insert if they don't exist)
INSERT INTO public.programs (title) 
SELECT unnest(ARRAY[
  'AI for Business Leaders Masterclass',
  'AI for HR Professionals Masterclass', 
  'AI for Marketing Professionals Masterclass',
  'AI for Finance Professionals Masterclass'
])
WHERE NOT EXISTS (
  SELECT 1 FROM public.programs 
  WHERE title IN (
    'AI for Business Leaders Masterclass',
    'AI for HR Professionals Masterclass', 
    'AI for Marketing Professionals Masterclass',
    'AI for Finance Professionals Masterclass'
  )
);

-- Update any prospects that might be referencing old program entries
-- This will help ensure data consistency
UPDATE public.prospects 
SET program_id = (
  SELECT id FROM public.programs 
  WHERE title LIKE '%Business Leaders%'
  LIMIT 1
)
WHERE program_id NOT IN (SELECT id FROM public.programs);
