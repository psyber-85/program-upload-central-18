-- Create registration_rounds table
CREATE TABLE registration_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE registration_rounds ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Enable all operations for authenticated users" 
ON registration_rounds FOR ALL 
USING (true) 
WITH CHECK (true);

-- Add updated_at trigger
CREATE TRIGGER update_registration_rounds_updated_at
  BEFORE UPDATE ON registration_rounds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add round_id column to registration_programs (nullable first)
ALTER TABLE registration_programs 
ADD COLUMN round_id UUID REFERENCES registration_rounds(id);

-- Create default Q3 2025 round
INSERT INTO registration_rounds (name, description, status, start_date, end_date)
VALUES ('Q3 2025 Registration Round', 'Initial registration round containing existing programs', 'active', '2025-07-01', '2025-09-30');

-- Link all existing programs to Q3 2025 round
UPDATE registration_programs
SET round_id = (SELECT id FROM registration_rounds WHERE name = 'Q3 2025 Registration Round' LIMIT 1)
WHERE round_id IS NULL;

-- Now make round_id required for future entries
ALTER TABLE registration_programs 
ALTER COLUMN round_id SET NOT NULL;