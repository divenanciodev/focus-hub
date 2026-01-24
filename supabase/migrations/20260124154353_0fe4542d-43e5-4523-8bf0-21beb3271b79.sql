-- Create a new JSONB column for subtopics with relevance levels
ALTER TABLE public.disciplines 
ADD COLUMN subtopics_v2 JSONB DEFAULT '[]'::jsonb;

-- Create a function to migrate existing subtopics data
CREATE OR REPLACE FUNCTION migrate_subtopics_to_v2() RETURNS void AS $$
DECLARE
  rec RECORD;
  new_subtopics JSONB;
BEGIN
  FOR rec IN SELECT id, subtopics FROM public.disciplines WHERE subtopics IS NOT NULL LOOP
    SELECT COALESCE(
      jsonb_agg(jsonb_build_object('name', elem, 'relevance', 'medium')),
      '[]'::jsonb
    ) INTO new_subtopics
    FROM unnest(rec.subtopics) AS elem;
    
    UPDATE public.disciplines 
    SET subtopics_v2 = new_subtopics 
    WHERE id = rec.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run the migration function
SELECT migrate_subtopics_to_v2();

-- Drop the old column and rename the new one
ALTER TABLE public.disciplines DROP COLUMN subtopics;
ALTER TABLE public.disciplines RENAME COLUMN subtopics_v2 TO subtopics;

-- Clean up the migration function
DROP FUNCTION migrate_subtopics_to_v2();

-- Add a comment to document the structure
COMMENT ON COLUMN public.disciplines.subtopics IS 'Array of subtopics with relevance levels: [{name: string, relevance: "low"|"medium"|"high"|"very_high"}]';