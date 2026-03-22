import { fromIsoDateKey } from '@/shared/lib/date';
import {
  MAX_TEXT_LENGTHS,
  normalizeSingleLineText,
  sanitizeIsoDateKey,
  sanitizeLooseId,
  sanitizeTimeValue,
} from '@/shared/lib/security';

export const SPECIAL_DATE_FREQUENCIES = [
  { value: 'semanal', label: 'Semanal' },
  { value: 'mensal', label: 'Mensal' },
  { value: 'anual', label: 'Anual' },
];

export const MAX_SPECIAL_DATES = 200;

const SPECIAL_DATE_FREQUENCY_SET = new Set(
  SPECIAL_DATE_FREQUENCIES.map((frequency) => frequency.value),
);

export const getSpecialDateKey = (specialDate) => (
  sanitizeIsoDateKey(specialDate?.data, '')
);

const buildFallbackSpecialDateId = (specialDate, dateKey) => (
  [
    dateKey,
    normalizeSingleLineText(specialDate?.nome, MAX_TEXT_LENGTHS.specialDateName),
    sanitizeTimeValue(specialDate?.hora, ''),
  ].filter(Boolean).join('|') || dateKey
);

export const normalizeSpecialDate = (specialDate) => {
  const data = getSpecialDateKey(specialDate);
  const nome = normalizeSingleLineText(specialDate?.nome, MAX_TEXT_LENGTHS.specialDateName);

  if (!nome || !data) {
    return null;
  }

  const normalized = {
    id: sanitizeLooseId(specialDate?.id, buildFallbackSpecialDateId(specialDate, data)),
    nome,
    data,
    frequencia: SPECIAL_DATE_FREQUENCY_SET.has(specialDate?.frequencia)
      ? specialDate.frequencia
      : '',
  };

  const hora = sanitizeTimeValue(specialDate?.hora, '');

  if (hora) {
    normalized.hora = hora;
  }

  return normalized;
};

export const sanitizeSpecialDatesCollection = (specialDates) => {
  const seen = new Set();

  return (specialDates || [])
    .map((specialDate) => normalizeSpecialDate(specialDate))
    .filter(Boolean)
    .filter((specialDate) => {
      if (seen.has(specialDate.id)) {
        return false;
      }

      seen.add(specialDate.id);
      return true;
    })
    .slice(0, MAX_SPECIAL_DATES);
};

export const pruneExpiredOneTimeSpecialDates = (specialDates, todayKey = sanitizeIsoDateKey(new Date(), '')) => (
  sanitizeSpecialDatesCollection(specialDates)
    .filter((specialDate) => specialDate.frequencia || specialDate.data >= todayKey)
);

export const occursOnIsoDate = (specialDate, isoDateKey) => {
  const normalizedSpecialDate = normalizeSpecialDate(specialDate);

  if (!normalizedSpecialDate || !sanitizeIsoDateKey(isoDateKey, '')) {
    return false;
  }

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

  if (!normalizedSpecialDate) {
    return false;
  }

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
