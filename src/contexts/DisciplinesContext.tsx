import { createContext, useContext, ReactNode } from 'react';
import { useDisciplines as useDisciplinesHook, Discipline } from '@/hooks/useDisciplines';

interface DisciplinesContextType {
  disciplines: Discipline[];
  loading: boolean;
  addDiscipline: (data: {
    name: string;
    subject: string;
    specificSubject?: string;
    grade?: string;
    tags: string[];
    color: string;
    studyPlan?: Discipline['studyPlan'];
    coverImage?: string;
    subtopics?: string[];
  }) => Promise<Discipline | null>;
  updateDiscipline: (id: string, data: Partial<Discipline>) => Promise<boolean>;
  deleteDiscipline: (id: string) => Promise<boolean>;
  getDiscipline: (id: string) => Discipline | undefined;
  refetch: () => Promise<void>;
}

const DisciplinesContext = createContext<DisciplinesContextType | undefined>(undefined);

export function DisciplinesProvider({ children }: { children: ReactNode }) {
  const {
    disciplines,
    loading,
    addDiscipline,
    updateDiscipline,
    deleteDiscipline,
    getDiscipline,
    refetch,
  } = useDisciplinesHook();

  return (
    <DisciplinesContext.Provider value={{ 
      disciplines, 
      loading,
      addDiscipline, 
      updateDiscipline, 
      deleteDiscipline,
      getDiscipline,
      refetch,
    }}>
      {children}
    </DisciplinesContext.Provider>
  );
}

export function useDisciplines() {
  const context = useContext(DisciplinesContext);
  if (!context) {
    throw new Error('useDisciplines must be used within a DisciplinesProvider');
  }
  return context;
}

// Re-export the Discipline type for convenience
export type { Discipline } from '@/hooks/useDisciplines';
