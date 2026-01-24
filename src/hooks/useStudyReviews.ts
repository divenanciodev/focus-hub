import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export interface StudyReview {
  id: string;
  disciplineId: string;
  subtopic: string;
  studiedAt: Date;
  review1Due: Date;
  review1Completed: Date | null;
  review3Due: Date;
  review3Completed: Date | null;
  review7Due: Date;
  review7Completed: Date | null;
  review15Due: Date;
  review15Completed: Date | null;
}

export interface PendingReview {
  id: string;
  disciplineId: string;
  disciplineName: string;
  subtopic: string;
  dueDate: Date;
  reviewType: 1 | 3 | 7 | 15;
  isOverdue: boolean;
}

export function useStudyReviews(disciplineId?: string) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<StudyReview[]>([]);
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    if (!user) {
      setReviews([]);
      setPendingReviews([]);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('study_reviews')
        .select('*')
        .order('studied_at', { ascending: false });

      if (disciplineId) {
        query = query.eq('discipline_id', disciplineId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const mapped = (data || []).map((r) => ({
        id: r.id,
        disciplineId: r.discipline_id,
        subtopic: r.subtopic,
        studiedAt: new Date(r.studied_at),
        review1Due: new Date(r.review_1_due),
        review1Completed: r.review_1_completed ? new Date(r.review_1_completed) : null,
        review3Due: new Date(r.review_3_due),
        review3Completed: r.review_3_completed ? new Date(r.review_3_completed) : null,
        review7Due: new Date(r.review_7_due),
        review7Completed: r.review_7_completed ? new Date(r.review_7_completed) : null,
        review15Due: new Date(r.review_15_due),
        review15Completed: r.review_15_completed ? new Date(r.review_15_completed) : null,
      }));

      setReviews(mapped);
    } catch (error) {
      console.error('Error fetching study reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [user, disciplineId]);

  const fetchPendingReviews = useCallback(async () => {
    if (!user) {
      setPendingReviews([]);
      return;
    }

    try {
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('study_reviews')
        .select('*');

      if (reviewsError) throw reviewsError;

      const { data: disciplinesData, error: disciplinesError } = await supabase
        .from('disciplines')
        .select('id, name');

      if (disciplinesError) throw disciplinesError;

      const disciplineMap = new Map(
        (disciplinesData || []).map((d) => [d.id, d.name])
      );

      const now = new Date();
      const pending: PendingReview[] = [];

      (reviewsData || []).forEach((r) => {
        const disciplineName = disciplineMap.get(r.discipline_id) || 'Disciplina';

        // Check each review interval
        if (!r.review_1_completed) {
          const dueDate = new Date(r.review_1_due);
          pending.push({
            id: r.id,
            disciplineId: r.discipline_id,
            disciplineName,
            subtopic: r.subtopic,
            dueDate,
            reviewType: 1,
            isOverdue: dueDate <= now,
          });
        } else if (!r.review_3_completed) {
          const dueDate = new Date(r.review_3_due);
          pending.push({
            id: r.id,
            disciplineId: r.discipline_id,
            disciplineName,
            subtopic: r.subtopic,
            dueDate,
            reviewType: 3,
            isOverdue: dueDate <= now,
          });
        } else if (!r.review_7_completed) {
          const dueDate = new Date(r.review_7_due);
          pending.push({
            id: r.id,
            disciplineId: r.discipline_id,
            disciplineName,
            subtopic: r.subtopic,
            dueDate,
            reviewType: 7,
            isOverdue: dueDate <= now,
          });
        } else if (!r.review_15_completed) {
          const dueDate = new Date(r.review_15_due);
          pending.push({
            id: r.id,
            disciplineId: r.discipline_id,
            disciplineName,
            subtopic: r.subtopic,
            dueDate,
            reviewType: 15,
            isOverdue: dueDate <= now,
          });
        }
      });

      // Sort by due date (overdue first, then by date)
      pending.sort((a, b) => {
        if (a.isOverdue !== b.isOverdue) {
          return a.isOverdue ? -1 : 1;
        }
        return a.dueDate.getTime() - b.dueDate.getTime();
      });

      setPendingReviews(pending);
    } catch (error) {
      console.error('Error fetching pending reviews:', error);
    }
  }, [user]);

  const markAsStudied = async (disciplineId: string, subtopic: string) => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return null;
    }

    try {
      const now = new Date();
      const review1Due = new Date(now);
      review1Due.setDate(review1Due.getDate() + 1);
      
      const review3Due = new Date(now);
      review3Due.setDate(review3Due.getDate() + 3);
      
      const review7Due = new Date(now);
      review7Due.setDate(review7Due.getDate() + 7);
      
      const review15Due = new Date(now);
      review15Due.setDate(review15Due.getDate() + 15);

      const { data, error } = await supabase
        .from('study_reviews')
        .insert({
          user_id: user.id,
          discipline_id: disciplineId,
          subtopic,
          studied_at: now.toISOString(),
          review_1_due: review1Due.toISOString(),
          review_3_due: review3Due.toISOString(),
          review_7_due: review7Due.toISOString(),
          review_15_due: review15Due.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Subtópico marcado como estudado!', {
        description: 'Revisões programadas para 1, 3, 7 e 15 dias.',
      });

      await fetchReviews();
      await fetchPendingReviews();

      return data;
    } catch (error) {
      console.error('Error marking as studied:', error);
      toast.error('Erro ao marcar como estudado');
      return null;
    }
  };

  const unmarkAsStudied = async (reviewId: string) => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return false;
    }

    try {
      const { error } = await supabase
        .from('study_reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      toast.success('Marcação removida');
      await fetchReviews();
      await fetchPendingReviews();

      return true;
    } catch (error) {
      console.error('Error removing study mark:', error);
      toast.error('Erro ao remover marcação');
      return false;
    }
  };

  const completeReview = async (reviewId: string, reviewType: 1 | 3 | 7 | 15) => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return false;
    }

    try {
      const updateData: Record<string, string> = {};
      const now = new Date().toISOString();

      switch (reviewType) {
        case 1:
          updateData.review_1_completed = now;
          break;
        case 3:
          updateData.review_3_completed = now;
          break;
        case 7:
          updateData.review_7_completed = now;
          break;
        case 15:
          updateData.review_15_completed = now;
          break;
      }

      const { error } = await supabase
        .from('study_reviews')
        .update(updateData)
        .eq('id', reviewId);

      if (error) throw error;

      toast.success(`Revisão de ${reviewType} dia(s) concluída!`);
      await fetchReviews();
      await fetchPendingReviews();

      return true;
    } catch (error) {
      console.error('Error completing review:', error);
      toast.error('Erro ao completar revisão');
      return false;
    }
  };

  const isSubtopicStudied = (subtopic: string): StudyReview | undefined => {
    return reviews.find((r) => r.subtopic === subtopic);
  };

  const getStudiedSubtopics = (): string[] => {
    return reviews.map((r) => r.subtopic);
  };

  useEffect(() => {
    fetchReviews();
    fetchPendingReviews();
  }, [fetchReviews, fetchPendingReviews]);

  return {
    reviews,
    pendingReviews,
    loading,
    markAsStudied,
    unmarkAsStudied,
    completeReview,
    isSubtopicStudied,
    getStudiedSubtopics,
    refetch: fetchReviews,
    refetchPending: fetchPendingReviews,
  };
}
