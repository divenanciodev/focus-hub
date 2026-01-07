import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Layers } from 'lucide-react';

interface FlashcardGroupFormProps {
  onNext: (groupName: string) => void;
  initialName?: string;
}

export function FlashcardGroupForm({ onNext, initialName = '' }: FlashcardGroupFormProps) {
  const [name, setName] = useState(initialName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onNext(name.trim());
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
          <Layers className="w-8 h-8 text-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Criar Grupo de Flashcards</h2>
        <p className="text-muted-foreground">
          Dê um nome para organizar seus cartões de estudo
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="group-name" className="text-base">
            Nome do Grupo
          </Label>
          <Input
            id="group-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Leis 1, Biologia – Células, Inglês – Verbos"
            className="h-12 text-lg"
            autoFocus
          />
          <p className="text-sm text-muted-foreground">
            Este nome será usado para identificar o grupo na área de prática
          </p>
        </div>

        <Button 
          type="submit" 
          size="lg" 
          className="w-full h-12 text-base"
          disabled={!name.trim()}
        >
          Avançar para Criação dos Cartões
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </form>

      <div className="mt-8 p-4 bg-muted/50 rounded-xl">
        <p className="text-sm text-muted-foreground text-center">
          <strong>Dica:</strong> Use nomes descritivos como "Direito Constitucional – Art. 5º" 
          para encontrar facilmente depois
        </p>
      </div>
    </div>
  );
}
