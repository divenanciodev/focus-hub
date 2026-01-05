import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Habit } from '@/types/habits';

interface HabitDayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date?: Date;
  habits: Habit[];
  onToggleHabit: (habitId: string) => void;
  onUpdateHabits: (habits: Habit[]) => void;
}

export function HabitDayModal({
  open,
  onOpenChange,
  date,
  habits,
  onToggleHabit,
  onUpdateHabits,
}: HabitDayModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedHabits, setEditedHabits] = useState<Habit[]>(habits);
  const [newHabitName, setNewHabitName] = useState('');

  if (!date) return null;

  const isFutureDate = isFuture(date);
  const completedCount = habits.filter(h => h.completed).length;
  const progress = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  const handleStartEdit = () => {
    setEditedHabits([...habits]);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    onUpdateHabits(editedHabits);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedHabits([...habits]);
    setIsEditing(false);
  };

  const handleAddHabit = () => {
    if (!newHabitName.trim()) return;
    const newHabit: Habit = {
      id: Date.now().toString(),
      name: newHabitName.trim(),
      icon: '✅',
      completed: false,
    };
    setEditedHabits([...editedHabits, newHabit]);
    setNewHabitName('');
  };

  const handleRemoveHabit = (habitId: string) => {
    setEditedHabits(editedHabits.filter(h => h.id !== habitId));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>
              {format(date, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </span>
            {!isFutureDate && !isEditing && (
              <Button variant="ghost" size="sm" onClick={handleStartEdit}>
                <Edit2 className="w-4 h-4 mr-1" />
                Editar
              </Button>
            )}
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
            <h3 className="text-sm font-semibold text-foreground">Daily Habits</h3>
            
            {isEditing ? (
              <>
                {editedHabits.map((habit) => (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                  >
                    <span className="text-sm">
                      {habit.icon} {habit.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleRemoveHabit(habit.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                {/* Add New Habit */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Novo hábito..."
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()}
                  />
                  <Button onClick={handleAddHabit} size="icon">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Edit Actions */}
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSaveEdit} className="flex-1">
                    <Check className="w-4 h-4 mr-1" />
                    Salvar
                  </Button>
                  <Button variant="outline" onClick={handleCancelEdit} className="flex-1">
                    <X className="w-4 h-4 mr-1" />
                    Cancelar
                  </Button>
                </div>
              </>
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
