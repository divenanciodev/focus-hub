import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';
export interface ObjectiveStep {
  id: string;
  title: string;
  completed: boolean;
}

export interface Objective {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  requiresMoney: boolean;
  estimatedCost?: number;
  steps: ObjectiveStep[];
  createdAt: Date;
}

export function useObjectives() {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchObjectives = async () => {
    try {
      const { data, error } = await supabase
        .from('objectives')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped = (data || []).map((o) => ({
        id: o.id,
        title: o.title,
        description: o.description || undefined,
        status: (o.status as Objective['status']) || 'pending',
        priority: (o.priority as Objective['priority']) || 'medium',
        requiresMoney: o.requires_money || false,
        estimatedCost: o.estimated_cost ? Number(o.estimated_cost) : undefined,
        steps: (o.steps as unknown as ObjectiveStep[]) || [],
        createdAt: new Date(o.created_at || Date.now()),
      }));

      setObjectives(mapped);
    } catch (error) {
      console.error('Error fetching objectives:', error);
      toast.error('Erro ao carregar objetivos');
    } finally {
      setLoading(false);
    }
  };

  const addObjective = async (data: Omit<Objective, 'id' | 'createdAt'>) => {
    try {
      const { data: newData, error } = await supabase
        .from('objectives')
        .insert([{
          title: data.title,
          description: data.description,
          status: data.status,
          priority: data.priority,
          requires_money: data.requiresMoney,
          estimated_cost: data.estimatedCost,
          steps: data.steps as unknown as Json,
        }])
        .select()
        .single();

      if (error) throw error;

      const mapped: Objective = {
        id: newData.id,
        title: newData.title,
        description: newData.description || undefined,
        status: (newData.status as Objective['status']) || 'pending',
        priority: (newData.priority as Objective['priority']) || 'medium',
        requiresMoney: newData.requires_money || false,
        estimatedCost: newData.estimated_cost ? Number(newData.estimated_cost) : undefined,
        steps: (newData.steps as unknown as ObjectiveStep[]) || [],
        createdAt: new Date(newData.created_at || Date.now()),
      };

      setObjectives((prev) => [mapped, ...prev]);
      toast.success('Pendência criada com sucesso!');
      return mapped;
    } catch (error) {
      console.error('Error adding objective:', error);
      toast.error('Erro ao criar pendência');
      return null;
    }
  };

  const updateObjective = async (id: string, data: Partial<Objective>) => {
    try {
      const updateData: Record<string, unknown> = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.priority !== undefined) updateData.priority = data.priority;
      if (data.requiresMoney !== undefined) updateData.requires_money = data.requiresMoney;
      if (data.estimatedCost !== undefined) updateData.estimated_cost = data.estimatedCost;
      if (data.steps !== undefined) updateData.steps = data.steps;

      const { error } = await supabase
        .from('objectives')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setObjectives((prev) =>
        prev.map((o) => (o.id === id ? { ...o, ...data } : o))
      );
      return true;
    } catch (error) {
      console.error('Error updating objective:', error);
      toast.error('Erro ao atualizar pendência');
      return false;
    }
  };

  const deleteObjective = async (id: string) => {
    try {
      const { error } = await supabase.from('objectives').delete().eq('id', id);
      if (error) throw error;
      setObjectives((prev) => prev.filter((o) => o.id !== id));
      toast.success('Pendência excluída com sucesso!');
      return true;
    } catch (error) {
      console.error('Error deleting objective:', error);
      toast.error('Erro ao excluir pendência');
      return false;
    }
  };

  const toggleStep = async (objectiveId: string, stepId: string) => {
    const objective = objectives.find((o) => o.id === objectiveId);
    if (!objective) return false;

    const updatedSteps = objective.steps.map((s) =>
      s.id === stepId ? { ...s, completed: !s.completed } : s
    );

    const allCompleted = updatedSteps.length > 0 && updatedSteps.every((s) => s.completed);
    const someCompleted = updatedSteps.some((s) => s.completed);
    const newStatus = allCompleted ? 'completed' : someCompleted ? 'in_progress' : 'pending';

    return updateObjective(objectiveId, { steps: updatedSteps, status: newStatus as Objective['status'] });
  };

  useEffect(() => {
    fetchObjectives();
  }, []);

  return {
    objectives,
    loading,
    addObjective,
    updateObjective,
    deleteObjective,
    toggleStep,
    refetch: fetchObjectives,
  };
}
