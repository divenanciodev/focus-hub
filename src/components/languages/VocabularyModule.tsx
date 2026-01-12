import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Play,
  BookOpen,
  ChevronRight,
  ArrowLeft,
  X
} from 'lucide-react';
import { useVocabularySets, useVocabularyWords } from '@/hooks/useLanguagesModule';
import type { VocabularySet, VocabularyWord, GrammaticalClass } from '@/types/languages';
import { GRAMMATICAL_CLASSES } from '@/types/languages';
import { VocabularyPractice } from './VocabularyPractice';

interface VocabularyModuleProps {
  languageId: string;
}

export function VocabularyModule({ languageId }: VocabularyModuleProps) {
  const { sets, loading, addSet, deleteSet } = useVocabularySets(languageId);
  const [activeTab, setActiveTab] = useState<'edit' | 'practice'>('edit');
  const [selectedSet, setSelectedSet] = useState<VocabularySet | null>(null);
  const [isPracticing, setIsPracticing] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newSetName, setNewSetName] = useState('');
  const [newSetType, setNewSetType] = useState<'grammatical_class' | 'thematic_set'>('thematic_set');
  const [newSetClass, setNewSetClass] = useState<GrammaticalClass>('noun');

  const handleCreateSet = async () => {
    if (!newSetName.trim()) return;
    
    await addSet({
      name: newSetName,
      setType: newSetType,
      grammaticalClass: newSetType === 'grammatical_class' ? newSetClass : undefined,
      color: '#6366f1',
      icon: newSetType === 'grammatical_class' ? '📖' : '📚',
    });
    
    setNewSetName('');
    setCreateModalOpen(false);
  };

  // If practicing
  if (isPracticing && selectedSet) {
    return (
      <VocabularyPractice 
        set={selectedSet} 
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
      <VocabularySetDetail 
        set={selectedSet}
        onBack={() => setSelectedSet(null)}
        onPractice={() => setIsPracticing(true)}
      />
    );
  }

  // Main vocabulary view
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
                  Novo Conjunto
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Conjunto de Vocabulário</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome do Conjunto</Label>
                    <Input 
                      value={newSetName}
                      onChange={(e) => setNewSetName(e.target.value)}
                      placeholder="Ex: Daily Actions, Travel, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select value={newSetType} onValueChange={(v: any) => setNewSetType(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="thematic_set">Conjunto Temático</SelectItem>
                        <SelectItem value="grammatical_class">Classe Gramatical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {newSetType === 'grammatical_class' && (
                    <div className="space-y-2">
                      <Label>Classe Gramatical</Label>
                      <Select value={newSetClass} onValueChange={(v: any) => setNewSetClass(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {GRAMMATICAL_CLASSES.map(gc => (
                            <SelectItem key={gc} value={gc}>
                              {gc.charAt(0).toUpperCase() + gc.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <Button onClick={handleCreateSet} className="w-full">
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
              icon={<BookOpen className="w-12 h-12 text-muted-foreground" />}
              title="Nenhum conjunto criado"
              description="Crie um conjunto de vocabulário para começar"
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
                    <Badge 
                      variant="secondary"
                      style={{ backgroundColor: `${set.color}20`, color: set.color }}
                    >
                      {set.setType === 'grammatical_class' ? set.grammaticalClass : 'Temático'}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="practice" className="mt-4">
          {loading ? (
            <Skeleton className="h-32" />
          ) : sets.length === 0 ? (
            <EmptyState
              icon={<Play className="w-12 h-12 text-muted-foreground" />}
              title="Nenhum conjunto para praticar"
              description="Adicione palavras aos conjuntos para praticar"
            />
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Selecione um conjunto para praticar:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sets.map(set => (
                  <Card 
                    key={set.id}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => {
                      setSelectedSet(set);
                      setIsPracticing(true);
                    }}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{set.icon}</span>
                          <span className="font-medium">{set.name}</span>
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

// Component for viewing/editing a specific vocabulary set
function VocabularySetDetail({ 
  set, 
  onBack,
  onPractice
}: { 
  set: VocabularySet; 
  onBack: () => void;
  onPractice: () => void;
}) {
  const { words, loading, addWord, deleteWord } = useVocabularyWords(set.id);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  const [newExample, setNewExample] = useState('');

  const handleAddWord = async () => {
    if (!newWord.trim()) return;
    
    await addWord({
      word: newWord,
      translation: newTranslation || undefined,
      example: newExample || undefined,
    });
    
    setNewWord('');
    setNewTranslation('');
    setNewExample('');
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
          {words.length > 0 && (
            <Button onClick={onPractice}>
              <Play className="w-4 h-4 mr-2" />
              Praticar
            </Button>
          )}
          <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Palavra
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Palavra</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Palavra *</Label>
                  <Input 
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    placeholder="Ex: study, work, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tradução</Label>
                  <Input 
                    value={newTranslation}
                    onChange={(e) => setNewTranslation(e.target.value)}
                    placeholder="Ex: estudar, trabalhar, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Exemplo</Label>
                  <Input 
                    value={newExample}
                    onChange={(e) => setNewExample(e.target.value)}
                    placeholder="Ex: I study every day."
                  />
                </div>
                <Button onClick={handleAddWord} className="w-full">
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
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : words.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-12 h-12 text-muted-foreground" />}
          title="Nenhuma palavra cadastrada"
          description="Adicione palavras a este conjunto"
        />
      ) : (
        <div className="space-y-2">
          {words.map(word => (
            <Card key={word.id}>
              <CardContent className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{word.word}</div>
                  {word.translation && (
                    <div className="text-sm text-muted-foreground">{word.translation}</div>
                  )}
                  {word.example && (
                    <div className="text-xs text-muted-foreground italic mt-1">"{word.example}"</div>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => deleteWord(word.id)}
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
