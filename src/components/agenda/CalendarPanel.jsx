import React, { useEffect, useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardContent } from '@/components/ui/card';
import { occursOnIsoDate } from '@/features/agenda/lib/special-date-utils';
import { DEFAULT_TASK_COLOR, occursOnAgendaDate } from '@/features/agenda/lib/task-utils';
import { toAgendaDateKey, toIsoDateKey } from '@/shared/lib/date';

const renderDot = (color) => (
  `<span class="fc-dot" style="width:8px;height:8px;border-radius:9999px;` +
  `background:${color};display:inline-block;flex:0 0 auto"></span>`
);

const renderOverflowDot = (extraDots) => (
  `<span class="fc-dot fc-dot-more" style="width:16px;height:16px;` +
  `border:1px solid var(--planner-line);background:var(--surface-overlay);border-radius:9999px;display:inline-flex;` +
  `align-items:center;justify-content:center;font-size:9px;color:var(--planner-ink-soft);` +
  `flex:0 0 auto">+${extraDots}</span>`
);

const CalendarPanel = ({
  allTasks,
  currentMonth,
  onDateClick,
  onMonthChange,
  selectedDate,
  specialDates,
}) => {
  const [maxDots, setMaxDots] = useState(4);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const updateMaxDots = () => setMaxDots(mediaQuery.matches ? 4 : 2);

    updateMaxDots();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updateMaxDots);
    } else {
      mediaQuery.addListener(updateMaxDots);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', updateMaxDots);
      } else {
        mediaQuery.removeListener(updateMaxDots);
      }
    };
  }, []);

  const dayDotsMap = useMemo(() => {
    const daysInMonth = new Date(currentMonth.year, currentMonth.month + 1, 0).getDate();
    const flatTasks = [
      ...(allTasks?.manha || []),
      ...(allTasks?.tarde || []),
      ...(allTasks?.noite || []),
    ];
    const map = new Map();

    for (let day = 1; day <= daysInMonth; day += 1) {
      const currentDate = new Date(currentMonth.year, currentMonth.month, day);
      const isoDateKey = toIsoDateKey(currentDate);
      const agendaDateKey = toAgendaDateKey(currentDate);
      const colors = [];

      flatTasks.forEach((task) => {
        if (occursOnAgendaDate(task, agendaDateKey)) {
          colors.push(task.cor || DEFAULT_TASK_COLOR);
        }
      });

      map.set(isoDateKey, colors);
    }

    return map;
  }, [allTasks, currentMonth]);

  return (
    <Card>
      <CardContent className="p-4 md:p-5">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="pt-br"
          height={500}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: '',
          }}
          buttonText={{ today: 'Hoje' }}
          events={[]}
          dayCellContent={(arg) => {
            const isoDateKey = toIsoDateKey(arg.date);
            const colors = dayDotsMap.get(isoDateKey) || [];
            const visibleColors = colors.slice(0, maxDots);
            const extraDots = colors.length - visibleColors.length;
            const hasSpecialDate = (specialDates || []).some((specialDate) => occursOnIsoDate(specialDate, isoDateKey));

            return {
              html: `
                <div class="fc-daygrid-day-top">
                  <a class="fc-daygrid-day-number">${arg.dayNumberText}</a>
                </div>
                ${hasSpecialDate ? '<div class="fc-star-row" style="display:flex;justify-content:center;margin-top:4px;"><span style="display:inline-block;color:var(--planner-terracotta);font-size:12px;">✦</span></div>' : ''}
                <div class="fc-dots-row" style="display:flex;gap:4px;margin-top:4px;align-items:center;">
                  ${visibleColors.map(renderDot).join('')}
                  ${extraDots > 0 ? renderOverflowDot(extraDots) : ''}
                </div>`,
            };
          }}
          dateClick={(info) => onDateClick(toAgendaDateKey(info.date))}
          dayCellClassNames={(arg) => {
            const classes = ['cursor-pointer', 'transition-colors'];

            if (toIsoDateKey(arg.date) === toIsoDateKey(selectedDate)) {
              classes.push('fc-selected-day');
            }

            return classes;
          }}
          datesSet={(info) => {
            const monthStart = info.view.currentStart;
            onMonthChange({
              year: monthStart.getFullYear(),
              month: monthStart.getMonth(),
            });
          }}
        />
      </CardContent>
    </Card>
  );
};

export default CalendarPanel;
