import { fromIsoDateKey, safeDate, toAgendaDateKey, toIsoDateKey } from '@/shared/lib/date';
import {
  MAX_TEXT_LENGTHS,
  isAgendaDateKey,
  normalizeSingleLineText,
  sanitizeAgendaDateKey,
  sanitizeHexColor,
  sanitizeLooseId,
  sanitizeTimeValue,
} from '@/shared/lib/security';

export const TASK_PERIODS = [
  { id: 'manha', title: 'Manhã', timeRange: '6h - 12h' },
  { id: 'tarde', title: 'Tarde', timeRange: '12h - 18h' },
  { id: 'noite', title: 'Noite', timeRange: '18h - 24h' },
];

export const DEFAULT_TASK_COLOR = '#7BAECC';
export const MAX_TASKS_PER_PERIOD = 60;
export const MAX_TASK_COMPLETED_DATES = 366;

export const TASK_FREQUENCIES = [
  { value: 'diario', label: 'Diário' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'mensal', label: 'Mensal' },
];

const TASK_FREQUENCY_SET = new Set(TASK_FREQUENCIES.map((frequency) => frequency.value));

export const createEmptyAgenda = () => ({
  manha: [],
  tarde: [],
  noite: [],
});

const sanitizeTaskFrequency = (value) => (
  TASK_FREQUENCY_SET.has(value) ? value : ''
);

const sanitizeCreatedAt = (value, fallbackDateKey) => {
  const fallbackDate = safeDate(fallbackDateKey);
  return safeDate(value, fallbackDate).toISOString();
};

const sanitizeCompletedDates = (completedDates) => (
  Array.from(new Set(
    (Array.isArray(completedDates) ? completedDates : [])
      .map((dateKey) => sanitizeAgendaDateKey(dateKey, ''))
      .filter(Boolean),
  )).slice(0, MAX_TASK_COMPLETED_DATES)
);

const buildFallbackTaskId = (task, dateKey) => (
  [
    dateKey,
    sanitizeTimeValue(task?.hora, ''),
    normalizeSingleLineText(task?.text, MAX_TEXT_LENGTHS.task),
    String(task?.createdAt ?? ''),
  ].filter(Boolean).join('|') || dateKey
);

const isPersistableTask = (task) => Boolean(task.id && task.text && task.hora);

export const getTaskDateKey = (task, fallbackDateKey = toAgendaDateKey()) => {
  if (isAgendaDateKey(task?.dateKey)) {
    return task.dateKey;
  }

  if (task?.createdAt) {
    const createdAt = safeDate(task.createdAt, null);

    if (createdAt instanceof Date && !Number.isNaN(createdAt.getTime())) {
      return toAgendaDateKey(createdAt);
    }
  }

  return sanitizeAgendaDateKey(fallbackDateKey, toAgendaDateKey());
};

export const normalizeTask = (task, fallbackDateKey = toAgendaDateKey()) => {
  const dateKey = getTaskDateKey(task, fallbackDateKey);
  const normalizedTask = {
    id: sanitizeLooseId(task?.id, buildFallbackTaskId(task, dateKey)),
    text: normalizeSingleLineText(task?.text, MAX_TEXT_LENGTHS.task),
    hora: sanitizeTimeValue(task?.hora, ''),
    cor: sanitizeHexColor(task?.cor, DEFAULT_TASK_COLOR),
    completed: Boolean(task?.completed),
    completedDates: sanitizeCompletedDates(task?.completedDates),
    frequencia: sanitizeTaskFrequency(task?.frequencia),
    dateKey,
    createdAt: sanitizeCreatedAt(task?.createdAt, dateKey),
  };

  return normalizedTask;
};

export const isRecurringTask = (task) => Boolean(task?.frequencia);

export const getPeriodByTime = (time) => {
  const [hour] = String(time).split(':').map(Number);

  if (hour >= 6 && hour < 12) {
    return 'manha';
  }

  if (hour >= 12 && hour < 18) {
    return 'tarde';
  }

  return 'noite';
};

export const createTaskDraft = ({ text, time, color, frequency }) => ({
  text: normalizeSingleLineText(text, MAX_TEXT_LENGTHS.task),
  hora: sanitizeTimeValue(time, ''),
  cor: sanitizeHexColor(color, DEFAULT_TASK_COLOR),
  completed: false,
  completedDates: [],
  frequencia: sanitizeTaskFrequency(frequency),
});

export const occursOnAgendaDate = (task, dateKey) => {
  const normalizedTask = normalizeTask(task, dateKey);
  const date = safeDate(dateKey);

  if (!normalizedTask.frequencia) {
    return normalizedTask.dateKey === dateKey;
  }

  const createdDate = safeDate(normalizedTask.dateKey);
  if (createdDate > date) {
    return false;
  }

  if (normalizedTask.frequencia === 'diario') {
    return true;
  }

  if (normalizedTask.frequencia === 'semanal') {
    return createdDate.getDay() === date.getDay();
  }

  if (normalizedTask.frequencia === 'mensal') {
    return createdDate.getDate() === date.getDate();
  }

  return false;
};

export const isTaskCompletedOnDate = (task, dateKey) => {
  const normalizedTask = normalizeTask(task, dateKey);

  if (isRecurringTask(normalizedTask)) {
    return normalizedTask.completedDates.includes(dateKey);
  }

  return normalizedTask.completed;
};

