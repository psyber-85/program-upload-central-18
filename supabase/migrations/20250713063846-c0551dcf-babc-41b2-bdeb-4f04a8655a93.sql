
-- First, let's update prospects.program_id to reference registration_programs based on product_type
UPDATE prospects 
SET program_id = rp.id 
FROM registration_programs rp 
WHERE prospects.product_type = rp.title 
AND prospects.program_id IS NOT NULL;

-- Handle cases where product_type doesn't match any registration_programs
-- Set program_id to NULL for orphaned records (they'll need manual review)
UPDATE prospects 
SET program_id = NULL 
WHERE product_type IS NOT NULL 
AND product_type NOT IN (SELECT title FROM registration_programs);

-- For prospects with NULL product_type, also set program_id to NULL
UPDATE prospects 
SET program_id = NULL 
WHERE product_type IS NULL;
