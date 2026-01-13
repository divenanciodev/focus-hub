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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Plus, 
  Trash2, 
  Play,
  Dumbbell,
  ChevronRight,
  ChevronDown,
  Lightbulb,
  ArrowLeft,
  Pencil,
  Library
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
  const { structures, loading, addStructure, updateStructure, deleteStructure } = useGrammarStructures(set.id, languageId);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState<GrammarStructure | null>(null);
  
  // Form state for adding
  const [fixedText, setFixedText] = useState('');
  const [expectedInputs, setExpectedInputs] = useState<(ExpectedInput | '')[]>(['verb', '', '', '']);
  const [phraseLibrary, setPhraseLibrary] = useState<Record<number, string[]>>({ 0: [], 1: [], 2: [], 3: [] });
  const [newPhraseText, setNewPhraseText] = useState<Record<number, string>>({ 0: '', 1: '', 2: '', 3: '' });
  const [libraryOpen, setLibraryOpen] = useState<Record<number, boolean>>({ 0: false, 1: false, 2: false, 3: false });
  const [translation, setTranslation] = useState('');
  const [grammarTip, setGrammarTip] = useState('');
  const [examples, setExamples] = useState('');

  // Form state for editing
  const [editFixedText, setEditFixedText] = useState('');
  const [editExpectedInputs, setEditExpectedInputs] = useState<(ExpectedInput | '')[]>(['verb', '', '', '']);
  const [editPhraseLibrary, setEditPhraseLibrary] = useState<Record<number, string[]>>({ 0: [], 1: [], 2: [], 3: [] });
  const [editNewPhraseText, setEditNewPhraseText] = useState<Record<number, string>>({ 0: '', 1: '', 2: '', 3: '' });
  const [editLibraryOpen, setEditLibraryOpen] = useState<Record<number, boolean>>({ 0: false, 1: false, 2: false, 3: false });
  const [editTranslation, setEditTranslation] = useState('');
  const [editGrammarTip, setEditGrammarTip] = useState('');
  const [editExamples, setEditExamples] = useState('');

  const updateExpectedInput = (index: number, value: ExpectedInput | '') => {
    const newInputs = [...expectedInputs];
    newInputs[index] = value;
    setExpectedInputs(newInputs);
    
    // Clear phrase library if not "phrase" type
    if (value !== 'phrase') {
      setPhraseLibrary(prev => ({ ...prev, [index]: [] }));
      setNewPhraseText(prev => ({ ...prev, [index]: '' }));
    }
  };

  const addPhraseToLibrary = (typeIndex: number) => {
    const text = newPhraseText[typeIndex]?.trim();
    if (!text) return;
    
    setPhraseLibrary(prev => ({
      ...prev,
      [typeIndex]: [...(prev[typeIndex] || []), text]
    }));
    setNewPhraseText(prev => ({ ...prev, [typeIndex]: '' }));
  };

  const removePhraseFromLibrary = (typeIndex: number, phraseIndex: number) => {
    setPhraseLibrary(prev => ({
      ...prev,
      [typeIndex]: prev[typeIndex].filter((_, i) => i !== phraseIndex)
    }));
  };

  const toggleLibrary = (typeIndex: number) => {
    setLibraryOpen(prev => ({ ...prev, [typeIndex]: !prev[typeIndex] }));
  };

  const getTotalPhraseCount = () => {
    return Object.values(phraseLibrary).reduce((acc, phrases) => acc + phrases.length, 0);
  };

  // Edit form handlers
  const updateEditExpectedInput = (index: number, value: ExpectedInput | '') => {
    const newInputs = [...editExpectedInputs];
    newInputs[index] = value;
    setEditExpectedInputs(newInputs);
    
    if (value !== 'phrase') {
      setEditPhraseLibrary(prev => ({ ...prev, [index]: [] }));
      setEditNewPhraseText(prev => ({ ...prev, [index]: '' }));
    }
  };

  const addEditPhraseToLibrary = (typeIndex: number) => {
    const text = editNewPhraseText[typeIndex]?.trim();
    if (!text) return;
    
    setEditPhraseLibrary(prev => ({
      ...prev,
      [typeIndex]: [...(prev[typeIndex] || []), text]
    }));
    setEditNewPhraseText(prev => ({ ...prev, [typeIndex]: '' }));
  };

  const removeEditPhraseFromLibrary = (typeIndex: number, phraseIndex: number) => {
    setEditPhraseLibrary(prev => ({
      ...prev,
      [typeIndex]: prev[typeIndex].filter((_, i) => i !== phraseIndex)
    }));
  };

  const toggleEditLibrary = (typeIndex: number) => {
    setEditLibraryOpen(prev => ({ ...prev, [typeIndex]: !prev[typeIndex] }));
  };

  const getEditTotalPhraseCount = () => {
    return Object.values(editPhraseLibrary).reduce((acc, phrases) => acc + phrases.length, 0);
  };

  const openEditModal = (structure: GrammarStructure) => {
    setEditingStructure(structure);
    setEditFixedText(structure.fixedText);
    
    // Populate expected inputs from allowedClasses
    let inputs: (ExpectedInput | '')[] = ['', '', '', ''];
    if (structure.allowedClasses.length > 0) {
      structure.allowedClasses.forEach((cls, i) => {
        if (i < 4) inputs[i] = cls as ExpectedInput;
      });
    } else {
      inputs = [structure.expectedInput as ExpectedInput, '', '', ''];
    }
    setEditExpectedInputs(inputs);
    setEditPhraseLibrary({ 0: [], 1: [], 2: [], 3: [] });
    setEditNewPhraseText({ 0: '', 1: '', 2: '', 3: '' });
    setEditLibraryOpen({ 0: false, 1: false, 2: false, 3: false });
    setEditTranslation(structure.translation || '');
    setEditGrammarTip(structure.grammarTip || '');
    setEditExamples(structure.examples.join('\n'));
    setEditModalOpen(true);
  };

  const handleAddStructure = async () => {
    if (!fixedText.trim()) return;
    
    const validInputs = expectedInputs.filter(input => input !== '') as ExpectedInput[];
    if (validInputs.length === 0) return;
    
    await addStructure({
      fixedText: fixedText.trim(),
      expectedInput: validInputs[0],
      translation: translation || undefined,
      grammarTip: grammarTip || undefined,
      examples: examples.split('\n').filter(e => e.trim()),
      allowedClasses: validInputs,
    }, languageId);
    
    // Reset form
    setFixedText('');
    setExpectedInputs(['verb', '', '', '']);
    setPhraseLibrary({ 0: [], 1: [], 2: [], 3: [] });
    setNewPhraseText({ 0: '', 1: '', 2: '', 3: '' });
    setLibraryOpen({ 0: false, 1: false, 2: false, 3: false });
    setTranslation('');
    setGrammarTip('');
    setExamples('');
    setAddModalOpen(false);
  };

  const handleEditStructure = async () => {
    if (!editingStructure || !editFixedText.trim()) return;
    
    const validInputs = editExpectedInputs.filter(input => input !== '') as ExpectedInput[];
    if (validInputs.length === 0) return;
    
    await updateStructure(editingStructure.id, {
      fixedText: editFixedText.trim(),
      expectedInput: validInputs[0],
      translation: editTranslation || undefined,
      grammarTip: editGrammarTip || undefined,
      examples: editExamples.split('\n').filter(e => e.trim()),
      allowedClasses: validInputs,
    });
    
    setEditModalOpen(false);
    setEditingStructure(null);
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
                <Button className="bg-foreground text-background hover:bg-foreground/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Estrutura
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Adicionar Estrutura</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Estrutura da Frase *</Label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex-1 min-w-[180px]">
                      <Input 
                        value={fixedText}
                        onChange={(e) => setFixedText(e.target.value)}
                        placeholder="Texto fixo (ex: I wanna)"
                      />
                    </div>
                    <span className="text-lg font-bold text-muted-foreground">+</span>
                    <div className="w-28">
                      <Select 
                        value={expectedInputs[0] || '__empty__'} 
                        onValueChange={(v) => updateExpectedInput(0, v === '__empty__' ? '' : v as ExpectedInput)}
                      >
                        <SelectTrigger className="text-left">
                          <SelectValue placeholder="Tipo 1" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__empty__">-</SelectItem>
                          {EXPECTED_INPUTS.map(input => (
                            <SelectItem key={input} value={input}>
                              {input === 'phrase' ? 'Frase' : input.charAt(0).toUpperCase() + input.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <span className="text-lg font-bold text-muted-foreground">+</span>
                    <div className="w-28">
                      <Select 
                        value={expectedInputs[1] || '__empty__'} 
                        onValueChange={(v) => updateExpectedInput(1, v === '__empty__' ? '' : v as ExpectedInput)}
                      >
                        <SelectTrigger className="text-left">
                          <SelectValue placeholder="Tipo 2" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__empty__">-</SelectItem>
                          {EXPECTED_INPUTS.map(input => (
                            <SelectItem key={input} value={input}>
                              {input === 'phrase' ? 'Frase' : input.charAt(0).toUpperCase() + input.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <span className="text-lg font-bold text-muted-foreground">+</span>
                    <div className="w-28">
                      <Select 
                        value={expectedInputs[2] || '__empty__'} 
                        onValueChange={(v) => updateExpectedInput(2, v === '__empty__' ? '' : v as ExpectedInput)}
                      >
                        <SelectTrigger className="text-left">
                          <SelectValue placeholder="Tipo 3" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__empty__">-</SelectItem>
                          {EXPECTED_INPUTS.map(input => (
                            <SelectItem key={input} value={input}>
                              {input === 'phrase' ? 'Frase' : input.charAt(0).toUpperCase() + input.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <span className="text-lg font-bold text-muted-foreground">+</span>
                    <div className="w-28">
                      <Select 
                        value={expectedInputs[3] || '__empty__'} 
                        onValueChange={(v) => updateExpectedInput(3, v === '__empty__' ? '' : v as ExpectedInput)}
                      >
                        <SelectTrigger className="text-left">
                          <SelectValue placeholder="Tipo 4" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__empty__">-</SelectItem>
                          {EXPECTED_INPUTS.map(input => (
                            <SelectItem key={input} value={input}>
                              {input === 'phrase' ? 'Frase' : input.charAt(0).toUpperCase() + input.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Phrase library - appear when "phrase" is selected */}
                  {expectedInputs.some((input) => input === 'phrase') && (
                    <div className="space-y-3 mt-3">
                      {expectedInputs.map((input, typeIndex) => 
                        input === 'phrase' && (
                          <div key={typeIndex} className="space-y-2 p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">Tipo {typeIndex + 1}:</span>
                              <div className="flex-1 flex gap-2">
                                <Input 
                                  value={newPhraseText[typeIndex] || ''}
                                  onChange={(e) => setNewPhraseText(prev => ({ ...prev, [typeIndex]: e.target.value }))}
                                  placeholder="Digite uma frase esperada..."
                                  className="flex-1"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      addPhraseToLibrary(typeIndex);
                                    }
                                  }}
                                />
                                <Button 
                                  type="button"
                                  variant="secondary" 
                                  size="sm"
                                  onClick={() => addPhraseToLibrary(typeIndex)}
                                  className="shrink-0"
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            
                            {phraseLibrary[typeIndex]?.length > 0 && (
                              <Collapsible open={libraryOpen[typeIndex]} onOpenChange={() => toggleLibrary(typeIndex)}>
                                <CollapsibleTrigger asChild>
                                  <Button variant="outline" size="sm" className="w-full justify-between">
                                    <span className="flex items-center gap-2">
                                      <Library className="w-4 h-4" />
                                      Minha biblioteca ({phraseLibrary[typeIndex].length})
                                    </span>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${libraryOpen[typeIndex] ? 'rotate-180' : ''}`} />
                                  </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="mt-2 space-y-1">
                                  {phraseLibrary[typeIndex].map((phrase, phraseIndex) => (
                                    <div key={phraseIndex} className="flex items-center gap-2 p-2 bg-background rounded border">
                                      <span className="flex-1 text-sm">{phrase}</span>
                                      <Button 
                                        type="button"
                                        variant="ghost" 
                                        size="icon"
                                        onClick={() => removePhraseFromLibrary(typeIndex, phraseIndex)}
                                        className="h-7 w-7 text-destructive hover:text-destructive"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </CollapsibleContent>
                              </Collapsible>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Monte a estrutura: texto fixo + tipos de entrada. Use "-" para campos não utilizados.
                  </p>
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

          {/* Edit Structure Modal */}
          <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Editar Estrutura</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Estrutura da Frase *</Label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex-1 min-w-[180px]">
                      <Input 
                        value={editFixedText}
                        onChange={(e) => setEditFixedText(e.target.value)}
                        placeholder="Texto fixo (ex: I wanna)"
                      />
                    </div>
                    <span className="text-lg font-bold text-muted-foreground">+</span>
                    <div className="w-28">
                      <Select 
                        value={editExpectedInputs[0] || '__empty__'} 
                        onValueChange={(v) => updateEditExpectedInput(0, v === '__empty__' ? '' : v as ExpectedInput)}
                      >
                        <SelectTrigger className="text-left">
                          <SelectValue placeholder="Tipo 1" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__empty__">-</SelectItem>
                          {EXPECTED_INPUTS.map(input => (
                            <SelectItem key={input} value={input}>
                              {input === 'phrase' ? 'Frase' : input.charAt(0).toUpperCase() + input.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <span className="text-lg font-bold text-muted-foreground">+</span>
                    <div className="w-28">
                      <Select 
                        value={editExpectedInputs[1] || '__empty__'} 
                        onValueChange={(v) => updateEditExpectedInput(1, v === '__empty__' ? '' : v as ExpectedInput)}
                      >
                        <SelectTrigger className="text-left">
                          <SelectValue placeholder="Tipo 2" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__empty__">-</SelectItem>
                          {EXPECTED_INPUTS.map(input => (
                            <SelectItem key={input} value={input}>
                              {input === 'phrase' ? 'Frase' : input.charAt(0).toUpperCase() + input.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <span className="text-lg font-bold text-muted-foreground">+</span>
                    <div className="w-28">
                      <Select 
                        value={editExpectedInputs[2] || '__empty__'} 
                        onValueChange={(v) => updateEditExpectedInput(2, v === '__empty__' ? '' : v as ExpectedInput)}
                      >
                        <SelectTrigger className="text-left">
                          <SelectValue placeholder="Tipo 3" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__empty__">-</SelectItem>
                          {EXPECTED_INPUTS.map(input => (
                            <SelectItem key={input} value={input}>
                              {input === 'phrase' ? 'Frase' : input.charAt(0).toUpperCase() + input.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <span className="text-lg font-bold text-muted-foreground">+</span>
                    <div className="w-28">
                      <Select 
                        value={editExpectedInputs[3] || '__empty__'} 
                        onValueChange={(v) => updateEditExpectedInput(3, v === '__empty__' ? '' : v as ExpectedInput)}
                      >
                        <SelectTrigger className="text-left">
                          <SelectValue placeholder="Tipo 4" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__empty__">-</SelectItem>
                          {EXPECTED_INPUTS.map(input => (
                            <SelectItem key={input} value={input}>
                              {input === 'phrase' ? 'Frase' : input.charAt(0).toUpperCase() + input.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Phrase library for edit */}
                  {editExpectedInputs.some((input) => input === 'phrase') && (
                    <div className="space-y-3 mt-3">
                      {editExpectedInputs.map((input, typeIndex) => 
                        input === 'phrase' && (
                          <div key={typeIndex} className="space-y-2 p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">Tipo {typeIndex + 1}:</span>
                              <div className="flex-1 flex gap-2">
                                <Input 
                                  value={editNewPhraseText[typeIndex] || ''}
                                  onChange={(e) => setEditNewPhraseText(prev => ({ ...prev, [typeIndex]: e.target.value }))}
                                  placeholder="Digite uma frase esperada..."
                                  className="flex-1"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      addEditPhraseToLibrary(typeIndex);
                                    }
                                  }}
                                />
                                <Button 
                                  type="button"
                                  variant="secondary" 
                                  size="sm"
                                  onClick={() => addEditPhraseToLibrary(typeIndex)}
                                  className="shrink-0"
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            
                            {editPhraseLibrary[typeIndex]?.length > 0 && (
                              <Collapsible open={editLibraryOpen[typeIndex]} onOpenChange={() => toggleEditLibrary(typeIndex)}>
                                <CollapsibleTrigger asChild>
                                  <Button variant="outline" size="sm" className="w-full justify-between">
                                    <span className="flex items-center gap-2">
                                      <Library className="w-4 h-4" />
                                      Minha biblioteca ({editPhraseLibrary[typeIndex].length})
                                    </span>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${editLibraryOpen[typeIndex] ? 'rotate-180' : ''}`} />
                                  </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="mt-2 space-y-1">
                                  {editPhraseLibrary[typeIndex].map((phrase, phraseIndex) => (
                                    <div key={phraseIndex} className="flex items-center gap-2 p-2 bg-background rounded border">
                                      <span className="flex-1 text-sm">{phrase}</span>
                                      <Button 
                                        type="button"
                                        variant="ghost" 
                                        size="icon"
                                        onClick={() => removeEditPhraseFromLibrary(typeIndex, phraseIndex)}
                                        className="h-7 w-7 text-destructive hover:text-destructive"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </CollapsibleContent>
                              </Collapsible>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Monte a estrutura: texto fixo + tipos de entrada. Use "-" para campos não utilizados.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Tradução</Label>
                  <Input 
                    value={editTranslation}
                    onChange={(e) => setEditTranslation(e.target.value)}
                    placeholder="Ex: Eu quero..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Dica Gramatical</Label>
                  <Textarea 
                    value={editGrammarTip}
                    onChange={(e) => setEditGrammarTip(e.target.value)}
                    placeholder="Ex: Usado para expressar desejo ou intenção"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Exemplos (um por linha)</Label>
                  <Textarea 
                    value={editExamples}
                    onChange={(e) => setEditExamples(e.target.value)}
                    placeholder="I wanna learn English.&#10;I wanna travel to Japan."
                    rows={3}
                  />
                </div>

                <Button onClick={handleEditStructure} className="w-full bg-foreground text-background hover:bg-foreground/90">
                  Salvar Alterações
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
                    {structure.allowedClasses.length > 1 && (
                      <span className="text-xs text-muted-foreground">
                        +{structure.allowedClasses.length - 1}
                      </span>
                    )}
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
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => openEditModal(structure)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => deleteStructure(structure.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
