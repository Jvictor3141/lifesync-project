import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#AE34F7] via-[#9B1CDF] to-[#7A14B0] relative overflow-hidden">
      {/* Animated glow orbs */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#AE34F7]/30 opacity-40 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-fuchsia-300 opacity-40 rounded-full blur-3xl animate-pulse"></div>

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Logo / Title */}
        <div className="flex items-end gap-2">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-lg">
            LifeSync
          </h1>
          <span className="text-xs md:text-sm text-white/90 mb-2 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
            Sua vida em perfeita harmonia.
          </span>
        </div>

        {/* Spinner + text */}
        <div className="mt-6 flex items-center gap-3 text-white/95">
          <div className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          <span className="text-sm md:text-base font-medium">Carregando seu espaço...</span>
        </div>

        {/* Tip line */}
        <p className="mt-3 text-xs md:text-sm text-white/80">
          Conectando seus dados com carinho ✨
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;

