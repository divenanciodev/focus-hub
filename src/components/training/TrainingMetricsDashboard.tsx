import { TrainingMetrics, TrainingType } from '@/types/training';
import { 
  Layers, 
  FileQuestion, 
  ListTodo, 
  GitBranch, 
  FileText, 
  PenTool, 
  Building2, 
  Mic,
  Clock,
  Target,
  TrendingUp
} from 'lucide-react';

interface TrainingMetricsDashboardProps {
  metrics: TrainingMetrics;
}

const typeLabels: Record<TrainingType, { label: string; icon: React.ElementType }> = {
  'flashcards': { label: 'Flashcards', icon: Layers },
  'simulado': { label: 'Simulados', icon: FileQuestion },
  'activity': { label: 'Atividades', icon: ListTodo },
  'mindmap': { label: 'Mapas Mentais', icon: GitBranch },
  'summary': { label: 'Resumos', icon: FileText },
  'handwriting': { label: 'Escrita Manual', icon: PenTool },
  'audio-explanation': { label: 'Áudio', icon: Mic },
  'memory-palace': { label: 'Palácio da Memória', icon: Building2 },
};

export function TrainingMetricsDashboard({ metrics }: TrainingMetricsDashboardProps) {
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const sortedTypes = Object.entries(metrics.byType)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
            <Target className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <p className="text-2xl font-bold">{metrics.totalTrainings}</p>
            <p className="text-xs text-muted-foreground">Treinos totais</p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
            <Clock className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <p className="text-2xl font-bold">{formatTime(metrics.totalStudyTimeMinutes)}</p>
            <p className="text-xs text-muted-foreground">Tempo de estudo</p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <p className="text-2xl font-bold">{metrics.completedToday}</p>
            <p className="text-xs text-muted-foreground">Concluídos hoje</p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-xs text-muted-foreground mb-2">Mais usados</p>
        <div className="space-y-1">
          {sortedTypes.length > 0 ? (
            sortedTypes.map(([type, count]) => {
              const typeInfo = typeLabels[type as TrainingType];
              return (
                <div key={type} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5">
                    <typeInfo.icon className="w-3.5 h-3.5 text-muted-foreground" />
                    {typeInfo.label}
                  </span>
                  <span className="font-medium">{count}</span>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum treino ainda</p>
          )}
        </div>
      </div>
    </div>
  );
}
