import React from 'react';
import { LogOut, Menu, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BrandLogo from '@/shared/components/BrandLogo';
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
    <header className="shell-bar sticky top-0 z-30">
      <div className="mx-auto max-w-7xl px-4 md:px-6">

        {/* Barra principal */}
        <div className="flex h-14 items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <BrandLogo className="brand-logo brand-logo-sidebar ml-1 h-8 w-auto" />

          <div className="flex-1" />

          {/* Data — visível em telas médias+ */}
          <div className="hidden items-center gap-2 md:flex">
            <span className="text-sm font-bold tracking-tight text-foreground">
              {capitalize(formatWeekday(currentDate))}
            </span>
            <span className="text-border text-sm select-none">·</span>
            <span className="planner-chip">
              {capitalize(formatFullDate(currentDate))}
            </span>
          </div>

          <div className="flex items-center gap-1 ml-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onThemeToggle}
              aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              aria-label="Sair"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>

        {/* Data compacta — apenas mobile */}
        <div className="flex h-9 items-center gap-2 border-t border-border md:hidden">
          <span className="text-sm font-bold text-foreground">
            {capitalize(formatWeekday(currentDate))}
          </span>
          <span className="text-muted-foreground text-sm select-none">·</span>
          <span className="text-sm text-muted-foreground" style={{ fontFamily: '"DM Mono", monospace' }}>
            {capitalize(formatFullDate(currentDate))}
          </span>
        </div>

      </div>
    </header>
  );
};

export default AppHeader;
