import { FlashcardCard, CARD_TYPE_CONFIG } from '@/types/flashcards';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CardListProps {
  cards: FlashcardCard[];
  onEdit: (card: FlashcardCard) => void;
  onDelete: (cardId: string) => void;
}

export function CardList({ cards, onEdit, onDelete }: CardListProps) {
  if (cards.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-xl">
        <p>Nenhum cartão criado ainda</p>
        <p className="text-sm">Use o formulário acima para adicionar cartões</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-foreground flex items-center gap-2">
        Cartões Criados 
        <Badge variant="secondary">{cards.length}</Badge>
      </h3>
      
      <div className="space-y-2">
        {cards.map((card, index) => {
          const typeConfig = CARD_TYPE_CONFIG[card.type];
          
          return (
            <div 
              key={card.id}
              className="group flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:border-foreground/20 transition-colors"
            >
              <div className="text-muted-foreground/50 cursor-grab">
                <GripVertical className="w-4 h-4" />
              </div>
              
              <span className="text-lg">{typeConfig.icon}</span>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{card.name}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {card.question || card.answer || 'Cartão de imagem'}
                </p>
              </div>
              
              <Badge variant="outline" className="shrink-0">
                {typeConfig.label}
              </Badge>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => onEdit(card)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => onDelete(card.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
