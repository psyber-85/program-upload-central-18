
-- Add product_id column to prospects table to store the short ID from CSV uploads
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS product_id TEXT;

-- Create index for better performance on product_id lookups
CREATE INDEX IF NOT EXISTS idx_prospects_product_id ON prospects(product_id);

-- Update existing prospects to have a default product_id based on their program
UPDATE prospects 
SET product_id = CASE 
  WHEN product_type LIKE '%Business Writing%' THEN 'business-writing-ai'
  WHEN product_type LIKE '%AI-Ready Leader%' THEN 'ai-ready-leader'
  WHEN product_type LIKE '%ChatGPT Skill Boost%' THEN 'chatgpt-skill-boost'
  WHEN product_type LIKE '%AI and ChatGPT for HR%' THEN 'ai-chatgpt-hr'
  ELSE 'business-writing-ai'
END
WHERE product_id IS NULL;
