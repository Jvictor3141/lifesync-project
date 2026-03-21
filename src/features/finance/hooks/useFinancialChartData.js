import { useEffect, useMemo, useState } from 'react';
import {
  buildFinancialChartModel,
  createEmptyFinanceData,
  currentFinanceMonthKey,
  getRequiredFinanceMonthKeys,
} from '@/features/finance/lib/finance-utils';

export const useFinancialChartData = ({
  filterKey,
  financialData,
  onLoadMonthData,
  referenceDate,
}) => {
  const referenceMonthKey = currentFinanceMonthKey(referenceDate);
  const [monthCache, setMonthCache] = useState(() => ({
    [referenceMonthKey]: financialData || createEmptyFinanceData(),
  }));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const currentMonthKey = currentFinanceMonthKey(referenceDate);
    const nextData = financialData || createEmptyFinanceData();

    setMonthCache((current) => ({
      ...current,
      [currentMonthKey]: nextData,
    }));
  }, [financialData, referenceDate]);

  const requiredMonthKeys = useMemo(
    () => getRequiredFinanceMonthKeys(filterKey, referenceDate),
    [filterKey, referenceDate],
  );

  useEffect(() => {
    let cancelled = false;
    const missingMonthKeys = requiredMonthKeys.filter((monthKey) => monthCache[monthKey] === undefined);

    if (!missingMonthKeys.length || !onLoadMonthData) {
      return undefined;
    }

    setIsLoading(true);

    (async () => {
      const results = await Promise.all(
        missingMonthKeys.map(async (monthKey) => {
          try {
            const data = await onLoadMonthData(monthKey);
            return [monthKey, data || createEmptyFinanceData()];
          } catch {
            return [monthKey, createEmptyFinanceData()];
          }
        }),
      );

      if (cancelled) {
        return;
      }

      setMonthCache((current) => {
        const nextCache = { ...current };

        results.forEach(([monthKey, data]) => {
          nextCache[monthKey] = data;
        });

        return nextCache;
      });
    })().finally(() => {
      if (!cancelled) {
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [monthCache, onLoadMonthData, requiredMonthKeys]);

  const chartModel = useMemo(
    () => buildFinancialChartModel({
      monthDataMap: monthCache,
      filterKey,
      referenceDate,
    }),
    [filterKey, monthCache, referenceDate],
  );

  return {
    chartModel,
    isLoading,
  };
};
