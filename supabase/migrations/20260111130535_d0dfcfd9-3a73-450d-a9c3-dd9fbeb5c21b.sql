-- Tabela de Idiomas
CREATE TABLE public.languages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '🌐',
  category TEXT,
  objective TEXT,
  color TEXT DEFAULT '#000000',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Níveis
CREATE TABLE public.language_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  language_id UUID NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  user_id UUID,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Seções
CREATE TABLE public.language_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  level_id UUID NOT NULL REFERENCES public.language_levels(id) ON DELETE CASCADE,
  user_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Estruturas (Lições)
CREATE TABLE public.language_structures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID NOT NULL REFERENCES public.language_sections(id) ON DELETE CASCADE,
  user_id UUID,
  name TEXT NOT NULL,
  audio_url TEXT,
  progress TEXT DEFAULT 'not_started',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Conteúdos das Estruturas
CREATE TABLE public.language_contents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  structure_id UUID NOT NULL REFERENCES public.language_structures(id) ON DELETE CASCADE,
  user_id UUID,
  content_type TEXT NOT NULL,
  content TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.language_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.language_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.language_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.language_contents ENABLE ROW LEVEL SECURITY;

-- Policies for languages
CREATE POLICY "Anyone can read languages" ON public.languages FOR SELECT USING (true);
CREATE POLICY "Anyone can insert languages" ON public.languages FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update languages" ON public.languages FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete languages" ON public.languages FOR DELETE USING (true);

-- Policies for language_levels
CREATE POLICY "Anyone can read language_levels" ON public.language_levels FOR SELECT USING (true);
CREATE POLICY "Anyone can insert language_levels" ON public.language_levels FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update language_levels" ON public.language_levels FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete language_levels" ON public.language_levels FOR DELETE USING (true);

-- Policies for language_sections
CREATE POLICY "Anyone can read language_sections" ON public.language_sections FOR SELECT USING (true);
CREATE POLICY "Anyone can insert language_sections" ON public.language_sections FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update language_sections" ON public.language_sections FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete language_sections" ON public.language_sections FOR DELETE USING (true);

-- Policies for language_structures
CREATE POLICY "Anyone can read language_structures" ON public.language_structures FOR SELECT USING (true);
CREATE POLICY "Anyone can insert language_structures" ON public.language_structures FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update language_structures" ON public.language_structures FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete language_structures" ON public.language_structures FOR DELETE USING (true);

-- Policies for language_contents
CREATE POLICY "Anyone can read language_contents" ON public.language_contents FOR SELECT USING (true);
CREATE POLICY "Anyone can insert language_contents" ON public.language_contents FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update language_contents" ON public.language_contents FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete language_contents" ON public.language_contents FOR DELETE USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_languages_updated_at BEFORE UPDATE ON public.languages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_language_levels_updated_at BEFORE UPDATE ON public.language_levels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_language_sections_updated_at BEFORE UPDATE ON public.language_sections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_language_structures_updated_at BEFORE UPDATE ON public.language_structures FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_language_contents_updated_at BEFORE UPDATE ON public.language_contents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();