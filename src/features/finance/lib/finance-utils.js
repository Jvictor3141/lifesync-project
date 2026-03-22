import { currentFinanceMonthKey, formatMonthLabel, sortByDateDesc, toIsoDateKey } from '@/shared/lib/date';
import {
  MAX_TEXT_LENGTHS,
  normalizeSingleLineText,
  sanitizeLooseId,
} from '@/shared/lib/security';

export const ENTRY_CATEGORIES = {
  salario: { icon: '💼', label: 'Salário' },
  freelance: { icon: '💻', label: 'Freelance' },
  presente: { icon: '🎁', label: 'Presente' },
  investimento: { icon: '📈', label: 'Investimento' },
};

export const EXPENSE_CATEGORIES = {
  alimentacao: { icon: '🍽️', label: 'Alimentação' },
  transporte: { icon: '🚗', label: 'Transporte' },
  casa: { icon: '🏠', label: 'Casa' },
  lazer: { icon: '🎮', label: 'Lazer' },
  roupas: { icon: '👕', label: 'Roupas' },
  saude: { icon: '💊', label: 'Saúde' },
  educacao: { icon: '📚', label: 'Educação' },
  outros: { icon: '🔁', label: 'Outros' },
};

export const FINANCIAL_CHART_FILTERS = [
  { value: 'last7', label: 'Últimos 7 dias', description: 'Fluxo diário da última semana' },
  { value: 'last30', label: 'Últimos 30 dias', description: 'Fluxo diário dos últimos 30 dias' },
  { value: 'month', label: 'Este mês', description: 'Fluxo diário do mês atual' },
  { value: 'year', label: 'Este ano', description: 'Fluxo mensal do ano atual' },
];

const EXPENSE_PIE_PALETTE = [
  '#D66073',
  '#EE8798',
  '#F09F67',
  '#E4B95E',
  '#7BAECC',
  '#78C9C5',
  '#8D93F4',
  '#8EAF8C',
];

const DAY_MS = 24 * 60 * 60 * 1000;

export const createEmptyFinanceData = () => ({
  entradas: [],
  gastos: [],
});

export const MAX_TRANSACTIONS_PER_TYPE = 400;
export const MAX_TRANSACTION_AMOUNT = 1000000000;

export const formatCurrency = (value) => (
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value || 0))
);

export const formatCompactCurrency = (value) => (
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(value || 0))
);

export const parseAmountInput = (value) => {
  const parsed = parseFloat(String(value).replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
};

export const formatCategoryLabel = (categoryKey) => (
  ENTRY_CATEGORIES[categoryKey]?.label
  || EXPENSE_CATEGORIES[categoryKey]?.label
  || categoryKey
);

const capitalize = (value = '') => value.charAt(0).toUpperCase() + value.slice(1);

const cleanLocaleLabel = (value = '') => capitalize(value.replaceAll('.', ''));

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

const ENTRY_CATEGORY_SET = new Set(Object.keys(ENTRY_CATEGORIES));
const EXPENSE_CATEGORY_SET = new Set(Object.keys(EXPENSE_CATEGORIES));

const sanitizeTransactionAmount = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_TRANSACTION_AMOUNT) {
    return 0;
  }

  return Math.round(amount * 100) / 100;
};

const sanitizeTransactionCategory = (category, type) => {
  const allowedCategories = type === 'entrada' ? ENTRY_CATEGORY_SET : EXPENSE_CATEGORY_SET;
  const fallbackCategory = type === 'entrada' ? 'salario' : 'outros';
  return allowedCategories.has(category) ? category : fallbackCategory;
};

const sanitizeTransactionDate = (value) => safeDate(value).toISOString();

const buildFallbackTransactionId = (item, type) => (
  [
    type,
    sanitizeTransactionDate(item?.data),
    normalizeSingleLineText(item?.descricao, MAX_TEXT_LENGTHS.transactionDescription),
  ].filter(Boolean).join('|') || type
);

