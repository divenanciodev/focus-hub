import { useMemo } from 'react';
import { format, isToday, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, ArrowRight, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ProgressBar } from '@/components/ui/progress-bar';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';
import { useHabits } from '@/hooks/useHabits';

export function HabitsDashboardWidget() {
  const navigate = useNavigate();
  const { habits, loadingHabits, useHabitLogs, toggleHabitLog } = useHabits();

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 0 });

  const { data: habitLogs = [], isLoading: loadingLogs } = useHabitLogs(weekStart, weekEnd);

  const weekDays = useMemo(() => 
    Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  // Get today's habit status
  const todayKey = format(today, 'yyyy-MM-dd');
  const todayLogs = habitLogs.filter(log => log.date === todayKey);

  const todayHabits = habits.map(habit => {
    const log = todayLogs.find(l => l.habitId === habit.id);
    return {
      ...habit,
      completed: log?.completed ?? false,
    };
  });

  const completedCount = todayHabits.filter(h => h.completed).length;
  const progress = todayHabits.length > 0 ? Math.round((completedCount / todayHabits.length) * 100) : 0;

  const handleToggleHabit = (habitId: string, currentCompleted: boolean) => {
    toggleHabitLog.mutate({ habitId, date: today, completed: !currentCompleted });
  };

  const loading = loadingHabits || loadingLogs;

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-foreground" />
          <h2 className="font-semibold text-foreground">Hábitos Diários</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/habitos')}>
          Ver calendário
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Week Preview */}
      <div className="flex gap-1 mb-4">
        {weekDays.map((date) => {
          const isTodayDate = isToday(date);
          return (
            <div
              key={date.toISOString()}
              className={cn(
                "flex-1 text-center py-2 rounded-lg text-xs",
                isTodayDate
                  ? "bg-foreground text-background font-bold"
                  : "bg-secondary/50 text-muted-foreground"
              )}
            >
              <p>{format(date, 'EEE', { locale: ptBR })}</p>
              <p className="font-medium">{format(date, 'd')}</p>
            </div>
          );
        })}
      </div>

      {habits.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="Nenhum hábito cadastrado"
          description="Crie hábitos para acompanhar sua rotina diária"
          actionLabel="Adicionar hábito"
          onAction={() => navigate('/habitos')}
        />
      ) : (
        <>
          {/* Today's Progress */}
          <div className="bg-secondary/30 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Progresso de Hoje</span>
              <span className={cn(
                "font-bold",
                progress === 100 ? "text-green-500" : "text-foreground"
              )}>
                {progress}%
              </span>
            </div>
            <ProgressBar value={progress} />
          </div>

          {/* Today's Habits */}
          <div className="space-y-2">
            {todayHabits.slice(0, 5).map((habit) => (
              <div
                key={habit.id}
                onClick={() => handleToggleHabit(habit.id, habit.completed)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
              >
                <Checkbox checked={habit.completed} className="h-4 w-4" />
                <span className={cn(
                  "text-sm flex-1",
                  habit.completed && "line-through text-muted-foreground"
                )}>
                  {habit.icon} {habit.name}
                </span>
              </div>
            ))}
            {todayHabits.length > 5 && (
              <p className="text-xs text-muted-foreground text-center pt-1">
                +{todayHabits.length - 5} mais hábitos
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
