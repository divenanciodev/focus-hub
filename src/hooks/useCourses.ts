import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';
export interface CurriculumSubtopic {
  id: string;
  title: string;
  completed: boolean;
}

export interface CurriculumItem {
  id: string;
  title: string;
  completed: boolean;
  order: number;
  subtopics?: CurriculumSubtopic[];
}

export interface Course {
  id: string;
  name: string;
  theme?: string;
  platform?: string;
  workload: number;
  deadline: Date;
  progress: number;
  imageUrl?: string;
  links: { name: string; url: string }[];
  curriculum: CurriculumItem[];
  isFromBank?: boolean;
}

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped = (data || []).map((c) => ({
        id: c.id,
        name: c.name,
        theme: c.theme || undefined,
        platform: c.platform || undefined,
        workload: c.workload || 0,
        deadline: new Date(c.deadline || Date.now()),
        progress: c.progress || 0,
        imageUrl: c.image_url || undefined,
        links: (c.links as unknown as { name: string; url: string }[]) || [],
        curriculum: (c.curriculum as unknown as CurriculumItem[]) || [],
        isFromBank: c.is_from_bank || false,
      }));

      setCourses(mapped);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Erro ao carregar cursinhos');
    } finally {
      setLoading(false);
    }
  };

  const addCourse = async (data: Omit<Course, 'id'>) => {
    try {
      const { data: newData, error } = await supabase
        .from('courses')
        .insert([{
          name: data.name,
          theme: data.theme,
          platform: data.platform,
          workload: data.workload,
          deadline: data.deadline.toISOString(),
          progress: data.progress,
          image_url: data.imageUrl,
          links: data.links as unknown as Json,
          curriculum: data.curriculum as unknown as Json,
          is_from_bank: data.isFromBank,
        }])
        .select()
        .single();

      if (error) throw error;

      const mapped: Course = {
        id: newData.id,
        name: newData.name,
        theme: newData.theme || undefined,
        platform: newData.platform || undefined,
        workload: newData.workload || 0,
        deadline: new Date(newData.deadline || Date.now()),
        progress: newData.progress || 0,
        imageUrl: newData.image_url || undefined,
        links: (newData.links as unknown as { name: string; url: string }[]) || [],
        curriculum: (newData.curriculum as unknown as CurriculumItem[]) || [],
        isFromBank: newData.is_from_bank || false,
      };

      setCourses((prev) => [mapped, ...prev]);
      toast.success('Cursinho criado!');
      return mapped;
    } catch (error) {
      console.error('Error adding course:', error);
      toast.error('Erro ao criar cursinho');
      return null;
    }
  };

  const updateCourse = async (id: string, data: Partial<Course>) => {
    try {
      const updateData: Record<string, unknown> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.theme !== undefined) updateData.theme = data.theme;
      if (data.platform !== undefined) updateData.platform = data.platform;
      if (data.workload !== undefined) updateData.workload = data.workload;
      if (data.deadline !== undefined) updateData.deadline = data.deadline.toISOString();
      if (data.progress !== undefined) updateData.progress = data.progress;
      if (data.imageUrl !== undefined) updateData.image_url = data.imageUrl;
      if (data.links !== undefined) updateData.links = data.links;
      if (data.curriculum !== undefined) updateData.curriculum = data.curriculum;

      const { error } = await supabase.from('courses').update(updateData).eq('id', id);
      if (error) throw error;

      setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
      return true;
    } catch (error) {
      console.error('Error updating course:', error);
      toast.error('Erro ao atualizar cursinho');
      return false;
    }
  };

  const deleteCourse = async (id: string) => {
    try {
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (error) throw error;

      setCourses((prev) => prev.filter((c) => c.id !== id));
      toast.success('Cursinho excluído!');
      return true;
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Erro ao excluir cursinho');
      return false;
    }
  };

  const toggleCurriculumItem = async (courseId: string, itemId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return false;

    const updatedCurriculum = course.curriculum.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    const completedCount = updatedCurriculum.filter((item) => item.completed).length;
    const progress = updatedCurriculum.length > 0 ? Math.round((completedCount / updatedCurriculum.length) * 100) : 0;

    return updateCourse(courseId, { curriculum: updatedCurriculum, progress });
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return {
    courses,
    loading,
    addCourse,
    updateCourse,
    deleteCourse,
    toggleCurriculumItem,
    refetch: fetchCourses,
  };
}