export const createTaskView = (task, dateKey) => {
  const normalizedTask = normalizeTask(task, dateKey);
  return {
    ...normalizedTask,
    completed: isTaskCompletedOnDate(normalizedTask, dateKey),
  };
};

export const sortTasksByTime = (tasks = []) => (
  [...tasks].sort((left, right) => String(left?.hora || '').localeCompare(String(right?.hora || '')))
);

export const filterTasksByDate = (allTasks, dateKey) => {
  return TASK_PERIODS.reduce((accumulator, period) => {
    const nextTasks = (allTasks?.[period.id] || [])
      .filter((task) => occursOnAgendaDate(task, dateKey))
      .map((task) => createTaskView(task, dateKey));

    accumulator[period.id] = nextTasks;
    return accumulator;
  }, createEmptyAgenda());
};

export const flattenAgendaTasks = (allTasks) => (
  TASK_PERIODS.flatMap((period) => allTasks?.[period.id] || [])
);

export const dedupeTasks = (allTasks) => {
  const seen = new Set();

  return TASK_PERIODS.reduce((accumulator, period) => {
    accumulator[period.id] = (allTasks?.[period.id] || []).reduce((tasks, currentTask) => {
      const normalizedTask = normalizeTask(currentTask);
      const dedupeKey = normalizedTask.id || [
        period.id,
        normalizedTask.text,
        normalizedTask.hora,
        normalizedTask.dateKey,
      ].join('|');

      if (!isPersistableTask(normalizedTask) || seen.has(dedupeKey)) {
        return tasks;
      }

      seen.add(dedupeKey);
      tasks.push(normalizedTask);
      return tasks;
    }, []).slice(0, MAX_TASKS_PER_PERIOD);

    return accumulator;
  }, createEmptyAgenda());
};

export const buildAgendaDayPayload = (allTasks, dateKey) => {
  return TASK_PERIODS.reduce((accumulator, period) => {
    accumulator[period.id] = (allTasks?.[period.id] || [])
      .map((task) => normalizeTask(task, dateKey))
      .filter((task) => isPersistableTask(task) && getTaskDateKey(task, dateKey) === dateKey)
      .slice(0, MAX_TASKS_PER_PERIOD);

    return accumulator;
  }, { updatedAt: new Date() });
};

export const toggleTaskCompletion = (task, dateKey) => {
  const normalizedTask = normalizeTask(task, dateKey);

  if (!isRecurringTask(normalizedTask)) {
    return {
      ...normalizedTask,
      completed: !normalizedTask.completed,
    };
  }

  const completedDates = new Set(normalizedTask.completedDates);

  if (completedDates.has(dateKey)) {
    completedDates.delete(dateKey);
  } else {
    completedDates.add(dateKey);
  }

  return {
    ...normalizedTask,
    completed: completedDates.size > 0,
    completedDates: Array.from(completedDates),
  };
};

// --- Streak calculation ---

const shiftDate = (dateKey, days) => {
  const date = safeDate(dateKey);
  date.setDate(date.getDate() + days);
  return toAgendaDateKey(date);
};

const getWeekKey = (dateKey) => {
  const date = safeDate(dateKey);
  const monday = new Date(date);
  monday.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return toIsoDateKey(monday);
};

const getPreviousWeekKey = (weekKey) => {
  const date = fromIsoDateKey(weekKey);
  date.setDate(date.getDate() - 7);
  return toIsoDateKey(date);
};

const getMonthKey = (dateKey) => toIsoDateKey(safeDate(dateKey)).slice(0, 7);

const getPreviousMonthKey = (monthKey) => {
  const [year, month] = monthKey.split('-').map(Number);
  return month > 1
    ? `${year}-${String(month - 1).padStart(2, '0')}`
    : `${year - 1}-12`;
};

export const getTaskStreak = (task, referenceDate = toAgendaDateKey()) => {
  if (!isRecurringTask(task) || !task.completedDates?.length) return 0;

  const { frequencia, completedDates } = task;

  if (frequencia === 'diario') {
    const dateSet = new Set(completedDates);
    const yesterday = shiftDate(referenceDate, -1);
    const start = dateSet.has(referenceDate) ? referenceDate
      : dateSet.has(yesterday) ? yesterday
      : null;
    if (!start) return 0;
    let streak = 0;
    let current = start;
    while (dateSet.has(current)) { streak++; current = shiftDate(current, -1); }
    return streak;
  }

  if (frequencia === 'semanal') {
    const weekSet = new Set(completedDates.map(getWeekKey));
    const currentWeek = getWeekKey(referenceDate);
    const prevWeek = getPreviousWeekKey(currentWeek);
    const start = weekSet.has(currentWeek) ? currentWeek
      : weekSet.has(prevWeek) ? prevWeek
      : null;
    if (!start) return 0;
    let streak = 0;
    let current = start;
    while (weekSet.has(current)) { streak++; current = getPreviousWeekKey(current); }
    return streak;
  }

  if (frequencia === 'mensal') {
    const monthSet = new Set(completedDates.map(getMonthKey));
    const currentMonth = getMonthKey(referenceDate);
    const prevMonth = getPreviousMonthKey(currentMonth);
    const start = monthSet.has(currentMonth) ? currentMonth
      : monthSet.has(prevMonth) ? prevMonth
      : null;
    if (!start) return 0;
    let streak = 0;
    let current = start;
    while (monthSet.has(current)) { streak++; current = getPreviousMonthKey(current); }
    return streak;
  }

  return 0;
};
