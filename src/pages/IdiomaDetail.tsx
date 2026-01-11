import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Plus,
  ChevronDown,
  ChevronRight,
  Trash2,
  Edit2,
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Language, LanguageLevel, LanguageSection, LanguageStructure, StructureProgress } from '@/types/languages';

export default function IdiomaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [language, setLanguage] = useState<Language | null>(null);
  const [levels, setLevels] = useState<LanguageLevel[]>([]);
  const [sections, setSections] = useState<Record<string, LanguageSection[]>>({});
  const [structures, setStructures] = useState<Record<string, LanguageStructure[]>>({});
  const [loading, setLoading] = useState(true);

  const [openLevels, setOpenLevels] = useState<Set<string>>(new Set());
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  // Modal states
  const [levelModalOpen, setLevelModalOpen] = useState(false);
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [structureModalOpen, setStructureModalOpen] = useState(false);
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);

    // Load language
    const { data: langData } = await supabase.from('languages').select('*').eq('id', id).single();
    if (langData) {
      setLanguage({
        id: langData.id,
        name: langData.name,
        icon: langData.icon || '🌐',
        category: langData.category || undefined,
        objective: langData.objective || undefined,
        color: langData.color || '#000000',
        isActive: langData.is_active ?? true,
        sortOrder: langData.sort_order ?? 0,
        createdAt: new Date(langData.created_at!),
        updatedAt: new Date(langData.updated_at!),
      });
    }

    // Load levels
    const { data: levelsData } = await supabase
      .from('language_levels')
      .select('*')
      .eq('language_id', id)
      .order('sort_order', { ascending: true });

    const mappedLevels = (levelsData || []).map((l) => ({
      id: l.id,
      languageId: l.language_id,
      name: l.name,
      sortOrder: l.sort_order ?? 0,
      createdAt: new Date(l.created_at!),
      updatedAt: new Date(l.updated_at!),
    }));
    setLevels(mappedLevels);

    // Load sections for each level
    const sectionsMap: Record<string, LanguageSection[]> = {};
    const structuresMap: Record<string, LanguageStructure[]> = {};

    for (const level of mappedLevels) {
      const { data: sectionsData } = await supabase
        .from('language_sections')
        .select('*')
        .eq('level_id', level.id)
        .order('sort_order', { ascending: true });

      sectionsMap[level.id] = (sectionsData || []).map((s) => ({
        id: s.id,
        levelId: s.level_id,
        name: s.name,
        description: s.description || undefined,
        sortOrder: s.sort_order ?? 0,
        createdAt: new Date(s.created_at!),
        updatedAt: new Date(s.updated_at!),
      }));

      // Load structures for each section
      for (const section of sectionsMap[level.id]) {
        const { data: structuresData } = await supabase
          .from('language_structures')
          .select('*')
          .eq('section_id', section.id)
          .order('sort_order', { ascending: true });

        structuresMap[section.id] = (structuresData || []).map((st) => ({
          id: st.id,
          sectionId: st.section_id,
          name: st.name,
          audioUrl: st.audio_url || undefined,
          progress: (st.progress as StructureProgress) || 'not_started',
          sortOrder: st.sort_order ?? 0,
          createdAt: new Date(st.created_at!),
          updatedAt: new Date(st.updated_at!),
        }));
      }
    }

    setSections(sectionsMap);
    setStructures(structuresMap);
    setLoading(false);
  };

  const toggleLevel = (levelId: string) => {
    const newOpen = new Set(openLevels);
    if (newOpen.has(levelId)) {
      newOpen.delete(levelId);
    } else {
      newOpen.add(levelId);
    }
    setOpenLevels(newOpen);
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

  const handleAddLevel = async () => {
    if (!id || !newName.trim()) return;

    const maxOrder = levels.length > 0 ? Math.max(...levels.map((l) => l.sortOrder)) + 1 : 0;

    const { error } = await supabase.from('language_levels').insert({
      language_id: id,
      name: newName.trim(),
      sort_order: maxOrder,
    });

    if (error) {
      toast.error('Erro ao criar nível');
    } else {
      toast.success('Nível criado!');
      setNewName('');
      setLevelModalOpen(false);
      loadData();
    }
  };

  const handleAddSection = async () => {
    if (!selectedLevelId || !newName.trim()) return;

    const levelSections = sections[selectedLevelId] || [];
    const maxOrder = levelSections.length > 0 ? Math.max(...levelSections.map((s) => s.sortOrder)) + 1 : 0;

    const { error } = await supabase.from('language_sections').insert({
      level_id: selectedLevelId,
      name: newName.trim(),
      sort_order: maxOrder,
    });

    if (error) {
      toast.error('Erro ao criar seção');
    } else {
      toast.success('Seção criada!');
      setNewName('');
      setSectionModalOpen(false);
      loadData();
    }
  };

  const handleAddStructure = async () => {
    if (!selectedSectionId || !newName.trim()) return;

    const sectionStructures = structures[selectedSectionId] || [];
    const maxOrder = sectionStructures.length > 0 ? Math.max(...sectionStructures.map((s) => s.sortOrder)) + 1 : 0;

    const { error } = await supabase.from('language_structures').insert({
      section_id: selectedSectionId,
      name: newName.trim(),
      sort_order: maxOrder,
    });

    if (error) {
      toast.error('Erro ao criar estrutura');
    } else {
      toast.success('Estrutura criada!');
      setNewName('');
      setStructureModalOpen(false);
      loadData();
    }
  };

  const handleDeleteLevel = async (levelId: string) => {
    if (!confirm('Excluir este nível e todo seu conteúdo?')) return;
    await supabase.from('language_levels').delete().eq('id', levelId);
    toast.success('Nível excluído!');
    loadData();
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('Excluir esta seção e todas as estruturas?')) return;
    await supabase.from('language_sections').delete().eq('id', sectionId);
    toast.success('Seção excluída!');
    loadData();
  };

  const handleDeleteStructure = async (structureId: string) => {
    if (!confirm('Excluir esta estrutura?')) return;
    await supabase.from('language_structures').delete().eq('id', structureId);
    toast.success('Estrutura excluída!');
    loadData();
  };

  const openStructureLesson = (structureId: string) => {
    navigate(`/idiomas/${id}/estrutura/${structureId}`);
  };

  const getProgressIcon = (progress: StructureProgress) => {
    switch (progress) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Circle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getProgressLabel = (progress: StructureProgress) => {
    switch (progress) {
      case 'completed':
        return 'Concluído';
      case 'in_progress':
        return 'Em estudo';
      default:
        return 'Não iniciado';
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </div>
      </MainLayout>
    );
  }

  if (!language) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Idioma não encontrado</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/idiomas')}>
            Voltar
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/idiomas')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{language.icon}</span>
          <div>
            <h1 className="text-2xl font-bold">{language.name}</h1>
            {language.category && (
              <p className="text-muted-foreground">{language.category}</p>
            )}
          </div>
        </div>
      </div>

      {language.objective && (
        <Card className="mb-6">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">
              <strong>Objetivo:</strong> {language.objective}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add Level Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Níveis</h2>
        <Button
          size="sm"
          onClick={() => {
            setNewName('');
            setLevelModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Nível
        </Button>
      </div>

      {/* Levels */}
      {levels.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum nível cadastrado</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setNewName('');
                setLevelModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Nível
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {levels.map((level) => (
            <Card key={level.id}>
              <Collapsible open={openLevels.has(level.id)} onOpenChange={() => toggleLevel(level.id)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {openLevels.has(level.id) ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                        <CardTitle className="text-lg">{level.name}</CardTitle>
                        <Badge variant="secondary" className="ml-2">
                          {(sections[level.id] || []).length} seções
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLevelId(level.id);
                            setNewName('');
                            setSectionModalOpen(true);
                          }}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLevel(level.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {(sections[level.id] || []).length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        Nenhuma seção. Clique em + para adicionar.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {(sections[level.id] || []).map((section) => (
                          <Collapsible
                            key={section.id}
                            open={openSections.has(section.id)}
                            onOpenChange={() => toggleSection(section.id)}
                          >
                            <div className="border rounded-lg">
                              <CollapsibleTrigger asChild>
                                <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/30 transition-colors">
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
                                        setNewName('');
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
                                <div className="px-3 pb-3 space-y-1">
                                  {(structures[section.id] || []).length === 0 ? (
                                    <p className="text-xs text-muted-foreground py-2 text-center">
                                      Nenhuma estrutura
                                    </p>
                                  ) : (
                                    (structures[section.id] || []).map((structure) => (
                                      <div
                                        key={structure.id}
                                        className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 cursor-pointer group"
                                        onClick={() => openStructureLesson(structure.id)}
                                      >
                                        <div className="flex items-center gap-2">
                                          {getProgressIcon(structure.progress)}
                                          <span className="text-sm font-medium">"{structure.name}"</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-muted-foreground">
                                            {getProgressLabel(structure.progress)}
                                          </span>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteStructure(structure.id);
                                            }}
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </Button>
                                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                      </div>
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
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      )}

      {/* Add Level Modal */}
      <Dialog open={levelModalOpen} onOpenChange={setLevelModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Nível</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="level-name">Nome do Nível</Label>
              <Input
                id="level-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Básico"
              />
            </div>
            <Button onClick={handleAddLevel} className="w-full" disabled={!newName.trim()}>
              Criar Nível
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Section Modal */}
      <Dialog open={sectionModalOpen} onOpenChange={setSectionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Seção</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="section-name">Nome da Seção</Label>
              <Input
                id="section-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Basics – Section I"
              />
            </div>
            <Button onClick={handleAddSection} className="w-full" disabled={!newName.trim()}>
              Criar Seção
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Structure Modal */}
      <Dialog open={structureModalOpen} onOpenChange={setStructureModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Estrutura</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="structure-name">Nome da Estrutura</Label>
              <Input
                id="structure-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: I'm"
              />
            </div>
            <Button onClick={handleAddStructure} className="w-full" disabled={!newName.trim()}>
              Criar Estrutura
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
