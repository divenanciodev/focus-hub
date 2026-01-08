import { FlashcardGroup, CARD_TYPE_CONFIG } from '@/types/flashcards';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Layers, Play, Pencil, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface FlashcardGroupListProps {
  groups: FlashcardGroup[];
  onStudy: (group: FlashcardGroup) => void;
  onEdit: (group: FlashcardGroup) => void;
  onDelete: (groupId: string) => void;
}

export function FlashcardGroupList({ groups, onStudy, onEdit, onDelete }: FlashcardGroupListProps) {
  if (groups.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {groups.map((group) => {
        // Count card types
        const typeCount: Record<string, number> = {};
        group.cards.forEach(card => {
          typeCount[card.type] = (typeCount[card.type] || 0) + 1;
        });

        return (
          <div
            key={group.id}
            className="group bg-card border border-border rounded-2xl p-6 hover:border-foreground/20 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full"
            onClick={() => onStudy(group)}
          >
            {/* Header */}
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <Layers className="w-7 h-7 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-lg break-words">{group.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {group.cards.length} cartão{group.cards.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Card type badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.entries(typeCount).map(([type, count]) => (
                <Badge key={type} variant="secondary" className="text-xs">
                  {CARD_TYPE_CONFIG[type as keyof typeof CARD_TYPE_CONFIG]?.icon} {count}
                </Badge>
              ))}
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-5">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(group.createdAt, "dd 'de' MMM", { locale: ptBR })}
              </span>
              {group.lastStudied && (
                <span>
                  Estudado: {format(group.lastStudied, "dd/MM", { locale: ptBR })}
                </span>
              )}
            </div>

            {/* Spacer to push actions to bottom */}
            <div className="flex-1" />

            {/* Actions */}
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <Button 
                onClick={() => onStudy(group)}
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-2" />
                Praticar
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => onEdit(group)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => onDelete(group.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
