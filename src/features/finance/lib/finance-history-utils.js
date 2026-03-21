import { formatCategoryLabel } from '@/features/finance/lib/finance-utils';

const DAY_MS = 24 * 60 * 60 * 1000;

const safeDate = (value, fallback = new Date()) => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? new Date(fallback) : new Date(value);
  }

  if (!value) {
    return new Date(fallback);
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date(fallback) : parsed;
};

const startOfDay = (value) => {
  const date = safeDate(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const endOfDay = (value) => {
  const date = safeDate(value);
  date.setHours(23, 59, 59, 999);
  return date;
};

const startOfMonth = (value) => {
  const date = safeDate(value);
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

const endOfMonth = (value) => {
  const date = safeDate(value);
  return endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0));
};

const toIsoDateKey = (value) => startOfDay(value).toISOString().slice(0, 10);

const normalizeRecords = (items, type) => (
  (items || []).map((item) => ({
    ...item,
    tipo: type,
    valor: Number(item.valor || 0),
    dateObject: safeDate(item.data),
  }))
);

const buildTotals = (entries, expenses) => {
  const totalEntries = entries.reduce((sum, entry) => sum + Number(entry.valor || 0), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.valor || 0), 0);

  return {
    totalEntries,
    totalExpenses,
    balance: totalEntries - totalExpenses,
  };
};

const monthDateFromKey = (monthKey, fallback = new Date()) => {
  if (typeof monthKey !== 'string') {
    return safeDate(fallback);
  }

  const [year, month] = monthKey.split('-').map(Number);

  if (!year || !month) {
    return safeDate(fallback);
  }

  return new Date(year, month - 1, 1);
};

const buildDayBuckets = (monthDate) => {
  const start = startOfMonth(monthDate);
  const end = endOfMonth(monthDate);
  const totalDays = Math.max(1, Math.round((startOfDay(end) - startOfDay(start)) / DAY_MS) + 1);
  const buckets = [];
  const cursor = startOfDay(start);

  while (cursor <= end) {
    buckets.push({
      key: toIsoDateKey(cursor),
      date: new Date(cursor),
      label: cursor.toLocaleDateString('pt-BR', { day: '2-digit' }),
      fullLabel: cursor.toLocaleDateString('pt-BR', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
      }),
      showTick: totalDays <= 10
        ? true
        : totalDays <= 20
          ? cursor.getDate() % 2 === 1
          : cursor.getDate() === 1 || cursor.getDate() % 5 === 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return buckets;
};

export const buildMonthlyHistoryModel = (financialData, monthKey) => {
  const monthDate = monthDateFromKey(monthKey);
  const start = startOfMonth(monthDate);
  const end = endOfMonth(monthDate);
  const entries = normalizeRecords(financialData?.entradas || [], 'entrada')
    .filter((entry) => entry.dateObject.getTime() >= startOfDay(start).getTime()
      && entry.dateObject.getTime() <= endOfDay(end).getTime());
  const expenses = normalizeRecords(financialData?.gastos || [], 'gasto')
    .filter((expense) => expense.dateObject.getTime() >= startOfDay(start).getTime()
      && expense.dateObject.getTime() <= endOfDay(end).getTime());
  const totals = buildTotals(entries, expenses);
  const entriesByDay = entries.reduce((accumulator, entry) => {
    const key = toIsoDateKey(entry.dateObject);
    accumulator[key] = (accumulator[key] || 0) + Number(entry.valor || 0);
    return accumulator;
  }, {});
  const expensesByDay = expenses.reduce((accumulator, expense) => {
    const key = toIsoDateKey(expense.dateObject);
    accumulator[key] = (accumulator[key] || 0) + Number(expense.valor || 0);
    return accumulator;
  }, {});
  const expensesByCategory = expenses.reduce((accumulator, expense) => {
    const category = expense.categoria || 'outros';
    accumulator[category] = (accumulator[category] || 0) + Number(expense.valor || 0);
    return accumulator;
  }, {});
  const topExpenseCategoryEntry = Object.entries(expensesByCategory)
    .sort((left, right) => right[1] - left[1])[0] || null;

  let cumulativeBalance = 0;
  const points = buildDayBuckets(monthDate).map((bucket) => {
    const entradas = entriesByDay[bucket.key] || 0;
    const gastos = expensesByDay[bucket.key] || 0;
    const saldoDia = entradas - gastos;

    cumulativeBalance += saldoDia;

    return {
      key: bucket.key,
      label: bucket.label,
      fullLabel: bucket.fullLabel,
      showTick: bucket.showTick,
      entradas,
      gastos,
      saldoDia,
      saldoAcumulado: cumulativeBalance,
    };
  });

  const activePoints = points.filter((point) => point.entradas > 0 || point.gastos > 0);
  const bestDay = [...activePoints].sort((left, right) => right.saldoDia - left.saldoDia)[0] || null;
  const worstDay = [...activePoints].sort((left, right) => left.saldoDia - right.saldoDia)[0] || null;

  return {
    points,
    totals,
    totalTransactions: entries.length + expenses.length,
    topExpenseCategory: topExpenseCategoryEntry
      ? {
          label: formatCategoryLabel(topExpenseCategoryEntry[0]),
          value: topExpenseCategoryEntry[1],
        }
      : null,
    bestDay: bestDay
      ? {
          label: bestDay.fullLabel,
          value: bestDay.saldoDia,
        }
      : null,
    worstDay: worstDay
      ? {
          label: worstDay.fullLabel,
          value: worstDay.saldoDia,
        }
      : null,
    hasNegativeBalance: points.some((point) => point.saldoAcumulado < 0),
    minimumCumulativeBalance: Math.min(0, ...points.map((point) => point.saldoAcumulado)),
    isEmpty: entries.length === 0 && expenses.length === 0,
  };
};
