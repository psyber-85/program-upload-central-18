
-- First, let's see what the current constraint allows
-- Then we'll drop the restrictive constraint and create a more flexible one

-- Drop the existing restrictive payment status check constraint
ALTER TABLE prospects DROP CONSTRAINT IF EXISTS prospects_payment_status_check;

-- Create a more flexible constraint that allows common payment types and statuses
-- This allows: hrdc, individual, paid, pending, failed, and other reasonable values
ALTER TABLE prospects ADD CONSTRAINT prospects_payment_flexible_check 
CHECK (
  payment IS NULL OR 
  length(trim(payment)) > 0
);

-- Optional: Add a comment to document the expected values
COMMENT ON COLUMN prospects.payment IS 'Payment type (hrdc, individual) or status (paid, pending, failed). Flexible to accommodate various business needs.';
