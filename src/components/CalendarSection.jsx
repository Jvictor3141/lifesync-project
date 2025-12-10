import React, { useState, useEffect, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar, ChevronDown, ChevronUp, Plus, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

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

// Check if a special date occurs within the given month/year (handles recurrence)
const occursInMonth = (special, year, month) => {
  const startKey = (special.data && special.data.length === 10)
    ? special.data
    : dateKeyLocal(new Date(special.data));
  const [sy, sm, sd] = startKey.split('-').map(n => parseInt(n, 10));
  const start = new Date(sy, sm - 1, sd);
  const monthEnd = new Date(year, month + 1, 0);
  // If the special starts after this month, it doesn't occur yet
  if (start > monthEnd) return false;
  // One-time: only if same year+month
  if (!special.frequencia || special.frequencia === '') {
    return sy === year && (sm - 1) === month;
  }
  // Weekly: occurs every week after start, so if started by monthEnd
  if (special.frequencia === 'semanal') return start <= monthEnd;
  // Monthly: occurs each month on the same day if the day exists in this month
  if (special.frequencia === 'mensal') {
    const daysInMonth = monthEnd.getDate();
    return sd <= daysInMonth && start <= monthEnd;
  }
  // Annual: occurs in this month if month matches
  if (special.frequencia === 'anual') return (sm - 1) === month && start <= monthEnd;
  return false;
};

const CalendarSection = ({ allTasks, specialDates = [], onDateClick, selectedDate, onAddSpecialDate, onRemoveSpecialDate }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [specialFilter, setSpecialFilter] = useState('ano'); // 'todas' | 'ano'
  const [modalOpen, setModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formFreq, setFormFreq] = useState(''); // '', semanal, mensal, anual
  const [oneTime, setOneTime] = useState(false);
  const [withTime, setWithTime] = useState(false);
  const [formTime, setFormTime] = useState('');
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
    // Do not inject title events for special dates; only render a star in day cells
    setCalendarEvents([]);
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
    // Do not add extra dots for special dates; star will be rendered separately
    return map;
  }, [allTasks, currentMonth]);

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
                    const hasSpecial = (specialDates || []).some(s => {
                      // Recurrence handling
                      const startKey = (s.data && s.data.length === 10) ? s.data : dateKeyLocal(new Date(s.data));
                      if (!s.frequencia || s.frequencia === '') {
                        return startKey === dateIso;
                      }
                      const start = new Date(startKey + 'T00:00:00');
                      const date = arg.date;
                      if (start > date) return false;
                      if (s.frequencia === 'semanal') return start.getDay() === date.getDay();
                      if (s.frequencia === 'mensal') return start.getDate() === date.getDate();
                      if (s.frequencia === 'anual') return (start.getDate() === date.getDate() && start.getMonth() === date.getMonth());
                      return false;
                    });
                    const visible = colors.slice(0, maxDots);
                    const extra = colors.length - visible.length;
                    return {
                      html: `
                        <div class="fc-daygrid-day-top">
                          <a class="fc-daygrid-day-number">${arg.dayNumberText}</a>
                        </div>
                        ${hasSpecial ? `<div class="fc-star-row" style="display:flex; justify-content:center; margin-top:4px;"><span style="display:inline-block; color:#f59e0b;">⭐</span></div>` : ''}
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
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-lg font-medium text-pink-500 flex items-center">
                    <span className="text-2xl mr-2">📅</span>
                    Eventos Importantes
                  </CardTitle>
                  <div className="w-40">
                    <Select value={specialFilter} onValueChange={(v) => setSpecialFilter(v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filtro" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ano">Ano atual</SelectItem>
                        <SelectItem value="todas">Todas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end mb-3">
                  <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-pink-500 hover:bg-pink-600"><Plus className="w-4 h-4 mr-1" /></Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Nova Data Especial</DialogTitle>
                        <DialogDescription>Preencha os detalhes e salve para sincronizar.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Nome</label>
                          <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Ex.: Aniversário" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium mb-1">Data</label>
                            <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Frequência</label>
                            <Select value={oneTime ? '' : formFreq} onValueChange={(v) => { setFormFreq(v); setOneTime(false); }}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="semanal">Semanal</SelectItem>
                                <SelectItem value="mensal">Mensal</SelectItem>
                                <SelectItem value="anual">Anual</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="mt-2 flex items-center gap-2">
                              <input id="one-time" type="checkbox" checked={oneTime} onChange={(e) => { setOneTime(e.target.checked); if (e.target.checked) setFormFreq(''); }} />
                              <label htmlFor="one-time" className="text-sm">Apenas uma vez</label>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input id="with-time" type="checkbox" checked={withTime} onChange={(e) => setWithTime(e.target.checked)} />
                          <label htmlFor="with-time" className="text-sm">Adicionar horário</label>
                          {withTime && (
                            <Input type="time" value={formTime} onChange={(e) => setFormTime(e.target.value)} className="ml-2" />
                          )}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
                        <Button onClick={() => {
                          if (!formName.trim() || !formDate) return;
                          const payload = { nome: formName.trim(), data: formDate, frequencia: oneTime ? '' : formFreq, hora: withTime ? formTime : undefined };
                          if (onAddSpecialDate) onAddSpecialDate(payload);
                          setModalOpen(false);
                          setFormName(''); setFormDate(''); setFormFreq(''); setOneTime(false); setWithTime(false); setFormTime('');
                        }} className="bg-pink-500 hover:bg-pink-600">Salvar</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="text-gray-700 dark:text-gray-300 text-sm space-y-2">
                  {specialDates.length === 0 ? (
                    <p className="text-gray-400">Nenhuma data especial cadastrada.</p>
                  ) : (
                    (specialFilter === 'ano'
                      ? specialDates.filter((item) => occursInMonth(item, currentMonth.year, currentMonth.month))
                      : specialDates
                    ).map((item) => (
                      <div key={item.id} className="flex items-center gap-2 justify-between">
                        <span className="w-3 h-3 rounded-full bg-pink-500"></span>
                        <div className="flex-1 flex items-center gap-2">
                          <span className="font-bold">{item.nome}</span>
                          {(() => {
                            const iso = (item.data && item.data.length === 10) ? item.data : dateKeyLocal(new Date(item.data));
                            const [y, m, d] = iso.split('-');
                            return <span>- {`${d}/${m}/${y}`}</span>;
                          })()}
                          {item.hora && <span>às {item.hora}</span>}
                          {item.frequencia && (
                            <span className="text-xs text-gray-500">({item.frequencia || 'única'})</span>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-500" onClick={() => onRemoveSpecialDate && onRemoveSpecialDate(item.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
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

