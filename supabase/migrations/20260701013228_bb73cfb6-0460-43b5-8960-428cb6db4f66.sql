ALTER TABLE public.prospects
  ADD COLUMN IF NOT EXISTS row_color text
  CHECK (row_color IN ('red','amber','green','blue','purple'));