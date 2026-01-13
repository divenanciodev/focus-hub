-- Drop the existing check constraint
ALTER TABLE public.grammar_structures DROP CONSTRAINT IF EXISTS grammar_structures_expected_input_check;

-- Add the updated check constraint with 'phrase' included
ALTER TABLE public.grammar_structures ADD CONSTRAINT grammar_structures_expected_input_check 
CHECK (expected_input IN ('verb', 'noun', 'adjective', 'adverb', 'verb-ing', 'past participle', 'sentence', 'phrase', 'any'));