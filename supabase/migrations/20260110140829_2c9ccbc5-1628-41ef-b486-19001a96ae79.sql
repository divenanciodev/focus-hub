-- Tabela de hábitos personalizáveis
CREATE TABLE public.habits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '✓',
  color TEXT DEFAULT '#000000',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de registros diários de hábitos
CREATE TABLE public.habit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(habit_id, date)
);

-- Enable RLS
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for habits
CREATE POLICY "Anyone can read habits" ON public.habits FOR SELECT USING (true);
CREATE POLICY "Anyone can insert habits" ON public.habits FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update habits" ON public.habits FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete habits" ON public.habits FOR DELETE USING (true);

-- RLS Policies for habit_logs
CREATE POLICY "Anyone can read habit_logs" ON public.habit_logs FOR SELECT USING (true);
CREATE POLICY "Anyone can insert habit_logs" ON public.habit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update habit_logs" ON public.habit_logs FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete habit_logs" ON public.habit_logs FOR DELETE USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_habits_updated_at
  BEFORE UPDATE ON public.habits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_habit_logs_updated_at
  BEFORE UPDATE ON public.habit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();