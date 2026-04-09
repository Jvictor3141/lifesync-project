import { Suspense, lazy, useState } from 'react';
import AppShell from '@/app/components/AppShell';
import { APP_SECTIONS } from '@/app/constants/sections';
import { useThemePreference } from '@/app/hooks/useThemePreference';
import { Toaster } from '@/components/ui/sonner';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspaceData } from '@/features/workspace/hooks/useWorkspaceData';
import LoadingScreen from '@/shared/components/LoadingScreen';
import './App.css';

const AgendaScreen = lazy(() => import('@/components/agenda/AgendaScreen'));
const LoginForm = lazy(() => import('@/components/auth/LoginForm'));
const FinanceSection = lazy(() => import('@/components/finance/FinanceSection'));
const SettingsSection = lazy(() => import('@/components/settings/SettingsSection'));

const SectionFallback = () => (
  <div className="glassmorphism rounded-[1.75rem] border p-8 text-center text-foreground">
    <p className="planner-kicker">Carregando</p>
    <div className="mt-4 text-xl font-semibold">Preparando a seção...</div>
  </div>
);

function App() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <>
        <Suspense fallback={<LoadingScreen />}>
          <LoginForm />
        </Suspense>
        <Toaster />
      </>
    );
  }

  return <AuthenticatedApp user={user} onLogout={logout} />;
}

function AuthenticatedApp({ onLogout, user }) {
  const [currentSection, setCurrentSection] = useState(APP_SECTIONS[0].id);
  const { isDark, toggleTheme } = useThemePreference();
  const {
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
  } = useWorkspaceData(user?.uid);

  const contentBySection = {
    agenda: (
      <AgendaScreen
        allTasks={allTasks}
        onAddSpecialDate={addSpecialDate}
        onAddTask={addTask}
        onDateClick={setSelectedDate}
        onRemoveSpecialDate={removeSpecialDate}
        onRemoveTask={removeTask}
        onToggleTask={toggleTask}
        selectedDate={selectedDate}
        specialDates={specialDates}
        tasks={agendaData}
      />
    ),
    financas: (
      <FinanceSection
        financialData={financialData}
        onAddEntry={addEntry}
        onAddExpense={addExpense}
        onRemoveTransaction={removeTransaction}
        onClearMonth={clearFinancialData}
        onListHistoryMonths={getFinancialHistoryMonths}
        onLoadMonthData={getFinancialDataForMonth}
        onDeleteHistoryMonth={deleteFinancialHistoryMonth}
      />
    ),
    configuracoes: <SettingsSection user={user} />,
  };

  return (
    <>
      <AppShell
        currentSection={currentSection}
        isDark={isDark}
        onLogout={onLogout}
        onSectionChange={setCurrentSection}
        onThemeToggle={toggleTheme}
        selectedDate={selectedDate}
      >
        <Suspense fallback={<SectionFallback />}>
          {contentBySection[currentSection]}
        </Suspense>
      </AppShell>
      <Toaster />
    </>
  );
}

export default App;
