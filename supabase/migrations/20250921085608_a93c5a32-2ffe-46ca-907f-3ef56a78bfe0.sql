-- Create index on birth_mmdd for ultra-fast daily birthday queries
CREATE INDEX IF NOT EXISTS idx_participants_bday_duplicate_birth_mmdd 
ON public.participants_bday_duplicate (birth_mmdd);

-- Create index on extract(month from birth_date) for efficient monthly stats
CREATE INDEX IF NOT EXISTS idx_participants_bday_duplicate_birth_month 
ON public.participants_bday_duplicate (EXTRACT(month FROM birth_date));

-- Create index on last_birthday_sent_year for efficient pending queries
CREATE INDEX IF NOT EXISTS idx_participants_bday_duplicate_last_sent_year 
ON public.participants_bday_duplicate (last_birthday_sent_year);