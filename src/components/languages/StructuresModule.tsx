import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Trash2, 
  Play,
  Dumbbell,
  ChevronRight,
  Lightbulb,
  ArrowLeft
} from 'lucide-react';
import { useGrammarStructureSets, useGrammarStructures, useAllGrammarStructures } from '@/hooks/useLanguagesModule';
import type { GrammarStructureSet, GrammarStructure, ExpectedInput } from '@/types/languages';
import { EXPECTED_INPUTS } from '@/types/languages';
import { StructuresPractice } from './StructuresPractice';

interface StructuresModuleProps {
  languageId: string;
}

export function StructuresModule({ languageId }: StructuresModuleProps) {
  const { sets, loading, addSet, deleteSet } = useGrammarStructureSets(languageId);
  const { structures: allStructures } = useAllGrammarStructures(languageId);
  const [activeTab, setActiveTab] = useState<'edit' | 'practice'>('edit');
  const [selectedSet, setSelectedSet] = useState<GrammarStructureSet | null>(null);
  const [isPracticing, setIsPracticing] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newSetName, setNewSetName] = useState('');
  const [newSetDescription, setNewSetDescription] = useState('');

  const handleCreateSet = async () => {
    if (!newSetName.trim()) return;
    
    await addSet({
      name: newSetName,
      description: newSetDescription || undefined,
      color: '#8b5cf6',
      icon: '📝',
    });
    
    setNewSetName('');
    setNewSetDescription('');
    setCreateModalOpen(false);
  };

  // If practicing
  if (isPracticing) {
    return (
      <StructuresPractice 
        structures={allStructures}
        languageId={languageId}
        onBack={() => {
          setIsPracticing(false);
          setSelectedSet(null);
        }}
      />
    );
  }

  // If viewing a specific set
  if (selectedSet) {
    return (
      <StructureSetDetail 
        set={selectedSet}
        languageId={languageId}
        onBack={() => setSelectedSet(null)}
        onPractice={() => setIsPracticing(true)}
        onDeleteSet={() => {
          deleteSet(selectedSet.id);
          setSelectedSet(null);
        }}
      />
    );
  }

  // Main structures view
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="edit">Edição</TabsTrigger>
            <TabsTrigger value="practice">Prática</TabsTrigger>
          </TabsList>

          {activeTab === 'edit' && (
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Conjunto
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Conjunto de Estruturas</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome do Conjunto</Label>
                    <Input 
                      value={newSetName}
                      onChange={(e) => setNewSetName(e.target.value)}
                      placeholder="Ex: Modal Verbs, Phrasal Verbs, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição (opcional)</Label>
                    <Textarea 
                      value={newSetDescription}
                      onChange={(e) => setNewSetDescription(e.target.value)}
                      placeholder="Ex: Estruturas com verbos modais em inglês"
                      rows={2}
                    />
                  </div>
                  <Button onClick={handleCreateSet} className="w-full bg-foreground text-background hover:bg-foreground/90">
                    Criar Conjunto
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <TabsContent value="edit" className="mt-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Skeleton key={i} className="h-28" />
              ))}
            </div>
          ) : sets.length === 0 ? (
            <EmptyState
              icon={<Dumbbell className="w-12 h-12 text-muted-foreground" />}
              title="Nenhum conjunto criado"
              description="Crie um conjunto para organizar suas estruturas gramaticais"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sets.map(set => (
                <Card 
                  key={set.id}
                  className="cursor-pointer hover:border-primary transition-colors group"
                  onClick={() => setSelectedSet(set)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{set.icon}</span>
                        <CardTitle className="text-base">{set.name}</CardTitle>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {set.description && (
                      <p className="text-sm text-muted-foreground truncate">
                        {set.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="practice" className="mt-4">
          {loading ? (
            <Skeleton className="h-32" />
          ) : allStructures.length === 0 ? (
            <EmptyState
              icon={<Play className="w-12 h-12 text-muted-foreground" />}
              title="Nenhuma estrutura para praticar"
              description="Adicione estruturas aos conjuntos primeiro"
            />
          ) : (
            <Card className="max-w-md mx-auto">
              <CardContent className="py-8 text-center space-y-4">
                <Dumbbell className="w-12 h-12 mx-auto text-primary" />
                <h3 className="text-lg font-medium">Praticar Estruturas</h3>
                <p className="text-muted-foreground">
                  {allStructures.length} estrutura(s) disponível(is)
                </p>
                <Button onClick={() => setIsPracticing(true)} className="bg-foreground text-background hover:bg-foreground/90">
                  <Play className="w-4 h-4 mr-2" />
                  Iniciar Prática
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Component for viewing/editing structures within a set
function StructureSetDetail({ 
  set, 
  languageId,
  onBack,
  onPractice,
  onDeleteSet
}: { 
  set: GrammarStructureSet; 
  languageId: string;
  onBack: () => void;
  onPractice: () => void;
  onDeleteSet: () => void;
}) {
  const { structures, loading, addStructure, deleteStructure } = useGrammarStructures(set.id, languageId);
  const [addModalOpen, setAddModalOpen] = useState(false);
  
  // Form state
  const [fixedText, setFixedText] = useState('');
  const [expectedInput, setExpectedInput] = useState<ExpectedInput>('verb');
  const [translation, setTranslation] = useState('');
  const [grammarTip, setGrammarTip] = useState('');
  const [examples, setExamples] = useState('');

  const handleAddStructure = async () => {
    if (!fixedText.trim()) return;
    
    await addStructure({
      fixedText: fixedText.trim(),
      expectedInput,
      translation: translation || undefined,
      grammarTip: grammarTip || undefined,
      examples: examples.split('\n').filter(e => e.trim()),
      allowedClasses: [expectedInput],
    }, languageId);
    
    // Reset form
    setFixedText('');
    setExpectedInput('verb');
    setTranslation('');
    setGrammarTip('');
    setExamples('');
    setAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{set.icon}</span>
            <h2 className="text-xl font-bold">{set.name}</h2>
          </div>
        </div>
        <div className="flex gap-2">
          {structures.length > 0 && (
            <Button onClick={onPractice} className="bg-foreground text-background hover:bg-foreground/90">
              <Play className="w-4 h-4 mr-2" />
              Praticar
            </Button>
          )}
          <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Estrutura
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Adicionar Estrutura</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Texto Fixo (antes do +) *</Label>
                  <Input 
                    value={fixedText}
                    onChange={(e) => setFixedText(e.target.value)}
                    placeholder="Ex: I wanna, Do you want me to, I'm good at"
                  />
                  <p className="text-xs text-muted-foreground">
                    O texto que vem antes do campo que o usuário preenche
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Tipo de Entrada Esperada</Label>
                  <Select value={expectedInput} onValueChange={(v: ExpectedInput) => setExpectedInput(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPECTED_INPUTS.map(input => (
                        <SelectItem key={input} value={input}>
                          {input.charAt(0).toUpperCase() + input.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tradução</Label>
                  <Input 
                    value={translation}
                    onChange={(e) => setTranslation(e.target.value)}
                    placeholder="Ex: Eu quero..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Dica Gramatical</Label>
                  <Textarea 
                    value={grammarTip}
                    onChange={(e) => setGrammarTip(e.target.value)}
                    placeholder="Ex: Usado para expressar desejo ou intenção"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Exemplos (um por linha)</Label>
                  <Textarea 
                    value={examples}
                    onChange={(e) => setExamples(e.target.value)}
                    placeholder="I wanna learn English.&#10;I wanna travel to Japan."
                    rows={3}
                  />
                </div>

                <Button onClick={handleAddStructure} className="w-full bg-foreground text-background hover:bg-foreground/90">
                  Adicionar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : structures.length === 0 ? (
        <EmptyState
          icon={<Dumbbell className="w-12 h-12 text-muted-foreground" />}
          title="Nenhuma estrutura cadastrada"
          description="Adicione estruturas a este conjunto"
        />
      ) : (
        <div className="space-y-2">
          {structures.map(structure => (
            <Card key={structure.id}>
              <CardContent className="py-3 flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium">
                      {structure.fixedText} +
                    </span>
                    <Badge variant="secondary">
                      {structure.expectedInput}
                    </Badge>
                  </div>
                  {structure.translation && (
                    <p className="text-sm text-muted-foreground">
                      {structure.translation}
                    </p>
                  )}
                  {structure.grammarTip && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Lightbulb className="w-3 h-3 mt-0.5 text-yellow-500" />
                      <span className="text-xs">{structure.grammarTip}</span>
                    </div>
                  )}
                  {structure.examples.length > 0 && (
                    <p className="text-xs italic text-muted-foreground">
                      Ex: {structure.examples[0]}
                    </p>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => deleteStructure(structure.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
