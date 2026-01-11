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
  Type,
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

// 10 classes gramaticais
const WORD_TYPES = [
  { value: 'verb', label: 'Verbo', color: 'bg-blue-500' },
  { value: 'noun', label: 'Substantivo', color: 'bg-green-500' },
  { value: 'adjective', label: 'Adjetivo', color: 'bg-yellow-500' },
  { value: 'adverb', label: 'Advérbio', color: 'bg-purple-500' },
  { value: 'pronoun', label: 'Pronome', color: 'bg-pink-500' },
  { value: 'preposition', label: 'Preposição', color: 'bg-orange-500' },
  { value: 'conjunction', label: 'Conjunção', color: 'bg-teal-500' },
  { value: 'interjection', label: 'Interjeição', color: 'bg-red-500' },
  { value: 'article', label: 'Artigo', color: 'bg-indigo-500' },
  { value: 'numeral', label: 'Numeral', color: 'bg-cyan-500' },
];

interface PatternPart {
  type: 'text' | 'placeholder';
  value: string;
  wordType?: string;
}

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
  const [selectedVocabType, setSelectedVocabType] = useState<string>('verb');
  
  const [newSectionName, setNewSectionName] = useState('');
  
  // Structure builder state
  const [structureName, setStructureName] = useState('');
  const [patternParts, setPatternParts] = useState<PatternPart[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [patternTranslation, setPatternTranslation] = useState('');
  
  const [newVocab, setNewVocab] = useState({ word: '', translation: '' });

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

  // Build pattern string from parts
  const buildPatternString = (): string => {
    return patternParts.map(part => {
      if (part.type === 'placeholder') {
        return `[${part.wordType}]`;
      }
      return part.value;
    }).join('');
  };

  // Add text to pattern
  const addTextToPattern = () => {
    if (!currentText.trim()) return;
    setPatternParts([...patternParts, { type: 'text', value: currentText }]);
    setCurrentText('');
  };

  // Add placeholder to pattern
  const addPlaceholderToPattern = (wordType: string) => {
    // If there's pending text, add it first
    if (currentText.trim()) {
      setPatternParts([
        ...patternParts, 
        { type: 'text', value: currentText },
        { type: 'placeholder', value: wordType, wordType }
      ]);
      setCurrentText('');
    } else {
      setPatternParts([...patternParts, { type: 'placeholder', value: wordType, wordType }]);
    }
  };

  // Remove last part from pattern
  const removeLastPart = () => {
    setPatternParts(patternParts.slice(0, -1));
  };

  // Clear pattern
  const clearPattern = () => {
    setPatternParts([]);
    setCurrentText('');
  };

  const handleAddStructure = async () => {
    if (!selectedSectionId || !structureName.trim()) return;

    // Add any remaining text
    let finalParts = [...patternParts];
    if (currentText.trim()) {
      finalParts.push({ type: 'text', value: currentText });
    }

    const pattern = finalParts.map(part => {
      if (part.type === 'placeholder') {
        return `[${part.wordType}]`;
      }
      return part.value;
    }).join('');

    const sectionStructures = structures[selectedSectionId] || [];
    const maxOrder = sectionStructures.length > 0 ? Math.max(...sectionStructures.map(s => s.sortOrder)) + 1 : 0;

    const { error } = await supabase.from('language_structures').insert({
      section_id: selectedSectionId,
      name: structureName.trim(),
      pattern: pattern || null,
      pattern_translation: patternTranslation.trim() || null,
      sort_order: maxOrder,
    });

    if (error) {
      toast.error('Erro ao criar estrutura');
    } else {
      toast.success('Estrutura criada!');
      setStructureName('');
      setPatternParts([]);
      setCurrentText('');
      setPatternTranslation('');
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
      word_type: selectedVocabType,
      word: newVocab.word.trim(),
      translation: newVocab.translation.trim() || null,
      sort_order: maxOrder,
    });

    if (error) {
      toast.error('Erro ao adicionar palavra');
    } else {
      toast.success('Palavra adicionada!');
      setNewVocab({ word: '', translation: '' });
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

  // Get word type info
  const getWordTypeInfo = (type: string) => {
    return WORD_TYPES.find(t => t.value === type) || { value: type, label: type, color: 'bg-gray-500' };
  };

  // Get unique word types used in a structure's pattern
  const getStructureWordTypes = (pattern: string | null): string[] => {
    if (!pattern) return [];
    const matches = pattern.match(/\[(\w+)\]/g);
    if (!matches) return [];
    return [...new Set(matches.map(m => m.slice(1, -1)))];
  };

  // Parse pattern for display with highlighted placeholders
  const renderPattern = (pattern: string | null) => {
    if (!pattern) return null;
    const parts = pattern.split(/(\[\w+\])/g);
    return parts.map((part, idx) => {
      const match = part.match(/\[(\w+)\]/);
      if (match) {
        const type = match[1];
        const typeInfo = getWordTypeInfo(type);
        return (
          <span
            key={idx}
            className={cn(
              'inline-flex items-center px-2 py-0.5 rounded text-white text-xs font-medium mx-0.5',
              typeInfo.color
            )}
          >
            {typeInfo.label}
          </span>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  // Get vocabulary grouped by word type for a structure
  const getVocabByType = (structureId: string) => {
    const vocabList = vocabulary[structureId] || [];
    const grouped: Record<string, VocabularyWord[]> = {};
    vocabList.forEach(v => {
      if (!grouped[v.wordType]) {
        grouped[v.wordType] = [];
      }
      grouped[v.wordType].push(v);
    });
    return grouped;
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
                                    setStructureName('');
                                    setPatternParts([]);
                                    setCurrentText('');
                                    setPatternTranslation('');
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
                            <div className="px-3 pb-3 space-y-3">
                              {(structures[section.id] || []).length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                  Nenhuma estrutura
                                </p>
                              ) : (
                                (structures[section.id] || []).map((structure) => {
                                  const wordTypes = getStructureWordTypes(structure.pattern);
                                  const vocabByType = getVocabByType(structure.id);
                                  
                                  return (
                                    <Collapsible
                                      key={structure.id}
                                      open={openStructures.has(structure.id)}
                                      onOpenChange={() => toggleStructure(structure.id)}
                                    >
                                      <div className="bg-muted/30 rounded-lg">
                                        <CollapsibleTrigger asChild>
                                          <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50">
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2 mb-1">
                                                {openStructures.has(structure.id) ? (
                                                  <ChevronDown className="w-3 h-3" />
                                                ) : (
                                                  <ChevronRight className="w-3 h-3" />
                                                )}
                                                <span className="font-medium">{structure.name}</span>
                                              </div>
                                              {structure.pattern && (
                                                <div className="ml-5 text-sm flex items-center flex-wrap gap-1">
                                                  {renderPattern(structure.pattern)}
                                                </div>
                                              )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <Badge variant="secondary" className="text-xs">
                                                {(vocabulary[structure.id] || []).length} palavras
                                              </Badge>
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
                                          <div className="px-3 pb-3 space-y-3">
                                            {/* Vocabulary cards by type */}
                                            {wordTypes.length === 0 ? (
                                              <p className="text-xs text-muted-foreground text-center py-2">
                                                Nenhum campo de preenchimento definido no padrão
                                              </p>
                                            ) : (
                                              <div className="grid gap-3">
                                                {wordTypes.map((wordType) => {
                                                  const typeInfo = getWordTypeInfo(wordType);
                                                  const typeVocab = vocabByType[wordType] || [];
                                                  
                                                  return (
                                                    <Card key={wordType} className="border-l-4" style={{ borderLeftColor: typeInfo.color.replace('bg-', '').includes('-') ? `var(--${typeInfo.color.replace('bg-', '')})` : undefined }}>
                                                      <CardHeader className="py-2 px-3">
                                                        <div className="flex items-center justify-between">
                                                          <div className="flex items-center gap-2">
                                                            <Badge className={cn('text-white', typeInfo.color)}>
                                                              {typeInfo.label}
                                                            </Badge>
                                                            <span className="text-xs text-muted-foreground">
                                                              {typeVocab.length} palavras
                                                            </span>
                                                          </div>
                                                          <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7"
                                                            onClick={() => {
                                                              setSelectedStructureId(structure.id);
                                                              setSelectedVocabType(wordType);
                                                              setNewVocab({ word: '', translation: '' });
                                                              setVocabularyModalOpen(true);
                                                            }}
                                                          >
                                                            <Plus className="w-3 h-3 mr-1" />
                                                            Adicionar
                                                          </Button>
                                                        </div>
                                                      </CardHeader>
                                                      <CardContent className="py-2 px-3">
                                                        {typeVocab.length === 0 ? (
                                                          <p className="text-xs text-muted-foreground">
                                                            Clique em "Adicionar" para cadastrar palavras
                                                          </p>
                                                        ) : (
                                                          <div className="flex flex-wrap gap-1">
                                                            {typeVocab.map((vocab) => (
                                                              <Badge
                                                                key={vocab.id}
                                                                variant="outline"
                                                                className="text-xs group cursor-pointer hover:bg-destructive/10"
                                                                onClick={() => handleDeleteVocabulary(vocab.id)}
                                                              >
                                                                {vocab.word}
                                                                {vocab.translation && (
                                                                  <span className="text-muted-foreground ml-1">
                                                                    ({vocab.translation})
                                                                  </span>
                                                                )}
                                                                <X className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100" />
                                                              </Badge>
                                                            ))}
                                                          </div>
                                                        )}
                                                      </CardContent>
                                                    </Card>
                                                  );
                                                })}
                                              </div>
                                            )}
                                          </div>
                                        </CollapsibleContent>
                                      </div>
                                    </Collapsible>
                                  );
                                })
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

      {/* Structure Modal with Pattern Builder */}
      <Dialog open={structureModalOpen} onOpenChange={setStructureModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova Estrutura</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Nome da Estrutura</Label>
              <Input
                value={structureName}
                onChange={(e) => setStructureName(e.target.value)}
                placeholder="Ex: I wanna"
              />
            </div>
            
            {/* Pattern Builder */}
            <div>
              <Label>Construir Padrão</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Digite o texto e adicione campos selecionando a classe gramatical
              </p>
              
              {/* Pattern Preview */}
              <div className="bg-muted/50 rounded-lg p-3 mb-3 min-h-[50px]">
                {patternParts.length === 0 && !currentText ? (
                  <span className="text-muted-foreground text-sm">O padrão aparecerá aqui...</span>
                ) : (
                  <div className="flex items-center flex-wrap gap-1">
                    {patternParts.map((part, idx) => {
                      if (part.type === 'placeholder') {
                        const typeInfo = getWordTypeInfo(part.wordType || '');
                        return (
                          <span
                            key={idx}
                            className={cn(
                              'inline-flex items-center px-2 py-0.5 rounded text-white text-sm font-medium',
                              typeInfo.color
                            )}
                          >
                            {typeInfo.label}
                          </span>
                        );
                      }
                      return <span key={idx} className="text-sm">{part.value}</span>;
                    })}
                    {currentText && <span className="text-sm text-muted-foreground">{currentText}</span>}
                  </div>
                )}
              </div>

              {/* Text Input */}
              <div className="flex gap-2 mb-3">
                <Input
                  value={currentText}
                  onChange={(e) => setCurrentText(e.target.value)}
                  placeholder="Digite o texto..."
                  className="flex-1"
                />
              </div>

              {/* Word Type Buttons */}
              <div className="space-y-2">
                <Label className="text-xs">Clique para adicionar um campo:</Label>
                <div className="flex flex-wrap gap-1">
                  {WORD_TYPES.map((type) => (
                    <Button
                      key={type.value}
                      variant="outline"
                      size="sm"
                      className={cn(
                        'text-xs h-7',
                        'hover:text-white',
                        `hover:${type.color}`
                      )}
                      onClick={() => addPlaceholderToPattern(type.value)}
                    >
                      <Type className="w-3 h-3 mr-1" />
                      {type.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {patternParts.length > 0 && (
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" onClick={removeLastPart}>
                    Desfazer
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearPattern}>
                    Limpar
                  </Button>
                </div>
              )}
            </div>

            <div>
              <Label>Tradução do Padrão</Label>
              <Input
                value={patternTranslation}
                onChange={(e) => setPatternTranslation(e.target.value)}
                placeholder="Ex: Eu quero + verbo"
              />
            </div>
            
            <Button onClick={handleAddStructure} className="w-full" disabled={!structureName.trim()}>
              Criar Estrutura
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Vocabulary Modal */}
      <Dialog open={vocabularyModalOpen} onOpenChange={setVocabularyModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Adicionar {getWordTypeInfo(selectedVocabType).label}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex items-center gap-2">
              <Badge className={cn('text-white', getWordTypeInfo(selectedVocabType).color)}>
                {getWordTypeInfo(selectedVocabType).label}
              </Badge>
            </div>
            <div>
              <Label>Palavra em Inglês</Label>
              <Input
                value={newVocab.word}
                onChange={(e) => setNewVocab({ ...newVocab, word: e.target.value })}
                placeholder="Ex: play"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newVocab.word.trim()) {
                    handleAddVocabulary();
                  }
                }}
              />
            </div>
            <div>
              <Label>Tradução (opcional)</Label>
              <Input
                value={newVocab.translation}
                onChange={(e) => setNewVocab({ ...newVocab, translation: e.target.value })}
                placeholder="Ex: jogar"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newVocab.word.trim()) {
                    handleAddVocabulary();
                  }
                }}
              />
            </div>
            <Button onClick={handleAddVocabulary} className="w-full" disabled={!newVocab.word.trim()}>
              Adicionar {getWordTypeInfo(selectedVocabType).label}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Pressione Enter para adicionar rapidamente
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
