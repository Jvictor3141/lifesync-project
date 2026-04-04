import React, { useState } from 'react';
import AppHeader from '@/app/components/AppHeader';
import AppSidebar from '@/app/components/AppSidebar';
import BackgroundDecor from '@/shared/components/BackgroundDecor';

const AppShell = ({
  children,
  currentSection,
  isDark,
  onLogout,
  onSectionChange,
  onThemeToggle,
  selectedDate,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`background h-screen overflow-hidden ${isDark ? 'dark' : ''}`}>
      <BackgroundDecor />

      <div className="relative flex h-screen flex-col overflow-hidden">
        <AppHeader
          currentSection={currentSection}
          isDark={isDark}
          onLogout={onLogout}
          onMenuToggle={() => setSidebarOpen(true)}
          onThemeToggle={onThemeToggle}
          selectedDate={selectedDate}
        />

        <AppSidebar
          currentSection={currentSection}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onSectionChange={onSectionChange}
        />

        <div className="planner-scroll flex-1 overflow-y-auto overflow-x-hidden">
          <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-10 pt-6 md:px-6 md:pb-14">
            {children}
          </main>

          <footer className="shell-footer px-4 py-5 text-center text-sm text-muted-foreground backdrop-blur-xl">
            LifeSync · {new Date().getFullYear()} · planejamento, rotina e finanças em um só espaço.
          </footer>
        </div>
      </div>
    </div>
  );
};

export default AppShell;
