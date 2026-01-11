import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type {
  Language,
  LanguageLevel,
  LanguageSection,
  LanguageStructure,
  LanguageContent,
  LanguageWithLevels,
  LanguageStructureWithContents,
  ContentType,
  StructureProgress,
} from '@/types/languages';

export function useLanguages() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLanguages = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('languages')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      toast.error('Erro ao carregar idiomas');
      console.error(error);
    } else {
      setLanguages(
        (data || []).map((l) => ({
          id: l.id,
          name: l.name,
          icon: l.icon || '🌐',
          category: l.category || undefined,
          objective: l.objective || undefined,
          color: l.color || '#000000',
          isActive: l.is_active ?? true,
          sortOrder: l.sort_order ?? 0,
          createdAt: new Date(l.created_at!),
          updatedAt: new Date(l.updated_at!),
        }))
      );
    }
    setLoading(false);
  }, []);

  const addLanguage = async (data: Omit<Language, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data: newLang, error } = await supabase
      .from('languages')
      .insert({
        name: data.name,
        icon: data.icon,
        category: data.category,
        objective: data.objective,
        color: data.color,
        is_active: data.isActive,
        sort_order: data.sortOrder,
      })
      .select()
      .single();

    if (error) {
      toast.error('Erro ao criar idioma');
      console.error(error);
      return null;
    }

    await fetchLanguages();
    toast.success('Idioma criado com sucesso!');
    return newLang;
  };

  const updateLanguage = async (id: string, data: Partial<Language>) => {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.objective !== undefined) updateData.objective = data.objective;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;
    if (data.sortOrder !== undefined) updateData.sort_order = data.sortOrder;

    const { error } = await supabase.from('languages').update(updateData).eq('id', id);

    if (error) {
      toast.error('Erro ao atualizar idioma');
      console.error(error);
      return false;
    }

    await fetchLanguages();
    toast.success('Idioma atualizado!');
    return true;
  };

  const deleteLanguage = async (id: string) => {
    const { error } = await supabase.from('languages').delete().eq('id', id);

    if (error) {
      toast.error('Erro ao excluir idioma');
      console.error(error);
      return false;
    }

    await fetchLanguages();
    toast.success('Idioma excluído!');
    return true;
  };

  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);

  return { languages, loading, addLanguage, updateLanguage, deleteLanguage, refetch: fetchLanguages };
}

