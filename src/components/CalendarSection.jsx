import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CalendarSection = ({ tasks, specialDates = [], onDateClick }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  useEffect(() => {
    // Gerar eventos recorrentes apenas para o mês visível
    const events = [];
    const { year, month } = currentMonth;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    Object.entries(tasks).forEach(([user, userData]) => {
  Object.entries(userData).forEach(([, periodTasks]) => {
        periodTasks.forEach(task => {
          if (!task.hora) return;
          const created = new Date(task.createdAt);
          // Frequência única: só no dia de criação
          if (!task.frequencia || task.frequencia === '') {
            if (created.getMonth() === month && created.getFullYear() === year) {
              events.push({
                id: `task-${task.id}`,
                title: `${task.text} (${user})`,
                date: created.toISOString().slice(0, 10),
                backgroundColor: task.cor,
                borderColor: task.cor,
                textColor: '#fff'
              });
            }
            return;
          }
          // Frequência diária: todos os dias a partir da data de criação
          if (task.frequencia === 'diario') {
            for (let d = 1; d <= daysInMonth; d++) {
              const date = new Date(year, month, d);
              if (created > date) continue;
              events.push({
                id: `task-${task.id}-diario-${date.toISOString().slice(0, 10)}`,
                title: `${task.text} (${user})`,
                date: date.toISOString().slice(0, 10),
                backgroundColor: task.cor,
                borderColor: task.cor,
                textColor: '#fff'
              });
            }
            return;
          }
          // Frequência semanal: mesmo dia da semana a partir da data de criação
          if (task.frequencia === 'semanal') {
            const createdDay = created.getDay();
            for (let d = 1; d <= daysInMonth; d++) {
              const date = new Date(year, month, d);
              if (created > date) continue;
              if (date.getDay() === createdDay) {
                events.push({
                  id: `task-${task.id}-semanal-${date.toISOString().slice(0, 10)}`,
                  title: `${task.text} (${user})`,
                  date: date.toISOString().slice(0, 10),
                  backgroundColor: task.cor,
                  borderColor: task.cor,
                  textColor: '#fff'
                });
              }
            }
            return;
          }
          // Frequência mensal: mesmo dia do mês a partir da data de criação
          if (task.frequencia === 'mensal') {
            const createdDate = created.getDate();
            for (let d = 1; d <= daysInMonth; d++) {
              const date = new Date(year, month, d);
              if (created > date) continue;
              if (date.getDate() === createdDate) {
                events.push({
                  id: `task-${task.id}-mensal-${date.toISOString().slice(0, 10)}`,
                  title: `${task.text} (${user})`,
                  date: date.toISOString().slice(0, 10),
                  backgroundColor: task.cor,
                  borderColor: task.cor,
                  textColor: '#fff'
                });
              }
            }
            return;
          }
        });
      });
    });

    // Adicionar datas especiais como eventos
    specialDates.forEach(special => {
      events.push({
        id: `special-${special.nome}`,
        title: `⭐ ${special.nome}`,
        date: special.data,
        backgroundColor: '#ec4899',
        borderColor: '#ec4899',
        textColor: '#fff'
      });
    });

    setCalendarEvents(events);
  }, [tasks, specialDates, currentMonth]);

  const handleDateClick = (info) => {
    if (onDateClick) {
      onDateClick(info.dateStr);
    }
  };

  // Atualizar mês visível ao navegar no calendário
  const handleMonthChange = (arg) => {
    setCurrentMonth({ year: arg.start.getFullYear(), month: arg.start.getMonth() });
  };

  return (
    <div className="mb-6">
      <Button
        variant="ghost"
        onClick={() => setIsVisible(!isVisible)}
        className="flex items-center gap-2 text-pink-500 font-medium focus:outline-none mb-2 bg-pink-50 hover:bg-pink-100 transition-colors rounded-lg px-3 py-2"
      >
        <Calendar className="w-5 h-5" />
        <span>{isVisible ? 'Ocultar Calendário' : 'Mostrar Calendário'}</span>
        {isVisible ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </Button>

      <div className={`
        overflow-hidden transition-all duration-500
        ${isVisible ? 'max-h-full opacity-100' : 'max-h-0 opacity-0'}
      `}>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 min-w-[350px] md:min-w-[500px]">
            <Card className="bg-white dark:bg-gray-800 border-purple-100 dark:border-gray-700">
              <CardContent className="p-4">
                <FullCalendar
                  plugins={[dayGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  locale="pt-br"
                  height={500}
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: ''
                  }}
                  buttonText={{
                    today: 'Hoje'
                  }}
                  events={calendarEvents}
                  dateClick={handleDateClick}
                  eventDisplay="block"
                  dayMaxEvents={3}
                  moreLinkText="mais"
                  eventClassNames="cursor-pointer"
                  dayCellClassNames="hover:bg-pink-50 cursor-pointer transition-colors"
                  datesSet={handleMonthChange}
                />
              </CardContent>
            </Card>
          </div>

          <div className="md:w-96 w-full">
            <Card className="bg-white dark:bg-gray-800 border-purple-100 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-pink-500 flex items-center">
                  <span className="text-2xl mr-2">📅</span>
                  Datas Especiais do Mês
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-gray-700 dark:text-gray-300 text-sm space-y-2">
                  {specialDates.length === 0 ? (
                    <p className="text-gray-400">Nenhuma data especial cadastrada.</p>
                  ) : (
                    specialDates.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-pink-500"></span>
                        <span className="font-bold">{item.nome}</span>
                        <span>- {new Date(item.data).toLocaleDateString('pt-BR')}</span>
                        {item.hora && <span>às {item.hora}</span>}
                        {item.frequencia && (
                          <span className="text-xs text-gray-500">({item.frequencia})</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarSection;

