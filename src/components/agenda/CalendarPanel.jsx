import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardContent } from '@/components/ui/card';
import { occursOnIsoDate } from '@/features/agenda/lib/special-date-utils';
import {
  DEFAULT_TASK_COLOR,
  isTaskCompletedOnDate,
  isTaskMissedOnDate,
  occursOnAgendaDate,
  toCurrentTimeStr,
} from '@/features/agenda/lib/task-utils';
import { useCurrentTime } from '@/app/hooks/useCurrentTime';
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

const createDotNode = (color, completed = false, missed = false) => {
  const safeColor = sanitizeHexColor(color, DEFAULT_TASK_COLOR);

  if (!missed) {
    const dot = createElement('span', 'fc-dot');
    return applyStyles(dot, {
      width: '8px',
      height: '8px',
      borderRadius: '9999px',
      background: safeColor,
      display: 'inline-block',
      flex: '0 0 auto',
      opacity: completed ? '0.3' : '1',
      transition: 'opacity 0.2s ease',
    });
  }

  // Missed: semi-transparent filled dot + × overlay at full opacity
  const wrapper = createElement('span', 'fc-dot fc-dot-missed');
  applyStyles(wrapper, {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '8px',
    height: '8px',
    flex: '0 0 auto',
  });

  const bg = createElement('span');
  applyStyles(bg, {
    position: 'absolute',
    inset: '0',
    borderRadius: '9999px',
    background: safeColor,
    opacity: '0.35',
  });

  const x = createElement('span', '', '×');
  applyStyles(x, {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: '1',
    fontSize: '12px',
    fontWeight: '900',
    lineHeight: '1',
    color: '#ef4444',
    pointerEvents: 'none',
  });

  wrapper.appendChild(bg);
  wrapper.appendChild(x);
  return wrapper;
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

const buildDayCellNodes = ({ dayNumberText, extraDots, hasSpecialDate, visibleDots }) => {
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

  visibleDots.forEach(({ color, completed, missed }) => {
    dotsRow.appendChild(createDotNode(color, completed, missed));
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

const PERIOD_LABELS = { manha: 'Manhã', tarde: 'Tarde', noite: 'Noite' };
const TOOLTIP_WIDTH = 220;
const TOOLTIP_MARGIN = 8;

const DayTooltip = ({ tooltip }) => {
  if (!tooltip) return null;

  const { cellRect, tasksByPeriod, specialDatesOnDay, isoDate } = tooltip;

  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const dateLabel = date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });

  const totalTasks = Object.values(tasksByPeriod).reduce((sum, arr) => sum + arr.length, 0);
  const isEmpty = totalTasks === 0 && specialDatesOnDay.length === 0;

  let x = cellRect.left + cellRect.width / 2;
  let y = cellRect.top - TOOLTIP_MARGIN;
  let transformY = '-100%';

  if (cellRect.top < 200) {
    y = cellRect.bottom + TOOLTIP_MARGIN;
    transformY = '0%';
  }

  x = Math.max(
    TOOLTIP_WIDTH / 2 + TOOLTIP_MARGIN,
    Math.min(x, window.innerWidth - TOOLTIP_WIDTH / 2 - TOOLTIP_MARGIN),
  );

  return createPortal(
    <div
      style={{
        position: 'fixed',
        left: x,
        top: y,
        transform: `translateX(-50%) translateY(${transformY})`,
        width: TOOLTIP_WIDTH,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
      className="rounded-[1rem] border border-border bg-card p-3 shadow-lg text-xs animate-in fade-in-0 zoom-in-95 duration-150"
    >
      <p className="font-semibold text-foreground mb-2 capitalize">{dateLabel}</p>

      {isEmpty ? (
        <p className="text-muted-foreground">Dia livre</p>
      ) : (
        <>
          {Object.entries(tasksByPeriod).map(([period, tasks]) => {
            if (tasks.length === 0) return null;
            const visible = tasks.slice(0, 3);
            const extra = tasks.length - visible.length;

            return (
              <div key={period} className="mb-2">
                <p className="text-muted-foreground font-medium mb-1">{PERIOD_LABELS[period]}</p>
                <ul className="space-y-0.5 pl-1">
                  {visible.map((task) => (
                    <li key={task.id} className="flex items-center gap-1.5 text-foreground">
                      <span
                        className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: sanitizeHexColor(task.cor, DEFAULT_TASK_COLOR) }}
                      />
                      <span className="truncate">{task.text}</span>
                    </li>
                  ))}
                  {extra > 0 && (
                    <li className="text-muted-foreground pl-3">+{extra} mais</li>
                  )}
                </ul>
              </div>
            );
          })}

          {specialDatesOnDay.length > 0 && (
            <div className={totalTasks > 0 ? 'mt-2 pt-2 border-t border-border/50' : ''}>
              {specialDatesOnDay.map((sd) => (
                <div key={sd.id} className="flex items-center gap-1.5 text-[var(--planner-terracotta)]">
                  <span>✦</span>
                  <span className="truncate">{sd.nome}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>,
    document.body,
  );
};

const CalendarPanel = ({
  allTasks,
  currentMonth,
  onDateClick,
  onMonthChange,
  selectedDate,
  specialDates,
}) => {
  const now = useCurrentTime();
  const [maxDots, setMaxDots] = useState(4);
  const [tooltip, setTooltip] = useState(null);

  const containerRef = useRef(null);
  const tooltipTimerRef = useRef(null);
  const hoveredCellRef = useRef(null);
  const allTasksRef = useRef(allTasks);
  const specialDatesRef = useRef(specialDates);

  allTasksRef.current = allTasks;
  specialDatesRef.current = specialDates;

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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const computeTooltipData = (isoDate) => {
      const [year, month, day] = isoDate.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      const agendaDateKey = toAgendaDateKey(date);
      const tasks = allTasksRef.current;

      return {
        tasksByPeriod: {
          manha: (tasks?.manha || []).filter((t) => occursOnAgendaDate(t, agendaDateKey)),
          tarde: (tasks?.tarde || []).filter((t) => occursOnAgendaDate(t, agendaDateKey)),
          noite: (tasks?.noite || []).filter((t) => occursOnAgendaDate(t, agendaDateKey)),
        },
        specialDatesOnDay: (specialDatesRef.current || []).filter((sd) => occursOnIsoDate(sd, isoDate)),
      };
    };

    const handleMouseOver = (e) => {
      const dayCell = e.target.closest('.fc-daygrid-day[data-date]');

      if (dayCell === hoveredCellRef.current) return;

      clearTimeout(tooltipTimerRef.current);
      setTooltip(null);
      hoveredCellRef.current = dayCell;

      if (!dayCell) return;

      const isoDate = dayCell.dataset.date;
      if (!isoDate) return;

      tooltipTimerRef.current = setTimeout(() => {
        const cellRect = dayCell.getBoundingClientRect();
        setTooltip({ cellRect, isoDate, ...computeTooltipData(isoDate) });
      }, 2000);
    };

    const handleMouseLeave = () => {
      clearTimeout(tooltipTimerRef.current);
      setTooltip(null);
      hoveredCellRef.current = null;
    };

    container.addEventListener('mouseover', handleMouseOver);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mouseover', handleMouseOver);
      container.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(tooltipTimerRef.current);
    };
  }, []);

  const dayDotsMap = useMemo(() => {
    const todayIso = toIsoDateKey(now);
    const currentTimeStr = toCurrentTimeStr(now);
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
        if (!occursOnAgendaDate(task, agendaDateKey)) return;

        const completed = isTaskCompletedOnDate(task, agendaDateKey);
        const missed = isTaskMissedOnDate(task, agendaDateKey, isoDateKey, todayIso, currentTimeStr);

        colors.push({
          color: task.cor || DEFAULT_TASK_COLOR,
          completed,
          missed,
        });
      });

      map.set(isoDateKey, colors);
    }

    return map;
  }, [allTasks, currentMonth, now]);

  return (
    <Card>
      <CardContent className="p-4 md:p-5">
        <div ref={containerRef}>
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
            buttonText={{ today: 'Hoje', prev: '‹', next: '›' }}
            events={[]}
            dayCellContent={(arg) => {
              const isoDateKey = toIsoDateKey(arg.date);
              const dots = dayDotsMap.get(isoDateKey) || [];
              const visibleDots = dots.slice(0, maxDots);
              const extraDots = dots.length - visibleDots.length;
              const hasSpecialDate = (specialDates || []).some((specialDate) => occursOnIsoDate(specialDate, isoDateKey));

              // FullCalendar accepts domNodes here. Using DOM nodes keeps untrusted
              // data away from innerHTML and blocks stored XSS through task colors.
              return {
                domNodes: buildDayCellNodes({
                  dayNumberText: arg.dayNumberText,
                  visibleDots,
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
        </div>

        <DayTooltip tooltip={tooltip} />
      </CardContent>
    </Card>
  );
};

export default CalendarPanel;
