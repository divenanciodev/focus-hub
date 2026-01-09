import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FinancialEntry {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  date: Date;
  category: string;
}

export interface PiggyBank {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  color?: string;
}

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  dueDay: number;
  category: string;
  notificationsEnabled: boolean;
}

export function useFinancial() {
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [piggyBanks, setPiggyBanks] = useState<PiggyBank[]>([]);
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const [entriesRes, piggyRes, fixedRes] = await Promise.all([
        supabase.from('financial_entries').select('*').order('date', { ascending: false }),
        supabase.from('piggy_banks').select('*').order('created_at', { ascending: false }),
        supabase.from('fixed_expenses').select('*').order('created_at', { ascending: false }),
      ]);

      if (entriesRes.error) throw entriesRes.error;
      if (piggyRes.error) throw piggyRes.error;
      if (fixedRes.error) throw fixedRes.error;

      setEntries(
        (entriesRes.data || []).map((e) => ({
          id: e.id,
          type: e.type as 'income' | 'expense',
          description: e.description,
          amount: Number(e.amount),
          date: new Date(e.date || Date.now()),
          category: e.category || '',
        }))
      );

      setPiggyBanks(
        (piggyRes.data || []).map((p) => ({
          id: p.id,
          name: p.name,
          targetAmount: Number(p.target_amount),
          currentAmount: Number(p.current_amount) || 0,
          color: p.color || undefined,
        }))
      );

      setFixedExpenses(
        (fixedRes.data || []).map((f) => ({
          id: f.id,
          name: f.name,
          amount: Number(f.amount),
          dueDay: f.due_day || 1,
          category: f.category || '',
          notificationsEnabled: f.notifications_enabled ?? true,
        }))
      );
    } catch (error) {
      console.error('Error fetching financial data:', error);
      toast.error('Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  };

  // Entries
  const addEntry = async (data: Omit<FinancialEntry, 'id'>) => {
    try {
      const { data: newData, error } = await supabase
        .from('financial_entries')
        .insert({
          type: data.type,
          description: data.description,
          amount: data.amount,
          date: data.date.toISOString(),
          category: data.category,
        })
        .select()
        .single();

      if (error) throw error;

      const mapped: FinancialEntry = {
        id: newData.id,
        type: newData.type as 'income' | 'expense',
        description: newData.description,
        amount: Number(newData.amount),
        date: new Date(newData.date || Date.now()),
        category: newData.category || '',
      };

      setEntries((prev) => [mapped, ...prev]);
      return mapped;
    } catch (error) {
      console.error('Error adding entry:', error);
      toast.error('Erro ao adicionar entrada');
      return null;
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const { error } = await supabase.from('financial_entries').delete().eq('id', id);
      if (error) throw error;
      setEntries((prev) => prev.filter((e) => e.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Erro ao excluir entrada');
      return false;
    }
  };

  // Piggy Banks
  const addPiggyBank = async (data: Omit<PiggyBank, 'id'>) => {
    try {
      const { data: newData, error } = await supabase
        .from('piggy_banks')
        .insert({
          name: data.name,
          target_amount: data.targetAmount,
          current_amount: data.currentAmount,
          color: data.color,
        })
        .select()
        .single();

      if (error) throw error;

      const mapped: PiggyBank = {
        id: newData.id,
        name: newData.name,
        targetAmount: Number(newData.target_amount),
        currentAmount: Number(newData.current_amount) || 0,
        color: newData.color || undefined,
      };

      setPiggyBanks((prev) => [mapped, ...prev]);
      toast.success('Cofrinho criado!');
      return mapped;
    } catch (error) {
      console.error('Error adding piggy bank:', error);
      toast.error('Erro ao criar cofrinho');
      return null;
    }
  };

  const updatePiggyBank = async (id: string, data: Partial<PiggyBank>) => {
    try {
      const updateData: Record<string, unknown> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.targetAmount !== undefined) updateData.target_amount = data.targetAmount;
      if (data.currentAmount !== undefined) updateData.current_amount = data.currentAmount;
      if (data.color !== undefined) updateData.color = data.color;

      const { error } = await supabase.from('piggy_banks').update(updateData).eq('id', id);
      if (error) throw error;

      setPiggyBanks((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
      return true;
    } catch (error) {
      console.error('Error updating piggy bank:', error);
      toast.error('Erro ao atualizar cofrinho');
      return false;
    }
  };

  const deletePiggyBank = async (id: string) => {
    try {
      const { error } = await supabase.from('piggy_banks').delete().eq('id', id);
      if (error) throw error;
      setPiggyBanks((prev) => prev.filter((p) => p.id !== id));
      toast.success('Cofrinho excluído!');
      return true;
    } catch (error) {
      console.error('Error deleting piggy bank:', error);
      toast.error('Erro ao excluir cofrinho');
      return false;
    }
  };

  // Fixed Expenses
  const addFixedExpense = async (data: Omit<FixedExpense, 'id'>) => {
    try {
      const { data: newData, error } = await supabase
        .from('fixed_expenses')
        .insert({
          name: data.name,
          amount: data.amount,
          due_day: data.dueDay,
          category: data.category,
          notifications_enabled: data.notificationsEnabled,
        })
        .select()
        .single();

      if (error) throw error;

      const mapped: FixedExpense = {
        id: newData.id,
        name: newData.name,
        amount: Number(newData.amount),
        dueDay: newData.due_day || 1,
        category: newData.category || '',
        notificationsEnabled: newData.notifications_enabled ?? true,
      };

      setFixedExpenses((prev) => [mapped, ...prev]);
      toast.success('Despesa fixa adicionada!');
      return mapped;
    } catch (error) {
      console.error('Error adding fixed expense:', error);
      toast.error('Erro ao adicionar despesa fixa');
      return null;
    }
  };

  const updateFixedExpense = async (id: string, data: Partial<FixedExpense>) => {
    try {
      const updateData: Record<string, unknown> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.amount !== undefined) updateData.amount = data.amount;
      if (data.dueDay !== undefined) updateData.due_day = data.dueDay;
      if (data.category !== undefined) updateData.category = data.category;
      if (data.notificationsEnabled !== undefined) updateData.notifications_enabled = data.notificationsEnabled;

      const { error } = await supabase.from('fixed_expenses').update(updateData).eq('id', id);
      if (error) throw error;

      setFixedExpenses((prev) => prev.map((f) => (f.id === id ? { ...f, ...data } : f)));
      return true;
    } catch (error) {
      console.error('Error updating fixed expense:', error);
      toast.error('Erro ao atualizar despesa fixa');
      return false;
    }
  };

  const deleteFixedExpense = async (id: string) => {
    try {
      const { error } = await supabase.from('fixed_expenses').delete().eq('id', id);
      if (error) throw error;
      setFixedExpenses((prev) => prev.filter((f) => f.id !== id));
      toast.success('Despesa fixa excluída!');
      return true;
    } catch (error) {
      console.error('Error deleting fixed expense:', error);
      toast.error('Erro ao excluir despesa fixa');
      return false;
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Calculated values
  const totalIncome = entries.filter((e) => e.type === 'income').reduce((acc, e) => acc + e.amount, 0);
  const totalExpenses = entries.filter((e) => e.type === 'expense').reduce((acc, e) => acc + e.amount, 0);
  const totalFixedExpenses = fixedExpenses.reduce((acc, e) => acc + e.amount, 0);
  const totalSaved = piggyBanks.reduce((acc, p) => acc + p.currentAmount, 0);
  const balance = totalIncome - totalExpenses - totalFixedExpenses;

  return {
    entries,
    piggyBanks,
    fixedExpenses,
    loading,
    totalIncome,
    totalExpenses,
    totalFixedExpenses,
    totalSaved,
    balance,
    addEntry,
    deleteEntry,
    addPiggyBank,
    updatePiggyBank,
    deletePiggyBank,
    addFixedExpense,
    updateFixedExpense,
    deleteFixedExpense,
    refetch: fetchAll,
  };
}
