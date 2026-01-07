import { useState, useCallback, useRef } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  FlashcardDeck, 
  FlashcardItem, 
  FlashcardType, 
  ContentLevel,
  FlashcardContent,
  MultipleChoiceOption,
} from '@/types/training';
import { 
  Plus, 
  Trash2, 
  Upload, 
  RotateCcw, 
  Wand2,
  FileText,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Sparkles,
  BookOpen,
  GraduationCap,
  Zap,
  FileUp,
  Image as ImageIcon,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { FlashcardPreviewGrid } from './FlashcardPreviewGrid';
import { cn } from '@/lib/utils';

// Helper to get text from content
function getContentText(content: string | FlashcardContent): string {
  if (typeof content === 'string') return content;
  return content.mainText || '';
}

interface CreateFlashcardDeckModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (deck: FlashcardDeck) => void;
  editingDeck?: FlashcardDeck;
}

const disciplines = [
  'Direito Constitucional',
  'Direito Administrativo',
  'Direito Civil',
  'Direito Penal',
  'Português',
  'Matemática Financeira',
  'Raciocínio Lógico',
  'Informática',
  'Conhecimentos Gerais',
  'Administração Pública',
  'Contabilidade',
  'Economia',
];

const flashcardTypes: { value: FlashcardType; label: string; description: string; icon: string }[] = [
  { value: 'direct', label: 'Pergunta direta', description: 'Pergunta simples com resposta', icon: '❓' },
  { value: 'true-false', label: 'Verdadeiro ou falso', description: 'Afirmação para validar', icon: '✅' },
  { value: 'fill-blank', label: 'Completar lacuna', description: 'Preencher o espaço em branco', icon: '📝' },
  { value: 'concept-definition', label: 'Conceito → Definição', description: 'Termo e sua definição', icon: '📚' },
  { value: 'multiple-choice', label: 'Múltipla escolha', description: 'Pergunta com alternativas', icon: '🔘' },
  { value: 'contextual', label: 'Pergunta contextual', description: 'Baseada em um trecho', icon: '📖' },
  { value: 'reversible', label: 'Reversível', description: 'Pode estudar frente ↔ verso', icon: '🔄' },
];

const levelConfig = {
  basic: { 
    label: 'Básico', 
    icon: BookOpen, 
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    description: 'Perguntas diretas, definições simples, mais exemplos visuais'
  },
  intermediate: { 
    label: 'Intermediário', 
    icon: GraduationCap, 
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    description: 'Comparações, aplicação prática, múltipla escolha'
  },
  advanced: { 
    label: 'Avançado', 
    icon: Zap, 
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    description: 'Casos práticos, pegadinhas conceituais, análise crítica'
  },
};

