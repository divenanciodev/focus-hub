import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FlashcardGroup, FlashcardCard } from '@/types/flashcards';
import { FlashcardGroupForm } from './FlashcardGroupForm';
import { CardCreationForm } from './CardCreationForm';
import { CardList } from './CardList';
import { ArrowLeft, Save, Layers } from 'lucide-react';
import { toast } from 'sonner';

type CreationStep = 'group-name' | 'cards';

interface FlashcardCreatorProps {
  onSave: (group: FlashcardGroup) => void;
  onCancel: () => void;
  editingGroup?: FlashcardGroup;
}

export function FlashcardCreator({ onSave, onCancel, editingGroup }: FlashcardCreatorProps) {
  const [step, setStep] = useState<CreationStep>(editingGroup ? 'cards' : 'group-name');
  const [groupName, setGroupName] = useState(editingGroup?.name || '');
  const [cards, setCards] = useState<FlashcardCard[]>(editingGroup?.cards || []);
  const [editingCard, setEditingCard] = useState<FlashcardCard | undefined>();

  const handleGroupNameSubmit = (name: string) => {
    setGroupName(name);
    setStep('cards');
  };

  const handleAddCard = (card: FlashcardCard) => {
    if (editingCard) {
      setCards(cards.map(c => c.id === card.id ? card : c));
      setEditingCard(undefined);
    } else {
      setCards([...cards, card]);
    }
  };

  const handleEditCard = (card: FlashcardCard) => {
    setEditingCard(card);
  };

  const handleDeleteCard = (cardId: string) => {
    setCards(cards.filter(c => c.id !== cardId));
    if (editingCard?.id === cardId) {
      setEditingCard(undefined);
    }
    toast.success('Cartão removido');
  };

  const handleSaveGroup = () => {
    if (cards.length === 0) {
      toast.error('Adicione pelo menos um cartão');
      return;
    }

    const group: FlashcardGroup = {
      id: editingGroup?.id || Date.now().toString(),
      name: groupName,
      cards,
      createdAt: editingGroup?.createdAt || new Date(),
    };

    onSave(group);
    toast.success(editingGroup ? 'Grupo atualizado!' : 'Grupo de flashcards salvo!');
  };

  return (
    <div className="min-h-[60vh]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          {step === 'cards' && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <Layers className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">{groupName}</h2>
                <p className="text-sm text-muted-foreground">{cards.length} cartão(ões)</p>
              </div>
            </div>
          )}
        </div>

        {step === 'cards' && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
            <Layers className="w-4 h-4 text-primary" />
            <span className="font-medium text-primary">{cards.length} cartão(ões)</span>
          </div>
        )}
      </div>

      {/* Content */}
      {step === 'group-name' && (
        <FlashcardGroupForm 
          onNext={handleGroupNameSubmit} 
          initialName={groupName}
        />
      )}

      {step === 'cards' && (
        <div className="space-y-8">
          <CardCreationForm 
            onAddCard={handleAddCard}
            editingCard={editingCard}
            onCancelEdit={() => setEditingCard(undefined)}
          />
          
          <div className="border-t border-border pt-6">
            <CardList 
              cards={cards}
              onEdit={handleEditCard}
              onDelete={handleDeleteCard}
            />
          </div>

          {/* Save Button at bottom */}
          <div className="pt-6 border-t border-border">
            <Button 
              onClick={handleSaveGroup} 
              disabled={cards.length === 0}
              className="w-full h-12 text-base"
              size="lg"
            >
              <Save className="w-5 h-5 mr-2" />
              Salvar Grupo ({cards.length} cartão{cards.length !== 1 ? 'ões' : ''})
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