const sanitizeTransactionRecord = (item, type) => {
  const descricao = normalizeSingleLineText(item?.descricao, MAX_TEXT_LENGTHS.transactionDescription);
  const valor = sanitizeTransactionAmount(item?.valor);

  if (!descricao || !valor) {
    return null;
  }

  return {
    id: sanitizeLooseId(item?.id, buildFallbackTransactionId(item, type)),
    tipo: type,
    valor,
    descricao,
    categoria: sanitizeTransactionCategory(item?.categoria, type),
    data: sanitizeTransactionDate(item?.data),
  };
};

export const sanitizeFinanceData = (financialData) => ({
  entradas: (financialData?.entradas || [])
    .map((entry) => sanitizeTransactionRecord(entry, 'entrada'))
    .filter(Boolean)
    .slice(0, MAX_TRANSACTIONS_PER_TYPE),
  gastos: (financialData?.gastos || [])
    .map((expense) => sanitizeTransactionRecord(expense, 'gasto'))
    .filter(Boolean)
    .slice(0, MAX_TRANSACTIONS_PER_TYPE),
});

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

const addDays = (value, amount) => {
  const date = safeDate(value);
  date.setDate(date.getDate() + amount);
  return date;
};

const addMonths = (value, amount) => {
  const date = safeDate(value);
  date.setMonth(date.getMonth() + amount);
  return date;
};

const startOfYear = (value) => {
  const date = safeDate(value);
  return new Date(date.getFullYear(), 0, 1);
};

const monthKeyFromDate = (value) => currentFinanceMonthKey(value);

const endOfComparableDay = (year, monthIndex, day) => {
  const maxDay = new Date(year, monthIndex + 1, 0).getDate();
  return endOfDay(new Date(year, monthIndex, Math.min(day, maxDay)));
};

const formatDayLabel = (value, full = false) => cleanLocaleLabel(
  safeDate(value).toLocaleDateString('pt-BR', full
    ? { weekday: 'short', day: '2-digit', month: 'short' }
    : { day: '2-digit', month: 'short' }),
);

const formatMonthShortLabel = (value) => cleanLocaleLabel(
  safeDate(value).toLocaleDateString('pt-BR', { month: 'short' }),
);

const formatMonthLongLabel = (value) => cleanLocaleLabel(
  safeDate(value).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
);

const buildRangeLabel = (start, end, bucket) => {
  if (bucket === 'month') {
    return `${formatMonthLongLabel(start)} a ${formatMonthLongLabel(end)}`;
  }

  return `${formatDayLabel(start)} a ${formatDayLabel(end)}`;
};

const getFilterMeta = (filterKey) => (
  FINANCIAL_CHART_FILTERS.find((filter) => filter.value === filterKey)
  ?? FINANCIAL_CHART_FILTERS[2]
);

export const getFinancialFilterRange = (filterKey, referenceDate = new Date()) => {
  const reference = endOfDay(referenceDate);
  const meta = getFilterMeta(filterKey);

  if (meta.value === 'last7') {
    const start = startOfDay(addDays(reference, -6));
    return {
      ...meta,
      bucket: 'day',
      start,
      end: reference,
      rangeLabel: buildRangeLabel(start, reference, 'day'),
    };
  }

  if (meta.value === 'last30') {
    const start = startOfDay(addDays(reference, -29));
    return {
      ...meta,
      bucket: 'day',
      start,
      end: reference,
      rangeLabel: buildRangeLabel(start, reference, 'day'),
    };
  }

  if (meta.value === 'year') {
    const start = startOfYear(reference);
    return {
      ...meta,
      bucket: 'month',
      start,
      end: reference,
      rangeLabel: buildRangeLabel(start, reference, 'month'),
    };
  }

  const start = startOfMonth(reference);
  return {
    ...meta,
    bucket: 'day',
    start,
    end: reference,
    rangeLabel: buildRangeLabel(start, reference, 'day'),
  };
};

