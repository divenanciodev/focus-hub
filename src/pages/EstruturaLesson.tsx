import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Plus,
  Play,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  Clock,
  Save,
  Lightbulb,
  List,
  Sparkles,
  PenTool,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { LanguageStructure, LanguageContent, ContentType, StructureProgress } from '@/types/languages';

const CONTENT_TYPE_LABELS: Record<ContentType, { label: string; icon: React.ReactNode; color: string }> = {
  explanation: { label: 'Explicação', icon: <Lightbulb className="w-4 h-4" />, color: 'bg-blue-100 text-blue-800' },
  example: { label: 'Exemplos', icon: <List className="w-4 h-4" />, color: 'bg-green-100 text-green-800' },
  expansion: { label: 'Expansão', icon: <Sparkles className="w-4 h-4" />, color: 'bg-purple-100 text-purple-800' },
  exercise: { label: 'Prática', icon: <PenTool className="w-4 h-4" />, color: 'bg-orange-100 text-orange-800' },
};

export default function EstruturaLesson() {
  const { id: languageId, structureId } = useParams<{ id: string; structureId: string }>();
  const navigate = useNavigate();

  const [structure, setStructure] = useState<LanguageStructure | null>(null);
  const [contents, setContents] = useState<LanguageContent[]>([]);
  const [loading, setLoading] = useState(true);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<LanguageContent | null>(null);
  const [newContentType, setNewContentType] = useState<ContentType>('explanation');
  const [newContentText, setNewContentText] = useState('');

  useEffect(() => {
    if (structureId) loadData();
  }, [structureId]);

  const loadData = async () => {
    if (!structureId) return;
    setLoading(true);

    // Load structure
    const { data: structureData } = await supabase
      .from('language_structures')
      .select('*')
      .eq('id', structureId)
      .single();

    if (structureData) {
      setStructure({
        id: structureData.id,
        sectionId: structureData.section_id,
        name: structureData.name,
        audioUrl: structureData.audio_url || undefined,
        progress: (structureData.progress as StructureProgress) || 'not_started',
        sortOrder: structureData.sort_order ?? 0,
        createdAt: new Date(structureData.created_at!),
        updatedAt: new Date(structureData.updated_at!),
      });
    }

    // Load contents
    const { data: contentsData } = await supabase
      .from('language_contents')
      .select('*')
      .eq('structure_id', structureId)
      .order('sort_order', { ascending: true });

    setContents(
      (contentsData || []).map((c) => ({
        id: c.id,
        structureId: c.structure_id,
        contentType: c.content_type as ContentType,
        content: c.content,
        sortOrder: c.sort_order ?? 0,
        createdAt: new Date(c.created_at!),
        updatedAt: new Date(c.updated_at!),
      }))
    );

    setLoading(false);
  };

  const updateProgress = async (progress: StructureProgress) => {
    if (!structureId) return;

    const { error } = await supabase
      .from('language_structures')
      .update({ progress })
      .eq('id', structureId);

    if (error) {
      toast.error('Erro ao atualizar progresso');
    } else {
      setStructure((prev) => (prev ? { ...prev, progress } : null));
      toast.success('Progresso atualizado!');
    }
  };

  const handleAddContent = async () => {
    if (!structureId || !newContentText.trim()) return;

    const maxOrder = contents.length > 0 ? Math.max(...contents.map((c) => c.sortOrder)) + 1 : 0;

    const { error } = await supabase.from('language_contents').insert({
      structure_id: structureId,
      content_type: newContentType,
      content: newContentText.trim(),
      sort_order: maxOrder,
    });

    if (error) {
      toast.error('Erro ao adicionar conteúdo');
    } else {
      toast.success('Conteúdo adicionado!');
      setNewContentText('');
      setAddModalOpen(false);
      loadData();
    }
  };

  const handleEditContent = async () => {
    if (!selectedContent || !newContentText.trim()) return;

    const { error } = await supabase
      .from('language_contents')
      .update({ content: newContentText.trim(), content_type: newContentType })
      .eq('id', selectedContent.id);

    if (error) {
      toast.error('Erro ao atualizar conteúdo');
    } else {
      toast.success('Conteúdo atualizado!');
      setEditModalOpen(false);
      setSelectedContent(null);
      setNewContentText('');
      loadData();
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    if (!confirm('Excluir este conteúdo?')) return;

    const { error } = await supabase.from('language_contents').delete().eq('id', contentId);

    if (error) {
      toast.error('Erro ao excluir');
    } else {
      toast.success('Conteúdo excluído!');
      loadData();
    }
  };

  const openEditModal = (content: LanguageContent) => {
    setSelectedContent(content);
    setNewContentType(content.contentType);
    setNewContentText(content.content);
    setEditModalOpen(true);
  };

  const getProgressButton = (progress: StructureProgress) => {
    switch (progress) {
      case 'completed':
        return (
          <Button variant="outline" size="sm" className="text-green-600" onClick={() => updateProgress('not_started')}>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Concluído
          </Button>
        );
      case 'in_progress':
        return (
          <Button variant="outline" size="sm" className="text-yellow-600" onClick={() => updateProgress('completed')}>
            <Clock className="w-4 h-4 mr-2" />
            Em Estudo → Concluir
          </Button>
        );
      default:
        return (
          <Button variant="outline" size="sm" onClick={() => updateProgress('in_progress')}>
            <Circle className="w-4 h-4 mr-2" />
            Iniciar Estudo
          </Button>
        );
    }
  };

  // Group contents by type
  const groupedContents = contents.reduce((acc, content) => {
    if (!acc[content.contentType]) acc[content.contentType] = [];
    acc[content.contentType].push(content);
    return acc;
  }, {} as Record<ContentType, LanguageContent[]>);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </div>
      </MainLayout>
    );
  }

  if (!structure) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Estrutura não encontrada</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate(`/idiomas/${languageId}`)}>
            Voltar
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/idiomas/${languageId}`)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">"{structure.name}"</h1>
            <p className="text-muted-foreground">Estrutura de linguagem</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {structure.audioUrl && (
            <Button variant="outline" size="sm">
              <Play className="w-4 h-4 mr-2" />
              Ouvir Lição
            </Button>
          )}
          {getProgressButton(structure.progress)}
        </div>
      </div>

      {/* Add Content Button */}
      <div className="flex justify-end mb-4">
        <Button
          onClick={() => {
            setNewContentType('explanation');
            setNewContentText('');
            setAddModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Conteúdo
        </Button>
      </div>

      {/* Contents */}
      {contents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Lightbulb className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Nenhum conteúdo adicionado ainda</p>
            <p className="text-sm text-muted-foreground mb-4">
              Adicione explicações, exemplos, expansões e exercícios práticos
            </p>
            <Button
              onClick={() => {
                setNewContentType('explanation');
                setNewContentText('');
                setAddModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Conteúdo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {(['explanation', 'example', 'expansion', 'exercise'] as ContentType[]).map((type) => {
            const typeContents = groupedContents[type];
            if (!typeContents || typeContents.length === 0) return null;

            const typeConfig = CONTENT_TYPE_LABELS[type];

            return (
              <Card key={type}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Badge className={typeConfig.color}>
                      {typeConfig.icon}
                      <span className="ml-1">{typeConfig.label}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {typeContents.map((content) => (
                    <div key={content.id} className="group relative">
                      <div className="prose prose-sm max-w-none whitespace-pre-wrap">{content.content}</div>
                      <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => openEditModal(content)}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => handleDeleteContent(content.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Content Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Conteúdo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Tipo de Conteúdo</Label>
              <Select value={newContentType} onValueChange={(v) => setNewContentType(v as ContentType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CONTENT_TYPE_LABELS).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        {config.icon}
                        <span>{config.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Conteúdo</Label>
              <Textarea
                value={newContentText}
                onChange={(e) => setNewContentText(e.target.value)}
                placeholder={
                  newContentType === 'explanation'
                    ? "\"I'm\" é a forma abreviada de \"I am\" e é usada para falar sobre você..."
                    : newContentType === 'example'
                    ? "- I'm tired.\n- I'm happy.\n- I'm hungry."
                    : newContentType === 'expansion'
                    ? 'Você pode usar intensificadores como very, really, extremely...'
                    : "Complete as frases:\n1. I'm ___ (happy/sad)\n2. I'm ___ Brazil."
                }
                rows={8}
              />
            </div>
            <Button onClick={handleAddContent} className="w-full" disabled={!newContentText.trim()}>
              <Save className="w-4 h-4 mr-2" />
              Salvar Conteúdo
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Content Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Conteúdo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Tipo de Conteúdo</Label>
              <Select value={newContentType} onValueChange={(v) => setNewContentType(v as ContentType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CONTENT_TYPE_LABELS).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        {config.icon}
                        <span>{config.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Conteúdo</Label>
              <Textarea
                value={newContentText}
                onChange={(e) => setNewContentText(e.target.value)}
                rows={8}
              />
            </div>
            <Button onClick={handleEditContent} className="w-full" disabled={!newContentText.trim()}>
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
