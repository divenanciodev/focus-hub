import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BankLink {
  id: string;
  name: string;
  url: string;
  description?: string;
  imageUrl?: string;
  createdAt: Date;
  subfolderId?: string; // Optional - links can exist without a folder
}

export interface BankSubfolder {
  id: string;
  name: string;
  description?: string;
  folderId: string;
  createdAt: Date;
}

export interface BankFolder {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: Date;
}

export function useLinkBank() {
  const [folders, setFolders] = useState<BankFolder[]>([]);
  const [subfolders, setSubfolders] = useState<BankSubfolder[]>([]);
  const [links, setLinks] = useState<BankLink[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const [foldersRes, subfoldersRes, linksRes] = await Promise.all([
        supabase.from('link_folders').select('*').order('created_at', { ascending: false }),
        supabase.from('link_subfolders').select('*').order('created_at', { ascending: false }),
        supabase.from('links').select('*').order('created_at', { ascending: false }),
      ]);

      if (foldersRes.error) throw foldersRes.error;
      if (subfoldersRes.error) throw subfoldersRes.error;
      if (linksRes.error) throw linksRes.error;

      setFolders(
        (foldersRes.data || []).map((f) => ({
          id: f.id,
          name: f.name,
          description: f.description || undefined,
          color: f.color || undefined,
          createdAt: new Date(f.created_at || Date.now()),
        }))
      );

      setSubfolders(
        (subfoldersRes.data || []).map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description || undefined,
          folderId: s.folder_id || '',
          createdAt: new Date(s.created_at || Date.now()),
        }))
      );

      setLinks(
        (linksRes.data || []).map((l) => ({
          id: l.id,
          name: l.name,
          url: l.url,
          description: l.description || undefined,
          imageUrl: l.image_url || undefined,
          subfolderId: l.subfolder_id || undefined,
          createdAt: new Date(l.created_at || Date.now()),
        }))
      );
    } catch (error) {
      console.error('Error fetching link bank:', error);
      toast.error('Erro ao carregar banco de links');
    } finally {
      setLoading(false);
    }
  };

  // Folders
  const addFolder = async (data: Omit<BankFolder, 'id' | 'createdAt'>) => {
    try {
      const { data: newData, error } = await supabase
        .from('link_folders')
        .insert({
          name: data.name,
          description: data.description,
          color: data.color,
        })
        .select()
        .single();

      if (error) throw error;

      const mapped: BankFolder = {
        id: newData.id,
        name: newData.name,
        description: newData.description || undefined,
        color: newData.color || undefined,
        createdAt: new Date(newData.created_at || Date.now()),
      };

      setFolders((prev) => [mapped, ...prev]);
      toast.success('Pasta criada!');
      return mapped;
    } catch (error) {
      console.error('Error adding folder:', error);
      toast.error('Erro ao criar pasta');
      return null;
    }
  };

  const updateFolder = async (id: string, data: Partial<BankFolder>) => {
    try {
      const updateData: Record<string, unknown> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.color !== undefined) updateData.color = data.color;

      const { error } = await supabase.from('link_folders').update(updateData).eq('id', id);
      if (error) throw error;

      setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, ...data } : f)));
      return true;
    } catch (error) {
      console.error('Error updating folder:', error);
      toast.error('Erro ao atualizar pasta');
      return false;
    }
  };

  const deleteFolder = async (id: string) => {
    try {
      const { error } = await supabase.from('link_folders').delete().eq('id', id);
      if (error) throw error;

      setFolders((prev) => prev.filter((f) => f.id !== id));
      setSubfolders((prev) => prev.filter((s) => s.folderId !== id));
      toast.success('Pasta excluída!');
      return true;
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error('Erro ao excluir pasta');
      return false;
    }
  };

  // Subfolders
  const addSubfolder = async (data: Omit<BankSubfolder, 'id' | 'createdAt'>) => {
    try {
      const { data: newData, error } = await supabase
        .from('link_subfolders')
        .insert({
          name: data.name,
          description: data.description,
          folder_id: data.folderId,
        })
        .select()
        .single();

      if (error) throw error;

      const mapped: BankSubfolder = {
        id: newData.id,
        name: newData.name,
        description: newData.description || undefined,
        folderId: newData.folder_id || '',
        createdAt: new Date(newData.created_at || Date.now()),
      };

      setSubfolders((prev) => [mapped, ...prev]);
      toast.success('Subpasta criada!');
      return mapped;
    } catch (error) {
      console.error('Error adding subfolder:', error);
      toast.error('Erro ao criar subpasta');
      return null;
    }
  };

  const updateSubfolder = async (id: string, data: Partial<BankSubfolder>) => {
    try {
      const updateData: Record<string, unknown> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;

      const { error } = await supabase.from('link_subfolders').update(updateData).eq('id', id);
      if (error) throw error;

      setSubfolders((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
      return true;
    } catch (error) {
      console.error('Error updating subfolder:', error);
      toast.error('Erro ao atualizar subpasta');
      return false;
    }
  };

  const deleteSubfolder = async (id: string) => {
    try {
      const { error } = await supabase.from('link_subfolders').delete().eq('id', id);
      if (error) throw error;

      setSubfolders((prev) => prev.filter((s) => s.id !== id));
      setLinks((prev) => prev.filter((l) => l.subfolderId !== id));
      toast.success('Subpasta excluída!');
      return true;
    } catch (error) {
      console.error('Error deleting subfolder:', error);
      toast.error('Erro ao excluir subpasta');
      return false;
    }
  };

  // Links
  const addLink = async (data: Omit<BankLink, 'id' | 'createdAt'>) => {
    try {
      const { data: newData, error } = await supabase
        .from('links')
        .insert({
          name: data.name,
          url: data.url,
          description: data.description,
          image_url: data.imageUrl,
          subfolder_id: data.subfolderId || null,
        })
        .select()
        .single();

      if (error) throw error;

      const mapped: BankLink = {
        id: newData.id,
        name: newData.name,
        url: newData.url,
        description: newData.description || undefined,
        imageUrl: newData.image_url || undefined,
        subfolderId: newData.subfolder_id || undefined,
        createdAt: new Date(newData.created_at || Date.now()),
      };

      setLinks((prev) => [mapped, ...prev]);
      toast.success('Link adicionado!');
      return mapped;
    } catch (error) {
      console.error('Error adding link:', error);
      toast.error('Erro ao adicionar link');
      return null;
    }
  };

  const updateLink = async (id: string, data: Partial<BankLink>) => {
    try {
      const updateData: Record<string, unknown> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.url !== undefined) updateData.url = data.url;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.imageUrl !== undefined) updateData.image_url = data.imageUrl;
      if (data.subfolderId !== undefined) updateData.subfolder_id = data.subfolderId || null;

      const { error } = await supabase.from('links').update(updateData).eq('id', id);
      if (error) throw error;

      setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...data } : l)));
      return true;
    } catch (error) {
      console.error('Error updating link:', error);
      toast.error('Erro ao atualizar link');
      return false;
    }
  };

  const assignLinkToSubfolder = async (linkId: string, subfolderId: string | null) => {
    try {
      const { error } = await supabase
        .from('links')
        .update({ subfolder_id: subfolderId })
        .eq('id', linkId);
      
      if (error) throw error;

      setLinks((prev) => prev.map((l) => 
        l.id === linkId ? { ...l, subfolderId: subfolderId || undefined } : l
      ));
      toast.success(subfolderId ? 'Link atribuído à pasta!' : 'Link removido da pasta!');
      return true;
    } catch (error) {
      console.error('Error assigning link:', error);
      toast.error('Erro ao atribuir link');
      return false;
    }
  };

  const deleteLink = async (id: string) => {
    try {
      const { error } = await supabase.from('links').delete().eq('id', id);
      if (error) throw error;

      setLinks((prev) => prev.filter((l) => l.id !== id));
      toast.success('Link excluído!');
      return true;
    } catch (error) {
      console.error('Error deleting link:', error);
      toast.error('Erro ao excluir link');
      return false;
    }
  };

  // Helper functions
  const getSubfoldersByFolder = (folderId: string) => subfolders.filter((s) => s.folderId === folderId);
  const getLinksBySubfolder = (subfolderId: string) => links.filter((l) => l.subfolderId === subfolderId);
  const getUnassignedLinks = () => links.filter((l) => !l.subfolderId);

  useEffect(() => {
    fetchAll();
  }, []);

  return {
    folders,
    subfolders,
    links,
    loading,
    addFolder,
    updateFolder,
    deleteFolder,
    addSubfolder,
    updateSubfolder,
    deleteSubfolder,
    addLink,
    updateLink,
    deleteLink,
    assignLinkToSubfolder,
    getSubfoldersByFolder,
    getLinksBySubfolder,
    getUnassignedLinks,
    refetch: fetchAll,
  };
}
