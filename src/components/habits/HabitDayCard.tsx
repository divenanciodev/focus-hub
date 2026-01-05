import { useState } from 'react';
import { format, isToday, isFuture, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Checkbox } from '@/components/ui/checkbox';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Habit } from '@/types/habits';

interface HabitDayCardProps {
  date: Date;
  habits: Habit[];
  onToggleHabit: (habitId: string) => void;
  onClick?: () => void;
  compact?: boolean;
}

export function HabitDayCard({ date, habits, onToggleHabit, onClick, compact = false }: HabitDayCardProps) {
  const completedCount = habits.filter(h => h.completed).length;
  const progress = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;
  const isComplete = progress === 100;
  const isTodayDate = isToday(date);
  const isFutureDate = isFuture(date);

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card border rounded-lg p-3 transition-all duration-200",
        isTodayDate && "ring-2 ring-foreground",
        isComplete && "border-green-500 bg-green-500/5",
        isFutureDate && "opacity-50",
        !isFutureDate && onClick && "cursor-pointer hover:shadow-md hover:-translate-y-0.5",
        compact && "p-2"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={cn(
          "text-xs font-medium",
          isTodayDate ? "text-foreground" : "text-muted-foreground"
        )}>
          {format(date, 'd', { locale: ptBR })}
        </span>
        {isComplete && (
          <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded font-medium">
            100%
          </span>
        )}
      </div>

      {!compact && (
        <>
          <p className="text-xs font-semibold text-foreground mb-2">Daily Habits</p>
          <TooltipProvider>
            <div className="space-y-1.5">
              {habits.map((habit) => (
                <Tooltip key={habit.id}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "flex items-center gap-2 text-xs",
                        isFutureDate && "pointer-events-none"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isFutureDate) onToggleHabit(habit.id);
                      }}
                    >
                      <Checkbox
                        checked={habit.completed}
                        disabled={isFutureDate}
                        className="h-3 w-3"
                      />
                      <span className={cn(
                        "truncate",
                        habit.completed && "line-through text-muted-foreground"
                      )}>
                        {habit.icon} {habit.name}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{habit.name}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        </>
      )}

      <div className="mt-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>{completedCount}/{habits.length}</span>
          <span>{progress}%</span>
        </div>
        <ProgressBar value={progress} size="sm" />
      </div>
    </div>
  );
}
