
-- Create a separate programs table for registration tracker
CREATE TABLE IF NOT EXISTS registration_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  product_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert the 4 specific programs for registration tracker
INSERT INTO registration_programs (title, product_id) VALUES
('Business Writing with AI: 2-Day Masterclass', 'business-writing-ai'),
('The AI-Ready Leader: Win the Future with Strategic Action', 'ai-ready-leader'),
('ChatGPT Skill Boost (Intermediate)', 'chatgpt-skill-boost'),
('AI and ChatGPT for HR Professionals - 2 Day Masterclass', 'ai-chatgpt-hr')
ON CONFLICT DO NOTHING;

-- Update prospects table to reference registration_programs instead of programs
ALTER TABLE prospects DROP CONSTRAINT IF EXISTS prospects_program_id_fkey;
ALTER TABLE prospects ADD CONSTRAINT prospects_program_id_fkey 
  FOREIGN KEY (program_id) REFERENCES registration_programs(id);

-- Update existing prospects to use the new registration_programs
UPDATE prospects 
SET program_id = (
  SELECT rp.id 
  FROM registration_programs rp 
  WHERE rp.product_id = prospects.product_id
)
WHERE EXISTS (
  SELECT 1 
  FROM registration_programs rp 
  WHERE rp.product_id = prospects.product_id
);
