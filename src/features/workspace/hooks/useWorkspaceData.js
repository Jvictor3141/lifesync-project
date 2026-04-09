import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { createId } from '@/shared/lib/id';
import { toAgendaDateKey } from '@/shared/lib/date';
import { createUserDataRepository } from '@/features/workspace/api/userDataRepository';
import {
  buildAgendaDayPayload,
  createEmptyAgenda,
  dedupeTasks,
  filterTasksByDate,
  flattenAgendaTasks,
  getTaskDateKey,
  normalizeTask,
  toggleTaskCompletion,
  TASK_PERIODS,
} from '@/features/agenda/lib/task-utils';
import {
  createEmptyFinanceData,
  currentFinanceMonthKey,
  sanitizeFinanceData,
} from '@/features/finance/lib/finance-utils';
import {
  normalizeSpecialDate,
  pruneExpiredOneTimeSpecialDates,
  sanitizeSpecialDatesCollection,
} from '@/features/agenda/lib/special-date-utils';

const normalizeAgendaSnapshot = (snapshot) => {
  const nextTasks = createEmptyAgenda();

  snapshot.forEach((documentSnapshot) => {
    const dayData = documentSnapshot.data() || {};
    const dateKey = documentSnapshot.id;

    TASK_PERIODS.forEach((period) => {
      (dayData[period.id] || []).forEach((task) => {
        const normalizedTask = normalizeTask(task, dateKey);

        if (getTaskDateKey(normalizedTask, dateKey) !== dateKey) {
          return;
        }

        nextTasks[period.id].push(normalizedTask);
      });
    });
  });

  return dedupeTasks(nextTasks);
};

