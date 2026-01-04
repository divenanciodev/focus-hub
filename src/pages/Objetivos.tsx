import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { ProgressBar } from '@/components/ui/progress-bar';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { mockObjectives } from '@/data/mockData';
import { Objective, ObjectiveStep } from '@/types';
import {
  Plus,
  Target,
  CheckCircle2,
  Circle,
  Clock,
  ChevronDown,
  ChevronUp,
  Trash2,
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
import { cn } from '@/lib/utils';

export default function Objetivos() {
  const [objectives, setObjectives] = useState<Objective[]>(mockObjectives);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [expandedObjective, setExpandedObjective] = useState<string | null>(null);

  const [newObjective, setNewObjective] = useState({
    title: '',
    description: '',
    steps: [''],
  });

  const handleCreateObjective = () => {
    if (newObjective.title && newObjective.steps.some((s) => s.trim())) {
      const objective: Objective = {
        id: Date.now().toString(),
        title: newObjective.title,
        description: newObjective.description,
        status: 'pending',
        steps: newObjective.steps
          .filter((s) => s.trim())
          .map((s, i) => ({
            id: `${Date.now()}-${i}`,
            title: s,
            completed: false,
          })),
        createdAt: new Date(),
      };
      setObjectives([objective, ...objectives]);
      setNewObjective({ title: '', description: '', steps: [''] });
      setIsCreateModalOpen(false);
    }
  };

  const toggleStep = (objectiveId: string, stepId: string) => {
    setObjectives(
      objectives.map((o) => {
        if (o.id === objectiveId) {
          const updatedSteps = o.steps.map((s) =>
            s.id === stepId ? { ...s, completed: !s.completed } : s
          );
          const allCompleted = updatedSteps.every((s) => s.completed);
          const someCompleted = updatedSteps.some((s) => s.completed);
          return {
            ...o,
            steps: updatedSteps,
            status: allCompleted ? 'completed' : someCompleted ? 'in_progress' : 'pending',
          };
        }
        return o;
      })
    );
  };

  const deleteObjective = (objectiveId: string) => {
    setObjectives(objectives.filter((o) => o.id !== objectiveId));
  };

  const addStepField = () => {
    setNewObjective({ ...newObjective, steps: [...newObjective.steps, ''] });
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

  return (
    <div className="fade-in">
      <PageHeader
        title="Objetivos & Pendências"
        description="Acompanhe seus objetivos e metas"
        actions={
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo objetivo
          </Button>
        }
      />

      {objectives.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Nenhum objetivo criado"
          description="Defina seus objetivos e acompanhe seu progresso."
          actionLabel="Criar objetivo"
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {objectives.map((objective) => {
            const completedSteps = objective.steps.filter((s) => s.completed).length;
            const progress = (completedSteps / objective.steps.length) * 100;
            const isExpanded = expandedObjective === objective.id;

            return (
              <div
                key={objective.id}
                className="bg-card border border-border rounded-xl overflow-hidden"
              >
                <div
                  className="p-5 cursor-pointer hover:bg-card-hover transition-colors"
                  onClick={() => setExpandedObjective(isExpanded ? null : objective.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">{objective.title}</h3>
                        <span
                          className={cn(
                            'text-xs px-2 py-1 rounded font-medium',
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
                      <div className="flex items-center gap-4">
                        <ProgressBar value={progress} className="flex-1 max-w-xs" size="sm" />
                        <span className="text-sm text-muted-foreground">
                          {completedSteps}/{objective.steps.length} etapas
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteObjective(objective.id);
                        }}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-border p-5 bg-secondary/30 scale-in">
                    <h4 className="font-medium text-foreground mb-3">Etapas</h4>
                    <div className="space-y-2">
                      {objective.steps.map((step) => (
                        <div
                          key={step.id}
                          onClick={() => toggleStep(objective.id, step.id)}
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
              </div>
            );
          })}
        </div>
      )}

      {/* Create Objective Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Objetivo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={newObjective.title}
                onChange={(e) => setNewObjective({ ...newObjective, title: e.target.value })}
                placeholder="Ex: Passar no concurso"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Textarea
                value={newObjective.description}
                onChange={(e) => setNewObjective({ ...newObjective, description: e.target.value })}
                placeholder="Descreva seu objetivo..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Etapas</Label>
              <div className="space-y-2">
                {newObjective.steps.map((step, index) => (
                  <Input
                    key={index}
                    value={step}
                    onChange={(e) => updateStepField(index, e.target.value)}
                    placeholder={`Etapa ${index + 1}`}
                  />
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
            <Button onClick={handleCreateObjective}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
