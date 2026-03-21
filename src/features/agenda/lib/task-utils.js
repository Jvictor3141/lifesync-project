import { safeDate, toAgendaDateKey } from '@/shared/lib/date';

export const TASK_PERIODS = [
  { id: 'manha', title: 'Manhã', timeRange: '6h - 12h' },
  { id: 'tarde', title: 'Tarde', timeRange: '12h - 18h' },
  { id: 'noite', title: 'Noite', timeRange: '18h - 24h' },
];

export const DEFAULT_TASK_COLOR = '#7BAECC';

export const TASK_FREQUENCIES = [
  { value: 'diario', label: 'Diário' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'mensal', label: 'Mensal' },
];

export const createEmptyAgenda = () => ({
  manha: [],
  tarde: [],
  noite: [],
});

export const getTaskDateKey = (task, fallbackDateKey = toAgendaDateKey()) => {
  if (task?.dateKey) {
    return task.dateKey;
  }

  if (task?.createdAt) {
    return toAgendaDateKey(task.createdAt);
  }

  return fallbackDateKey;
};

export const normalizeTask = (task, fallbackDateKey = toAgendaDateKey()) => ({
  ...task,
  dateKey: getTaskDateKey(task, fallbackDateKey),
  cor: task?.cor || DEFAULT_TASK_COLOR,
  completed: Boolean(task?.completed),
  completedDates: Array.isArray(task?.completedDates) ? task.completedDates : [],
  frequencia: task?.frequencia || '',
});

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
  text: text.trim(),
  hora: time,
  cor: color,
  completed: false,
  completedDates: [],
  frequencia: frequency || '',
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

    accumulator[period.id] = sortTasksByTime(nextTasks);
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

      if (seen.has(dedupeKey)) {
        return tasks;
      }

      seen.add(dedupeKey);
      tasks.push(normalizedTask);
      return tasks;
    }, []);

    return accumulator;
  }, createEmptyAgenda());
};

export const buildAgendaDayPayload = (allTasks, dateKey) => {
  return TASK_PERIODS.reduce((accumulator, period) => {
    accumulator[period.id] = (allTasks?.[period.id] || [])
      .map((task) => normalizeTask(task, dateKey))
      .filter((task) => getTaskDateKey(task, dateKey) === dateKey);

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


