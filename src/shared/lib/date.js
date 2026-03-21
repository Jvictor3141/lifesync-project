const safeDate = (value, fallback = new Date()) => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? fallback : value;
  }

  if (!value) {
    return fallback;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
};

export const toAgendaDateKey = (value = new Date()) => safeDate(value).toDateString();

export const toIsoDateKey = (value = new Date()) => {
  const date = safeDate(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const fromIsoDateKey = (dateKey) => safeDate(`${dateKey}T00:00:00`);

export const formatFullDate = (value, locale = 'pt-BR') => (
  safeDate(value).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
);

export const formatWeekday = (value, locale = 'pt-BR') => (
  safeDate(value).toLocaleDateString(locale, { weekday: 'long' })
);

export const formatMonthLabel = (monthKey, locale = 'pt-BR') => {
  try {
    const date = new Date(`${monthKey}-01T00:00:00`);
    const monthName = date.toLocaleDateString(locale, { month: 'long' });
    const year = monthKey.split('-')[0];
    return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} / ${year}`;
  } catch {
    return monthKey;
  }
};

export const currentFinanceMonthKey = (value = new Date()) => toIsoDateKey(value).slice(0, 7);

export const sortByDateDesc = (left, right) => safeDate(right) - safeDate(left);

export { safeDate };
