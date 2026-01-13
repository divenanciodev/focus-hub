import { useState, useMemo } from 'react';
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CalendarIcon, TrendingUp, TrendingDown, PiggyBank, ArrowRightLeft, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { FinancialEntry, PiggyBank as PiggyBankType, FixedExpense, EntryAllocation } from '@/hooks/useFinancial';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { addMonths, subMonths, addYears, subYears, addDays, subDays } from 'date-fns';

type PeriodType = 'day' | 'month' | 'year' | 'custom';

interface FinancialReportProps {
  entries: FinancialEntry[];
  piggyBanks: PiggyBankType[];
  fixedExpenses: FixedExpense[];
  allocations: EntryAllocation[];
}

// Cores vibrantes para os gráficos
const PIE_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
];

export function FinancialReport({ entries, piggyBanks, fixedExpenses, allocations }: FinancialReportProps) {
  const [periodType, setPeriodType] = useState<PeriodType>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const navigatePeriod = (direction: 'prev' | 'next') => {
    const modifier = direction === 'next' ? 1 : -1;
    switch (periodType) {
      case 'day':
        setSelectedDate(direction === 'next' ? addDays(selectedDate, 1) : subDays(selectedDate, 1));
        break;
      case 'month':
        setSelectedDate(direction === 'next' ? addMonths(selectedDate, 1) : subMonths(selectedDate, 1));
        break;
      case 'year':
        setSelectedDate(direction === 'next' ? addYears(selectedDate, 1) : subYears(selectedDate, 1));
        break;
    }
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

  const expensesByCategory = useMemo(() => {
    const categoryMap = new Map<string, number>();

    filteredEntries
      .filter((e) => e.type === 'expense')
      .forEach((e) => {
        const current = categoryMap.get(e.category) || 0;
        categoryMap.set(e.category, current + e.amount);
      });

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

  const timeSeriesData = useMemo(() => {
    const dataMap = new Map<string, { income: number; expense: number; sortKey: number }>();

    filteredEntries.forEach((entry) => {
      const date = new Date(entry.date);
      const key = periodType === 'year' 
        ? format(date, 'MMM', { locale: ptBR })
        : format(date, 'dd');
      const sortKey = periodType === 'year' ? date.getMonth() : date.getDate();

      const current = dataMap.get(key) || { income: 0, expense: 0, sortKey };
      if (entry.type === 'income') {
        current.income += entry.amount;
      } else {
        current.expense += entry.amount;
      }
      dataMap.set(key, current);
    });

    return Array.from(dataMap.entries())
      .map(([date, values]) => ({
        date,
        Receita: values.income,
        Despesa: values.expense,
        sortKey: values.sortKey,
      }))
      .sort((a, b) => a.sortKey - b.sortKey);
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-3">
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

              {periodType !== 'custom' && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => navigatePeriod('prev')}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="min-w-[180px] justify-center font-medium">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        <span className="capitalize">{getPeriodLabel()}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => navigatePeriod('next')}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {periodType === 'custom' && (
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[130px] justify-start text-left font-normal">
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
                  <span className="text-muted-foreground">até</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[130px] justify-start text-left font-normal">
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
              )}
            </div>

            <Button variant="outline" onClick={handleExportCSV} size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/15">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Receitas</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(periodTotals.income)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-rose-500">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/15">
                <TrendingDown className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Despesas</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(periodTotals.expenses)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-sky-500">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-sky-500/15">
                <PiggyBank className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Poupado</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(periodTotals.allocatedSaved)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn("border-l-4", periodTotals.balance >= 0 ? "border-l-emerald-500" : "border-l-rose-500")}>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className={cn("p-2.5 rounded-xl", periodTotals.balance >= 0 ? "bg-emerald-500/15" : "bg-rose-500/15")}>
                <ArrowRightLeft className={cn("w-5 h-5", periodTotals.balance >= 0 ? "text-emerald-600" : "text-rose-600")} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Saldo</p>
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
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Evolução no Período</CardTitle>
          </CardHeader>
          <CardContent>
            {timeSeriesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={timeSeriesData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                    axisLine={false}
                    tickLine={false}
                    width={50}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ paddingTop: 15 }}
                    formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
                  />
                  <Bar 
                    dataKey="Receita" 
                    fill="#22c55e" 
                    radius={[4, 4, 0, 0]} 
                    maxBarSize={40}
                  />
                  <Bar 
                    dataKey="Despesa" 
                    fill="#ef4444" 
                    radius={[4, 4, 0, 0]} 
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                Sem dados para o período selecionado
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expenses by Category Pie Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {expensesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {expensesByCategory.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend 
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    wrapperStyle={{ paddingLeft: 20 }}
                    formatter={(value, entry: any) => (
                      <span className="text-xs text-foreground">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground">
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
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Maiores Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            {expensesByCategory.length > 0 ? (
              <div className="space-y-3">
                {expensesByCategory.slice(0, 5).map((item, index) => {
                  const percentage = periodTotals.expenses > 0 
                    ? (item.value / periodTotals.expenses) * 100 
                    : 0;
                  return (
                    <div key={item.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                          />
                          <span className="truncate max-w-[140px]">{item.name}</span>
                        </div>
                        <span className="font-medium">{formatCurrency(item.value)}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: PIE_COLORS[index % PIE_COLORS.length]
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma despesa no período</p>
            )}
          </CardContent>
        </Card>

        {/* Income Sources */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Fontes de Renda</CardTitle>
          </CardHeader>
          <CardContent>
            {incomeBySource.length > 0 ? (
              <div className="space-y-3">
                {incomeBySource.slice(0, 5).map((item, index) => {
                  const percentage = periodTotals.income > 0 
                    ? (item.value / periodTotals.income) * 100 
                    : 0;
                  return (
                    <div key={item.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full flex-shrink-0 bg-emerald-500" />
                          <span className="truncate max-w-[140px]">{item.name}</span>
                        </div>
                        <span className="font-medium text-emerald-600">{formatCurrency(item.value)}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma receita no período</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">
              Transações
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              {filteredEntries.length} registro{filteredEntries.length !== 1 ? 's' : ''}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {filteredEntries.length > 0 ? (
            <div className="divide-y divide-border max-h-[350px] overflow-y-auto -mx-1 px-1">
              {filteredEntries.map((entry) => (
                <div key={entry.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0",
                      entry.type === 'income' ? 'bg-emerald-500/15' : 'bg-rose-500/15'
                    )}>
                      {entry.type === 'income' ? (
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-rose-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{entry.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.category} • {format(new Date(entry.date), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    "font-semibold text-sm flex-shrink-0",
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
