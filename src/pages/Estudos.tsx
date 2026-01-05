import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/page-header';
import { ProgressBar } from '@/components/ui/progress-bar';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { CreateDisciplineModal } from '@/components/modals/CreateDisciplineModal';
import { mockDisciplines } from '@/data/mockData';
import { Discipline } from '@/types';
import { Plus, BookOpen, Clock, TrendingUp, Calendar } from 'lucide-react';

export default function Estudos() {
  const navigate = useNavigate();
  const [disciplines, setDisciplines] = useState<Discipline[]>(mockDisciplines);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateDiscipline = (data: { name: string; subject: string; grade: string }) => {
    const newDiscipline: Discipline = {
      id: Date.now().toString(),
      name: data.name,
      subject: data.subject,
      grade: data.grade,
      progress: 0,
      hoursStudied: 0,
      createdAt: new Date(),
    };
    setDisciplines([newDiscipline, ...disciplines]);
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="Estudos"
        description="Gerencie suas disciplinas e materiais de estudo"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/cronograma')}>
              <Calendar className="w-4 h-4 mr-2" />
              Cronograma
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar disciplina
            </Button>
          </div>
        }
      />

      {disciplines.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Nenhuma disciplina cadastrada"
          description="Comece criando sua primeira disciplina para organizar seus estudos."
          actionLabel="Criar disciplina"
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {disciplines.map((discipline) => (
            <div
              key={discipline.id}
              onClick={() => navigate(`/estudos/${discipline.id}`)}
              className="bg-card border border-border rounded-xl p-5 cursor-pointer hover:border-foreground/20 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">{discipline.name}</h3>
                  <p className="text-sm text-muted-foreground">{discipline.subject}</p>
                </div>
                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                  {discipline.grade}
                </span>
              </div>

              <div className="space-y-3">
                <ProgressBar value={discipline.progress} showLabel />

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{discipline.hoursStudied}h estudadas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>{discipline.progress}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateDisciplineModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreateDiscipline}
      />
    </div>
  );
}
