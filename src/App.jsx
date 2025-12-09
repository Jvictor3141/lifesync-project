import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFirebaseData } from '@/hooks/useFirebaseData';
import LoadingScreen from '@/components/LoadingScreen';
import LoginForm from '@/components/LoginForm';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import TaskSection from '@/components/TaskSection';
import CalendarSection from '@/components/CalendarSection';
import FinanceSection from '@/components/FinanceSection';
import SettingsSection from '@/components/SettingsSection';
import { Toaster } from '@/components/ui/sonner';
import './App.css';

function App() {
  const { user, loading } = useAuth();
  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoginForm />;
  }

  // Depois do login, montamos o app principal (isso garante que os listeners do Firestore
  // iniciem após a autenticação e os dados carreguem imediatamente)
  return <MainApp user={user} />;
}

function MainApp({ user }) {
  const {
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
  } = useFirebaseData(user?.uid);

  const [currentSection, setCurrentSection] = useState('agenda');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleAddTask = useCallback(async (period, task) => {
    try {
      await addTask(period, task);
    } catch {
      console.error('Erro ao adicionar tarefa');
    }
  }, [addTask]);

  const handleToggleTask = async (period, taskId) => {
    try {
      await toggleTask(period, taskId);
    } catch {
      alert('Erro ao atualizar tarefa!');
    }
  };

  const handleRemoveTask = async (period, taskId) => {
    try {
      await removeTask(period, taskId);
    } catch {
      alert('Erro ao remover tarefa!');
    }
  };

  const handleAddEntry = async (entryData) => {
    try {
      await addEntry(entryData);
    } catch {
      alert('Erro ao adicionar entrada!');
    }
  };

  const handleAddExpense = async (expenseData) => {
    try {
      await addExpense(expenseData);
    } catch {
      alert('Erro ao adicionar gasto!');
    }
  };

  const handleDateClick = async (dateStr) => {
    const clickedDate = new Date(dateStr + 'T00:00:00');
    setSelectedDate(clickedDate.toDateString());
    // Opcional: a filtragem já reage via efeito; manter para força de atualização imediata
    await loadTasksFromFirebase(clickedDate.toDateString());
  };

  return (
    <div className={`min-h-screen flex flex-col bg-pink-50 dark:bg-gray-900 font-sans ${isDark ? 'dark' : ''}`}>
      <Header
        onMenuToggle={() => setSidebarOpen(true)}
        currentSection={currentSection}
        onThemeToggle={toggleTheme}
        isDark={isDark}
        selectedDate={selectedDate}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
      />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        {currentSection === 'agenda' && (
          <>
            <CalendarSection
              allTasks={allTasks}
              specialDates={specialDates}
              onDateClick={handleDateClick}
              selectedDate={selectedDate}
            />

            <TaskSection
              title="Minhas Tarefas"
              tasks={agendaData}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onRemoveTask={handleRemoveTask}
            />
          </>
        )}

        {currentSection === 'financas' && (
          <FinanceSection
            financialData={financialData}
            onAddEntry={handleAddEntry}
            onAddExpense={handleAddExpense}
            onRemoveTransaction={removeTransaction}
            onClearMonth={clearFinancialData}
          />
        )}

        {currentSection === 'configuracoes' && (
          <SettingsSection user={user} />
        )}
      </main>

      <footer className="w-full mt-auto py-6 bg-pink-400 bg-opacity-80 text-center text-gray-100 text-sm">
        © 2025  LifeSync. Todos os direitos reservados.
      </footer>
      <Toaster />
    </div>
  );
}

export default App;

