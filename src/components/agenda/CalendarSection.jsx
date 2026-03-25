import React, { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CalendarPanel from '@/components/agenda/CalendarPanel';
import SpecialDatesPanel from '@/components/agenda/SpecialDatesPanel';

const CalendarSection = ({
  allTasks,
  onAddSpecialDate,
  onDateClick,
  onRemoveSpecialDate,
  selectedDate,
  specialDates,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  return (
    <section className="mb-6">
      <style>{`
        .fc .fc-toolbar-chunk .fc-button + .fc-button { margin-left: 6px; }
        .fc .fc-toolbar-chunk .fc-button-group { gap: 6px; }
        .fc .fc-daygrid-day.fc-selected-day,
        .fc .fc-daygrid-day.fc-selected-day .fc-daygrid-day-frame { background-color: var(--planner-terracotta-soft) !important; }
        .fc .fc-daygrid-day.fc-selected-day .fc-daygrid-day-top { color: var(--planner-terracotta-deep); font-weight: 700; }
        .fc .fc-daygrid-day .fc-dots-row { overflow: hidden; white-space: nowrap; max-width: 100%; }
      `}</style>

      <Button
        variant="outline"
        onClick={() => setIsVisible((current) => !current)}
        className="mb-3 flex items-center gap-2 rounded-[1.1rem] px-4"
      >
        <Calendar className="w-4 h-4" />
        <span>{isVisible ? 'Ocultar calendário' : 'Mostrar calendário'}</span>
        {isVisible ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </Button>

      <div
        className={`overflow-hidden transition-all duration-500 ${
          isVisible ? 'max-h-[2200px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="flex flex-col gap-6 xl:flex-row">
          <div className="min-w-0 flex-1 xl:min-w-[540px]">
            <CalendarPanel
              allTasks={allTasks}
              currentMonth={currentMonth}
              onDateClick={onDateClick}
              onMonthChange={setCurrentMonth}
              selectedDate={selectedDate}
              specialDates={specialDates}
            />
          </div>

          <div className="w-full xl:w-[24rem]">
            <SpecialDatesPanel
              currentMonth={currentMonth}
              onAddSpecialDate={onAddSpecialDate}
              onRemoveSpecialDate={onRemoveSpecialDate}
              specialDates={specialDates}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CalendarSection;
