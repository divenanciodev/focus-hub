import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Contest {
  id: string;
  name: string;
  position: string;
  institution: string;
  examDate: Date;
  status: 'active' | 'completed' | 'cancelled';
  progress?: number;
}

export function useContests() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContests = async () => {
    try {
      const { data, error } = await supabase
        .from('contests')
        .select('*')
        .order('exam_date', { ascending: true });

      if (error) throw error;

      const mapped = (data || []).map((c) => ({
        id: c.id,
        name: c.name,
        position: c.position || '',
        institution: c.institution || '',
        examDate: new Date(c.exam_date || Date.now()),
        status: (c.status as Contest['status']) || 'active',
        progress: Math.floor(Math.random() * 100), // Mock progress for now
      }));

      setContests(mapped);
    } catch (error) {
      console.error('Error fetching contests:', error);
      toast.error('Erro ao carregar concursos');
    } finally {
      setLoading(false);
    }
  };

  const addContest = async (data: Omit<Contest, 'id' | 'progress'>) => {
    try {
      const { data: newData, error } = await supabase
        .from('contests')
        .insert({
          name: data.name,
          position: data.position,
          institution: data.institution,
          exam_date: data.examDate.toISOString(),
          status: data.status,
        })
        .select()
        .single();

      if (error) throw error;

      const mapped: Contest = {
        id: newData.id,
        name: newData.name,
        position: newData.position || '',
        institution: newData.institution || '',
        examDate: new Date(newData.exam_date || Date.now()),
        status: (newData.status as Contest['status']) || 'active',
        progress: 0,
      };

      setContests((prev) => [mapped, ...prev]);
      toast.success('Concurso criado!');
      return mapped;
    } catch (error) {
      console.error('Error adding contest:', error);
      toast.error('Erro ao criar concurso');
      return null;
    }
  };

  const updateContest = async (id: string, data: Partial<Contest>) => {
    try {
      const updateData: Record<string, unknown> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.position !== undefined) updateData.position = data.position;
      if (data.institution !== undefined) updateData.institution = data.institution;
      if (data.examDate !== undefined) updateData.exam_date = data.examDate.toISOString();
      if (data.status !== undefined) updateData.status = data.status;

      const { error } = await supabase.from('contests').update(updateData).eq('id', id);
      if (error) throw error;

      setContests((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
      toast.success('Concurso atualizado!');
      return true;
    } catch (error) {
      console.error('Error updating contest:', error);
      toast.error('Erro ao atualizar concurso');
      return false;
    }
  };

  const deleteContest = async (id: string) => {
    try {
      const { error } = await supabase.from('contests').delete().eq('id', id);
      if (error) throw error;

      setContests((prev) => prev.filter((c) => c.id !== id));
      toast.success('Concurso excluído!');
      return true;
    } catch (error) {
      console.error('Error deleting contest:', error);
      toast.error('Erro ao excluir concurso');
      return false;
    }
  };

  useEffect(() => {
    fetchContests();
  }, []);

  return {
    contests,
    loading,
    addContest,
    updateContest,
    deleteContest,
    refetch: fetchContests,
  };
}
