import { useState, useEffect, useCallback } from 'react';
import { doc, setDoc, getDoc, onSnapshot, collection, getDocs } from 'firebase/firestore';
import { toast } from 'sonner';
import { db } from '@/lib/firebase';

export const useFirebaseData = (uid) => {
  // Helper para obter a chave da data de uma tarefa (compatível com dados antigos)
  const getTaskDateKey = useCallback((task) => {
    if (task.dateKey) return task.dateKey;
    if (task.createdAt) return new Date(task.createdAt).toDateString();
    return new Date().toDateString();
  }, []);

  // Filtra tarefas considerando recorrência e data selecionada
  const getRecurringTasksForDate = useCallback((tasks, dateStr) => {
    const date = new Date(dateStr);
    return tasks.filter(task => {
      // Tarefa sem recorrência: usa dateKey (ou createdAt como fallback)
      if (!task.frequencia || task.frequencia === '') {
        return getTaskDateKey(task) === dateStr;
      }
      // Recorrentes: comparam a partir de createdAt
      const created = new Date(task.createdAt || dateStr);
      if (created > date) return false;
      if (task.frequencia === 'diario') return true;
      if (task.frequencia === 'semanal') return created.getDay() === date.getDay();
      if (task.frequencia === 'mensal') return created.getDate() === date.getDate();
      return false;
    });
  }, [getTaskDateKey]);

  const [agendaData, setAgendaData] = useState({ manha: [], tarde: [], noite: [] });
  const [allTasks, setAllTasks] = useState({ manha: [], tarde: [], noite: [] });
  const [financialData, setFinancialData] = useState({ entradas: [], gastos: [] });
  const [specialDates, setSpecialDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toDateString());

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

  // Chave de deduplicação estável por conteúdo (evita duplicar tarefas idênticas)
  const taskDedupeKey = useCallback((t, period) => {
    return [
      period,
      (t.text || '').trim().toLowerCase(),
      t.hora || '',
      t.frequencia || '',
      getTaskDateKey(t)
    ].join('|');
  }, [getTaskDateKey]);

  // Monta o payload de um dia (doc agendas/<dateKey>) a partir do conjunto total de tarefas
  const buildDayDataFromAll = useCallback((all, dateKey) => {
    const only = (arr) => (arr || []).filter(t => getTaskDateKey(t) === dateKey);
    return {
      manha: only(all.manha),
      tarde: only(all.tarde),
      noite: only(all.noite),
      updatedAt: new Date()
    };
  }, [getTaskDateKey]);

  // Removido: saveTasksToFirebase — a persistência agora sempre filtra por dia usando buildDayDataFromAll

  const filterTasksByDate = useCallback((allTasksData, dateStr) => ({
    manha: getRecurringTasksForDate(allTasksData.manha || [], dateStr),
    tarde: getRecurringTasksForDate(allTasksData.tarde || [], dateStr),
    noite: getRecurringTasksForDate(allTasksData.noite || [], dateStr)
  }), [getRecurringTasksForDate]);

  const loadTasksFromFirebase = async (date = selectedDate) => {
    const filteredTasks = filterTasksByDate(allTasks, date);
    setAgendaData(filteredTasks);
  };

  const addTask = async (period, task) => {
    // Vincula a tarefa ao dia selecionado
    const newTask = {
      ...task,
      id: generateId(),
      dateKey: selectedDate,
      // Mantemos createdAt coerente com o dia selecionado para compatibilidade
      createdAt: new Date(selectedDate).toISOString()
    };
    setAllTasks(prev => {
      const nextAll = { ...prev, [period]: [...prev[period], newTask] };
      // Persiste somente as tarefas que pertencem ao dia selecionado
      const dayPayload = buildDayDataFromAll(nextAll, selectedDate);
      if (uid) setDoc(doc(db, 'users', uid, 'agendas', selectedDate), dayPayload).catch(console.error);
      // Atualiza visão filtrada
      setAgendaData(filterTasksByDate(nextAll, selectedDate));
      return nextAll;
    });
  };

  const toggleTask = async (_period, taskId) => {
    // Descobre em qual data a tarefa está salva
    let taskDateKey = null;
    setAllTasks(prev => {
      // Busca a tarefa no snapshot anterior
      const found = [...prev.manha, ...prev.tarde, ...prev.noite].find(t => t.id === taskId);
      taskDateKey = found ? getTaskDateKey(found) : selectedDate;
      // Atualiza todas as listas (robusto contra mudança de período)
      const next = {
        manha: prev.manha.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t),
        tarde: prev.tarde.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t),
        noite: prev.noite.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t),
      };
      // Persiste somente o dia afetado
      const dayPayload = buildDayDataFromAll(next, taskDateKey);
      if (uid) setDoc(doc(db, 'users', uid, 'agendas', taskDateKey), dayPayload).catch(console.error);
      return next;
    });

    // Atualiza visão filtrada da tela
    setAgendaData(prev => ({
      manha: prev.manha.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t),
      tarde: prev.tarde.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t),
      noite: prev.noite.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t),
    }));
  };

  const removeTask = async (_period, taskId) => {
    // Descobre a data onde a tarefa está salva
    let taskDateKey = null;
    setAllTasks(prev => {
      const found = [...prev.manha, ...prev.tarde, ...prev.noite].find(t => t.id === taskId);
      taskDateKey = found ? getTaskDateKey(found) : selectedDate;
      const next = {
        manha: prev.manha.filter(t => t.id !== taskId),
        tarde: prev.tarde.filter(t => t.id !== taskId),
        noite: prev.noite.filter(t => t.id !== taskId),
      };
      const dayPayload = buildDayDataFromAll(next, taskDateKey);
      if (uid) setDoc(doc(db, 'users', uid, 'agendas', taskDateKey), dayPayload).then(() => {
        toast.success('Tarefa removida');
      }).catch((err) => {
        console.error('Erro ao remover tarefa:', err);
        toast.error('Erro ao remover tarefa');
      });
      return next;
    });

    setAgendaData(prev => ({
      manha: prev.manha.filter(t => t.id !== taskId),
      tarde: prev.tarde.filter(t => t.id !== taskId),
      noite: prev.noite.filter(t => t.id !== taskId),
    }));
  };

  const addEntry = async (entryData) => {
    const newEntry = { ...entryData, id: generateId(), tipo: 'entrada', data: new Date().toISOString() };
    setFinancialData(prev => {
      const next = { ...prev, entradas: [...(prev.entradas || []), newEntry] };
      // Persist using the next snapshot to avoid stale writes
      saveFinancialDataToFirebase(next).catch(console.error);
      return next;
    });
  };

  const addExpense = async (expenseData) => {
    const newExpense = { ...expenseData, id: generateId(), tipo: 'gasto', data: new Date().toISOString() };
    setFinancialData(prev => {
      const next = { ...prev, gastos: [...(prev.gastos || []), newExpense] };
      saveFinancialDataToFirebase(next).catch(console.error);
      return next;
    });
  };

  const removeTransaction = async (id, type) => {
    setFinancialData(prev => {
      const next = {
        ...prev,
        entradas: type === 'entrada' ? (prev.entradas || []).filter(i => i.id !== id) : (prev.entradas || []),
        gastos: type === 'gasto' ? (prev.gastos || []).filter(i => i.id !== id) : (prev.gastos || [])
      };
      saveFinancialDataToFirebase(next).catch(console.error);
      return next;
    });
  };

  const saveFinancialDataToFirebase = async (data) => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    try {
      const payload = data ?? financialData;
      if (uid) await setDoc(doc(db, 'users', uid, 'financas', currentMonth), payload);
    } catch (error) {
      console.error('Erro ao salvar finanças:', error);
      throw error;
    }
  };

  const loadFinancialDataFromFirebase = useCallback(async () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    try {
      const snap = uid ? await getDoc(doc(db, 'users', uid, 'financas', currentMonth)) : null;
      setFinancialData(snap.exists() ? snap.data() : { entradas: [], gastos: [] });
    } catch (error) {
      console.error('Erro ao carregar finanças:', error);
    }
  }, [uid]);

  const clearFinancialData = async () => {
    if (window.confirm('Tem certeza que deseja limpar todos os dados financeiros do mês atual?')) {
      const empty = { entradas: [], gastos: [] };
      setFinancialData(empty);
      await saveFinancialDataToFirebase(empty);
    }
  };

  const loadSpecialDatesFromFirebase = useCallback(async () => {
    try {
      const snap = uid ? await getDoc(doc(db, 'users', uid, 'datasEspeciais', 'lista')) : null;
      setSpecialDates(snap.exists() ? (snap.data().datas || []) : []);
    } catch (error) {
      console.error('Erro ao carregar datas especiais:', error);
    }
  }, [uid]);

  useEffect(() => {
    if (!uid) return; // aguarda usuário
    const unsubscribeAgenda = onSnapshot(collection(db, 'users', uid, 'agendas'), (snapshot) => {
      const all = { manha: [], tarde: [], noite: [] };
      const seen = new Set(); // por chave de conteúdo
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        const dateKey = docSnap.id;
        ['manha', 'tarde', 'noite'].forEach(p => {
          (data[p] || []).forEach(task => {
            const withKey = task.dateKey ? task : { ...task, dateKey };
            // Ignora tarefas salvas em um dia diferente do seu dateKey
            if (getTaskDateKey(withKey) !== dateKey) return;
            const k = taskDedupeKey(withKey, p);
            if (!seen.has(k)) {
              seen.add(k);
              all[p].push(withKey);
            }
          });
        });
      });
      setAllTasks(all);
      // Não filtramos aqui para evitar capturar selectedDate antigo.
      toast.success('Dados carregados da nuvem!', { duration: 2000 });
    }, (error) => {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados da nuvem');
    });

    const currentMonth = new Date().toISOString().slice(0, 7);
    const unsubscribeFinance = onSnapshot(doc(db, 'users', uid, 'financas', currentMonth), (snap) => {
      setFinancialData(snap.exists() ? snap.data() : { entradas: [], gastos: [] });
    });

    const unsubscribeSpecialDates = onSnapshot(doc(db, 'users', uid, 'datasEspeciais', 'lista'), (snap) => {
      setSpecialDates(snap.exists() ? (snap.data().datas || []) : []);
    });

    return () => {
      unsubscribeAgenda();
      unsubscribeFinance();
      unsubscribeSpecialDates();
    };
  }, [filterTasksByDate, getTaskDateKey, taskDedupeKey, uid]);

  useEffect(() => {
    setAgendaData(filterTasksByDate(allTasks, selectedDate));
  }, [selectedDate, allTasks, filterTasksByDate]);

  useEffect(() => {
    if (!uid) return; // aguarda usuário
    const fetchAll = async () => {
      try {
        const snap = await getDocs(collection(db, 'users', uid, 'agendas'));
        const all = { manha: [], tarde: [], noite: [] };
        const seen = new Set();
        snap.forEach(docSnap => {
          const data = docSnap.data();
          const dateKey = docSnap.id;
          ['manha', 'tarde', 'noite'].forEach(p => {
            (data[p] || []).forEach(task => {
              const withKey = task.dateKey ? task : { ...task, dateKey };
              if (getTaskDateKey(withKey) !== dateKey) return;
              const k = taskDedupeKey(withKey, p);
              if (!seen.has(k)) {
                seen.add(k);
                all[p].push(withKey);
              }
            });
          });
        });
        setAllTasks(all);
        // A filtragem acontece em outro efeito reagindo a allTasks+selectedDate
      } catch (error) {
        console.error('Erro ao buscar todas as tarefas:', error);
      }
    };
    fetchAll();
    loadFinancialDataFromFirebase();
    loadSpecialDatesFromFirebase();
  }, [filterTasksByDate, getTaskDateKey, taskDedupeKey, uid, loadFinancialDataFromFirebase, loadSpecialDatesFromFirebase]);

  return {
    agendaData,
    financialData,
    specialDates,
    allTasks,
    selectedDate,
    setSelectedDate,
    addTask,
    toggleTask,
    removeTask,
    addEntry,
    addExpense,
    removeTransaction,
    clearFinancialData,
    loadTasksFromFirebase
  };
};
