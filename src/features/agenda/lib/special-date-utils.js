import { fromIsoDateKey, toIsoDateKey } from '@/shared/lib/date';

export const SPECIAL_DATE_FREQUENCIES = [
  { value: 'semanal', label: 'Semanal' },
  { value: 'mensal', label: 'Mensal' },
  { value: 'anual', label: 'Anual' },
];

export const getSpecialDateKey = (specialDate) => {
  if (typeof specialDate?.data === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(specialDate.data)) {
    return specialDate.data;
  }

  return toIsoDateKey(specialDate?.data || new Date());
};

export const normalizeSpecialDate = (specialDate) => {
  const normalized = {
    id: specialDate.id,
    nome: specialDate.nome?.trim() || '',
    data: getSpecialDateKey(specialDate),
    frequencia: specialDate.frequencia || '',
  };

  if (specialDate.hora) {
    normalized.hora = specialDate.hora;
  }

  return normalized;
};

export const pruneExpiredOneTimeSpecialDates = (specialDates, todayKey = toIsoDateKey()) => (
  (specialDates || [])
    .map((specialDate) => normalizeSpecialDate(specialDate))
    .filter((specialDate) => specialDate.frequencia || specialDate.data >= todayKey)
);

export const occursOnIsoDate = (specialDate, isoDateKey) => {
  const normalizedSpecialDate = normalizeSpecialDate(specialDate);
  const startDate = fromIsoDateKey(normalizedSpecialDate.data);
  const targetDate = fromIsoDateKey(isoDateKey);

  if (!normalizedSpecialDate.frequencia) {
    return normalizedSpecialDate.data === isoDateKey;
  }

  if (startDate > targetDate) {
    return false;
  }

  if (normalizedSpecialDate.frequencia === 'semanal') {
    return startDate.getDay() === targetDate.getDay();
  }

  if (normalizedSpecialDate.frequencia === 'mensal') {
    return startDate.getDate() === targetDate.getDate();
  }

  if (normalizedSpecialDate.frequencia === 'anual') {
    return (
      startDate.getDate() === targetDate.getDate()
      && startDate.getMonth() === targetDate.getMonth()
    );
  }

  return false;
};

export const occursInMonth = (specialDate, year, month) => {
  const normalizedSpecialDate = normalizeSpecialDate(specialDate);
  const startDate = fromIsoDateKey(normalizedSpecialDate.data);
  const monthEnd = new Date(year, month + 1, 0);

  if (startDate > monthEnd) {
    return false;
  }

  if (!normalizedSpecialDate.frequencia) {
    return startDate.getFullYear() === year && startDate.getMonth() === month;
  }

  if (normalizedSpecialDate.frequencia === 'semanal') {
    return true;
  }

  if (normalizedSpecialDate.frequencia === 'mensal') {
    return startDate.getDate() <= monthEnd.getDate();
  }

  if (normalizedSpecialDate.frequencia === 'anual') {
    return startDate.getMonth() === month;
  }

  return false;
};
