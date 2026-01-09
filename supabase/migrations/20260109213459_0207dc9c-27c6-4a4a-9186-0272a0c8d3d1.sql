-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- DISCIPLINES TABLE
-- =====================
CREATE TABLE public.disciplines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  specific_subject TEXT,
  grade TEXT,
  progress INTEGER DEFAULT 0,
  hours_studied NUMERIC(10,2) DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  color TEXT,
  cover_image TEXT,
  study_plan JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.disciplines ENABLE ROW LEVEL SECURITY;

-- RLS Policies for disciplines (public access for now since no auth)
CREATE POLICY "Anyone can read disciplines" ON public.disciplines FOR SELECT USING (true);
CREATE POLICY "Anyone can insert disciplines" ON public.disciplines FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update disciplines" ON public.disciplines FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete disciplines" ON public.disciplines FOR DELETE USING (true);

-- =====================
-- OBJECTIVES TABLE
-- =====================
CREATE TABLE public.objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  requires_money BOOLEAN DEFAULT false,
  estimated_cost NUMERIC(10,2),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  steps JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.objectives ENABLE ROW LEVEL SECURITY;

-- RLS Policies for objectives
CREATE POLICY "Anyone can read objectives" ON public.objectives FOR SELECT USING (true);
CREATE POLICY "Anyone can insert objectives" ON public.objectives FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update objectives" ON public.objectives FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete objectives" ON public.objectives FOR DELETE USING (true);

-- =====================
-- LINK BANK FOLDERS TABLE
-- =====================
CREATE TABLE public.link_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.link_folders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for link_folders
CREATE POLICY "Anyone can read link_folders" ON public.link_folders FOR SELECT USING (true);
CREATE POLICY "Anyone can insert link_folders" ON public.link_folders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update link_folders" ON public.link_folders FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete link_folders" ON public.link_folders FOR DELETE USING (true);

-- =====================
-- LINK BANK SUBFOLDERS TABLE
-- =====================
CREATE TABLE public.link_subfolders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id UUID REFERENCES public.link_folders(id) ON DELETE CASCADE,
  user_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.link_subfolders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for link_subfolders
CREATE POLICY "Anyone can read link_subfolders" ON public.link_subfolders FOR SELECT USING (true);
CREATE POLICY "Anyone can insert link_subfolders" ON public.link_subfolders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update link_subfolders" ON public.link_subfolders FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete link_subfolders" ON public.link_subfolders FOR DELETE USING (true);

-- =====================
-- LINK BANK LINKS TABLE
-- =====================
CREATE TABLE public.links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subfolder_id UUID REFERENCES public.link_subfolders(id) ON DELETE CASCADE,
  user_id UUID,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

-- RLS Policies for links
CREATE POLICY "Anyone can read links" ON public.links FOR SELECT USING (true);
CREATE POLICY "Anyone can insert links" ON public.links FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update links" ON public.links FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete links" ON public.links FOR DELETE USING (true);

-- =====================
-- FINANCIAL ENTRIES TABLE
-- =====================
CREATE TABLE public.financial_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  description TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  category TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.financial_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for financial_entries
CREATE POLICY "Anyone can read financial_entries" ON public.financial_entries FOR SELECT USING (true);
CREATE POLICY "Anyone can insert financial_entries" ON public.financial_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update financial_entries" ON public.financial_entries FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete financial_entries" ON public.financial_entries FOR DELETE USING (true);

-- =====================
-- PIGGY BANKS TABLE
-- =====================
CREATE TABLE public.piggy_banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  name TEXT NOT NULL,
  target_amount NUMERIC(10,2) NOT NULL,
  current_amount NUMERIC(10,2) DEFAULT 0,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.piggy_banks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for piggy_banks
CREATE POLICY "Anyone can read piggy_banks" ON public.piggy_banks FOR SELECT USING (true);
CREATE POLICY "Anyone can insert piggy_banks" ON public.piggy_banks FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update piggy_banks" ON public.piggy_banks FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete piggy_banks" ON public.piggy_banks FOR DELETE USING (true);

