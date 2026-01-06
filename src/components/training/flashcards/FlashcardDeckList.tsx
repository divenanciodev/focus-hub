import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FlashcardDeck } from '@/types/training';
import { 
  Layers, 
  Play, 
  Pencil, 
  Trash2, 
  MoreVertical,
  Calendar,
  Hash
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FlashcardDeckListProps {
  decks: FlashcardDeck[];
  onStudy: (deck: FlashcardDeck) => void;
  onEdit: (deck: FlashcardDeck) => void;
  onDelete: (deckId: string) => void;
}

export function FlashcardDeckList({
  decks,
  onStudy,
  onEdit,
  onDelete,
}: FlashcardDeckListProps) {
  if (decks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Nenhum deck de flashcards criado</p>
        <p className="text-sm">Crie seu primeiro deck para começar a estudar</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {decks.map((deck) => (
        <div
          key={deck.id}
          className="bg-card border border-border rounded-xl p-5 hover:border-foreground/20 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Layers className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{deck.name}</h3>
                <p className="text-sm text-muted-foreground">{deck.discipline}</p>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(deck)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(deck.id)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {deck.subject && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
              {deck.subject}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Hash className="w-4 h-4" />
              {deck.cards.length} cartões
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {format(deck.createdAt, "dd MMM", { locale: ptBR })}
            </span>
          </div>

          {deck.totalReviews > 0 && (
            <p className="text-xs text-muted-foreground mb-3">
              {deck.totalReviews} revisões realizadas
            </p>
          )}

          <Button 
            onClick={() => onStudy(deck)} 
            className="w-full"
            disabled={deck.cards.length === 0}
          >
            <Play className="w-4 h-4 mr-2" />
            Estudar
          </Button>
        </div>
      ))}
    </div>
  );
}
