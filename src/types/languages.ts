// Types for the Languages module

export interface Language {
  id: string;
  name: string;
  icon: string;
  category?: string;
  objective?: string;
  color: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LanguageLevel {
  id: string;
  languageId: string;
  name: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LanguageSection {
  id: string;
  levelId: string;
  name: string;
  description?: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export type StructureProgress = 'not_started' | 'in_progress' | 'completed';

export interface LanguageStructure {
  id: string;
  sectionId: string;
  name: string;
  audioUrl?: string;
  progress: StructureProgress;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ContentType = 'explanation' | 'example' | 'expansion' | 'exercise';

export interface LanguageContent {
  id: string;
  structureId: string;
  contentType: ContentType;
  content: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// Extended types with nested data
export interface LanguageWithLevels extends Language {
  levels: LanguageLevelWithSections[];
}

export interface LanguageLevelWithSections extends LanguageLevel {
  sections: LanguageSectionWithStructures[];
}

export interface LanguageSectionWithStructures extends LanguageSection {
  structures: LanguageStructureWithContents[];
}

export interface LanguageStructureWithContents extends LanguageStructure {
  contents: LanguageContent[];
}