-- =====================
-- FIXED EXPENSES TABLE
-- =====================
CREATE TABLE public.fixed_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  name TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  due_day INTEGER CHECK (due_day >= 1 AND due_day <= 31),
  category TEXT,
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fixed_expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for fixed_expenses
CREATE POLICY "Anyone can read fixed_expenses" ON public.fixed_expenses FOR SELECT USING (true);
CREATE POLICY "Anyone can insert fixed_expenses" ON public.fixed_expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update fixed_expenses" ON public.fixed_expenses FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete fixed_expenses" ON public.fixed_expenses FOR DELETE USING (true);

-- =====================
-- FLASHCARD GROUPS TABLE
-- =====================
CREATE TABLE public.flashcard_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  name TEXT NOT NULL,
  cards JSONB DEFAULT '[]',
  last_studied TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.flashcard_groups ENABLE ROW LEVEL SECURITY;

-- RLS Policies for flashcard_groups
CREATE POLICY "Anyone can read flashcard_groups" ON public.flashcard_groups FOR SELECT USING (true);
CREATE POLICY "Anyone can insert flashcard_groups" ON public.flashcard_groups FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update flashcard_groups" ON public.flashcard_groups FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete flashcard_groups" ON public.flashcard_groups FOR DELETE USING (true);

-- =====================
-- SIMULADOS TABLE
-- =====================
CREATE TABLE public.simulados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  name TEXT NOT NULL,
  discipline TEXT,
  subject TEXT,
  questions JSONB DEFAULT '[]',
  time_minutes INTEGER,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.simulados ENABLE ROW LEVEL SECURITY;

-- RLS Policies for simulados
CREATE POLICY "Anyone can read simulados" ON public.simulados FOR SELECT USING (true);
CREATE POLICY "Anyone can insert simulados" ON public.simulados FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update simulados" ON public.simulados FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete simulados" ON public.simulados FOR DELETE USING (true);

-- =====================
-- COURSES TABLE
-- =====================
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  name TEXT NOT NULL,
  theme TEXT,
  workload INTEGER,
  deadline TIMESTAMP WITH TIME ZONE,
  progress INTEGER DEFAULT 0,
  platform TEXT,
  image_url TEXT,
  links JSONB DEFAULT '[]',
  curriculum JSONB DEFAULT '[]',
  is_from_bank BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for courses
CREATE POLICY "Anyone can read courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Anyone can insert courses" ON public.courses FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update courses" ON public.courses FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete courses" ON public.courses FOR DELETE USING (true);

-- =====================
-- CONTESTS TABLE
-- =====================
CREATE TABLE public.contests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  name TEXT NOT NULL,
  position TEXT,
  exam_date TIMESTAMP WITH TIME ZONE,
  institution TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contests
CREATE POLICY "Anyone can read contests" ON public.contests FOR SELECT USING (true);
CREATE POLICY "Anyone can insert contests" ON public.contests FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update contests" ON public.contests FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete contests" ON public.contests FOR DELETE USING (true);

-- =====================
-- USER SETTINGS TABLE
-- =====================
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE,
  theme TEXT DEFAULT 'dark',
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  sound_effects BOOLEAN DEFAULT true,
  auto_save BOOLEAN DEFAULT true,
  pomodoro_time INTEGER DEFAULT 25,
  language TEXT DEFAULT 'pt-BR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_settings
CREATE POLICY "Anyone can read user_settings" ON public.user_settings FOR SELECT USING (true);
CREATE POLICY "Anyone can insert user_settings" ON public.user_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update user_settings" ON public.user_settings FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete user_settings" ON public.user_settings FOR DELETE USING (true);

-- =====================
-- UPDATE TIMESTAMP TRIGGER
-- =====================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER update_disciplines_updated_at BEFORE UPDATE ON public.disciplines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_objectives_updated_at BEFORE UPDATE ON public.objectives FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_link_folders_updated_at BEFORE UPDATE ON public.link_folders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_link_subfolders_updated_at BEFORE UPDATE ON public.link_subfolders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_links_updated_at BEFORE UPDATE ON public.links FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_piggy_banks_updated_at BEFORE UPDATE ON public.piggy_banks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fixed_expenses_updated_at BEFORE UPDATE ON public.fixed_expenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_flashcard_groups_updated_at BEFORE UPDATE ON public.flashcard_groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_simulados_updated_at BEFORE UPDATE ON public.simulados FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contests_updated_at BEFORE UPDATE ON public.contests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();