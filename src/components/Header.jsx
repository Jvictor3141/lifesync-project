import React from 'react';
import { Menu, LogOut, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const Header = ({ onMenuToggle, currentSection, onThemeToggle, isDark, selectedDate }) => {
  const { logout } = useAuth();
  // Exibe a data selecionada no calendário; fallback para hoje
  const currentDate = selectedDate ? new Date(selectedDate) : new Date();

  const diasSemana = [
    'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 
    'Quinta-feira', 'Sexta-feira', 'Sábado'
  ];

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const dayName = diasSemana[currentDate.getDay()];
  const day = currentDate.getDate();
  const month = meses[currentDate.getMonth()];
  const year = currentDate.getFullYear();

  const getSectionTitle = () => {
    switch (currentSection) {
      case 'agenda':
        return 'Organize suas tarefas';
      case 'financas':
        return 'Controle Financeiro';
      default:
        return 'Organize suas tarefas';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-purple-100 dark:bg-gray-800 dark:border-gray-700">
      <div className="w-full pb-6">
        <div className="text-center">
          <div className="flex bg-pink-500 justify-between items-center px-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuToggle}
              className="bg-pink-400 hover:bg-pink-500 shadow-lg rounded-full p-2 w-12 h-12 transition-all duration-300"
            >
              <Menu className="w-6 h-6 text-white" />
            </Button>

            <h1 className="w-full text-white text-2xl md:text-4xl font-medium py-4 text-center truncate">
              <span className="font-bold whitespace-nowrap sofadi-one-regular text-3xl md:text-5xl leading-none">LifeSync</span>
              <span className="hidden md:inline"> - {getSectionTitle()}</span>
            </h1>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onThemeToggle}
                className="text-white hover:bg-pink-600 rounded-full p-2"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              
              <Button
                onClick={logout}
                className="bg-white text-pink-500 font-bold px-4 py-2 rounded-lg shadow hover:bg-pink-50 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          <div className="w-full text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded py-2 inline-block">
            {`${day} de ${month} de ${year}`}
          </div>
          <div className="text-2xl font-medium text-pink-500 mt-1">
            {dayName}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

