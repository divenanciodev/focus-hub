import { useState } from 'react';
import { FlashcardItem, FlashcardContent, FlashcardType } from '@/types/training';
import { cn } from '@/lib/utils';
import { 
  RotateCcw, 
  Lightbulb, 
  Info,
  CheckCircle2,
  XCircle,
  GripVertical,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FlashcardDisplayProps {
  card: FlashcardItem;
  isFlipped: boolean;
  onFlip: () => void;
  showControls?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onDifficultyMark?: (difficulty: 'easy' | 'medium' | 'hard') => void;
  onAnswerSubmit?: (answer: any) => void;
  className?: string;
}

// Helper to get content string from front/back
function getContentText(content: string | FlashcardContent): string {
  if (typeof content === 'string') return content;
  return content.mainText || '';
}

function getContentTitle(content: string | FlashcardContent): string | undefined {
  if (typeof content === 'string') return undefined;
  return content.title;
}

// Type badge colors
const typeColors: Record<FlashcardType, string> = {
  'direct': 'bg-blue-500/10 text-blue-500',
  'true-false': 'bg-purple-500/10 text-purple-500',
  'fill-blank': 'bg-orange-500/10 text-orange-500',
  'concept-definition': 'bg-emerald-500/10 text-emerald-500',
  'multiple-choice': 'bg-pink-500/10 text-pink-500',
  'association': 'bg-cyan-500/10 text-cyan-500',
  'ordering': 'bg-amber-500/10 text-amber-500',
  'contextual': 'bg-indigo-500/10 text-indigo-500',
  'visual': 'bg-rose-500/10 text-rose-500',
  'reversible': 'bg-teal-500/10 text-teal-500',
};

const typeLabels: Record<FlashcardType, string> = {
  'direct': 'Pergunta Direta',
  'true-false': 'V ou F',
  'fill-blank': 'Completar',
  'concept-definition': 'Conceito',
  'multiple-choice': 'Múltipla Escolha',
  'association': 'Associação',
  'ordering': 'Ordenação',
  'contextual': 'Contextual',
  'visual': 'Visual',
  'reversible': 'Reversível',
};

export function FlashcardDisplay({
  card,
  isFlipped,
  onFlip,
  showControls = true,
  size = 'md',
  onDifficultyMark,
  onAnswerSubmit,
  className,
}: FlashcardDisplayProps) {
  const [selectedMCOption, setSelectedMCOption] = useState<string | null>(null);
  const [tfAnswer, setTfAnswer] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);

  const sizeClasses = {
    sm: 'min-h-[150px] p-4',
    md: 'min-h-[250px] p-6',
    lg: 'min-h-[350px] p-8',
  };

  const frontContent = typeof card.front === 'string' 
    ? { mainText: card.front } as FlashcardContent
    : card.front;
  
  const backContent = typeof card.back === 'string'
    ? { mainText: card.back } as FlashcardContent
    : card.back;

  const handleMCSubmit = (optionId: string) => {
    setSelectedMCOption(optionId);
    const isCorrect = card.multipleChoiceOptions?.find(o => o.id === optionId)?.isCorrect;
    onAnswerSubmit?.({ optionId, isCorrect });
  };

  const handleTFSubmit = (answer: boolean) => {
    setTfAnswer(answer);
    const isCorrect = answer === card.trueFalseAnswer;
    onAnswerSubmit?.({ answer, isCorrect });
  };

  // Render front side based on type
  const renderFront = () => {
    return (
      <div className="flex flex-col h-full">
        {/* Type badge */}
        <div className="flex items-center justify-between mb-4">
          <Badge variant="secondary" className={cn('text-xs', typeColors[card.type])}>
            {typeLabels[card.type]}
          </Badge>
          {showControls && (
            <button
              onClick={(e) => { e.stopPropagation(); onFlip(); }}
              className="p-1.5 rounded-full hover:bg-secondary transition-colors"
              title="Virar cartão"
            >
              <RotateCcw className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Title */}
        {frontContent.title && (
          <h3 className="text-lg font-bold mb-2">{frontContent.title}</h3>
        )}
        {frontContent.subtitle && (
          <p className="text-sm text-muted-foreground mb-3">{frontContent.subtitle}</p>
        )}

        {/* Image */}
        {frontContent.imageUrl && (
          <div className="mb-4 rounded-lg overflow-hidden bg-secondary/50">
            <img 
              src={frontContent.imageUrl} 
              alt="Card visual" 
              className="w-full h-32 object-cover"
            />
          </div>
        )}

        {/* Context text for contextual type */}
        {card.type === 'contextual' && card.contextText && (
          <div className="bg-secondary/50 rounded-lg p-3 mb-4 text-sm italic border-l-4 border-primary/50">
            {card.contextText}
          </div>
        )}

        {/* Main text */}
        <div className="flex-1">
          <p className={cn(
            "text-foreground",
            size === 'lg' ? 'text-xl' : size === 'md' ? 'text-lg' : 'text-base'
          )}>
            {frontContent.mainText}
          </p>

          {/* Bullet points */}
          {frontContent.bulletPoints && frontContent.bulletPoints.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm">
              {frontContent.bulletPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Multiple choice options */}
        {card.type === 'multiple-choice' && card.multipleChoiceOptions && !isFlipped && (
          <div className="mt-4 space-y-2">
            {card.multipleChoiceOptions.map((option, idx) => (
              <button
                key={option.id}
                onClick={(e) => { e.stopPropagation(); handleMCSubmit(option.id); }}
                className={cn(
                  "w-full text-left p-3 rounded-lg border transition-all text-sm",
                  selectedMCOption === option.id
                    ? option.isCorrect
                      ? "border-green-500 bg-green-500/10"
                      : "border-red-500 bg-red-500/10"
                    : "border-border hover:border-primary/50 hover:bg-secondary/50"
                )}
                disabled={selectedMCOption !== null}
              >
                <span className="font-medium mr-2">
                  {String.fromCharCode(65 + idx)})
                </span>
                {option.text}
                {selectedMCOption === option.id && (
                  <span className="float-right">
                    {option.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* True/False buttons */}
        {card.type === 'true-false' && !isFlipped && (
          <div className="mt-4 flex gap-3">
            <Button
              variant={tfAnswer === true 
                ? (card.trueFalseAnswer === true ? "default" : "destructive")
                : "outline"
              }
              className="flex-1"
              onClick={(e) => { e.stopPropagation(); handleTFSubmit(true); }}
              disabled={tfAnswer !== null}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Verdadeiro
            </Button>
            <Button
              variant={tfAnswer === false 
                ? (card.trueFalseAnswer === false ? "default" : "destructive")
                : "outline"
              }
              className="flex-1"
              onClick={(e) => { e.stopPropagation(); handleTFSubmit(false); }}
              disabled={tfAnswer !== null}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Falso
            </Button>
          </div>
        )}

        {/* Ordering items */}
        {card.type === 'ordering' && card.orderingItems && !isFlipped && (
          <div className="mt-4 space-y-2">
            {card.orderingItems
              .sort(() => Math.random() - 0.5)
              .map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 p-3 rounded-lg border border-border bg-secondary/30 cursor-move"
              >
                <GripVertical className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
            <p className="text-xs text-muted-foreground text-center mt-2">
              Arraste para reordenar
            </p>
          </div>
        )}

        {/* Hint button */}
        {frontContent.hint && (
          <div className="mt-4">
            {showHint ? (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-amber-700 dark:text-amber-300">{frontContent.hint}</span>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => { e.stopPropagation(); setShowHint(true); }}
                className="text-amber-500 hover:text-amber-600"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Ver dica
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render back side
  const renderBack = () => {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
            Resposta
          </Badge>
          {showControls && (
            <button
              onClick={(e) => { e.stopPropagation(); onFlip(); }}
              className="p-1.5 rounded-full hover:bg-secondary transition-colors"
              title="Virar cartão"
            >
              <RotateCcw className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Title */}
        {backContent.title && (
          <h3 className="text-lg font-bold mb-2">{backContent.title}</h3>
        )}

        {/* Image */}
        {backContent.imageUrl && (
          <div className="mb-4 rounded-lg overflow-hidden bg-secondary/50">
            <img 
              src={backContent.imageUrl} 
              alt="Card visual" 
              className="w-full h-32 object-cover"
            />
          </div>
        )}

        {/* Main text */}
        <div className="flex-1">
          <p className={cn(
            "text-foreground",
            size === 'lg' ? 'text-xl' : size === 'md' ? 'text-lg' : 'text-base'
          )}>
            {backContent.mainText}
          </p>

          {/* Bullet points */}
          {backContent.bulletPoints && backContent.bulletPoints.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm">
              {backContent.bulletPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Example */}
        {backContent.example && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">
              💡 Exemplo
            </p>
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              {backContent.example}
            </p>
          </div>
        )}

        {/* True/False explanation */}
        {card.type === 'true-false' && card.trueFalseExplanation && (
          <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
              📝 Explicação
            </p>
            <p className="text-sm">{card.trueFalseExplanation}</p>
          </div>
        )}

        {/* Note */}
        {backContent.note && (
          <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{backContent.note}</span>
          </div>
        )}

        {/* Highlighted terms */}
        {backContent.highlightedTerms && backContent.highlightedTerms.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {backContent.highlightedTerms.map((term, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {term}
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className={cn(
        "relative cursor-pointer select-none",
        "perspective-1000",
        className
      )}
      onClick={onFlip}
      style={{ perspective: '1000px' }}
    >
      <div
        className={cn(
          "relative w-full transition-transform duration-500",
          "transform-style-preserve-3d",
          isFlipped && "rotate-y-180"
        )}
        style={{ 
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front */}
        <div
          className={cn(
            "w-full bg-card border-2 border-border rounded-2xl shadow-lg",
            sizeClasses[size],
            "backface-hidden"
          )}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {renderFront()}
        </div>

        {/* Back */}
        <div
          className={cn(
            "absolute inset-0 w-full bg-card border-2 border-primary/30 rounded-2xl shadow-lg",
            sizeClasses[size],
            "backface-hidden rotate-y-180"
          )}
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {renderBack()}
        </div>
      </div>
    </div>
  );
}
