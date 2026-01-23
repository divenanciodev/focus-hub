-- Add new columns for study types and metrics
ALTER TABLE public.course_study_sessions 
ADD COLUMN IF NOT EXISTS curriculum_item_id TEXT,
ADD COLUMN IF NOT EXISTS curriculum_item_title TEXT,
ADD COLUMN IF NOT EXISTS study_type TEXT DEFAULT 'resumo',
ADD COLUMN IF NOT EXISTS questions_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reading_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS exercise_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS summary_minutes INTEGER DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN public.course_study_sessions.study_type IS 'Type of study: resumo, exercicios, leitura';
COMMENT ON COLUMN public.course_study_sessions.questions_count IS 'Number of questions completed (for exercicios type)';
COMMENT ON COLUMN public.course_study_sessions.reading_minutes IS 'Time spent reading (for leitura type)';
COMMENT ON COLUMN public.course_study_sessions.exercise_minutes IS 'Time spent on exercises (for exercicios type)';
COMMENT ON COLUMN public.course_study_sessions.summary_minutes IS 'Time spent on summary (for resumo type)';