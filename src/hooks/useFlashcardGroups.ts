import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FlashcardGroup, FlashcardCard } from '@/types/flashcards';
import { Json } from '@/integrations/supabase/types';

export function useFlashcardGroups() {
  const [groups, setGroups] = useState<FlashcardGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('flashcard_groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped = (data || []).map((g) => ({
        id: g.id,
        name: g.name,
        cards: (g.cards as unknown as FlashcardCard[]) || [],
        createdAt: new Date(g.created_at || Date.now()),
        lastStudied: g.last_studied ? new Date(g.last_studied) : undefined,
      }));

      setGroups(mapped);
    } catch (error) {
      console.error('Error fetching flashcard groups:', error);
      toast.error('Erro ao carregar flashcards');
    } finally {
      setLoading(false);
    }
  };

  const addGroup = async (data: Omit<FlashcardGroup, 'id'>) => {
    try {
      const { data: newData, error } = await supabase
        .from('flashcard_groups')
        .insert([{
          name: data.name,
          cards: data.cards as unknown as Json,
          last_studied: data.lastStudied?.toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;

      const mapped: FlashcardGroup = {
        id: newData.id,
        name: newData.name,
        cards: (newData.cards as unknown as FlashcardCard[]) || [],
        createdAt: new Date(newData.created_at || Date.now()),
        lastStudied: newData.last_studied ? new Date(newData.last_studied) : undefined,
      };

      setGroups((prev) => [mapped, ...prev]);
      toast.success('Grupo de flashcards criado!');
      return mapped;
    } catch (error) {
      console.error('Error adding flashcard group:', error);
      toast.error('Erro ao criar grupo de flashcards');
      return null;
    }
  };

  const updateGroup = async (id: string, data: Partial<FlashcardGroup>) => {
    try {
      const updateData: Record<string, unknown> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.cards !== undefined) updateData.cards = data.cards;
      if (data.lastStudied !== undefined) updateData.last_studied = data.lastStudied.toISOString();

      const { error } = await supabase.from('flashcard_groups').update(updateData).eq('id', id);
      if (error) throw error;

      setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, ...data } : g)));
      return true;
    } catch (error) {
      console.error('Error updating flashcard group:', error);
      toast.error('Erro ao atualizar grupo de flashcards');
      return false;
    }
  };

  const deleteGroup = async (id: string) => {
    try {
      const { error } = await supabase.from('flashcard_groups').delete().eq('id', id);
      if (error) throw error;

      setGroups((prev) => prev.filter((g) => g.id !== id));
      toast.success('Grupo de flashcards excluído!');
      return true;
    } catch (error) {
      console.error('Error deleting flashcard group:', error);
      toast.error('Erro ao excluir grupo de flashcards');
      return false;
    }
  };

  const markAsStudied = async (id: string) => {
    return updateGroup(id, { lastStudied: new Date() });
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return {
    groups,
    loading,
    addGroup,
    updateGroup,
    deleteGroup,
    markAsStudied,
    refetch: fetchGroups,
  };
}
