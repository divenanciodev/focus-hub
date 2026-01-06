import { createContext, useContext, useState, ReactNode } from 'react';
import { Discipline, StudyPlan } from '@/types';
import { mockDisciplines } from '@/data/mockData';

interface DisciplinesContextType {
  disciplines: Discipline[];
  addDiscipline: (data: {
    name: string;
    subject: string;
    specificSubject: string;
    grade: string;
    tags: string[];
    color: string;
    studyPlan: StudyPlan;
  }) => void;
  updateDiscipline: (id: string, data: Partial<Discipline>) => void;
  deleteDiscipline: (id: string) => void;
  getDiscipline: (id: string) => Discipline | undefined;
}

const DisciplinesContext = createContext<DisciplinesContextType | undefined>(undefined);

export function DisciplinesProvider({ children }: { children: ReactNode }) {
  const [disciplines, setDisciplines] = useState<Discipline[]>(mockDisciplines);

  const addDiscipline = (data: {
    name: string;
    subject: string;
    specificSubject: string;
    grade: string;
    tags: string[];
    color: string;
    studyPlan: StudyPlan;
  }) => {
    const newDiscipline: Discipline = {
      id: Date.now().toString(),
      name: data.name,
      subject: data.subject,
      specificSubject: data.specificSubject,
      grade: data.grade,
      progress: 0,
      hoursStudied: 0,
      createdAt: new Date(),
      tags: data.tags,
      color: data.color,
      studyPlan: data.studyPlan,
    };
    setDisciplines(prev => [newDiscipline, ...prev]);
  };

  const updateDiscipline = (id: string, data: Partial<Discipline>) => {
    setDisciplines(prev => 
      prev.map(d => d.id === id ? { ...d, ...data } : d)
    );
  };

  const deleteDiscipline = (id: string) => {
    setDisciplines(prev => prev.filter(d => d.id !== id));
  };

  const getDiscipline = (id: string) => {
    return disciplines.find(d => d.id === id);
  };

  return (
    <DisciplinesContext.Provider value={{ 
      disciplines, 
      addDiscipline, 
      updateDiscipline, 
      deleteDiscipline,
      getDiscipline 
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
