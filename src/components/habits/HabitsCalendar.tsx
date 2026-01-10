import { useState, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HabitDayCard } from './HabitDayCard';
import { HabitDayModal } from './HabitDayModal';
import { CreateHabitModal } from './CreateHabitModal';
import { EmptyState } from '@/components/ui/empty-state';
import { useHabits } from '@/hooks/useHabits';

interface DayData {
  date: Date;
  habits: Array<{ id: string; name: string; icon: string; completed: boolean }>;
}

export function HabitsCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { habits, loadingHabits, useHabitLogs, toggleHabitLog, createHabit } = useHabits();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const { data: habitLogs = [], isLoading: loadingLogs } = useHabitLogs(monthStart, monthEnd);

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const monthDays = useMemo(() => {
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  }, [monthStart, monthEnd]);

  const firstDayOfMonth = getDay(monthStart);

  const getHabitsForDay = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return habits.map(habit => {
      const log = habitLogs.find(l => l.habitId === habit.id && l.date === dateKey);
      return {
        id: habit.id,
        name: habit.name,
        icon: habit.icon,
        completed: log?.completed ?? false,
      };
    });
  };

  const handleToggleHabit = (date: Date, habitId: string) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const currentLog = habitLogs.find(l => l.habitId === habitId && l.date === dateKey);
    const currentCompleted = currentLog?.completed ?? false;
    
    toggleHabitLog.mutate({ habitId, date, completed: !currentCompleted });

    // Update selectedDay if open
    if (selectedDay) {
      const updatedHabits = selectedDay.habits.map(h =>
        h.id === habitId ? { ...h, completed: !h.completed } : h
      );
      setSelectedDay({ ...selectedDay, habits: updatedHabits });
    }
  };

  const handleCreateHabit = (data: { name: string; icon: string }) => {
    createHabit.mutate(data);
    setShowCreateModal(false);
  };


  const loading = loadingHabits || loadingLogs;

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Novo hábito
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(new Date())}
          >
            Hoje
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {habits.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="Nenhum hábito cadastrado"
          description="Crie seus hábitos diários para acompanhar seu progresso"
          actionLabel="Criar primeiro hábito"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <>
          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for offset */}
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}

            {/* Day cells */}
            {monthDays.map((date) => {
              const dayHabits = getHabitsForDay(date);
              return (
                <HabitDayCard
                  key={date.toISOString()}
                  date={date}
                  habits={dayHabits}
                  onToggleHabit={(habitId) => handleToggleHabit(date, habitId)}
                  onClick={() => setSelectedDay({ date, habits: dayHabits })}
                  compact
                />
              );
            })}
          </div>
        </>
      )}

      {/* Day Detail Modal */}
      <HabitDayModal
        open={!!selectedDay}
        onOpenChange={(open) => !open && setSelectedDay(null)}
        date={selectedDay?.date}
        habits={selectedDay?.habits || []}
        onToggleHabit={(habitId) => {
          if (selectedDay) {
            handleToggleHabit(selectedDay.date, habitId);
          }
        }}
      />

      {/* Create Habit Modal */}
      <CreateHabitModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreateHabit}
      />
    </div>
  );
}
