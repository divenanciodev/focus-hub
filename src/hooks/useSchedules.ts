import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Schedule, ScheduleBlock } from '@/types/schedule';
import { Json } from '@/integrations/supabase/types';

interface ScheduleDB {
  id: string;
  user_id: string | null;
  name: string;
  objective: string | null;
  hours_per_day: number | null;
  start_time: string | null;
  end_time: string | null;
  block_duration: number | null;
  rest_duration: number | null;
  blocks: Json | null;
  created_at: string | null;
  updated_at: string | null;
}

const mapDBToSchedule = (db: ScheduleDB): Schedule => ({
  id: db.id,
  name: db.name,
  objective: db.objective || '',
  hoursPerDay: db.hours_per_day || 6,
  startTime: db.start_time || '06:00',
  endTime: db.end_time || '22:00',
  blockDuration: db.block_duration || 60,
  restDuration: db.rest_duration || 10,
  blocks: (db.blocks as unknown as Record<string, ScheduleBlock>) || {},
});

const mapScheduleToDB = (schedule: Omit<Schedule, 'id'> | Schedule) => ({
  name: schedule.name,
  objective: schedule.objective,
  hours_per_day: schedule.hoursPerDay,
  start_time: schedule.startTime,
  end_time: schedule.endTime,
  block_duration: schedule.blockDuration,
  rest_duration: schedule.restDuration,
  blocks: schedule.blocks as unknown as Json,
});

export function useSchedules() {
  const queryClient = useQueryClient();

  const { data: schedules = [], isLoading, error } = useQuery({
    queryKey: ['schedules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as unknown as ScheduleDB[]).map(mapDBToSchedule);
    },
  });

  const createSchedule = useMutation({
    mutationFn: async (schedule: Omit<Schedule, 'id' | 'blocks'>) => {
      const { data, error } = await supabase
        .from('schedules')
        .insert([{ ...mapScheduleToDB({ ...schedule, blocks: {} }) }])
        .select()
        .single();

      if (error) throw error;
      return mapDBToSchedule(data as unknown as ScheduleDB);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Cronograma criado com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating schedule:', error);
      toast.error('Erro ao criar cronograma');
    },
  });

  const updateSchedule = useMutation({
    mutationFn: async ({ id, ...schedule }: Schedule) => {
      const { data, error } = await supabase
        .from('schedules')
        .update(mapScheduleToDB(schedule as Schedule))
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return mapDBToSchedule(data as unknown as ScheduleDB);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
    onError: (error) => {
      console.error('Error updating schedule:', error);
      toast.error('Erro ao atualizar cronograma');
    },
  });

  const updateBlocks = useMutation({
    mutationFn: async ({ id, blocks }: { id: string; blocks: Record<string, ScheduleBlock> }) => {
      const { data, error } = await supabase
        .from('schedules')
        .update({ blocks: blocks as unknown as Json })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return mapDBToSchedule(data as unknown as ScheduleDB);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
    onError: (error) => {
      console.error('Error updating blocks:', error);
      toast.error('Erro ao atualizar blocos');
    },
  });

  const deleteSchedule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Cronograma excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Error deleting schedule:', error);
      toast.error('Erro ao excluir cronograma');
    },
  });

  return {
    schedules,
    isLoading,
    error,
    createSchedule,
    updateSchedule,
    updateBlocks,
    deleteSchedule,
  };
}
