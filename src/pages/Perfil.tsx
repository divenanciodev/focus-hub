import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { mockUserProfile, mockTrainings, mockDisciplines } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import {
  User,
  Mail,
  CreditCard,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  Settings,
  LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Perfil() {
  const navigate = useNavigate();
  const profile = mockUserProfile;

  const completedTrainings = mockTrainings.filter((t) => t.status === 'completed').length;
  const averageScore = mockTrainings
    .filter((t) => t.status === 'completed' && t.score)
    .reduce((acc, t, _, arr) => acc + (t.score || 0) / arr.length, 0);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="Meu Perfil"
        description="Visualize seu progresso e configurações"
      />

      {/* Profile Card */}
      <div className="bg-card border border-border rounded-xl p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary text-primary-foreground text-2xl font-bold">
            {profile.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground mb-1">{profile.name}</h2>
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              <Mail className="w-4 h-4" />
              <span className="text-sm">{profile.email}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                <CreditCard className="w-3 h-3" />
                Plano {profile.currentPlan.name}
              </span>
              <span className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground text-xs font-medium px-3 py-1 rounded-full">
                <Calendar className="w-3 h-3" />
                Membro desde {formatDate(profile.joinedAt)}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </Button>
            <Button variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Progresso geral"
          value={`${profile.totalProgress}%`}
          icon={TrendingUp}
        >
          <ProgressBar value={profile.totalProgress} className="mt-3" />
        </StatCard>
        <StatCard
          title="Horas totais de estudo"
          value={`${profile.studyHoursTotal}h`}
          icon={Clock}
        />
        <StatCard
          title="Treinos concluídos"
          value={completedTrainings}
          icon={Target}
        />
        <StatCard
          title="Média de acertos"
          value={`${Math.round(averageScore)}%`}
          icon={TrendingUp}
        />
      </div>

      {/* History Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Trainings */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Últimos treinos</h3>
          <div className="space-y-3">
            {mockTrainings.slice(0, 5).map((training) => (
              <div
                key={training.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
              >
                <div>
                  <p className="font-medium text-foreground text-sm">{training.name}</p>
                  <p className="text-xs text-muted-foreground">{training.discipline}</p>
                </div>
                {training.status === 'completed' && training.score && (
                  <span className="text-sm font-medium text-success">{training.score}%</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Disciplines Progress */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Progresso por disciplina</h3>
          <div className="space-y-4">
            {mockDisciplines.slice(0, 5).map((discipline) => (
              <div key={discipline.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-foreground font-medium">{discipline.name}</span>
                  <span className="text-muted-foreground">{discipline.progress}%</span>
                </div>
                <ProgressBar value={discipline.progress} size="sm" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upgrade CTA */}
      {profile.currentPlan.price === 0 && (
        <div className="mt-8 bg-primary text-primary-foreground rounded-xl p-6 text-center">
          <h3 className="text-xl font-bold mb-2">Desbloqueie todo o potencial</h3>
          <p className="text-primary-foreground/80 mb-4">
            Atualize para o plano Premium e tenha acesso ilimitado a todos os recursos.
          </p>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('/planos')}
          >
            Ver planos
          </Button>
        </div>
      )}
    </div>
  );
}
