export const STORAGE_KEYS = {
  theme: 'theme',
  profilePhoto: 'profilePhotoURL',
};

export const readLocalStorage = (key, fallback = '') => {
  if (typeof window === 'undefined') {
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
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(key, value);
};

export const removeLocalStorage = (key) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(key);
};
