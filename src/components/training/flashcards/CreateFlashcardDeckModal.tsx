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
import { Plus, Trash2, Upload, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

// Componente de preview interativo do cartão
function InteractiveCardPreview({ 
  card, 
  index, 
  onRemove 
}: { 
  card: FlashcardItem; 
  index: number; 
  onRemove: () => void;
}) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="relative group cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div 
        className={`bg-card border border-border rounded-xl p-4 min-h-[100px] transition-all duration-300 ${
          isFlipped ? 'bg-primary/5 border-primary/30' : ''
        }`}
      >
        <div className="flex items-start justify-between mb-2">
          <span className="text-xs font-medium bg-secondary px-2 py-0.5 rounded-full">
            {index + 1}
          </span>
          <div className="flex items-center gap-1">
            <RotateCcw className={`w-3 h-3 text-muted-foreground transition-transform ${isFlipped ? 'rotate-180' : ''}`} />
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <Trash2 className="w-3 h-3 text-destructive" />
            </Button>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            {isFlipped ? 'Resposta:' : 'Pergunta:'}
          </p>
          <p className="text-sm font-medium line-clamp-3">
            {isFlipped ? card.back : card.front}
          </p>
        </div>
      </div>
    </div>
  );
}

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
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={cardCount}
                    onChange={(e) => setCardCount(e.target.value)}
                    className="w-24"
                    placeholder="10"
                  />
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

          {/* Interactive Cards Preview */}
          {cards.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Cartões criados ({cards.length})</Label>
                <span className="text-xs text-muted-foreground">Clique para virar</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
                {cards.map((card, index) => (
                  <InteractiveCardPreview
                    key={card.id}
                    card={card}
                    index={index}
                    onRemove={() => handleRemoveCard(card.id)}
                  />
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
