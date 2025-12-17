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

  // Remove undefined fields to satisfy Firestore constraints
  const sanitizeSpecialDate = useCallback((item) => {
    const base = { id: item.id, nome: item.nome, data: item.data, frequencia: item.frequencia || '' };
    if (item.hora) base.hora = item.hora;
    return base;
  }, []);

  // Persistir lista de datas especiais (callback estável)
  const saveSpecialDatesToFirebase = useCallback(async (datas) => {
    try {
      if (uid) {
        const safe = (datas || []).map(d => sanitizeSpecialDate(d));
        await setDoc(doc(db, 'users', uid, 'datasEspeciais', 'lista'), { datas: safe });
      }
    } catch (error) {
      console.error('Erro ao salvar datas especiais:', error);
      throw error;
    }
  }, [uid, sanitizeSpecialDate]);

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
      createdAt: new Date(selectedDate).toISOString()
    };
    const nextAll = { ...allTasks, [period]: [...(allTasks[period] || []), newTask] };
    setAllTasks(nextAll);
    setAgendaData(filterTasksByDate(nextAll, selectedDate));
    try {
      if (uid) {
        const dayPayload = buildDayDataFromAll(nextAll, selectedDate);
        await setDoc(doc(db, 'users', uid, 'agendas', selectedDate), dayPayload);
        toast.success('Tarefa adicionada');
      }
    } catch (err) {
      console.error('Erro ao salvar tarefa adicionada:', err);
      toast.error('Erro ao adicionar tarefa');
    }
  };

  const toggleTask = async (_period, taskId) => {
    // Descobre em qual data a tarefa está salva usando snapshot atual
    const found = [...(allTasks.manha || []), ...(allTasks.tarde || []), ...(allTasks.noite || [])]
      .find(t => t.id === taskId);
    const taskDateKey = found ? getTaskDateKey(found) : selectedDate;
    const next = {
      manha: (allTasks.manha || []).map(t => t.id === taskId ? { ...t, completed: !t.completed } : t),
      tarde: (allTasks.tarde || []).map(t => t.id === taskId ? { ...t, completed: !t.completed } : t),
      noite: (allTasks.noite || []).map(t => t.id === taskId ? { ...t, completed: !t.completed } : t),
    };
    setAllTasks(next);
    setAgendaData(filterTasksByDate(next, selectedDate));
    try {
      if (uid) {
        const dayPayload = buildDayDataFromAll(next, taskDateKey);
        await setDoc(doc(db, 'users', uid, 'agendas', taskDateKey), dayPayload);
      }
    } catch (err) {
      console.error('Erro ao salvar tarefa alternada:', err);
    }
  };

  const removeTask = async (_period, taskId) => {
    // Descobre a data onde a tarefa está salva usando snapshot atual
    const found = [...(allTasks.manha || []), ...(allTasks.tarde || []), ...(allTasks.noite || [])]
      .find(t => t.id === taskId);
    const taskDateKey = found ? getTaskDateKey(found) : selectedDate;
    const next = {
      manha: (allTasks.manha || []).filter(t => t.id !== taskId),
      tarde: (allTasks.tarde || []).filter(t => t.id !== taskId),
      noite: (allTasks.noite || []).filter(t => t.id !== taskId),
    };
    setAllTasks(next);
    setAgendaData(filterTasksByDate(next, selectedDate));
    try {
      if (uid) {
        const dayPayload = buildDayDataFromAll(next, taskDateKey);
        await setDoc(doc(db, 'users', uid, 'agendas', taskDateKey), dayPayload);
        toast.success('Tarefa removida');
      }
    } catch (err) {
      console.error('Erro ao remover tarefa:', err);
      toast.error('Erro ao remover tarefa');
    }
  };

  const addEntry = async (entryData) => {
    const newEntry = { ...entryData, id: generateId(), tipo: 'entrada', data: new Date().toISOString() };
    const next = { ...financialData, entradas: [...(financialData.entradas || []), newEntry] };
    setFinancialData(next);
    try {
      await saveFinancialDataToFirebase(next);
      toast.success('Entrada adicionada');
    } catch (error) {
      console.error('Erro ao adicionar entrada:', error);
      toast.error('Erro ao adicionar entrada');
    }
  };

  const addExpense = async (expenseData) => {
    const newExpense = { ...expenseData, id: generateId(), tipo: 'gasto', data: new Date().toISOString() };
    const next = { ...financialData, gastos: [...(financialData.gastos || []), newExpense] };
    setFinancialData(next);
    try {
      await saveFinancialDataToFirebase(next);
      toast.success('Gasto adicionado');
    } catch (error) {
      console.error('Erro ao adicionar gasto:', error);
      toast.error('Erro ao adicionar gasto');
    }
  };

  const removeTransaction = async (id, type) => {
    const next = {
      ...financialData,
      entradas: type === 'entrada' ? (financialData.entradas || []).filter(i => i.id !== id) : (financialData.entradas || []),
      gastos: type === 'gasto' ? (financialData.gastos || []).filter(i => i.id !== id) : (financialData.gastos || [])
    };
    setFinancialData(next);
    try {
      await saveFinancialDataToFirebase(next);
      toast.success('Transação removida');
    } catch (error) {
      console.error('Erro ao remover transação:', error);
      toast.error('Erro ao remover transação');
    }
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
      try {
        await saveFinancialDataToFirebase(empty);
        toast.success('Dados financeiros do mês limpos');
      } catch (error) {
        console.error('Erro ao limpar finanças:', error);
        toast.error('Erro ao limpar dados financeiros');
      }
    }
  };

  const loadSpecialDatesFromFirebase = useCallback(async () => {
    try {
      const snap = uid ? await getDoc(doc(db, 'users', uid, 'datasEspeciais', 'lista')) : null;
      const raw = snap && snap.exists() ? (snap.data().datas || []) : [];
      // Auto-prune one-time specials that already passed
      const todayIso = new Date();
      const y = todayIso.getFullYear();
      const m = String(todayIso.getMonth() + 1).padStart(2, '0');
      const d = String(todayIso.getDate()).padStart(2, '0');
      const todayKey = `${y}-${m}-${d}`;
      const filtered = raw.filter(s => !(s.frequencia === '' && s.data < todayKey));
      setSpecialDates(filtered);
      if (filtered.length !== raw.length) {
        await saveSpecialDatesToFirebase(filtered);
      }
    } catch (error) {
      console.error('Erro ao carregar datas especiais:', error);
    }
  }, [uid, saveSpecialDatesToFirebase]);

  // (definição movida para cima para evitar ReferenceError)

  const addSpecialDate = async (item) => {
    const newItem = sanitizeSpecialDate({ ...item, id: generateId() });
    setSpecialDates(prev => {
      const next = [...prev, newItem];
      saveSpecialDatesToFirebase(next).then(() => {
        toast.success('Data especial adicionada');
      }).catch((err) => {
        console.error('Erro ao adicionar data especial:', err);
        toast.error('Erro ao adicionar data especial');
      });
      return next;
    });
  };

  const removeSpecialDate = async (id) => {
    setSpecialDates(prev => {
      const next = prev.filter(d => d.id !== id);
      saveSpecialDatesToFirebase(next).then(() => {
        toast.success('Data especial removida');
      }).catch((err) => {
        console.error('Erro ao remover data especial:', err);
        toast.error('Erro ao remover data especial');
      });
      return next;
    });
  };

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
      // Evita toast de sucesso repetitivo em cada atualização de snapshot
    }, (error) => {
      console.error('Erro ao carregar dados:', error);
      // Mostra erro apenas uma vez por ciclo; evitar duplicações frequentes
      toast.error('Erro ao carregar dados da nuvem');
    });

    const currentMonth = new Date().toISOString().slice(0, 7);
    const unsubscribeFinance = onSnapshot(doc(db, 'users', uid, 'financas', currentMonth), (snap) => {
      setFinancialData(snap.exists() ? snap.data() : { entradas: [], gastos: [] });
    });

    const unsubscribeSpecialDates = onSnapshot(doc(db, 'users', uid, 'datasEspeciais', 'lista'), async (snap) => {
      const raw = snap.exists() ? (snap.data().datas || []) : [];
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const d = String(today.getDate()).padStart(2, '0');
      const todayKey = `${y}-${m}-${d}`;
      const filtered = raw.filter(s => !(s.frequencia === '' && s.data < todayKey));
      setSpecialDates(filtered);
      if (filtered.length !== raw.length) {
        try {
          await saveSpecialDatesToFirebase(filtered);
        } catch (e) {
          console.error('Erro ao atualizar lista de datas especiais:', e);
        }
      }
    });

    return () => {
      unsubscribeAgenda();
      unsubscribeFinance();
      unsubscribeSpecialDates();
    };
  }, [filterTasksByDate, getTaskDateKey, taskDedupeKey, uid, saveSpecialDatesToFirebase]);

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
    loadTasksFromFirebase,
    addSpecialDate,
    removeSpecialDate
  };
};
