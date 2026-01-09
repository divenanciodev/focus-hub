import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FlashcardGroup } from '@/types/flashcards';
import { FlashcardCreator } from '@/components/flashcards/FlashcardCreator';
import { FlashcardGroupList } from '@/components/flashcards/FlashcardGroupList';
import { FlashcardPractice } from '@/components/flashcards/FlashcardPractice';
import { CreateSimuladoModal } from '@/components/training/simulado/CreateSimuladoModal';
import { SimuladoSession } from '@/components/training/simulado/SimuladoSession';
import { CreateMindMapModal } from '@/components/training/mindmap/CreateMindMapModal';
import { MindMapViewer } from '@/components/training/mindmap/MindMapViewer';
import { ContentLibrary } from '@/components/training/ContentLibrary';
import { Simulado, TrainingType, TrainingMetrics, MindMap } from '@/types/training';
import { 
  Layers, 
  FileQuestion, 
  PenTool,
  Brain,
  FileText,
  PenLine,
  Building2,
  Mic,
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  FolderOpen,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

// Tipos de método de aprendizado
const learningMethods = [
  {
    id: 'flashcards' as TrainingType,
    name: 'Flashcards',
    description: 'Cartões de memorização com perguntas e respostas',
    icon: Layers,
    available: true,
  },
  {
    id: 'simulado' as TrainingType,
    name: 'Simulados',
    description: 'Questões de múltipla escolha com cronômetro',
    icon: FileQuestion,
    available: true,
  },
  {
    id: 'mindmap' as TrainingType,
    name: 'Mapas Mentais',
    description: 'Diagramas visuais para organizar ideias',
    icon: Brain,
    available: true,
  },
  {
    id: 'summary' as TrainingType,
    name: 'Resumos Guiados',
    description: 'Resumos com limite de caracteres e linhas',
    icon: FileText,
    available: false,
  },
  {
    id: 'handwriting' as TrainingType,
    name: 'Escrita Manual',
    description: 'Envie fotos de resumos escritos à mão',
    icon: PenLine,
    available: false,
  },
  {
    id: 'memory-palace' as TrainingType,
    name: 'Palácio da Memória',
    description: 'Associações visuais em ambientes',
    icon: Building2,
    available: false,
  },
  {
    id: 'audio-explanation' as TrainingType,
    name: 'Explicação em Áudio',
    description: 'Grave explicações sobre os conteúdos',
    icon: Mic,
    available: false,
  },
];

// Exemplos de Flashcards
const exampleFlashcardGroups: FlashcardGroup[] = [
  {
    id: 'example-1',
    name: 'Direito Constitucional - Princípios Fundamentais',
    cards: [
      {
        id: 'card-1',
        name: 'Fundamentos da República',
        type: 'flip',
        question: 'Quais são os 5 fundamentos da República Federativa do Brasil (Art. 1º)?',
        answer: 'I - Soberania\nII - Cidadania\nIII - Dignidade da pessoa humana\nIV - Valores sociais do trabalho e da livre iniciativa\nV - Pluralismo político',
        frontColor: '#3b82f6',
        backColor: '#1e40af',
        createdAt: new Date('2025-01-05'),
      },
      {
        id: 'card-2',
        name: 'Objetivos Fundamentais',
        type: 'multiple-choice',
        question: 'Qual NÃO é um objetivo fundamental da República (Art. 3º)?',
        answer: 'Garantir a segurança nacional',
        frontColor: '#8b5cf6',
        backColor: '#6d28d9',
        options: [
          { id: 'a', text: 'Construir uma sociedade livre', isCorrect: false },
          { id: 'b', text: 'Garantir o desenvolvimento nacional', isCorrect: false },
          { id: 'c', text: 'Garantir a segurança nacional', isCorrect: true },
          { id: 'd', text: 'Erradicar a pobreza', isCorrect: false },
        ],
        createdAt: new Date('2025-01-05'),
      },
      {
        id: 'card-3',
        name: 'Poderes da União',
        type: 'flip',
        question: 'Quais são os poderes da União, independentes e harmônicos entre si?',
        answer: 'Legislativo, Executivo e Judiciário (Art. 2º da CF/88)',
        frontColor: '#10b981',
        backColor: '#047857',
        createdAt: new Date('2025-01-05'),
      },
    ],
    createdAt: new Date('2025-01-05'),
  },
  {
    id: 'example-2',
    name: 'Português - Regência Verbal',
    cards: [
      {
        id: 'card-4',
        name: 'Verbo Assistir',
        type: 'flip',
        question: 'Qual a regência do verbo ASSISTIR no sentido de "ver"?',
        answer: 'Verbo Transitivo Indireto (VTI)\nExige preposição "a"\nEx: Assisti ao filme.',
        frontColor: '#f59e0b',
        backColor: '#d97706',
        createdAt: new Date('2025-01-04'),
      },
      {
        id: 'card-5',
        name: 'Verbo Visar',
        type: 'multiple-choice',
        question: 'Em qual sentido o verbo VISAR é transitivo direto?',
        answer: 'Mirar, apontar / Pôr visto',
        frontColor: '#ec4899',
        backColor: '#be185d',
        options: [
          { id: 'a', text: 'Ter como objetivo', isCorrect: false },
          { id: 'b', text: 'Mirar, apontar', isCorrect: true },
          { id: 'c', text: 'Desejar, pretender', isCorrect: false },
          { id: 'd', text: 'Todas as alternativas', isCorrect: false },
        ],
        createdAt: new Date('2025-01-04'),
      },
    ],
    createdAt: new Date('2025-01-04'),
    lastStudied: new Date('2025-01-06'),
  },
  {
    id: 'example-3',
    name: 'Raciocínio Lógico - Proposições',
    cards: [
      {
        id: 'card-6',
        name: 'Definição de Proposição',
        type: 'flip',
        question: 'O que é uma proposição lógica?',
        answer: 'É toda sentença declarativa que pode ser classificada como verdadeira (V) ou falsa (F), mas nunca ambas ao mesmo tempo.',
        frontColor: '#06b6d4',
        backColor: '#0891b2',
        createdAt: new Date('2025-01-03'),
      },
      {
        id: 'card-7',
        name: 'Identificação de Proposição',
        type: 'multiple-choice',
        question: 'Qual alternativa NÃO é uma proposição?',
        answer: 'Que horas são?',
        frontColor: '#84cc16',
        backColor: '#65a30d',
        options: [
          { id: 'a', text: 'O céu é azul', isCorrect: false },
          { id: 'b', text: '2 + 2 = 5', isCorrect: false },
          { id: 'c', text: 'Que horas são?', isCorrect: true },
          { id: 'd', text: 'Brasília é a capital do Brasil', isCorrect: false },
        ],
        createdAt: new Date('2025-01-03'),
      },
    ],
    createdAt: new Date('2025-01-03'),
  },
];

// Exemplos de Simulados
const exampleSimulados: Simulado[] = [
  {
    id: 'simulado-1',
    name: 'Simulado INSS 2025 - Direito Previdenciário',
    discipline: 'Direito Previdenciário',
    subject: 'Benefícios por incapacidade',
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        text: 'De acordo com a Lei 8.213/91, o auxílio por incapacidade temporária será devido ao segurado que ficar incapacitado para o seu trabalho por mais de quantos dias consecutivos?',
        options: ['7 dias', '15 dias', '30 dias', '60 dias'],
        correctAnswer: 1,
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        text: 'Qual é o período de carência para concessão do auxílio por incapacidade temporária?',
        options: ['6 contribuições mensais', '12 contribuições mensais', '24 contribuições mensais', 'Não há carência'],
        correctAnswer: 1,
      },
      {
        id: 'q3',
        type: 'multiple-choice',
        text: 'O benefício de aposentadoria por incapacidade permanente corresponde a qual percentual do salário de benefício?',
        options: ['60% + 2% por ano acima de 20 anos', '100%', '70%', '91%'],
        correctAnswer: 0,
      },
    ],
    timeMinutes: 30,
    difficulty: 'medium',
    status: 'pending',
    createdAt: new Date('2025-01-05'),
  },
  {
    id: 'simulado-2',
    name: 'Língua Portuguesa - Interpretação de Texto',
    discipline: 'Língua Portuguesa',
    subject: 'Compreensão textual',
    questions: [
      {
        id: 'q4',
        type: 'multiple-choice',
        text: 'A coesão textual é um mecanismo linguístico que garante a conexão entre as partes do texto. Qual elemento abaixo é um exemplo de coesão referencial?',
        options: ['Portanto', 'Ele', 'Mas', 'Porque'],
        correctAnswer: 1,
      },
      {
        id: 'q5',
        type: 'multiple-choice',
        text: 'Assinale a alternativa que apresenta uma figura de linguagem denominada "metonímia":',
        options: ['O amor é fogo que arde sem se ver', 'Li Machado de Assis nas férias', 'A vida é uma peça de teatro', 'O sol sorriu para nós'],
        correctAnswer: 1,
      },
    ],
    timeMinutes: 20,
    difficulty: 'easy',
    status: 'pending',
    createdAt: new Date('2025-01-04'),
  },
  {
    id: 'simulado-3',
    name: 'Informática - Segurança da Informação',
    discipline: 'Informática',
    subject: 'Conceitos de segurança',
    questions: [
      {
        id: 'q6',
        type: 'multiple-choice',
        text: 'Qual tipo de malware se disfarça de software legítimo para enganar o usuário?',
        options: ['Worm', 'Trojan (Cavalo de Troia)', 'Ransomware', 'Spyware'],
        correctAnswer: 1,
      },
      {
        id: 'q7',
        type: 'multiple-choice',
        text: 'O princípio da segurança da informação que garante que a informação seja acessível apenas por pessoas autorizadas é:',
        options: ['Integridade', 'Disponibilidade', 'Confidencialidade', 'Autenticidade'],
        correctAnswer: 2,
      },
      {
        id: 'q8',
        type: 'multiple-choice',
        text: 'O backup incremental armazena:',
        options: ['Todos os arquivos do sistema', 'Apenas os arquivos alterados desde o último backup completo', 'Apenas os arquivos alterados desde o último backup (qualquer tipo)', 'Apenas os arquivos do sistema operacional'],
        correctAnswer: 2,
      },
      {
        id: 'q9',
        type: 'multiple-choice',
        text: 'Qual protocolo é utilizado para garantir segurança na navegação web?',
        options: ['HTTP', 'FTP', 'HTTPS', 'SMTP'],
        correctAnswer: 2,
      },
    ],
    timeMinutes: 45,
    difficulty: 'medium',
    status: 'completed',
    score: 75,
    createdAt: new Date('2025-01-02'),
  },
];

