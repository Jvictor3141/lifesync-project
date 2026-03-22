import { safeDate, toAgendaDateKey, toIsoDateKey } from '@/shared/lib/date';

export const AGENDA_DATE_KEY_REGEX = /^[A-Z][a-z]{2} [A-Z][a-z]{2} \d{2} \d{4}$/;
export const ISO_DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
export const ISO_MONTH_KEY_REGEX = /^\d{4}-\d{2}$/;
export const TIME_24H_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
export const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

export const MAX_TEXT_LENGTHS = {
  task: 160,
  transactionDescription: 140,
  specialDateName: 80,
  displayName: 60,
  genericId: 120,
  email: 320,
};

export const MAX_PROFILE_IMAGE_FILE_BYTES = 700 * 1024;
export const MAX_PROFILE_IMAGE_DATA_URL_LENGTH = 950000;
export const MAX_REMOTE_IMAGE_URL_LENGTH = 2048;
export const ALLOWED_PROFILE_IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp,image/gif';

const PROFILE_IMAGE_DATA_URL_REGEX = /^data:image\/(?:png|jpeg|jpg|gif|webp);base64,[A-Za-z0-9+/=]+$/i;
const ALLOWED_PROFILE_IMAGE_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
]);

export const clampString = (value, maxLength) => String(value ?? '').slice(0, maxLength);

export const normalizeSingleLineText = (value, maxLength) => (
  clampString(String(value ?? '').replace(/\s+/g, ' ').trim(), maxLength)
);

export const sanitizeLooseId = (value, fallback = '') => (
  normalizeSingleLineText(value, MAX_TEXT_LENGTHS.genericId) || fallback
);

export const isAgendaDateKey = (value) => (
  typeof value === 'string' && AGENDA_DATE_KEY_REGEX.test(value)
);

export const isIsoDateKey = (value) => (
  typeof value === 'string' && ISO_DATE_KEY_REGEX.test(value)
);

export const isFinanceMonthKey = (value) => (
  typeof value === 'string' && ISO_MONTH_KEY_REGEX.test(value)
);

export const isTimeValue = (value) => (
  typeof value === 'string' && TIME_24H_REGEX.test(value)
);

export const isHexColor = (value) => (
  typeof value === 'string' && HEX_COLOR_REGEX.test(value.trim())
);

export const sanitizeHexColor = (value, fallback = '#000000') => {
  const normalized = typeof value === 'string' ? value.trim().toUpperCase() : '';
  return HEX_COLOR_REGEX.test(normalized) ? normalized : fallback;
};

export const sanitizeTimeValue = (value, fallback = '') => (
  isTimeValue(value) ? value : fallback
);

const tryParseDate = (value) => {
  const parsed = safeDate(value, null);
  return parsed instanceof Date && !Number.isNaN(parsed.getTime()) ? parsed : null;
};

export const sanitizeAgendaDateKey = (value, fallback = '') => {
  if (isAgendaDateKey(value)) {
    return value;
  }

  const parsed = tryParseDate(value);
  return parsed ? toAgendaDateKey(parsed) : fallback;
};

export const sanitizeIsoDateKey = (value, fallback = '') => {
  if (isIsoDateKey(value)) {
    return value;
  }

  const parsed = tryParseDate(value);
  return parsed ? toIsoDateKey(parsed) : fallback;
};

export const sanitizeFinanceMonthKey = (value, fallback = '') => {
  if (isFinanceMonthKey(value)) {
    return value;
  }

  const parsed = tryParseDate(value);
  return parsed ? toIsoDateKey(parsed).slice(0, 7) : fallback;
};

export const normalizeEmail = (value) => (
  clampString(String(value ?? '').trim().toLowerCase(), MAX_TEXT_LENGTHS.email)
);

export const isValidEmailAddress = (value) => (
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value))
);

export const sanitizeDisplayName = (value) => (
  normalizeSingleLineText(value, MAX_TEXT_LENGTHS.displayName)
);

// Remote URLs and uploaded data URLs are both untrusted input. Restrict them to
// predictable image schemes so they never become an execution vector.
export const sanitizeProfilePhotoUrl = (value) => {
  const normalized = String(value ?? '').trim();

  if (!normalized) {
    return '';
  }

  if (
    PROFILE_IMAGE_DATA_URL_REGEX.test(normalized)
    && normalized.length <= MAX_PROFILE_IMAGE_DATA_URL_LENGTH
  ) {
    return normalized;
  }

  if (normalized.length > MAX_REMOTE_IMAGE_URL_LENGTH) {
    return '';
  }

  try {
    const url = new URL(normalized);
    return (url.protocol === 'https:' || url.protocol === 'http:') ? url.toString() : '';
  } catch {
    return '';
  }
};

export const validateProfileImageFile = (file) => {
  if (!file) {
    return { ok: false, error: 'Selecione uma imagem válida.' };
  }

  if (!ALLOWED_PROFILE_IMAGE_MIME_TYPES.has(file.type)) {
    return {
      ok: false,
      error: 'Use uma imagem PNG, JPG, WEBP ou GIF.',
    };
  }

  if (file.size > MAX_PROFILE_IMAGE_FILE_BYTES) {
    return {
      ok: false,
      error: 'A imagem deve ter no máximo 700 KB.',
    };
  }

  return { ok: true };
};
