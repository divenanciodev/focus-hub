-- Add new fields to contests table for expanded contest management
ALTER TABLE public.contests
ADD COLUMN IF NOT EXISTS banca_url text,
ADD COLUMN IF NOT EXISTS edital_url text,
ADD COLUMN IF NOT EXISTS is_preparing_only boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS situacao text,
ADD COLUMN IF NOT EXISTS cargos text,
ADD COLUMN IF NOT EXISTS escolaridade text,
ADD COLUMN IF NOT EXISTS carreiras text,
ADD COLUMN IF NOT EXISTS lotacao text,
ADD COLUMN IF NOT EXISTS vagas text,
ADD COLUMN IF NOT EXISTS remuneracao text,
ADD COLUMN IF NOT EXISTS inscricoes_periodo text,
ADD COLUMN IF NOT EXISTS taxa_inscricao text,
ADD COLUMN IF NOT EXISTS materias jsonb DEFAULT '[]'::jsonb;

-- materias will store an array of subjects with topics and subtopics:
-- [{ name: "Conhecimentos Específicos", topics: [{ name: "Tópico 1", subtopics: ["Sub 1", "Sub 2"] }] }]