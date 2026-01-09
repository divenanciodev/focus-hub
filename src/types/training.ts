// Types for the Training module

export type TrainingType = 
  | 'flashcards'
  | 'simulado'
  | 'activity'
  | 'mindmap'
  | 'summary'
  | 'handwriting'
  | 'audio-explanation';

export type FlashcardDifficulty = 'easy' | 'medium' | 'hard';

// Advanced flashcard types
export type FlashcardType = 
  | 'direct'                   // Pergunta direta
  | 'true-false'               // Verdadeiro ou falso
  | 'fill-blank'               // Completar lacuna
  | 'concept-definition'       // Conceito → Definição
  | 'multiple-choice'          // Múltipla escolha
  | 'association'              // Associação (arrastar conceitos)
  | 'ordering'                 // Ordem correta (sequência)
  | 'contextual'               // Pergunta contextual
  | 'visual'                   // Flashcard visual (imagem → conceito)
  | 'reversible';              // Flashcard reversível automático

// Content level for adaptive difficulty
export type ContentLevel = 'basic' | 'intermediate' | 'advanced';

// Rich content structure for flashcards
export interface FlashcardContent {
  title?: string;              // Título em negrito
  subtitle?: string;           // Subtítulo opcional
  mainText: string;            // Conteúdo principal
  bulletPoints?: string[];     // Lista estruturada
  imageUrl?: string;           // Imagem (upload ou gerada)
  example?: string;            // Campo de exemplo prático
  hint?: string;               // Dica (hint)
  note?: string;               // Observação complementar
  highlightedTerms?: string[]; // Termos destacados
}

// Multiple choice option
export interface MultipleChoiceOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

// Association pair for matching exercises
export interface AssociationPair {
  id: string;
  left: string;
  right: string;
}

// Ordering item
export interface OrderingItem {
  id: string;
  text: string;
  correctPosition: number;
}

export interface FlashcardItem {
  id: string;
  front: string | FlashcardContent;
  back: string | FlashcardContent;
  type: FlashcardType;
  difficulty?: FlashcardDifficulty;
  userDifficulty?: FlashcardDifficulty;
  
  // Type-specific data
  multipleChoiceOptions?: MultipleChoiceOption[];
  associationPairs?: AssociationPair[];
  orderingItems?: OrderingItem[];
  trueFalseAnswer?: boolean;
  trueFalseExplanation?: string;
  contextText?: string;         // Original text for contextual questions
  
  // Metadata
  tags?: string[];
  createdAt?: Date;
  lastReviewed?: Date;
  reviewCount?: number;
  correctCount?: number;
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
  level?: ContentLevel;
  description?: string;
  coverImage?: string;
}

// Study session tracking
export interface FlashcardStudySession {
  id: string;
  deckId: string;
  startedAt: Date;
  completedAt?: Date;
  cardsStudied: number;
  results: {
    cardId: string;
    difficulty: FlashcardDifficulty;
    timeSpentMs: number;
    isCorrect?: boolean;
  }[];
}

// Spaced repetition data
export interface SpacedRepetitionData {
  cardId: string;
  nextReviewDate: Date;
  interval: number;      // Days until next review
  easeFactor: number;    // Multiplier for interval
  repetitions: number;   // Number of successful reviews
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

// New: Saved Mind Map (uploaded file)
export type SavedMindMapFileType = 'image' | 'pdf';

export interface SavedMindMap {
  id: string;
  title: string;
  fileType: SavedMindMapFileType;
  fileUrl: string;
  fileName: string;
  createdAt: Date;
}

// Saved Summary (uploaded file - same pattern as SavedMindMap)
export interface SavedSummary {
  id: string;
  title: string;
  fileType: 'image' | 'pdf';
  fileUrl: string;
  fileName: string;
  createdAt: Date;
}

// Saved Handwriting (uploaded file - same pattern as SavedMindMap)
export interface SavedHandwriting {
  id: string;
  title: string;
  fileType: 'image' | 'pdf';
  fileUrl: string;
  fileName: string;
  createdAt: Date;
}

// Saved Audio Explanation (recorded audio)
export interface SavedAudioExplanation {
  id: string;
  title: string;
  audioUrl: string;
  durationSeconds: number;
  createdAt: Date;
}

export interface TrainingMetrics {
  totalTrainings: number;
  totalStudyTimeMinutes: number;
  byType: Record<TrainingType, number>;
  completedToday: number;
}

// Question generation templates for AI
export interface QuestionTemplate {
  type: FlashcardType;
  level: ContentLevel;
  templates: string[];
}

// Available question templates by level
export const QUESTION_TEMPLATES: QuestionTemplate[] = [
  // Basic level
  { type: 'direct', level: 'basic', templates: [
    'O que é {concept}?',
    'Defina {concept}.',
    'Qual a função de {concept}?',
    'Para que serve {concept}?',
  ]},
  { type: 'true-false', level: 'basic', templates: [
    '{statement}',
    '{concept} é {definition}.',
  ]},
  
  // Intermediate level
  { type: 'direct', level: 'intermediate', templates: [
    'Explique a diferença entre {concept1} e {concept2}.',
    'Quais são as características de {concept}?',
    'Como {concept} se aplica na prática?',
    'Cite três exemplos de {concept}.',
  ]},
  { type: 'multiple-choice', level: 'intermediate', templates: [
    'Assinale a alternativa correta sobre {concept}:',
    'Qual das opções melhor descreve {concept}?',
    'Sobre {concept}, é INCORRETO afirmar que:',
  ]},
  { type: 'fill-blank', level: 'intermediate', templates: [
    'Complete: {sentence_with_blank}',
    '{concept} é definido como _______.',
  ]},
  
  // Advanced level
  { type: 'direct', level: 'advanced', templates: [
    'Analise criticamente a relação entre {concept1} e {concept2}.',
    'Qual é a consequência prática de {concept}?',
    'Compare e contraste {concept1} com {concept2}.',
    'Explique as exceções à regra de {concept}.',
  ]},
  { type: 'contextual', level: 'advanced', templates: [
    'Com base no texto, responda: {question}',
    'No contexto apresentado, como se aplica {concept}?',
  ]},
  { type: 'association', level: 'advanced', templates: [
    'Associe cada conceito à sua definição:',
    'Relacione os itens da coluna A com os da coluna B:',
  ]},
  { type: 'ordering', level: 'advanced', templates: [
    'Ordene os passos do processo de {concept}:',
    'Organize os eventos na sequência correta:',
  ]},
];
