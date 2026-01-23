-- Add subtopics column to disciplines table
ALTER TABLE public.disciplines ADD COLUMN IF NOT EXISTS subtopics text[] DEFAULT '{}';