export default function Treinos() {
  const [mainTab, setMainTab] = useState<'criar' | 'biblioteca'>('biblioteca');
  const [selectedMethod, setSelectedMethod] = useState<TrainingType | null>(null);
  
  // Flashcards state - new simplified system
  const [flashcardGroups, setFlashcardGroups] = useState<FlashcardGroup[]>(exampleFlashcardGroups);
  const [isCreatingFlashcards, setIsCreatingFlashcards] = useState(false);
  const [editingFlashcardGroup, setEditingFlashcardGroup] = useState<FlashcardGroup | undefined>();
  const [studyingFlashcardGroup, setStudyingFlashcardGroup] = useState<FlashcardGroup | null>(null);
  
  // Simulados state
  const [simulados, setSimulados] = useState<Simulado[]>(exampleSimulados);
  const [isCreateSimuladoOpen, setIsCreateSimuladoOpen] = useState(false);
  const [editingSimulado, setEditingSimulado] = useState<Simulado | undefined>();
  const [activeSimulado, setActiveSimulado] = useState<Simulado | null>(null);

  // Mind Maps state
  const [mindMaps, setMindMaps] = useState<MindMap[]>([]);
  const [isCreateMindMapOpen, setIsCreateMindMapOpen] = useState(false);
  const [editingMindMap, setEditingMindMap] = useState<MindMap | undefined>();
  const [viewingMindMap, setViewingMindMap] = useState<MindMap | null>(null);

  // Metrics
  const [metrics, setMetrics] = useState<TrainingMetrics>({
    totalTrainings: 0,
    totalStudyTimeMinutes: 0,
    byType: {
      'flashcards': 0,
      'simulado': 0,
      'activity': 0,
      'mindmap': 0,
      'summary': 0,
      'handwriting': 0,
      'memory-palace': 0,
      'audio-explanation': 0,
    },
    completedToday: 0,
  });

  const handleMethodClick = (method: typeof learningMethods[0]) => {
    setSelectedMethod(method.id);
  };

  // Flashcard handlers - new simplified system
  const handleSaveFlashcardGroup = (group: FlashcardGroup) => {
    if (editingFlashcardGroup) {
      setFlashcardGroups(flashcardGroups.map(g => g.id === group.id ? group : g));
    } else {
      setFlashcardGroups([group, ...flashcardGroups]);
      setMetrics(m => ({
        ...m,
        totalTrainings: m.totalTrainings + 1,
        byType: { ...m.byType, flashcards: m.byType.flashcards + 1 },
      }));
    }
    setIsCreatingFlashcards(false);
    setEditingFlashcardGroup(undefined);
    setSelectedMethod(null);
    setMainTab('biblioteca');
  };

  const handleDeleteFlashcardGroup = (groupId: string) => {
    setFlashcardGroups(flashcardGroups.filter(g => g.id !== groupId));
    toast.success('Grupo excluído');
  };

  const handleFlashcardStudyComplete = () => {
    if (studyingFlashcardGroup) {
      setFlashcardGroups(flashcardGroups.map(g => 
        g.id === studyingFlashcardGroup.id ? { ...g, lastStudied: new Date() } : g
      ));
    }
    setStudyingFlashcardGroup(null);
    setMetrics(m => ({
      ...m,
      totalStudyTimeMinutes: m.totalStudyTimeMinutes + 15,
      completedToday: m.completedToday + 1,
    }));
  };

  // Simulado handlers
  const handleCreateSimulado = (simulado: Simulado) => {
    if (editingSimulado) {
      // Editing existing simulado
      setSimulados(simulados.map(s => s.id === simulado.id ? simulado : s));
      setEditingSimulado(undefined);
      toast.success('Simulado atualizado!');
    } else {
      // Creating new simulado
      setSimulados([simulado, ...simulados]);
      setMetrics(m => ({
        ...m,
        totalTrainings: m.totalTrainings + 1,
        byType: { ...m.byType, simulado: m.byType.simulado + 1 },
      }));
      toast.success('Simulado criado! Disponível para treino na aba "Minha Biblioteca".');
    }
  };

  const handleDeleteSimulado = (simuladoId: string) => {
    setSimulados(simulados.filter(s => s.id !== simuladoId));
    toast.success('Simulado excluído');
  };

  const handleSimuladoComplete = (results: { score: number }) => {
    setMetrics(m => ({
      ...m,
      totalStudyTimeMinutes: m.totalStudyTimeMinutes + 30,
      completedToday: m.completedToday + 1,
    }));
    if (activeSimulado) {
      setSimulados(simulados.map(s => 
        s.id === activeSimulado.id 
          ? { ...s, status: 'completed' as const, score: results.score }
          : s
      ));
    }
  };

  // Mind Map handlers
  const handleCreateMindMap = (mindmap: MindMap) => {
    if (editingMindMap) {
      setMindMaps(mindMaps.map(m => m.id === mindmap.id ? mindmap : m));
      setEditingMindMap(undefined);
      toast.success('Mapa mental atualizado!');
    } else {
      setMindMaps([mindmap, ...mindMaps]);
      setMetrics(m => ({
        ...m,
        totalTrainings: m.totalTrainings + 1,
        byType: { ...m.byType, mindmap: m.byType.mindmap + 1 },
      }));
      toast.success('Mapa mental criado! Disponível na aba "Minha Biblioteca".');
    }
  };

  const handleDeleteMindMap = (mindmapId: string) => {
    setMindMaps(mindMaps.filter(m => m.id !== mindmapId));
    toast.success('Mapa mental excluído');
  };

  // Available content for practice
  const availableGroups = flashcardGroups.filter(g => g.cards.length > 0);
  const availableSimulados = simulados.filter(s => s.questions.length > 0);
  const totalAvailable = availableGroups.length + availableSimulados.length;

  // Render flashcard practice mode
  if (studyingFlashcardGroup) {
    return (
      <FlashcardPractice
        group={studyingFlashcardGroup}
        onClose={() => setStudyingFlashcardGroup(null)}
        onComplete={handleFlashcardStudyComplete}
      />
    );
  }

  // Render flashcard creation mode
  if (isCreatingFlashcards) {
    return (
      <div className="fade-in">
        <FlashcardCreator
          onSave={handleSaveFlashcardGroup}
          onCancel={() => {
            setIsCreatingFlashcards(false);
            setEditingFlashcardGroup(undefined);
            setSelectedMethod(null);
          }}
          editingGroup={editingFlashcardGroup}
        />
      </div>
    );
  }

  if (activeSimulado) {
    return (
      <SimuladoSession
        simulado={activeSimulado}
        onClose={() => setActiveSimulado(null)}
        onComplete={handleSimuladoComplete}
      />
    );
  }

  if (viewingMindMap) {
    return (
      <MindMapViewer
        mindMap={viewingMindMap}
        onClose={() => setViewingMindMap(null)}
      />
    );
  }

  // Render method configuration view
  const renderMethodConfig = () => {
    if (selectedMethod === 'flashcards') {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setSelectedMethod(null)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h3 className="font-semibold text-foreground text-lg">Flashcards</h3>
              <p className="text-sm text-muted-foreground">Gerencie seus cartões de memorização</p>
            </div>
          </div>

          {flashcardGroups.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
              <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum grupo de flashcards criado ainda</p>
              <p className="text-sm mb-4">Crie seu primeiro grupo para começar</p>
              <Button onClick={() => {
                setEditingFlashcardGroup(undefined);
                setIsCreatingFlashcards(true);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Flashcards
              </Button>
            </div>
          ) : (
            <FlashcardGroupList
              groups={flashcardGroups}
              onStudy={(group) => setStudyingFlashcardGroup(group)}
              onEdit={(group) => {
                setEditingFlashcardGroup(group);
                setIsCreatingFlashcards(true);
              }}
              onDelete={handleDeleteFlashcardGroup}
            />
          )}
        </div>
      );
    }

    if (selectedMethod === 'simulado') {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setSelectedMethod(null)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h3 className="font-semibold text-foreground text-lg">Simulados</h3>
              <p className="text-sm text-muted-foreground">Gerencie seus simulados</p>
            </div>
          </div>

          {simulados.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
              <FileQuestion className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum simulado criado ainda</p>
              <p className="text-sm mb-4">Crie seu primeiro simulado para começar</p>
              <Button onClick={() => setIsCreateSimuladoOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Simulado
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {simulados.map((simulado) => (
                <div key={simulado.id} className="bg-card border border-border rounded-xl p-5 flex flex-col h-full">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <FileQuestion className="w-5 h-5 text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground">{simulado.name}</h4>
                      <p className="text-sm text-muted-foreground">{simulado.discipline}</p>
                    </div>
                    <span className="text-xs bg-secondary px-2 py-1 rounded-full shrink-0">
                      {simulado.questions.length} questões
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 flex-1">
                    {simulado.timeMinutes} min • {simulado.difficulty === 'easy' ? 'Fácil' : simulado.difficulty === 'hard' ? 'Difícil' : 'Médio'}
                  </p>
                  <div className="flex gap-2 mt-auto">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        setEditingSimulado(simulado);
                        setIsCreateSimuladoOpen(true);
                      }}
                    >
                      <Pencil className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteSimulado(simulado.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (selectedMethod === 'mindmap') {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setSelectedMethod(null)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h3 className="font-semibold text-foreground text-lg">Mapas Mentais</h3>
              <p className="text-sm text-muted-foreground">Organize suas ideias visualmente</p>
            </div>
          </div>

          {mindMaps.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
              <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum mapa mental criado ainda</p>
              <p className="text-sm mb-4">Crie seu primeiro mapa mental para começar</p>
              <Button onClick={() => setIsCreateMindMapOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Mapa Mental
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {mindMaps.map((mindmap) => (
                <div key={mindmap.id} className="bg-card border border-border rounded-xl p-5 flex flex-col h-full">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <Brain className="w-5 h-5 text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground">{mindmap.name}</h4>
                      <p className="text-sm text-muted-foreground">{mindmap.discipline || 'Geral'}</p>
                    </div>
                    <span className="text-xs bg-secondary px-2 py-1 rounded-full shrink-0">
                      {mindmap.nodes.length} nós
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 flex-1">
                    Criado em {new Date(mindmap.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                  <div className="flex gap-2 mt-auto">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        setEditingMindMap(mindmap);
                        setIsCreateMindMapOpen(true);
                      }}
                    >
                      <Pencil className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteMindMap(mindmap.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (selectedMethod === 'summary') {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setSelectedMethod(null)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h3 className="font-semibold text-foreground text-lg">Resumos Guiados</h3>
              <p className="text-sm text-muted-foreground">Crie resumos estruturados</p>
            </div>
          </div>

          <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum resumo criado ainda</p>
            <p className="text-sm mb-4">Crie seu primeiro resumo guiado para começar</p>
            <Button onClick={() => toast.info('Resumos Guiados será implementado em breve!')}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Resumo
            </Button>
          </div>
        </div>
      );
    }

    if (selectedMethod === 'handwriting') {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setSelectedMethod(null)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h3 className="font-semibold text-foreground text-lg">Escrita Manual</h3>
              <p className="text-sm text-muted-foreground">Envie resumos escritos à mão</p>
            </div>
          </div>

          <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
            <PenLine className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma escrita enviada ainda</p>
            <p className="text-sm mb-4">Envie sua primeira foto de resumo para começar</p>
            <Button onClick={() => toast.info('Escrita Manual será implementado em breve!')}>
              <Plus className="w-4 h-4 mr-2" />
              Enviar Escrita
            </Button>
          </div>
        </div>
      );
    }

    if (selectedMethod === 'memory-palace') {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setSelectedMethod(null)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h3 className="font-semibold text-foreground text-lg">Palácio da Memória</h3>
              <p className="text-sm text-muted-foreground">Crie associações visuais em ambientes</p>
            </div>
          </div>

          <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum palácio criado ainda</p>
            <p className="text-sm mb-4">Crie seu primeiro palácio da memória para começar</p>
            <Button onClick={() => toast.info('Palácio da Memória será implementado em breve!')}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Palácio
            </Button>
          </div>
        </div>
      );
    }

    if (selectedMethod === 'audio-explanation') {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setSelectedMethod(null)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h3 className="font-semibold text-foreground text-lg">Explicação em Áudio</h3>
              <p className="text-sm text-muted-foreground">Grave explicações sobre os conteúdos</p>
            </div>
          </div>

          <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
            <Mic className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma gravação criada ainda</p>
            <p className="text-sm mb-4">Grave sua primeira explicação para começar</p>
            <Button onClick={() => toast.info('Explicação em Áudio será implementado em breve!')}>
              <Plus className="w-4 h-4 mr-2" />
              Gravar Áudio
            </Button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="Treinos & Simulados"
        description="Ambiente completo de treino cognitivo com múltiplas técnicas de estudo"
      />

      {/* Main Tabs: Criar vs Biblioteca */}
      <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as 'criar' | 'biblioteca')} className="mt-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="criar" className="flex items-center gap-2">
            <PenTool className="w-4 h-4" />
            Criar Conteúdo
          </TabsTrigger>
          <TabsTrigger value="biblioteca" className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            Minha Biblioteca
          </TabsTrigger>
        </TabsList>

        {/* TAB: Criar Conteúdo */}
        <TabsContent value="criar" className="mt-6">
          {selectedMethod ? (
            renderMethodConfig()
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-1">Escolha um método de estudo</h3>
                <p className="text-sm text-muted-foreground">Selecione o tipo de conteúdo que deseja criar</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {learningMethods.map((method) => {
                  const Icon = method.icon;
                  const contentCount = method.id === 'flashcards' 
                    ? flashcardGroups.length 
                    : method.id === 'simulado' 
                      ? simulados.length 
                      : method.id === 'mindmap'
                        ? mindMaps.length
                        : 0;
                  
                  return (
                    <button
                      key={method.id}
                      onClick={() => handleMethodClick(method)}
                      className={`relative bg-card border border-border rounded-xl p-6 text-left hover:border-foreground/20 hover:shadow-md transition-all duration-200 ${
                        !method.available ? 'opacity-60' : ''
                      }`}
                    >
                      {!method.available && (
                        <span className="absolute top-3 right-3 text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                          Em breve
                        </span>
                      )}
                      {contentCount > 0 && method.available && (
                        <span className="absolute top-3 right-3 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {contentCount} criado{contentCount > 1 ? 's' : ''}
                        </span>
                      )}
                      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-foreground" />
                      </div>
                      <h4 className="font-semibold text-foreground mb-1">{method.name}</h4>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>

        {/* TAB: Minha Biblioteca */}
        <TabsContent value="biblioteca" className="mt-6">
          <ContentLibrary
            flashcardGroups={flashcardGroups}
            simulados={simulados}
            mindMaps={mindMaps}
            onStudyFlashcard={(group) => setStudyingFlashcardGroup(group)}
            onEditFlashcard={(group) => {
              setEditingFlashcardGroup(group);
              setIsCreatingFlashcards(true);
            }}
            onDeleteFlashcard={handleDeleteFlashcardGroup}
            onStartSimulado={(simulado) => setActiveSimulado(simulado)}
            onDeleteSimulado={handleDeleteSimulado}
            onViewMindMap={(mindMap) => setViewingMindMap(mindMap)}
          />
        </TabsContent>
      </Tabs>

      <CreateSimuladoModal
        open={isCreateSimuladoOpen}
        onOpenChange={(open) => {
          setIsCreateSimuladoOpen(open);
          if (!open) setEditingSimulado(undefined);
        }}
        onSubmit={handleCreateSimulado}
        editingSimulado={editingSimulado}
      />

      <CreateMindMapModal
        open={isCreateMindMapOpen}
        onOpenChange={(open) => {
          setIsCreateMindMapOpen(open);
          if (!open) setEditingMindMap(undefined);
        }}
        onSubmit={handleCreateMindMap}
        editingMindMap={editingMindMap}
      />
    </div>
  );
}
