-- Create entry allocations table to track where income money goes
CREATE TABLE public.entry_allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_id UUID NOT NULL REFERENCES public.financial_entries(id) ON DELETE CASCADE,
  destination_type TEXT NOT NULL, -- 'expense', 'piggy_bank', 'fixed_expense', 'other'
  destination_id UUID, -- Optional reference to piggy_bank or fixed_expense
  destination_name TEXT NOT NULL, -- Name for display (e.g., "Aluguel", "Cofrinho Viagem")
  amount NUMERIC NOT NULL,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.entry_allocations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can read entry_allocations" ON public.entry_allocations FOR SELECT USING (true);
CREATE POLICY "Anyone can insert entry_allocations" ON public.entry_allocations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update entry_allocations" ON public.entry_allocations FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete entry_allocations" ON public.entry_allocations FOR DELETE USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_entry_allocations_updated_at
  BEFORE UPDATE ON public.entry_allocations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();