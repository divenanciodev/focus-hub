import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Simulado, SimuladoQuestion } from '@/types/training';
import { Json } from '@/integrations/supabase/types';

export function useSimulados() {
  const [simulados, setSimulados] = useState<Simulado[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSimulados = async () => {
    try {
      const { data, error } = await supabase
        .from('simulados')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped = (data || []).map((s) => ({
        id: s.id,
        name: s.name,
        discipline: s.discipline || undefined,
        subject: s.subject || undefined,
        questions: (s.questions as unknown as SimuladoQuestion[]) || [],
        timeMinutes: s.time_minutes || 30,
        difficulty: (s.difficulty as 'easy' | 'medium' | 'hard') || 'medium',
        status: (s.status as 'pending' | 'completed') || 'pending',
        score: s.score || undefined,
        createdAt: new Date(s.created_at || Date.now()),
      }));

      setSimulados(mapped);
    } catch (error) {
      console.error('Error fetching simulados:', error);
      toast.error('Erro ao carregar simulados');
    } finally {
      setLoading(false);
    }
  };

  const addSimulado = async (data: Omit<Simulado, 'id' | 'createdAt'>) => {
    try {
      const { data: newData, error } = await supabase
        .from('simulados')
        .insert([{
          name: data.name,
          discipline: data.discipline,
          subject: data.subject,
          questions: data.questions as unknown as Json,
          time_minutes: data.timeMinutes,
          difficulty: data.difficulty,
          status: data.status,
          score: data.score,
        }])
        .select()
        .single();

      if (error) throw error;

      const mapped: Simulado = {
        id: newData.id,
        name: newData.name,
        discipline: newData.discipline || undefined,
        subject: newData.subject || undefined,
        questions: (newData.questions as unknown as SimuladoQuestion[]) || [],
        timeMinutes: newData.time_minutes || 30,
        difficulty: (newData.difficulty as 'easy' | 'medium' | 'hard') || 'medium',
        status: (newData.status as 'pending' | 'completed') || 'pending',
        score: newData.score || undefined,
        createdAt: new Date(newData.created_at || Date.now()),
      };

      setSimulados((prev) => [mapped, ...prev]);
      toast.success('Simulado criado!');
      return mapped;
    } catch (error) {
      console.error('Error adding simulado:', error);
      toast.error('Erro ao criar simulado');
      return null;
    }
  };

  const updateSimulado = async (id: string, data: Partial<Simulado>) => {
    try {
      const updateData: Record<string, unknown> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.discipline !== undefined) updateData.discipline = data.discipline;
      if (data.subject !== undefined) updateData.subject = data.subject;
      if (data.questions !== undefined) updateData.questions = data.questions;
      if (data.timeMinutes !== undefined) updateData.time_minutes = data.timeMinutes;
      if (data.difficulty !== undefined) updateData.difficulty = data.difficulty;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.score !== undefined) updateData.score = data.score;

      const { error } = await supabase.from('simulados').update(updateData).eq('id', id);
      if (error) throw error;

      setSimulados((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
      return true;
    } catch (error) {
      console.error('Error updating simulado:', error);
      toast.error('Erro ao atualizar simulado');
      return false;
    }
  };

  const deleteSimulado = async (id: string) => {
    try {
      const { error } = await supabase.from('simulados').delete().eq('id', id);
      if (error) throw error;

      setSimulados((prev) => prev.filter((s) => s.id !== id));
      toast.success('Simulado excluído!');
      return true;
    } catch (error) {
      console.error('Error deleting simulado:', error);
      toast.error('Erro ao excluir simulado');
      return false;
    }
  };

  const completeSimulado = async (id: string, score: number) => {
    return updateSimulado(id, { status: 'completed', score });
  };

  useEffect(() => {
    fetchSimulados();
  }, []);

  return {
    simulados,
    loading,
    addSimulado,
    updateSimulado,
    deleteSimulado,
    completeSimulado,
    refetch: fetchSimulados,
  };
}