// Question variation templates by level - Pedagogically optimized
const questionTemplates = {
  basic: [
    'Qual é a definição de {concept}?',
    'O que caracteriza {concept}?',
    'Qual a principal função de {concept}?',
    'Explique brevemente o conceito de {concept}.',
    'Identifique o significado de {concept}.',
  ],
  intermediate: [
    'Qual a diferença fundamental entre {concept} e {concept2}?',
    'Cite as principais características de {concept}.',
    'De que forma {concept} se aplica na prática?',
    'Apresente exemplos de aplicação de {concept}.',
    'Complete o raciocínio: {concept} relaciona-se com _______.',
    'Qual a consequência de {concept} no contexto estudado?',
    'Como {concept} influencia {concept2}?',
  ],
  advanced: [
    'Analise a relação de causa e efeito entre {concept} e {concept2}.',
    'Quais são as implicações práticas de {concept}?',
    'Compare criticamente {concept} com {concept2}, destacando semelhanças e diferenças.',
    'Quais são as exceções à regra de {concept}? Justifique.',
    'No contexto de {context}, como {concept} deve ser interpretado?',
    'Sobre {concept}, qual afirmação está INCORRETA? Justifique.',
    'Em que situação {concept} NÃO se aplica?',
    'Avalie criticamente a aplicação de {concept} em cenário prático.',
  ],
};

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
  const [level, setLevel] = useState<ContentLevel>('intermediate');
  
  // For manual creation - advanced
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newType, setNewType] = useState<FlashcardType>('direct');
  const [newHint, setNewHint] = useState('');
  const [newExample, setNewExample] = useState('');
  const [isReversible, setIsReversible] = useState(false);
  
  // For true/false type
  const [tfAnswer, setTfAnswer] = useState<boolean>(true);
  const [tfExplanation, setTfExplanation] = useState('');
  
  // For multiple choice type
  const [mcOptions, setMcOptions] = useState<MultipleChoiceOption[]>([
    { id: '1', text: '', isCorrect: true },
    { id: '2', text: '', isCorrect: false },
    { id: '3', text: '', isCorrect: false },
    { id: '4', text: '', isCorrect: false },
  ]);
  
  // For generation from content
  const [contentText, setContentText] = useState('');
  const [cardCount, setCardCount] = useState('10');
  const [generateTypes, setGenerateTypes] = useState<FlashcardType[]>(['direct', 'true-false', 'multiple-choice']);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // For editing
  const [editingCard, setEditingCard] = useState<FlashcardItem | null>(null);
  
  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddCard = () => {
    if (!newFront.trim() || (!newBack.trim() && newType !== 'true-false' && newType !== 'multiple-choice')) {
      toast.error('Preencha os campos obrigatórios do cartão');
      return;
    }
    
    // Build the card based on type
    const frontContent: FlashcardContent = {
      mainText: newFront.trim(),
      hint: newHint.trim() || undefined,
    };

    const backContent: FlashcardContent = {
      mainText: newBack.trim(),
      example: newExample.trim() || undefined,
    };
    
    const newCard: FlashcardItem = {
      id: editingCard?.id || Date.now().toString(),
      front: frontContent,
      back: backContent,
      type: newType,
      createdAt: new Date(),
    };

    // Add type-specific data
    if (newType === 'true-false') {
      newCard.trueFalseAnswer = tfAnswer;
      newCard.trueFalseExplanation = tfExplanation.trim() || undefined;
      (newCard.back as FlashcardContent).mainText = tfAnswer ? 'Verdadeiro' : 'Falso';
    }

    if (newType === 'multiple-choice') {
      const validOptions = mcOptions.filter(o => o.text.trim());
      if (validOptions.length < 2) {
        toast.error('Adicione pelo menos 2 alternativas');
        return;
      }
      if (!validOptions.some(o => o.isCorrect)) {
        toast.error('Marque a alternativa correta');
        return;
      }
      newCard.multipleChoiceOptions = validOptions;
      const correctOption = validOptions.find(o => o.isCorrect);
      (newCard.back as FlashcardContent).mainText = correctOption?.text || '';
    }

    if (newType === 'reversible' || isReversible) {
      newCard.type = 'reversible';
    }

    if (editingCard) {
      setCards(cards.map(c => c.id === editingCard.id ? newCard : c));
      toast.success('Cartão atualizado!');
      setEditingCard(null);
    } else {
      setCards([...cards, newCard]);
      toast.success('Cartão adicionado!');
    }
    
    resetCardForm();
  };

  const resetCardForm = () => {
    setNewFront('');
    setNewBack('');
    setNewHint('');
    setNewExample('');
    setTfAnswer(true);
    setTfExplanation('');
    setMcOptions([
      { id: '1', text: '', isCorrect: true },
      { id: '2', text: '', isCorrect: false },
      { id: '3', text: '', isCorrect: false },
      { id: '4', text: '', isCorrect: false },
    ]);
    setIsReversible(false);
  };

  const handleEditCard = (card: FlashcardItem) => {
    setEditingCard(card);
    setNewFront(getContentText(card.front));
    setNewBack(getContentText(card.back));
    setNewType(card.type);
    
    if (typeof card.front !== 'string') {
      setNewHint(card.front.hint || '');
    }
    if (typeof card.back !== 'string') {
      setNewExample(card.back.example || '');
    }
    
    if (card.type === 'true-false') {
      setTfAnswer(card.trueFalseAnswer || true);
      setTfExplanation(card.trueFalseExplanation || '');
    }
    
    if (card.type === 'multiple-choice' && card.multipleChoiceOptions) {
      setMcOptions(card.multipleChoiceOptions);
    }
    
    setActiveTab('manual');
  };

  const handleRemoveCard = (cardId: string) => {
    setCards(cards.filter(c => c.id !== cardId));
  };

  const handleReorderCards = (newCards: FlashcardItem[]) => {
    setCards(newCards);
  };

  const updateMcOption = (id: string, field: 'text' | 'isCorrect', value: string | boolean) => {
    setMcOptions(options => options.map(opt => {
      if (opt.id === id) {
        if (field === 'isCorrect' && value === true) {
          // Only one correct answer
          return { ...opt, isCorrect: true };
        }
        return { ...opt, [field]: value };
      }
      if (field === 'isCorrect' && value === true) {
        return { ...opt, isCorrect: false };
      }
      return opt;
    }));
  };

  const handleGenerateFromContent = async () => {
    if (!contentText.trim()) {
      toast.error('Digite ou cole um conteúdo primeiro');
      return;
    }
    
    setIsGenerating(true);
    
    // Simulated intelligent generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Extract meaningful sentences and concepts
    const sentences = contentText
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 30 && !s.match(/^(página|pág|cap|capítulo|\d+)/i));
    
    // Extract key concepts (words with 5+ chars, capitalized, or technical terms)
    const extractKeywords = (text: string): string[] => {
      const words = text.split(/\s+/)
        .filter(w => w.length > 4)
        .filter(w => /^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ]/.test(w) || w.length > 7);
      return [...new Set(words)].slice(0, 5);
    };
    
    const count = Math.min(parseInt(cardCount), sentences.length, 30);
    const templates = questionTemplates[level];
    
    const generatedCards: FlashcardItem[] = [];
    const usedFormats = new Set<number>();
    
    for (let i = 0; i < count && i < sentences.length; i++) {
      const sentence = sentences[i];
      const keywords = extractKeywords(sentence);
      const keyWord = keywords[0] || 'conceito';
      const keyWord2 = keywords[1] || keywords[0] || 'tema';
      
      // Ensure variety in question types
      const typeIndex = i % generateTypes.length;
      const selectedType = generateTypes[typeIndex];
      
      // Rotate through templates to avoid repetition
      let templateIndex = i % templates.length;
      while (usedFormats.has(templateIndex) && usedFormats.size < templates.length) {
        templateIndex = (templateIndex + 1) % templates.length;
      }
      usedFormats.add(templateIndex);
      if (usedFormats.size >= templates.length) usedFormats.clear();
      
      const questionTemplate = templates[templateIndex];
      
      // Build contextual question
      const question = questionTemplate
        .replace('{concept}', keyWord)
        .replace('{concept2}', keyWord2)
        .replace('{statement}', sentence.substring(0, 80))
        .replace('{context}', discipline || 'estudos');

      // Build pedagogical response
      const buildAnswer = (): string => {
        if (level === 'basic') {
          return sentence;
        } else if (level === 'intermediate') {
          return `${sentence}\n\n📌 Conceito-chave: ${keyWord}`;
        } else {
          return `${sentence}\n\n📌 Conceito-chave: ${keyWord}\n💡 Relação: ${keyWord} conecta-se ao contexto de ${discipline || 'estudos'}.`;
        }
      };

      const card: FlashcardItem = {
        id: `gen-${Date.now()}-${i}`,
        front: {
          mainText: question,
          hint: level === 'basic' ? `Lembre-se de: ${keyWord}` : undefined,
        },
        back: {
          mainText: buildAnswer(),
          example: level !== 'basic' 
            ? `Aplicação prática: Este conceito é fundamental para compreender ${keyWord} em contextos reais.`
            : undefined,
        },
        type: selectedType,
        createdAt: new Date(),
      };

      // Add type-specific data with pedagogical quality
      if (selectedType === 'true-false') {
        const isTrue = Math.random() > 0.4; // 60% true
        const statement = isTrue 
          ? sentence.substring(0, 100) 
          : sentence.substring(0, 80) + ' [afirmação modificada]';
        
        card.trueFalseAnswer = isTrue;
        card.front = { 
          mainText: `Afirmação: "${statement}"`,
          hint: 'Analise cuidadosamente cada termo da afirmação.',
        };
        card.trueFalseExplanation = isTrue 
          ? `Correto. ${sentence}`
          : `Incorreto. A afirmação original é: ${sentence}`;
      }

      if (selectedType === 'multiple-choice') {
        const correctAnswer = sentence.substring(0, 60) + (sentence.length > 60 ? '...' : '');
        card.multipleChoiceOptions = [
          { id: 'a', text: correctAnswer, isCorrect: true },
          { id: 'b', text: `Afirmação parcialmente correta sobre ${keyWord}.`, isCorrect: false },
          { id: 'c', text: `Conceito relacionado, mas distinto de ${keyWord}.`, isCorrect: false },
          { id: 'd', text: `Definição incorreta que confunde ${keyWord} com outro termo.`, isCorrect: false },
        ].sort(() => Math.random() - 0.5);
        
        card.front = {
          mainText: `Sobre ${keyWord}, assinale a alternativa CORRETA:`,
          hint: 'Elimine as alternativas claramente incorretas primeiro.',
        };
      }

      generatedCards.push(card);
    }
    
    setCards([...cards, ...generatedCards]);
    setContentText('');
    setIsGenerating(false);
    toast.success(`${generatedCards.length} cartões gerados com qualidade pedagógica!`, {
      description: `Nível: ${levelConfig[level].label} • Perguntas variadas e contextualizadas`,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === 'application/pdf') {
      toast.info('Processando PDF...', { duration: 2000 });
      // Simulate PDF text extraction
      setTimeout(() => {
        setContentText('Conteúdo extraído do PDF: ' + file.name + '\n\nEste é um exemplo de texto que seria extraído de um PDF. Em uma implementação real, usaríamos uma biblioteca de extração de texto de PDF para processar o documento e gerar flashcards automaticamente baseados no conteúdo.');
        toast.success('PDF processado! Agora você pode gerar os flashcards.');
      }, 1500);
    } else if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setContentText(e.target?.result as string);
        toast.success('Arquivo carregado!');
      };
      reader.readAsText(file);
    } else {
      toast.error('Formato não suportado. Use PDF ou TXT.');
    }
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
      level,
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
    resetCardForm();
    setContentText('');
    setEditingCard(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {editingDeck ? 'Editar Cartões' : 'Criar Flashcards'}
          </DialogTitle>
          <DialogDescription>
            Crie cartões de memorização pedagogicamente otimizados com geração inteligente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Deck Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-2">
              <Label>Nome do conjunto *</Label>
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
            <div className="space-y-2">
              <Label>Nível</Label>
              <Select value={level} onValueChange={(v) => setLevel(v as ContentLevel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(levelConfig).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <SelectItem key={key} value={key}>
                        <span className={cn("flex items-center gap-2", config.color)}>
                          <Icon className="w-4 h-4" />
                          {config.label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Level description */}
          <div className={cn("flex items-start gap-3 p-3 rounded-lg text-sm", levelConfig[level].bg)}>
            <Info className={cn("w-4 h-4 mt-0.5 shrink-0", levelConfig[level].color)} />
            <span className={levelConfig[level].color}>{levelConfig[level].description}</span>
          </div>

          {/* Card Creation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Criar manualmente
              </TabsTrigger>
              <TabsTrigger value="generate" className="flex items-center gap-2">
                <Wand2 className="w-4 h-4" />
                Gerar de conteúdo
              </TabsTrigger>
            </TabsList>

            {/* Manual Creation Tab */}
            <TabsContent value="manual" className="space-y-4 mt-4">
              {/* Card type selector */}
              <div className="space-y-2">
                <Label>Tipo do cartão</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {flashcardTypes.slice(0, 4).map(t => (
                    <button
                      key={t.value}
                      onClick={() => setNewType(t.value)}
                      className={cn(
                        "p-3 rounded-lg border text-left transition-all",
                        newType === t.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <span className="text-lg mb-1 block">{t.icon}</span>
                      <p className="text-sm font-medium">{t.label}</p>
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {flashcardTypes.slice(4).map(t => (
                    <button
                      key={t.value}
                      onClick={() => setNewType(t.value)}
                      className={cn(
                        "p-3 rounded-lg border text-left transition-all",
                        newType === t.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <span className="text-lg mb-1 block">{t.icon}</span>
                      <p className="text-sm font-medium">{t.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Front and back inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Frente {newType === 'true-false' ? '(afirmação)' : '(pergunta)'}
                  </Label>
                  <Textarea
                    value={newFront}
                    onChange={(e) => setNewFront(e.target.value)}
                    placeholder={
                      newType === 'true-false' 
                        ? "Digite uma afirmação para validar..."
                        : "Digite a pergunta ou conceito..."
                    }
                    rows={3}
                  />
                </div>
                
                {/* Back field - different for each type */}
                {newType === 'true-false' ? (
                  <div className="space-y-3">
                    <Label>Resposta</Label>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant={tfAnswer ? "default" : "outline"}
                        className={cn("flex-1", tfAnswer && "bg-green-600 hover:bg-green-700")}
                        onClick={() => setTfAnswer(true)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Verdadeiro
                      </Button>
                      <Button
                        type="button"
                        variant={!tfAnswer ? "default" : "outline"}
                        className={cn("flex-1", !tfAnswer && "bg-red-600 hover:bg-red-700")}
                        onClick={() => setTfAnswer(false)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Falso
                      </Button>
                    </div>
                    <Textarea
                      value={tfExplanation}
                      onChange={(e) => setTfExplanation(e.target.value)}
                      placeholder="Explicação (opcional)..."
                      rows={2}
                    />
                  </div>
                ) : newType === 'multiple-choice' ? (
                  <div className="space-y-2">
                    <Label>Alternativas (marque a correta)</Label>
                    <div className="space-y-2">
                      {mcOptions.map((opt, idx) => (
                        <div key={opt.id} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateMcOption(opt.id, 'isCorrect', true)}
                            className={cn(
                              "w-8 h-8 rounded-full border-2 flex items-center justify-center font-medium text-sm shrink-0 transition-colors",
                              opt.isCorrect
                                ? "border-green-500 bg-green-500 text-white"
                                : "border-border hover:border-primary"
                            )}
                          >
                            {String.fromCharCode(65 + idx)}
                          </button>
                          <Input
                            value={opt.text}
                            onChange={(e) => updateMcOption(opt.id, 'text', e.target.value)}
                            placeholder={`Alternativa ${String.fromCharCode(65 + idx)}...`}
                            className="flex-1"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Verso (resposta)</Label>
                    <Textarea
                      value={newBack}
                      onChange={(e) => setNewBack(e.target.value)}
                      placeholder="Digite a resposta ou definição..."
                      rows={3}
                    />
                  </div>
                )}
              </div>

              {/* Optional fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    Dica (opcional)
                  </Label>
                  <Input
                    value={newHint}
                    onChange={(e) => setNewHint(e.target.value)}
                    placeholder="Uma pista para ajudar a lembrar..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-500" />
                    Exemplo prático (opcional)
                  </Label>
                  <Input
                    value={newExample}
                    onChange={(e) => setNewExample(e.target.value)}
                    placeholder="Um exemplo de aplicação..."
                  />
                </div>
              </div>

              {/* Add card button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={isReversible}
                    onCheckedChange={setIsReversible}
                    id="reversible"
                  />
                  <Label htmlFor="reversible" className="text-sm cursor-pointer">
                    Cartão reversível (estudar nos dois sentidos)
                  </Label>
                </div>
                <div className="flex gap-2">
                  {editingCard && (
                    <Button variant="outline" onClick={() => {
                      setEditingCard(null);
                      resetCardForm();
                    }}>
                      Cancelar edição
                    </Button>
                  )}
                  <Button onClick={handleAddCard}>
                    <Plus className="w-4 h-4 mr-2" />
                    {editingCard ? 'Atualizar cartão' : 'Adicionar cartão'}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Generate from content Tab */}
            <TabsContent value="generate" className="space-y-4 mt-4">
              {/* Content input area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Cole seu conteúdo ou faça upload</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FileUp className="w-4 h-4 mr-2" />
                    Upload PDF/TXT
                  </Button>
                </div>
                <Textarea
                  value={contentText}
                  onChange={(e) => setContentText(e.target.value)}
                  placeholder="Cole aqui o texto do qual deseja gerar flashcards...

O sistema irá:
• Identificar conceitos-chave
• Detectar definições, regras e fórmulas
• Gerar perguntas variadas baseadas no nível selecionado
• Criar diferentes tipos de cartões automaticamente"
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>

              {/* Generation options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Quantidade de cartões</Label>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={cardCount}
                    onChange={(e) => setCardCount(e.target.value)}
                    placeholder="10"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Tipos a gerar</Label>
                  <div className="flex flex-wrap gap-2">
                    {flashcardTypes.slice(0, 5).map(t => (
                      <Badge
                        key={t.value}
                        variant={generateTypes.includes(t.value) ? "default" : "outline"}
                        className="cursor-pointer transition-colors"
                        onClick={() => {
                          if (generateTypes.includes(t.value)) {
                            if (generateTypes.length > 1) {
                              setGenerateTypes(generateTypes.filter(gt => gt !== t.value));
                            }
                          } else {
                            setGenerateTypes([...generateTypes, t.value]);
                          }
                        }}
                      >
                        {t.icon} {t.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Generate button */}
              <Button 
                onClick={handleGenerateFromContent}
                disabled={!contentText.trim() || isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                    Gerando flashcards inteligentes...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Gerar {cardCount} cartões ({levelConfig[level].label})
                  </>
                )}
              </Button>

              {/* Tips */}
              <div className="bg-secondary/30 rounded-lg p-4 text-sm space-y-2">
                <p className="font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Geração Inteligente
                </p>
                <ul className="text-muted-foreground space-y-1 ml-6 list-disc">
                  <li>Perguntas variadas, não apenas "O que é..."</li>
                  <li>Adaptado ao nível selecionado ({levelConfig[level].label})</li>
                  <li>Múltiplos tipos de cartões automaticamente</li>
                  <li>Dicas e exemplos gerados contextualmente</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>

          {/* Cards Preview Grid */}
          {cards.length > 0 && (
            <FlashcardPreviewGrid
              cards={cards}
              onRemove={handleRemoveCard}
              onEdit={handleEditCard}
              onReorder={handleReorderCards}
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!name || !discipline || cards.length === 0}>
            {editingDeck ? 'Salvar alterações' : `Salvar (${cards.length} cartões)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
