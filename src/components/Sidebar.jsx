import React from 'react';
import { X, Calendar, DollarSign, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Sidebar = ({ isOpen, onClose, currentSection, onSectionChange }) => {
  const menuItems = [
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'financas', label: 'Finanças', icon: DollarSign },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  const handleSectionClick = (sectionId) => {
    onSectionChange(sectionId);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <nav className={`
        fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 border-r border-[#AE34F7]/20
        dark:bg-gray-800 dark:border-gray-700
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-0">
          <div className="flex items-center justify-between mb-8 bg-[#9B1CDF] px-4 py-6">
            <h2 className="text-xl font-medium text-white">Menu</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-[#7A14B0] rounded-full p-2"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
          
          <ul className="space-y-4 px-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <Button
                    variant="ghost"
                    className={`
                      w-full flex items-center justify-start p-3 rounded-lg transition-colors
                      hover:bg-[#AE34F7]/10 dark:hover:bg-gray-700
                      ${currentSection === item.id ? 'bg-[#AE34F7]/10 dark:bg-gray-700' : ''}
                    `}
                    onClick={() => handleSectionClick(item.id)}
                  >
                    <Icon className="w-5 h-5 mr-3 text-[#AE34F7]" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {item.label}
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

export default Sidebar;

