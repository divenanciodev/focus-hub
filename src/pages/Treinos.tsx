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
import { Simulado, TrainingType, TrainingMetrics } from '@/types/training';
import { 
  Layers, 
  FileQuestion, 
  Play, 
  PenTool,
  Brain,
  FileText,
  PenLine,
  Building2,
  Mic,
  ArrowLeft,
  Plus,
  Pencil,
  Trash2
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
    available: false,
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

export default function Treinos() {
  const [mainTab, setMainTab] = useState<'criar' | 'praticar'>('praticar');
  const [selectedMethod, setSelectedMethod] = useState<TrainingType | null>(null);
  
  // Flashcards state - new simplified system
  const [flashcardGroups, setFlashcardGroups] = useState<FlashcardGroup[]>([]);
  const [isCreatingFlashcards, setIsCreatingFlashcards] = useState(false);
  const [editingFlashcardGroup, setEditingFlashcardGroup] = useState<FlashcardGroup | undefined>();
  const [studyingFlashcardGroup, setStudyingFlashcardGroup] = useState<FlashcardGroup | null>(null);
  
  // Simulados state
  const [simulados, setSimulados] = useState<Simulado[]>([]);
  const [isCreateSimuladoOpen, setIsCreateSimuladoOpen] = useState(false);
  const [activeSimulado, setActiveSimulado] = useState<Simulado | null>(null);

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
    if (!method.available) {
      toast.info(`${method.name} será implementado em breve!`);
      return;
    }
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
    setMainTab('praticar');
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
    setSimulados([simulado, ...simulados]);
    setMetrics(m => ({
      ...m,
      totalTrainings: m.totalTrainings + 1,
      byType: { ...m.byType, simulado: m.byType.simulado + 1 },
    }));
    toast.success('Simulado criado! Disponível para treino na aba "Praticar".');
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

  // Render method configuration view
  const renderMethodConfig = () => {
    if (selectedMethod === 'flashcards') {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
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
            <Button onClick={() => {
              setEditingDeck(undefined);
              setIsCreateDeckOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Cartão
            </Button>
          </div>

          {flashcardDecks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
              <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum cartão criado ainda</p>
              <p className="text-sm mb-4">Crie seus primeiros cartões para começar</p>
              <Button onClick={() => {
                setEditingDeck(undefined);
                setIsCreateDeckOpen(true);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Cartão
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {flashcardDecks.map((deck) => (
                <div key={deck.id} className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-foreground">{deck.name}</h4>
                      <p className="text-sm text-muted-foreground">{deck.discipline}</p>
                    </div>
                    <span className="text-xs bg-secondary px-2 py-1 rounded-full">
                      {deck.cards.length} cartões
                    </span>
                  </div>
                  {deck.subject && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-1">{deck.subject}</p>
                  )}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        setEditingDeck(deck);
                        setIsCreateDeckOpen(true);
                      }}
                    >
                      <Pencil className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteDeck(deck.id)}
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

          <div className="flex justify-end">
            <Button onClick={() => setIsCreateSimuladoOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Simulado
            </Button>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {simulados.map((simulado) => (
                <div key={simulado.id} className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-foreground">{simulado.name}</h4>
                      <p className="text-sm text-muted-foreground">{simulado.discipline}</p>
                    </div>
                    <span className="text-xs bg-secondary px-2 py-1 rounded-full">
                      {simulado.questions.length} questões
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {simulado.timeMinutes} min • {simulado.difficulty}
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        toast.info('Edição de simulado em breve!');
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

    return null;
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="Treinos & Simulados"
        description="Ambiente completo de treino cognitivo com múltiplas técnicas de estudo"
      />

      {/* Main Tabs: Criar vs Praticar */}
      <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as 'criar' | 'praticar')} className="mt-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="criar" className="flex items-center gap-2">
            <PenTool className="w-4 h-4" />
            Criar Conteúdo
          </TabsTrigger>
          <TabsTrigger value="praticar" className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            Praticar ({totalAvailable})
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
                    ? flashcardDecks.length 
                    : method.id === 'simulado' 
                      ? simulados.length 
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

        {/* TAB: Praticar */}
        <TabsContent value="praticar" className="mt-6">
          {totalAvailable === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
              <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum conteúdo disponível para praticar</p>
              <p className="text-sm mb-4">Crie flashcards ou simulados na aba "Criar Conteúdo"</p>
              <Button onClick={() => setMainTab('criar')} variant="outline">
                <PenTool className="w-4 h-4 mr-2" />
                Ir para Criar Conteúdo
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Flashcards disponíveis */}
              {availableDecks.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Layers className="w-5 h-5 text-foreground" />
                    <h3 className="font-semibold text-foreground">Flashcards</h3>
                    <span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">
                      {availableDecks.length} deck{availableDecks.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableDecks.map((deck) => (
                      <div 
                        key={deck.id} 
                        className="bg-card border border-border rounded-xl p-5 hover:border-foreground/20 hover:shadow-md transition-all duration-200 cursor-pointer"
                        onClick={() => setStudyingDeck(deck)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                              <Layers className="w-5 h-5 text-foreground" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground">{deck.name}</h4>
                              <p className="text-sm text-muted-foreground">{deck.discipline}</p>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          {deck.cards.length} cartões
                          {deck.totalReviews > 0 && ` • ${deck.totalReviews} revisões`}
                        </p>
                        <Button className="w-full">
                          <Play className="w-4 h-4 mr-2" />
                          Estudar
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Simulados disponíveis */}
              {availableSimulados.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <FileQuestion className="w-5 h-5 text-foreground" />
                    <h3 className="font-semibold text-foreground">Simulados</h3>
                    <span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">
                      {availableSimulados.length} simulado{availableSimulados.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableSimulados.map((simulado) => (
                      <div 
                        key={simulado.id} 
                        className="bg-card border border-border rounded-xl p-5 hover:border-foreground/20 hover:shadow-md transition-all duration-200 cursor-pointer"
                        onClick={() => setActiveSimulado(simulado)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                              <FileQuestion className="w-5 h-5 text-foreground" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground">{simulado.name}</h4>
                              <p className="text-sm text-muted-foreground">{simulado.discipline}</p>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {simulado.questions.length} questões • {simulado.timeMinutes} min
                        </p>
                        {simulado.status === 'completed' && simulado.score !== undefined && (
                          <p className="text-sm text-primary mb-2">
                            Última nota: {simulado.score}%
                          </p>
                        )}
                        <Button className="w-full">
                          <Play className="w-4 h-4 mr-2" />
                          {simulado.status === 'completed' ? 'Refazer' : 'Iniciar'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreateFlashcardDeckModal
        open={isCreateDeckOpen}
        onOpenChange={(open) => {
          setIsCreateDeckOpen(open);
          if (!open) setEditingDeck(undefined);
        }}
        onSubmit={handleCreateDeck}
        editingDeck={editingDeck}
      />

      <CreateSimuladoModal
        open={isCreateSimuladoOpen}
        onOpenChange={setIsCreateSimuladoOpen}
        onSubmit={handleCreateSimulado}
      />
    </div>
  );
}
