-- About.tsx already reads/writes `about_headline` on store_settings; the
-- previous reconciliation migration missed this column.
ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS about_headline TEXT;