export const getFinancialComparisonRange = (filterKey, referenceDate = new Date()) => {
  const currentRange = getFinancialFilterRange(filterKey, referenceDate);
  const { value } = getFilterMeta(filterKey);

  if (value === 'last7') {
    const end = endOfDay(addDays(currentRange.start, -1));
    const start = startOfDay(addDays(end, -6));

    return {
      ...currentRange,
      start,
      end,
      rangeLabel: buildRangeLabel(start, end, currentRange.bucket),
    };
  }

  if (value === 'last30') {
    const end = endOfDay(addDays(currentRange.start, -1));
    const start = startOfDay(addDays(end, -29));

    return {
      ...currentRange,
      start,
      end,
      rangeLabel: buildRangeLabel(start, end, currentRange.bucket),
    };
  }

  if (value === 'year') {
    const comparisonYear = currentRange.end.getFullYear() - 1;
    const start = new Date(comparisonYear, 0, 1);
    const end = endOfComparableDay(
      comparisonYear,
      currentRange.end.getMonth(),
      currentRange.end.getDate(),
    );

    return {
      ...currentRange,
      start,
      end,
      rangeLabel: buildRangeLabel(start, end, currentRange.bucket),
    };
  }

  const previousMonth = addMonths(currentRange.start, -1);
  const start = startOfMonth(previousMonth);
  const end = endOfComparableDay(
    previousMonth.getFullYear(),
    previousMonth.getMonth(),
    currentRange.end.getDate(),
  );

  return {
    ...currentRange,
    start,
    end,
    rangeLabel: buildRangeLabel(start, end, currentRange.bucket),
  };
};

