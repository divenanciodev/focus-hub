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
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HabitDayCard } from './HabitDayCard';
import { HabitDayModal } from './HabitDayModal';
import { Habit, defaultHabits } from '@/types/habits';

interface DayData {
  date: Date;
  habits: Habit[];
}

export function HabitsCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [habitsData, setHabitsData] = useState<{ [key: string]: Habit[] }>({});

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const monthDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const firstDayOfMonth = getDay(startOfMonth(currentMonth));

  const getHabitsForDay = (date: Date): Habit[] => {
    const key = format(date, 'yyyy-MM-dd');
    if (habitsData[key]) {
      return habitsData[key];
    }
    return defaultHabits.map(h => ({ ...h, completed: false }));
  };

  const handleToggleHabit = (date: Date, habitId: string) => {
    const key = format(date, 'yyyy-MM-dd');
    const currentHabits = getHabitsForDay(date);
    const updatedHabits = currentHabits.map(h =>
      h.id === habitId ? { ...h, completed: !h.completed } : h
    );
    setHabitsData(prev => ({ ...prev, [key]: updatedHabits }));
  };

  const handleUpdateHabits = (date: Date, habits: Habit[]) => {
    const key = format(date, 'yyyy-MM-dd');
    setHabitsData(prev => ({ ...prev, [key]: habits }));
  };

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
          const habits = getHabitsForDay(date);
          return (
            <HabitDayCard
              key={date.toISOString()}
              date={date}
              habits={habits}
              onToggleHabit={(habitId) => handleToggleHabit(date, habitId)}
              onClick={() => setSelectedDay({ date, habits })}
              compact
            />
          );
        })}
      </div>

      {/* Day Detail Modal */}
      <HabitDayModal
        open={!!selectedDay}
        onOpenChange={(open) => !open && setSelectedDay(null)}
        date={selectedDay?.date}
        habits={selectedDay?.habits || []}
        onToggleHabit={(habitId) => {
          if (selectedDay) {
            handleToggleHabit(selectedDay.date, habitId);
            const updatedHabits = selectedDay.habits.map(h =>
              h.id === habitId ? { ...h, completed: !h.completed } : h
            );
            setSelectedDay({ ...selectedDay, habits: updatedHabits });
          }
        }}
        onUpdateHabits={(habits) => {
          if (selectedDay) {
            handleUpdateHabits(selectedDay.date, habits);
            setSelectedDay({ ...selectedDay, habits });
          }
        }}
      />
    </div>
  );
}
