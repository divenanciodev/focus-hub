import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Trash2,
  Edit,
  Calculator,
  TrendingDown,
  TrendingUp,
  Wallet,
  FileText,
  Copy,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DraftExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
}

interface BudgetDraft {
  id: string;
  name: string;
  month: string; // 'YYYY-MM'
  totalIncome: number;
  expenses: DraftExpense[];
  createdAt: Date;
}

const formatCurrency = (value: string | number): string => {
  if (typeof value === 'number') {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  const numbers = value.replace(/\D/g, '');
  if (!numbers) return '';
  const amount = parseInt(numbers, 10);
  return (amount / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

const parseCurrencyToNumber = (value: string): number => {
  const numbers = value.replace(/\D/g, '');
  if (!numbers) return 0;
  return parseInt(numbers, 10) / 100;
};

const EXPENSE_CATEGORIES = [
  'Moradia',
  'Alimentação',
  'Transporte',
  'Saúde',
  'Educação',
  'Lazer',
  'Roupas',
  'Contas',
  'Outros',
];

const MONTHS = [
  { value: '01', label: 'Janeiro' },
  { value: '02', label: 'Fevereiro' },
  { value: '03', label: 'Março' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Maio' },
  { value: '06', label: 'Junho' },
  { value: '07', label: 'Julho' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
];

export function BudgetDraft() {
  const [drafts, setDrafts] = useState<BudgetDraft[]>([]);
  const [isAddDraftModalOpen, setIsAddDraftModalOpen] = useState(false);
  const [isEditDraftModalOpen, setIsEditDraftModalOpen] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState<BudgetDraft | null>(null);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<DraftExpense | null>(null);

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];

  const [newDraft, setNewDraft] = useState({
    name: '',
    month: (new Date().getMonth() + 1).toString().padStart(2, '0'),
    year: currentYear.toString(),
    totalIncome: '',
  });

  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: 'Outros',
  });

  const handleAddDraft = () => {
    if (!newDraft.name || !newDraft.totalIncome) return;

    const draft: BudgetDraft = {
      id: Date.now().toString(),
      name: newDraft.name,
      month: `${newDraft.year}-${newDraft.month}`,
      totalIncome: parseCurrencyToNumber(newDraft.totalIncome),
      expenses: [],
      createdAt: new Date(),
    };

    setDrafts([draft, ...drafts]);
    setNewDraft({
      name: '',
      month: (new Date().getMonth() + 1).toString().padStart(2, '0'),
      year: currentYear.toString(),
      totalIncome: '',
    });
    setIsAddDraftModalOpen(false);
  };

  const handleDeleteDraft = (id: string) => {
    setDrafts(drafts.filter((d) => d.id !== id));
    if (selectedDraft?.id === id) {
      setSelectedDraft(null);
    }
  };

  const handleDuplicateDraft = (draft: BudgetDraft) => {
    const newDraftCopy: BudgetDraft = {
      ...draft,
      id: Date.now().toString(),
      name: `${draft.name} (cópia)`,
      expenses: draft.expenses.map((e) => ({ ...e, id: Date.now().toString() + Math.random() })),
      createdAt: new Date(),
    };
    setDrafts([newDraftCopy, ...drafts]);
  };

  const handleAddExpense = () => {
    if (!selectedDraft || !newExpense.description || !newExpense.amount) return;

    const expense: DraftExpense = {
      id: Date.now().toString(),
      description: newExpense.description,
      amount: parseCurrencyToNumber(newExpense.amount),
      category: newExpense.category,
    };

    const updatedDraft = {
      ...selectedDraft,
      expenses: [...selectedDraft.expenses, expense],
    };

    setDrafts(drafts.map((d) => (d.id === selectedDraft.id ? updatedDraft : d)));
    setSelectedDraft(updatedDraft);
    setNewExpense({ description: '', amount: '', category: 'Outros' });
    setIsAddExpenseModalOpen(false);
  };

  const handleUpdateExpense = () => {
    if (!selectedDraft || !editingExpense || !newExpense.description || !newExpense.amount) return;

    const updatedExpense: DraftExpense = {
      ...editingExpense,
      description: newExpense.description,
      amount: parseCurrencyToNumber(newExpense.amount),
      category: newExpense.category,
    };

    const updatedDraft = {
      ...selectedDraft,
      expenses: selectedDraft.expenses.map((e) =>
        e.id === editingExpense.id ? updatedExpense : e
      ),
    };

    setDrafts(drafts.map((d) => (d.id === selectedDraft.id ? updatedDraft : d)));
    setSelectedDraft(updatedDraft);
    setEditingExpense(null);
    setNewExpense({ description: '', amount: '', category: 'Outros' });
    setIsAddExpenseModalOpen(false);
  };

  const handleDeleteExpense = (expenseId: string) => {
    if (!selectedDraft) return;

    const updatedDraft = {
      ...selectedDraft,
      expenses: selectedDraft.expenses.filter((e) => e.id !== expenseId),
    };

    setDrafts(drafts.map((d) => (d.id === selectedDraft.id ? updatedDraft : d)));
    setSelectedDraft(updatedDraft);
  };

  const handleEditExpense = (expense: DraftExpense) => {
    setEditingExpense(expense);
    setNewExpense({
      description: expense.description,
      amount: formatCurrency(expense.amount),
      category: expense.category,
    });
    setIsAddExpenseModalOpen(true);
  };

  const openAddExpenseModal = () => {
    setEditingExpense(null);
    setNewExpense({ description: '', amount: '', category: 'Outros' });
    setIsAddExpenseModalOpen(true);
  };

  const getMonthLabel = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const monthData = MONTHS.find((m) => m.value === month);
    return `${monthData?.label || month}/${year}`;
  };

  const calculateTotalExpenses = (expenses: DraftExpense[]) => {
    return expenses.reduce((acc, e) => acc + e.amount, 0);
  };

  const calculateRemaining = (income: number, expenses: DraftExpense[]) => {
    return income - calculateTotalExpenses(expenses);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Rascunhos de Orçamento</h3>
          <p className="text-sm text-muted-foreground">
            Planeje o destino do seu dinheiro antes de recebê-lo
          </p>
        </div>
        <Button onClick={() => setIsAddDraftModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Rascunho
        </Button>
      </div>

      {drafts.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <Calculator className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">
            Nenhum rascunho criado ainda. Comece planejando seu orçamento!
          </p>
          <Button onClick={() => setIsAddDraftModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Criar Rascunho
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Drafts List */}
          <div className="lg:col-span-1 space-y-4">
            <h4 className="font-medium text-foreground">Seus Rascunhos</h4>
            {drafts.map((draft) => {
              const totalExpenses = calculateTotalExpenses(draft.expenses);
              const remaining = calculateRemaining(draft.totalIncome, draft.expenses);
              const isSelected = selectedDraft?.id === draft.id;

              return (
                <Card
                  key={draft.id}
                  className={cn(
                    'cursor-pointer transition-colors hover:border-foreground/20',
                    isSelected && 'border-primary bg-primary/5'
                  )}
                  onClick={() => setSelectedDraft(draft)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{draft.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {getMonthLabel(draft.month)}
                        </Badge>
                      </div>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => handleDuplicateDraft(draft)}
                          title="Duplicar"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => handleDeleteDraft(draft.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Receita:</span>
                        <span className="font-medium text-emerald-600">
                          {formatCurrency(draft.totalIncome)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Despesas:</span>
                        <span className="font-medium text-rose-600">
                          {formatCurrency(totalExpenses)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-border">
                        <span className="text-muted-foreground">Sobra:</span>
                        <span
                          className={cn(
                            'font-bold',
                            remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          )}
                        >
                          {formatCurrency(remaining)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Draft Detail */}
          <div className="lg:col-span-2">
            {selectedDraft ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        {selectedDraft.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {getMonthLabel(selectedDraft.month)}
                      </p>
                    </div>
                    <Button onClick={openAddExpenseModal}>
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Gasto
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-emerald-500/10 rounded-lg p-4 text-center">
                      <TrendingUp className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
                      <p className="text-xs text-muted-foreground">Receita</p>
                      <p className="text-lg font-bold text-emerald-600">
                        {formatCurrency(selectedDraft.totalIncome)}
                      </p>
                    </div>
                    <div className="bg-rose-500/10 rounded-lg p-4 text-center">
                      <TrendingDown className="w-6 h-6 mx-auto mb-2 text-rose-600" />
                      <p className="text-xs text-muted-foreground">Despesas</p>
                      <p className="text-lg font-bold text-rose-600">
                        {formatCurrency(calculateTotalExpenses(selectedDraft.expenses))}
                      </p>
                    </div>
                    <div
                      className={cn(
                        'rounded-lg p-4 text-center',
                        calculateRemaining(selectedDraft.totalIncome, selectedDraft.expenses) >= 0
                          ? 'bg-sky-500/10'
                          : 'bg-rose-500/10'
                      )}
                    >
                      <Wallet className="w-6 h-6 mx-auto mb-2 text-sky-600" />
                      <p className="text-xs text-muted-foreground">Sobra</p>
                      <p
                        className={cn(
                          'text-lg font-bold',
                          calculateRemaining(selectedDraft.totalIncome, selectedDraft.expenses) >= 0
                            ? 'text-sky-600'
                            : 'text-rose-600'
                        )}
                      >
                        {formatCurrency(
                          calculateRemaining(selectedDraft.totalIncome, selectedDraft.expenses)
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Expenses List */}
                  {selectedDraft.expenses.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-border rounded-lg">
                      <p className="text-muted-foreground">
                        Nenhum gasto planejado. Adicione despesas para simular.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <h4 className="font-medium text-foreground mb-3">Gastos Planejados</h4>
                      {selectedDraft.expenses.map((expense) => (
                        <div
                          key={expense.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center">
                              <TrendingDown className="w-4 h-4 text-rose-600" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{expense.description}</p>
                              <Badge variant="outline" className="text-xs">
                                {expense.category}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-rose-600">
                              -{formatCurrency(expense.amount)}
                            </span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => handleEditExpense(expense)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => handleDeleteExpense(expense.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="bg-muted/50 rounded-xl p-8 text-center h-full flex items-center justify-center">
                <div>
                  <Calculator className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Selecione um rascunho para ver os detalhes
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Draft Modal */}
      <Dialog open={isAddDraftModalOpen} onOpenChange={setIsAddDraftModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Novo Rascunho de Orçamento
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="draft-name">Nome do Rascunho</Label>
              <Input
                id="draft-name"
                placeholder="Ex: Salário Janeiro"
                value={newDraft.name}
                onChange={(e) => setNewDraft({ ...newDraft, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Mês</Label>
                <Select
                  value={newDraft.month}
                  onValueChange={(value) => setNewDraft({ ...newDraft, month: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ano</Label>
                <Select
                  value={newDraft.year}
                  onValueChange={(value) => setNewDraft({ ...newDraft, year: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="draft-income">Valor Total a Receber</Label>
              <Input
                id="draft-income"
                placeholder="R$ 0,00"
                value={newDraft.totalIncome}
                onChange={(e) =>
                  setNewDraft({ ...newDraft, totalIncome: formatCurrency(e.target.value) })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Quanto você espera receber neste mês?
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDraftModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddDraft} disabled={!newDraft.name || !newDraft.totalIncome}>
              Criar Rascunho
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Expense Modal */}
      <Dialog open={isAddExpenseModalOpen} onOpenChange={setIsAddExpenseModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              {editingExpense ? 'Editar Gasto' : 'Adicionar Gasto'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="expense-desc">Descrição</Label>
              <Input
                id="expense-desc"
                placeholder="Ex: Aluguel, Conta de luz..."
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="expense-amount">Valor</Label>
              <Input
                id="expense-amount"
                placeholder="R$ 0,00"
                value={newExpense.amount}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, amount: formatCurrency(e.target.value) })
                }
              />
            </div>
            <div>
              <Label>Categoria</Label>
              <Select
                value={newExpense.category}
                onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddExpenseModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={editingExpense ? handleUpdateExpense : handleAddExpense}
              disabled={!newExpense.description || !newExpense.amount}
            >
              {editingExpense ? 'Salvar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
