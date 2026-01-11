import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  X,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  BookOpen,
  GraduationCap,
  Pencil,
  Save,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Language } from '@/types/languages';
import { LanguagePractice } from './LanguagePractice';

interface LanguagePanelProps {
  language: Language;
  onClose: () => void;
  onUpdate: () => void;
}

interface Section {
  id: string;
  name: string;
  levelId: string;
  sortOrder: number;
}

interface Structure {
  id: string;
  name: string;
  pattern: string | null;
  patternTranslation: string | null;
  sectionId: string;
  sortOrder: number;
}

interface VocabularyWord {
  id: string;
  structureId: string;
  wordType: string;
  word: string;
  translation: string | null;
  sortOrder: number;
}

const WORD_TYPES = [
  { value: 'verb', label: 'Verbo' },
  { value: 'noun', label: 'Substantivo' },
  { value: 'adjective', label: 'Adjetivo' },
  { value: 'adverb', label: 'Advérbio' },
  { value: 'preposition', label: 'Preposição' },
  { value: 'pronoun', label: 'Pronome' },
  { value: 'conjunction', label: 'Conjunção' },
  { value: 'other', label: 'Outro' },
];

export function LanguagePanel({ language, onClose, onUpdate }: LanguagePanelProps) {
  const [activeTab, setActiveTab] = useState('edit');
  const [editedLanguage, setEditedLanguage] = useState({ ...language });
  const [sections, setSections] = useState<Section[]>([]);
  const [structures, setStructures] = useState<Record<string, Structure[]>>({});
  const [vocabulary, setVocabulary] = useState<Record<string, VocabularyWord[]>>({});
  const [loading, setLoading] = useState(true);
  
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [openStructures, setOpenStructures] = useState<Set<string>>(new Set());
  
  // Modal states
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [structureModalOpen, setStructureModalOpen] = useState(false);
  const [vocabularyModalOpen, setVocabularyModalOpen] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedStructureId, setSelectedStructureId] = useState<string | null>(null);
  
  const [newSectionName, setNewSectionName] = useState('');
  const [newStructure, setNewStructure] = useState({ name: '', pattern: '', patternTranslation: '' });
  const [newVocab, setNewVocab] = useState({ wordType: 'verb', word: '', translation: '' });

  useEffect(() => {
    loadData();
  }, [language.id]);

  const loadData = async () => {
    setLoading(true);
    
    // Get the first level or create one
    let { data: levels } = await supabase
      .from('language_levels')
      .select('id')
      .eq('language_id', language.id)
      .order('sort_order')
      .limit(1);
    
    let levelId: string;
    if (!levels || levels.length === 0) {
      // Create a default level
      const { data: newLevel } = await supabase
        .from('language_levels')
        .insert({ language_id: language.id, name: 'Básico', sort_order: 0 })
        .select()
        .single();
      levelId = newLevel?.id || '';
    } else {
      levelId = levels[0].id;
    }

    // Load sections for this level
    const { data: sectionsData } = await supabase
      .from('language_sections')
      .select('*')
      .eq('level_id', levelId)
      .order('sort_order');

    const mappedSections: Section[] = (sectionsData || []).map(s => ({
      id: s.id,
      name: s.name,
      levelId: s.level_id,
      sortOrder: s.sort_order ?? 0,
    }));
    setSections(mappedSections);

    // Load structures for each section
    const structuresMap: Record<string, Structure[]> = {};
    const vocabMap: Record<string, VocabularyWord[]> = {};

    for (const section of mappedSections) {
      const { data: structuresData } = await supabase
        .from('language_structures')
        .select('*')
        .eq('section_id', section.id)
        .order('sort_order');

      structuresMap[section.id] = (structuresData || []).map(st => ({
        id: st.id,
        name: st.name,
        pattern: st.pattern,
        patternTranslation: st.pattern_translation,
        sectionId: st.section_id,
        sortOrder: st.sort_order ?? 0,
      }));

      // Load vocabulary for each structure
      for (const structure of structuresMap[section.id]) {
        const { data: vocabData } = await supabase
          .from('language_vocabulary')
          .select('*')
          .eq('structure_id', structure.id)
          .order('sort_order');

        vocabMap[structure.id] = (vocabData || []).map(v => ({
          id: v.id,
          structureId: v.structure_id,
          wordType: v.word_type,
          word: v.word,
          translation: v.translation,
          sortOrder: v.sort_order ?? 0,
        }));
      }
    }

    setStructures(structuresMap);
    setVocabulary(vocabMap);
    setLoading(false);
  };

  const saveLanguageDetails = async () => {
    await supabase
      .from('languages')
      .update({
        category: editedLanguage.category,
        objective: editedLanguage.objective,
      })
      .eq('id', language.id);
    
    toast.success('Detalhes salvos!');
    onUpdate();
  };

  const handleAddSection = async () => {
    if (!newSectionName.trim()) return;

    // Get level id
    const { data: levels } = await supabase
      .from('language_levels')
      .select('id')
      .eq('language_id', language.id)
      .order('sort_order')
      .limit(1);

    if (!levels || levels.length === 0) return;

    const maxOrder = sections.length > 0 ? Math.max(...sections.map(s => s.sortOrder)) + 1 : 0;

    const { error } = await supabase.from('language_sections').insert({
      level_id: levels[0].id,
      name: newSectionName.trim(),
      sort_order: maxOrder,
    });

    if (error) {
      toast.error('Erro ao criar seção');
    } else {
      toast.success('Seção criada!');
      setNewSectionName('');
      setSectionModalOpen(false);
      loadData();
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('Excluir esta seção e todo o conteúdo?')) return;
    await supabase.from('language_sections').delete().eq('id', sectionId);
    toast.success('Seção excluída!');
    loadData();
  };

  const handleAddStructure = async () => {
    if (!selectedSectionId || !newStructure.name.trim()) return;

    const sectionStructures = structures[selectedSectionId] || [];
    const maxOrder = sectionStructures.length > 0 ? Math.max(...sectionStructures.map(s => s.sortOrder)) + 1 : 0;

    const { error } = await supabase.from('language_structures').insert({
      section_id: selectedSectionId,
      name: newStructure.name.trim(),
      pattern: newStructure.pattern.trim() || null,
      pattern_translation: newStructure.patternTranslation.trim() || null,
      sort_order: maxOrder,
    });

    if (error) {
      toast.error('Erro ao criar estrutura');
    } else {
      toast.success('Estrutura criada!');
      setNewStructure({ name: '', pattern: '', patternTranslation: '' });
      setStructureModalOpen(false);
      loadData();
    }
  };

  const handleDeleteStructure = async (structureId: string) => {
    if (!confirm('Excluir esta estrutura?')) return;
    await supabase.from('language_structures').delete().eq('id', structureId);
    toast.success('Estrutura excluída!');
    loadData();
  };

  const handleAddVocabulary = async () => {
    if (!selectedStructureId || !newVocab.word.trim()) return;

    const structureVocab = vocabulary[selectedStructureId] || [];
    const maxOrder = structureVocab.length > 0 ? Math.max(...structureVocab.map(v => v.sortOrder)) + 1 : 0;

    const { error } = await supabase.from('language_vocabulary').insert({
      structure_id: selectedStructureId,
      word_type: newVocab.wordType,
      word: newVocab.word.trim(),
      translation: newVocab.translation.trim() || null,
      sort_order: maxOrder,
    });

    if (error) {
      toast.error('Erro ao adicionar palavra');
    } else {
      toast.success('Palavra adicionada!');
      setNewVocab({ wordType: 'verb', word: '', translation: '' });
      setVocabularyModalOpen(false);
      loadData();
    }
  };

  const handleDeleteVocabulary = async (vocabId: string) => {
    await supabase.from('language_vocabulary').delete().eq('id', vocabId);
    toast.success('Palavra removida!');
    loadData();
  };

  const toggleSection = (sectionId: string) => {
    const newOpen = new Set(openSections);
    if (newOpen.has(sectionId)) {
      newOpen.delete(sectionId);
    } else {
      newOpen.add(sectionId);
    }
    setOpenSections(newOpen);
  };

  const toggleStructure = (structureId: string) => {
    const newOpen = new Set(openStructures);
    if (newOpen.has(structureId)) {
      newOpen.delete(structureId);
    } else {
      newOpen.add(structureId);
    }
    setOpenStructures(newOpen);
  };

  // Parse pattern to identify placeholders like "+verb", "+noun"
  const parsePattern = (pattern: string) => {
    const parts = pattern.split(/(\+\w+)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('+')) {
        const type = part.substring(1);
        return { type: 'placeholder', value: type, key: idx };
      }
      return { type: 'text', value: part, key: idx };
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{language.icon}</span>
          <div>
            <h1 className="text-xl font-bold">{language.name}</h1>
            {editedLanguage.category && (
              <p className="text-sm text-muted-foreground">{editedLanguage.category}</p>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </header>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b border-border px-4">
          <TabsList className="h-12">
            <TabsTrigger value="edit" className="gap-2">
              <Pencil className="w-4 h-4" />
              Editar
            </TabsTrigger>
            <TabsTrigger value="practice" className="gap-2">
              <GraduationCap className="w-4 h-4" />
              Praticar
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Edit Tab */}
        <TabsContent value="edit" className="flex-1 overflow-auto p-4 m-0">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Category & Objective */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações Gerais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Input
                    id="category"
                    value={editedLanguage.category || ''}
                    onChange={(e) => setEditedLanguage({ ...editedLanguage, category: e.target.value })}
                    placeholder="Ex: English Speaking Basics"
                  />
                </div>
                <div>
                  <Label htmlFor="objective">Objetivo</Label>
                  <Input
                    id="objective"
                    value={editedLanguage.objective || ''}
                    onChange={(e) => setEditedLanguage({ ...editedLanguage, objective: e.target.value })}
                    placeholder="Ex: Fluência oral através de sentence patterns"
                  />
                </div>
                <Button onClick={saveLanguageDetails} size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
              </CardContent>
            </Card>

            {/* Sections */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Seções</CardTitle>
                <Button size="sm" onClick={() => { setNewSectionName(''); setSectionModalOpen(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Seção
                </Button>
              </CardHeader>
              <CardContent>
                {sections.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma seção criada</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setSectionModalOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Criar primeira seção
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sections.map((section) => (
                      <Collapsible
                        key={section.id}
                        open={openSections.has(section.id)}
                        onOpenChange={() => toggleSection(section.id)}
                      >
                        <div className="border rounded-lg">
                          <CollapsibleTrigger asChild>
                            <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/30">
                              <div className="flex items-center gap-2">
                                {openSections.has(section.id) ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                                <span className="font-medium">{section.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {(structures[section.id] || []).length} estruturas
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedSectionId(section.id);
                                    setNewStructure({ name: '', pattern: '', patternTranslation: '' });
                                    setStructureModalOpen(true);
                                  }}
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSection(section.id);
                                  }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="px-3 pb-3 space-y-2">
                              {(structures[section.id] || []).length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                  Nenhuma estrutura
                                </p>
                              ) : (
                                (structures[section.id] || []).map((structure) => (
                                  <Collapsible
                                    key={structure.id}
                                    open={openStructures.has(structure.id)}
                                    onOpenChange={() => toggleStructure(structure.id)}
                                  >
                                    <div className="bg-muted/30 rounded-lg">
                                      <CollapsibleTrigger asChild>
                                        <div className="flex items-center justify-between p-2 cursor-pointer hover:bg-muted/50">
                                          <div className="flex items-center gap-2">
                                            {openStructures.has(structure.id) ? (
                                              <ChevronDown className="w-3 h-3" />
                                            ) : (
                                              <ChevronRight className="w-3 h-3" />
                                            )}
                                            <div>
                                              <span className="text-sm font-medium">{structure.name}</span>
                                              {structure.pattern && (
                                                <div className="text-xs text-muted-foreground">
                                                  {parsePattern(structure.pattern).map((part) => (
                                                    <span
                                                      key={part.key}
                                                      className={cn(
                                                        part.type === 'placeholder' && 'text-primary font-medium'
                                                      )}
                                                    >
                                                      {part.type === 'placeholder' ? `[${part.value}]` : part.value}
                                                    </span>
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <Badge variant="secondary" className="text-xs">
                                              {(vocabulary[structure.id] || []).length} palavras
                                            </Badge>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-6 w-6"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedStructureId(structure.id);
                                                setNewVocab({ wordType: 'verb', word: '', translation: '' });
                                                setVocabularyModalOpen(true);
                                              }}
                                            >
                                              <Plus className="w-3 h-3" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-6 w-6 text-destructive"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteStructure(structure.id);
                                              }}
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </Button>
                                          </div>
                                        </div>
                                      </CollapsibleTrigger>
                                      <CollapsibleContent>
                                        <div className="px-2 pb-2 space-y-1">
                                          {(vocabulary[structure.id] || []).length === 0 ? (
                                            <p className="text-xs text-muted-foreground text-center py-2">
                                              Nenhuma palavra cadastrada
                                            </p>
                                          ) : (
                                            <div className="flex flex-wrap gap-1">
                                              {(vocabulary[structure.id] || []).map((vocab) => (
                                                <Badge
                                                  key={vocab.id}
                                                  variant="outline"
                                                  className="text-xs group cursor-pointer hover:bg-destructive/10"
                                                  onClick={() => handleDeleteVocabulary(vocab.id)}
                                                >
                                                  <span className="text-primary mr-1">[{vocab.wordType}]</span>
                                                  {vocab.word}
                                                  {vocab.translation && ` (${vocab.translation})`}
                                                  <X className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100" />
                                                </Badge>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </CollapsibleContent>
                                    </div>
                                  </Collapsible>
                                ))
                              )}
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Practice Tab */}
        <TabsContent value="practice" className="flex-1 overflow-auto m-0">
          <LanguagePractice
            languageId={language.id}
            sections={sections}
            structures={structures}
            vocabulary={vocabulary}
          />
        </TabsContent>
      </Tabs>

      {/* Section Modal */}
      <Dialog open={sectionModalOpen} onOpenChange={setSectionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Seção</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Nome da Seção</Label>
              <Input
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder="Ex: Basics – Section I"
              />
            </div>
            <Button onClick={handleAddSection} className="w-full" disabled={!newSectionName.trim()}>
              Criar Seção
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Structure Modal */}
      <Dialog open={structureModalOpen} onOpenChange={setStructureModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Estrutura</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Nome da Estrutura</Label>
              <Input
                value={newStructure.name}
                onChange={(e) => setNewStructure({ ...newStructure, name: e.target.value })}
                placeholder="Ex: I wanna"
              />
            </div>
            <div>
              <Label>Padrão (use +tipo para campos)</Label>
              <Input
                value={newStructure.pattern}
                onChange={(e) => setNewStructure({ ...newStructure, pattern: e.target.value })}
                placeholder="Ex: I wanna +verb"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use +verb, +noun, +adjective, etc. para criar campos de preenchimento
              </p>
            </div>
            <div>
              <Label>Tradução do Padrão</Label>
              <Input
                value={newStructure.patternTranslation}
                onChange={(e) => setNewStructure({ ...newStructure, patternTranslation: e.target.value })}
                placeholder="Ex: Eu quero + verbo"
              />
            </div>
            <Button onClick={handleAddStructure} className="w-full" disabled={!newStructure.name.trim()}>
              Criar Estrutura
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Vocabulary Modal */}
      <Dialog open={vocabularyModalOpen} onOpenChange={setVocabularyModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Palavra</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Tipo</Label>
              <Select
                value={newVocab.wordType}
                onValueChange={(value) => setNewVocab({ ...newVocab, wordType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WORD_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Palavra em Inglês</Label>
              <Input
                value={newVocab.word}
                onChange={(e) => setNewVocab({ ...newVocab, word: e.target.value })}
                placeholder="Ex: play"
              />
            </div>
            <div>
              <Label>Tradução (opcional)</Label>
              <Input
                value={newVocab.translation}
                onChange={(e) => setNewVocab({ ...newVocab, translation: e.target.value })}
                placeholder="Ex: jogar"
              />
            </div>
            <Button onClick={handleAddVocabulary} className="w-full" disabled={!newVocab.word.trim()}>
              Adicionar Palavra
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
