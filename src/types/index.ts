// Types for the PRODUTIVIDADE MÁXIMA system

export interface Discipline {
  id: string;
  name: string;
  subject: string;
  specificSubject?: string; // Área específica (ex: Gramática)
  grade?: string;
  progress: number;
  hoursStudied: number;
  createdAt: Date;
  tags?: string[];
  color?: string;
  studyPlan?: StudyPlan;
  coverImage?: string; // URL da imagem de capa (base64 ou URL)
  subtopics?: string[]; // Subtópicos do conteúdo
}

export interface StudyPlan {
  days: string[]; // ['monday', 'tuesday', ...]
  hoursPerDay: number;
  blockDuration?: number; // minutes
  startTime?: string;
  preferredMethod?: string;
}

export interface VideoLink {
  id: string;
  url: string;
  title: string;
  thumbnail?: string;
  status: 'not_started' | 'in_progress' | 'completed';
  notes: string;
}

export interface Summary {
  id: string;
  title: string;
  content: string;
  audioUrl?: string;
  createdAt: Date;
  isVoice: boolean;
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
  progress?: number;
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

export interface CurriculumItem {
  id: string;
  title: string;
  completed: boolean;
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
  curriculum: CurriculumItem[];
}

export interface FinancialEntry {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  date: Date;
  category: string;
}

export interface InstallmentPayment {
  id: string;
  date: Date;
  amount: number;
  notes?: string;
}

export interface Receivable {
  id: string;
  personName: string;
  description: string;
  totalAmount: number;
  installments: number | null; // null = indefinido
  paidInstallments: number;
  createdAt: Date;
  dueDate?: Date;
  recurringDay?: number; // dia do mês (1-31) para pagamentos recorrentes
  notes?: string; // observações adicionais
  receipts?: string[]; // URLs dos comprovantes
  paymentHistory?: InstallmentPayment[]; // histórico de pagamentos
}

export interface PiggyBank {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  color: string;
}

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  dueDay: number;
  category: string;
  notificationsEnabled: boolean;
}

export interface PurchaseGoal {
  id: string;
  name: string;
  description?: string;
  targetAmount: number;
  savedAmount: number;
  imageUrl?: string;
  storeLink?: string;
  priority: 'low' | 'medium' | 'high';
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
  requiresMoney: boolean;
  estimatedCost?: number;
  priority: 'low' | 'medium' | 'high';
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
