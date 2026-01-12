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
  Library,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Language } from '@/types/languages';
import { LanguageHomeView } from './LanguageHomeView';
import { FillPracticeMode } from './FillPracticeMode';

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

type ViewMode = 'home' | 'edit' | 'practice' | 'fill-practice';

export function LanguagePanel({ language, onClose, onUpdate }: LanguagePanelProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [editedLanguage, setEditedLanguage] = useState({ ...language });
  const [sections, setSections] = useState<Section[]>([]);
  const [structures, setStructures] = useState<Record<string, Structure[]>>({});
  const [vocabulary, setVocabulary] = useState<Record<string, VocabularyWord[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedPracticeSection, setSelectedPracticeSection] = useState<string | null>(null);
  
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
  
  // Step state for structure modal
  const [structureStep, setStructureStep] = useState<1 | 2>(1);
  const [newStructureId, setNewStructureId] = useState<string | null>(null);
  const [stepTwoVocab, setStepTwoVocab] = useState<Record<string, { word: string; translation: string }[]>>({});

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

  // Get word types from current pattern parts
  const getPatternWordTypes = (): string[] => {
    let finalParts = [...patternParts];
    if (currentText.trim()) {
      finalParts.push({ type: 'text', value: currentText });
    }
    return [...new Set(finalParts.filter(p => p.type === 'placeholder').map(p => p.wordType || ''))];
  };

  const handleGoToStep2 = async () => {
    if (!selectedSectionId || !structureName.trim()) return;

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

    const { data, error } = await supabase.from('language_structures').insert({
      section_id: selectedSectionId,
      name: structureName.trim(),
      pattern: pattern || null,
      pattern_translation: patternTranslation.trim() || null,
      sort_order: maxOrder,
    }).select().single();

    if (error) {
      toast.error('Erro ao criar estrutura');
    } else {
      toast.success('Estrutura criada! Agora adicione o vocabulário.');
      setNewStructureId(data.id);
      
      const wordTypes = getPatternWordTypes();
      const initialVocab: Record<string, { word: string; translation: string }[]> = {};
      wordTypes.forEach(type => {
        initialVocab[type] = [];
      });
      setStepTwoVocab(initialVocab);
      setStructureStep(2);
      loadData();
    }
  };

  const handleAddVocabInStep2 = (wordType: string, word: string, translation: string) => {
    if (!word.trim()) return;
    setStepTwoVocab(prev => ({
      ...prev,
      [wordType]: [...(prev[wordType] || []), { word: word.trim(), translation: translation.trim() }]
    }));
  };

  const handleRemoveVocabInStep2 = (wordType: string, index: number) => {
    setStepTwoVocab(prev => ({
      ...prev,
      [wordType]: prev[wordType].filter((_, i) => i !== index)
    }));
  };

  const handleSaveStep2Vocabulary = async () => {
    if (!newStructureId) return;

    const vocabToInsert: { structure_id: string; word_type: string; word: string; translation: string | null; sort_order: number }[] = [];
    let sortOrder = 0;

    Object.entries(stepTwoVocab).forEach(([wordType, words]) => {
      words.forEach(w => {
        vocabToInsert.push({
          structure_id: newStructureId,
          word_type: wordType,
          word: w.word,
          translation: w.translation || null,
          sort_order: sortOrder++,
        });
      });
    });

    if (vocabToInsert.length > 0) {
      const { error } = await supabase.from('language_vocabulary').insert(vocabToInsert);
      if (error) {
        toast.error('Erro ao salvar vocabulário');
        return;
      }
    }

    toast.success('Vocabulário salvo!');
    setStructureName('');
    setPatternParts([]);
    setCurrentText('');
    setPatternTranslation('');
    setStructureStep(1);
    setNewStructureId(null);
    setStepTwoVocab({});
    setStructureModalOpen(false);
    loadData();
  };

  const handleSkipStep2 = () => {
    setStructureName('');
    setPatternParts([]);
    setCurrentText('');
    setPatternTranslation('');
    setStructureStep(1);
    setNewStructureId(null);
    setStepTwoVocab({});
    setStructureModalOpen(false);
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

  const getWordTypeInfo = (type: string) => {
    return WORD_TYPES.find(t => t.value === type) || { value: type, label: type, color: 'bg-gray-500' };
  };

  const getStructureWordTypes = (pattern: string | null): string[] => {
    if (!pattern) return [];
    const matches = pattern.match(/\[(\w+)\]/g);
    if (!matches) return [];
    return [...new Set(matches.map(m => m.slice(1, -1)))];
  };

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

  const handleStartPractice = (sectionId: string | null) => {
    setSelectedPracticeSection(sectionId);
    setViewMode('fill-practice');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  // Fill Practice Mode View
  if (viewMode === 'fill-practice') {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <FillPracticeMode
          languageCategory={editedLanguage.category || language.name}
          sections={sections}
          structures={structures}
          vocabulary={vocabulary}
          selectedSectionId={selectedPracticeSection}
          onBack={() => setViewMode('home')}
        />
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
        <div className="flex items-center gap-2">
          {viewMode !== 'home' && (
            <Button variant="ghost" onClick={() => setViewMode('home')}>
              Voltar
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <Tabs value={viewMode === 'home' ? 'home' : viewMode} onValueChange={(v) => setViewMode(v as ViewMode)} className="flex-1 flex flex-col">
        <div className="border-b border-border px-4">
          <TabsList className="h-12">
            <TabsTrigger value="home" className="gap-2">
              <Library className="w-4 h-4" />
              Início
            </TabsTrigger>
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

        {/* Home Tab */}
        <TabsContent value="home" className="flex-1 overflow-auto m-0">
          <LanguageHomeView
            language={language}
            sections={sections}
            structures={structures}
            vocabulary={vocabulary}
            onRefresh={loadData}
            onStartPractice={handleStartPractice}
          />
        </TabsContent>

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
                                                <span className="font-medium text-sm">{structure.name}</span>
                                              </div>
                                              {structure.pattern && (
                                                <div className="text-sm ml-5 flex items-center flex-wrap">
                                                  {renderPattern(structure.pattern)}
                                                </div>
                                              )}
                                            </div>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-7 w-7 text-destructive"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteStructure(structure.id);
                                              }}
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </Button>
                                          </div>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                          <div className="px-3 pb-3 space-y-2">
                                            {/* Translation */}
                                            {structure.patternTranslation && (
                                              <p className="text-sm text-muted-foreground italic ml-5">
                                                "{structure.patternTranslation}"
                                              </p>
                                            )}

                                            {/* Vocabulary by type */}
                                            {wordTypes.length > 0 && (
                                              <div className="ml-5 space-y-2">
                                                {wordTypes.map(wordType => {
                                                  const typeInfo = getWordTypeInfo(wordType);
                                                  const words = vocabByType[wordType] || [];
                                                  
                                                  return (
                                                    <div key={wordType} className="flex items-start gap-2">
                                                      <Badge className={cn('text-white text-xs', typeInfo.color)}>
                                                        {typeInfo.label}
                                                      </Badge>
                                                      <div className="flex flex-wrap gap-1">
                                                        {words.map(word => (
                                                          <Badge
                                                            key={word.id}
                                                            variant="outline"
                                                            className="text-xs cursor-pointer hover:bg-destructive/10 group"
                                                            onClick={() => handleDeleteVocabulary(word.id)}
                                                          >
                                                            {word.word}
                                                            {word.translation && (
                                                              <span className="text-muted-foreground ml-1">
                                                                ({word.translation})
                                                              </span>
                                                            )}
                                                            <X className="w-2 h-2 ml-1 opacity-0 group-hover:opacity-100" />
                                                          </Badge>
                                                        ))}
                                                        <Button
                                                          variant="ghost"
                                                          size="sm"
                                                          className="h-5 px-1 text-xs"
                                                          onClick={() => {
                                                            setSelectedStructureId(structure.id);
                                                            setSelectedVocabType(wordType);
                                                            setNewVocab({ word: '', translation: '' });
                                                            setVocabularyModalOpen(true);
                                                          }}
                                                        >
                                                          <Plus className="w-3 h-3" />
                                                        </Button>
                                                      </div>
                                                    </div>
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
        <TabsContent value="practice" className="flex-1 overflow-auto p-4 m-0">
          <div className="max-w-2xl mx-auto">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Selecione a Seção</CardTitle>
              </CardHeader>
              <CardContent>
                <Select 
                  value={selectedPracticeSection || 'all'} 
                  onValueChange={(v) => setSelectedPracticeSection(v === 'all' ? null : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma seção" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Seções</SelectItem>
                    {sections.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4">
              <Card
                className="cursor-pointer transition-all hover:shadow-lg hover:border-primary"
                onClick={() => handleStartPractice(selectedPracticeSection)}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Preencher</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Digite a palavra correta dentro do padrão
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
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
                placeholder="Ex: Basics - Section I"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newSectionName.trim()) {
                    handleAddSection();
                  }
                }}
              />
            </div>
            <Button onClick={handleAddSection} className="w-full" disabled={!newSectionName.trim()}>
              Criar Seção
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Structure Modal */}
      <Dialog open={structureModalOpen} onOpenChange={(open) => {
        if (!open) {
          handleSkipStep2();
        }
        setStructureModalOpen(open);
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {structureStep === 1 ? 'Nova Estrutura' : 'Adicionar Vocabulário'}
            </DialogTitle>
          </DialogHeader>

          {structureStep === 1 ? (
            <div className="space-y-4 mt-4">
              <div>
                <Label>Nome da Estrutura</Label>
                <Input
                  value={structureName}
                  onChange={(e) => setStructureName(e.target.value)}
                  placeholder="Ex: I Wanna + Verb"
                />
              </div>

              {/* Pattern builder */}
              <div>
                <Label>Padrão (Pattern)</Label>
                <div className="border rounded-lg p-3 min-h-[60px] bg-muted/30 mb-2 flex items-center flex-wrap gap-1">
                  {patternParts.map((part, idx) => (
                    part.type === 'placeholder' ? (
                      <Badge key={idx} className={cn('text-white', getWordTypeInfo(part.wordType || '').color)}>
                        [{part.wordType}]
                      </Badge>
                    ) : (
                      <span key={idx}>{part.value}</span>
                    )
                  ))}
                  <Input
                    value={currentText}
                    onChange={(e) => setCurrentText(e.target.value)}
                    placeholder="Digite texto..."
                    className="border-none shadow-none focus-visible:ring-0 flex-1 min-w-[100px] h-8 p-0"
                  />
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {WORD_TYPES.slice(0, 6).map(type => (
                    <Button
                      key={type.value}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => addPlaceholderToPattern(type.value)}
                    >
                      + {type.label}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={removeLastPart} disabled={patternParts.length === 0}>
                    Desfazer
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearPattern}>
                    Limpar
                  </Button>
                </div>
              </div>

              <div>
                <Label>Tradução do Padrão</Label>
                <Input
                  value={patternTranslation}
                  onChange={(e) => setPatternTranslation(e.target.value)}
                  placeholder="Ex: Eu quero + Verbo"
                />
              </div>

              <Button 
                onClick={handleGoToStep2} 
                className="w-full" 
                disabled={!structureName.trim()}
              >
                Próximo: Adicionar Vocabulário
              </Button>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              {/* Pattern preview */}
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-sm text-muted-foreground mb-1">Padrão criado:</p>
                <div className="flex items-center flex-wrap gap-1">
                  {patternParts.map((part, idx) => (
                    part.type === 'placeholder' ? (
                      <Badge key={idx} className={cn('text-white', getWordTypeInfo(part.wordType || '').color)}>
                        [{part.wordType}]
                      </Badge>
                    ) : (
                      <span key={idx}>{part.value}</span>
                    )
                  ))}
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Adicione palavras para cada classe gramatical definida no padrão:
              </p>

              {/* Vocabulary cards for each word type */}
              <div className="space-y-4 max-h-[300px] overflow-auto">
                {getPatternWordTypes().map((wordType) => {
                  const typeInfo = getWordTypeInfo(wordType);
                  const vocabList = stepTwoVocab[wordType] || [];
                  
                  return (
                    <Card key={wordType} className="border-l-4" style={{ borderLeftColor: undefined }}>
                      <CardHeader className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Badge className={cn('text-white', typeInfo.color)}>
                            {typeInfo.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {vocabList.length} palavras
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="py-2 px-4 space-y-3">
                        {/* Input for adding words */}
                        <div className="flex gap-2">
                          <Input
                            placeholder={`Ex: ${wordType === 'verb' ? 'play, run, eat' : 'palavra'}`}
                            className="flex-1"
                            id={`vocab-input-${wordType}`}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const input = e.target as HTMLInputElement;
                                const translationInput = document.getElementById(`translation-input-${wordType}`) as HTMLInputElement;
                                handleAddVocabInStep2(wordType, input.value, translationInput?.value || '');
                                input.value = '';
                                if (translationInput) translationInput.value = '';
                              }
                            }}
                          />
                          <Input
                            placeholder="Tradução"
                            className="w-24"
                            id={`translation-input-${wordType}`}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const translationInput = e.target as HTMLInputElement;
                                const wordInput = document.getElementById(`vocab-input-${wordType}`) as HTMLInputElement;
                                handleAddVocabInStep2(wordType, wordInput?.value || '', translationInput.value);
                                if (wordInput) wordInput.value = '';
                                translationInput.value = '';
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const wordInput = document.getElementById(`vocab-input-${wordType}`) as HTMLInputElement;
                              const translationInput = document.getElementById(`translation-input-${wordType}`) as HTMLInputElement;
                              handleAddVocabInStep2(wordType, wordInput?.value || '', translationInput?.value || '');
                              if (wordInput) wordInput.value = '';
                              if (translationInput) translationInput.value = '';
                            }}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        {/* List of added words */}
                        {vocabList.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {vocabList.map((vocab, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs group cursor-pointer hover:bg-destructive/10"
                                onClick={() => handleRemoveVocabInStep2(wordType, idx)}
                              >
                                {vocab.word}
                                {vocab.translation && (
                                  <span className="text-muted-foreground ml-1">({vocab.translation})</span>
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

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSkipStep2} className="flex-1">
                  Pular
                </Button>
                <Button onClick={handleSaveStep2Vocabulary} className="flex-1">
                  Salvar Vocabulário
                </Button>
              </div>
            </div>
          )}
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
