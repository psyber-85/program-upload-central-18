ALTER TABLE public.ih_finance_snapshots
  ADD COLUMN IF NOT EXISTS opening_balance         numeric,
  ADD COLUMN IF NOT EXISTS closing_balance         numeric,
  ADD COLUMN IF NOT EXISTS payroll_total           numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS claims_total            numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS training_claims_total   numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS epf_socso_total         numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS manual_adjustment_total numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS notes                   text;