import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_SECTIONS } from '@/app/constants/sections';
import BrandLogo from '@/shared/components/BrandLogo';

const AppSidebar = ({
  currentSection,
  isOpen,
  onClose,
  onSectionChange,
}) => {
  const handleSectionClick = (sectionId) => {
    onSectionChange(sectionId);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[4px]"
          onClick={onClose}
        />
      )}

      <nav
        className={`sidebar-panel fixed inset-y-0 left-0 z-50 w-[min(86vw,21rem)] border-r
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex h-full flex-col p-5">

          {/* Cabeçalho do sidebar */}
          <div className="mb-6 flex items-center justify-between gap-4 border-b border-border pb-5">
            <div>
              <p className="planner-kicker">Navegação</p>
              <BrandLogo className="brand-logo brand-logo-sidebar mt-4 h-10 w-auto" />
              <p className="mt-2.5 text-sm leading-6 text-muted-foreground">
                Escolha o espaço que você quer revisar.
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Itens de navegação */}
          <ul className="space-y-1.5">
            {APP_SECTIONS.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;

              return (
                <li key={item.id}>
                  <Button
                    variant="ghost"
                    className={`h-auto w-full justify-start rounded-xl border px-3.5 py-3.5 text-left transition-all duration-150 ${
                      isActive
                        ? 'border-[rgba(99,102,241,0.18)] bg-[var(--planner-sage-soft)] text-foreground'
                        : 'border-transparent text-muted-foreground hover:border-border hover:bg-secondary hover:text-foreground'
                    }`}
                    onClick={() => handleSectionClick(item.id)}
                  >
                    <span className={`mr-3 flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </span>

                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">
                        {item.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {item.subtitle}
                      </span>
                    </span>
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </>
  );
};

export default AppSidebar;
