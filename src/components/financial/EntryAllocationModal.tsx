import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Plus,
  Trash2,
  PiggyBank,
  Receipt,
  ShoppingCart,
  Tag,
  Edit,
  Check,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FinancialEntry, PiggyBank as PiggyBankType, FixedExpense } from '@/hooks/useFinancial';

export interface EntryAllocation {
  id: string;
  entryId: string;
  destinationType: 'expense' | 'piggy_bank' | 'fixed_expense' | 'other';
  destinationId?: string;
  destinationName: string;
  amount: number;
}

interface EntryAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: FinancialEntry | null;
  allocations: EntryAllocation[];
  piggyBanks: PiggyBankType[];
  fixedExpenses: FixedExpense[];
  onAddAllocation: (allocation: Omit<EntryAllocation, 'id'>) => Promise<void>;
  onUpdateAllocation: (id: string, data: Partial<EntryAllocation>) => Promise<boolean>;
  onDeleteAllocation: (id: string) => Promise<void>;
}

const destinationTypes = [
  { value: 'expense', label: 'Despesa', icon: Receipt },
  { value: 'piggy_bank', label: 'Cofrinho', icon: PiggyBank },
  { value: 'fixed_expense', label: 'Despesa Fixa', icon: ShoppingCart },
  { value: 'other', label: 'Outro', icon: Tag },
] as const;