// Hook for language levels
export function useLanguageLevels(languageId: string | null) {
  const [levels, setLevels] = useState<LanguageLevel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLevels = useCallback(async () => {
    if (!languageId) {
      setLevels([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('language_levels')
      .select('*')
      .eq('language_id', languageId)
      .order('sort_order', { ascending: true });

    if (error) {
      toast.error('Erro ao carregar níveis');
      console.error(error);
    } else {
      setLevels(
        (data || []).map((l) => ({
          id: l.id,
          languageId: l.language_id,
          name: l.name,
          sortOrder: l.sort_order ?? 0,
          createdAt: new Date(l.created_at!),
          updatedAt: new Date(l.updated_at!),
        }))
      );
    }
    setLoading(false);
  }, [languageId]);

  const addLevel = async (name: string) => {
    if (!languageId) return null;

    const maxOrder = levels.length > 0 ? Math.max(...levels.map((l) => l.sortOrder)) + 1 : 0;

    const { data, error } = await supabase
      .from('language_levels')
      .insert({ language_id: languageId, name, sort_order: maxOrder })
      .select()
      .single();

    if (error) {
      toast.error('Erro ao criar nível');
      console.error(error);
      return null;
    }

    await fetchLevels();
    toast.success('Nível criado!');
    return data;
  };

  const updateLevel = async (id: string, name: string) => {
    const { error } = await supabase.from('language_levels').update({ name }).eq('id', id);

    if (error) {
      toast.error('Erro ao atualizar nível');
      return false;
    }

    await fetchLevels();
    return true;
  };

  const deleteLevel = async (id: string) => {
    const { error } = await supabase.from('language_levels').delete().eq('id', id);

    if (error) {
      toast.error('Erro ao excluir nível');
      return false;
    }

    await fetchLevels();
    toast.success('Nível excluído!');
    return true;
  };

  useEffect(() => {
    fetchLevels();
  }, [fetchLevels]);

  return { levels, loading, addLevel, updateLevel, deleteLevel, refetch: fetchLevels };
}

// Hook for sections
export function useLanguageSections(levelId: string | null) {
  const [sections, setSections] = useState<LanguageSection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSections = useCallback(async () => {
    if (!levelId) {
      setSections([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('language_sections')
      .select('*')
      .eq('level_id', levelId)
      .order('sort_order', { ascending: true });

    if (error) {
      toast.error('Erro ao carregar seções');
    } else {
      setSections(
        (data || []).map((s) => ({
          id: s.id,
          levelId: s.level_id,
          name: s.name,
          description: s.description || undefined,
          sortOrder: s.sort_order ?? 0,
          createdAt: new Date(s.created_at!),
          updatedAt: new Date(s.updated_at!),
        }))
      );
    }
    setLoading(false);
  }, [levelId]);

  const addSection = async (name: string, description?: string) => {
    if (!levelId) return null;

    const maxOrder = sections.length > 0 ? Math.max(...sections.map((s) => s.sortOrder)) + 1 : 0;

    const { data, error } = await supabase
      .from('language_sections')
      .insert({ level_id: levelId, name, description, sort_order: maxOrder })
      .select()
      .single();

    if (error) {
      toast.error('Erro ao criar seção');
      return null;
    }

    await fetchSections();
    toast.success('Seção criada!');
    return data;
  };

  const updateSection = async (id: string, data: { name?: string; description?: string }) => {
    const { error } = await supabase.from('language_sections').update(data).eq('id', id);

    if (error) {
      toast.error('Erro ao atualizar seção');
      return false;
    }

    await fetchSections();
    return true;
  };

  const deleteSection = async (id: string) => {
    const { error } = await supabase.from('language_sections').delete().eq('id', id);

    if (error) {
      toast.error('Erro ao excluir seção');
      return false;
    }

    await fetchSections();
    toast.success('Seção excluída!');
    return true;
  };

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  return { sections, loading, addSection, updateSection, deleteSection, refetch: fetchSections };
}

// Hook for structures (lessons)
export function useLanguageStructures(sectionId: string | null) {
  const [structures, setStructures] = useState<LanguageStructure[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStructures = useCallback(async () => {
    if (!sectionId) {
      setStructures([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('language_structures')
      .select('*')
      .eq('section_id', sectionId)
      .order('sort_order', { ascending: true });

    if (error) {
      toast.error('Erro ao carregar estruturas');
    } else {
      setStructures(
        (data || []).map((s) => ({
          id: s.id,
          sectionId: s.section_id,
          name: s.name,
          audioUrl: s.audio_url || undefined,
          progress: (s.progress as StructureProgress) || 'not_started',
          sortOrder: s.sort_order ?? 0,
          createdAt: new Date(s.created_at!),
          updatedAt: new Date(s.updated_at!),
        }))
      );
    }
    setLoading(false);
  }, [sectionId]);

  const addStructure = async (name: string) => {
    if (!sectionId) return null;

    const maxOrder = structures.length > 0 ? Math.max(...structures.map((s) => s.sortOrder)) + 1 : 0;

    const { data, error } = await supabase
      .from('language_structures')
      .insert({ section_id: sectionId, name, sort_order: maxOrder })
      .select()
      .single();

    if (error) {
      toast.error('Erro ao criar estrutura');
      return null;
    }

    await fetchStructures();
    toast.success('Estrutura criada!');
    return data;
  };

  const updateStructure = async (id: string, data: Partial<LanguageStructure>) => {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.audioUrl !== undefined) updateData.audio_url = data.audioUrl;
    if (data.progress !== undefined) updateData.progress = data.progress;

    const { error } = await supabase.from('language_structures').update(updateData).eq('id', id);

    if (error) {
      toast.error('Erro ao atualizar estrutura');
      return false;
    }

    await fetchStructures();
    return true;
  };

  const deleteStructure = async (id: string) => {
    const { error } = await supabase.from('language_structures').delete().eq('id', id);

    if (error) {
      toast.error('Erro ao excluir estrutura');
      return false;
    }

    await fetchStructures();
    toast.success('Estrutura excluída!');
    return true;
  };

  useEffect(() => {
    fetchStructures();
  }, [fetchStructures]);

  return { structures, loading, addStructure, updateStructure, deleteStructure, refetch: fetchStructures };
}

// Hook for contents
export function useLanguageContents(structureId: string | null) {
  const [contents, setContents] = useState<LanguageContent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContents = useCallback(async () => {
    if (!structureId) {
      setContents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('language_contents')
      .select('*')
      .eq('structure_id', structureId)
      .order('sort_order', { ascending: true });

    if (error) {
      toast.error('Erro ao carregar conteúdos');
    } else {
      setContents(
        (data || []).map((c) => ({
          id: c.id,
          structureId: c.structure_id,
          contentType: c.content_type as ContentType,
          content: c.content,
          sortOrder: c.sort_order ?? 0,
          createdAt: new Date(c.created_at!),
          updatedAt: new Date(c.updated_at!),
        }))
      );
    }
    setLoading(false);
  }, [structureId]);

  const addContent = async (contentType: ContentType, content: string) => {
    if (!structureId) return null;

    const maxOrder = contents.length > 0 ? Math.max(...contents.map((c) => c.sortOrder)) + 1 : 0;

    const { data, error } = await supabase
      .from('language_contents')
      .insert({ structure_id: structureId, content_type: contentType, content, sort_order: maxOrder })
      .select()
      .single();

    if (error) {
      toast.error('Erro ao criar conteúdo');
      return null;
    }

    await fetchContents();
    toast.success('Conteúdo adicionado!');
    return data;
  };

  const updateContent = async (id: string, data: { content?: string; contentType?: ContentType }) => {
    const updateData: Record<string, unknown> = {};
    if (data.content !== undefined) updateData.content = data.content;
    if (data.contentType !== undefined) updateData.content_type = data.contentType;

    const { error } = await supabase.from('language_contents').update(updateData).eq('id', id);

    if (error) {
      toast.error('Erro ao atualizar conteúdo');
      return false;
    }

    await fetchContents();
    return true;
  };

  const deleteContent = async (id: string) => {
    const { error } = await supabase.from('language_contents').delete().eq('id', id);

    if (error) {
      toast.error('Erro ao excluir conteúdo');
      return false;
    }

    await fetchContents();
    toast.success('Conteúdo excluído!');
    return true;
  };

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  return { contents, loading, addContent, updateContent, deleteContent, refetch: fetchContents };
}

// Fetch full structure with contents
export async function fetchStructureWithContents(structureId: string): Promise<LanguageStructureWithContents | null> {
  const { data: structure, error: structureError } = await supabase
    .from('language_structures')
    .select('*')
    .eq('id', structureId)
    .single();

  if (structureError || !structure) return null;

  const { data: contents } = await supabase
    .from('language_contents')
    .select('*')
    .eq('structure_id', structureId)
    .order('sort_order', { ascending: true });

  return {
    id: structure.id,
    sectionId: structure.section_id,
    name: structure.name,
    audioUrl: structure.audio_url || undefined,
    progress: (structure.progress as StructureProgress) || 'not_started',
    sortOrder: structure.sort_order ?? 0,
    createdAt: new Date(structure.created_at!),
    updatedAt: new Date(structure.updated_at!),
    contents: (contents || []).map((c) => ({
      id: c.id,
      structureId: c.structure_id,
      contentType: c.content_type as ContentType,
      content: c.content,
      sortOrder: c.sort_order ?? 0,
      createdAt: new Date(c.created_at!),
      updatedAt: new Date(c.updated_at!),
    })),
  };
}
