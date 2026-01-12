import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { 
  Language, 
  VocabularySet, 
  VocabularyWord, 
  GrammarStructure,
  PracticeSession,
  GrammaticalClass 
} from '@/types/languages';

// Hook for managing languages
export function useLanguages() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLanguages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('languages')
        .select('*')
        .order('sort_order');
      
      if (error) throw error;
      
      setLanguages(data?.map(lang => ({
        id: lang.id,
        name: lang.name,
        icon: lang.icon || '🌐',
        color: lang.color || '#3b82f6',
        category: lang.category || undefined,
        objective: lang.objective || undefined,
        isActive: lang.is_active || true,
        sortOrder: lang.sort_order || 0,
        createdAt: new Date(lang.created_at || Date.now()),
        updatedAt: new Date(lang.updated_at || Date.now()),
      })) || []);
    } catch (error) {
      console.error('Error fetching languages:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os idiomas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);

  const addLanguage = async (data: Partial<Language>) => {
    try {
      const { error } = await supabase.from('languages').insert({
        name: data.name,
        icon: data.icon,
        color: data.color,
        category: data.category,
        objective: data.objective,
        is_active: true,
      });
      
      if (error) throw error;
      
      toast({ title: 'Sucesso', description: 'Idioma adicionado' });
      fetchLanguages();
    } catch (error) {
      console.error('Error adding language:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o idioma',
        variant: 'destructive',
      });
    }
  };

  return { languages, loading, addLanguage, refetch: fetchLanguages };
}

// Hook for managing vocabulary sets
export function useVocabularySets(languageId: string | null) {
  const [sets, setSets] = useState<VocabularySet[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSets = useCallback(async () => {
    if (!languageId) {
      setSets([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('vocabulary_sets')
        .select('*')
        .eq('language_id', languageId)
        .order('sort_order');
      
      if (error) throw error;
      
      setSets(data?.map(set => ({
        id: set.id,
        languageId: set.language_id,
        name: set.name,
        setType: set.set_type as 'grammatical_class' | 'thematic_set',
        grammaticalClass: set.grammatical_class as GrammaticalClass | undefined,
        description: set.description || undefined,
        color: set.color || '#6366f1',
        icon: set.icon || '📚',
        sortOrder: set.sort_order || 0,
        createdAt: new Date(set.created_at || Date.now()),
        updatedAt: new Date(set.updated_at || Date.now()),
      })) || []);
    } catch (error) {
      console.error('Error fetching vocabulary sets:', error);
    } finally {
      setLoading(false);
    }
  }, [languageId]);

  useEffect(() => {
    fetchSets();
  }, [fetchSets]);

  const addSet = async (data: Partial<VocabularySet>) => {
    if (!languageId) return;

    try {
      const { error } = await supabase.from('vocabulary_sets').insert({
        language_id: languageId,
        name: data.name,
        set_type: data.setType,
        grammatical_class: data.grammaticalClass,
        description: data.description,
        color: data.color,
        icon: data.icon,
      });
      
      if (error) throw error;
      
      toast({ title: 'Sucesso', description: 'Conjunto criado' });
      fetchSets();
    } catch (error) {
      console.error('Error adding vocabulary set:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o conjunto',
        variant: 'destructive',
      });
    }
  };

  const deleteSet = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vocabulary_sets')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({ title: 'Sucesso', description: 'Conjunto excluído' });
      fetchSets();
    } catch (error) {
      console.error('Error deleting vocabulary set:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o conjunto',
        variant: 'destructive',
      });
    }
  };

  return { sets, loading, addSet, deleteSet, refetch: fetchSets };
}