export function EntryAllocationModal({
  isOpen,
  onClose,
  entry,
  allocations,
  piggyBanks,
  fixedExpenses,
  onAddAllocation,
  onUpdateAllocation,
  onDeleteAllocation,
}: EntryAllocationModalProps) {
  const [destinationType, setDestinationType] = useState<EntryAllocation['destinationType']>('expense');
  const [destinationId, setDestinationId] = useState<string>('');
  const [destinationName, setDestinationName] = useState('');
  const [amount, setAmount] = useState('');
  
  // Edit mode state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editName, setEditName] = useState('');
  const [editDestinationType, setEditDestinationType] = useState<EntryAllocation['destinationType']>('expense');
  const [editDestinationId, setEditDestinationId] = useState<string>('');

  const entryAllocations = allocations.filter((a) => a.entryId === entry?.id);
  const totalAllocated = entryAllocations.reduce((acc, a) => acc + a.amount, 0);
  const remaining = entry ? entry.amount - totalAllocated : 0;
  const allocationProgress = entry ? (totalAllocated / entry.amount) * 100 : 0;

  useEffect(() => {
    setDestinationId('');
    setDestinationName('');
  }, [destinationType]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleAddAllocation = async () => {
    if (!entry || !amount) return;

    const amountValue = parseFloat(amount);
    if (amountValue <= 0 || amountValue > remaining) return;

    let finalName = destinationName;

    if (destinationType === 'piggy_bank' && destinationId) {
      const piggy = piggyBanks.find((p) => p.id === destinationId);
      finalName = piggy?.name || destinationName;
    } else if (destinationType === 'fixed_expense' && destinationId) {
      const expense = fixedExpenses.find((e) => e.id === destinationId);
      finalName = expense?.name || destinationName;
    }

    await onAddAllocation({
      entryId: entry.id,
      destinationType,
      destinationId: destinationId || undefined,
      destinationName: finalName,
      amount: amountValue,
    });

    setAmount('');
    setDestinationName('');
    setDestinationId('');
  };

  const handleStartEdit = (allocation: EntryAllocation) => {
    setEditingId(allocation.id);
    setEditAmount(allocation.amount.toString());
    setEditName(allocation.destinationName);
    setEditDestinationType(allocation.destinationType);
    setEditDestinationId(allocation.destinationId || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditAmount('');
    setEditName('');
    setEditDestinationType('expense');
    setEditDestinationId('');
  };

  const handleSaveEdit = async (allocation: EntryAllocation) => {
    const newAmount = parseFloat(editAmount);
    const otherAllocationsTotal = entryAllocations
      .filter((a) => a.id !== allocation.id)
      .reduce((acc, a) => acc + a.amount, 0);
    const maxAllowed = entry ? entry.amount - otherAllocationsTotal : 0;

    if (newAmount <= 0 || newAmount > maxAllowed) return;

    // Determine final name based on destination type
    let finalName = editName;
    if (editDestinationType === 'piggy_bank' && editDestinationId) {
      const piggy = piggyBanks.find((p) => p.id === editDestinationId);
      finalName = piggy?.name || editName;
    } else if (editDestinationType === 'fixed_expense' && editDestinationId) {
      const expense = fixedExpenses.find((e) => e.id === editDestinationId);
      finalName = expense?.name || editName;
    }

    await onUpdateAllocation(allocation.id, {
      amount: newAmount,
      destinationName: finalName || allocation.destinationName,
      destinationType: editDestinationType,
      destinationId: editDestinationId || undefined,
    });

    setEditingId(null);
    setEditAmount('');
    setEditName('');
    setEditDestinationType('expense');
    setEditDestinationId('');
  };

  // Reset edit destination id when type changes
  useEffect(() => {
    if (editingId) {
      setEditDestinationId('');
    }
  }, [editDestinationType]);

  const getDestinationIcon = (type: EntryAllocation['destinationType']) => {
    const config = destinationTypes.find((d) => d.value === type);
    const IconComponent = config?.icon || Tag;
    return <IconComponent className="w-4 h-4" />;
  };

  const getDestinationLabel = (type: EntryAllocation['destinationType']) => {
    return destinationTypes.find((d) => d.value === type)?.label || 'Outro';
  };

  if (!entry) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Destinos da Entrada</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Entry info */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Entrada:</span>
              <span className="font-medium text-foreground">{entry.description}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Valor total:</span>
              <span className="font-semibold text-success">{formatCurrency(entry.amount)}</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Alocado:</span>
                <span className="text-foreground">
                  {formatCurrency(totalAllocated)} / {formatCurrency(entry.amount)}
                </span>
              </div>
              <Progress value={allocationProgress} className="h-2" />
            </div>
            {remaining > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Disponível:</span>
                <span className="font-medium text-primary">{formatCurrency(remaining)}</span>
              </div>
            )}
          </div>

          {/* Current allocations */}
          {entryAllocations.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Destinos alocados</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {entryAllocations.map((allocation) => (
                  <div
                    key={allocation.id}
                    className="flex items-center justify-between p-3 bg-card border border-border rounded-lg"
                  >
                    {editingId === allocation.id ? (
                      // Edit mode - expanded layout
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Tipo</Label>
                            <Select
                              value={editDestinationType}
                              onValueChange={(v) => setEditDestinationType(v as EntryAllocation['destinationType'])}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {destinationTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    <div className="flex items-center gap-2">
                                      <type.icon className="w-4 h-4" />
                                      {type.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Valor (R$)</Label>
                            <Input
                              type="number"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              className="h-8 text-sm"
                              placeholder="0,00"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>

                        {editDestinationType === 'piggy_bank' && piggyBanks.length > 0 && (
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Cofrinho</Label>
                            <Select value={editDestinationId} onValueChange={setEditDestinationId}>
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Selecione um cofrinho..." />
                              </SelectTrigger>
                              <SelectContent>
                                {piggyBanks.map((piggy) => (
                                  <SelectItem key={piggy.id} value={piggy.id}>
                                    {piggy.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {editDestinationType === 'fixed_expense' && fixedExpenses.length > 0 && (
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Despesa fixa</Label>
                            <Select value={editDestinationId} onValueChange={setEditDestinationId}>
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Selecione uma despesa fixa..." />
                              </SelectTrigger>
                              <SelectContent>
                                {fixedExpenses.map((expense) => (
                                  <SelectItem key={expense.id} value={expense.id}>
                                    {expense.name} - {formatCurrency(expense.amount)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {(editDestinationType === 'expense' ||
                          editDestinationType === 'other' ||
                          (editDestinationType === 'piggy_bank' && piggyBanks.length === 0) ||
                          (editDestinationType === 'fixed_expense' && fixedExpenses.length === 0)) && (
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Descrição</Label>
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="h-8 text-sm"
                              placeholder="Ex: Aluguel, Mercado, Investimento..."
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCancelEdit}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancelar
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSaveEdit(allocation)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Salvar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                            {getDestinationIcon(allocation.destinationType)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm">
                              {allocation.destinationName}
                            </p>
                            <Badge variant="secondary" className="text-xs">
                              {getDestinationLabel(allocation.destinationType)}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">
                            {formatCurrency(allocation.amount)}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleStartEdit(allocation)}
                          >
                            <Edit className="w-4 h-4 text-muted-foreground" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onDeleteAllocation(allocation.id)}
                          >
                            <Trash2 className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add new allocation */}
          {remaining > 0 && (
            <div className="space-y-4 p-4 border border-dashed border-border rounded-lg">
              <Label className="text-sm font-medium">Adicionar destino</Label>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Tipo</Label>
                  <Select
                    value={destinationType}
                    onValueChange={(v) => setDestinationType(v as EntryAllocation['destinationType'])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {destinationTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="w-4 h-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Valor (R$)</Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0,00"
                    min="0"
                    max={remaining}
                    step="0.01"
                  />
                </div>
              </div>

              {destinationType === 'piggy_bank' && piggyBanks.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Cofrinho</Label>
                  <Select value={destinationId} onValueChange={setDestinationId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cofrinho..." />
                    </SelectTrigger>
                    <SelectContent>
                      {piggyBanks.map((piggy) => (
                        <SelectItem key={piggy.id} value={piggy.id}>
                          {piggy.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {destinationType === 'fixed_expense' && fixedExpenses.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Despesa fixa</Label>
                  <Select value={destinationId} onValueChange={setDestinationId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma despesa fixa..." />
                    </SelectTrigger>
                    <SelectContent>
                      {fixedExpenses.map((expense) => (
                        <SelectItem key={expense.id} value={expense.id}>
                          {expense.name} - {formatCurrency(expense.amount)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(destinationType === 'expense' ||
                destinationType === 'other' ||
                (destinationType === 'piggy_bank' && piggyBanks.length === 0) ||
                (destinationType === 'fixed_expense' && fixedExpenses.length === 0)) && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Descrição</Label>
                  <Input
                    value={destinationName}
                    onChange={(e) => setDestinationName(e.target.value)}
                    placeholder="Ex: Aluguel, Mercado, Investimento..."
                  />
                </div>
              )}

              <Button
                onClick={handleAddAllocation}
                disabled={
                  !amount ||
                  parseFloat(amount) <= 0 ||
                  parseFloat(amount) > remaining ||
                  (!destinationId && !destinationName)
                }
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar destino
              </Button>
            </div>
          )}

          {remaining <= 0 && entryAllocations.length > 0 && (
            <div className="text-center p-4 bg-success/10 rounded-lg">
              <p className="text-sm text-success font-medium">
                ✓ Todo o valor foi alocado!
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
