import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MindMap } from '@/types/training';
import { Loader2, Sparkles, Brain, PenLine, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useDisciplines } from '@/contexts/DisciplinesContext';

interface MindMapNode {
  id: string;
  label: string;
  tipo: 'central' | 'ramo_principal' | 'subramo' | 'exemplo' | 'alerta' | 'excecao' | 'dica';
  pai: string | null;
  cor: string;
  colapsavel?: boolean;
}

interface CreateMindMapModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (mindmap: MindMap) => void;
  editingMindMap?: MindMap;
}

export function CreateMindMapModal({
  open,
  onOpenChange,
  onSubmit,
  editingMindMap,
}: CreateMindMapModalProps) {
  const { disciplines } = useDisciplines();
  const [name, setName] = useState(editingMindMap?.name || '');
  const [discipline, setDiscipline] = useState(editingMindMap?.discipline || '');
  const [tema, setTema] = useState('');
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNodes, setGeneratedNodes] = useState<MindMapNode[]>([]);
  const [inputMode, setInputMode] = useState<'tema' | 'conteudo' | 'disciplina'>('tema');

  const [selectedDisciplineId, setSelectedDisciplineId] = useState<string>('');

  // Reset form when modal opens/closes or editing changes
  useEffect(() => {
    if (open) {
      if (editingMindMap) {
        setName(editingMindMap.name);
        setDiscipline(editingMindMap.discipline || '');
      }
    } else {
      resetForm();
    }
  }, [open, editingMindMap]);

  const handleGenerate = async () => {
    if (inputMode === 'tema' && !tema.trim()) {
      toast.error('Digite um tema para gerar o mapa mental');
      return;
    }
    if (inputMode === 'conteudo' && !content.trim()) {
      toast.error('Cole um conteúdo para gerar o mapa mental');
      return;
    }
    if (inputMode === 'disciplina' && !selectedDisciplineId) {
      toast.error('Selecione uma disciplina');
      return;
    }

    setIsGenerating(true);

    try {
      let temaToUse = tema.trim();
      
      // If using discipline mode, use the discipline name as theme
      if (inputMode === 'disciplina') {
        const selectedDiscipline = disciplines.find(d => d.id === selectedDisciplineId);
        if (selectedDiscipline) {
          temaToUse = selectedDiscipline.name;
          setDiscipline(selectedDiscipline.name);
        }
      }

      const { data, error } = await supabase.functions.invoke('generate-mindmap', {
        body: {
          tema: (inputMode === 'tema' || inputMode === 'disciplina') ? temaToUse : undefined,
          content: inputMode === 'conteudo' ? content.trim() : undefined,
        },
      });

      if (error) {
        console.error('Error generating mindmap:', error);
        toast.error('Erro ao gerar mapa mental. Tente novamente.');
        return;
      }

      if (data.error) {
        toast.error(data.error);
        return;
      }

      const nodes = data.mapa_mental.nos as MindMapNode[];
      setGeneratedNodes(nodes);
      
      // Auto-fill name from theme
      if (!name && data.mapa_mental.tema) {
        setName(data.mapa_mental.tema);
      }

      toast.success(`Mapa mental gerado com ${nodes.length} nós!`);
    } catch (err) {
      console.error('Error:', err);
      toast.error('Erro ao gerar mapa mental. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error('Digite um nome para o mapa mental');
      return;
    }
    if (generatedNodes.length === 0) {
      toast.error('Gere um mapa mental primeiro');
      return;
    }

    // Convert generated nodes to MindMapNode format
    const mindmapNodes = generatedNodes.map((node, index) => ({
      id: node.id,
      text: node.label,
      x: 0, // Will be calculated by visualization
      y: 0,
      color: getColorFromType(node.cor),
      parentId: node.pai || undefined,
    }));

    const mindmap: MindMap = {
      id: editingMindMap?.id || Date.now().toString(),
      name: name.trim(),
      discipline: discipline.trim() || undefined,
      nodes: mindmapNodes,
      createdAt: editingMindMap?.createdAt || new Date(),
    };

    onSubmit(mindmap);
    resetForm();
    onOpenChange(false);
  };

  const getColorFromType = (corType: string): string => {
    const colors: Record<string, string> = {
      'cor_destaque': '#8b5cf6',
      'cor_primaria': '#3b82f6',
      'cor_secundaria': '#06b6d4',
      'cor_suave': '#10b981',
      'cor_alerta': '#f59e0b',
      'cor_info': '#6366f1',
    };
    return colors[corType] || '#6b7280';
  };

  const getNodeTypeLabel = (tipo: string): string => {
    const labels: Record<string, string> = {
      'central': 'Central',
      'ramo_principal': 'Ramo Principal',
      'subramo': 'Subramo',
      'exemplo': 'Exemplo',
      'alerta': 'Alerta',
      'excecao': 'Exceção',
      'dica': 'Dica',
    };
    return labels[tipo] || tipo;
  };

  const resetForm = () => {
    setName('');
    setDiscipline('');
    setTema('');
    setContent('');
    setGeneratedNodes([]);
    setSelectedDisciplineId('');
    setInputMode('tema');
  };

  // Group nodes by hierarchy for preview
  const centralNode = generatedNodes.find(n => n.tipo === 'central');
  const mainBranches = generatedNodes.filter(n => n.tipo === 'ramo_principal');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            {editingMindMap ? 'Editar Mapa Mental' : 'Criar Mapa Mental'}
          </DialogTitle>
          <DialogDescription>
            Gere mapas mentais estruturados a partir de temas ou conteúdos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Nome do mapa mental *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Direitos Fundamentais"
              />
            </div>
            <div className="space-y-2">
              <Label>Disciplina (opcional)</Label>
              <Input
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value)}
                placeholder="Ex: Direito Constitucional"
              />
            </div>
          </div>

          {/* Generation Options */}
          <div className="border border-border rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h4 className="font-medium">Gerar com IA</h4>
            </div>

            <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as 'tema' | 'conteudo' | 'disciplina')}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="tema" className="text-sm">
                  <Brain className="w-3 h-3 mr-1" />
                  Por Tema
                </TabsTrigger>
                <TabsTrigger value="conteudo" className="text-sm">
                  <PenLine className="w-3 h-3 mr-1" />
                  Por Conteúdo
                </TabsTrigger>
                <TabsTrigger value="disciplina" className="text-sm">
                  <BookOpen className="w-3 h-3 mr-1" />
                  Por Disciplina
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tema" className="space-y-3 mt-3">
                <div className="space-y-2">
                  <Label>Tema ou tópico</Label>
                  <Input
                    value={tema}
                    onChange={(e) => setTema(e.target.value)}
                    placeholder="Ex: Princípios do Direito Administrativo"
                  />
                </div>
              </TabsContent>

              <TabsContent value="conteudo" className="space-y-3 mt-3">
                <div className="space-y-2">
                  <Label>Conteúdo para análise</Label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Cole aqui um texto, resumo ou conteúdo de aula..."
                    rows={5}
                  />
                </div>
              </TabsContent>

              <TabsContent value="disciplina" className="space-y-3 mt-3">
                <div className="space-y-2">
                  <Label>Selecione uma disciplina</Label>
                  {disciplines.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      Nenhuma disciplina criada. Crie disciplinas no módulo de Estudos.
                    </p>
                  ) : (
                    <Select value={selectedDisciplineId} onValueChange={setSelectedDisciplineId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha uma disciplina..." />
                      </SelectTrigger>
                      <SelectContent>
                        {disciplines.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando mapa mental...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar Mapa Mental
                </>
              )}
            </Button>
          </div>

          {/* Preview */}
          {generatedNodes.length > 0 && (
            <div className="border border-border rounded-lg p-4 space-y-3">
              <h4 className="font-medium">Prévia do Mapa Mental ({generatedNodes.length} nós)</h4>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {/* Central Node */}
                {centralNode && (
                  <div 
                    className="p-3 rounded-lg text-center font-semibold"
                    style={{ backgroundColor: getColorFromType(centralNode.cor) + '30', borderLeft: `4px solid ${getColorFromType(centralNode.cor)}` }}
                  >
                    {centralNode.label}
                  </div>
                )}

                {/* Main Branches */}
                {mainBranches.map((branch) => {
                  const subnodes = generatedNodes.filter(n => n.pai === branch.id);
                  return (
                    <div key={branch.id} className="ml-4">
                      <div 
                        className="p-2 rounded-lg font-medium text-sm"
                        style={{ backgroundColor: getColorFromType(branch.cor) + '20', borderLeft: `3px solid ${getColorFromType(branch.cor)}` }}
                      >
                        {branch.label}
                      </div>
                      {subnodes.length > 0 && (
                        <div className="ml-4 mt-1 space-y-1">
                          {subnodes.map((sub) => (
                            <div
                              key={sub.id}
                              className="p-1.5 rounded text-xs bg-secondary/50 border-l-2"
                              style={{ borderColor: getColorFromType(sub.cor) }}
                            >
                              {sub.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!name || generatedNodes.length === 0}>
            {editingMindMap ? 'Salvar alterações' : 'Criar mapa mental'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
