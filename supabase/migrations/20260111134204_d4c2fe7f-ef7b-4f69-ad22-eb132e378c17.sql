-- Add new columns to language_structures for pattern-based learning
ALTER TABLE public.language_structures 
ADD COLUMN pattern TEXT,
ADD COLUMN pattern_translation TEXT;

-- Create table for vocabulary words (verbs, nouns, etc.) linked to structures
CREATE TABLE public.language_vocabulary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  structure_id UUID NOT NULL REFERENCES public.language_structures(id) ON DELETE CASCADE,
  word_type TEXT NOT NULL, -- 'verb', 'noun', 'adjective', 'adverb', etc.
  word TEXT NOT NULL,
  translation TEXT,
  sort_order INTEGER DEFAULT 0,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.language_vocabulary ENABLE ROW LEVEL SECURITY;

-- RLS policies for vocabulary
CREATE POLICY "Users can view their own vocabulary" 
ON public.language_vocabulary FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create vocabulary" 
ON public.language_vocabulary FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own vocabulary" 
ON public.language_vocabulary FOR UPDATE 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own vocabulary" 
ON public.language_vocabulary FOR DELETE 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Trigger for updated_at
CREATE TRIGGER update_language_vocabulary_updated_at
BEFORE UPDATE ON public.language_vocabulary
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create table for practice sessions (to track progress)
CREATE TABLE public.language_practice_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  structure_id UUID NOT NULL REFERENCES public.language_structures(id) ON DELETE CASCADE,
  practice_type TEXT NOT NULL, -- 'flashcard' or 'fill_in'
  correct_answers INTEGER DEFAULT 0,
  total_answers INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.language_practice_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for practice sessions
CREATE POLICY "Users can view their own practice sessions" 
ON public.language_practice_sessions FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create practice sessions" 
ON public.language_practice_sessions FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own practice sessions" 
ON public.language_practice_sessions FOR UPDATE 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own practice sessions" 
ON public.language_practice_sessions FOR DELETE 
USING (auth.uid() = user_id OR user_id IS NULL);