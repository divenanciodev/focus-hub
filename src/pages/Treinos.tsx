import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrainingTypeSelector } from '@/components/training/TrainingTypeSelector';
import { TrainingMetricsDashboard } from '@/components/training/TrainingMetricsDashboard';
import { FlashcardDeckList } from '@/components/training/flashcards/FlashcardDeckList';
import { CreateFlashcardDeckModal } from '@/components/training/flashcards/CreateFlashcardDeckModal';
import { FlashcardStudyMode } from '@/components/training/flashcards/FlashcardStudyMode';
import { CreateSimuladoModal } from '@/components/training/simulado/CreateSimuladoModal';
import { SimuladoSession } from '@/components/training/simulado/SimuladoSession';
import { FlashcardDeck, Simulado, TrainingType, TrainingMetrics } from '@/types/training';
import { Plus, Layers, FileQuestion, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

export default function Treinos() {
  const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('flashcards');
  
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
        setActiveTab('flashcards');
        setIsCreateDeckOpen(true);
        break;
      case 'simulado':
        setActiveTab('simulados');
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
      toast.success('Deck criado!');
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
    toast.success('Simulado criado!');
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
            Criar treino
          </Button>
        }
      />

      <TrainingMetricsDashboard metrics={metrics} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="flashcards" className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Flashcards
          </TabsTrigger>
          <TabsTrigger value="simulados" className="flex items-center gap-2">
            <FileQuestion className="w-4 h-4" />
            Simulados
          </TabsTrigger>
          <TabsTrigger value="outros" className="flex items-center gap-2">
            <MoreHorizontal className="w-4 h-4" />
            Outros
          </TabsTrigger>
        </TabsList>

        <TabsContent value="flashcards" className="mt-6">
          <FlashcardDeckList
            decks={flashcardDecks}
            onStudy={setStudyingDeck}
            onEdit={(deck) => {
              setEditingDeck(deck);
              setIsCreateDeckOpen(true);
            }}
            onDelete={handleDeleteDeck}
          />
        </TabsContent>

        <TabsContent value="simulados" className="mt-6">
          {simulados.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileQuestion className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum simulado criado</p>
              <Button onClick={() => setIsCreateSimuladoOpen(true)} className="mt-4">
                Criar simulado
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {simulados.map((simulado) => (
                <div key={simulado.id} className="bg-card border border-border rounded-xl p-5">
                  <h3 className="font-semibold">{simulado.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{simulado.discipline}</p>
                  <p className="text-sm mb-4">{simulado.questions.length} questões • {simulado.timeMinutes}min</p>
                  <Button onClick={() => setActiveSimulado(simulado)} className="w-full">
                    {simulado.status === 'completed' ? 'Refazer' : 'Iniciar'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="outros" className="mt-6">
          <div className="text-center py-12 text-muted-foreground">
            <p>Mapas mentais, resumos guiados e outros módulos em breve!</p>
            <Button onClick={() => setIsTypeSelectorOpen(true)} variant="outline" className="mt-4">
              Ver todos os tipos
            </Button>
          </div>
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
