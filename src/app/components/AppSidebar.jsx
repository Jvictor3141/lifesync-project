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
          className="fixed inset-0 z-40 bg-[#17140f]/36 backdrop-blur-[6px]"
          onClick={onClose}
        />
      )}

      <nav
        className={`sidebar-panel fixed inset-y-0 left-0 z-50 w-[min(88vw,22rem)] border-r backdrop-blur-xl
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex h-full flex-col p-5">
          <div className="mb-8 flex items-start justify-between gap-4 border-b border-border pb-5">
            <div>
              <p className="planner-kicker">Navegação</p>
              <BrandLogo className="brand-logo brand-logo-sidebar mt-4 h-12 w-auto md:h-14" />
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Escolha o espaço que você quer revisar agora.
              </p>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={onClose}
              className="rounded-2xl border-border/90 bg-background/85"
              aria-label="Fechar menu"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <ul className="space-y-3">
            {APP_SECTIONS.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;

              return (
                <li key={item.id}>
                  <Button
                    variant="ghost"
                    className={`h-auto w-full justify-start rounded-[1.4rem] border px-4 py-4 text-left transition-all ${
                      isActive
                        ? 'border-border bg-[color:var(--planner-sage-soft)] text-foreground shadow-[var(--surface-shadow-soft)]'
                        : 'border-border/60 bg-background/55 text-muted-foreground hover:border-border hover:bg-background/80'
                    }`}
                    onClick={() => handleSectionClick(item.id)}
                  >
                    <span className={`mr-3 flex size-10 shrink-0 items-center justify-center rounded-2xl ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-secondary text-[var(--planner-sage-deep)]'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </span>

                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">
                        {item.label}
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">
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