export const listFinanceMonthKeysBetween = (startDate, endDate) => {
  const start = startOfMonth(startDate);
  const end = startOfMonth(endDate);
  const keys = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    keys.push(monthKeyFromDate(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return keys;
};

export const getRequiredFinanceMonthKeys = (filterKey, referenceDate = new Date()) => {
  const currentRange = getFinancialFilterRange(filterKey, referenceDate);
  const previousRange = getFinancialComparisonRange(filterKey, referenceDate);

  return Array.from(new Set([
    ...listFinanceMonthKeysBetween(previousRange.start, previousRange.end),
    ...listFinanceMonthKeysBetween(currentRange.start, currentRange.end),
    currentFinanceMonthKey(referenceDate),
  ])).sort();
};

const getBucketKey = (value, bucket) => (
  bucket === 'month' ? monthKeyFromDate(value) : toIsoDateKey(value)
);

const createBuckets = (range) => {
  if (range.bucket === 'month') {
    const buckets = [];
    const cursor = startOfMonth(range.start);
    const end = startOfMonth(range.end);

    while (cursor <= end) {
      buckets.push({
        key: monthKeyFromDate(cursor),
        shortLabel: formatMonthShortLabel(cursor),
        fullLabel: formatMonthLongLabel(cursor),
        date: new Date(cursor),
      });

      cursor.setMonth(cursor.getMonth() + 1);
    }

    return buckets;
  }

  const totalDays = Math.max(1, Math.round((startOfDay(range.end) - startOfDay(range.start)) / DAY_MS) + 1);
  const buckets = [];
  const cursor = startOfDay(range.start);
  const end = startOfDay(range.end);

  while (cursor <= end) {
    buckets.push({
      key: toIsoDateKey(cursor),
      shortLabel: totalDays > 14
        ? cursor.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
        : formatDayLabel(cursor),
      fullLabel: formatDayLabel(cursor, true),
      date: new Date(cursor),
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  return buckets;
};

const normalizeRecords = (items, type) => (
  (items || []).map((item) => ({
    ...item,
    tipo: type,
    valor: Number(item.valor || 0),
    dateObject: safeDate(item.data),
  }))
);

const collectRangeRecords = (monthDataMap, range, field, type) => {
  const monthKeys = listFinanceMonthKeysBetween(range.start, range.end);

  return monthKeys
    .flatMap((monthKey) => normalizeRecords(monthDataMap?.[monthKey]?.[field], type))
    .filter((item) => {
      const time = item.dateObject.getTime();
      return time >= startOfDay(range.start).getTime() && time <= endOfDay(range.end).getTime();
    });
};

const aggregateRecordsByBucket = (records, bucket) => (
  records.reduce((accumulator, item) => {
    const key = getBucketKey(item.dateObject, bucket);
    accumulator[key] = (accumulator[key] || 0) + Number(item.valor || 0);
    return accumulator;
  }, {})
);

const sumValues = (records) => records.reduce((sum, item) => sum + Number(item.valor || 0), 0);

const buildTotals = (entries, expenses) => {
  const totalEntries = sumValues(entries);
  const totalExpenses = sumValues(expenses);

  return {
    totalEntries,
    totalExpenses,
    netProfit: totalEntries - totalExpenses,
  };
};

const calculateChange = (currentValue, previousValue) => {
  if (!previousValue) {
    return currentValue ? null : 0;
  }

  return ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
};

const buildComparison = (totals, previousTotals) => ({
  entries: calculateChange(totals.totalEntries, previousTotals.totalEntries),
  expenses: calculateChange(totals.totalExpenses, previousTotals.totalExpenses),
  profit: calculateChange(totals.netProfit, previousTotals.netProfit),
});

const buildExpensePieDataFromRecords = (expenses) => {
  const grouped = expenses.reduce((accumulator, expense) => {
    const category = expense.categoria || 'outros';
    accumulator[category] = (accumulator[category] || 0) + Number(expense.valor || 0);
    return accumulator;
  }, {});

  return Object.entries(grouped)
    .sort((left, right) => right[1] - left[1])
    .map(([category, value], index) => ({
      name: formatCategoryLabel(category),
      value,
      fill: EXPENSE_PIE_PALETTE[index % EXPENSE_PIE_PALETTE.length],
      category,
    }));
};

const buildMonthProjection = (monthDataMap, referenceDate = new Date()) => {
  const range = {
    start: startOfMonth(referenceDate),
    end: endOfDay(referenceDate),
  };
  const entries = collectRangeRecords(monthDataMap, range, 'entradas', 'entrada');
  const expenses = collectRangeRecords(monthDataMap, range, 'gastos', 'gasto');
  const totals = buildTotals(entries, expenses);
  const elapsedDays = Math.max(1, referenceDate.getDate());
  const daysInMonth = endOfMonth(referenceDate).getDate();
  const remainingDays = Math.max(daysInMonth - referenceDate.getDate(), 0);
  const averageDailyEntries = totals.totalEntries / elapsedDays;
  const averageDailyExpenses = totals.totalExpenses / elapsedDays;
  const averageDailyNet = totals.netProfit / elapsedDays;
  const projectedEntries = totals.totalEntries + (averageDailyEntries * remainingDays);
  const projectedExpenses = totals.totalExpenses + (averageDailyExpenses * remainingDays);
  const projectedNet = projectedEntries - projectedExpenses;

  return {
    label: 'Previsão até o fim do mês',
    daysElapsed: elapsedDays,
    remainingDays,
    averageDailyEntries,
    averageDailyExpenses,
    averageDailyNet,
    projectedEntries,
    projectedExpenses,
    projectedNet,
  };
};

const buildFinancialAlerts = ({ comparison, forecast, totals, filterLabel }) => {
  const alerts = [];

  if (forecast.projectedNet < 0) {
    alerts.push({
      id: 'negative-forecast',
      severity: 'critical',
      title: 'Saldo negativo previsto',
      description: `Mantido o ritmo atual, o fechamento do mês tende a ficar em ${formatCurrency(forecast.projectedNet)}.`,
    });
  }

  if (totals.netProfit < 0) {
    alerts.push({
      id: 'negative-profit',
      severity: 'warning',
      title: 'Lucro negativo no período',
      description: `No filtro ${filterLabel.toLowerCase()}, as despesas superam as receitas em ${formatCurrency(Math.abs(totals.netProfit))}.`,
    });
  }

  if (comparison.expenses !== null && comparison.expenses > 20) {
    alerts.push({
      id: 'expense-growth',
      severity: 'warning',
      title: 'Despesas acelerando',
      description: `Os gastos cresceram ${Math.abs(comparison.expenses).toFixed(1)}% em relação ao período anterior.`,
    });
  }

  if (!alerts.length) {
    alerts.push({
      id: 'healthy-flow',
      severity: 'info',
      title: 'Fluxo sob controle',
      description: 'Nao ha alertas criticos no periodo analisado.',
    });
  }

  return alerts;
};

export const buildFinancialChartModel = ({ monthDataMap, filterKey, referenceDate = new Date() }) => {
  const currentRange = getFinancialFilterRange(filterKey, referenceDate);
  const previousRange = getFinancialComparisonRange(filterKey, referenceDate);

  const currentEntries = collectRangeRecords(monthDataMap, currentRange, 'entradas', 'entrada');
  const currentExpenses = collectRangeRecords(monthDataMap, currentRange, 'gastos', 'gasto');
  const previousEntries = collectRangeRecords(monthDataMap, previousRange, 'entradas', 'entrada');
  const previousExpenses = collectRangeRecords(monthDataMap, previousRange, 'gastos', 'gasto');

  const totals = buildTotals(currentEntries, currentExpenses);
  const previousTotals = buildTotals(previousEntries, previousExpenses);
  const comparison = buildComparison(totals, previousTotals);
  const buckets = createBuckets(currentRange);
  const entriesByBucket = aggregateRecordsByBucket(currentEntries, currentRange.bucket);
  const expensesByBucket = aggregateRecordsByBucket(currentExpenses, currentRange.bucket);

  const points = buckets.map((bucket) => {
    const receitas = entriesByBucket[bucket.key] || 0;
    const despesas = expensesByBucket[bucket.key] || 0;
    const lucro = receitas - despesas;

    return {
      key: bucket.key,
      label: bucket.shortLabel,
      fullLabel: bucket.fullLabel,
      receitas,
      despesas,
      lucro,
      lucroNegativo: lucro < 0,
    };
  });

  const forecast = buildMonthProjection(monthDataMap, referenceDate);
  const alerts = buildFinancialAlerts({
    comparison,
    forecast,
    totals,
    filterLabel: currentRange.label,
  });

  return {
    filterKey: currentRange.value,
    filterLabel: currentRange.label,
    rangeLabel: currentRange.rangeLabel,
    comparisonRangeLabel: previousRange.rangeLabel,
    points,
    totals,
    previousTotals,
    comparison,
    pieData: buildExpensePieDataFromRecords(currentExpenses),
    forecast,
    alerts,
    isEmpty: currentEntries.length === 0 && currentExpenses.length === 0,
    hasNegativeProfit: points.some((point) => point.lucro < 0),
    minimumProfit: Math.min(0, ...points.map((point) => point.lucro)),
  };
};

export const colorForCategory = (name) => {
  const value = String(name || 'outros');
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return EXPENSE_PIE_PALETTE[hash % EXPENSE_PIE_PALETTE.length];
};

export const buildFinanceSummary = (financialData) => {
  const totalEntries = (financialData?.entradas || [])
    .reduce((sum, entry) => sum + Number(entry.valor || 0), 0);
  const totalExpenses = (financialData?.gastos || [])
    .reduce((sum, expense) => sum + Number(expense.valor || 0), 0);

  return {
    totalEntries,
    totalExpenses,
    balance: totalEntries - totalExpenses,
  };
};

export const buildTransactions = (financialData, filterType = 'todos') => {
  const transactions = [];

  if (filterType === 'todos' || filterType === 'entrada') {
    transactions.push(
      ...(financialData?.entradas || []).map((entry) => ({
        ...entry,
        tipo: 'entrada',
      })),
    );
  }

  if (filterType === 'todos' || filterType === 'gasto') {
    transactions.push(
      ...(financialData?.gastos || []).map((expense) => ({
        ...expense,
        tipo: 'gasto',
      })),
    );
  }

  return transactions.sort((left, right) => sortByDateDesc(left.data, right.data));
};

export const buildHistoryGroups = (historyMonths) => (
  Object.entries((historyMonths || []).reduce((accumulator, monthKey) => {
    const [year] = monthKey.split('-');
    accumulator[year] = accumulator[year] || [];
    accumulator[year].push(monthKey);
    return accumulator;
  }, {}))
    .sort(([leftYear], [rightYear]) => Number(rightYear) - Number(leftYear))
    .map(([year, months]) => ({
      year,
      months: months.sort().reverse(),
    }))
);

export { currentFinanceMonthKey, formatMonthLabel };
