import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { HabitsDashboardWidget } from '@/components/habits/HabitsDashboardWidget';
import { TrainingMetricsDashboard } from '@/components/training/TrainingMetricsDashboard';
import { mockDashboardStats, mockObjectives, mockDisciplines } from '@/data/mockData';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TrainingMetrics } from '@/types/training';

export default function Dashboard() {
  const navigate = useNavigate();
  const stats = mockDashboardStats;

  const pendingObjectives = mockObjectives.filter(o => o.status !== 'completed');
  const recentDisciplines = mockDisciplines.slice(0, 3);

  // Mock training metrics for dashboard
  const trainingMetrics: TrainingMetrics = {
    totalTrainings: 12,
    totalStudyTimeMinutes: 480,
    byType: {
      'flashcards': 5,
      'simulado': 4,
      'activity': 1,
      'mindmap': 1,
      'summary': 1,
      'handwriting': 0,
      'audio-explanation': 0,
    },
    completedToday: 2,
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="Dashboard"
        description="Visão geral do seu progresso"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Horas estudadas hoje"
          value={`${stats.hoursToday}h`}
          icon={Clock}
          trend="up"
          trendValue="+0.5h"
          onClick={() => navigate('/estudos')}
        />
        <StatCard
          title="Progresso geral"
          value={`${stats.generalProgress}%`}
          icon={TrendingUp}
          trend="up"
          trendValue="+3%"
          onClick={() => navigate('/estudos')}
        >
          <ProgressBar value={stats.generalProgress} className="mt-3" />
        </StatCard>
        <StatCard
          title="Progresso financeiro"
          value={`${stats.financialProgress}%`}
          icon={Wallet}
          onClick={() => navigate('/financeiro')}
        >
          <ProgressBar value={stats.financialProgress} className="mt-3" />
        </StatCard>
        <StatCard
          title="Tarefas pendentes"
          value={stats.pendingTasks}
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
          <div className="space-y-3">
            {pendingObjectives.slice(0, 3).map((objective) => {
              const completedSteps = objective.steps.filter(s => s.completed).length;
              const totalSteps = objective.steps.length;
              const progress = (completedSteps / totalSteps) * 100;

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
