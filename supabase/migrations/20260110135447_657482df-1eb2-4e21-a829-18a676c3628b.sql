-- Create schedules table for study schedules
CREATE TABLE public.schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NULL,
  name TEXT NOT NULL,
  objective TEXT NULL,
  hours_per_day INTEGER NULL DEFAULT 6,
  start_time TEXT NULL DEFAULT '06:00',
  end_time TEXT NULL DEFAULT '22:00',
  block_duration INTEGER NULL DEFAULT 60,
  rest_duration INTEGER NULL DEFAULT 10,
  blocks JSONB NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (matching other tables pattern)
CREATE POLICY "Anyone can read schedules" 
ON public.schedules 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert schedules" 
ON public.schedules 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update schedules" 
ON public.schedules 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete schedules" 
ON public.schedules 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_schedules_updated_at
BEFORE UPDATE ON public.schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();