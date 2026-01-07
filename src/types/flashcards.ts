// Simplified flashcard types for the new visual system

export type FlashcardCardType = 
  | 'flip'              // Pergunta e Resposta com flip
  | 'image-flip'        // Pergunta + Imagem + Resposta
  | 'multiple-choice'   // Múltipla escolha interativo
  | 'image-answer';     // Imagem + Resposta

export interface FlashcardCard {
  id: string;
  name: string;
  type: FlashcardCardType;
  
  // Content based on type
  question?: string;
  answer?: string;
  imageUrl?: string;
  imagePosition?: 'center' | 'top' | 'bottom' | 'left' | 'right'; // Position of image
  
  // For multiple choice
  options?: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  
  // Card colors
  frontColor?: string;
  backColor?: string;
  
  createdAt: Date;
}

export interface FlashcardGroup {
  id: string;
  name: string;
  cards: FlashcardCard[];
  createdAt: Date;
  lastStudied?: Date;
}

export const CARD_TYPE_CONFIG: Record<FlashcardCardType, {
  label: string;
  description: string;
  icon: string;
}> = {
  'flip': {
    label: 'Pergunta e Resposta',
    description: 'Cartão que vira ao clicar',
    icon: '🔄',
  },
  'image-flip': {
    label: 'Pergunta + Imagem',
    description: 'Pergunta com imagem e resposta',
    icon: '🖼️',
  },
  'multiple-choice': {
    label: 'Múltipla Escolha',
    description: 'Escolha a opção correta',
    icon: '🔘',
  },
  'image-answer': {
    label: 'Imagem + Resposta',
    description: 'Apenas imagem na frente',
    icon: '📷',
  },
};
