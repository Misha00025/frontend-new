import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ThemeConfig, PresetTheme, CustomColors } from '../types/theme';
import { DEFAULT_THEME } from '../types/theme';

interface ThemeContextType {
  themeConfig: ThemeConfig;
  setThemeConfig: (config: ThemeConfig) => void;
  setPreset: (name: PresetTheme) => void;
  setCustomColors: (colors: CustomColors) => void;
  /** Возвращает цвета текущей темы (для превью в UI) */
  getCurrentColors: () => CustomColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Цвета всех пресетов (используются для превью в UI)
export const PRESET_COLORS: Record<PresetTheme, CustomColors> = {
  dark: { bgPrimary: '#1a1a1a', textPrimary: '#ffffff', accentColor: '#4aa334' },
  ocean: { bgPrimary: '#e8f4f8', textPrimary: '#1a3a4a', accentColor: '#2e86ab' },
  forest: { bgPrimary: '#eaf7e1', textPrimary: '#2d3e1f', accentColor: '#4a7c3f' },
  sunset: { bgPrimary: '#fdf0e0', textPrimary: '#4a2512', accentColor: '#c96b3e' },
  lavender: { bgPrimary: '#f3eef9', textPrimary: '#2e1a47', accentColor: '#7a4fa0' },
  'forest-dark': { bgPrimary: '#1a2e1a', textPrimary: '#d4e8c8', accentColor: '#5a9a4f' },
  'ocean-dark': { bgPrimary: '#0d2137', textPrimary: '#d0e4f0', accentColor: '#3a9ec4' },
  'sunset-dark': { bgPrimary: '#2a1a12', textPrimary: '#f0ddd0', accentColor: '#d08040' },
  'lavender-dark': { bgPrimary: '#1e1430', textPrimary: '#ddd0f0', accentColor: '#9060c0' },
};

function applyConfig(config: ThemeConfig) {
  if (config.type === 'preset') {
    document.documentElement.setAttribute('data-theme', config.name);
    // Удаляем кастомные стили, если были
    const existing = document.getElementById('custom-theme-styles');
    if (existing) existing.remove();
  } else {
    document.documentElement.removeAttribute('data-theme');
    // Устанавливаем кастомные переменные через style
    let styleEl = document.getElementById('custom-theme-styles') as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'custom-theme-styles';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `
      :root {
        --bg-primary: ${config.colors.bgPrimary};
        --text-primary: ${config.colors.textPrimary};
        --accent-color: ${config.colors.accentColor};
      }
    `;
  }
}

function readConfigFromStorage(): ThemeConfig {
  try {
    // Миграция со старой системы (ключ 'theme' со значением 'light'/'dark')
    const oldTheme = localStorage.getItem('theme');
    if (oldTheme) {
      localStorage.removeItem('theme');
      const newName: PresetTheme = oldTheme === 'light' ? 'forest' : oldTheme as PresetTheme;
      const newConfig: ThemeConfig = { type: 'preset', name: newName };
      localStorage.setItem('themeConfig', JSON.stringify(newConfig));
      return newConfig;
    }

    const raw = localStorage.getItem('themeConfig');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.type === 'preset') {
        // Миграция: 'light' больше не существует, заменяем на 'forest'
        if (parsed.name === 'light') {
          const migrated: ThemeConfig = { type: 'preset', name: 'forest' };
          localStorage.setItem('themeConfig', JSON.stringify(migrated));
          return migrated;
        }
        return parsed as ThemeConfig;
      }
      if (parsed.type === 'custom') {
        return parsed as ThemeConfig;
      }
    }
  } catch { /* ignore */ }
  return DEFAULT_THEME;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeConfig, setThemeConfigState] = useState<ThemeConfig>(() => {
    const config = readConfigFromStorage();
    return config;
  });

  // Применяем тему при монтировании и при изменении
  useEffect(() => {
    applyConfig(themeConfig);
  }, [themeConfig]);

  const setThemeConfig = useCallback((config: ThemeConfig) => {
    localStorage.setItem('themeConfig', JSON.stringify(config));
    setThemeConfigState(config);
  }, []);

  const setPreset = useCallback((name: PresetTheme) => {
    setThemeConfig({ type: 'preset', name });
  }, [setThemeConfig]);

  const setCustomColors = useCallback((colors: CustomColors) => {
    setThemeConfig({ type: 'custom', colors });
  }, [setThemeConfig]);

  const getCurrentColors = useCallback((): CustomColors => {
    if (themeConfig.type === 'preset') {
      const colors = PRESET_COLORS[themeConfig.name];
      if (colors) return colors;
      return PRESET_COLORS['forest'];
    }
    return themeConfig.colors;
  }, [themeConfig]);

  return (
    <ThemeContext.Provider value={{ themeConfig, setThemeConfig, setPreset, setCustomColors, getCurrentColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
