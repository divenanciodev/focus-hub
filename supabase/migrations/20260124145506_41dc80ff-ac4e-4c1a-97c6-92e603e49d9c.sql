-- Create table for tracking studied subtopics and spaced repetition reviews
CREATE TABLE public.study_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  discipline_id UUID NOT NULL REFERENCES public.disciplines(id) ON DELETE CASCADE,
  subtopic TEXT NOT NULL,
  studied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Spaced repetition intervals: 1 day, 3 days, 7 days, 15 days
  review_1_due TIMESTAMP WITH TIME ZONE NOT NULL,
  review_1_completed TIMESTAMP WITH TIME ZONE,
  review_3_due TIMESTAMP WITH TIME ZONE NOT NULL,
  review_3_completed TIMESTAMP WITH TIME ZONE,
  review_7_due TIMESTAMP WITH TIME ZONE NOT NULL,
  review_7_completed TIMESTAMP WITH TIME ZONE,
  review_15_due TIMESTAMP WITH TIME ZONE NOT NULL,
  review_15_completed TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.study_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own study reviews" 
ON public.study_reviews 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own study reviews" 
ON public.study_reviews 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study reviews" 
ON public.study_reviews 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study reviews" 
ON public.study_reviews 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_study_reviews_user_discipline ON public.study_reviews(user_id, discipline_id);
CREATE INDEX idx_study_reviews_pending ON public.study_reviews(user_id, review_1_due, review_3_due, review_7_due, review_15_due);