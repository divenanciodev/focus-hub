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
  ArrowLeft,
  Pencil
} from 'lucide-react';
import { useGrammarStructures } from '@/hooks/useLanguagesModule';
import type { GrammarStructure, ExpectedInput } from '@/types/languages';
import { EXPECTED_INPUTS } from '@/types/languages';
import { StructuresPractice } from './StructuresPractice';

interface StructuresModuleProps {
  languageId: string;
}

export function StructuresModule({ languageId }: StructuresModuleProps) {
  const { structures, loading, addStructure, deleteStructure } = useGrammarStructures(languageId);
  const [activeTab, setActiveTab] = useState<'edit' | 'practice'>('edit');
  const [selectedStructure, setSelectedStructure] = useState<GrammarStructure | null>(null);
  const [isPracticing, setIsPracticing] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  
  // Form state
  const [fixedText, setFixedText] = useState('');
  const [expectedInput, setExpectedInput] = useState<ExpectedInput>('verb');
  const [translation, setTranslation] = useState('');
  const [grammarTip, setGrammarTip] = useState('');
  const [examples, setExamples] = useState('');

  const handleCreateStructure = async () => {
    if (!fixedText.trim()) return;
    
    await addStructure({
      fixedText: fixedText.trim(),
      expectedInput,
      translation: translation || undefined,
      grammarTip: grammarTip || undefined,
      examples: examples.split('\n').filter(e => e.trim()),
      allowedClasses: [expectedInput],
    });
    
    // Reset form
    setFixedText('');
    setExpectedInput('verb');
    setTranslation('');
    setGrammarTip('');
    setExamples('');
    setCreateModalOpen(false);
  };

  // If practicing
  if (isPracticing) {
    return (
      <StructuresPractice 
        structures={structures}
        languageId={languageId}
        onBack={() => {
          setIsPracticing(false);
          setSelectedStructure(null);
        }}
      />
    );
  }

  // If viewing a specific structure
  if (selectedStructure) {
    return (
      <StructureDetail 
        structure={selectedStructure}
        onBack={() => setSelectedStructure(null)}
        onPractice={() => setIsPracticing(true)}
        onDelete={() => {
          deleteStructure(selectedStructure.id);
          setSelectedStructure(null);
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
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Estrutura
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Criar Estrutura Gramatical</DialogTitle>
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

                  <Button onClick={handleCreateStructure} className="w-full">
                    Criar Estrutura
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
          ) : structures.length === 0 ? (
            <EmptyState
              icon={<Dumbbell className="w-12 h-12 text-muted-foreground" />}
              title="Nenhuma estrutura criada"
              description="Crie estruturas gramaticais como 'I wanna + verb'"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {structures.map(structure => (
                <Card 
                  key={structure.id}
                  className="cursor-pointer hover:border-primary transition-colors group"
                  onClick={() => setSelectedStructure(structure)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-mono">
                        {structure.fixedText} +
                      </CardTitle>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {structure.expectedInput}
                      </Badge>
                      {structure.examples.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {structure.examples.length} exemplo(s)
                        </span>
                      )}
                    </div>
                    {structure.translation && (
                      <p className="text-sm text-muted-foreground mt-2 truncate">
                        {structure.translation}
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
          ) : structures.length === 0 ? (
            <EmptyState
              icon={<Play className="w-12 h-12 text-muted-foreground" />}
              title="Nenhuma estrutura para praticar"
              description="Adicione estruturas primeiro"
            />
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Selecione uma estrutura para praticar:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {structures.map(structure => (
                  <Card 
                    key={structure.id}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => {
                      setSelectedStructure(structure);
                      setIsPracticing(true);
                    }}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">{structure.fixedText} +</span>
                          <Badge variant="outline" className="text-xs">
                            {structure.expectedInput}
                          </Badge>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Component for viewing details of a specific structure
function StructureDetail({ 
  structure, 
  onBack,
  onPractice,
  onDelete
}: { 
  structure: GrammarStructure; 
  onBack: () => void;
  onPractice: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold font-mono">{structure.fixedText} +</h2>
            <Badge variant="secondary" className="mt-1">
              {structure.expectedInput}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={onPractice}>
            <Play className="w-4 h-4 mr-2" />
            Praticar
          </Button>
          <Button variant="outline" onClick={onDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {structure.translation && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Tradução</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{structure.translation}</p>
            </CardContent>
          </Card>
        )}

        {structure.grammarTip && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                Dica Gramatical
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{structure.grammarTip}</p>
            </CardContent>
          </Card>
        )}

        {structure.examples.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Exemplos</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {structure.examples.map((example, idx) => (
                  <li key={idx} className="text-sm italic text-muted-foreground">
                    "{example}"
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {structure.allowedClasses && structure.allowedClasses.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Classes Aceitas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {structure.allowedClasses.map((cls, idx) => (
                  <Badge key={idx} variant="outline">
                    {cls}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
