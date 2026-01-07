import { useState } from 'react';
import { FlashcardCard } from '@/types/flashcards';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface FlipCardProps {
  card: FlashcardCard;
  isPreview?: boolean;
  onAnswer?: (isCorrect: boolean) => void;
  showFeedback?: boolean;
}

export function FlipCard({ card, isPreview = false, onAnswer, showFeedback = false }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleFlip = () => {
    if (card.type !== 'multiple-choice') {
      setIsFlipped(!isFlipped);
    }
  };

  const handleOptionSelect = (optionId: string) => {
    if (showResult) return;
    
    setSelectedOption(optionId);
    setShowResult(true);
    
    const isCorrect = card.options?.find(o => o.id === optionId)?.isCorrect || false;
    
    if (onAnswer) {
      setTimeout(() => {
        onAnswer(isCorrect);
      }, 1500);
    }
  };

  const resetCard = () => {
    setIsFlipped(false);
    setSelectedOption(null);
    setShowResult(false);
  };

  // Multiple choice card
  if (card.type === 'multiple-choice') {
    return (
      <div className={cn(
        "w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-lg",
        isPreview && "pointer-events-none"
      )}>
        <div className="mb-6">
          <p className="text-lg font-medium text-foreground leading-relaxed">
            {card.question || 'Pergunta...'}
          </p>
        </div>
        
        <div className="space-y-3">
          {(card.options || []).map((option) => {
            const isSelected = selectedOption === option.id;
            const isCorrectOption = option.isCorrect;
            
            let optionStyle = 'bg-secondary/50 hover:bg-secondary';
            if (showResult && isSelected) {
              optionStyle = isCorrectOption 
                ? 'bg-green-500/20 border-green-500 text-green-700' 
                : 'bg-red-500/20 border-red-500 text-red-700';
            } else if (showResult && isCorrectOption) {
              optionStyle = 'bg-green-500/20 border-green-500';
            }
            
            return (
              <button
                key={option.id}
                onClick={() => handleOptionSelect(option.id)}
                disabled={showResult}
                className={cn(
                  "w-full p-4 rounded-xl text-left border-2 transition-all duration-200",
                  "flex items-center justify-between",
                  optionStyle,
                  !showResult && "hover:scale-[1.02]"
                )}
              >
                <span className="text-sm">{option.text || 'Opção...'}</span>
                {showResult && isSelected && (
                  isCorrectOption 
                    ? <Check className="w-5 h-5 text-green-600" />
                    : <X className="w-5 h-5 text-red-600" />
                )}
                {showResult && !isSelected && isCorrectOption && (
                  <Check className="w-5 h-5 text-green-600" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Flip card (flip, image-flip, image-answer)
  return (
    <div 
      className={cn(
        "w-full max-w-sm cursor-pointer perspective-1000",
        isPreview && "pointer-events-none"
      )}
      onClick={handleFlip}
    >
      <div 
        className={cn(
          "relative w-full min-h-[280px] transition-transform duration-500 preserve-3d",
          isFlipped && "rotate-y-180"
        )}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front */}
        <div 
          className="absolute inset-0 bg-card border border-border rounded-2xl p-6 shadow-lg backface-hidden flex flex-col items-center justify-center"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Image for image-flip and image-answer types */}
          {(card.type === 'image-flip' || card.type === 'image-answer') && card.imageUrl && (
            <div className="w-full h-32 mb-4 rounded-xl overflow-hidden">
              <img 
                src={card.imageUrl} 
                alt="" 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {/* Question for flip and image-flip */}
          {(card.type === 'flip' || card.type === 'image-flip') && (
            <p className="text-lg font-medium text-foreground text-center leading-relaxed">
              {card.question || 'Sua pergunta aqui...'}
            </p>
          )}
          
          {/* Image only for image-answer */}
          {card.type === 'image-answer' && !card.imageUrl && (
            <p className="text-muted-foreground text-center">Imagem aqui...</p>
          )}
          
          <p className="text-xs text-muted-foreground mt-4 absolute bottom-4">
            Clique para virar
          </p>
        </div>

        {/* Back */}
        <div 
          className="absolute inset-0 bg-foreground text-background border border-border rounded-2xl p-6 shadow-lg backface-hidden flex flex-col items-center justify-center rotate-y-180"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <p className="text-lg font-medium text-center leading-relaxed">
            {card.answer || 'Sua resposta aqui...'}
          </p>
          
          <p className="text-xs text-background/60 mt-4 absolute bottom-4">
            Clique para voltar
          </p>
        </div>
      </div>
    </div>
  );
}
