import { Calendar, DollarSign, Settings } from 'lucide-react';

export const APP_SECTIONS = [
  {
    id: 'agenda',
    label: 'Agenda',
    subtitle: 'Organize suas tarefas e eventos',
    icon: Calendar,
  },
  {
    id: 'financas',
    label: 'Finanças',
    subtitle: 'Acompanhe entradas, gastos e saldo',
    icon: DollarSign,
  },
  {
    id: 'configuracoes',
    label: 'Configurações',
    subtitle: 'Ajuste sua conta e preferências',
    icon: Settings,
  },
];

export const getSectionMeta = (sectionId) => (
  APP_SECTIONS.find((section) => section.id === sectionId) ?? APP_SECTIONS[0]
);
