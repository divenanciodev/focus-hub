import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FlashcardDeck, FlashcardItem, FlashcardType } from '@/types/training';
import { Plus, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface CreateFlashcardDeckModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (deck: FlashcardDeck) => void;
  editingDeck?: FlashcardDeck;
}

const disciplines = [
  'Direito Constitucional',
  'Português',
  'Matemática Financeira',
  'Raciocínio Lógico',
  'Informática',
  'Conhecimentos Gerais',
];

const flashcardTypes: { value: FlashcardType; label: string }[] = [
  { value: 'direct', label: 'Pergunta direta' },
  { value: 'true-false', label: 'Verdadeiro ou falso' },
  { value: 'fill-blank', label: 'Completar lacuna' },
  { value: 'concept-definition', label: 'Conceito → Definição' },
];

export function CreateFlashcardDeckModal({
  open,
  onOpenChange,
  onSubmit,
  editingDeck,
}: CreateFlashcardDeckModalProps) {
  const [name, setName] = useState(editingDeck?.name || '');
  const [discipline, setDiscipline] = useState(editingDeck?.discipline || '');
  const [subject, setSubject] = useState(editingDeck?.subject || '');
  const [cards, setCards] = useState<FlashcardItem[]>(editingDeck?.cards || []);
  const [activeTab, setActiveTab] = useState('manual');
  
  // For manual creation
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newType, setNewType] = useState<FlashcardType>('direct');
  
  // For generation from content
  const [contentText, setContentText] = useState('');
  const [cardCount, setCardCount] = useState('10');
  const [difficulty, setDifficulty] = useState('medium');

  const handleAddCard = () => {
    if (!newFront.trim() || !newBack.trim()) {
      toast.error('Preencha frente e verso do cartão');
      return;
    }
    
    const newCard: FlashcardItem = {
      id: Date.now().toString(),
      front: newFront.trim(),
      back: newBack.trim(),
      type: newType,
    };
    
    setCards([...cards, newCard]);
    setNewFront('');
    setNewBack('');
    toast.success('Cartão adicionado!');
  };

  const handleRemoveCard = (cardId: string) => {
    setCards(cards.filter(c => c.id !== cardId));
  };

  const handleGenerateFromContent = () => {
    if (!contentText.trim()) {
      toast.error('Digite ou cole um conteúdo primeiro');
      return;
    }
    
    // Simulated generation - in a real app, this would use AI
    const sentences = contentText.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const count = Math.min(parseInt(cardCount), sentences.length, 20);
    
    const generatedCards: FlashcardItem[] = sentences.slice(0, count).map((sentence, index) => {
      const words = sentence.trim().split(' ');
      const keyWord = words[Math.floor(words.length / 2)] || words[0];
      
      return {
        id: `gen-${Date.now()}-${index}`,
        front: `O que é ${keyWord}?`,
        back: sentence.trim(),
        type: 'direct' as FlashcardType,
      };
    });
    
    setCards([...cards, ...generatedCards]);
    setContentText('');
    toast.success(`${generatedCards.length} cartões gerados!`);
  };

  const handleSubmit = () => {
    if (!name.trim() || !discipline || cards.length === 0) {
      toast.error('Preencha o nome, disciplina e adicione ao menos 1 cartão');
      return;
    }
    
    const deck: FlashcardDeck = {
      id: editingDeck?.id || Date.now().toString(),
      name: name.trim(),
      discipline,
      subject: subject.trim(),
      cards,
      createdAt: editingDeck?.createdAt || new Date(),
      totalReviews: editingDeck?.totalReviews || 0,
    };
    
    onSubmit(deck);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setName('');
    setDiscipline('');
    setSubject('');
    setCards([]);
    setNewFront('');
    setNewBack('');
    setContentText('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingDeck ? 'Editar Deck' : 'Criar Deck de Flashcards'}
          </DialogTitle>
          <DialogDescription>
            Crie cartões de memorização para estudo ativo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Deck Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Nome do deck *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Princípios Constitucionais"
              />
            </div>
            <div className="space-y-2">
              <Label>Disciplina *</Label>
              <Select value={discipline} onValueChange={setDiscipline}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {disciplines.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assunto</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ex: Art. 1º ao 5º"
              />
            </div>
          </div>

          {/* Card Creation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">Criar manualmente</TabsTrigger>
              <TabsTrigger value="generate">Gerar de conteúdo</TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-3 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Frente (pergunta)</Label>
                  <Textarea
                    value={newFront}
                    onChange={(e) => setNewFront(e.target.value)}
                    placeholder="Digite a pergunta ou conceito..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Verso (resposta)</Label>
                  <Textarea
                    value={newBack}
                    onChange={(e) => setNewBack(e.target.value)}
                    placeholder="Digite a resposta ou definição..."
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex items-end gap-3">
                <div className="flex-1 space-y-2">
                  <Label>Tipo do cartão</Label>
                  <Select value={newType} onValueChange={(v) => setNewType(v as FlashcardType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {flashcardTypes.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddCard}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="generate" className="space-y-3 mt-4">
              <div className="space-y-2">
                <Label>Cole seu conteúdo (resumo, texto, PDF...)</Label>
                <Textarea
                  value={contentText}
                  onChange={(e) => setContentText(e.target.value)}
                  placeholder="Cole aqui o texto do qual deseja gerar flashcards..."
                  rows={5}
                />
              </div>
              
              <div className="flex items-end gap-3">
                <div className="space-y-2">
                  <Label>Quantidade</Label>
                  <Select value={cardCount} onValueChange={setCardCount}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 10, 15, 20].map(n => (
                        <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Dificuldade</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Básico</SelectItem>
                      <SelectItem value="medium">Médio</SelectItem>
                      <SelectItem value="hard">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleGenerateFromContent}>
                  <Upload className="w-4 h-4 mr-2" />
                  Gerar cartões
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                💡 A geração é simulada. Em produção, usaria IA para criar flashcards inteligentes.
              </p>
            </TabsContent>
          </Tabs>

          {/* Cards Preview */}
          {cards.length > 0 && (
            <div className="space-y-2">
              <Label>Cartões ({cards.length})</Label>
              <div className="max-h-48 overflow-y-auto space-y-2 border border-border rounded-lg p-3">
                {cards.map((card, index) => (
                  <div
                    key={card.id}
                    className="flex items-center justify-between bg-secondary/50 rounded-lg p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{index + 1}. {card.front}</p>
                      <p className="text-xs text-muted-foreground truncate">{card.back}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveCard(card.id)}
                      className="shrink-0 ml-2"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!name || !discipline || cards.length === 0}>
            {editingDeck ? 'Salvar alterações' : 'Criar deck'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
