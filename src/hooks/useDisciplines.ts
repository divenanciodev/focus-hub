import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Discipline } from '@/types';
import { Json } from '@/integrations/supabase/types';

export type { Discipline } from '@/types';

export function useDisciplines() {
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDisciplines = async () => {
    try {
      const { data, error } = await supabase
        .from('disciplines')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped = (data || []).map((d) => ({
        id: d.id,
        name: d.name,
        subject: d.subject,
        specificSubject: d.specific_subject || undefined,
        grade: d.grade || undefined,
        progress: d.progress || 0,
        hoursStudied: Number(d.hours_studied) || 0,
        createdAt: new Date(d.created_at || Date.now()),
        tags: d.tags || [],
        color: d.color || undefined,
        coverImage: d.cover_image || undefined,
        studyPlan: d.study_plan as unknown as Discipline['studyPlan'] || undefined,
      }));

      setDisciplines(mapped);
    } catch (error) {
      console.error('Error fetching disciplines:', error);
      toast.error('Erro ao carregar disciplinas');
    } finally {
      setLoading(false);
    }
  };

  const addDiscipline = async (data: {
    name: string;
    subject: string;
    specificSubject?: string;
    grade?: string;
    tags: string[];
    color: string;
    studyPlan?: Discipline['studyPlan'];
    coverImage?: string;
  }) => {
    try {
      const { data: newData, error } = await supabase
        .from('disciplines')
        .insert([{
          name: data.name,
          subject: data.subject,
          specific_subject: data.specificSubject,
          grade: data.grade,
          tags: data.tags,
          color: data.color,
          study_plan: data.studyPlan as unknown as Json,
          cover_image: data.coverImage,
          progress: 0,
          hours_studied: 0,
        }])
        .select()
        .single();

      if (error) throw error;

      const mapped: Discipline = {
        id: newData.id,
        name: newData.name,
        subject: newData.subject,
        specificSubject: newData.specific_subject || undefined,
        grade: newData.grade || undefined,
        progress: newData.progress || 0,
        hoursStudied: Number(newData.hours_studied) || 0,
        createdAt: new Date(newData.created_at || Date.now()),
        tags: newData.tags || [],
        color: newData.color || undefined,
        coverImage: newData.cover_image || undefined,
        studyPlan: newData.study_plan as unknown as Discipline['studyPlan'] || undefined,
      };

      setDisciplines((prev) => [mapped, ...prev]);
      toast.success('Disciplina criada com sucesso!');
      return mapped;
    } catch (error) {
      console.error('Error adding discipline:', error);
      toast.error('Erro ao criar disciplina');
      return null;
    }
  };

  const updateDiscipline = async (id: string, data: Partial<Discipline>) => {
    try {
      const updateData: Record<string, unknown> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.subject !== undefined) updateData.subject = data.subject;
      if (data.specificSubject !== undefined) updateData.specific_subject = data.specificSubject;
      if (data.grade !== undefined) updateData.grade = data.grade;
      if (data.progress !== undefined) updateData.progress = data.progress;
      if (data.hoursStudied !== undefined) updateData.hours_studied = data.hoursStudied;
      if (data.tags !== undefined) updateData.tags = data.tags;
      if (data.color !== undefined) updateData.color = data.color;
      if (data.coverImage !== undefined) updateData.cover_image = data.coverImage;
      if (data.studyPlan !== undefined) updateData.study_plan = data.studyPlan;

      const { error } = await supabase
        .from('disciplines')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setDisciplines((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...data } : d))
      );
      return true;
    } catch (error) {
      console.error('Error updating discipline:', error);
      toast.error('Erro ao atualizar disciplina');
      return false;
    }
  };

  const deleteDiscipline = async (id: string) => {
    try {
      const { error } = await supabase.from('disciplines').delete().eq('id', id);
      if (error) throw error;
      setDisciplines((prev) => prev.filter((d) => d.id !== id));
      toast.success('Disciplina excluída com sucesso!');
      return true;
    } catch (error) {
      console.error('Error deleting discipline:', error);
      toast.error('Erro ao excluir disciplina');
      return false;
    }
  };

  const getDiscipline = (id: string) => {
    return disciplines.find((d) => d.id === id);
  };

  useEffect(() => {
    fetchDisciplines();
  }, []);

  return {
    disciplines,
    loading,
    addDiscipline,
    updateDiscipline,
    deleteDiscipline,
    getDiscipline,
    refetch: fetchDisciplines,
  };
}
