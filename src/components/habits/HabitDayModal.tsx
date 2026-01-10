import { format, isFuture } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { ProgressBar } from '@/components/ui/progress-bar';
import { cn } from '@/lib/utils';

interface HabitItem {
  id: string;
  name: string;
  icon: string;
  completed: boolean;
}

interface HabitDayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date?: Date;
  habits: HabitItem[];
  onToggleHabit: (habitId: string) => void;
}

export function HabitDayModal({
  open,
  onOpenChange,
  date,
  habits,
  onToggleHabit,
}: HabitDayModalProps) {
  if (!date) return null;

  const isFutureDate = isFuture(date);
  const completedCount = habits.filter(h => h.completed).length;
  const progress = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>
            {format(date, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          {/* Progress Summary */}
          <div className="bg-secondary/50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Progresso do Dia</span>
              <span className={cn(
                "text-lg font-bold",
                progress === 100 ? "text-green-500" : "text-foreground"
              )}>
                {progress}%
              </span>
            </div>
            <ProgressBar value={progress} />
            <p className="text-xs text-muted-foreground mt-2">
              {completedCount} de {habits.length} hábitos concluídos
            </p>
          </div>

          {/* Habits List */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Hábitos do Dia</h3>
            
            {habits.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum hábito cadastrado ainda.
              </p>
            ) : (
              habits.map((habit) => (
                <div
                  key={habit.id}
                  onClick={() => !isFutureDate && onToggleHabit(habit.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg transition-colors",
                    isFutureDate
                      ? "bg-secondary/30 opacity-50"
                      : "bg-secondary/50 hover:bg-secondary cursor-pointer"
                  )}
                >
                  <Checkbox
                    checked={habit.completed}
                    disabled={isFutureDate}
                    className="h-5 w-5"
                  />
                  <span className={cn(
                    "text-sm flex-1",
                    habit.completed && "line-through text-muted-foreground"
                  )}>
                    {habit.icon} {habit.name}
                  </span>
                </div>
              ))
            )}
          </div>

          {isFutureDate && (
            <p className="text-xs text-muted-foreground text-center mt-6">
              Você não pode marcar hábitos em dias futuros.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
