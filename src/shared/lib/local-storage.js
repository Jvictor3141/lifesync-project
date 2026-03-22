export const STORAGE_KEYS = {
  theme: 'theme',
  profilePhoto: 'profilePhotoURL',
};

const canUseStorage = () => typeof window !== 'undefined';

export const readLocalStorage = (key, fallback = '') => {
  if (!canUseStorage()) {
    return fallback;
  }

  try {
    const value = window.localStorage.getItem(key);
    return value ?? fallback;
  } catch {
    return fallback;
  }
};

export const writeLocalStorage = (key, value) => {
  if (!canUseStorage()) {
    return false;
  }

  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};

export const removeLocalStorage = (key) => {
  if (!canUseStorage()) {
    return false;
  }

  try {
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
};
