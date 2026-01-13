import { useState, useRef } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useFinancial, FinancialEntry, PiggyBank, FixedExpense } from '@/hooks/useFinancial';
import { EntryAllocationModal } from '@/components/financial/EntryAllocationModal';
import { FinancialReport } from '@/components/financial/FinancialReport';
import { Receivable, PurchaseGoal, Consortium } from '@/types';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  Check,
  PiggyBank as PiggyBankIcon,
  Bell,
  BellOff,
  Calendar,
  ShoppingCart,
  ExternalLink,
  Trash2,
  Edit,
  Image,
  Link as LinkIcon,
  Users,
  ArrowDownToLine,
  ArrowUpFromLine,
  Loader2,
  Split,
  ChevronDown,
  ChevronUp,
  FileBarChart,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Financeiro() {
  const {
    entries,
    piggyBanks,
    fixedExpenses,
    allocations,
    loading,
    allocatedExpenses,
    allocatedSaved,
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
  } = useFinancial();

  // Modal states
  const [isAddEntryModalOpen, setIsAddEntryModalOpen] = useState(false);
  const [entryType, setEntryType] = useState<'income' | 'expense'>('income');
  const [newEntry, setNewEntry] = useState({ description: '', amount: '', expenseCategory: '' });
  
  // Edit entry state
  const [editingEntry, setEditingEntry] = useState<FinancialEntry | null>(null);
  const [isEditEntryModalOpen, setIsEditEntryModalOpen] = useState(false);
  const [editEntryData, setEditEntryData] = useState({ description: '', amount: '' });

  // Allocation modal state
  const [selectedEntryForAllocation, setSelectedEntryForAllocation] = useState<FinancialEntry | null>(null);
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  
  // Expanded entries state for showing/hiding allocations
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  
  // Expanded expenses card state
  const [isExpensesCardExpanded, setIsExpensesCardExpanded] = useState(false);

  // State for receivables (local for now)
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [isAddReceivableModalOpen, setIsAddReceivableModalOpen] = useState(false);
  const [newReceivable, setNewReceivable] = useState({
    personName: '',
    description: '',
    totalAmount: '',
    installments: '1',
  });

  // State for piggy banks
  const [isAddPiggyBankModalOpen, setIsAddPiggyBankModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedPiggyBank, setSelectedPiggyBank] = useState<PiggyBank | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [newPiggyBank, setNewPiggyBank] = useState({
    name: '',
    targetAmount: '',
    color: '#8B5CF6',
  });

  // State for fixed expenses
  const [isAddFixedExpenseModalOpen, setIsAddFixedExpenseModalOpen] = useState(false);
  const [newFixedExpense, setNewFixedExpense] = useState({
    name: '',
    amount: '',
    dueDay: '',
    category: '',
  });

  // State for purchase goals (local for now)
  const [purchaseGoals, setPurchaseGoals] = useState<PurchaseGoal[]>([]);
  const [isAddPurchaseGoalModalOpen, setIsAddPurchaseGoalModalOpen] = useState(false);
  const [newPurchaseGoal, setNewPurchaseGoal] = useState({
    name: '',
    description: '',
    targetAmount: '',
    imageUrl: '',
    storeLink: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });
  const purchaseImageInputRef = useRef<HTMLInputElement>(null);

  // State for consortium (local for now)
  const [consortiums, setConsortiums] = useState<Consortium[]>([]);
  const [isAddConsortiumModalOpen, setIsAddConsortiumModalOpen] = useState(false);
  const [newConsortium, setNewConsortium] = useState({
    goal: '',
    totalAmount: '',
    installments: '',
  });

  // Calculations - include allocated expenses in total
  const totalIncome = entries.filter((e) => e.type === 'income').reduce((acc, e) => acc + e.amount, 0);
  const totalVariableExpenses = entries.filter((e) => e.type === 'expense').reduce((acc, e) => acc + e.amount, 0) + allocatedExpenses;
  const totalFixedExpenses = fixedExpenses.reduce((acc, e) => acc + e.amount, 0);
  const totalReceivables = receivables.reduce((acc, r) => {
    const remaining = r.totalAmount - (r.totalAmount / r.installments) * r.paidInstallments;
    return acc + remaining;
  }, 0);
  const totalSaved = piggyBanks.reduce((acc, p) => acc + p.currentAmount, 0) + allocatedSaved;
  const balance = totalIncome - totalVariableExpenses - totalFixedExpenses;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  };

  // Handlers for entries
  const handleAddEntry = async () => {
    if (newEntry.description && newEntry.amount) {
      await addEntry({
        type: entryType,
        description: newEntry.description,
        amount: parseFloat(newEntry.amount),
        category: entryType === 'income' ? 'Entrada' : (newEntry.expenseCategory || 'Outros'),
        date: new Date(),
      });
      setNewEntry({ description: '', amount: '', expenseCategory: '' });
      setIsAddEntryModalOpen(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    await deleteEntry(id);
  };

  const handleEditEntry = (entry: FinancialEntry) => {
    setEditingEntry(entry);
    setEditEntryData({
      description: entry.description,
      amount: entry.amount.toString(),
    });
    setIsEditEntryModalOpen(true);
  };

  const handleUpdateEntry = async () => {
    if (editingEntry && editEntryData.description && editEntryData.amount) {
      await updateEntry(editingEntry.id, {
        description: editEntryData.description,
        amount: parseFloat(editEntryData.amount),
      });
      setEditingEntry(null);
      setEditEntryData({ description: '', amount: '' });
      setIsEditEntryModalOpen(false);
    }
  };

  // Handlers for receivables (local)
  const handleAddReceivable = () => {
    if (newReceivable.personName && newReceivable.totalAmount) {
      const receivable: Receivable = {
        id: Date.now().toString(),
        personName: newReceivable.personName,
        description: newReceivable.description,
        totalAmount: parseFloat(newReceivable.totalAmount),
        installments: parseInt(newReceivable.installments) || 1,
        paidInstallments: 0,
        createdAt: new Date(),
      };
      setReceivables([receivable, ...receivables]);
      setNewReceivable({ personName: '', description: '', totalAmount: '', installments: '1' });
      setIsAddReceivableModalOpen(false);
    }
  };

  const handlePayReceivableInstallment = (id: string) => {
    setReceivables(
      receivables.map((r) =>
        r.id === id && r.paidInstallments < r.installments
          ? { ...r, paidInstallments: r.paidInstallments + 1 }
          : r
      )
    );
  };

  const handleDeleteReceivable = (id: string) => {
    setReceivables(receivables.filter((r) => r.id !== id));
  };

  // Handlers for piggy banks
  const handleAddPiggyBank = async () => {
    if (newPiggyBank.name && newPiggyBank.targetAmount) {
      await addPiggyBank({
        name: newPiggyBank.name,
        targetAmount: parseFloat(newPiggyBank.targetAmount),
        currentAmount: 0,
        color: newPiggyBank.color,
      });
      setNewPiggyBank({ name: '', targetAmount: '', color: '#8B5CF6' });
      setIsAddPiggyBankModalOpen(false);
    }
  };

  const handleDeposit = async () => {
    if (selectedPiggyBank && depositAmount) {
      await updatePiggyBank(selectedPiggyBank.id, {
        currentAmount: selectedPiggyBank.currentAmount + parseFloat(depositAmount),
      });
      setDepositAmount('');
      setIsDepositModalOpen(false);
      setSelectedPiggyBank(null);
    }
  };

  const handleWithdraw = async () => {
    if (selectedPiggyBank && depositAmount) {
      const amount = parseFloat(depositAmount);
      if (amount <= selectedPiggyBank.currentAmount) {
        await updatePiggyBank(selectedPiggyBank.id, {
          currentAmount: selectedPiggyBank.currentAmount - amount,
        });
      }
      setDepositAmount('');
      setIsDepositModalOpen(false);
      setSelectedPiggyBank(null);
    }
  };

  const handleDeletePiggyBank = async (id: string) => {
    await deletePiggyBank(id);
  };

  // Handlers for fixed expenses
  const handleAddFixedExpense = async () => {
    if (newFixedExpense.name && newFixedExpense.amount && newFixedExpense.dueDay) {
      await addFixedExpense({
        name: newFixedExpense.name,
        amount: parseFloat(newFixedExpense.amount),
        dueDay: parseInt(newFixedExpense.dueDay),
        category: newFixedExpense.category || 'Outros',
        notificationsEnabled: true,
      });
      setNewFixedExpense({ name: '', amount: '', dueDay: '', category: '' });
      setIsAddFixedExpenseModalOpen(false);
    }
  };

  const toggleExpenseNotification = async (expense: FixedExpense) => {
    await updateFixedExpense(expense.id, {
      notificationsEnabled: !expense.notificationsEnabled,
    });
  };

  const handleDeleteFixedExpense = async (id: string) => {
    await deleteFixedExpense(id);
  };

  // Handlers for purchase goals (local)
  const handleAddPurchaseGoal = () => {
    if (newPurchaseGoal.name && newPurchaseGoal.targetAmount) {
      const goal: PurchaseGoal = {
        id: Date.now().toString(),
        name: newPurchaseGoal.name,
        description: newPurchaseGoal.description,
        targetAmount: parseFloat(newPurchaseGoal.targetAmount),
        savedAmount: 0,
        imageUrl: newPurchaseGoal.imageUrl,
        storeLink: newPurchaseGoal.storeLink,
        priority: newPurchaseGoal.priority,
      };
      setPurchaseGoals([goal, ...purchaseGoals]);
      setNewPurchaseGoal({
        name: '',
        description: '',
        targetAmount: '',
        imageUrl: '',
        storeLink: '',
        priority: 'medium',
      });
      setIsAddPurchaseGoalModalOpen(false);
    }
  };

  const handlePurchaseImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPurchaseGoal({ ...newPurchaseGoal, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeletePurchaseGoal = (id: string) => {
    setPurchaseGoals(purchaseGoals.filter((g) => g.id !== id));
  };

  // Handlers for consortium (local)
  const handleAddConsortium = () => {
    if (newConsortium.goal && newConsortium.totalAmount && newConsortium.installments) {
      const consortium: Consortium = {
        id: Date.now().toString(),
        goal: newConsortium.goal,
        totalAmount: parseFloat(newConsortium.totalAmount),
        installments: parseInt(newConsortium.installments),
        paidInstallments: 0,
      };
      setConsortiums([consortium, ...consortiums]);
      setNewConsortium({ goal: '', totalAmount: '', installments: '' });
      setIsAddConsortiumModalOpen(false);
    }
  };

  const payConsortiumInstallment = (id: string) => {
    setConsortiums(
      consortiums.map((c) =>
        c.id === id && c.paidInstallments < c.installments
          ? { ...c, paidInstallments: c.paidInstallments + 1 }
          : c
      )
    );
  };

  const handleDeleteConsortium = (id: string) => {
    setConsortiums(consortiums.filter((c) => c.id !== id));
  };

  const getEntryIcon = (type: FinancialEntry['type']) => {
    return type === 'income' ? (
      <TrendingUp className="w-4 h-4 text-success" />
    ) : (
      <TrendingDown className="w-4 h-4 text-destructive" />
    );
  };

  const getPriorityColor = (priority: PurchaseGoal['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-destructive';
      case 'medium':
        return 'text-warning';
      case 'low':
        return 'text-muted-foreground';
    }
  };

  const toggleEntryExpanded = (entryId: string) => {
    setExpandedEntries((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  };

  const today = new Date().getDate();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="fade-in">
      <PageHeader
        title="Vida Financeira"
        description="Controle suas finanças e objetivos"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Renda total" 
          value={formatCurrency(totalIncome)} 
          icon={TrendingUp} 
          iconBgClassName="bg-emerald-500/20" 
        />
        
        {/* Expandable Expenses Card */}
        <div className="col-span-1">
          <div
            onClick={() => setIsExpensesCardExpanded(!isExpensesCardExpanded)}
            className={cn(
              'bg-card border border-border rounded-xl p-5 transition-all duration-200 cursor-pointer hover:border-foreground/20 hover:shadow-md hover:-translate-y-0.5 fade-in',
              isExpensesCardExpanded && 'border-rose-500/50'
            )}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-rose-500/20 mb-3">
              <TrendingDown className="w-5 h-5 text-rose-600" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Despesas totais</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(totalFixedExpenses + totalVariableExpenses)}
                </p>
              </div>
              {isExpensesCardExpanded ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            
            {/* Expanded content */}
            {isExpensesCardExpanded && (
              <div className="mt-4 pt-4 border-t border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-600" />
                    <span className="text-sm text-muted-foreground">Fixas</span>
                  </div>
                  <span className="text-sm font-semibold">{formatCurrency(totalFixedExpenses)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <span className="text-sm text-muted-foreground">Variáveis</span>
                  </div>
                  <span className="text-sm font-semibold">{formatCurrency(totalVariableExpenses)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <StatCard 
          title="A receber" 
          value={formatCurrency(totalReceivables)} 
          icon={Users} 
          iconBgClassName="bg-amber-500/20" 
        />
        <StatCard 
          title="Guardado" 
          value={formatCurrency(totalSaved)} 
          icon={PiggyBankIcon} 
          iconBgClassName="bg-sky-500/20" 
        />
      </div>

      <Tabs defaultValue="entradas" className="w-full">
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="entradas">Entradas/Saídas</TabsTrigger>
          <TabsTrigger value="receber">A Receber</TabsTrigger>
          <TabsTrigger value="cofrinhos">Cofrinhos</TabsTrigger>
          <TabsTrigger value="fixas">Despesas Fixas</TabsTrigger>
          <TabsTrigger value="variaveis">Despesas Variáveis</TabsTrigger>
          <TabsTrigger value="compras">Compras</TabsTrigger>
          <TabsTrigger value="consorcio">Consórcio</TabsTrigger>
          <TabsTrigger value="relatorios" className="gap-1.5">
            <FileBarChart className="w-4 h-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        {/* Entradas e Saídas */}
        <TabsContent value="entradas" className="mt-0">
          <div className="flex gap-2 justify-end mb-4">
            <Button
              variant="outline"
              onClick={() => {
                setEntryType('expense');
                setIsAddEntryModalOpen(true);
              }}
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              Saída
            </Button>
            <Button
              onClick={() => {
                setEntryType('income');
                setIsAddEntryModalOpen(true);
              }}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Entrada
            </Button>
          </div>

          {entries.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <p className="text-muted-foreground">Nenhum registro encontrado.</p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl divide-y divide-border">
              {entries.map((entry) => {
                const entryAllocations = allocations.filter((a) => a.entryId === entry.id);
                const totalAllocated = entryAllocations.reduce((acc, a) => acc + a.amount, 0);
                const hasAllocations = entryAllocations.length > 0;
                const isFullyAllocated = totalAllocated >= entry.amount;
                const isExpanded = expandedEntries.has(entry.id);
                
                // Separate expense allocations (shown as outflow)
                const expenseAllocations = entryAllocations.filter(
                  (a) => a.destinationType === 'expense' || a.destinationType === 'fixed_expense' || a.destinationType === 'health'
                );
                const savedAllocations = entryAllocations.filter(
                  (a) => a.destinationType === 'piggy_bank'
                );
                const otherAllocations = entryAllocations.filter(
                  (a) => a.destinationType === 'other'
                );

                return (
                  <div key={entry.id} className="p-4">
                    <div className="flex items-center gap-3">
                      {/* Icon */}
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted flex-shrink-0">
                        {getEntryIcon(entry.type)}
                      </div>
                      
                      {/* Description - flex grow */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{entry.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {entry.category} • {formatDate(entry.date)}
                        </p>
                      </div>
                      
                      {/* Value - fixed width for alignment */}
                      <div className="w-28 text-right flex-shrink-0">
                        <span
                          className={cn(
                            'font-semibold',
                            entry.type === 'income' ? 'text-success' : 'text-destructive'
                          )}
                        >
                          {entry.type === 'income' ? '+' : '-'}
                          {formatCurrency(entry.amount)}
                        </span>
                      </div>
                      
                      {/* Actions - fixed width */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {entry.type === 'income' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setSelectedEntryForAllocation(entry);
                              setIsAllocationModalOpen(true);
                            }}
                            title="Alocar destinos"
                          >
                            <Split className={cn(
                              'w-4 h-4',
                              isFullyAllocated ? 'text-success' : hasAllocations ? 'text-warning' : 'text-muted-foreground'
                            )} />
                          </Button>
                        )}
                        {entry.type === 'income' && hasAllocations && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => toggleEntryExpanded(entry.id)}
                            title={isExpanded ? 'Minimizar' : 'Expandir'}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            )}
                          </Button>
                        )}
                        {/* Placeholders for alignment when no allocation buttons */}
                        {entry.type === 'expense' && (
                          <>
                            <div className="w-8" />
                            <div className="w-8" />
                          </>
                        )}
                        {/* Placeholder when income has no allocations (no expand button) */}
                        {entry.type === 'income' && !hasAllocations && (
                          <div className="w-8" />
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditEntry(entry)}
                          title="Editar"
                        >
                          <Edit className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDeleteEntry(entry.id)}
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>

                    {/* Collapsed summary - show allocation counts */}
                    {entry.type === 'income' && hasAllocations && !isExpanded && (
                      <div className="mt-2 ml-13 pl-13">
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {expenseAllocations.length > 0 && (
                            <span className="flex items-center gap-1">
                              <TrendingDown className="w-3 h-3 text-destructive" />
                              Despesas: {formatCurrency(expenseAllocations.reduce((acc, a) => acc + a.amount, 0))}
                            </span>
                          )}
                          {savedAllocations.length > 0 && (
                            <span className="flex items-center gap-1">
                              <PiggyBankIcon className="w-3 h-3 text-success" />
                              Guardado: {formatCurrency(savedAllocations.reduce((acc, a) => acc + a.amount, 0))}
                            </span>
                          )}
                          {!isFullyAllocated && (
                            <span className="text-warning">
                              Restante: {formatCurrency(entry.amount - totalAllocated)}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Expanded view - show all allocations with types */}
                    {entry.type === 'income' && hasAllocations && isExpanded && (
                      <div className="mt-3 ml-13 pl-13 space-y-2">
                        {/* Expense allocations - shown as outflow */}
                        {expenseAllocations.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-destructive flex items-center gap-1">
                              <TrendingDown className="w-3 h-3" />
                              Despesas
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {expenseAllocations.map((alloc) => (
                                <Badge key={alloc.id} variant="destructive" className="text-xs">
                                  {alloc.destinationName}: -{formatCurrency(alloc.amount)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Saved allocations */}
                        {savedAllocations.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-success flex items-center gap-1">
                              <PiggyBankIcon className="w-3 h-3" />
                              Guardado
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {savedAllocations.map((alloc) => (
                                <Badge key={alloc.id} variant="secondary" className="text-xs bg-success/20 text-success">
                                  {alloc.destinationName}: {formatCurrency(alloc.amount)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Other allocations */}
                        {otherAllocations.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">Outros</p>
                            <div className="flex flex-wrap gap-1.5">
                              {otherAllocations.map((alloc) => (
                                <Badge key={alloc.id} variant="secondary" className="text-xs">
                                  {alloc.destinationName}: {formatCurrency(alloc.amount)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Remaining */}
                        {!isFullyAllocated && (
                          <Badge variant="outline" className="text-xs text-warning border-warning">
                            Restante: {formatCurrency(entry.amount - totalAllocated)}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* A Receber */}
        <TabsContent value="receber" className="mt-0">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setIsAddReceivableModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar a receber
            </Button>
          </div>

          {receivables.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <p className="text-muted-foreground">Nenhum valor a receber.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {receivables.map((receivable) => {
                const progress = (receivable.paidInstallments / receivable.installments) * 100;
                const installmentValue = receivable.totalAmount / receivable.installments;
                const isComplete = receivable.paidInstallments >= receivable.installments;

                return (
                  <Card key={receivable.id} className={cn('flex flex-col', isComplete && 'opacity-60')}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                            <Users className="w-4 h-4 text-foreground" />
                          </div>
                          <div>
                            <CardTitle className="text-base font-semibold">
                              {receivable.personName}
                            </CardTitle>
                            {receivable.description && (
                              <p className="text-xs text-muted-foreground">
                                {receivable.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="text-lg font-bold text-foreground">
                          {formatCurrency(receivable.totalAmount)}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Parcelas pagas</span>
                          <span className="font-medium text-foreground">
                            {receivable.paidInstallments}/{receivable.installments}
                          </span>
                        </div>
                        <ProgressBar value={progress} size="sm" />
                        <p className="text-xs text-muted-foreground">
                          Parcela: {formatCurrency(installmentValue)}
                        </p>
                      </div>

                      <div className="flex gap-2 mt-auto pt-3 border-t border-border">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          disabled={isComplete}
                          onClick={() => handlePayReceivableInstallment(receivable.id)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Receber parcela
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteReceivable(receivable.id)}
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Cofrinhos */}
        <TabsContent value="cofrinhos" className="mt-0">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setIsAddPiggyBankModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo cofrinho
            </Button>
          </div>

          {piggyBanks.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <p className="text-muted-foreground">Nenhum cofrinho criado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {piggyBanks.map((piggy) => {
                const progress = (piggy.currentAmount / piggy.targetAmount) * 100;
                const isComplete = piggy.currentAmount >= piggy.targetAmount;

                return (
                  <Card key={piggy.id} className="flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="flex items-center justify-center w-10 h-10 rounded-full"
                            style={{ backgroundColor: `${piggy.color}20` }}
                          >
                            <PiggyBankIcon className="w-5 h-5" style={{ color: piggy.color }} />
                          </div>
                          <CardTitle className="text-base font-semibold">{piggy.name}</CardTitle>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeletePiggyBank(piggy.id)}
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-foreground">
                            {formatCurrency(piggy.currentAmount)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            de {formatCurrency(piggy.targetAmount)}
                          </span>
                        </div>
                        <ProgressBar value={Math.min(progress, 100)} color={piggy.color} />
                        <p className="text-xs text-muted-foreground text-center">
                          {progress.toFixed(1)}% da meta
                        </p>
                      </div>

                      <div className="flex gap-2 mt-auto pt-3 border-t border-border">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setSelectedPiggyBank(piggy);
                            setIsDepositModalOpen(true);
                          }}
                        >
                          <ArrowDownToLine className="w-4 h-4 mr-1" />
                          Depositar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          disabled={piggy.currentAmount <= 0}
                          onClick={() => {
                            setSelectedPiggyBank(piggy);
                            setIsDepositModalOpen(true);
                          }}
                        >
                          <ArrowUpFromLine className="w-4 h-4 mr-1" />
                          Retirar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Despesas Fixas */}
        <TabsContent value="fixas" className="mt-0">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setIsAddFixedExpenseModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova despesa fixa
            </Button>
          </div>

          {fixedExpenses.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <p className="text-muted-foreground">Nenhuma despesa fixa cadastrada.</p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl divide-y divide-border">
              {fixedExpenses.map((expense) => {
                const isDueSoon = expense.dueDay && (expense.dueDay - today <= 5 && expense.dueDay >= today);
                const isOverdue = expense.dueDay && expense.dueDay < today;

                return (
                  <div key={expense.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'flex items-center justify-center w-10 h-10 rounded-full',
                        isOverdue ? 'bg-destructive/10' : isDueSoon ? 'bg-warning/10' : 'bg-muted'
                      )}>
                        <Calendar className={cn(
                          'w-4 h-4',
                          isOverdue ? 'text-destructive' : isDueSoon ? 'text-warning' : 'text-foreground'
                        )} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{expense.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {expense.category} • Vencimento dia {expense.dueDay}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-foreground">
                        {formatCurrency(expense.amount)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleExpenseNotification(expense)}
                      >
                        {expense.notificationsEnabled ? (
                          <Bell className="w-4 h-4 text-foreground" />
                        ) : (
                          <BellOff className="w-4 h-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteFixedExpense(expense.id)}
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Despesas Variáveis */}
        <TabsContent value="variaveis" className="mt-0">
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => {
                setEntryType('expense');
                setIsAddEntryModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova despesa variável
            </Button>
          </div>

          {entries.filter((e) => e.type === 'expense').length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <p className="text-muted-foreground">Nenhuma despesa variável registrada.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {entries
                .filter((e) => e.type === 'expense')
                .map((expense) => (
                  <Card key={expense.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-destructive/20 flex-shrink-0">
                            <TrendingDown className="w-5 h-5 text-destructive" />
                          </div>
                          <div>
                            <p className="font-medium">{expense.description}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Badge variant="secondary" className="text-xs">
                                {expense.category || 'Sem categoria'}
                              </Badge>
                              <span>•</span>
                              <span>{formatDate(expense.date)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-destructive">
                            -{formatCurrency(expense.amount)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditEntry(expense)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDeleteEntry(expense.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        {/* Compras */}
        <TabsContent value="compras" className="mt-0">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setIsAddPurchaseGoalModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova meta de compra
            </Button>
          </div>

          {purchaseGoals.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <p className="text-muted-foreground">Nenhuma meta de compra.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {purchaseGoals.map((goal) => {
                const progress = (goal.savedAmount / goal.targetAmount) * 100;

                return (
                  <Card key={goal.id} className="flex flex-col overflow-hidden">
                    {goal.imageUrl && (
                      <div className="aspect-video bg-muted">
                        <img src={goal.imageUrl} alt={goal.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold">{goal.name}</CardTitle>
                        <span className={cn('text-xs font-medium', getPriorityColor(goal.priority))}>
                          {goal.priority === 'high' ? 'Alta' : goal.priority === 'medium' ? 'Média' : 'Baixa'}
                        </span>
                      </div>
                      {goal.description && (
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                      )}
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-foreground">
                            {formatCurrency(goal.savedAmount)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            de {formatCurrency(goal.targetAmount)}
                          </span>
                        </div>
                        <ProgressBar value={Math.min(progress, 100)} />
                      </div>

                      <div className="flex gap-2 mt-auto pt-3 border-t border-border">
                        {goal.storeLink && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => window.open(goal.storeLink, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Ver loja
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeletePurchaseGoal(goal.id)}
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Consórcio */}
        <TabsContent value="consorcio" className="mt-0">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setIsAddConsortiumModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo consórcio
            </Button>
          </div>

          {consortiums.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <p className="text-muted-foreground">Nenhum consórcio cadastrado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {consortiums.map((consortium) => {
                const progress = (consortium.paidInstallments / consortium.installments) * 100;
                const installmentValue = consortium.totalAmount / consortium.installments;
                const isComplete = consortium.paidInstallments >= consortium.installments;

                return (
                  <Card key={consortium.id} className={cn('flex flex-col', isComplete && 'opacity-60')}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold">{consortium.goal}</CardTitle>
                        <span className="text-lg font-bold text-foreground">
                          {formatCurrency(consortium.totalAmount)}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Parcelas pagas</span>
                          <span className="font-medium text-foreground">
                            {consortium.paidInstallments}/{consortium.installments}
                          </span>
                        </div>
                        <ProgressBar value={progress} size="sm" />
                        <p className="text-xs text-muted-foreground">
                          Parcela: {formatCurrency(installmentValue)}
                        </p>
                      </div>

                      <div className="flex gap-2 mt-auto pt-3 border-t border-border">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          disabled={isComplete}
                          onClick={() => payConsortiumInstallment(consortium.id)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Pagar parcela
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteConsortium(consortium.id)}
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Relatórios */}
        <TabsContent value="relatorios" className="mt-0">
          <FinancialReport
            entries={entries}
            piggyBanks={piggyBanks}
            fixedExpenses={fixedExpenses}
            allocations={allocations}
          />
        </TabsContent>
      </Tabs>

      {/* Add Entry Modal */}
      <Dialog open={isAddEntryModalOpen} onOpenChange={setIsAddEntryModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {entryType === 'income' ? 'Nova Entrada' : 'Nova Saída'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                value={newEntry.description}
                onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                placeholder="Ex: Salário, Conta de luz..."
              />
            </div>
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                value={newEntry.amount}
                onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
                placeholder="0,00"
                min="0"
                step="0.01"
              />
            </div>
            {entryType === 'expense' && (
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={newEntry.expenseCategory}
                  onValueChange={(value) => setNewEntry({ ...newEntry, expenseCategory: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alimentação">Alimentação</SelectItem>
                    <SelectItem value="Transporte">Transporte</SelectItem>
                    <SelectItem value="Lazer">Lazer</SelectItem>
                    <SelectItem value="Saúde">Saúde</SelectItem>
                    <SelectItem value="Educação">Educação</SelectItem>
                    <SelectItem value="Vestuário">Vestuário</SelectItem>
                    <SelectItem value="Moradia">Moradia</SelectItem>
                    <SelectItem value="Serviços">Serviços</SelectItem>
                    <SelectItem value="Assinaturas">Assinaturas</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEntryModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddEntry}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Receivable Modal */}
      <Dialog open={isAddReceivableModalOpen} onOpenChange={setIsAddReceivableModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo valor a receber</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da pessoa</Label>
              <Input
                value={newReceivable.personName}
                onChange={(e) => setNewReceivable({ ...newReceivable, personName: e.target.value })}
                placeholder="Quem está devendo?"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Input
                value={newReceivable.description}
                onChange={(e) => setNewReceivable({ ...newReceivable, description: e.target.value })}
                placeholder="Referente a..."
              />
            </div>
            <div className="space-y-2">
              <Label>Valor total (R$)</Label>
              <Input
                type="number"
                value={newReceivable.totalAmount}
                onChange={(e) => setNewReceivable({ ...newReceivable, totalAmount: e.target.value })}
                placeholder="0,00"
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label>Número de parcelas</Label>
              <Input
                type="number"
                value={newReceivable.installments}
                onChange={(e) => setNewReceivable({ ...newReceivable, installments: e.target.value })}
                placeholder="1"
                min="1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddReceivableModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddReceivable}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Piggy Bank Modal */}
      <Dialog open={isAddPiggyBankModalOpen} onOpenChange={setIsAddPiggyBankModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Cofrinho</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome do cofrinho</Label>
              <Input
                value={newPiggyBank.name}
                onChange={(e) => setNewPiggyBank({ ...newPiggyBank, name: e.target.value })}
                placeholder="Ex: Viagem, Emergência..."
              />
            </div>
            <div className="space-y-2">
              <Label>Meta (R$)</Label>
              <Input
                type="number"
                value={newPiggyBank.targetAmount}
                onChange={(e) => setNewPiggyBank({ ...newPiggyBank, targetAmount: e.target.value })}
                placeholder="0,00"
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex gap-2">
                {['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewPiggyBank({ ...newPiggyBank, color })}
                    className={cn(
                      'w-8 h-8 rounded-full transition-transform',
                      newPiggyBank.color === color && 'ring-2 ring-offset-2 ring-foreground scale-110'
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPiggyBankModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddPiggyBank}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deposit/Withdraw Modal */}
      <Dialog open={isDepositModalOpen} onOpenChange={setIsDepositModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedPiggyBank?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center p-4 bg-secondary/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Saldo atual</p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(selectedPiggyBank?.currentAmount || 0)}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="0,00"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setIsDepositModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="outline" onClick={handleWithdraw} disabled={!depositAmount}>
              <ArrowUpFromLine className="w-4 h-4 mr-1" />
              Retirar
            </Button>
            <Button onClick={handleDeposit} disabled={!depositAmount}>
              <ArrowDownToLine className="w-4 h-4 mr-1" />
              Depositar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Fixed Expense Modal */}
      <Dialog open={isAddFixedExpenseModalOpen} onOpenChange={setIsAddFixedExpenseModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Despesa Fixa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={newFixedExpense.name}
                onChange={(e) => setNewFixedExpense({ ...newFixedExpense, name: e.target.value })}
                placeholder="Ex: Aluguel, Internet..."
              />
            </div>
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                value={newFixedExpense.amount}
                onChange={(e) => setNewFixedExpense({ ...newFixedExpense, amount: e.target.value })}
                placeholder="0,00"
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label>Dia do vencimento</Label>
              <Input
                type="number"
                value={newFixedExpense.dueDay}
                onChange={(e) => setNewFixedExpense({ ...newFixedExpense, dueDay: e.target.value })}
                placeholder="1-31"
                min="1"
                max="31"
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={newFixedExpense.category}
                onValueChange={(value) => setNewFixedExpense({ ...newFixedExpense, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Moradia">Moradia</SelectItem>
                  <SelectItem value="Transporte">Transporte</SelectItem>
                  <SelectItem value="Alimentação">Alimentação</SelectItem>
                  <SelectItem value="Saúde">Saúde</SelectItem>
                  <SelectItem value="Educação">Educação</SelectItem>
                  <SelectItem value="Lazer">Lazer</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddFixedExpenseModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddFixedExpense}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Purchase Goal Modal */}
      <Dialog open={isAddPurchaseGoalModalOpen} onOpenChange={setIsAddPurchaseGoalModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Meta de Compra</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>O que você quer comprar?</Label>
              <Input
                value={newPurchaseGoal.name}
                onChange={(e) => setNewPurchaseGoal({ ...newPurchaseGoal, name: e.target.value })}
                placeholder="Ex: iPhone, Notebook..."
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Input
                value={newPurchaseGoal.description}
                onChange={(e) => setNewPurchaseGoal({ ...newPurchaseGoal, description: e.target.value })}
                placeholder="Modelo, cor, etc..."
              />
            </div>
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                value={newPurchaseGoal.targetAmount}
                onChange={(e) => setNewPurchaseGoal({ ...newPurchaseGoal, targetAmount: e.target.value })}
                placeholder="0,00"
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label>Link da loja (opcional)</Label>
              <Input
                value={newPurchaseGoal.storeLink}
                onChange={(e) => setNewPurchaseGoal({ ...newPurchaseGoal, storeLink: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select
                value={newPurchaseGoal.priority}
                onValueChange={(value: 'low' | 'medium' | 'high') =>
                  setNewPurchaseGoal({ ...newPurchaseGoal, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Imagem (opcional)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Cole o link da imagem..."
                  value={newPurchaseGoal.imageUrl}
                  onChange={(e) => setNewPurchaseGoal({ ...newPurchaseGoal, imageUrl: e.target.value })}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => purchaseImageInputRef.current?.click()}
                >
                  <Image className="w-4 h-4" />
                </Button>
              </div>
              <input
                ref={purchaseImageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePurchaseImageUpload}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPurchaseGoalModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddPurchaseGoal}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Consortium Modal */}
      <Dialog open={isAddConsortiumModalOpen} onOpenChange={setIsAddConsortiumModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Consórcio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Objetivo</Label>
              <Input
                value={newConsortium.goal}
                onChange={(e) => setNewConsortium({ ...newConsortium, goal: e.target.value })}
                placeholder="Ex: Carro, Imóvel..."
              />
            </div>
            <div className="space-y-2">
              <Label>Valor total (R$)</Label>
              <Input
                type="number"
                value={newConsortium.totalAmount}
                onChange={(e) => setNewConsortium({ ...newConsortium, totalAmount: e.target.value })}
                placeholder="0,00"
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label>Número de parcelas</Label>
              <Input
                type="number"
                value={newConsortium.installments}
                onChange={(e) => setNewConsortium({ ...newConsortium, installments: e.target.value })}
                placeholder="Ex: 60"
                min="1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddConsortiumModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddConsortium}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Entry Allocation Modal */}
      <EntryAllocationModal
        isOpen={isAllocationModalOpen}
        onClose={() => {
          setIsAllocationModalOpen(false);
          setSelectedEntryForAllocation(null);
        }}
        entry={selectedEntryForAllocation}
        allocations={allocations}
        piggyBanks={piggyBanks}
        fixedExpenses={fixedExpenses}
        onAddAllocation={async (data) => {
          await addAllocation(data);
        }}
        onUpdateAllocation={async (id, data) => {
          return await updateAllocation(id, data);
        }}
        onDeleteAllocation={async (id) => {
          await deleteAllocation(id);
        }}
      />

      {/* Edit Entry Modal */}
      <Dialog open={isEditEntryModalOpen} onOpenChange={setIsEditEntryModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Editar {editingEntry?.type === 'income' ? 'Entrada' : 'Saída'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                value={editEntryData.description}
                onChange={(e) => setEditEntryData({ ...editEntryData, description: e.target.value })}
                placeholder="Ex: Salário, Freelance..."
              />
            </div>
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                value={editEntryData.amount}
                onChange={(e) => setEditEntryData({ ...editEntryData, amount: e.target.value })}
                placeholder="0,00"
                min="0"
                step="0.01"
              />
            </div>
            
            {/* Show allocations for income entries */}
            {editingEntry?.type === 'income' && (
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <Label>Destinos alocados</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditEntryModalOpen(false);
                      setSelectedEntryForAllocation(editingEntry);
                      setIsAllocationModalOpen(true);
                    }}
                  >
                    <Split className="w-4 h-4 mr-2" />
                    Gerenciar alocações
                  </Button>
                </div>
                {(() => {
                  const entryAllocations = allocations.filter(a => a.entryId === editingEntry.id);
                  if (entryAllocations.length === 0) {
                    return (
                      <p className="text-sm text-muted-foreground">
                        Nenhum destino alocado ainda.
                      </p>
                    );
                  }
                  return (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {entryAllocations.map((allocation) => (
                        <div
                          key={allocation.id}
                          className="flex items-center justify-between p-2 bg-muted/50 rounded-lg text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              'w-2 h-2 rounded-full',
                              allocation.destinationType === 'piggy_bank' ? 'bg-success' :
                              allocation.destinationType === 'expense' || allocation.destinationType === 'fixed_expense' ? 'bg-destructive' :
                              'bg-primary'
                            )} />
                            <span className="text-foreground">{allocation.destinationName}</span>
                          </div>
                          <span className="font-medium text-foreground">
                            {formatCurrency(allocation.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditEntryModalOpen(false);
                setEditingEntry(null);
                setEditEntryData({ description: '', amount: '' });
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdateEntry}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