// Hook for managing vocabulary words
export function useVocabularyWords(setId: string | null) {
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWords = useCallback(async () => {
    if (!setId) {
      setWords([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('vocabulary_words')
        .select('*')
        .eq('set_id', setId)
        .order('sort_order');
      
      if (error) throw error;
      
      setWords(data?.map(word => ({
        id: word.id,
        setId: word.set_id,
        word: word.word,
        translation: word.translation || undefined,
        example: word.example || undefined,
        imageUrl: word.image_url || undefined,
        audioUrl: word.audio_url || undefined,
        difficulty: word.difficulty as 'easy' | 'medium' | 'hard',
        masteryLevel: word.mastery_level || 0,
        sortOrder: word.sort_order || 0,
        createdAt: new Date(word.created_at || Date.now()),
        updatedAt: new Date(word.updated_at || Date.now()),
      })) || []);
    } catch (error) {
      console.error('Error fetching words:', error);
    } finally {
      setLoading(false);
    }
  }, [setId]);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  const addWord = async (data: Partial<VocabularyWord>) => {
    if (!setId) return;

    try {
      const { error } = await supabase.from('vocabulary_words').insert({
        set_id: setId,
        word: data.word,
        translation: data.translation,
        example: data.example,
        image_url: data.imageUrl,
        difficulty: data.difficulty || 'medium',
      });
      
      if (error) throw error;
      
      toast({ title: 'Sucesso', description: 'Palavra adicionada' });
      fetchWords();
    } catch (error) {
      console.error('Error adding word:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar a palavra',
        variant: 'destructive',
      });
    }
  };

  const updateWord = async (id: string, data: Partial<VocabularyWord>) => {
    try {
      const { error } = await supabase
        .from('vocabulary_words')
        .update({
          word: data.word,
          translation: data.translation,
          example: data.example,
          image_url: data.imageUrl,
          difficulty: data.difficulty,
        })
        .eq('id', id);
      
      if (error) throw error;
      
      fetchWords();
    } catch (error) {
      console.error('Error updating word:', error);
    }
  };

  const deleteWord = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vocabulary_words')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({ title: 'Sucesso', description: 'Palavra excluída' });
      fetchWords();
    } catch (error) {
      console.error('Error deleting word:', error);
    }
  };

  return { words, loading, addWord, updateWord, deleteWord, refetch: fetchWords };
}

