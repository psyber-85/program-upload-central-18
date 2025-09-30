-- Add prospect_score column to prospects table
ALTER TABLE prospects 
ADD COLUMN prospect_score TEXT DEFAULT 'C' CHECK (prospect_score IN ('A', 'B', 'C', 'D', 'E'));

-- Add index for better query performance
CREATE INDEX idx_prospects_score ON prospects(prospect_score);

-- Add comment for documentation
COMMENT ON COLUMN prospects.prospect_score IS 'Lead score rating from A (highest) to E (lowest)';