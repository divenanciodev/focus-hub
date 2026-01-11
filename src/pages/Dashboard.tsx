import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { HabitsDashboardWidget } from '@/components/habits/HabitsDashboardWidget';
import { TrainingMetricsDashboard } from '@/components/training/TrainingMetricsDashboard';
import { useDisciplines } from '@/contexts/DisciplinesContext';
import { useObjectives } from '@/hooks/useObjectives';
import { useFinancial } from '@/hooks/useFinancial';
import {
  Clock,
  TrendingUp,
  Wallet,
  ListTodo,
  Target,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TrainingMetrics } from '@/types/training';

export default function Dashboard() {
  const navigate = useNavigate();
  const { disciplines, loading: loadingDisciplines } = useDisciplines();
  const { objectives, loading: loadingObjectives } = useObjectives();
  const { piggyBanks, allocatedSaved, loading: loadingFinancial } = useFinancial();

  const loading = loadingDisciplines || loadingObjectives || loadingFinancial;

  // Calculate stats from real data
  const totalHoursStudied = disciplines.reduce((acc, d) => acc + d.hoursStudied, 0);
  const averageProgress = disciplines.length > 0 
    ? Math.round(disciplines.reduce((acc, d) => acc + d.progress, 0) / disciplines.length) 
    : 0;
  // Include both piggy bank amounts and allocated savings
  const totalSaved = piggyBanks.reduce((acc, p) => acc + p.currentAmount, 0) + allocatedSaved;
  const totalTarget = piggyBanks.reduce((acc, p) => acc + p.targetAmount, 0);
  const financialProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
  const pendingObjectives = objectives.filter(o => o.status !== 'completed');
  const recentDisciplines = disciplines.slice(0, 3);

  // Training metrics (will be updated when we integrate training hooks)
  const trainingMetrics: TrainingMetrics = {
    totalTrainings: 0,
    totalStudyTimeMinutes: Math.round(totalHoursStudied * 60),
    byType: {
      'flashcards': 0,
      'simulado': 0,
      'activity': 0,
      'mindmap': 0,
      'summary': 0,
      'handwriting': 0,
      'audio-explanation': 0,
    },
    completedToday: 0,
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
        title="Dashboard"
        description="Visão geral do seu progresso"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Horas estudadas"
          value={`${totalHoursStudied.toFixed(1)}h`}
          icon={Clock}
          onClick={() => navigate('/estudos')}
        />
        <StatCard
          title="Progresso geral"
          value={`${averageProgress}%`}
          icon={TrendingUp}
          onClick={() => navigate('/estudos')}
        >
          <ProgressBar value={averageProgress} className="mt-3" />
        </StatCard>
        <StatCard
          title="Progresso financeiro"
          value={`${financialProgress}%`}
          icon={Wallet}
          onClick={() => navigate('/financeiro')}
        >
          <ProgressBar value={financialProgress} className="mt-3" />
        </StatCard>
        <StatCard
          title="Tarefas pendentes"
          value={pendingObjectives.length}
          icon={ListTodo}
          onClick={() => navigate('/objetivos')}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Disciplines */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-foreground" />
              <h2 className="font-semibold text-foreground">Disciplinas Recentes</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/estudos')}>
              Ver todas
            </Button>
          </div>
          {recentDisciplines.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              Nenhuma disciplina cadastrada ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {recentDisciplines.map((discipline) => (
                <div
                  key={discipline.id}
                  onClick={() => navigate('/estudos')}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm">{discipline.name}</p>
                    <p className="text-xs text-muted-foreground">{discipline.hoursStudied}h estudadas</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <ProgressBar value={discipline.progress} className="w-20" size="sm" />
                    <span className="text-sm font-medium text-foreground w-10 text-right">
                      {discipline.progress}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Objectives */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-foreground" />
              <h2 className="font-semibold text-foreground">Objetivos</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/objetivos')}>
              Ver todos
            </Button>
          </div>
          {pendingObjectives.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              Nenhum objetivo pendente.
            </p>
          ) : (
            <div className="space-y-3">
              {pendingObjectives.slice(0, 3).map((objective) => {
                const completedSteps = objective.steps.filter(s => s.completed).length;
                const totalSteps = objective.steps.length;
                const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

                return (
                  <div
                    key={objective.id}
                    onClick={() => navigate('/objetivos')}
                    className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      {objective.status === 'in_progress' ? (
                        <AlertCircle className="w-4 h-4 text-warning mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-muted-foreground mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">{objective.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {completedSteps}/{totalSteps} etapas
                        </p>
                        <ProgressBar value={progress} className="mt-2" size="sm" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Training Metrics Section */}
      <div className="mt-8">
        <TrainingMetricsDashboard metrics={trainingMetrics} />
      </div>

      {/* Habits Section */}
      <div className="mt-6">
        <HabitsDashboardWidget />
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-3">
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2"
          onClick={() => navigate('/estudos')}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-sm">Estudar agora</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2"
          onClick={() => navigate('/cronograma')}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-sm">Cronograma</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2"
          onClick={() => navigate('/treinos')}
        >
          <Target className="w-5 h-5" />
          <span className="text-sm">Fazer treino</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2"
          onClick={() => navigate('/financeiro')}
        >
          <Wallet className="w-5 h-5" />
          <span className="text-sm">Ver finanças</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2"
          onClick={() => navigate('/objetivos')}
        >
          <ListTodo className="w-5 h-5" />
          <span className="text-sm">Adicionar tarefa</span>
        </Button>
      </div>
    </div>
  );
}
