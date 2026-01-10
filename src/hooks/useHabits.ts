import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  isActive: boolean;
  createdAt: Date;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
}

interface HabitDB {
  id: string;
  user_id: string | null;
  name: string;
  icon: string | null;
  color: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

interface HabitLogDB {
  id: string;
  user_id: string | null;
  habit_id: string | null;
  date: string;
  completed: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

const mapDBToHabit = (db: HabitDB): Habit => ({
  id: db.id,
  name: db.name,
  icon: db.icon || '✓',
  color: db.color || '#000000',
  isActive: db.is_active ?? true,
  createdAt: db.created_at ? new Date(db.created_at) : new Date(),
});

const mapDBToHabitLog = (db: HabitLogDB): HabitLog => ({
  id: db.id,
  habitId: db.habit_id || '',
  date: db.date,
  completed: db.completed ?? false,
});

export function useHabits() {
  const queryClient = useQueryClient();

  // Fetch all habits
  const { data: habits = [], isLoading: loadingHabits } = useQuery({
    queryKey: ['habits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data as HabitDB[]).map(mapDBToHabit);
    },
  });

  // Fetch habit logs for a date range
  const useHabitLogs = (startDate: Date, endDate: Date) => {
    return useQuery({
      queryKey: ['habit_logs', format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('habit_logs')
          .select('*')
          .gte('date', format(startDate, 'yyyy-MM-dd'))
          .lte('date', format(endDate, 'yyyy-MM-dd'));

        if (error) throw error;
        return (data as HabitLogDB[]).map(mapDBToHabitLog);
      },
    });
  };

  // Create a new habit
  const createHabit = useMutation({
    mutationFn: async (habit: { name: string; icon?: string; color?: string }) => {
      const { data, error } = await supabase
        .from('habits')
        .insert({
          name: habit.name,
          icon: habit.icon || '✓',
          color: habit.color || '#000000',
        })
        .select()
        .single();

      if (error) throw error;
      return mapDBToHabit(data as HabitDB);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  // Update a habit
  const updateHabit = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Habit> & { id: string }) => {
      const { error } = await supabase
        .from('habits')
        .update({
          name: updates.name,
          icon: updates.icon,
          color: updates.color,
          is_active: updates.isActive,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  // Delete (deactivate) a habit
  const deleteHabit = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('habits')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  // Toggle habit completion for a date
  const toggleHabitLog = useMutation({
    mutationFn: async ({ habitId, date, completed }: { habitId: string; date: Date; completed: boolean }) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Check if log exists
      const { data: existing } = await supabase
        .from('habit_logs')
        .select('id')
        .eq('habit_id', habitId)
        .eq('date', dateStr)
        .single();

      if (existing) {
        // Update existing log
        const { error } = await supabase
          .from('habit_logs')
          .update({ completed })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create new log
        const { error } = await supabase
          .from('habit_logs')
          .insert({
            habit_id: habitId,
            date: dateStr,
            completed,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habit_logs'] });
    },
  });

  return {
    habits,
    loadingHabits,
    useHabitLogs,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleHabitLog,
  };
}