export const useWorkspaceData = (uid) => {
  const repository = useMemo(() => createUserDataRepository(uid), [uid]);
  const [selectedDate, setSelectedDate] = useState(() => toAgendaDateKey(new Date()));
  const [allTasks, setAllTasks] = useState(createEmptyAgenda);
  const [agendaData, setAgendaData] = useState(createEmptyAgenda);
  const [financialData, setFinancialData] = useState(createEmptyFinanceData);
  const [specialDates, setSpecialDates] = useState([]);

  useEffect(() => {
    setAgendaData(filterTasksByDate(allTasks, selectedDate));
  }, [allTasks, selectedDate]);

  useEffect(() => {
    if (!repository.isReady) {
      setAllTasks(createEmptyAgenda());
      setFinancialData(createEmptyFinanceData());
      setSpecialDates([]);
      return undefined;
    }

    const financeMonthKey = currentFinanceMonthKey();

    const unsubscribeAgenda = repository.watchAgenda((snapshot) => {
      setAllTasks(normalizeAgendaSnapshot(snapshot));
    }, () => {
      toast.error('Erro ao carregar dados da agenda.');
    });

    const unsubscribeFinance = repository.watchFinanceMonth(financeMonthKey, (snapshot) => {
      setFinancialData(snapshot.exists() ? sanitizeFinanceData(snapshot.data()) : createEmptyFinanceData());
    }, () => {
      toast.error('Erro ao carregar dados financeiros.');
    });

    const unsubscribeSpecialDates = repository.watchSpecialDates(async (snapshot) => {
      const rawSpecialDates = snapshot.exists() ? sanitizeSpecialDatesCollection(snapshot.data().datas || []) : [];
      const nextSpecialDates = pruneExpiredOneTimeSpecialDates(rawSpecialDates);
      setSpecialDates(nextSpecialDates);

      if (nextSpecialDates.length !== rawSpecialDates.length) {
        try {
          await repository.saveSpecialDates(nextSpecialDates);
        } catch {
          // silently skip pruning if save fails; stale one-time dates are benign
        }
      }
    }, () => {
      toast.error('Erro ao carregar datas especiais.');
    });

    return () => {
      unsubscribeAgenda();
      unsubscribeFinance();
      unsubscribeSpecialDates();
    };
  }, [repository]);

  const persistAgenda = async (nextTasks, dateKey, previousTasks, successMessage, errorMessage) => {
    const sanitizedTasks = dedupeTasks(nextTasks);
    setAllTasks(sanitizedTasks);

    try {
      await repository.saveAgendaDay(dateKey, buildAgendaDayPayload(sanitizedTasks, dateKey));

      if (successMessage) {
        toast.success(successMessage);
      }
    } catch (error) {
      setAllTasks(previousTasks);
      toast.error(errorMessage);
      throw error;
    }
  };

  const addTask = async (period, task) => {
    const currentDateKey = selectedDate;
    const previousTasks = allTasks;
    const nextTasks = {
      ...allTasks,
      [period]: [
        ...(allTasks[period] || []),
        normalizeTask({
          ...task,
          id: createId(),
          dateKey: currentDateKey,
          createdAt: new Date(currentDateKey).toISOString(),
        }, currentDateKey),
      ],
    };

    await persistAgenda(
      nextTasks,
      currentDateKey,
      previousTasks,
      'Tarefa adicionada.',
      'Erro ao adicionar tarefa.',
    );
  };

  const toggleTask = async (taskId) => {
    const foundTask = flattenAgendaTasks(allTasks).find((task) => task.id === taskId);

    if (!foundTask) {
      return;
    }

    const previousTasks = allTasks;
    const taskDateKey = getTaskDateKey(foundTask, selectedDate);
    const nextTasks = TASK_PERIODS.reduce((accumulator, period) => {
      accumulator[period.id] = (allTasks[period.id] || []).map((task) => (
        task.id === taskId
          ? toggleTaskCompletion(task, selectedDate)
          : task
      ));
      return accumulator;
    }, createEmptyAgenda());

    await persistAgenda(
      nextTasks,
      taskDateKey,
      previousTasks,
      '',
      'Erro ao atualizar tarefa.',
    );
  };

  const removeTask = async (taskId) => {
    const foundTask = flattenAgendaTasks(allTasks).find((task) => task.id === taskId);

    if (!foundTask) {
      return;
    }

    const previousTasks = allTasks;
    const taskDateKey = getTaskDateKey(foundTask, selectedDate);
    const nextTasks = TASK_PERIODS.reduce((accumulator, period) => {
      accumulator[period.id] = (allTasks[period.id] || []).filter((task) => task.id !== taskId);
      return accumulator;
    }, createEmptyAgenda());

    await persistAgenda(
      nextTasks,
      taskDateKey,
      previousTasks,
      'Tarefa removida.',
      'Erro ao remover tarefa.',
    );
  };

  const persistFinance = async (nextFinancialData, previousFinancialData, successMessage, errorMessage) => {
    const sanitizedFinancialData = sanitizeFinanceData(nextFinancialData);
    setFinancialData(sanitizedFinancialData);

    try {
      await repository.saveFinanceMonth(currentFinanceMonthKey(), sanitizedFinancialData);

      if (successMessage) {
        toast.success(successMessage);
      }
    } catch (error) {
      setFinancialData(previousFinancialData);
      toast.error(errorMessage);
      throw error;
    }
  };

  const addEntry = async (entryData) => {
    const previousFinancialData = financialData;
    const nextFinancialData = {
      ...financialData,
      entradas: [
        ...(financialData.entradas || []),
        {
          ...entryData,
          id: createId(),
          tipo: 'entrada',
          data: new Date().toISOString(),
        },
      ],
    };

    await persistFinance(
      nextFinancialData,
      previousFinancialData,
      'Entrada adicionada.',
      'Erro ao adicionar entrada.',
    );
  };

  const addExpense = async (expenseData) => {
    const previousFinancialData = financialData;
    const nextFinancialData = {
      ...financialData,
      gastos: [
        ...(financialData.gastos || []),
        {
          ...expenseData,
          id: createId(),
          tipo: 'gasto',
          data: new Date().toISOString(),
        },
      ],
    };

    await persistFinance(
      nextFinancialData,
      previousFinancialData,
      'Gasto adicionado.',
      'Erro ao adicionar gasto.',
    );
  };

  const removeTransaction = async (id, type) => {
    const previousFinancialData = financialData;
    const nextFinancialData = {
      ...financialData,
      entradas: type === 'entrada'
        ? (financialData.entradas || []).filter((entry) => entry.id !== id)
        : (financialData.entradas || []),
      gastos: type === 'gasto'
        ? (financialData.gastos || []).filter((expense) => expense.id !== id)
        : (financialData.gastos || []),
    };

    await persistFinance(
      nextFinancialData,
      previousFinancialData,
      'Transação removida.',
      'Erro ao remover transação.',
    );
  };

  const clearFinancialData = async () => {
    await persistFinance(
      createEmptyFinanceData(),
      financialData,
      'Dados financeiros do mês limpos.',
      'Erro ao limpar dados financeiros.',
    );
  };

  const getFinancialHistoryMonths = async () => {
    try {
      return await repository.listFinanceMonths();
    } catch {
      return [];
    }
  };

  const getFinancialDataForMonth = async (monthKey) => {
    try {
      return sanitizeFinanceData(await repository.getFinanceMonth(monthKey) || createEmptyFinanceData());
    } catch {
      return createEmptyFinanceData();
    }
  };

  const deleteFinancialHistoryMonth = async (monthKey) => {
    if (!monthKey) {
      return;
    }

    try {
      await repository.deleteFinanceMonth(monthKey);
      toast.success('Histórico financeiro removido.');
    } catch (error) {
      toast.error('Erro ao remover histórico financeiro.');
      throw error;
    }
  };

  const addSpecialDate = async (specialDate) => {
    const previousSpecialDates = specialDates;
    const normalizedSpecialDate = normalizeSpecialDate({
      ...specialDate,
      id: createId(),
    });

    if (!normalizedSpecialDate) {
      toast.error('Data especial inválida.');
      return;
    }

    const nextSpecialDates = sanitizeSpecialDatesCollection([
      ...specialDates,
      normalizedSpecialDate,
    ]);

    setSpecialDates(nextSpecialDates);

    try {
      await repository.saveSpecialDates(nextSpecialDates);
      toast.success('Data especial adicionada.');
    } catch (error) {
      setSpecialDates(previousSpecialDates);
      toast.error('Erro ao adicionar data especial.');
      throw error;
    }
  };

  const removeSpecialDate = async (id) => {
    const previousSpecialDates = specialDates;
    const nextSpecialDates = sanitizeSpecialDatesCollection(
      specialDates.filter((specialDate) => specialDate.id !== id),
    );

    setSpecialDates(nextSpecialDates);

    try {
      await repository.saveSpecialDates(nextSpecialDates);
      toast.success('Data especial removida.');
    } catch (error) {
      setSpecialDates(previousSpecialDates);
      toast.error('Erro ao remover data especial.');
      throw error;
    }
  };

  return {
    agendaData,
    allTasks,
    financialData,
    specialDates,
    selectedDate,
    setSelectedDate,
    addTask,
    toggleTask,
    removeTask,
    addEntry,
    addExpense,
    removeTransaction,
    clearFinancialData,
    getFinancialHistoryMonths,
    getFinancialDataForMonth,
    deleteFinancialHistoryMonth,
    addSpecialDate,
    removeSpecialDate,
  };
};
