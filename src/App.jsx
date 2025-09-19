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
import { Toaster } from '@/components/ui/sonner';
import './App.css';

function App() {
  const { user, loading } = useAuth();
  const {
    agendaData,
    financialData,
    specialDates,
    setSelectedDate,
    addTask,
    toggleTask,
    removeTask,
    addEntry,
    addExpense,
    removeTransaction,
    clearFinancialData,
    loadTasksFromFirebase
  } = useFirebaseData();

  const [currentSection, setCurrentSection] = useState('agenda');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Carregar tema do localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Alternar tema
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

  // Handlers para tarefas
    const handleAddTask = useCallback(async (period, task) => {
    try {
      await addTask(period, task);
    } catch {
      console.error('Erro ao adicionar tarefa');
    }
  }, [addTask]);

  const handleToggleTask = async (user, period, taskId) => {
    try {
      await toggleTask(user, period, taskId);
    } catch {
      alert('Erro ao atualizar tarefa!');
    }
  };

  const handleRemoveTask = async (user, period, taskId) => {
    if (window.confirm('Tem certeza que deseja remover esta tarefa?')) {
      try {
        await removeTask(user, period, taskId);
      } catch {
        alert('Erro ao remover tarefa!');
      }
    }
  };

  // Handlers para finanças
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

  // Handler para mudança de data no calendário
  const handleDateClick = async (dateStr) => {
    const clickedDate = new Date(dateStr + 'T00:00:00');
    setSelectedDate(clickedDate.toDateString());
    await loadTasksFromFirebase(clickedDate.toDateString());
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className={`min-h-screen bg-pink-50 dark:bg-gray-900 font-sans ${isDark ? 'dark' : ''}`}>
      <Header
        onMenuToggle={() => setSidebarOpen(true)}
        currentSection={currentSection}
        onThemeToggle={toggleTheme}
        isDark={isDark}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
      />

      <main className="max-w-6xl mx-auto px-4 py-8 w-full">
        {currentSection === 'agenda' && (
          <>
            <CalendarSection
              tasks={agendaData}
              specialDates={specialDates}
              onDateClick={handleDateClick}
            />

            <TaskSection
              title="Dia de Larissa"
              tasks={agendaData.larissa}
              onAddTask={(period, task) => handleAddTask('larissa', period, task)}
              onToggleTask={(period, taskId) => handleToggleTask('larissa', period, taskId)}
              onRemoveTask={(period, taskId) => handleRemoveTask('larissa', period, taskId)}
              userType="larissa"
            />

            <hr className="my-8 border-t border-gray-300 dark:border-gray-600 opacity-40" />

            <TaskSection
              title="Dia de João Victor"
              tasks={agendaData.joaovictor}
              onAddTask={(period, task) => handleAddTask('joaovictor', period, task)}
              onToggleTask={(period, taskId) => handleToggleTask('joaovictor', period, taskId)}
              onRemoveTask={(period, taskId) => handleRemoveTask('joaovictor', period, taskId)}
              userType="joaovictor"
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
      </main>

      <footer className="w-full mt-12 py-6 bg-pink-400 bg-opacity-80 text-center text-gray-100 text-sm">
        © 2025 Nossa Vidinha Juntos. Todos os direitos reservados.
      </footer>
      <Toaster />
    </div>
  );
}

export default App;

