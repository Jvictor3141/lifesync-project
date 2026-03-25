import React from 'react';
import { LogOut, Menu, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatFullDate, formatWeekday, safeDate } from '@/shared/lib/date';

const capitalize = (value = '') => value.charAt(0).toUpperCase() + value.slice(1);

const AppHeader = ({
  isDark,
  onLogout,
  onMenuToggle,
  onThemeToggle,
  selectedDate,
}) => {
  const currentDate = safeDate(selectedDate);

  return (
    <header className="sticky top-0 z-30 px-4 pt-4 md:px-6 md:pt-6">
      <div className="shell-bar mx-auto max-w-7xl rounded-[2rem] backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-3 px-4 py-4 md:px-6 md:py-5">
          <Button
            variant="outline"
            size="icon"
            onClick={onMenuToggle}
            className="rounded-2xl border-border/90 bg-background/85"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="min-w-0 flex-1">
            <div className="min-w-0">
              <p className="planner-kicker">Planner Studio</p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={onThemeToggle}
              className="rounded-2xl border-border/90 bg-background/85"
              aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            <Button
              onClick={onLogout}
              className="rounded-2xl px-4"
              aria-label="Sair"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>

        <div className="border-t border-border px-4 py-4 md:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Ritmo do dia
              </p>
              <div className="mt-2 text-3xl font-semibold text-[var(--planner-terracotta)] md:text-4xl">
                {capitalize(formatWeekday(currentDate))}
              </div>
            </div>

            <div className="planner-chip w-fit text-sm font-medium">
              <span className="h-2 w-2 rounded-full bg-[var(--planner-sage)]"></span>
              {capitalize(formatFullDate(currentDate))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
