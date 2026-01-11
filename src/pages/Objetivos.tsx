import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { ProgressBar } from '@/components/ui/progress-bar';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { useObjectives, Objective } from '@/hooks/useObjectives';
import {
  Plus,
  Target,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Trash2,
  DollarSign,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export default function Objetivos() {
  const { objectives, loading, addObjective, updateObjective, deleteObjective } = useObjectives();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [expandedObjective, setExpandedObjective] = useState<string | null>(null);

  const [newObjective, setNewObjective] = useState({
    title: '',
    description: '',
    steps: [''],
    requiresMoney: false,
    estimatedCost: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  const handleCreateObjective = async () => {
    if (newObjective.title) {
      await addObjective({
        title: newObjective.title,
        description: newObjective.description,
        priority: newObjective.priority,
        status: 'pending',
        requiresMoney: newObjective.requiresMoney,
        estimatedCost: newObjective.requiresMoney ? parseFloat(newObjective.estimatedCost) || 0 : undefined,
        steps: newObjective.steps
          .filter((s) => s.trim())
          .map((s, i) => ({
            id: `${Date.now()}-${i}`,
            title: s,
            completed: false,
          })),
      });
      setNewObjective({
        title: '',
        description: '',
        steps: [''],
        requiresMoney: false,
        estimatedCost: '',
        priority: 'medium',
      });
      setIsCreateModalOpen(false);
    }
  };

  const toggleStep = async (objective: Objective, stepId: string) => {
    const updatedSteps = objective.steps.map((s) =>
      s.id === stepId ? { ...s, completed: !s.completed } : s
    );
    const allCompleted = updatedSteps.length > 0 && updatedSteps.every((s) => s.completed);
    const someCompleted = updatedSteps.some((s) => s.completed);
    
    await updateObjective(objective.id, {
      steps: updatedSteps,
      status: allCompleted ? 'completed' : someCompleted ? 'in_progress' : 'pending',
    });
  };

  const handleDeleteObjective = async (objectiveId: string) => {
    await deleteObjective(objectiveId);
  };

  const addStepField = () => {
    setNewObjective({ ...newObjective, steps: [...newObjective.steps, ''] });
  };

  const removeStepField = (index: number) => {
    if (newObjective.steps.length > 1) {
      const newSteps = newObjective.steps.filter((_, i) => i !== index);
      setNewObjective({ ...newObjective, steps: newSteps });
    }
  };

  const updateStepField = (index: number, value: string) => {
    const newSteps = [...newObjective.steps];
    newSteps[index] = value;
    setNewObjective({ ...newObjective, steps: newSteps });
  };

  const getStatusColor = (status: Objective['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10 text-success';
      case 'in_progress':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: Objective['status']) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'in_progress':
        return 'Em andamento';
      default:
        return 'Pendente';
    }
  };

  const getPriorityColor = (priority: Objective['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-destructive';
      case 'medium':
        return 'border-l-warning';
      default:
        return 'border-l-muted-foreground';
    }
  };

  const getPriorityLabel = (priority: Objective['priority']) => {
    switch (priority) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Média';
      default:
        return 'Baixa';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="fade-in">
      <PageHeader
        title="Objetivos & Pendências"
        description="Organize suas tarefas e acompanhe o progresso"
        actions={
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova pendência
          </Button>
        }
      />

      {objectives.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Nenhuma pendência"
          description="Adicione tarefas e objetivos para acompanhar."
          actionLabel="Adicionar pendência"
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {objectives.map((objective) => {
            const completedSteps = objective.steps.filter((s) => s.completed).length;
            const progress = objective.steps.length > 0 ? (completedSteps / objective.steps.length) * 100 : 0;
            const isExpanded = expandedObjective === objective.id;

            return (
              <div
                key={objective.id}
                className={cn(
                  'bg-card border border-border rounded-xl overflow-hidden border-l-4 flex flex-col',
                  getPriorityColor(objective.priority)
                )}
              >
                {/* Header */}
                <div className="p-4 flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary">
                        <Target className="w-5 h-5 text-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{objective.title}</h3>
                        <span className="text-xs text-muted-foreground">
                          Prioridade: {getPriorityLabel(objective.priority)}
                        </span>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'text-xs px-2 py-1 rounded font-medium whitespace-nowrap',
                        getStatusColor(objective.status)
                      )}
                    >
                      {getStatusLabel(objective.status)}
                    </span>
                  </div>

                  {objective.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {objective.description}
                    </p>
                  )}

                  {/* Requirements */}
                  {objective.requiresMoney && objective.estimatedCost && (
                    <div className="flex items-center gap-2 mb-3 p-2 bg-secondary/50 rounded-lg">
                      <DollarSign className="w-4 h-4 text-success" />
                      <span className="text-sm text-foreground">
                        Custo estimado: <strong>{formatCurrency(objective.estimatedCost)}</strong>
                      </span>
                    </div>
                  )}

                  {/* Progress */}
                  {objective.steps.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium text-foreground">
                          {completedSteps}/{objective.steps.length} etapas
                        </span>
                      </div>
                      <ProgressBar value={progress} size="sm" />
                    </div>
                  )}

                  {objective.steps.length === 0 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertCircle className="w-4 h-4" />
                      <span>Sem etapas definidas</span>
                    </div>
                  )}
                </div>

                {/* Expandable Steps */}
                {objective.steps.length > 0 && (
                  <>
                    <button
                      onClick={() => setExpandedObjective(isExpanded ? null : objective.id)}
                      className="w-full px-4 py-2 text-sm text-muted-foreground hover:bg-secondary/50 transition-colors flex items-center justify-center gap-1 border-t border-border"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Ocultar etapas
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          Ver etapas
                        </>
                      )}
                    </button>

                    {isExpanded && (
                      <div className="border-t border-border p-4 bg-secondary/30 scale-in">
                        <div className="space-y-2">
                          {objective.steps.map((step) => (
                            <div
                              key={step.id}
                              onClick={() => toggleStep(objective, step.id)}
                              className={cn(
                                'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                                step.completed
                                  ? 'bg-success/5'
                                  : 'bg-card hover:bg-secondary'
                              )}
                            >
                              {step.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                              ) : (
                                <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                              )}
                              <span
                                className={cn(
                                  'text-sm',
                                  step.completed && 'line-through text-muted-foreground'
                                )}
                              >
                                {step.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Actions */}
                <div className="border-t border-border p-3 flex justify-end">
                  <button
                    onClick={() => handleDeleteObjective(objective.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-2 rounded-lg hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Objective Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Pendência</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>O que você precisa fazer?</Label>
              <Input
                value={newObjective.title}
                onChange={(e) => setNewObjective({ ...newObjective, title: e.target.value })}
                placeholder="Ex: Cortar o cabelo, Comprar remédio..."
              />
            </div>

            <div className="space-y-2">
              <Label>Detalhes (opcional)</Label>
              <Textarea
                value={newObjective.description}
                onChange={(e) => setNewObjective({ ...newObjective, description: e.target.value })}
                placeholder="Onde, quando, observações..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select
                value={newObjective.priority}
                onValueChange={(value: 'low' | 'medium' | 'high') =>
                  setNewObjective({ ...newObjective, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-success" />
                <Label className="cursor-pointer">Precisa de dinheiro?</Label>
              </div>
              <Switch
                checked={newObjective.requiresMoney}
                onCheckedChange={(checked) =>
                  setNewObjective({ ...newObjective, requiresMoney: checked })
                }
              />
            </div>

            {newObjective.requiresMoney && (
              <div className="space-y-2">
                <Label>Quanto vai custar? (R$)</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={newObjective.estimatedCost}
                  onChange={(e) => {
                    // Allow only numbers, dots and commas
                    const value = e.target.value.replace(/[^0-9.,]/g, '');
                    setNewObjective({ ...newObjective, estimatedCost: value });
                  }}
                  placeholder="0,00"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Etapas para concluir (opcional)</Label>
              <div className="space-y-2">
                {newObjective.steps.map((step, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={step}
                      onChange={(e) => updateStepField(index, e.target.value)}
                      placeholder={`Etapa ${index + 1}`}
                    />
                    {newObjective.steps.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeStepField(index)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addStepField}>
                <Plus className="w-4 h-4 mr-1" />
                Adicionar etapa
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateObjective} disabled={!newObjective.title}>
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
