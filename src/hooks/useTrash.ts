import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TrashItem {
  id: string;
  type: 'link' | 'subfolder' | 'folder' | 'discipline' | 'objective' | 'flashcard_group' | 'course' | 'contest' | 'habit' | 'schedule' | 'simulado' | 'language';
  name: string;
  deletedAt: Date;
  metadata?: Record<string, unknown>;
}

const TABLE_MAP: Record<TrashItem['type'], string> = {
  link: 'links',
  subfolder: 'link_subfolders',
  folder: 'link_folders',
  discipline: 'disciplines',
  objective: 'objectives',
  flashcard_group: 'flashcard_groups',
  course: 'courses',
  contest: 'contests',
  habit: 'habits',
  schedule: 'schedules',
  simulado: 'simulados',
  language: 'languages',
};

const TYPE_LABELS: Record<TrashItem['type'], string> = {
  link: 'Link',
  subfolder: 'Subpasta',
  folder: 'Pasta',
  discipline: 'Disciplina',
  objective: 'Objetivo',
  flashcard_group: 'Grupo de Flashcards',
  course: 'Curso',
  contest: 'Concurso',
  habit: 'Hábito',
  schedule: 'Cronograma',
  simulado: 'Simulado',
  language: 'Idioma',
};

export function useTrash() {
  const [items, setItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrashItems = useCallback(async () => {
    setLoading(true);
    try {
      const results: TrashItem[] = [];

      // Fetch deleted items from each table using raw SQL via RPC or direct queries
      const tables: { type: TrashItem['type']; nameField: string; tableName: string }[] = [
        { type: 'link', nameField: 'name', tableName: 'links' },
        { type: 'subfolder', nameField: 'name', tableName: 'link_subfolders' },
        { type: 'folder', nameField: 'name', tableName: 'link_folders' },
        { type: 'discipline', nameField: 'name', tableName: 'disciplines' },
        { type: 'objective', nameField: 'title', tableName: 'objectives' },
        { type: 'flashcard_group', nameField: 'name', tableName: 'flashcard_groups' },
        { type: 'course', nameField: 'name', tableName: 'courses' },
        { type: 'contest', nameField: 'name', tableName: 'contests' },
        { type: 'habit', nameField: 'name', tableName: 'habits' },
        { type: 'schedule', nameField: 'name', tableName: 'schedules' },
        { type: 'simulado', nameField: 'name', tableName: 'simulados' },
        { type: 'language', nameField: 'name', tableName: 'languages' },
      ];

      await Promise.all(
        tables.map(async ({ type, nameField, tableName }) => {
          // Use type assertion to bypass strict type checking for dynamic table names
          const { data, error } = await (supabase
            .from(tableName as 'links')
            .select('*')
            .not('deleted_at', 'is', null)
            .order('deleted_at', { ascending: false }) as unknown as Promise<{ data: Record<string, unknown>[] | null; error: Error | null }>);

          if (error) {
            console.error(`Error fetching deleted ${type}s:`, error);
            return;
          }

          if (data) {
            data.forEach((item: Record<string, unknown>) => {
              results.push({
                id: item.id as string,
                type,
                name: (item[nameField] as string) || 'Sem nome',
                deletedAt: new Date(item.deleted_at as string),
                metadata: item,
              });
            });
          }
        })
      );

      // Sort by deletion date (most recent first)
      results.sort((a, b) => b.deletedAt.getTime() - a.deletedAt.getTime());
      setItems(results);
    } catch (error) {
      console.error('Error fetching trash items:', error);
      toast.error('Erro ao carregar lixeira');
    } finally {
      setLoading(false);
    }
  }, []);

  const restoreItem = async (item: TrashItem) => {
    try {
      const tableName = TABLE_MAP[item.type];
      // Use type assertion to bypass strict type checking
      const { error } = await (supabase
        .from(tableName as 'links')
        .update({ deleted_at: null } as Record<string, unknown>)
        .eq('id', item.id) as unknown as Promise<{ error: Error | null }>);

      if (error) throw error;

      setItems((prev) => prev.filter((i) => i.id !== item.id));
      toast.success(`${TYPE_LABELS[item.type]} restaurado(a)!`);
      return true;
    } catch (error) {
      console.error('Error restoring item:', error);
      toast.error('Erro ao restaurar item');
      return false;
    }
  };

  const permanentlyDeleteItem = async (item: TrashItem) => {
    try {
      const tableName = TABLE_MAP[item.type];
      // Use type assertion to bypass strict type checking
      const { error } = await (supabase
        .from(tableName as 'links')
        .delete()
        .eq('id', item.id) as unknown as Promise<{ error: Error | null }>);

      if (error) throw error;

      setItems((prev) => prev.filter((i) => i.id !== item.id));
      toast.success(`${TYPE_LABELS[item.type]} excluído(a) permanentemente!`);
      return true;
    } catch (error) {
      console.error('Error permanently deleting item:', error);
      toast.error('Erro ao excluir item permanentemente');
      return false;
    }
  };

  const emptyTrash = async () => {
    try {
      // Group items by type for batch deletion
      const itemsByType = items.reduce((acc, item) => {
        if (!acc[item.type]) acc[item.type] = [];
        acc[item.type].push(item.id);
        return acc;
      }, {} as Record<TrashItem['type'], string[]>);

      await Promise.all(
        Object.entries(itemsByType).map(async ([type, ids]) => {
          const tableName = TABLE_MAP[type as TrashItem['type']];
          // Use type assertion to bypass strict type checking
          const { error } = await (supabase
            .from(tableName as 'links')
            .delete()
            .in('id', ids) as unknown as Promise<{ error: Error | null }>);
          if (error) throw error;
        })
      );

      setItems([]);
      toast.success('Lixeira esvaziada!');
      return true;
    } catch (error) {
      console.error('Error emptying trash:', error);
      toast.error('Erro ao esvaziar lixeira');
      return false;
    }
  };

  const getTypeLabel = (type: TrashItem['type']) => TYPE_LABELS[type];

  useEffect(() => {
    fetchTrashItems();
  }, [fetchTrashItems]);

  return {
    items,
    loading,
    restoreItem,
    permanentlyDeleteItem,
    emptyTrash,
    refetch: fetchTrashItems,
    getTypeLabel,
  };
}
