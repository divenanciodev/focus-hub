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

export interface EntryAllocation {
  id: string;
  entryId: string;
  destinationType: 'expense' | 'piggy_bank' | 'fixed_expense' | 'other';
  destinationId?: string;
  destinationName: string;
  amount: number;
}

export function useFinancial() {
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [piggyBanks, setPiggyBanks] = useState<PiggyBank[]>([]);
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const [allocations, setAllocations] = useState<EntryAllocation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const [entriesRes, piggyRes, fixedRes, allocationsRes] = await Promise.all([
        supabase.from('financial_entries').select('*').order('date', { ascending: false }),
        supabase.from('piggy_banks').select('*').order('created_at', { ascending: false }),
        supabase.from('fixed_expenses').select('*').order('created_at', { ascending: false }),
        supabase.from('entry_allocations').select('*').order('created_at', { ascending: false }),
      ]);

      if (entriesRes.error) throw entriesRes.error;
      if (piggyRes.error) throw piggyRes.error;
      if (fixedRes.error) throw fixedRes.error;
      if (allocationsRes.error) throw allocationsRes.error;

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

      setAllocations(
        (allocationsRes.data || []).map((a) => ({
          id: a.id,
          entryId: a.entry_id,
          destinationType: a.destination_type as EntryAllocation['destinationType'],
          destinationId: a.destination_id || undefined,
          destinationName: a.destination_name,
          amount: Number(a.amount),
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

  const updateEntry = async (id: string, data: Partial<FinancialEntry>) => {
    try {
      const updateData: Record<string, unknown> = {};
      if (data.type !== undefined) updateData.type = data.type;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.amount !== undefined) updateData.amount = data.amount;
      if (data.date !== undefined) updateData.date = data.date.toISOString();
      if (data.category !== undefined) updateData.category = data.category;

      const { error } = await supabase.from('financial_entries').update(updateData).eq('id', id);
      if (error) throw error;

      setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)));
      toast.success('Registro atualizado!');
      return true;
    } catch (error) {
      console.error('Error updating entry:', error);
      toast.error('Erro ao atualizar registro');
      return false;
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const { error } = await supabase.from('financial_entries').delete().eq('id', id);
      if (error) throw error;
      setEntries((prev) => prev.filter((e) => e.id !== id));
      toast.success('Registro excluído!');
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

  // Entry Allocations
  const addAllocation = async (data: Omit<EntryAllocation, 'id'>) => {
    try {
      const { data: newData, error } = await supabase
        .from('entry_allocations')
        .insert({
          entry_id: data.entryId,
          destination_type: data.destinationType,
          destination_id: data.destinationId || null,
          destination_name: data.destinationName,
          amount: data.amount,
        })
        .select()
        .single();

      if (error) throw error;

      const mapped: EntryAllocation = {
        id: newData.id,
        entryId: newData.entry_id,
        destinationType: newData.destination_type as EntryAllocation['destinationType'],
        destinationId: newData.destination_id || undefined,
        destinationName: newData.destination_name,
        amount: Number(newData.amount),
      };

      setAllocations((prev) => [mapped, ...prev]);
      toast.success('Destino adicionado!');
      return mapped;
    } catch (error) {
      console.error('Error adding allocation:', error);
      toast.error('Erro ao adicionar destino');
      return null;
    }
  };

  const updateAllocation = async (id: string, data: Partial<EntryAllocation>) => {
    try {
      const updateData: Record<string, unknown> = {};
      if (data.destinationType !== undefined) updateData.destination_type = data.destinationType;
      if (data.destinationId !== undefined) updateData.destination_id = data.destinationId || null;
      if (data.destinationName !== undefined) updateData.destination_name = data.destinationName;
      if (data.amount !== undefined) updateData.amount = data.amount;

      const { error } = await supabase.from('entry_allocations').update(updateData).eq('id', id);
      if (error) throw error;

      setAllocations((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } : a)));
      toast.success('Destino atualizado!');
      return true;
    } catch (error) {
      console.error('Error updating allocation:', error);
      toast.error('Erro ao atualizar destino');
      return false;
    }
  };

  const deleteAllocation = async (id: string) => {
    try {
      const { error } = await supabase.from('entry_allocations').delete().eq('id', id);
      if (error) throw error;
      setAllocations((prev) => prev.filter((a) => a.id !== id));
      toast.success('Destino removido!');
      return true;
    } catch (error) {
      console.error('Error deleting allocation:', error);
      toast.error('Erro ao remover destino');
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
  
  // Allocation-based calculations
  const allocatedExpenses = allocations
    .filter((a) => a.destinationType === 'expense' || a.destinationType === 'fixed_expense')
    .reduce((acc, a) => acc + a.amount, 0);
  const allocatedSaved = allocations
    .filter((a) => a.destinationType === 'piggy_bank')
    .reduce((acc, a) => acc + a.amount, 0);
  
  const balance = totalIncome - totalExpenses - totalFixedExpenses - allocatedExpenses;

  return {
    entries,
    piggyBanks,
    fixedExpenses,
    allocations,
    loading,
    totalIncome,
    totalExpenses,
    totalFixedExpenses,
    totalSaved,
    allocatedExpenses,
    allocatedSaved,
    balance,
    addEntry,
    updateEntry,
    deleteEntry,
    addPiggyBank,
    updatePiggyBank,
    deletePiggyBank,
    addFixedExpense,
    updateFixedExpense,
    deleteFixedExpense,
    addAllocation,
    updateAllocation,
    deleteAllocation,
    refetch: fetchAll,
  };
}
