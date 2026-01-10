-- Add evaluation_criteria column to contests table
ALTER TABLE public.contests
ADD COLUMN evaluation_criteria jsonb DEFAULT '[]'::jsonb;