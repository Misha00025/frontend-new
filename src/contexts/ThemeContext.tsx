import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ThemeConfig, PresetTheme, CustomColors } from '../types/theme';
import { DEFAULT_THEME } from '../types/theme';
import {
  computeBgSecondary,
  computeTextSecondary,
  computeBorderColor,
  computeDangerColor,
  computeTextOnAccent,
  computeTextShadow,
} from '../utils/color';

interface ThemeContextType {
  themeConfig: ThemeConfig;
  setThemeConfig: (config: ThemeConfig) => void;
  setPreset: (name: PresetTheme) => void;
  setCustomColors: (colors: CustomColors) => void;
  getCurrentColors: () => CustomColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Цвета всех пресетов (используются для превью в UI)
export const PRESET_COLORS: Record<PresetTheme, CustomColors> = {
  clean: { bgPrimary: '#ffffff', textPrimary: '#000000', accentColor: '#2c2c2c' },
  dark: { bgPrimary: '#1a1a1a', textPrimary: '#ffffff', accentColor: '#545454' },
  ocean: { bgPrimary: '#e8f4f8', textPrimary: '#1a3a4a', accentColor: '#2e86ab' },
  forest: { bgPrimary: '#eaf7e1', textPrimary: '#2d3e1f', accentColor: '#4a7c3f' },
  sunset: { bgPrimary: '#fdf0e0', textPrimary: '#4a2512', accentColor: '#c96b3e' },
  lavender: { bgPrimary: '#f3eef9', textPrimary: '#2e1a47', accentColor: '#7a4fa0' },
  'forest-dark': { bgPrimary: '#1a1a1a', textPrimary: '#ffffff', accentColor: '#4aa334' },
  'ocean-dark': { bgPrimary: '#1a1a1a', textPrimary: '#d0e4f0', accentColor: '#3a9ec4' },
  'sunset-dark': { bgPrimary: '#1a1a1a', textPrimary: '#f0ddd0', accentColor: '#d08040' },
  'lavender-dark': { bgPrimary: '#1a1a1a', textPrimary: '#ddd0f0', accentColor: '#9060c0' },
};

function applyPreset(name: PresetTheme) {
  document.documentElement.setAttribute('data-theme', name);
  const existing = document.getElementById('custom-theme-styles');
  if (existing) existing.remove();
}

function applyCustom(colors: CustomColors) {
  document.documentElement.removeAttribute('data-theme');
  let styleEl = document.getElementById('custom-theme-styles') as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'custom-theme-styles';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = `
    :root {
      --bg-primary: ${colors.bgPrimary};
      --bg-secondary: ${computeBgSecondary(colors.bgPrimary)};
      --text-primary: ${colors.textPrimary};
      --text-secondary: ${computeTextSecondary(colors.textPrimary)};
      --accent-color: ${colors.accentColor};
      --border-color: ${computeBorderColor(colors.bgPrimary, colors.textPrimary)};
      --danger-color: ${computeDangerColor(colors.accentColor)};
      --text-on-accent: ${computeTextOnAccent(colors.accentColor)};
      --text-shadow: ${computeTextShadow(colors.bgPrimary, colors.textPrimary)};
    }
  `;
}

function applyConfig(config: ThemeConfig) {
  if (config.type === 'preset') {
    applyPreset(config.name);
  } else {
    applyCustom(config.colors);
  }
}

function readConfigFromStorage(): ThemeConfig {
  try {
    // Миграция со старой системы (ключ 'theme' со значением 'light'/'dark')
    const oldTheme = localStorage.getItem('theme');
    if (oldTheme) {
      localStorage.removeItem('theme');
      const newName: PresetTheme = oldTheme === 'light' ? 'clean' : oldTheme as PresetTheme;
      const newConfig: ThemeConfig = { type: 'preset', name: newName };
      localStorage.setItem('themeConfig', JSON.stringify(newConfig));
      return newConfig;
    }

    const raw = localStorage.getItem('themeConfig');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.type === 'preset') {
        // Миграция: 'light' больше не существует, заменяем на 'clean'
        if (parsed.name === 'light') {
          const migrated: ThemeConfig = { type: 'preset', name: 'clean' };
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
      return PRESET_COLORS['clean'];
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
