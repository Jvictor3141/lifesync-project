import React from 'react';
import BackgroundDecor from '@/shared/components/BackgroundDecor';

const LoadingScreen = () => {
  return (
    <div className="background min-h-screen overflow-hidden">
      <BackgroundDecor />

      <div className="relative flex min-h-screen items-center justify-center p-6">
        <div className="card-fundo noise-overlay relative w-full max-w-xl rounded-[2rem] p-10 text-center">
          <p className="planner-kicker">Preparando seu planner</p>

          <h1 className="mt-6 text-4xl font-semibold text-foreground md:text-5xl">
            LifeSync
          </h1>

          <p className="mt-4 text-base leading-7 text-muted-foreground md:text-lg">
            Sincronizando agenda, rotina e finanças para abrir seu espaço com clareza.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3 text-muted-foreground">
            <div className="h-6 w-6 rounded-full border-2 border-[var(--planner-sage-soft)] border-t-[var(--planner-sage)] animate-spin" />
            <span className="text-sm font-medium md:text-base">Carregando seu espaço...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
