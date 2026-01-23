import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type StudyType = 'resumo' | 'exercicios' | 'leitura';

export interface CourseStudySession {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  tags: string[];
  studyMinutes: number;
  createdAt: Date;
  // New fields
  curriculumItemId?: string;
  curriculumItemTitle?: string;
  studyType: StudyType;
  questionsCount: number;
  readingMinutes: number;
  exerciseMinutes: number;
  summaryMinutes: number;
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
        curriculumItemId: s.curriculum_item_id || undefined,
        curriculumItemTitle: s.curriculum_item_title || undefined,
        studyType: (s.study_type || 'resumo') as StudyType,
        questionsCount: s.questions_count || 0,
        readingMinutes: s.reading_minutes || 0,
        exerciseMinutes: s.exercise_minutes || 0,
        summaryMinutes: s.summary_minutes || 0,
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
          curriculum_item_id: data.curriculumItemId,
          curriculum_item_title: data.curriculumItemTitle,
          study_type: data.studyType,
          questions_count: data.questionsCount,
          reading_minutes: data.readingMinutes,
          exercise_minutes: data.exerciseMinutes,
          summary_minutes: data.summaryMinutes,
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
        curriculumItemId: newData.curriculum_item_id || undefined,
        curriculumItemTitle: newData.curriculum_item_title || undefined,
        studyType: (newData.study_type || 'resumo') as StudyType,
        questionsCount: newData.questions_count || 0,
        readingMinutes: newData.reading_minutes || 0,
        exerciseMinutes: newData.exercise_minutes || 0,
        summaryMinutes: newData.summary_minutes || 0,
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

  const getTotalQuestions = () => {
    return sessions.reduce((acc, s) => acc + s.questionsCount, 0);
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
    getTotalQuestions,
    refetch: fetchSessions,
  };
}
