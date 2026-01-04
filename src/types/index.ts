// Types for the PRODUTIVIDADE MÁXIMA system

export interface Discipline {
  id: string;
  name: string;
  subject: string;
  grade: string;
  progress: number;
  hoursStudied: number;
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
}

export interface StudyLink {
  id: string;
  title: string;
  type: 'youtube' | 'article' | 'pdf';
  url: string;
  note?: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

export interface Training {
  id: string;
  name: string;
  discipline: string;
  subject: string;
  questionCount: number;
  timeMinutes: number;
  status: 'pending' | 'in_progress' | 'completed';
  score?: number;
  createdAt: Date;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
}

export interface Contest {
  id: string;
  name: string;
  position: string;
  examDate: Date;
  institution: string;
  status: 'active' | 'completed';
}

export interface BankSimulado {
  id: string;
  title: string;
  area: string;
  banca: string;
  grade: string;
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Course {
  id: string;
  name: string;
  theme: string;
  workload: number;
  deadline: Date;
  progress: number;
  platform?: string;
  imageUrl?: string;
  links: StudyLink[];
  certificateUrl?: string;
}

export interface FinancialEntry {
  id: string;
  type: 'income' | 'expense' | 'purchase';
  description: string;
  amount: number;
  date: Date;
  category: string;
}

export interface Consortium {
  id: string;
  goal: string;
  totalAmount: number;
  installments: number;
  paidInstallments: number;
}

export interface Objective {
  id: string;
  title: string;
  description: string;
  steps: ObjectiveStep[];
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: Date;
}

export interface ObjectiveStep {
  id: string;
  title: string;
  completed: boolean;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  period: 'free' | 'monthly' | 'yearly';
  benefits: string[];
  popular?: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  currentPlan: Plan;
  totalProgress: number;
  studyHoursTotal: number;
  joinedAt: Date;
}
