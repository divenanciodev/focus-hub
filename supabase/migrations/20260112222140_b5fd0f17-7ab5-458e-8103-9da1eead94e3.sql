-- Drop existing tables that will be replaced with new schema
DROP TABLE IF EXISTS language_practice_sessions CASCADE;
DROP TABLE IF EXISTS language_contents CASCADE;
DROP TABLE IF EXISTS language_vocabulary CASCADE;
DROP TABLE IF EXISTS language_structures CASCADE;
DROP TABLE IF EXISTS language_sections CASCADE;
DROP TABLE IF EXISTS language_levels CASCADE;

-- Create vocabulary_sets table (groups words by grammatical class or thematic set)
CREATE TABLE public.vocabulary_sets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  language_id UUID NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  set_type TEXT NOT NULL CHECK (set_type IN ('grammatical_class', 'thematic_set')),
  grammatical_class TEXT,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT '📚',
  sort_order INTEGER DEFAULT 0,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create vocabulary_words table (individual words within sets)
CREATE TABLE public.vocabulary_words (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  set_id UUID NOT NULL REFERENCES public.vocabulary_sets(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  translation TEXT,
  example TEXT,
  image_url TEXT,
  audio_url TEXT,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  mastery_level INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create grammar_structures table (patterns like "I wanna + verb")
CREATE TABLE public.grammar_structures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  language_id UUID NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  fixed_text TEXT NOT NULL,
  expected_input TEXT NOT NULL CHECK (expected_input IN ('verb', 'noun', 'adjective', 'adverb', 'verb-ing', 'sentence', 'any')),
  allowed_classes TEXT[] DEFAULT '{}',
  examples TEXT[] DEFAULT '{}',
  grammar_tip TEXT,
  translation TEXT,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  category TEXT,
  mastery_level INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create practice_sessions table for tracking progress
CREATE TABLE public.language_practice_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  language_id UUID NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  practice_type TEXT NOT NULL CHECK (practice_type IN ('vocabulary', 'structures', 'mixed')),
  exercise_type TEXT,
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create word_practice_stats for individual word tracking
CREATE TABLE public.word_practice_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  word_id UUID NOT NULL REFERENCES public.vocabulary_words(id) ON DELETE CASCADE,
  times_practiced INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  last_practiced_at TIMESTAMP WITH TIME ZONE,
  next_review_at TIMESTAMP WITH TIME ZONE,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create structure_practice_stats for individual structure tracking
CREATE TABLE public.structure_practice_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  structure_id UUID NOT NULL REFERENCES public.grammar_structures(id) ON DELETE CASCADE,
  times_practiced INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  last_practiced_at TIMESTAMP WITH TIME ZONE,
  next_review_at TIMESTAMP WITH TIME ZONE,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.vocabulary_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grammar_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.language_practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.word_practice_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.structure_practice_stats ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for vocabulary_sets
CREATE POLICY "Anyone can read vocabulary_sets" ON public.vocabulary_sets FOR SELECT USING (true);
CREATE POLICY "Anyone can insert vocabulary_sets" ON public.vocabulary_sets FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update vocabulary_sets" ON public.vocabulary_sets FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete vocabulary_sets" ON public.vocabulary_sets FOR DELETE USING (true);

-- Create permissive policies for vocabulary_words
CREATE POLICY "Anyone can read vocabulary_words" ON public.vocabulary_words FOR SELECT USING (true);
CREATE POLICY "Anyone can insert vocabulary_words" ON public.vocabulary_words FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update vocabulary_words" ON public.vocabulary_words FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete vocabulary_words" ON public.vocabulary_words FOR DELETE USING (true);

-- Create permissive policies for grammar_structures
CREATE POLICY "Anyone can read grammar_structures" ON public.grammar_structures FOR SELECT USING (true);
CREATE POLICY "Anyone can insert grammar_structures" ON public.grammar_structures FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update grammar_structures" ON public.grammar_structures FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete grammar_structures" ON public.grammar_structures FOR DELETE USING (true);

-- Create permissive policies for language_practice_sessions
CREATE POLICY "Anyone can read language_practice_sessions" ON public.language_practice_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert language_practice_sessions" ON public.language_practice_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update language_practice_sessions" ON public.language_practice_sessions FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete language_practice_sessions" ON public.language_practice_sessions FOR DELETE USING (true);

-- Create permissive policies for word_practice_stats
CREATE POLICY "Anyone can read word_practice_stats" ON public.word_practice_stats FOR SELECT USING (true);
CREATE POLICY "Anyone can insert word_practice_stats" ON public.word_practice_stats FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update word_practice_stats" ON public.word_practice_stats FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete word_practice_stats" ON public.word_practice_stats FOR DELETE USING (true);

-- Create permissive policies for structure_practice_stats
CREATE POLICY "Anyone can read structure_practice_stats" ON public.structure_practice_stats FOR SELECT USING (true);
CREATE POLICY "Anyone can insert structure_practice_stats" ON public.structure_practice_stats FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update structure_practice_stats" ON public.structure_practice_stats FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete structure_practice_stats" ON public.structure_practice_stats FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX idx_vocabulary_sets_language ON public.vocabulary_sets(language_id);
CREATE INDEX idx_vocabulary_words_set ON public.vocabulary_words(set_id);
CREATE INDEX idx_grammar_structures_language ON public.grammar_structures(language_id);
CREATE INDEX idx_practice_sessions_language ON public.language_practice_sessions(language_id);
CREATE INDEX idx_word_practice_stats_word ON public.word_practice_stats(word_id);
CREATE INDEX idx_structure_practice_stats_structure ON public.structure_practice_stats(structure_id);