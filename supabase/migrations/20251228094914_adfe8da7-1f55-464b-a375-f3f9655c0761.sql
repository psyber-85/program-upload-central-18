-- Add total_work_days to sp_payroll_runs
ALTER TABLE sp_payroll_runs 
ADD COLUMN total_work_days integer DEFAULT 22;

-- Add days_worked, total_days, and original_salary to sp_payroll_items
ALTER TABLE sp_payroll_items 
ADD COLUMN days_worked integer,
ADD COLUMN total_days integer,
ADD COLUMN original_salary numeric DEFAULT 0;