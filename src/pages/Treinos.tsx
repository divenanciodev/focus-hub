import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { CreateTrainingModal } from '@/components/modals/CreateTrainingModal';
import { mockTrainings } from '@/data/mockData';
import { Training } from '@/types';
import { Plus, Target, Clock, CheckCircle2, Play, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Treinos() {
  const navigate = useNavigate();
  const [trainings, setTrainings] = useState<Training[]>(mockTrainings);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateTraining = (data: {
    name: string;
    discipline: string;
    subject: string;
    questionCount: number;
    timeMinutes: number;
  }) => {
    const newTraining: Training = {
      id: Date.now().toString(),
      ...data,
      status: 'pending',
      createdAt: new Date(),
    };
    setTrainings([newTraining, ...trainings]);
  };

  const getStatusBadge = (status: Training['status'], score?: number) => {
    switch (status) {
      case 'completed':
        return (
          <span className="text-xs bg-success/10 text-success px-2 py-1 rounded font-medium">
            {score}% acertos
          </span>
        );
      case 'in_progress':
        return (
          <span className="text-xs bg-warning/10 text-warning px-2 py-1 rounded font-medium">
            Em andamento
          </span>
        );
      default:
        return (
          <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded font-medium">
            Pendente
          </span>
        );
    }
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="Treinos & Simulados"
        description="Pratique com questões e simulados"
        actions={
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Criar treino
          </Button>
        }
      />

      {trainings.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Nenhum treino criado"
          description="Crie seu primeiro treino para praticar com questões."
          actionLabel="Criar treino"
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trainings.map((training) => (
            <div
              key={training.id}
              className="bg-card border border-border rounded-xl p-5 hover:border-foreground/20 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">{training.name}</h3>
                  <p className="text-sm text-muted-foreground">{training.discipline}</p>
                </div>
                {getStatusBadge(training.status, training.score)}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Target className="w-4 h-4" />
                  <span>{training.questionCount} questões</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{training.timeMinutes} minutos</span>
                </div>
              </div>

              <div className="flex gap-2">
                {training.status === 'completed' ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/treinos/${training.id}/resultado`)}
                    >
                      <BarChart3 className="w-4 h-4 mr-1" />
                      Ver resultado
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/treinos/${training.id}`)}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Refazer
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => navigate(`/treinos/${training.id}`)}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {training.status === 'in_progress' ? 'Continuar' : 'Iniciar'}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateTrainingModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreateTraining}
      />
    </div>
  );
}
