import { useState, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useFinancial, FinancialEntry, PiggyBank, FixedExpense } from '@/hooks/useFinancial';
import { EntryAllocationModal } from '@/components/financial/EntryAllocationModal';
import { FinancialReport } from '@/components/financial/FinancialReport';
import { Receivable, PurchaseGoal, Consortium, InstallmentPayment } from '@/types';
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
  Calendar as CalendarIcon,
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
  Infinity,
  FileText,
  Upload,
  X,
  Eye,
  EyeOff,
  Download,
  History,
  Clock,
  Calculator,
} from 'lucide-react';
import { BudgetDraft } from '@/components/financial/BudgetDraft';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

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
  
  // Hidden values state
  const [hiddenCards, setHiddenCards] = useState<Set<string>>(new Set());
  
  const toggleCardVisibility = (cardId: string) => {
    setHiddenCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  // State for receivables (local for now)
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [isAddReceivableModalOpen, setIsAddReceivableModalOpen] = useState(false);
  const [isEditReceivableModalOpen, setIsEditReceivableModalOpen] = useState(false);
  const [isViewReceivableModalOpen, setIsViewReceivableModalOpen] = useState(false);
  const [viewingReceivable, setViewingReceivable] = useState<Receivable | null>(null);
  const [editingReceivable, setEditingReceivable] = useState<Receivable | null>(null);
  const [newReceivable, setNewReceivable] = useState({
    personName: '',
    description: '',
    installmentValue: '',
    installments: '1',
    isIndefinite: false,
    dueDateType: 'none' as 'none' | 'single' | 'recurring',
    dueDate: undefined as Date | undefined,
    recurringDay: '1',
    notes: '',
    receipts: [] as string[],
  });

  // Ref for file input
  const receiptInputRef = useRef<HTMLInputElement>(null);
  const editReceiptInputRef = useRef<HTMLInputElement>(null);

  // State for payment registration modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedReceivableForPayment, setSelectedReceivableForPayment] = useState<Receivable | null>(null);
  const [newPayment, setNewPayment] = useState({
    date: new Date(),
    amount: '',
    notes: '',
  });
  const [editingPayment, setEditingPayment] = useState<InstallmentPayment | null>(null);

  // State for piggy banks
  const [isAddPiggyBankModalOpen, setIsAddPiggyBankModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedPiggyBank, setSelectedPiggyBank] = useState<PiggyBank | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [newPiggyBank, setNewPiggyBank] = useState<{ name: string; targetAmount: string; color: string }>({
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
    if (newReceivable.personName && newReceivable.installmentValue) {
      const installmentValue = parseCurrencyToNumber(newReceivable.installmentValue);
      const installments = newReceivable.isIndefinite ? null : (parseInt(newReceivable.installments) || 1);
      const receivable: Receivable = {
        id: Date.now().toString(),
        personName: newReceivable.personName,
        description: newReceivable.description,
        totalAmount: installments ? installmentValue * installments : installmentValue,
        installments: installments,
        paidInstallments: 0,
        createdAt: new Date(),
        dueDate: newReceivable.dueDateType === 'single' ? newReceivable.dueDate : undefined,
        recurringDay: newReceivable.dueDateType === 'recurring' ? parseInt(newReceivable.recurringDay) : undefined,
        notes: newReceivable.notes || undefined,
        receipts: newReceivable.receipts.length > 0 ? newReceivable.receipts : undefined,
      };
      setReceivables([receivable, ...receivables]);
      setNewReceivable({ personName: '', description: '', installmentValue: '', installments: '1', isIndefinite: false, dueDateType: 'none', dueDate: undefined, recurringDay: '1', notes: '', receipts: [] });
      setIsAddReceivableModalOpen(false);
    }
  };

  const openPaymentModal = (receivable: Receivable) => {
    const installmentValue = receivable.installments 
      ? receivable.totalAmount / receivable.installments 
      : receivable.totalAmount / Math.max(receivable.paidInstallments, 1);
    setSelectedReceivableForPayment(receivable);
    setNewPayment({
      date: new Date(),
      amount: formatCurrency(installmentValue),
      notes: '',
    });
    setEditingPayment(null);
    setIsPaymentModalOpen(true);
  };

  const handleAddPayment = () => {
    if (!selectedReceivableForPayment || !newPayment.amount) return;
    
    const amount = parseCurrencyToNumber(newPayment.amount);
    const payment: InstallmentPayment = {
      id: Date.now().toString(),
      date: newPayment.date,
      amount,
      notes: newPayment.notes || undefined,
    };

    setReceivables(
      receivables.map((r) => {
        if (r.id !== selectedReceivableForPayment.id) return r;
        
        const newHistory = [...(r.paymentHistory || []), payment];
        const newPaidInstallments = r.paidInstallments + 1;
        const newTotalAmount = r.installments === null 
          ? (r.totalAmount / Math.max(r.paidInstallments, 1)) * newPaidInstallments 
          : r.totalAmount;
        
        return {
          ...r,
          paidInstallments: newPaidInstallments,
          totalAmount: newTotalAmount,
          paymentHistory: newHistory,
        };
      })
    );

    // Update viewing receivable if open
    if (viewingReceivable?.id === selectedReceivableForPayment.id) {
      setViewingReceivable(prev => {
        if (!prev) return null;
        const newHistory = [...(prev.paymentHistory || []), payment];
        return {
          ...prev,
          paidInstallments: prev.paidInstallments + 1,
          paymentHistory: newHistory,
        };
      });
    }

    setIsPaymentModalOpen(false);
    setSelectedReceivableForPayment(null);
    setNewPayment({ date: new Date(), amount: '', notes: '' });
  };

  const handleEditPayment = (payment: InstallmentPayment) => {
    setEditingPayment(payment);
    setNewPayment({
      date: new Date(payment.date),
      amount: formatCurrency(payment.amount),
      notes: payment.notes || '',
    });
  };

  const handleUpdatePayment = () => {
    if (!viewingReceivable || !editingPayment) return;
    
    const amount = parseCurrencyToNumber(newPayment.amount);
    const updatedPayment: InstallmentPayment = {
      ...editingPayment,
      date: newPayment.date,
      amount,
      notes: newPayment.notes || undefined,
    };

    const updatedReceivable = {
      ...viewingReceivable,
      paymentHistory: (viewingReceivable.paymentHistory || []).map((p) =>
        p.id === editingPayment.id ? updatedPayment : p
      ),
    };

    setReceivables(receivables.map((r) => r.id === viewingReceivable.id ? updatedReceivable : r));
    setViewingReceivable(updatedReceivable);
    setEditingPayment(null);
    setNewPayment({ date: new Date(), amount: '', notes: '' });
  };

  const handleDeletePayment = (paymentId: string) => {
    if (!viewingReceivable) return;

    const paymentToDelete = viewingReceivable.paymentHistory?.find(p => p.id === paymentId);
    if (!paymentToDelete) return;

    const updatedReceivable = {
      ...viewingReceivable,
      paidInstallments: Math.max(0, viewingReceivable.paidInstallments - 1),
      paymentHistory: (viewingReceivable.paymentHistory || []).filter((p) => p.id !== paymentId),
    };

    setReceivables(receivables.map((r) => r.id === viewingReceivable.id ? updatedReceivable : r));
    setViewingReceivable(updatedReceivable);
  };

  const handleDeleteReceivable = (id: string) => {
    setReceivables(receivables.filter((r) => r.id !== id));
  };

  const handleEditReceivable = (receivable: Receivable) => {
    setEditingReceivable(receivable);
    setIsEditReceivableModalOpen(true);
  };

  const handleUpdateReceivable = () => {
    if (editingReceivable) {
      setReceivables(
        receivables.map((r) =>
          r.id === editingReceivable.id ? editingReceivable : r
        )
      );
      setIsEditReceivableModalOpen(false);
      setEditingReceivable(null);
    }
  };

  // Handlers for piggy banks
  const handleAddPiggyBank = async () => {
    if (newPiggyBank.name && newPiggyBank.targetAmount) {
      await addPiggyBank({
        name: newPiggyBank.name,
        targetAmount: parseCurrencyToNumber(newPiggyBank.targetAmount),
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
        currentAmount: selectedPiggyBank.currentAmount + parseCurrencyToNumber(depositAmount),
      });
      setDepositAmount('');
      setIsDepositModalOpen(false);
      setSelectedPiggyBank(null);
    }
  };

  const handleWithdraw = async () => {
    if (selectedPiggyBank && depositAmount) {
      const amount = parseCurrencyToNumber(depositAmount);
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
          hideable
          isHidden={hiddenCards.has('income')}
          onToggleHidden={() => toggleCardVisibility('income')}
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
            <div className="flex items-start justify-between">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-rose-500/20 mb-3">
                <TrendingDown className="w-5 h-5 text-rose-600" />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 -mt-1 -mr-1"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCardVisibility('expenses');
                }}
                title={hiddenCards.has('expenses') ? 'Mostrar valor' : 'Ocultar valor'}
              >
                {hiddenCards.has('expenses') ? (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Eye className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Despesas fixas</p>
                <p className={cn(
                  "text-2xl font-bold text-foreground transition-all",
                  hiddenCards.has('expenses') && "blur-md select-none"
                )}>
                  {formatCurrency(totalFixedExpenses)}
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
                  <span className={cn(
                    "text-sm font-semibold transition-all",
                    hiddenCards.has('expenses') && "blur-md select-none"
                  )}>
                    {formatCurrency(totalFixedExpenses)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <span className="text-sm text-muted-foreground">Variáveis</span>
                  </div>
                  <span className={cn(
                    "text-sm font-semibold transition-all",
                    hiddenCards.has('expenses') && "blur-md select-none"
                  )}>
                    {formatCurrency(totalVariableExpenses)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <span className="text-sm font-medium text-muted-foreground">Total</span>
                  <span className={cn(
                    "text-sm font-bold text-foreground transition-all",
                    hiddenCards.has('expenses') && "blur-md select-none"
                  )}>
                    {formatCurrency(totalFixedExpenses + totalVariableExpenses)}
                  </span>
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
          hideable
          isHidden={hiddenCards.has('receivables')}
          onToggleHidden={() => toggleCardVisibility('receivables')}
        />
        <StatCard 
          title="Guardado" 
          value={formatCurrency(totalSaved)} 
          icon={PiggyBankIcon} 
          iconBgClassName="bg-sky-500/20"
          hideable
          isHidden={hiddenCards.has('saved')}
          onToggleHidden={() => toggleCardVisibility('saved')}
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
          <TabsTrigger value="rascunho" className="gap-1.5">
            <Calculator className="w-4 h-4" />
            Rascunho
          </TabsTrigger>
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
                const isIndefinite = receivable.installments === null;
                const installmentValue = isIndefinite 
                  ? (receivable.totalAmount / Math.max(receivable.paidInstallments, 1))
                  : (receivable.totalAmount / receivable.installments);
                const progress = isIndefinite ? 0 : (receivable.paidInstallments / receivable.installments) * 100;
                const isComplete = !isIndefinite && receivable.paidInstallments >= receivable.installments;
                const totalReceived = installmentValue * receivable.paidInstallments;

                return (
                  <Card 
                    key={receivable.id} 
                    className={cn('flex flex-col cursor-pointer hover:border-foreground/20 transition-colors', isComplete && 'opacity-60')}
                    onClick={() => {
                      setViewingReceivable(receivable);
                      setIsViewReceivableModalOpen(true);
                    }}
                  >
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
                        <div className="text-right">
                          <span className="text-lg font-bold text-foreground">
                            {isIndefinite ? formatCurrency(installmentValue) : formatCurrency(receivable.totalAmount)}
                          </span>
                          {isIndefinite && (
                            <p className="text-xs text-muted-foreground">/parcela</p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Parcelas pagas</span>
                          <span className="font-medium text-foreground flex items-center gap-1">
                            {receivable.paidInstallments}
                            {isIndefinite ? (
                              <Infinity className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <>/{receivable.installments}</>
                            )}
                          </span>
                        </div>
                        {!isIndefinite && <ProgressBar value={progress} size="sm" />}
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Parcela: {formatCurrency(installmentValue)}</span>
                          <span className="text-emerald-600 font-medium">
                            Recebido: {formatCurrency(totalReceived)}
                          </span>
                        </div>
                        {receivable.dueDate && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <CalendarIcon className="w-3 h-3" />
                            Vencimento: {format(new Date(receivable.dueDate), "dd/MM/yyyy")}
                          </div>
                        )}
                        {receivable.recurringDay && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <CalendarIcon className="w-3 h-3" />
                            Todo dia {receivable.recurringDay}
                          </div>
                        )}
                        {receivable.notes && (
                          <div className="mt-2 p-2 bg-muted/50 rounded-md">
                            <p className="text-xs text-muted-foreground">{receivable.notes}</p>
                          </div>
                        )}
                        {receivable.receipts && receivable.receipts.length > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            <FileText className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {receivable.receipts.length} comprovante{receivable.receipts.length > 1 ? 's' : ''}
                            </span>
                            <div className="flex gap-1">
                              {receivable.receipts.map((receipt, index) => (
                                <button
                                  key={index}
                                  onClick={() => window.open(receipt, '_blank')}
                                  className="text-xs text-primary hover:underline flex items-center gap-0.5"
                                >
                                  <Eye className="w-3 h-3" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-auto pt-3 border-t border-border" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          disabled={isComplete}
                          onClick={(e) => {
                            e.stopPropagation();
                            openPaymentModal(receivable);
                          }}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Receber parcela
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditReceivable(receivable);
                          }}
                        >
                          <Edit className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteReceivable(receivable.id);
                          }}
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

        {/* Rascunho */}
        <TabsContent value="rascunho" className="mt-0">
          <BudgetDraft />
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
              <Label>Valor da parcela (R$)</Label>
              <Input
                type="text"
                inputMode="numeric"
                value={newReceivable.installmentValue}
                onChange={(e) => setNewReceivable({ ...newReceivable, installmentValue: formatCurrency(e.target.value) })}
                placeholder="R$ 0,00"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="indefinite"
                checked={newReceivable.isIndefinite}
                onCheckedChange={(checked) => setNewReceivable({ ...newReceivable, isIndefinite: checked })}
              />
              <Label htmlFor="indefinite" className="flex items-center gap-1">
                <Infinity className="w-4 h-4" />
                Parcelas indefinidas
              </Label>
            </div>
            {!newReceivable.isIndefinite && (
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
            )}
            <div className="space-y-2">
              <Label>Vencimento</Label>
              <Select
                value={newReceivable.dueDateType}
                onValueChange={(value: 'none' | 'single' | 'recurring') => setNewReceivable({ ...newReceivable, dueDateType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem vencimento</SelectItem>
                  <SelectItem value="single">Data específica</SelectItem>
                  <SelectItem value="recurring">Todo mês (dia fixo)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newReceivable.dueDateType === 'single' && (
              <div className="space-y-2">
                <Label>Data de vencimento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newReceivable.dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newReceivable.dueDate ? format(newReceivable.dueDate, "dd/MM/yyyy") : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newReceivable.dueDate}
                      onSelect={(date) => setNewReceivable({ ...newReceivable, dueDate: date })}
                      initialFocus
                      className="pointer-events-auto"
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
            {newReceivable.dueDateType === 'recurring' && (
              <div className="space-y-2">
                <Label>Dia do mês</Label>
                <Select
                  value={newReceivable.recurringDay}
                  onValueChange={(value) => setNewReceivable({ ...newReceivable, recurringDay: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar dia" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        Dia {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {newReceivable.installmentValue && !newReceivable.isIndefinite && parseInt(newReceivable.installments) > 0 && (
              <div className="p-3 bg-secondary/50 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Valor total</p>
                <p className="text-lg font-bold text-foreground">
                  {formatCurrency(parseCurrencyToNumber(newReceivable.installmentValue) * (parseInt(newReceivable.installments) || 1))}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label>Observações (opcional)</Label>
              <Textarea
                value={newReceivable.notes}
                onChange={(e) => setNewReceivable({ ...newReceivable, notes: e.target.value })}
                placeholder="Adicione observações, detalhes do acordo, etc..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Comprovantes (opcional)</Label>
              <input
                type="file"
                ref={receiptInputRef}
                className="hidden"
                accept="image/*,.pdf"
                multiple
                onChange={(e) => {
                  const files = e.target.files;
                  if (files) {
                    Array.from(files).forEach(file => {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setNewReceivable(prev => ({
                          ...prev,
                          receipts: [...prev.receipts, reader.result as string]
                        }));
                      };
                      reader.readAsDataURL(file);
                    });
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => receiptInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Enviar comprovantes
              </Button>
              {newReceivable.receipts.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {newReceivable.receipts.map((receipt, index) => (
                    <div key={index} className="relative group">
                      {receipt.startsWith('data:image') ? (
                        <img
                          src={receipt}
                          alt={`Comprovante ${index + 1}`}
                          className="w-16 h-16 object-cover rounded-lg border border-border"
                        />
                      ) : (
                        <div className="w-16 h-16 flex items-center justify-center bg-muted rounded-lg border border-border">
                          <FileText className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <button
                        type="button"
                        className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setNewReceivable(prev => ({
                          ...prev,
                          receipts: prev.receipts.filter((_, i) => i !== index)
                        }))}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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

      {/* Edit Receivable Modal */}
      <Dialog open={isEditReceivableModalOpen} onOpenChange={setIsEditReceivableModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar A Receber</DialogTitle>
          </DialogHeader>
          {editingReceivable && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome da pessoa</Label>
                <Input
                  value={editingReceivable.personName}
                  onChange={(e) => setEditingReceivable({ ...editingReceivable, personName: e.target.value })}
                  placeholder="Nome de quem deve"
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição (opcional)</Label>
                <Input
                  value={editingReceivable.description}
                  onChange={(e) => setEditingReceivable({ ...editingReceivable, description: e.target.value })}
                  placeholder="Referente a..."
                />
              </div>
              <div className="space-y-2">
                <Label>Valor da parcela (R$)</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={formatCurrency(editingReceivable.installments ? editingReceivable.totalAmount / editingReceivable.installments : editingReceivable.totalAmount / Math.max(editingReceivable.paidInstallments, 1))}
                  onChange={(e) => {
                    const installmentValue = parseCurrencyToNumber(e.target.value);
                    const installments = editingReceivable.installments || 1;
                    setEditingReceivable({ ...editingReceivable, totalAmount: installmentValue * installments });
                  }}
                  placeholder="R$ 0,00"
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="edit-indefinite"
                  checked={editingReceivable.installments === null}
                  onCheckedChange={(checked) => setEditingReceivable({ ...editingReceivable, installments: checked ? null : 1 })}
                />
                <Label htmlFor="edit-indefinite" className="flex items-center gap-1">
                  <Infinity className="w-4 h-4" />
                  Parcelas indefinidas
                </Label>
              </div>
              {editingReceivable.installments !== null && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Total de parcelas</Label>
                    <Input
                      type="number"
                      value={editingReceivable.installments}
                      onChange={(e) => setEditingReceivable({ ...editingReceivable, installments: parseInt(e.target.value) || 1 })}
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Parcelas pagas</Label>
                    <Input
                      type="number"
                      value={editingReceivable.paidInstallments}
                      onChange={(e) => setEditingReceivable({ ...editingReceivable, paidInstallments: Math.min(parseInt(e.target.value) || 0, editingReceivable.installments || 1) })}
                      min="0"
                      max={editingReceivable.installments || undefined}
                    />
                  </div>
                </div>
              )}
              {editingReceivable.installments === null && (
                <div className="space-y-2">
                  <Label>Parcelas pagas</Label>
                  <Input
                    type="number"
                    value={editingReceivable.paidInstallments}
                    onChange={(e) => setEditingReceivable({ ...editingReceivable, paidInstallments: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>Vencimento</Label>
                <Select
                  value={editingReceivable.recurringDay ? 'recurring' : editingReceivable.dueDate ? 'single' : 'none'}
                  onValueChange={(value: 'none' | 'single' | 'recurring') => {
                    if (value === 'none') {
                      setEditingReceivable({ ...editingReceivable, dueDate: undefined, recurringDay: undefined });
                    } else if (value === 'single') {
                      setEditingReceivable({ ...editingReceivable, recurringDay: undefined });
                    } else {
                      setEditingReceivable({ ...editingReceivable, dueDate: undefined, recurringDay: editingReceivable.recurringDay || 1 });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem vencimento</SelectItem>
                    <SelectItem value="single">Data específica</SelectItem>
                    <SelectItem value="recurring">Todo mês (dia fixo)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editingReceivable.dueDate !== undefined && !editingReceivable.recurringDay && (
                <div className="space-y-2">
                  <Label>Data de vencimento</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !editingReceivable.dueDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editingReceivable.dueDate ? format(new Date(editingReceivable.dueDate), "dd/MM/yyyy") : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={editingReceivable.dueDate ? new Date(editingReceivable.dueDate) : undefined}
                        onSelect={(date) => setEditingReceivable({ ...editingReceivable, dueDate: date })}
                        initialFocus
                        className="pointer-events-auto"
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
              {editingReceivable.recurringDay && (
                <div className="space-y-2">
                  <Label>Dia do mês</Label>
                  <Select
                    value={editingReceivable.recurringDay.toString()}
                    onValueChange={(value) => setEditingReceivable({ ...editingReceivable, recurringDay: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar dia" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                        <SelectItem key={day} value={day.toString()}>
                          Dia {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label>Observações (opcional)</Label>
                <Textarea
                  value={editingReceivable.notes || ''}
                  onChange={(e) => setEditingReceivable({ ...editingReceivable, notes: e.target.value || undefined })}
                  placeholder="Adicione observações, detalhes do acordo, etc..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Comprovantes</Label>
                <input
                  type="file"
                  ref={editReceiptInputRef}
                  className="hidden"
                  accept="image/*,.pdf"
                  multiple
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files) {
                      Array.from(files).forEach(file => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setEditingReceivable(prev => prev ? {
                            ...prev,
                            receipts: [...(prev.receipts || []), reader.result as string]
                          } : null);
                        };
                        reader.readAsDataURL(file);
                      });
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => editReceiptInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Enviar comprovantes
                </Button>
                {editingReceivable.receipts && editingReceivable.receipts.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {editingReceivable.receipts.map((receipt, index) => (
                      <div key={index} className="relative group">
                        {receipt.startsWith('data:image') ? (
                          <img
                            src={receipt}
                            alt={`Comprovante ${index + 1}`}
                            className="w-16 h-16 object-cover rounded-lg border border-border"
                          />
                        ) : (
                          <div className="w-16 h-16 flex items-center justify-center bg-muted rounded-lg border border-border">
                            <FileText className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                        <button
                          type="button"
                          className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setEditingReceivable(prev => prev ? {
                            ...prev,
                            receipts: (prev.receipts || []).filter((_, i) => i !== index)
                          } : null)}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditReceivableModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateReceivable}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Receivable Modal - Library */}
      <Dialog open={isViewReceivableModalOpen} onOpenChange={setIsViewReceivableModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {viewingReceivable?.personName}
            </DialogTitle>
          </DialogHeader>
          {viewingReceivable && (
            <div className="space-y-6">
              {/* Info Section */}
              <div className="space-y-3">
                {viewingReceivable.description && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Descrição</p>
                    <p className="text-foreground">{viewingReceivable.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Valor da parcela</p>
                    <p className="text-lg font-bold text-foreground">
                      {formatCurrency(viewingReceivable.installments 
                        ? viewingReceivable.totalAmount / viewingReceivable.installments 
                        : viewingReceivable.totalAmount / Math.max(viewingReceivable.paidInstallments, 1))}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Parcelas</p>
                    <p className="text-lg font-bold text-foreground flex items-center gap-1">
                      {viewingReceivable.paidInstallments}
                      {viewingReceivable.installments === null ? (
                        <Infinity className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <>/{viewingReceivable.installments}</>
                      )}
                    </p>
                  </div>
                </div>

                {(viewingReceivable.dueDate || viewingReceivable.recurringDay) && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Vencimento</p>
                    <p className="text-foreground flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      {viewingReceivable.dueDate 
                        ? format(new Date(viewingReceivable.dueDate), "dd/MM/yyyy")
                        : `Todo dia ${viewingReceivable.recurringDay}`}
                    </p>
                  </div>
                )}
              </div>

              {/* Payment History Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <History className="w-4 h-4" />
                    Histórico de Pagamentos ({viewingReceivable.paymentHistory?.length || 0})
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      openPaymentModal(viewingReceivable);
                    }}
                    disabled={viewingReceivable.installments !== null && viewingReceivable.paidInstallments >= viewingReceivable.installments}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Registrar
                  </Button>
                </div>
                
                {viewingReceivable.paymentHistory && viewingReceivable.paymentHistory.length > 0 ? (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {[...viewingReceivable.paymentHistory]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((payment, index) => (
                        <div
                          key={payment.id}
                          className={cn(
                            'p-3 rounded-lg border border-border bg-muted/30',
                            editingPayment?.id === payment.id && 'ring-2 ring-primary'
                          )}
                        >
                          {editingPayment?.id === payment.id ? (
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label className="text-xs">Data</Label>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full justify-start text-left font-normal"
                                      >
                                        <CalendarIcon className="w-3 h-3 mr-1" />
                                        {format(newPayment.date, "dd/MM/yyyy")}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                      <Calendar
                                        mode="single"
                                        selected={newPayment.date}
                                        onSelect={(date) => date && setNewPayment({ ...newPayment, date })}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>
                                <div>
                                  <Label className="text-xs">Valor</Label>
                                  <Input
                                    type="text"
                                    inputMode="numeric"
                                    value={newPayment.amount}
                                    onChange={(e) => setNewPayment({ ...newPayment, amount: formatCurrency(e.target.value) })}
                                    className="h-8"
                                  />
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs">Observação</Label>
                                <Input
                                  value={newPayment.notes}
                                  onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                                  placeholder="Opcional"
                                  className="h-8"
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" onClick={handleUpdatePayment} className="flex-1">
                                  Salvar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingPayment(null);
                                    setNewPayment({ date: new Date(), amount: '', notes: '' });
                                  }}
                                >
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10">
                                  <Check className="w-4 h-4 text-emerald-500" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-foreground">
                                    {formatCurrency(payment.amount)}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    {format(new Date(payment.date), "dd/MM/yyyy")}
                                    {payment.notes && (
                                      <span className="truncate max-w-[100px]">• {payment.notes}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7"
                                  onClick={() => handleEditPayment(payment)}
                                >
                                  <Edit className="w-3 h-3 text-muted-foreground" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7"
                                  onClick={() => handleDeletePayment(payment.id)}
                                >
                                  <Trash2 className="w-3 h-3 text-muted-foreground" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground bg-muted/30 rounded-lg">
                    <History className="w-6 h-6 mx-auto mb-1 opacity-50" />
                    <p className="text-xs">Nenhum pagamento registrado</p>
                  </div>
                )}
              </div>

              {/* Notes Section */}
              {viewingReceivable.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    Observações
                  </p>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-foreground whitespace-pre-wrap">{viewingReceivable.notes}</p>
                  </div>
                </div>
              )}

              {/* Receipts Gallery */}
              {viewingReceivable.receipts && viewingReceivable.receipts.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <Image className="w-4 h-4" />
                    Comprovantes ({viewingReceivable.receipts.length})
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {viewingReceivable.receipts.map((receipt, index) => (
                      <div 
                        key={index} 
                        className="relative group rounded-lg overflow-hidden border border-border"
                      >
                        {receipt.startsWith('data:image') ? (
                          <img
                            src={receipt}
                            alt={`Comprovante ${index + 1}`}
                            className="w-full aspect-square object-cover"
                          />
                        ) : (
                          <div className="w-full aspect-square flex flex-col items-center justify-center bg-muted gap-2">
                            <FileText className="w-10 h-10 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">PDF</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8"
                            onClick={() => window.open(receipt, '_blank')}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = receipt;
                              link.download = `comprovante-${viewingReceivable.personName}-${index + 1}.${receipt.startsWith('data:image') ? 'png' : 'pdf'}`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsViewReceivableModalOpen(false);
                if (viewingReceivable) {
                  handleEditReceivable(viewingReceivable);
                }
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button onClick={() => setIsViewReceivableModalOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Register Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={(open) => {
        setIsPaymentModalOpen(open);
        if (!open) {
          setSelectedReceivableForPayment(null);
          setNewPayment({ date: new Date(), amount: '', notes: '' });
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-500" />
              Registrar Pagamento
            </DialogTitle>
          </DialogHeader>
          {selectedReceivableForPayment && (
            <div className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Recebível</p>
                <p className="font-medium text-foreground">{selectedReceivableForPayment.personName}</p>
                {selectedReceivableForPayment.description && (
                  <p className="text-xs text-muted-foreground">{selectedReceivableForPayment.description}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Data do recebimento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {format(newPayment.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newPayment.date}
                      onSelect={(date) => date && setNewPayment({ ...newPayment, date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Valor recebido (R$)</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: formatCurrency(e.target.value) })}
                  placeholder="R$ 0,00"
                />
              </div>

              <div className="space-y-2">
                <Label>Observação (opcional)</Label>
                <Input
                  value={newPayment.notes}
                  onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                  placeholder="Ex: Pagamento via PIX"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddPayment} disabled={!newPayment.amount}>
              <Check className="w-4 h-4 mr-2" />
              Registrar
            </Button>
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
                type="text"
                inputMode="numeric"
                value={newPiggyBank.targetAmount}
                onChange={(e) => setNewPiggyBank({ ...newPiggyBank, targetAmount: formatCurrency(e.target.value) })}
                placeholder="R$ 0,00"
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
                type="text"
                inputMode="numeric"
                value={depositAmount}
                onChange={(e) => setDepositAmount(formatCurrency(e.target.value))}
                placeholder="R$ 0,00"
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
