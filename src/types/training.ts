// Types for the Training module

export type TrainingType = 
  | 'flashcards'
  | 'simulado'
  | 'activity'
  | 'mindmap'
  | 'summary'
  | 'handwriting'
  | 'memory-palace'
  | 'audio-explanation';

export type FlashcardDifficulty = 'easy' | 'medium' | 'hard';
export type FlashcardType = 'direct' | 'true-false' | 'fill-blank' | 'concept-definition';

export interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  type: FlashcardType;
  difficulty?: FlashcardDifficulty;
  userDifficulty?: FlashcardDifficulty;
}

export interface FlashcardDeck {
  id: string;
  name: string;
  discipline: string;
  subject: string;
  cards: FlashcardItem[];
  createdAt: Date;
  lastStudied?: Date;
  totalReviews: number;
}

export interface SimuladoQuestion {
  id: string;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string | number;
  userAnswer?: string | number;
  isCorrect?: boolean;
}

export interface Simulado {
  id: string;
  name: string;
  discipline: string;
  subject: string;
  questions: SimuladoQuestion[];
  timeMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'pending' | 'in_progress' | 'completed';
  score?: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface CustomActivity {
  id: string;
  name: string;
  type: 'exercise-list' | 'active-reading' | 'guided-study' | 'spaced-review';
  discipline?: string;
  objective: string;
  timeMinutes: number;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

export interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  parentId?: string;
}

export interface MindMap {
  id: string;
  name: string;
  discipline?: string;
  nodes: MindMapNode[];
  createdAt: Date;
}

export interface GuidedSummary {
  id: string;
  title: string;
  discipline?: string;
  content: string;
  maxLines: number;
  maxChars: number;
  completed: boolean;
  createdAt: Date;
}

export interface HandwritingEntry {
  id: string;
  imageUrl: string;
  discipline?: string;
  subject?: string;
  studyTimeMinutes: number;
  completed: boolean;
  createdAt: Date;
}

export interface MemoryPalaceRoom {
  id: string;
  name: string;
  items: MemoryPalaceItem[];
}

export interface MemoryPalaceItem {
  id: string;
  icon: string;
  label: string;
  mnemonic: string;
  x: number;
  y: number;
}

export interface MemoryPalace {
  id: string;
  name: string;
  environment: 'house' | 'bedroom' | 'office' | 'library' | 'garden';
  rooms: MemoryPalaceRoom[];
  createdAt: Date;
}

export interface AudioExplanation {
  id: string;
  topic: string;
  discipline?: string;
  audioUrl?: string;
  durationSeconds: number;
  evaluation?: {
    clarity: number;
    coherence: number;
    coverage: number;
  };
  createdAt: Date;
}

export interface TrainingMetrics {
  totalTrainings: number;
  totalStudyTimeMinutes: number;
  byType: Record<TrainingType, number>;
  completedToday: number;
}
