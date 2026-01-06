import { useState } from 'react';
import { FlashcardItem, FlashcardType } from '@/types/training';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Trash2,
  Pencil,
  GripVertical,
  RotateCcw,
  Expand,
  Minimize2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FlashcardDisplay } from './FlashcardDisplay';

interface FlashcardPreviewGridProps {
  cards: FlashcardItem[];
  onRemove: (cardId: string) => void;
  onEdit: (card: FlashcardItem) => void;
  onReorder?: (cards: FlashcardItem[]) => void;
}

const typeColors: Record<FlashcardType, string> = {
  'direct': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'true-false': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  'fill-blank': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  'concept-definition': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  'multiple-choice': 'bg-pink-500/10 text-pink-500 border-pink-500/20',
  'association': 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  'ordering': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  'contextual': 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  'visual': 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  'reversible': 'bg-teal-500/10 text-teal-500 border-teal-500/20',
};

const typeLabels: Record<FlashcardType, string> = {
  'direct': 'Direta',
  'true-false': 'V/F',
  'fill-blank': 'Lacuna',
  'concept-definition': 'Conceito',
  'multiple-choice': 'Múltipla',
  'association': 'Associação',
  'ordering': 'Ordem',
  'contextual': 'Contextual',
  'visual': 'Visual',
  'reversible': 'Reversível',
};

function getContentText(content: string | { mainText?: string }): string {
  if (typeof content === 'string') return content;
  return content.mainText || '';
}

export function FlashcardPreviewGrid({
  cards,
  onRemove,
  onEdit,
  onReorder,
}: FlashcardPreviewGridProps) {
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [expandedCard, setExpandedCard] = useState<FlashcardItem | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleFlip = (cardId: string) => {
    setFlippedCards(prev => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  const moveCard = (index: number, direction: 'up' | 'down') => {
    if (!onReorder) return;
    const newCards = [...cards];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= cards.length) return;
    [newCards[index], newCards[newIndex]] = [newCards[newIndex], newCards[index]];
    onReorder(newCards);
  };

  if (cards.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          <span>Cartões criados ({cards.length})</span>
        </button>
        <span className="text-xs text-muted-foreground">
          Clique para virar • Arraste para reordenar
        </span>
      </div>

      {/* Grid */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-1">
          {cards.map((card, index) => {
            const isFlipped = flippedCards.has(card.id);
            const frontText = getContentText(card.front);
            const backText = getContentText(card.back);

            return (
              <div
                key={card.id}
                className={cn(
                  "group relative bg-card border rounded-xl transition-all duration-300",
                  "hover:shadow-lg hover:border-primary/30",
                  isFlipped 
                    ? "border-primary/30 bg-primary/5" 
                    : "border-border"
                )}
              >
                {/* Card number and type */}
                <div className="flex items-center justify-between p-3 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground">
                      #{index + 1}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={cn('text-[10px] px-1.5 py-0', typeColors[card.type])}
                    >
                      {typeLabels[card.type]}
                    </Badge>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onReorder && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => moveCard(index, 'up')}
                          disabled={index === 0}
                        >
                          <ChevronUp className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => moveCard(index, 'down')}
                          disabled={index === cards.length - 1}
                        >
                          <ChevronDown className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setExpandedCard(card)}
                    >
                      <Expand className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onEdit(card)}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={() => onRemove(card.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Card content - clickable to flip */}
                <div 
                  className="p-3 pt-0 cursor-pointer min-h-[100px]"
                  onClick={() => toggleFlip(card.id)}
                >
                  <div className="relative">
                    {/* Flip indicator */}
                    <RotateCcw 
                      className={cn(
                        "absolute top-0 right-0 w-3 h-3 text-muted-foreground transition-transform",
                        isFlipped && "rotate-180"
                      )} 
                    />
                    
                    {/* Label */}
                    <p className="text-xs text-muted-foreground mb-1">
                      {isFlipped ? 'Resposta:' : 'Pergunta:'}
                    </p>
                    
                    {/* Content */}
                    <p className="text-sm font-medium line-clamp-4">
                      {isFlipped ? backText : frontText}
                    </p>

                    {/* Multiple choice preview */}
                    {!isFlipped && card.type === 'multiple-choice' && card.multipleChoiceOptions && (
                      <div className="mt-2 space-y-1">
                        {card.multipleChoiceOptions.slice(0, 2).map((opt, i) => (
                          <div 
                            key={opt.id}
                            className={cn(
                              "text-xs px-2 py-1 rounded border truncate",
                              opt.isCorrect 
                                ? "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400"
                                : "border-border"
                            )}
                          >
                            {String.fromCharCode(65 + i)}) {opt.text}
                          </div>
                        ))}
                        {card.multipleChoiceOptions.length > 2 && (
                          <p className="text-xs text-muted-foreground">
                            +{card.multipleChoiceOptions.length - 2} mais...
                          </p>
                        )}
                      </div>
                    )}

                    {/* True/False preview */}
                    {!isFlipped && card.type === 'true-false' && card.trueFalseAnswer !== undefined && (
                      <Badge 
                        variant="outline"
                        className={cn(
                          "mt-2 text-xs",
                          card.trueFalseAnswer 
                            ? "border-green-500/30 text-green-600"
                            : "border-red-500/30 text-red-600"
                        )}
                      >
                        Resposta: {card.trueFalseAnswer ? 'Verdadeiro' : 'Falso'}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Difficulty indicator if set */}
                {card.difficulty && (
                  <div className="px-3 pb-3">
                    <Badge 
                      variant="outline"
                      className={cn(
                        "text-xs",
                        card.difficulty === 'easy' && "border-green-500/30 text-green-500",
                        card.difficulty === 'medium' && "border-yellow-500/30 text-yellow-500",
                        card.difficulty === 'hard' && "border-red-500/30 text-red-500"
                      )}
                    >
                      {card.difficulty === 'easy' ? 'Fácil' : 
                       card.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                    </Badge>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Expanded card dialog */}
      <Dialog open={!!expandedCard} onOpenChange={() => setExpandedCard(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Visualização do Cartão</DialogTitle>
          </DialogHeader>
          {expandedCard && (
            <FlashcardDisplay
              card={expandedCard}
              isFlipped={false}
              onFlip={() => {}}
              size="lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
