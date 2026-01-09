import { useState, useRef } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FinancialEntry, Receivable, PiggyBank, FixedExpense, PurchaseGoal, Consortium } from '@/types';
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

export default function Financeiro() {
  // State for entries (income/expense)
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [isAddEntryModalOpen, setIsAddEntryModalOpen] = useState(false);
  const [entryType, setEntryType] = useState<'income' | 'expense'>('income');
  const [newEntry, setNewEntry] = useState({ description: '', amount: '' });

  // State for receivables
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [isAddReceivableModalOpen, setIsAddReceivableModalOpen] = useState(false);
  const [newReceivable, setNewReceivable] = useState({
    personName: '',
    description: '',
    totalAmount: '',
    installments: '1',
  });

  // State for piggy banks
  const [piggyBanks, setPiggyBanks] = useState<PiggyBank[]>([]);
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
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const [isAddFixedExpenseModalOpen, setIsAddFixedExpenseModalOpen] = useState(false);
  const [newFixedExpense, setNewFixedExpense] = useState({
    name: '',
    amount: '',
    dueDay: '',
    category: '',
  });

  // State for purchase goals
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

  // State for consortium
  const [consortiums, setConsortiums] = useState<Consortium[]>([]);
  const [isAddConsortiumModalOpen, setIsAddConsortiumModalOpen] = useState(false);
  const [newConsortium, setNewConsortium] = useState({
    goal: '',
    totalAmount: '',
    installments: '',
  });

  // Calculations
  const totalIncome = entries.filter((e) => e.type === 'income').reduce((acc, e) => acc + e.amount, 0);
  const totalExpenses = entries.filter((e) => e.type === 'expense').reduce((acc, e) => acc + e.amount, 0);
  const totalFixedExpenses = fixedExpenses.reduce((acc, e) => acc + e.amount, 0);
  const totalReceivables = receivables.reduce((acc, r) => {
    const remaining = r.totalAmount - (r.totalAmount / r.installments) * r.paidInstallments;
    return acc + remaining;
  }, 0);
  const totalSaved = piggyBanks.reduce((acc, p) => acc + p.currentAmount, 0);
  const balance = totalIncome - totalExpenses - totalFixedExpenses;

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
  const handleAddEntry = () => {
    if (newEntry.description && newEntry.amount) {
      const entry: FinancialEntry = {
        id: Date.now().toString(),
        type: entryType,
        description: newEntry.description,
        amount: parseFloat(newEntry.amount),
        date: new Date(),
        category: entryType === 'income' ? 'Entrada' : 'Saída',
      };
      setEntries([entry, ...entries]);
      setNewEntry({ description: '', amount: '' });
      setIsAddEntryModalOpen(false);
    }
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
  };

  // Handlers for receivables
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
  const handleAddPiggyBank = () => {
    if (newPiggyBank.name && newPiggyBank.targetAmount) {
      const piggyBank: PiggyBank = {
        id: Date.now().toString(),
        name: newPiggyBank.name,
        targetAmount: parseFloat(newPiggyBank.targetAmount),
        currentAmount: 0,
        color: newPiggyBank.color,
      };
      setPiggyBanks([piggyBank, ...piggyBanks]);
      setNewPiggyBank({ name: '', targetAmount: '', color: '#8B5CF6' });
      setIsAddPiggyBankModalOpen(false);
    }
  };

  const handleDeposit = () => {
    if (selectedPiggyBank && depositAmount) {
      setPiggyBanks(
        piggyBanks.map((p) =>
          p.id === selectedPiggyBank.id
            ? { ...p, currentAmount: p.currentAmount + parseFloat(depositAmount) }
            : p
        )
      );
      setDepositAmount('');
      setIsDepositModalOpen(false);
      setSelectedPiggyBank(null);
    }
  };

  const handleWithdraw = () => {
    if (selectedPiggyBank && depositAmount) {
      const amount = parseFloat(depositAmount);
      if (amount <= selectedPiggyBank.currentAmount) {
        setPiggyBanks(
          piggyBanks.map((p) =>
            p.id === selectedPiggyBank.id
              ? { ...p, currentAmount: p.currentAmount - amount }
              : p
          )
        );
      }
      setDepositAmount('');
      setIsDepositModalOpen(false);
      setSelectedPiggyBank(null);
    }
  };

  const handleDeletePiggyBank = (id: string) => {
    setPiggyBanks(piggyBanks.filter((p) => p.id !== id));
  };

  // Handlers for fixed expenses
  const handleAddFixedExpense = () => {
    if (newFixedExpense.name && newFixedExpense.amount && newFixedExpense.dueDay) {
      const expense: FixedExpense = {
        id: Date.now().toString(),
        name: newFixedExpense.name,
        amount: parseFloat(newFixedExpense.amount),
        dueDay: parseInt(newFixedExpense.dueDay),
        category: newFixedExpense.category || 'Outros',
        notificationsEnabled: true,
      };
      setFixedExpenses([expense, ...fixedExpenses]);
      setNewFixedExpense({ name: '', amount: '', dueDay: '', category: '' });
      setIsAddFixedExpenseModalOpen(false);
    }
  };

  const toggleExpenseNotification = (id: string) => {
    setFixedExpenses(
      fixedExpenses.map((e) =>
        e.id === id ? { ...e, notificationsEnabled: !e.notificationsEnabled } : e
      )
    );
  };

  const handleDeleteFixedExpense = (id: string) => {
    setFixedExpenses(fixedExpenses.filter((e) => e.id !== id));
  };

  // Handlers for purchase goals
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

  // Handlers for consortium
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

  const today = new Date().getDate();

  return (
    <div className="fade-in">
      <PageHeader
        title="Vida Financeira"
        description="Controle suas finanças e objetivos"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Renda total" value={formatCurrency(totalIncome)} icon={TrendingUp} />
        <StatCard title="Despesas totais" value={formatCurrency(totalExpenses + totalFixedExpenses)} icon={TrendingDown} />
        <StatCard title="A receber" value={formatCurrency(totalReceivables)} icon={Users} />
        <StatCard title="Guardado" value={formatCurrency(totalSaved)} icon={PiggyBankIcon} />
      </div>

      <Tabs defaultValue="entradas" className="w-full">
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="entradas">Entradas/Saídas</TabsTrigger>
          <TabsTrigger value="receber">A Receber</TabsTrigger>
          <TabsTrigger value="cofrinhos">Cofrinhos</TabsTrigger>
          <TabsTrigger value="fixas">Despesas Fixas</TabsTrigger>
          <TabsTrigger value="compras">Compras</TabsTrigger>
          <TabsTrigger value="consorcio">Consórcio</TabsTrigger>
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
              {entries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                      {getEntryIcon(entry.type)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{entry.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {entry.category} • {formatDate(entry.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'font-semibold',
                        entry.type === 'income' ? 'text-success' : 'text-destructive'
                      )}
                    >
                      {entry.type === 'income' ? '+' : '-'}
                      {formatCurrency(entry.amount)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteEntry(entry.id)}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ))}
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
                const paidAmount = installmentValue * receivable.paidInstallments;
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
                    <CardContent className="flex-1 flex flex-col justify-between gap-4">
                      <div className="space-y-3">
                        <ProgressBar value={progress} showLabel />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Recebido: {formatCurrency(paidAmount)}</span>
                          <span>
                            {receivable.paidInstallments}/{receivable.installments} parcelas
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-border">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          disabled={isComplete}
                          onClick={() => handlePayReceivableInstallment(receivable.id)}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Marcar parcela
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteReceivable(receivable.id)}
                        >
                          <Trash2 className="w-4 h-4" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {piggyBanks.map((piggy) => {
                const progress = piggy.targetAmount > 0 
                  ? (piggy.currentAmount / piggy.targetAmount) * 100 
                  : 0;

                return (
                  <Card key={piggy.id} className="flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="flex items-center justify-center w-8 h-8 rounded-full"
                            style={{ backgroundColor: piggy.color + '30' }}
                          >
                            <PiggyBankIcon className="w-4 h-4" style={{ color: piggy.color }} />
                          </div>
                          <CardTitle className="text-base font-semibold">
                            {piggy.name}
                          </CardTitle>
                        </div>
                        <span className="text-lg font-bold text-foreground">
                          {formatCurrency(piggy.targetAmount)}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between gap-4">
                      <div className="space-y-3">
                        <div className="text-center py-2">
                          <p className="text-2xl font-bold text-foreground">
                            {formatCurrency(piggy.currentAmount)}
                          </p>
                          <p className="text-xs text-muted-foreground">guardado</p>
                        </div>
                        <ProgressBar value={progress} showLabel />
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-border">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedPiggyBank(piggy);
                            setIsDepositModalOpen(true);
                          }}
                        >
                          <ArrowDownToLine className="w-4 h-4 mr-2" />
                          Depositar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          disabled={piggy.currentAmount <= 0}
                          onClick={() => {
                            setSelectedPiggyBank(piggy);
                            setIsDepositModalOpen(true);
                          }}
                        >
                          <ArrowUpFromLine className="w-4 h-4 mr-2" />
                          Retirar
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeletePiggyBank(piggy.id)}
                        >
                          <Trash2 className="w-4 h-4" />
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
              Adicionar despesa fixa
            </Button>
          </div>

          {fixedExpenses.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <p className="text-muted-foreground">Nenhuma despesa fixa cadastrada.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fixedExpenses.map((expense) => {
                const isUpcoming = expense.dueDay >= today && expense.dueDay <= today + 5;
                const isPastDue = expense.dueDay < today;

                return (
                  <Card
                    key={expense.id}
                    className={cn(
                      'flex flex-col',
                      isUpcoming && 'border-warning',
                      isPastDue && 'border-destructive'
                    )}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                            <Calendar className="w-4 h-4 text-foreground" />
                          </div>
                          <div>
                            <CardTitle className="text-base font-semibold">
                              {expense.name}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">{expense.category}</p>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-foreground">
                          {formatCurrency(expense.amount)}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'text-sm font-medium',
                            isUpcoming && 'text-warning',
                            isPastDue && 'text-destructive',
                            !isUpcoming && !isPastDue && 'text-muted-foreground'
                          )}
                        >
                          Vencimento: dia {expense.dueDay}
                        </span>
                        {isUpcoming && (
                          <span className="text-xs bg-warning/20 text-warning px-2 py-0.5 rounded">
                            Em breve
                          </span>
                        )}
                        {isPastDue && (
                          <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded">
                            Vencido
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-border justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleExpenseNotification(expense.id)}
                        >
                          {expense.notificationsEnabled ? (
                            <Bell className="w-4 h-4 text-primary" />
                          ) : (
                            <BellOff className="w-4 h-4 text-muted-foreground" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteFixedExpense(expense.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Compras */}
        <TabsContent value="compras" className="mt-0">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setIsAddPurchaseGoalModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar objetivo
            </Button>
          </div>

          {purchaseGoals.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <p className="text-muted-foreground">Nenhum objetivo de compra.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {purchaseGoals.map((goal) => {
                const progress = goal.targetAmount > 0
                  ? (goal.savedAmount / goal.targetAmount) * 100
                  : 0;

                return (
                  <Card key={goal.id} className="flex flex-col overflow-hidden">
                    {goal.imageUrl && (
                      <div className="h-32 w-full overflow-hidden">
                        <img
                          src={goal.imageUrl}
                          alt={goal.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                            <ShoppingCart className="w-4 h-4 text-foreground" />
                          </div>
                          <div>
                            <CardTitle className="text-base font-semibold">
                              {goal.name}
                            </CardTitle>
                            <span className={cn('text-xs font-medium', getPriorityColor(goal.priority))}>
                              {goal.priority === 'high' ? 'Alta' : goal.priority === 'medium' ? 'Média' : 'Baixa'} prioridade
                            </span>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-foreground">
                          {formatCurrency(goal.targetAmount)}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between gap-4">
                      <div className="space-y-3">
                        {goal.description && (
                          <p className="text-sm text-muted-foreground">
                            {goal.description}
                          </p>
                        )}
                        <ProgressBar value={progress} showLabel />
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-border">
                        {goal.storeLink && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => window.open(goal.storeLink, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Ver na loja
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-auto"
                          onClick={() => handleDeletePurchaseGoal(goal.id)}
                        >
                          <Trash2 className="w-4 h-4" />
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
              Criar plano
            </Button>
          </div>

          {consortiums.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <p className="text-muted-foreground">Nenhum consórcio criado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {consortiums.map((consortium) => {
                const progress = (consortium.paidInstallments / consortium.installments) * 100;
                const installmentValue = consortium.totalAmount / consortium.installments;
                const paidAmount = installmentValue * consortium.paidInstallments;

                return (
                  <Card key={consortium.id} className="flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                            <Target className="w-4 h-4 text-foreground" />
                          </div>
                          <CardTitle className="text-base font-semibold">
                            {consortium.goal}
                          </CardTitle>
                        </div>
                        <span className="text-lg font-bold text-foreground">
                          {formatCurrency(consortium.totalAmount)}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between gap-4">
                      <div className="space-y-3">
                        <ProgressBar value={progress} showLabel />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Pago: {formatCurrency(paidAmount)}</span>
                          <span>
                            {consortium.paidInstallments}/{consortium.installments} parcelas
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-border">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          disabled={consortium.paidInstallments >= consortium.installments}
                          onClick={() => payConsortiumInstallment(consortium.id)}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Marcar parcela
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteConsortium(consortium.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Entry Modal */}
      <Dialog open={isAddEntryModalOpen} onOpenChange={setIsAddEntryModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Adicionar {entryType === 'income' ? 'Entrada' : 'Saída'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                value={newEntry.description}
                onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                placeholder="Ex: Salário"
              />
            </div>
            <div className="space-y-2">
              <Label>Valor</Label>
              <Input
                type="number"
                value={newEntry.amount}
                onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
                placeholder="Ex: 1500"
              />
            </div>
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
            <DialogTitle>Adicionar Valor a Receber</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da pessoa</Label>
              <Input
                value={newReceivable.personName}
                onChange={(e) =>
                  setNewReceivable({ ...newReceivable, personName: e.target.value })
                }
                placeholder="Ex: João"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Input
                value={newReceivable.description}
                onChange={(e) =>
                  setNewReceivable({ ...newReceivable, description: e.target.value })
                }
                placeholder="Ex: Empréstimo"
              />
            </div>
            <div className="space-y-2">
              <Label>Valor total</Label>
              <Input
                type="number"
                value={newReceivable.totalAmount}
                onChange={(e) =>
                  setNewReceivable({ ...newReceivable, totalAmount: e.target.value })
                }
                placeholder="Ex: 500"
              />
            </div>
            <div className="space-y-2">
              <Label>Número de parcelas</Label>
              <Input
                type="number"
                value={newReceivable.installments}
                onChange={(e) =>
                  setNewReceivable({ ...newReceivable, installments: e.target.value })
                }
                placeholder="Ex: 5"
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
            <DialogTitle>Criar Novo Cofrinho</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome do cofrinho</Label>
              <Input
                value={newPiggyBank.name}
                onChange={(e) =>
                  setNewPiggyBank({ ...newPiggyBank, name: e.target.value })
                }
                placeholder="Ex: Viagem"
              />
            </div>
            <div className="space-y-2">
              <Label>Meta de valor</Label>
              <Input
                type="number"
                value={newPiggyBank.targetAmount}
                onChange={(e) =>
                  setNewPiggyBank({ ...newPiggyBank, targetAmount: e.target.value })
                }
                placeholder="Ex: 5000"
              />
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <Input
                type="color"
                value={newPiggyBank.color}
                onChange={(e) =>
                  setNewPiggyBank({ ...newPiggyBank, color: e.target.value })
                }
                className="h-10 w-20"
              />
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
            <div className="text-center">
              <p className="text-2xl font-bold">
                {selectedPiggyBank && formatCurrency(selectedPiggyBank.currentAmount)}
              </p>
              <p className="text-sm text-muted-foreground">Saldo atual</p>
            </div>
            <div className="space-y-2">
              <Label>Valor</Label>
              <Input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Ex: 100"
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setIsDepositModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="outline" onClick={handleWithdraw}>
              <ArrowUpFromLine className="w-4 h-4 mr-2" />
              Retirar
            </Button>
            <Button onClick={handleDeposit}>
              <ArrowDownToLine className="w-4 h-4 mr-2" />
              Depositar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Fixed Expense Modal */}
      <Dialog open={isAddFixedExpenseModalOpen} onOpenChange={setIsAddFixedExpenseModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Despesa Fixa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={newFixedExpense.name}
                onChange={(e) =>
                  setNewFixedExpense({ ...newFixedExpense, name: e.target.value })
                }
                placeholder="Ex: Aluguel"
              />
            </div>
            <div className="space-y-2">
              <Label>Valor</Label>
              <Input
                type="number"
                value={newFixedExpense.amount}
                onChange={(e) =>
                  setNewFixedExpense({ ...newFixedExpense, amount: e.target.value })
                }
                placeholder="Ex: 1200"
              />
            </div>
            <div className="space-y-2">
              <Label>Dia de vencimento</Label>
              <Input
                type="number"
                min="1"
                max="31"
                value={newFixedExpense.dueDay}
                onChange={(e) =>
                  setNewFixedExpense({ ...newFixedExpense, dueDay: e.target.value })
                }
                placeholder="Ex: 10"
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={newFixedExpense.category}
                onValueChange={(v) =>
                  setNewFixedExpense({ ...newFixedExpense, category: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Moradia">Moradia</SelectItem>
                  <SelectItem value="Serviços">Serviços</SelectItem>
                  <SelectItem value="Transporte">Transporte</SelectItem>
                  <SelectItem value="Educação">Educação</SelectItem>
                  <SelectItem value="Saúde">Saúde</SelectItem>
                  <SelectItem value="Assinaturas">Assinaturas</SelectItem>
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
            <DialogTitle>Adicionar Objetivo de Compra</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome do produto</Label>
              <Input
                value={newPurchaseGoal.name}
                onChange={(e) =>
                  setNewPurchaseGoal({ ...newPurchaseGoal, name: e.target.value })
                }
                placeholder="Ex: iPhone 15"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Input
                value={newPurchaseGoal.description}
                onChange={(e) =>
                  setNewPurchaseGoal({ ...newPurchaseGoal, description: e.target.value })
                }
                placeholder="Ex: Modelo Pro Max 256GB"
              />
            </div>
            <div className="space-y-2">
              <Label>Valor</Label>
              <Input
                type="number"
                value={newPurchaseGoal.targetAmount}
                onChange={(e) =>
                  setNewPurchaseGoal({ ...newPurchaseGoal, targetAmount: e.target.value })
                }
                placeholder="Ex: 8000"
              />
            </div>
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select
                value={newPurchaseGoal.priority}
                onValueChange={(v: 'low' | 'medium' | 'high') =>
                  setNewPurchaseGoal({ ...newPurchaseGoal, priority: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Imagem</Label>
              <div className="flex gap-2">
                <Input
                  value={newPurchaseGoal.imageUrl}
                  onChange={(e) =>
                    setNewPurchaseGoal({ ...newPurchaseGoal, imageUrl: e.target.value })
                  }
                  placeholder="URL da imagem"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => purchaseImageInputRef.current?.click()}
                >
                  <Image className="w-4 h-4" />
                </Button>
                <input
                  ref={purchaseImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePurchaseImageUpload}
                  className="hidden"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Link da loja (opcional)</Label>
              <div className="flex gap-2">
                <LinkIcon className="w-4 h-4 mt-3 text-muted-foreground" />
                <Input
                  value={newPurchaseGoal.storeLink}
                  onChange={(e) =>
                    setNewPurchaseGoal({ ...newPurchaseGoal, storeLink: e.target.value })
                  }
                  placeholder="https://..."
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPurchaseGoalModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddPurchaseGoal}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Consortium Modal */}
      <Dialog open={isAddConsortiumModalOpen} onOpenChange={setIsAddConsortiumModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Plano de Consórcio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Objetivo</Label>
              <Input
                value={newConsortium.goal}
                onChange={(e) =>
                  setNewConsortium({ ...newConsortium, goal: e.target.value })
                }
                placeholder="Ex: Notebook para estudos"
              />
            </div>
            <div className="space-y-2">
              <Label>Valor total</Label>
              <Input
                type="number"
                value={newConsortium.totalAmount}
                onChange={(e) =>
                  setNewConsortium({ ...newConsortium, totalAmount: e.target.value })
                }
                placeholder="Ex: 5000"
              />
            </div>
            <div className="space-y-2">
              <Label>Número de parcelas</Label>
              <Input
                type="number"
                value={newConsortium.installments}
                onChange={(e) =>
                  setNewConsortium({ ...newConsortium, installments: e.target.value })
                }
                placeholder="Ex: 10"
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
    </div>
  );
}
