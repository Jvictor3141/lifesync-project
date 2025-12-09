import React, { useState, useEffect, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Helper for recurrence filtering for a specific date
const occursOnDate = (task, date) => {
  // Non recurring uses dateKey (fall back to createdAt)
  const dateStr = date.toDateString();
  if (!task.frequencia || task.frequencia === '') {
    const key = task.dateKey ? task.dateKey : (task.createdAt ? new Date(task.createdAt).toDateString() : dateStr);
    return key === dateStr;
  }
  const created = new Date(task.createdAt || dateStr);
  if (created > date) return false;
  if (task.frequencia === 'diario') return true;
  if (task.frequencia === 'semanal') return created.getDay() === date.getDay();
  if (task.frequencia === 'mensal') return created.getDate() === date.getDate();
  return false;
};

// Build a local YYYY-MM-DD key (avoid timezone drift with toISOString)
const dateKeyLocal = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const CalendarSection = ({ allTasks, specialDates = [], onDateClick, selectedDate }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  // Responsividade: até lg (<1024px) mostramos 2 bolinhas; em telas maiores, 4
  const [maxDots, setMaxDots] = useState(4);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => setMaxDots(mq.matches ? 4 : 2);
    update();
    if (mq.addEventListener) {
      mq.addEventListener('change', update);
    } else {
      // Safari antigo
      mq.addListener(update);
    }
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', update);
      else mq.removeListener(update);
    };
  }, []);

  useEffect(() => {
    // Keep special dates as FullCalendar events (optional)
    const events = [];
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
  }, [specialDates]);

  // Build a map of dateStr -> array of colors for that day (using allTasks + recurrence)
  const dayDotsMap = useMemo(() => {
    const map = new Map();
    const { year, month } = currentMonth;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Flatten all tasks across periods
    const flat = [
      ...(allTasks?.manha || []),
      ...(allTasks?.tarde || []),
      ...(allTasks?.noite || [])
    ];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dateStr = dateKeyLocal(date);
      const colors = [];
      flat.forEach(task => {
        if (occursOnDate(task, date)) {
          const cor = task.cor || '#999';
          colors.push(cor);
        }
      });
      map.set(dateStr, colors);
    }
    // Include special dates as a distinct dot color (optional)
    specialDates.forEach(s => {
      const ds = dateKeyLocal(new Date(s.data));
      const arr = map.get(ds) || [];
      arr.push('#ec4899');
      map.set(ds, arr);
    });
    return map;
  }, [allTasks, specialDates, currentMonth]);

  const handleDateClick = (info) => {
    if (onDateClick) {
      onDateClick(info.dateStr);
    }
  };

  // Atualizar mês visível ao navegar no calendário
  const handleMonthChange = (info) => {
    // Use o primeiro dia do mês atual, não o início da grade (que inclui dias do mês anterior)
    const cm = info.view.currentStart;
    setCurrentMonth({ year: cm.getFullYear(), month: cm.getMonth() });
  };

  return (
    <div className="mb-6">
      {/* Estilos locais para ajustar espaçamento dos botões do calendário e destacar o dia selecionado */}
      <style>{`
        .fc .fc-toolbar-chunk .fc-button + .fc-button { margin-left: 3px; }
        .fc .fc-toolbar-chunk .fc-button-group { gap: 3px; }
        .fc .fc-daygrid-day.fc-selected-day,
        .fc .fc-daygrid-day.fc-selected-day .fc-daygrid-day-frame { background-color: #ffe4ed !important; }
        .fc .fc-daygrid-day.fc-selected-day .fc-daygrid-day-top { color: #be185d; font-weight: 700; }
        /* Evitar overflow da linha de bolinhas */
        .fc .fc-daygrid-day .fc-dots-row { overflow: hidden; white-space: nowrap; max-width: 100%; }
      `}</style>
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
                  dayCellContent={(arg) => {
                    // Render default text (day number) + custom dots row
                    const dateIso = dateKeyLocal(arg.date);
                    const colors = dayDotsMap.get(dateIso) || [];
                    const visible = colors.slice(0, maxDots);
                    const extra = colors.length - visible.length;
                    return {
                      html: `
                        <div class="fc-daygrid-day-top">
                          <a class="fc-daygrid-day-number">${arg.dayNumberText}</a>
                        </div>
                        <div class="fc-dots-row" style="display:flex; gap:4px; margin-top:4px; align-items:center;">
                          ${visible.map(c => `<span class="fc-dot" style="width:8px;height:8px;border-radius:9999px;background:${c};display:inline-block;flex:0 0 auto"></span>`).join('')}
                          ${extra > 0 ? `<span class="fc-dot fc-dot-more" style="width:14px;height:14px;border:2px solid #999;border-radius:9999px;display:inline-flex;align-items:center;justify-content:center;font-size:9px;color:#666;flex:0 0 auto">${extra}</span>` : ''}
                        </div>`
                    };
                  }}
                  dateClick={handleDateClick}
                  eventDisplay="block"
                  dayMaxEvents={3}
                  moreLinkText="mais"
                  eventClassNames="cursor-pointer"
                  dayCellClassNames={(arg) => {
                    const cls = ['hover:bg-pink-50','cursor-pointer','transition-colors'];
                    const sel = selectedDate ? new Date(selectedDate).toDateString() : '';
                    const thisDate = new Date(arg.date).toDateString();
                    if (sel && thisDate === sel) {
                      cls.push('fc-selected-day');
                    }
                    return cls;
                  }}
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

