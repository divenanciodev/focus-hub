import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { mockFinancialEntries, mockConsortiums } from '@/data/mockData';
import { FinancialEntry, Consortium } from '@/types';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Wallet,
  Target,
  Check,
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
import { cn } from '@/lib/utils';

export default function Financeiro() {
  const [entries, setEntries] = useState<FinancialEntry[]>(mockFinancialEntries);
  const [consortiums, setConsortiums] = useState<Consortium[]>(mockConsortiums);
  const [isAddEntryModalOpen, setIsAddEntryModalOpen] = useState(false);
  const [isAddConsortiumModalOpen, setIsAddConsortiumModalOpen] = useState(false);
  const [entryType, setEntryType] = useState<'income' | 'expense' | 'purchase'>('income');

  const [newEntry, setNewEntry] = useState({
    description: '',
    amount: '',
    category: '',
  });

  const [newConsortium, setNewConsortium] = useState({
    goal: '',
    totalAmount: '',
    installments: '',
  });

  const totalIncome = entries.filter((e) => e.type === 'income').reduce((acc, e) => acc + e.amount, 0);
  const totalExpenses = entries.filter((e) => e.type === 'expense' || e.type === 'purchase').reduce((acc, e) => acc + e.amount, 0);
  const balance = totalIncome - totalExpenses;

  const handleAddEntry = () => {
    if (newEntry.description && newEntry.amount && newEntry.category) {
      const entry: FinancialEntry = {
        id: Date.now().toString(),
        type: entryType,
        description: newEntry.description,
        amount: parseFloat(newEntry.amount),
        date: new Date(),
        category: newEntry.category,
      };
      setEntries([entry, ...entries]);
      setNewEntry({ description: '', amount: '', category: '' });
      setIsAddEntryModalOpen(false);
    }
  };

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

  const payInstallment = (consortiumId: string) => {
    setConsortiums(
      consortiums.map((c) =>
        c.id === consortiumId && c.paidInstallments < c.installments
          ? { ...c, paidInstallments: c.paidInstallments + 1 }
          : c
      )
    );
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  };

  const getEntryIcon = (type: FinancialEntry['type']) => {
    switch (type) {
      case 'income':
        return <TrendingUp className="w-4 h-4 text-success" />;
      case 'expense':
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      case 'purchase':
        return <ShoppingBag className="w-4 h-4 text-warning" />;
    }
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="Vida Financeira"
        description="Controle suas finanças e objetivos"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Renda total"
          value={formatCurrency(totalIncome)}
          icon={TrendingUp}
        />
        <StatCard
          title="Despesas totais"
          value={formatCurrency(totalExpenses)}
          icon={TrendingDown}
        />
        <StatCard
          title="Saldo"
          value={formatCurrency(balance)}
          icon={Wallet}
        />
      </div>

      <Tabs defaultValue="renda" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="renda">Renda</TabsTrigger>
          <TabsTrigger value="despesas">Despesas</TabsTrigger>
          <TabsTrigger value="compras">Compras</TabsTrigger>
          <TabsTrigger value="consorcio">Consórcio Simulado</TabsTrigger>
        </TabsList>

        <TabsContent value="renda" className="mt-0">
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => {
                setEntryType('income');
                setIsAddEntryModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar renda
            </Button>
          </div>
          <EntryList
            entries={entries.filter((e) => e.type === 'income')}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            getIcon={getEntryIcon}
          />
        </TabsContent>

        <TabsContent value="despesas" className="mt-0">
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => {
                setEntryType('expense');
                setIsAddEntryModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar despesa
            </Button>
          </div>
          <EntryList
            entries={entries.filter((e) => e.type === 'expense')}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            getIcon={getEntryIcon}
          />
        </TabsContent>

        <TabsContent value="compras" className="mt-0">
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => {
                setEntryType('purchase');
                setIsAddEntryModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar compra
            </Button>
          </div>
          <EntryList
            entries={entries.filter((e) => e.type === 'purchase')}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            getIcon={getEntryIcon}
          />
        </TabsContent>

        <TabsContent value="consorcio" className="mt-0">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setIsAddConsortiumModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar plano
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {consortiums.map((consortium) => {
              const progress = (consortium.paidInstallments / consortium.installments) * 100;
              const installmentValue = consortium.totalAmount / consortium.installments;
              const paidAmount = installmentValue * consortium.paidInstallments;

              return (
                <div
                  key={consortium.id}
                  className="bg-card border border-border rounded-xl p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-foreground" />
                      <h3 className="font-semibold text-foreground">{consortium.goal}</h3>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {formatCurrency(consortium.totalAmount)}
                    </span>
                  </div>

                  <ProgressBar value={progress} showLabel className="mb-4" />

                  <div className="flex justify-between text-sm text-muted-foreground mb-4">
                    <span>Pago: {formatCurrency(paidAmount)}</span>
                    <span>
                      {consortium.paidInstallments}/{consortium.installments} parcelas
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={consortium.paidInstallments >= consortium.installments}
                    onClick={() => payInstallment(consortium.id)}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Marcar parcela paga ({formatCurrency(installmentValue)})
                  </Button>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Entry Modal */}
      <Dialog open={isAddEntryModalOpen} onOpenChange={setIsAddEntryModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Adicionar {entryType === 'income' ? 'Renda' : entryType === 'expense' ? 'Despesa' : 'Compra'}
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
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={newEntry.category}
                onValueChange={(v) => setNewEntry({ ...newEntry, category: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Trabalho">Trabalho</SelectItem>
                  <SelectItem value="Investimentos">Investimentos</SelectItem>
                  <SelectItem value="Moradia">Moradia</SelectItem>
                  <SelectItem value="Educação">Educação</SelectItem>
                  <SelectItem value="Serviços">Serviços</SelectItem>
                  <SelectItem value="Lazer">Lazer</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
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
                onChange={(e) => setNewConsortium({ ...newConsortium, goal: e.target.value })}
                placeholder="Ex: Notebook para estudos"
              />
            </div>
            <div className="space-y-2">
              <Label>Valor total</Label>
              <Input
                type="number"
                value={newConsortium.totalAmount}
                onChange={(e) => setNewConsortium({ ...newConsortium, totalAmount: e.target.value })}
                placeholder="Ex: 5000"
              />
            </div>
            <div className="space-y-2">
              <Label>Número de parcelas</Label>
              <Input
                type="number"
                value={newConsortium.installments}
                onChange={(e) => setNewConsortium({ ...newConsortium, installments: e.target.value })}
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

function EntryList({
  entries,
  formatCurrency,
  formatDate,
  getIcon,
}: {
  entries: FinancialEntry[];
  formatCurrency: (value: number) => string;
  formatDate: (date: Date) => string;
  getIcon: (type: FinancialEntry['type']) => React.ReactNode;
}) {
  if (entries.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <p className="text-muted-foreground">Nenhum registro encontrado.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl divide-y divide-border">
      {entries.map((entry) => (
        <div key={entry.id} className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
              {getIcon(entry.type)}
            </div>
            <div>
              <p className="font-medium text-foreground">{entry.description}</p>
              <p className="text-sm text-muted-foreground">
                {entry.category} • {formatDate(entry.date)}
              </p>
            </div>
          </div>
          <span
            className={cn(
              'font-semibold',
              entry.type === 'income' ? 'text-success' : 'text-foreground'
            )}
          >
            {entry.type === 'income' ? '+' : '-'}
            {formatCurrency(entry.amount)}
          </span>
        </div>
      ))}
    </div>
  );
}
