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
    if (showResult || isPreview) return;
    
    setSelectedOption(optionId);
    setShowResult(true);
    
    const isCorrect = card.options?.find(o => o.id === optionId)?.isCorrect || false;
    
    if (onAnswer) {
      setTimeout(() => {
        onAnswer(isCorrect);
      }, 1500);
    }
  };

  // Multiple choice card
  if (card.type === 'multiple-choice') {
    return (
      <div 
        className="w-full max-w-lg border border-border rounded-2xl p-6 shadow-lg"
        style={{
          backgroundColor: card.frontColor || 'hsl(var(--card))',
          color: card.frontColor ? '#ffffff' : 'hsl(var(--foreground))',
        }}
      >
        <div className="mb-6">
          <p className="text-lg font-medium leading-relaxed break-words">
            {card.question || 'Pergunta...'}
          </p>
        </div>
        
        <div className="space-y-3">
          {(card.options || []).map((option) => {
            const isSelected = selectedOption === option.id;
            const isCorrectOption = option.isCorrect;
            
            let optionStyle = 'bg-secondary/50 hover:bg-secondary border-transparent';
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
                disabled={showResult || isPreview}
                className={cn(
                  "w-full p-4 rounded-xl text-left border-2 transition-all duration-200",
                  "flex items-center justify-between gap-3",
                  optionStyle,
                  !showResult && !isPreview && "hover:scale-[1.02] cursor-pointer",
                  isPreview && "cursor-default"
                )}
                style={{
                  backgroundColor: !showResult && card.frontColor ? 'rgba(255,255,255,0.15)' : undefined,
                }}
              >
                <span className="text-sm break-words flex-1">{option.text || 'Opção...'}</span>
                {showResult && isSelected && (
                  isCorrectOption 
                    ? <Check className="w-5 h-5 text-green-600 shrink-0" />
                    : <X className="w-5 h-5 text-red-600 shrink-0" />
                )}
                {showResult && !isSelected && isCorrectOption && (
                  <Check className="w-5 h-5 text-green-600 shrink-0" />
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
      className="w-full max-w-lg cursor-pointer"
      onClick={handleFlip}
      style={{ perspective: '1000px' }}
    >
      <div 
        className="relative w-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front */}
        <div 
          className={cn(
            "w-full border border-border rounded-2xl p-8 shadow-lg",
            "flex flex-col items-center justify-center min-h-[250px]"
          )}
          style={{ 
            backfaceVisibility: 'hidden',
            backgroundColor: card.frontColor || 'hsl(var(--card))',
            color: card.frontColor ? '#ffffff' : 'hsl(var(--foreground))',
          }}
        >
          {/* Image for image-flip and image-answer types */}
          {(card.type === 'image-flip' || card.type === 'image-answer') && card.imageUrl && (
            <div className="w-full max-w-[200px] aspect-square mb-4 rounded-xl overflow-hidden bg-muted/30">
              <img 
                src={card.imageUrl} 
                alt="" 
                className="w-full h-full object-contain"
              />
            </div>
          )}
          
          {/* Question for flip and image-flip */}
          {(card.type === 'flip' || card.type === 'image-flip') && (
            <p className="text-xl font-medium text-center leading-relaxed break-words px-2">
              {card.question || 'Sua pergunta aqui...'}
            </p>
          )}
          
          {/* Image only for image-answer */}
          {card.type === 'image-answer' && !card.imageUrl && (
            <p className="text-center opacity-70">Imagem aqui...</p>
          )}
          
          <p className="text-xs mt-6 opacity-60">
            Clique para virar
          </p>
        </div>

        {/* Back */}
        <div 
          className={cn(
            "absolute inset-0 w-full border border-border rounded-2xl p-8 shadow-lg",
            "flex flex-col items-center justify-center min-h-[250px]"
          )}
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            backgroundColor: card.backColor || 'hsl(var(--primary))',
            color: card.backColor ? '#ffffff' : 'hsl(var(--primary-foreground))',
          }}
        >
          <p className="text-xl font-medium text-center leading-relaxed break-words px-2">
            {card.answer || 'Sua resposta aqui...'}
          </p>
          
          <p className="text-xs mt-6 opacity-60">
            Clique para voltar
          </p>
        </div>
      </div>
    </div>
  );
}