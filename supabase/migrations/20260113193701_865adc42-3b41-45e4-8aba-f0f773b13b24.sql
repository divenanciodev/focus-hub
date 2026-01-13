-- Create table for grammar structure sets
CREATE TABLE public.grammar_structure_sets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  language_id UUID NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#8b5cf6',
  icon TEXT DEFAULT '📝',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add set_id to grammar_structures table
ALTER TABLE public.grammar_structures 
ADD COLUMN set_id UUID REFERENCES public.grammar_structure_sets(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.grammar_structure_sets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for grammar_structure_sets
CREATE POLICY "Users can view their own grammar structure sets" 
ON public.grammar_structure_sets 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own grammar structure sets" 
ON public.grammar_structure_sets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own grammar structure sets" 
ON public.grammar_structure_sets 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own grammar structure sets" 
ON public.grammar_structure_sets 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_grammar_structure_sets_updated_at
BEFORE UPDATE ON public.grammar_structure_sets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();