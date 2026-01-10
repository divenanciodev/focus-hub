export interface ContestTopic {
  name: string;
  subtopics: string[];
}

export interface ContestMateria {
  name: string;
  topics: ContestTopic[];
}

export interface EvaluationCriteriaItem {
  id: string;
  content: string;
  questions: number;
  weight: number;
  totalPoints: number;
}

export interface EvaluationCriteria {
  level: string; // Ex: "Nível Médio", "Nível Superior"
  description?: string;
  items: EvaluationCriteriaItem[];
  totalQuestions: number;
  totalPoints: number;
}

export interface Contest {
  id: string;
  name: string;
  position: string;
  institution: string;
  examDate: Date | null;
  status: 'active' | 'completed' | 'cancelled';
  progress?: number;
  // New fields
  bancaUrl?: string;
  editalUrl?: string;
  isPreparingOnly: boolean;
  situacao?: string;
  cargos?: string;
  escolaridade?: string;
  carreiras?: string;
  lotacao?: string;
  vagas?: string;
  remuneracao?: string;
  inscricoesPeriodo?: string;
  taxaInscricao?: string;
  materias: ContestMateria[];
  evaluationCriteria: EvaluationCriteria[];
}
