import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CourseStudySession {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  tags: string[];
  studyMinutes: number;
  createdAt: Date;
}

export function useCourseStudySessions(courseId?: string) {
  const [sessions, setSessions] = useState<CourseStudySession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      let query = supabase
        .from('course_study_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (courseId) {
        query = query.eq('course_id', courseId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const mapped = (data || []).map((s) => ({
        id: s.id,
        courseId: s.course_id,
        title: s.title,
        description: s.description || undefined,
        tags: s.tags || [],
        studyMinutes: s.study_minutes || 0,
        createdAt: new Date(s.created_at),
      }));

      setSessions(mapped);
    } catch (error) {
      console.error('Error fetching study sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSession = async (data: Omit<CourseStudySession, 'id' | 'createdAt'>) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error('Você precisa estar logado para registrar estudos');
        return null;
      }

      const { data: newData, error } = await supabase
        .from('course_study_sessions')
        .insert([{
          user_id: userData.user.id,
          course_id: data.courseId,
          title: data.title,
          description: data.description,
          tags: data.tags,
          study_minutes: data.studyMinutes,
        }])
        .select()
        .single();

      if (error) throw error;

      const mapped: CourseStudySession = {
        id: newData.id,
        courseId: newData.course_id,
        title: newData.title,
        description: newData.description || undefined,
        tags: newData.tags || [],
        studyMinutes: newData.study_minutes || 0,
        createdAt: new Date(newData.created_at),
      };

      setSessions((prev) => [mapped, ...prev]);
      toast.success('Estudo registrado com sucesso!');
      return mapped;
    } catch (error) {
      console.error('Error adding study session:', error);
      toast.error('Erro ao registrar estudo');
      return null;
    }
  };

  const deleteSession = async (id: string) => {
    try {
      const { error } = await supabase
        .from('course_study_sessions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSessions((prev) => prev.filter((s) => s.id !== id));
      toast.success('Registro excluído!');
      return true;
    } catch (error) {
      console.error('Error deleting study session:', error);
      toast.error('Erro ao excluir registro');
      return false;
    }
  };

  const getTotalStudyMinutes = () => {
    return sessions.reduce((acc, s) => acc + s.studyMinutes, 0);
  };

  const getTotalStudyHours = () => {
    return Math.round((getTotalStudyMinutes() / 60) * 10) / 10;
  };

  useEffect(() => {
    fetchSessions();
  }, [courseId]);

  return {
    sessions,
    loading,
    addSession,
    deleteSession,
    getTotalStudyMinutes,
    getTotalStudyHours,
    refetch: fetchSessions,
  };
}
