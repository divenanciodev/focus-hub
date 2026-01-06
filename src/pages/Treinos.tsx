import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrainingTypeSelector } from '@/components/training/TrainingTypeSelector';
import { FlashcardDeckList } from '@/components/training/flashcards/FlashcardDeckList';
import { CreateFlashcardDeckModal } from '@/components/training/flashcards/CreateFlashcardDeckModal';
import { FlashcardStudyMode } from '@/components/training/flashcards/FlashcardStudyMode';
import { CreateSimuladoModal } from '@/components/training/simulado/CreateSimuladoModal';
import { SimuladoSession } from '@/components/training/simulado/SimuladoSession';
import { FlashcardDeck, Simulado, TrainingType, TrainingMetrics } from '@/types/training';
import { Plus, Layers, FileQuestion, BookOpen, Play, PenTool } from 'lucide-react';
import { toast } from 'sonner';

export default function Treinos() {
  const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false);
  const [mainTab, setMainTab] = useState<'criar' | 'praticar'>('criar');
  const [createTab, setCreateTab] = useState('flashcards');
  const [practiceTab, setPracticeTab] = useState('flashcards');
  
  // Flashcards state
  const [flashcardDecks, setFlashcardDecks] = useState<FlashcardDeck[]>([]);
  const [isCreateDeckOpen, setIsCreateDeckOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState<FlashcardDeck | undefined>();
  const [studyingDeck, setStudyingDeck] = useState<FlashcardDeck | null>(null);
  
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

  const handleSelectType = (type: TrainingType) => {
    switch (type) {
      case 'flashcards':
        setCreateTab('flashcards');
        setIsCreateDeckOpen(true);
        break;
      case 'simulado':
        setCreateTab('simulados');
        setIsCreateSimuladoOpen(true);
        break;
      default:
        toast.info(`Módulo "${type}" será implementado em breve!`);
    }
  };

  // Flashcard handlers
  const handleCreateDeck = (deck: FlashcardDeck) => {
    if (editingDeck) {
      setFlashcardDecks(flashcardDecks.map(d => d.id === deck.id ? deck : d));
      toast.success('Deck atualizado!');
    } else {
      setFlashcardDecks([deck, ...flashcardDecks]);
      setMetrics(m => ({
        ...m,
        totalTrainings: m.totalTrainings + 1,
        byType: { ...m.byType, flashcards: m.byType.flashcards + 1 },
      }));
      toast.success('Deck criado! Agora disponível para treino na aba "Praticar".');
    }
    setEditingDeck(undefined);
  };

  const handleDeleteDeck = (deckId: string) => {
    setFlashcardDecks(flashcardDecks.filter(d => d.id !== deckId));
    toast.success('Deck excluído');
  };

  const handleStudyComplete = (results: { easy: number; medium: number; hard: number }) => {
    setMetrics(m => ({
      ...m,
      totalStudyTimeMinutes: m.totalStudyTimeMinutes + 15,
      completedToday: m.completedToday + 1,
    }));
    setStudyingDeck(null);
  };

  // Simulado handlers
  const handleCreateSimulado = (simulado: Simulado) => {
    setSimulados([simulado, ...simulados]);
    setMetrics(m => ({
      ...m,
      totalTrainings: m.totalTrainings + 1,
      byType: { ...m.byType, simulado: m.byType.simulado + 1 },
    }));
    toast.success('Simulado criado! Agora disponível para treino na aba "Praticar".');
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

  // Available decks for practice (with cards)
  const availableDecks = flashcardDecks.filter(d => d.cards.length > 0);
  const availableSimulados = simulados.filter(s => s.questions.length > 0);

  // Render study modes
  if (studyingDeck) {
    return (
      <FlashcardStudyMode
        deck={studyingDeck}
        onClose={() => setStudyingDeck(null)}
        onComplete={handleStudyComplete}
      />
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

  return (
    <div className="fade-in">
      <PageHeader
        title="Treinos & Simulados"
        description="Ambiente completo de treino cognitivo com múltiplas técnicas de estudo"
        actions={
          <Button onClick={() => setIsTypeSelectorOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Criar conteúdo
          </Button>
        }
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
            Praticar
          </TabsTrigger>
        </TabsList>

        {/* TAB: Criar Conteúdo */}
        <TabsContent value="criar" className="mt-6">
          <Tabs value={createTab} onValueChange={setCreateTab}>
            <TabsList>
              <TabsTrigger value="flashcards" className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Flashcards
              </TabsTrigger>
              <TabsTrigger value="simulados" className="flex items-center gap-2">
                <FileQuestion className="w-4 h-4" />
                Simulados
              </TabsTrigger>
            </TabsList>

            <TabsContent value="flashcards" className="mt-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">Seus Decks de Flashcards</h3>
                  <p className="text-sm text-muted-foreground">Crie e gerencie seus decks de flashcards</p>
                </div>
                <Button onClick={() => setIsCreateDeckOpen(true)} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Deck
                </Button>
              </div>
              
              {flashcardDecks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
                  <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum deck criado ainda</p>
                  <p className="text-sm mb-4">Crie seu primeiro deck para começar</p>
                  <Button onClick={() => setIsCreateDeckOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Deck
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
                        <p className="text-sm text-muted-foreground mb-3">{deck.subject}</p>
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
                          Editar
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteDeck(deck.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="simulados" className="mt-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">Seus Simulados</h3>
                  <p className="text-sm text-muted-foreground">Crie e gerencie seus simulados</p>
                </div>
                <Button onClick={() => setIsCreateSimuladoOpen(true)} size="sm">
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
                        Tempo: {simulado.timeMinutes} min • Nível: {simulado.difficulty}
                      </p>
                      {simulado.status === 'completed' && simulado.score !== undefined && (
                        <p className="text-sm text-primary mb-3">
                          Última nota: {simulado.score}%
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* TAB: Praticar */}
        <TabsContent value="praticar" className="mt-6">
          <Tabs value={practiceTab} onValueChange={setPracticeTab}>
            <TabsList>
              <TabsTrigger value="flashcards" className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Flashcards ({availableDecks.length})
              </TabsTrigger>
              <TabsTrigger value="simulados" className="flex items-center gap-2">
                <FileQuestion className="w-4 h-4" />
                Simulados ({availableSimulados.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="flashcards" className="mt-6">
              {availableDecks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
                  <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum deck disponível para treino</p>
                  <p className="text-sm mb-4">Crie um deck com cartões na aba "Criar Conteúdo"</p>
                  <Button onClick={() => setMainTab('criar')} variant="outline">
                    <PenTool className="w-4 h-4 mr-2" />
                    Ir para Criar Conteúdo
                  </Button>
                </div>
              ) : (
                <FlashcardDeckList
                  decks={availableDecks}
                  onStudy={setStudyingDeck}
                  onEdit={(deck) => {
                    setEditingDeck(deck);
                    setMainTab('criar');
                    setCreateTab('flashcards');
                    setIsCreateDeckOpen(true);
                  }}
                  onDelete={handleDeleteDeck}
                />
              )}
            </TabsContent>

            <TabsContent value="simulados" className="mt-6">
              {availableSimulados.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
                  <FileQuestion className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum simulado disponível para treino</p>
                  <p className="text-sm mb-4">Crie um simulado com questões na aba "Criar Conteúdo"</p>
                  <Button onClick={() => setMainTab('criar')} variant="outline">
                    <PenTool className="w-4 h-4 mr-2" />
                    Ir para Criar Conteúdo
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableSimulados.map((simulado) => (
                    <div key={simulado.id} className="bg-card border border-border rounded-xl p-5 hover:border-foreground/20 hover:shadow-md transition-all duration-200">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-foreground">{simulado.name}</h4>
                          <p className="text-sm text-muted-foreground">{simulado.discipline}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {simulado.questions.length} questões • {simulado.timeMinutes} min
                      </p>
                      {simulado.status === 'completed' && simulado.score !== undefined && (
                        <p className="text-sm text-primary mb-3">
                          Última nota: {simulado.score}%
                        </p>
                      )}
                      <Button onClick={() => setActiveSimulado(simulado)} className="w-full">
                        <Play className="w-4 h-4 mr-2" />
                        {simulado.status === 'completed' ? 'Refazer' : 'Iniciar Treino'}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      <TrainingTypeSelector
        open={isTypeSelectorOpen}
        onOpenChange={setIsTypeSelectorOpen}
        onSelectType={handleSelectType}
      />

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
