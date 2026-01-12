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
  Lightbulb
} from 'lucide-react';
import { useGrammarStructures } from '@/hooks/useLanguagesModule';
import type { GrammarStructure, ExpectedInput } from '@/types/languages';
import { EXPECTED_INPUTS, GRAMMATICAL_CLASSES } from '@/types/languages';
import { StructuresPractice } from './StructuresPractice';

interface StructuresModuleProps {
  languageId: string;
}

export function StructuresModule({ languageId }: StructuresModuleProps) {
  const { structures, loading, addStructure, deleteStructure } = useGrammarStructures(languageId);
  const [activeTab, setActiveTab] = useState<'edit' | 'practice'>('edit');
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

  if (isPracticing) {
    return (
      <StructuresPractice 
        structures={structures}
        languageId={languageId}
        onBack={() => setIsPracticing(false)}
      />
    );
  }

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
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : structures.length === 0 ? (
            <EmptyState
              icon={<Dumbbell className="w-12 h-12 text-muted-foreground" />}
              title="Nenhuma estrutura criada"
              description="Crie estruturas gramaticais como 'I wanna + verb'"
            />
          ) : (
            <div className="space-y-4">
              {structures.map(structure => (
                <Card key={structure.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-mono font-medium">
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
                            <Lightbulb className="w-4 h-4 mt-0.5 text-yellow-500" />
                            <span>{structure.grammarTip}</span>
                          </div>
                        )}
                        {structure.examples.length > 0 && (
                          <div className="text-sm italic text-muted-foreground">
                            Ex: {structure.examples[0]}
                          </div>
                        )}
                      </div>
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
            <Card className="max-w-md mx-auto">
              <CardContent className="py-8 text-center space-y-4">
                <Dumbbell className="w-12 h-12 mx-auto text-primary" />
                <h3 className="text-lg font-medium">Praticar Estruturas</h3>
                <p className="text-muted-foreground">
                  {structures.length} estrutura(s) disponível(is)
                </p>
                <Button onClick={() => setIsPracticing(true)}>
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
