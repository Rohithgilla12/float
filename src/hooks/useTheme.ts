import { useState, useEffect } from 'react';
import { ThemeId, THEMES } from '../types/theme';

const THEME_STORAGE_KEY = 'float_notes_theme_v1';

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId;
      if (saved && THEMES[saved]) return saved;
    } catch {}
    return 'obsidian';
  });

  const setTheme = (newTheme: ThemeId) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {}
  };

  const toggleLightDark = () => {
    const current = THEMES[theme];
    if (current.isDark) {
      setTheme('latte');
    } else {
      setTheme('obsidian');
    }
  };

  useEffect(() => {
    // Also update document root class
    const root = document.documentElement;
    Object.keys(THEMES).forEach(t => root.classList.remove(`theme-${t}`));
    root.classList.add(`theme-${theme}`);
  }, [theme]);

  return {
    theme,
    themeConfig: THEMES[theme],
    setTheme,
    toggleLightDark,
    allThemes: Object.values(THEMES),
  };
}
