import React, { startTransition, useCallback, useDeferredValue, useMemo, useState } from 'react';
import { toast } from 'sonner';
import FinancialChart from '@/components/finance/FinancialChart';
import FinanceForms from '@/components/finance/FinanceForms';
import FinanceHistoryDialog from '@/components/finance/FinanceHistoryDialog';
import FinanceSummaryCards from '@/components/finance/FinanceSummaryCards';
import TransactionsCard from '@/components/finance/TransactionsCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFinancialChartData } from '@/features/finance/hooks/useFinancialChartData';
import {
  buildFinanceSummary,
  buildHistoryGroups,
  buildTransactions,
  createEmptyFinanceData,
  ENTRY_CATEGORIES,
  EXPENSE_CATEGORIES,
  FINANCIAL_CHART_FILTERS,
  formatCompactCurrency,
  formatCurrency,
  parseAmountInput,
} from '@/features/finance/lib/finance-utils';

const FinanceSection = ({
  financialData,
  onAddEntry,
  onAddExpense,
  onRemoveTransaction,
  onClearMonth,
  onListHistoryMonths,
  onLoadMonthData,
  onDeleteHistoryMonth,
}) => {
  const [entryForm, setEntryForm] = useState({
    valor: '',
    descricao: '',
    categoria: 'salario',
  });
  const [expenseForm, setExpenseForm] = useState({
    valor: '',
    descricao: '',
    categoria: 'alimentacao',
  });
  const [filterType, setFilterType] = useState('todos');
  const [chartFilter, setChartFilter] = useState('month');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyMonths, setHistoryMonths] = useState([]);
  const [selectedHistoryMonth, setSelectedHistoryMonth] = useState(null);
  const [selectedMonthData, setSelectedMonthData] = useState(createEmptyFinanceData());
  const [loadingMonth, setLoadingMonth] = useState(false);
  const [deletingMonthKey, setDeletingMonthKey] = useState(null);
  const [referenceDate] = useState(() => new Date());
  const deferredChartFilter = useDeferredValue(chartFilter);
  const isMobile = useIsMobile();

  const summary = useMemo(() => buildFinanceSummary(financialData), [financialData]);
  const transactions = useMemo(
    () => buildTransactions(financialData, filterType),
    [financialData, filterType],
  );
  const historyGroups = useMemo(
    () => buildHistoryGroups(historyMonths),
    [historyMonths],
  );
  const { chartModel, isLoading: isChartLoading } = useFinancialChartData({
    filterKey: deferredChartFilter,
    financialData,
    onLoadMonthData,
    referenceDate,
  });

  const handleEntryChange = (field, value) => {
    setEntryForm((current) => ({ ...current, [field]: value }));
  };

  const handleExpenseChange = (field, value) => {
    setExpenseForm((current) => ({ ...current, [field]: value }));
  };

  const handleChartFilterChange = useCallback((nextFilter) => {
    startTransition(() => {
      setChartFilter(nextFilter);
    });
  }, []);

  const handleScrollToFinanceForms = useCallback(() => {
    document.getElementById('finance-forms')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, []);

  const handleAddEntry = async (event) => {
    event.preventDefault();
    const amount = parseAmountInput(entryForm.valor);

    if (!amount || amount <= 0 || !entryForm.descricao.trim()) {
      toast.error('Preencha todos os campos da entrada corretamente.');
      return;
    }

    await onAddEntry({
      ...entryForm,
      valor: amount,
      descricao: entryForm.descricao.trim(),
    });

    setEntryForm({
      valor: '',
      descricao: '',
      categoria: 'salario',
    });
  };

  const handleAddExpense = async (event) => {
    event.preventDefault();
    const amount = parseAmountInput(expenseForm.valor);

    if (!amount || amount <= 0 || !expenseForm.descricao.trim()) {
      toast.error('Preencha todos os campos do gasto corretamente.');
      return;
    }

    await onAddExpense({
      ...expenseForm,
      valor: amount,
      descricao: expenseForm.descricao.trim(),
    });

    setExpenseForm({
      valor: '',
      descricao: '',
      categoria: 'alimentacao',
    });
  };

  const handleOpenHistory = async () => {
    try {
      const months = await onListHistoryMonths?.();
      setHistoryMonths(months || []);
      setSelectedHistoryMonth(null);
      setSelectedMonthData(createEmptyFinanceData());
      setHistoryOpen(true);
    } catch {
      setHistoryMonths([]);
      setHistoryOpen(true);
    }
  };

  const handleSelectHistoryMonth = async (monthKey) => {
    setSelectedHistoryMonth(monthKey);
    setLoadingMonth(true);

    try {
      const data = await onLoadMonthData?.(monthKey);
      setSelectedMonthData(data || createEmptyFinanceData());
    } finally {
      setLoadingMonth(false);
    }
  };

  const handleDeleteHistoryMonth = useCallback(async (monthKey) => {
    if (!monthKey || !onDeleteHistoryMonth) {
      return;
    }

    setDeletingMonthKey(monthKey);

    try {
      await onDeleteHistoryMonth(monthKey);
      setHistoryMonths((current) => current.filter((value) => value !== monthKey));

      if (selectedHistoryMonth === monthKey) {
        setSelectedHistoryMonth(null);
        setSelectedMonthData(createEmptyFinanceData());
      }
    } finally {
      setDeletingMonthKey(null);
    }
  }, [onDeleteHistoryMonth, selectedHistoryMonth]);

  return (
    <div className="space-y-6">
      <FinanceSummaryCards formatCurrency={formatCurrency} summary={summary} />

      <FinancialChart
        filterOptions={FINANCIAL_CHART_FILTERS}
        formatCompactCurrency={formatCompactCurrency}
        formatCurrency={formatCurrency}
        isLoading={isChartLoading}
        isMobile={isMobile}
        model={chartModel}
        onFilterChange={handleChartFilterChange}
        onPrimaryAction={handleScrollToFinanceForms}
        selectedFilter={chartFilter}
      />

      <section id="finance-forms">
        <FinanceForms
          entryCategories={ENTRY_CATEGORIES}
          entryForm={entryForm}
          expenseCategories={EXPENSE_CATEGORIES}
          expenseForm={expenseForm}
          onEntryChange={handleEntryChange}
          onExpenseChange={handleExpenseChange}
          onSubmitEntry={handleAddEntry}
          onSubmitExpense={handleAddExpense}
        />
      </section>

      <TransactionsCard
        entryCategories={ENTRY_CATEGORIES}
        expenseCategories={EXPENSE_CATEGORIES}
        filterType={filterType}
        formatCurrency={formatCurrency}
        onClearMonth={onClearMonth}
        onFilterChange={setFilterType}
        onOpenHistory={handleOpenHistory}
        onRemoveTransaction={onRemoveTransaction}
        transactions={transactions}
      />

      <FinanceHistoryDialog
        historyGroups={historyGroups}
        isMobile={isMobile}
        loadingMonth={loadingMonth}
        onBack={() => setSelectedHistoryMonth(null)}
        onDeleteMonth={handleDeleteHistoryMonth}
        onOpenChange={setHistoryOpen}
        onSelectMonth={handleSelectHistoryMonth}
        open={historyOpen}
        deletingMonthKey={deletingMonthKey}
        selectedHistoryMonth={selectedHistoryMonth}
        selectedMonthData={selectedMonthData}
      />
    </div>
  );
};

export default FinanceSection;
