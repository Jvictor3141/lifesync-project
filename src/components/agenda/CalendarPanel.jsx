import React, { useEffect, useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardContent } from '@/components/ui/card';
import { occursOnIsoDate } from '@/features/agenda/lib/special-date-utils';
import { DEFAULT_TASK_COLOR, occursOnAgendaDate } from '@/features/agenda/lib/task-utils';
import { toAgendaDateKey, toIsoDateKey } from '@/shared/lib/date';
import { sanitizeHexColor } from '@/shared/lib/security';

const applyStyles = (element, styles) => {
  Object.entries(styles).forEach(([property, value]) => {
    element.style[property] = value;
  });

  return element;
};

const createElement = (tagName, className, textContent) => {
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  if (textContent !== undefined) {
    element.textContent = textContent;
  }

  return element;
};

const createDotNode = (color) => {
  const dot = createElement('span', 'fc-dot');

  return applyStyles(dot, {
    width: '8px',
    height: '8px',
    borderRadius: '9999px',
    background: sanitizeHexColor(color, DEFAULT_TASK_COLOR),
    display: 'inline-block',
    flex: '0 0 auto',
  });
};

const createOverflowDotNode = (extraDots) => {
  const overflow = createElement('span', 'fc-dot fc-dot-more', `+${extraDots}`);

  return applyStyles(overflow, {
    width: '16px',
    height: '16px',
    border: '1px solid var(--planner-line)',
    background: 'var(--surface-overlay)',
    borderRadius: '9999px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '9px',
    color: 'var(--planner-ink-soft)',
    flex: '0 0 auto',
  });
};

const buildDayCellNodes = ({ dayNumberText, extraDots, hasSpecialDate, visibleColors }) => {
  const top = createElement('div', 'fc-daygrid-day-top');
  const dayNumber = createElement('a', 'fc-daygrid-day-number', dayNumberText);
  const dotsRow = createElement('div', 'fc-dots-row');

  top.appendChild(dayNumber);
  applyStyles(dotsRow, {
    display: 'flex',
    gap: '4px',
    marginTop: '4px',
    alignItems: 'center',
  });

  visibleColors.forEach((color) => {
    dotsRow.appendChild(createDotNode(color));
  });

  if (extraDots > 0) {
    dotsRow.appendChild(createOverflowDotNode(extraDots));
  }

  const nodes = [top];

  if (hasSpecialDate) {
    const starRow = createElement('div', 'fc-star-row');
    const star = createElement('span', '', '✦');

    applyStyles(starRow, {
      display: 'flex',
      justifyContent: 'center',
      marginTop: '4px',
    });
    applyStyles(star, {
      display: 'inline-block',
      color: 'var(--planner-terracotta)',
      fontSize: '12px',
    });

    starRow.appendChild(star);
    nodes.push(starRow);
  }

  nodes.push(dotsRow);
  return nodes;
};

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

            // FullCalendar accepts domNodes here. Using DOM nodes keeps untrusted
            // data away from innerHTML and blocks stored XSS through task colors.
            return {
              domNodes: buildDayCellNodes({
                dayNumberText: arg.dayNumberText,
                visibleColors,
                extraDots,
                hasSpecialDate,
              }),
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
