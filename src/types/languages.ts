// Types for the Languages module

export const GRAMMATICAL_CLASSES = [
  'verb',
  'noun',
  'adjective',
  'adverb',
  'pronoun',
  'preposition',
  'conjunction',
  'determiner',
  'interjection',
  'article'
] as const;

export type GrammaticalClass = typeof GRAMMATICAL_CLASSES[number];

export const EXPECTED_INPUTS = [
  'verb',
  'noun',
  'adjective',
  'adverb',
  'verb-ing',
  'past participle',
  'sentence',
  'phrase',
  'any'
] as const;

export type ExpectedInput = typeof EXPECTED_INPUTS[number];

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Language {
  id: string;
  name: string;
  icon: string;
  color: string;
  category?: string;
  objective?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface VocabularySet {
  id: string;
  languageId: string;
  name: string;
  setType: 'grammatical_class' | 'thematic_set';
  grammaticalClass?: GrammaticalClass;
  description?: string;
  color: string;
  icon: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface VocabularyWord {
  id: string;
  setId: string;
  word: string;
  translation?: string;
  example?: string;
  imageUrl?: string;
  audioUrl?: string;
  difficulty: Difficulty;
  masteryLevel: number;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GrammarStructureSet {
  id: string;
  languageId: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GrammarStructure {
  id: string;
  languageId: string;
  setId?: string;
  fixedText: string;
  expectedInput: ExpectedInput;
  allowedClasses: string[];
  examples: string[];
  grammarTip?: string;
  translation?: string;
  difficulty: Difficulty;
  category?: string;
  masteryLevel: number;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PracticeSession {
  id: string;
  languageId: string;
  practiceType: 'vocabulary' | 'structures' | 'mixed';
  exerciseType?: string;
  totalQuestions: number;
  correctAnswers: number;
  timeSpentSeconds: number;
  completedAt?: Date;
  createdAt: Date;
}

export interface WordPracticeStats {
  id: string;
  wordId: string;
  timesPracticed: number;
  timesCorrect: number;
  lastPracticedAt?: Date;
  nextReviewAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface StructurePracticeStats {
  id: string;
  structureId: string;
  timesPracticed: number;
  timesCorrect: number;
  lastPracticedAt?: Date;
  nextReviewAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Exercise types for vocabulary practice
export type VocabularyExerciseType = 
  | 'word_to_translation'
  | 'translation_to_word'
  | 'word_to_image'
  | 'multiple_choice'
  | 'typing';

// Extended types with nested data
export interface VocabularySetWithWords extends VocabularySet {
  words: VocabularyWord[];
}

export interface LanguageWithData extends Language {
  vocabularySets: VocabularySetWithWords[];
  structures: GrammarStructure[];
}