// Hook for managing grammar structures
export function useGrammarStructures(languageId: string | null) {
  const [structures, setStructures] = useState<GrammarStructure[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStructures = useCallback(async () => {
    if (!languageId) {
      setStructures([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('grammar_structures')
        .select('*')
        .eq('language_id', languageId)
        .order('sort_order');
      
      if (error) throw error;
      
      setStructures(data?.map(s => ({
        id: s.id,
        languageId: s.language_id,
        fixedText: s.fixed_text,
        expectedInput: s.expected_input as any,
        allowedClasses: s.allowed_classes || [],
        examples: s.examples || [],
        grammarTip: s.grammar_tip || undefined,
        translation: s.translation || undefined,
        difficulty: s.difficulty as 'easy' | 'medium' | 'hard',
        category: s.category || undefined,
        masteryLevel: s.mastery_level || 0,
        sortOrder: s.sort_order || 0,
        createdAt: new Date(s.created_at || Date.now()),
        updatedAt: new Date(s.updated_at || Date.now()),
      })) || []);
    } catch (error) {
      console.error('Error fetching structures:', error);
    } finally {
      setLoading(false);
    }
  }, [languageId]);

  useEffect(() => {
    fetchStructures();
  }, [fetchStructures]);

  const addStructure = async (data: Partial<GrammarStructure>) => {
    if (!languageId) return;

    try {
      const { error } = await supabase.from('grammar_structures').insert({
        language_id: languageId,
        fixed_text: data.fixedText,
        expected_input: data.expectedInput,
        allowed_classes: data.allowedClasses,
        examples: data.examples,
        grammar_tip: data.grammarTip,
        translation: data.translation,
        difficulty: data.difficulty || 'medium',
        category: data.category,
      });
      
      if (error) throw error;
      
      toast({ title: 'Sucesso', description: 'Estrutura criada' });
      fetchStructures();
    } catch (error) {
      console.error('Error adding structure:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a estrutura',
        variant: 'destructive',
      });
    }
  };

  const updateStructure = async (id: string, data: Partial<GrammarStructure>) => {
    try {
      const { error } = await supabase
        .from('grammar_structures')
        .update({
          fixed_text: data.fixedText,
          expected_input: data.expectedInput,
          allowed_classes: data.allowedClasses,
          examples: data.examples,
          grammar_tip: data.grammarTip,
          translation: data.translation,
          difficulty: data.difficulty,
          category: data.category,
        })
        .eq('id', id);
      
      if (error) throw error;
      
      fetchStructures();
    } catch (error) {
      console.error('Error updating structure:', error);
    }
  };

  const deleteStructure = async (id: string) => {
    try {
      const { error } = await supabase
        .from('grammar_structures')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({ title: 'Sucesso', description: 'Estrutura excluída' });
      fetchStructures();
    } catch (error) {
      console.error('Error deleting structure:', error);
    }
  };

  return { structures, loading, addStructure, updateStructure, deleteStructure, refetch: fetchStructures };
}

// Hook for fetching all words for a language (for practice validation)
export function useLanguageAllWords(languageId: string | null) {
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllWords = useCallback(async () => {
    if (!languageId) {
      setWords([]);
      setLoading(false);
      return;
    }

    try {
      // First get all sets for the language
      const { data: setsData, error: setsError } = await supabase
        .from('vocabulary_sets')
        .select('id')
        .eq('language_id', languageId);
      
      if (setsError) throw setsError;
      
      if (!setsData || setsData.length === 0) {
        setWords([]);
        setLoading(false);
        return;
      }

      const setIds = setsData.map(s => s.id);
      
      // Then get all words from those sets
      const { data: wordsData, error: wordsError } = await supabase
        .from('vocabulary_words')
        .select('*')
        .in('set_id', setIds);
      
      if (wordsError) throw wordsError;
      
      setWords(wordsData?.map(word => ({
        id: word.id,
        setId: word.set_id,
        word: word.word,
        translation: word.translation || undefined,
        example: word.example || undefined,
        imageUrl: word.image_url || undefined,
        audioUrl: word.audio_url || undefined,
        difficulty: word.difficulty as 'easy' | 'medium' | 'hard',
        masteryLevel: word.mastery_level || 0,
        sortOrder: word.sort_order || 0,
        createdAt: new Date(word.created_at || Date.now()),
        updatedAt: new Date(word.updated_at || Date.now()),
      })) || []);
    } catch (error) {
      console.error('Error fetching all words:', error);
    } finally {
      setLoading(false);
    }
  }, [languageId]);

  useEffect(() => {
    fetchAllWords();
  }, [fetchAllWords]);

  return { words, loading, refetch: fetchAllWords };
}

// Hook for recording practice sessions
export function usePracticeSessions(languageId: string | null) {
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    if (!languageId) {
      setSessions([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('language_practice_sessions')
        .select('*')
        .eq('language_id', languageId)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      setSessions(data?.map(s => ({
        id: s.id,
        languageId: s.language_id,
        practiceType: s.practice_type as 'vocabulary' | 'structures' | 'mixed',
        exerciseType: s.exercise_type || undefined,
        totalQuestions: s.total_questions || 0,
        correctAnswers: s.correct_answers || 0,
        timeSpentSeconds: s.time_spent_seconds || 0,
        completedAt: s.completed_at ? new Date(s.completed_at) : undefined,
        createdAt: new Date(s.created_at || Date.now()),
      })) || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  }, [languageId]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const recordSession = async (data: Omit<PracticeSession, 'id' | 'createdAt'>) => {
    try {
      const { error } = await supabase.from('language_practice_sessions').insert({
        language_id: data.languageId,
        practice_type: data.practiceType,
        exercise_type: data.exerciseType,
        total_questions: data.totalQuestions,
        correct_answers: data.correctAnswers,
        time_spent_seconds: data.timeSpentSeconds,
        completed_at: data.completedAt?.toISOString(),
      });
      
      if (error) throw error;
      
      fetchSessions();
    } catch (error) {
      console.error('Error recording session:', error);
    }
  };

  return { sessions, loading, recordSession, refetch: fetchSessions };
}
