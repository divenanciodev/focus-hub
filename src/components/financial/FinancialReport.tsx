import { useState, useMemo } from 'react';
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CalendarIcon, TrendingUp, TrendingDown, PiggyBank, ArrowRightLeft, FileText, Download } from 'lucide-react';
import { FinancialEntry, PiggyBank as PiggyBankType, FixedExpense, EntryAllocation } from '@/hooks/useFinancial';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

type PeriodType = 'day' | 'month' | 'year' | 'custom';

interface FinancialReportProps {
  entries: FinancialEntry[];
  piggyBanks: PiggyBankType[];
  fixedExpenses: FixedExpense[];
  allocations: EntryAllocation[];
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function FinancialReport({ entries, piggyBanks, fixedExpenses, allocations }: FinancialReportProps) {
  const [periodType, setPeriodType] = useState<PeriodType>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getDateRange = useMemo(() => {
    const now = selectedDate;
    switch (periodType) {
      case 'day':
        return { start: startOfDay(now), end: endOfDay(now) };
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'year':
        return { start: startOfYear(now), end: endOfYear(now) };
      case 'custom':
        return {
          start: customStartDate ? startOfDay(customStartDate) : startOfMonth(now),
          end: customEndDate ? endOfDay(customEndDate) : endOfMonth(now),
        };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  }, [periodType, selectedDate, customStartDate, customEndDate]);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return isWithinInterval(entryDate, { start: getDateRange.start, end: getDateRange.end });
    });
  }, [entries, getDateRange]);

  const filteredAllocations = useMemo(() => {
    const filteredEntryIds = new Set(filteredEntries.map((e) => e.id));
    return allocations.filter((a) => filteredEntryIds.has(a.entryId));
  }, [allocations, filteredEntries]);

  // Calculate totals for the period
  const periodTotals = useMemo(() => {
    const income = filteredEntries.filter((e) => e.type === 'income').reduce((acc, e) => acc + e.amount, 0);
    const expenses = filteredEntries.filter((e) => e.type === 'expense').reduce((acc, e) => acc + e.amount, 0);
    
    const allocatedExpenses = filteredAllocations
      .filter((a) => a.destinationType === 'expense' || a.destinationType === 'fixed_expense' || a.destinationType === 'health')
      .reduce((acc, a) => acc + a.amount, 0);
    const allocatedSaved = filteredAllocations
      .filter((a) => a.destinationType === 'piggy_bank')
      .reduce((acc, a) => acc + a.amount, 0);

    const totalExpenses = expenses + allocatedExpenses;
    const balance = income - totalExpenses;

    return { income, expenses: totalExpenses, allocatedSaved, balance };
  }, [filteredEntries, filteredAllocations]);

  // Category breakdown for expenses
  const expensesByCategory = useMemo(() => {
    const categoryMap = new Map<string, number>();

    // Direct expenses
    filteredEntries
      .filter((e) => e.type === 'expense')
      .forEach((e) => {
        const current = categoryMap.get(e.category) || 0;
        categoryMap.set(e.category, current + e.amount);
      });

    // Allocated expenses
    filteredAllocations
      .filter((a) => a.destinationType === 'expense' || a.destinationType === 'fixed_expense' || a.destinationType === 'health')
      .forEach((a) => {
        const category = a.destinationType === 'health' ? 'Saúde' : (a.destinationType === 'fixed_expense' ? 'Despesa Fixa' : a.destinationName);
        const current = categoryMap.get(category) || 0;
        categoryMap.set(category, current + a.amount);
      });

    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredEntries, filteredAllocations]);

  // Income sources breakdown
  const incomeBySource = useMemo(() => {
    const sourceMap = new Map<string, number>();

    filteredEntries
      .filter((e) => e.type === 'income')
      .forEach((e) => {
        const current = sourceMap.get(e.description) || 0;
        sourceMap.set(e.description, current + e.amount);
      });

    return Array.from(sourceMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredEntries]);

  // Daily/Monthly breakdown for chart
  const timeSeriesData = useMemo(() => {
    const dataMap = new Map<string, { income: number; expense: number }>();

    filteredEntries.forEach((entry) => {
      const date = new Date(entry.date);
      const key = periodType === 'year' 
        ? format(date, 'MMM', { locale: ptBR })
        : format(date, 'dd/MM');

      const current = dataMap.get(key) || { income: 0, expense: 0 };
      if (entry.type === 'income') {
        current.income += entry.amount;
      } else {
        current.expense += entry.amount;
      }
      dataMap.set(key, current);
    });

    return Array.from(dataMap.entries()).map(([date, values]) => ({
      date,
      Receita: values.income,
      Despesa: values.expense,
    }));
  }, [filteredEntries, periodType]);

  const getPeriodLabel = () => {
    switch (periodType) {
      case 'day':
        return format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
      case 'month':
        return format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR });
      case 'year':
        return format(selectedDate, 'yyyy');
      case 'custom':
        if (customStartDate && customEndDate) {
          return `${format(customStartDate, 'dd/MM/yyyy')} - ${format(customEndDate, 'dd/MM/yyyy')}`;
        }
        return 'Selecione o período';
      default:
        return '';
    }
  };

  const handleExportCSV = () => {
    const headers = ['Data', 'Tipo', 'Descrição', 'Categoria', 'Valor'];
    const rows = filteredEntries.map((e) => [
      format(new Date(e.date), 'dd/MM/yyyy'),
      e.type === 'income' ? 'Receita' : 'Despesa',
      e.description,
      e.category,
      e.amount.toFixed(2),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-financeiro-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Filtros do Relatório
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select value={periodType} onValueChange={(v) => setPeriodType(v as PeriodType)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Dia</SelectItem>
                  <SelectItem value="month">Mês</SelectItem>
                  <SelectItem value="year">Ano</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {periodType !== 'custom' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Data</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {getPeriodLabel()}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {periodType === 'custom' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">De</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[150px] justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customStartDate ? format(customStartDate, 'dd/MM/yyyy') : 'Início'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={customStartDate}
                        onSelect={setCustomStartDate}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Até</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[150px] justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customEndDate ? format(customEndDate, 'dd/MM/yyyy') : 'Fim'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={customEndDate}
                        onSelect={setCustomEndDate}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </>
            )}

            <Button variant="outline" onClick={handleExportCSV} className="gap-2">
              <Download className="w-4 h-4" />
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Receitas</p>
                <p className="text-xl font-bold text-emerald-600">{formatCurrency(periodTotals.income)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-500/20">
                <TrendingDown className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Despesas</p>
                <p className="text-xl font-bold text-rose-600">{formatCurrency(periodTotals.expenses)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-sky-500/20">
                <PiggyBank className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Poupado</p>
                <p className="text-xl font-bold text-sky-600">{formatCurrency(periodTotals.allocatedSaved)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", periodTotals.balance >= 0 ? "bg-emerald-500/20" : "bg-rose-500/20")}>
                <ArrowRightLeft className={cn("w-5 h-5", periodTotals.balance >= 0 ? "text-emerald-600" : "text-rose-600")} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Saldo</p>
                <p className={cn("text-xl font-bold", periodTotals.balance >= 0 ? "text-emerald-600" : "text-rose-600")}>
                  {formatCurrency(periodTotals.balance)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Time Series Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Evolução no Período</CardTitle>
          </CardHeader>
          <CardContent>
            {timeSeriesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} className="fill-muted-foreground" />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Bar dataKey="Receita" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Despesa" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Sem dados para o período selecionado
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expenses by Category Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {expensesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {expensesByCategory.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Sem despesas no período
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Lists */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Maiores Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            {expensesByCategory.length > 0 ? (
              <div className="space-y-3">
                {expensesByCategory.slice(0, 5).map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm truncate max-w-[150px]">{item.name}</span>
                    </div>
                    <span className="font-medium text-sm">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma despesa no período</p>
            )}
          </CardContent>
        </Card>

        {/* Income Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fontes de Renda</CardTitle>
          </CardHeader>
          <CardContent>
            {incomeBySource.length > 0 ? (
              <div className="space-y-3">
                {incomeBySource.slice(0, 5).map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[(index + 2) % COLORS.length] }}
                      />
                      <span className="text-sm truncate max-w-[150px]">{item.name}</span>
                    </div>
                    <span className="font-medium text-sm text-emerald-600">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma receita no período</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Transações ({filteredEntries.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEntries.length > 0 ? (
            <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
              {filteredEntries.map((entry) => (
                <div key={entry.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      entry.type === 'income' ? 'bg-emerald-500/20' : 'bg-rose-500/20'
                    )}>
                      {entry.type === 'income' ? (
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-rose-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{entry.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.category} • {format(new Date(entry.date), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    "font-semibold",
                    entry.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                  )}>
                    {entry.type === 'income' ? '+' : '-'}{formatCurrency(entry.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhuma transação no período selecionado
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
