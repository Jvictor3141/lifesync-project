import { useState, useEffect, useCallback } from 'react';
import { doc, setDoc, getDoc, onSnapshot, collection, getDocs } from 'firebase/firestore';
import { toast } from 'sonner';
import { db } from '@/lib/firebase';

export const useFirebaseData = () => {
  // Função para gerar instâncias recorrentes de tarefas para uma data
  const getRecurringTasksForDate = useCallback((tasks, dateStr) => {
    const date = new Date(dateStr);
    return tasks.filter(task => {
      if (!task.frequencia || task.frequencia === '') {
        // Tarefa única, só aparece se criada na data
        return new Date(task.createdAt).toDateString() === date.toDateString();
      }
      const created = new Date(task.createdAt);
      if (created > date) return false;
      if (task.frequencia === 'diario') return true;
      if (task.frequencia === 'semanal') return created.getDay() === date.getDay();
      if (task.frequencia === 'mensal') return created.getDate() === date.getDate();
      return false;
    });
  }, []);
  const [agendaData, setAgendaData] = useState({
    larissa: { manha: [], tarde: [], noite: [] },
    joaovictor: { manha: [], tarde: [], noite: [] }
  });
  
  const [allTasks, setAllTasks] = useState({
    larissa: { manha: [], tarde: [], noite: [] },
    joaovictor: { manha: [], tarde: [], noite: [] }
  });
  
  const [financialData, setFinancialData] = useState({
    entradas: [],
    gastos: []
  });
  
  const [specialDates, setSpecialDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toDateString());

  // Gerar ID único
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // Salvar tarefas no Firebase
    const saveTasksToFirebase = async (date = selectedDate, dataParam) => {
      const dataToSave = dataParam || agendaData;
    try {
        await setDoc(doc(db, "agendas", date), {
          larissa: dataToSave.larissa,
          joaovictor: dataToSave.joaovictor,
          updatedAt: new Date()
        });
        toast.success('Tarefa salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar tarefas:', error);
      toast.error('Erro ao salvar tarefa');
      throw error;
    }
  };

  // Função para filtrar tarefas por data selecionada
  const filterTasksByDate = useCallback((allTasksData, dateStr) => {
    const filtered = {
      larissa: { manha: [], tarde: [], noite: [] },
      joaovictor: { manha: [], tarde: [], noite: [] }
    };
    
    ['larissa', 'joaovictor'].forEach(user => {
      ['manha', 'tarde', 'noite'].forEach(period => {
        filtered[user][period] = getRecurringTasksForDate(allTasksData[user][period] || [], dateStr);
      });
    });
    
    return filtered;
  }, [getRecurringTasksForDate]);

  // Carregar tarefas do Firebase
  const loadTasksFromFirebase = async (date = selectedDate) => {
    // Filtrar as tarefas já carregadas para a data específica
    const filteredTasks = filterTasksByDate(allTasks, date);
    setAgendaData(filteredTasks);
  };

  // Salvar dados financeiros no Firebase
  const saveFinancialDataToFirebase = async () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    try {
      await setDoc(doc(db, "financas", currentMonth), financialData);
    } catch (error) {
      console.error('Erro ao salvar finanças:', error);
      throw error;
    }
  };

  // Carregar dados financeiros do Firebase
  const loadFinancialDataFromFirebase = async () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    try {
      const docSnap = await getDoc(doc(db, "financas", currentMonth));
      if (docSnap.exists()) {
        setFinancialData(docSnap.data());
      } else {
        setFinancialData({ entradas: [], gastos: [] });
      }
    } catch (error) {
      console.error('Erro ao carregar finanças:', error);
    }
  };

  // Salvar datas especiais no Firebase
  const saveSpecialDateToFirebase = async (specialDate) => {
    try {
      const docRef = doc(db, "datasEspeciais", "lista");
      const docSnap = await getDoc(docRef);
      let lista = [];
      if (docSnap.exists()) {
        lista = docSnap.data().datas || [];
      }
      lista.push(specialDate);
      await setDoc(docRef, { datas: lista });
      setSpecialDates(lista);
    } catch (error) {
      console.error('Erro ao salvar data especial:', error);
      throw error;
    }
  };

  // Carregar datas especiais do Firebase
  const loadSpecialDatesFromFirebase = async () => {
    try {
      const docRef = doc(db, "datasEspeciais", "lista");
      const docSnap = await getDoc(docRef);
      let lista = [];
      if (docSnap.exists()) {
        lista = docSnap.data().datas || [];
      }
      setSpecialDates(lista);
    } catch (error) {
      console.error('Erro ao carregar datas especiais:', error);
    }
  };

  // Adicionar tarefa
  const addTask = async (user, period, task) => {
    const newTask = {
      ...task,
      id: generateId(),
      createdAt: new Date().toISOString()
    };

    setAgendaData(prev => {
      const updated = {
        ...prev,
        [user]: {
          ...prev[user],
          [period]: [...prev[user][period], newTask]
        }
      };
      saveTasksToFirebase(selectedDate, updated);
      return updated;
    });
  };

  // Alternar status da tarefa
  const toggleTask = async (user, period, taskId) => {
    setAgendaData(prev => {
      const updated = {
        ...prev,
        [user]: {
          ...prev[user],
          [period]: prev[user][period].map(task => 
            task.id === taskId 
              ? { ...task, completed: !task.completed }
              : task
          )
        }
      };
      saveTasksToFirebase(selectedDate, updated);
      return updated;
    });
  };

  // Remover tarefa
  const removeTask = async (user, period, taskId) => {
    setAgendaData(prev => {
      const updated = {
        ...prev,
        [user]: {
          ...prev[user],
          manha: prev[user].manha.filter(task => task.id !== taskId),
          tarde: prev[user].tarde.filter(task => task.id !== taskId),
          noite: prev[user].noite.filter(task => task.id !== taskId)
        }
      };
      saveTasksToFirebase(selectedDate, updated);
      return updated;
    });
  };

  // Adicionar entrada financeira
  const addEntry = async (entryData) => {
    const newEntry = {
      ...entryData,
      id: generateId(),
      tipo: 'entrada',
      data: new Date().toISOString()
    };

    setFinancialData(prev => ({
      ...prev,
      entradas: [...prev.entradas, newEntry]
    }));

    await saveFinancialDataToFirebase();
  };

  // Adicionar gasto
  const addExpense = async (expenseData) => {
    const newExpense = {
      ...expenseData,
      id: generateId(),
      tipo: 'gasto',
      data: new Date().toISOString()
    };

    setFinancialData(prev => ({
      ...prev,
      gastos: [...prev.gastos, newExpense]
    }));

    await saveFinancialDataToFirebase();
  };

  // Remover transação
  const removeTransaction = async (type, id) => {
    if (window.confirm('Tem certeza que deseja remover esta transação?')) {
      if (type === 'entrada') {
        setFinancialData(prev => ({
          ...prev,
          entradas: prev.entradas.filter(item => item.id !== id)
        }));
      } else {
        setFinancialData(prev => ({
          ...prev,
          gastos: prev.gastos.filter(item => item.id !== id)
        }));
      }
      await saveFinancialDataToFirebase();
    }
  };

  // Limpar dados financeiros do mês
  const clearFinancialData = async () => {
    if (window.confirm('Tem certeza que deseja limpar todos os dados financeiros do mês atual?')) {
      setFinancialData({ entradas: [], gastos: [] });
      await saveFinancialDataToFirebase();
    }
  };

  // Listeners em tempo real
  useEffect(() => {
    // Listener para toda a coleção agendas
    const unsubscribeAgenda = onSnapshot(
      collection(db, "agendas"),
      (snapshot) => {
        let allLarissa = { manha: [], tarde: [], noite: [] };
        let allJoaoVictor = { manha: [], tarde: [], noite: [] };
        
        // Coletar todas as tarefas únicas por ID
        const taskIds = new Set();
        
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          ['manha', 'tarde', 'noite'].forEach(period => {
            if (data.larissa?.[period]) {
              data.larissa[period].forEach(task => {
                if (!taskIds.has(task.id)) {
                  taskIds.add(task.id);
                  allLarissa[period].push(task);
                }
              });
            }
            if (data.joaovictor?.[period]) {
              data.joaovictor[period].forEach(task => {
                if (!taskIds.has(task.id)) {
                  taskIds.add(task.id);
                  allJoaoVictor[period].push(task);
                }
              });
            }
          });
        });
        
        // Armazenar todas as tarefas
        const allTasksData = { larissa: allLarissa, joaovictor: allJoaoVictor };
        setAllTasks(allTasksData);
        
        // Filtrar para o dia selecionado
        const filteredTasks = filterTasksByDate(allTasksData, selectedDate);
        setAgendaData(filteredTasks);
        
        toast.success('Dados carregados da nuvem!', {
          duration: 2000
        });
      },
      (error) => {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados da nuvem');
      }
    );

    // Listener para finanças
    const currentMonth = new Date().toISOString().slice(0, 7);
    const unsubscribeFinance = onSnapshot(
      doc(db, "financas", currentMonth),
      (docSnap) => {
        if (docSnap.exists()) {
          setFinancialData(docSnap.data());
        } else {
          setFinancialData({ entradas: [], gastos: [] });
        }
      }
    );

    // Listener para datas especiais
    const unsubscribeSpecialDates = onSnapshot(
      doc(db, "datasEspeciais", "lista"),
      (docSnap) => {
        let lista = [];
        if (docSnap.exists()) {
          lista = docSnap.data().datas || [];
        }
        setSpecialDates(lista);
      }
    );

    return () => {
      unsubscribeAgenda();
      unsubscribeFinance();
      unsubscribeSpecialDates();
    };
  }, [selectedDate, filterTasksByDate]);

  // Reagir a mudanças na data selecionada
  useEffect(() => {
    if (Object.keys(allTasks.larissa).length > 0 || Object.keys(allTasks.joaovictor).length > 0) {
      const filteredTasks = filterTasksByDate(allTasks, selectedDate);
      setAgendaData(filteredTasks);
    }
  }, [selectedDate, allTasks, filterTasksByDate]);

  // Carregar dados iniciais
  useEffect(() => {
    // Buscar todos os documentos da coleção agendas
    const fetchAllTasks = async () => {
      try {
        const colRef = collection(db, "agendas");
        const snapshot = await getDocs(colRef);
        let allLarissa = { manha: [], tarde: [], noite: [] };
        let allJoaoVictor = { manha: [], tarde: [], noite: [] };
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          ['manha', 'tarde', 'noite'].forEach(period => {
            if (data.larissa?.[period]) {
              allLarissa[period] = allLarissa[period].concat(data.larissa[period]);
            }
            if (data.joaovictor?.[period]) {
              allJoaoVictor[period] = allJoaoVictor[period].concat(data.joaovictor[period]);
            }
          });
        });
        setAgendaData({ larissa: allLarissa, joaovictor: allJoaoVictor });
      } catch (error) {
        console.error('Erro ao buscar todas as tarefas:', error);
      }
    };
    fetchAllTasks();
    loadFinancialDataFromFirebase();
    loadSpecialDatesFromFirebase();
  }, []);

  return {
    agendaData,
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
    saveSpecialDateToFirebase,
    loadTasksFromFirebase
  };
};

