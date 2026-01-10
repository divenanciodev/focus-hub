import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Contest, ContestMateria } from '@/types/contests';

export type { Contest, ContestMateria, ContestTopic } from '@/types/contests';

export function useContests() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContests = async () => {
    try {
      const { data, error } = await supabase
        .from('contests')
        .select('*')
        .order('exam_date', { ascending: true });

      if (error) throw error;

      const mapped = (data || []).map((c) => ({
        id: c.id,
        name: c.name,
        position: c.position || '',
        institution: c.institution || '',
        examDate: c.exam_date ? new Date(c.exam_date) : null,
        status: (c.status as Contest['status']) || 'active',
        progress: 0,
        bancaUrl: c.banca_url || undefined,
        editalUrl: c.edital_url || undefined,
        isPreparingOnly: c.is_preparing_only || false,
        situacao: c.situacao || undefined,
        cargos: c.cargos || undefined,
        escolaridade: c.escolaridade || undefined,
        carreiras: c.carreiras || undefined,
        lotacao: c.lotacao || undefined,
        vagas: c.vagas || undefined,
        remuneracao: c.remuneracao || undefined,
        inscricoesPeriodo: c.inscricoes_periodo || undefined,
        taxaInscricao: c.taxa_inscricao || undefined,
        materias: (c.materias as unknown as ContestMateria[]) || [],
      }));

      setContests(mapped);
    } catch (error) {
      console.error('Error fetching contests:', error);
      toast.error('Erro ao carregar concursos');
    } finally {
      setLoading(false);
    }
  };

  const addContest = async (data: Omit<Contest, 'id' | 'progress'>) => {
    try {
      const insertData = {
        name: data.name,
        position: data.position,
        institution: data.institution,
        exam_date: data.examDate?.toISOString() || null,
        status: data.status,
        banca_url: data.bancaUrl || null,
        edital_url: data.editalUrl || null,
        is_preparing_only: data.isPreparingOnly,
        situacao: data.situacao || null,
        cargos: data.cargos || null,
        escolaridade: data.escolaridade || null,
        carreiras: data.carreiras || null,
        lotacao: data.lotacao || null,
        vagas: data.vagas || null,
        remuneracao: data.remuneracao || null,
        inscricoes_periodo: data.inscricoesPeriodo || null,
        taxa_inscricao: data.taxaInscricao || null,
        materias: JSON.parse(JSON.stringify(data.materias || [])),
      };

      const { data: newData, error } = await supabase
        .from('contests')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      const mapped: Contest = {
        id: newData.id,
        name: newData.name,
        position: newData.position || '',
        institution: newData.institution || '',
        examDate: newData.exam_date ? new Date(newData.exam_date) : null,
        status: (newData.status as Contest['status']) || 'active',
        progress: 0,
        bancaUrl: newData.banca_url || undefined,
        editalUrl: newData.edital_url || undefined,
        isPreparingOnly: newData.is_preparing_only || false,
        situacao: newData.situacao || undefined,
        cargos: newData.cargos || undefined,
        escolaridade: newData.escolaridade || undefined,
        carreiras: newData.carreiras || undefined,
        lotacao: newData.lotacao || undefined,
        vagas: newData.vagas || undefined,
        remuneracao: newData.remuneracao || undefined,
        inscricoesPeriodo: newData.inscricoes_periodo || undefined,
        taxaInscricao: newData.taxa_inscricao || undefined,
        materias: (newData.materias as unknown as ContestMateria[]) || [],
      };

      setContests((prev) => [mapped, ...prev]);
      toast.success('Concurso criado!');
      return mapped;
    } catch (error) {
      console.error('Error adding contest:', error);
      toast.error('Erro ao criar concurso');
      return null;
    }
  };

  const updateContest = async (id: string, data: Partial<Contest>) => {
    try {
      const updateData: Record<string, unknown> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.position !== undefined) updateData.position = data.position;
      if (data.institution !== undefined) updateData.institution = data.institution;
      if (data.examDate !== undefined) updateData.exam_date = data.examDate?.toISOString() || null;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.bancaUrl !== undefined) updateData.banca_url = data.bancaUrl || null;
      if (data.editalUrl !== undefined) updateData.edital_url = data.editalUrl || null;
      if (data.isPreparingOnly !== undefined) updateData.is_preparing_only = data.isPreparingOnly;
      if (data.situacao !== undefined) updateData.situacao = data.situacao || null;
      if (data.cargos !== undefined) updateData.cargos = data.cargos || null;
      if (data.escolaridade !== undefined) updateData.escolaridade = data.escolaridade || null;
      if (data.carreiras !== undefined) updateData.carreiras = data.carreiras || null;
      if (data.lotacao !== undefined) updateData.lotacao = data.lotacao || null;
      if (data.vagas !== undefined) updateData.vagas = data.vagas || null;
      if (data.remuneracao !== undefined) updateData.remuneracao = data.remuneracao || null;
      if (data.inscricoesPeriodo !== undefined) updateData.inscricoes_periodo = data.inscricoesPeriodo || null;
      if (data.taxaInscricao !== undefined) updateData.taxa_inscricao = data.taxaInscricao || null;
      if (data.materias !== undefined) updateData.materias = data.materias;

      const { error } = await supabase.from('contests').update(updateData).eq('id', id);
      if (error) throw error;

      setContests((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
      toast.success('Concurso atualizado!');
      return true;
    } catch (error) {
      console.error('Error updating contest:', error);
      toast.error('Erro ao atualizar concurso');
      return false;
    }
  };

  const deleteContest = async (id: string) => {
    try {
      const { error } = await supabase.from('contests').delete().eq('id', id);
      if (error) throw error;

      setContests((prev) => prev.filter((c) => c.id !== id));
      toast.success('Concurso excluído!');
      return true;
    } catch (error) {
      console.error('Error deleting contest:', error);
      toast.error('Erro ao excluir concurso');
      return false;
    }
  };

  useEffect(() => {
    fetchContests();
  }, []);

  return {
    contests,
    loading,
    addContest,
    updateContest,
    deleteContest,
    refetch: fetchContests,
  };
}
