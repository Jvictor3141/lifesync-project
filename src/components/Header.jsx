import React from 'react';
import { Menu, LogOut, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import logo from '@/assets/logo-lifesync.png';

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
    <header className="bg-white shadow-sm border-b border-[#AE34F7]/20 dark:bg-gray-800 dark:border-gray-700">
      <div className="w-full pb-6">
        <div className="text-center">
          <div className="flex bg-[#9B1CDF] justify-between items-center px-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuToggle}
              className="bg-[#AE34F7] hover:bg-[#9B1CDF] shadow-lg rounded-full p-2 w-12 h-12 transition-all duration-300"
            >
              <Menu className="w-6 h-6 text-white" />
            </Button>

            <div className="flex items-center flex-1 justify-center gap-2 md:gap-4 px-2 md:px-0">
              <img src={logo} alt="LifeSync Logo" className="px-1 h-10 md:h-14" />
              <h1 className="w-50% text-white text-2xl md:text-4xl font-medium py-4 text-center truncate">
                <span className="hidden md:inline"> - {getSectionTitle()}</span>
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onThemeToggle}
                className="text-white hover:bg-[#7A14B0] rounded-full p-2"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              
              <Button
                onClick={logout}
                className="bg-white text-[#AE34F7] font-bold px-4 py-2 rounded-lg shadow hover:bg-[#AE34F7]/10 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          <div className="w-full text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded py-2 inline-block">
            {`${day} de ${month} de ${year}`}
          </div>
          <div className="text-2xl font-medium text-[#AE34F7] mt-1">
            {dayName}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

