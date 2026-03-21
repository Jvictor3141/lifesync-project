import { useEffect, useState } from 'react';
import { STORAGE_KEYS, readLocalStorage, writeLocalStorage } from '@/shared/lib/local-storage';

const syncDocumentTheme = (isDark) => {
  document.documentElement.classList.toggle('dark', isDark);
};

export const useThemePreference = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = readLocalStorage(STORAGE_KEYS.theme, 'light');
    const nextIsDark = savedTheme === 'dark';
    setIsDark(nextIsDark);
    syncDocumentTheme(nextIsDark);
  }, []);

  const setTheme = (theme) => {
    const nextIsDark = theme === 'dark';
    setIsDark(nextIsDark);
    syncDocumentTheme(nextIsDark);
    writeLocalStorage(STORAGE_KEYS.theme, theme);
  };

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return { isDark, setTheme, toggleTheme };
};
