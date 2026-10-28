import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_THEME_KEY = '@mmm_asistencia_theme_mode';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface ThemeColors {
  bg: string;
  bgSecondary: string;
  card: string;
  cardDeep: string;
  cardBorder: string;
  cardBorderActive: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryDark: string;
  indigo: string;
  accent: string;
  cyan: string;
  success: string;
  successBg: string;
  successBorder: string;
  warning: string;
  warningBg: string;
  warningBorder: string;
  danger: string;
  dangerBg: string;
  dangerBorder: string;
  pinkBg: string;
  pinkBorder: string;
  pinkText: string;
  inputBg: string;
  inputBorder: string;
  badgeBg: string;
  badgeText: string;
  separator: string;
  logo: any;
}

// TEMA OSCURO (HUD OFICIAL DE LA WEB ESCANEAR.TSX)
const darkColors: ThemeColors = {
  bg: '#020617',          // bg-slate-950
  bgSecondary: '#0f172a', // bg-slate-900
  card: '#0f172a',        // bg-slate-900
  cardDeep: '#020617',    // bg-slate-950
  cardBorder: '#1e293b',  // border-slate-800
  cardBorderActive: '#6366f1', // border-indigo-500
  text: '#ffffff',        // text-white
  textSecondary: '#94a3b8', // text-slate-400
  textMuted: '#64748b',   // text-slate-500
  primary: '#4f46e5',     // bg-indigo-600
  primaryDark: '#4338ca', // bg-indigo-700
  indigo: '#6366f1',      // text-indigo-400
  accent: '#22d3ee',      // cyan-400 neon
  cyan: '#06b6d4',
  success: '#10b981',     // emerald-500
  successBg: 'rgba(6, 78, 59, 0.7)', // bg-emerald-950/70
  successBorder: 'rgba(16, 185, 129, 0.4)',
  warning: '#f59e0b',     // amber-500
  warningBg: 'rgba(120, 53, 15, 0.6)',
  warningBorder: 'rgba(245, 158, 11, 0.4)',
  danger: '#f43f5e',      // rose-500
  dangerBg: 'rgba(136, 19, 55, 0.6)',
  dangerBorder: 'rgba(244, 63, 94, 0.4)',
  pinkBg: 'rgba(80, 7, 36, 0.5)', // bg-pink-950/50
  pinkBorder: 'rgba(236, 72, 153, 0.35)',
  pinkText: '#f472b6',
  inputBg: '#020617',
  inputBorder: '#334155',
  badgeBg: '#1e293b',
  badgeText: '#cbd5e1',
  separator: '#1e293b',
  logo: require('../../assets/logo_light.png'), // Logo blanco oficial para Dark Mode
};

// TEMA CLARO (LIMPIO, ELEGANTE E INSTITUCIONAL CON LOGO A COLOR)
const lightColors: ThemeColors = {
  bg: '#f8fafc',          // bg-slate-50
  bgSecondary: '#ffffff', // bg-white
  card: '#ffffff',        // bg-white
  cardDeep: '#f1f5f9',    // bg-slate-100
  cardBorder: '#e2e8f0',  // border-slate-200
  cardBorderActive: '#4f46e5', // border-indigo-600
  text: '#0f172a',        // text-slate-900
  textSecondary: '#475569', // text-slate-600
  textMuted: '#94a3b8',   // text-slate-400
  primary: '#4f46e5',     // bg-indigo-600
  primaryDark: '#4338ca',
  indigo: '#4f46e5',
  accent: '#0284c7',      // sky-600
  cyan: '#0284c7',
  success: '#059669',     // emerald-600
  successBg: '#ecfdf5',   // emerald-50
  successBorder: '#a7f3d0',
  warning: '#d97706',     // amber-600
  warningBg: '#fffbeb',
  warningBorder: '#fde68a',
  danger: '#e11d48',      // rose-600
  dangerBg: '#fff1f2',
  dangerBorder: '#fecdd3',
  pinkBg: '#fdf2f8',      // pink-50
  pinkBorder: '#fbcfe8',
  pinkText: '#db2777',    // pink-600
  inputBg: '#ffffff',
  inputBorder: '#cbd5e1', // border-slate-300
  badgeBg: '#e2e8f0',
  badgeText: '#334155',
  separator: '#e2e8f0',
  logo: require('../../assets/logo_color.png'), // Logo oficial a color para Light Mode
};

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setThemeMode: (mode: ThemeMode) => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'system',
  isDark: true,
  colors: darkColors,
  setThemeMode: () => {},
  cycleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_THEME_KEY).then((saved) => {
      if (saved === 'dark' || saved === 'light' || saved === 'system') {
        setThemeModeState(saved as ThemeMode);
      }
    });
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem(STORAGE_THEME_KEY, mode);
  };

  const cycleTheme = () => {
    setThemeModeState((prev) => {
      let next: ThemeMode = 'system';
      if (prev === 'system') next = 'dark';
      else if (prev === 'dark') next = 'light';
      else if (prev === 'light') next = 'system';

      AsyncStorage.setItem(STORAGE_THEME_KEY, next);
      return next;
    });
  };

  // Determinar si el tema activo efectivo es oscuro
  const isDark =
    themeMode === 'system'
      ? systemScheme === 'dark'
      : themeMode === 'dark';

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ themeMode, isDark, colors, setThemeMode, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
