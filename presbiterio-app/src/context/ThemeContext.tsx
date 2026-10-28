import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { useColorScheme, Platform } from 'react-native';
import { secureStorage } from '../services/secureStore';

export type ThemeMode = 'dark' | 'light' | 'system';
export type ResolvedTheme = 'dark' | 'light';

export interface ThemeTokens {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  muted: string;
  mutedForeground: string;
  subtle: string;
  accent: string;
  accentForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  border: string;
  input: string;
  ring: string;
  ringSoft: string;
  destructive: string;
  destructiveForeground: string;
  destructiveSoft: string;
  destructiveBorder: string;
  success: string;
  successSoft: string;
  warning: string;
  brand: string;
  brandSoft: string;
}

export interface PrimaryColorOption {
  id: string;
  label: string;
  hex: string;
  hexLight: string;
  desc: string;
}

export const PRIMARY_COLOR_PRESETS: PrimaryColorOption[] = [
  {
    id: 'mmm-blue',
    label: 'Azul Institucional MMM',
    hex: '#0284C7',
    hexLight: '#0369A1',
    desc: 'Identidad oficial MMM Venezuela',
  },
  {
    id: 'cobalt',
    label: 'Azul Cobalto Eléctrico',
    hex: '#3B82F6',
    hexLight: '#2563EB',
    desc: 'Estilo Ejecutivo Moderno',
  },
  {
    id: 'cyan',
    label: 'Cian Neón',
    hex: '#00F0FF',
    hexLight: '#0891B2',
    desc: 'Alta visibilidad nocturna',
  },
  {
    id: 'emerald',
    label: 'Esmeralda Vital',
    hex: '#10B981',
    hexLight: '#059669',
    desc: 'Operatividad & Asistencia',
  },
  {
    id: 'purple',
    label: 'Púrpura Pastoral',
    hex: '#8B5CF6',
    hexLight: '#7C3AED',
    desc: 'Liderazgo & Supervisión',
  },
  {
    id: 'amber',
    label: 'Ámbar Oro',
    hex: '#F59E0B',
    hexLight: '#D97706',
    desc: 'Consejo Nacional',
  },
];

export const DEFAULT_PRIMARY_COLOR = '#0284C7';

function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return `rgba(0, 240, 255, ${alpha})`;
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getThemeTokens(mode: ResolvedTheme, customPrimary = DEFAULT_PRIMARY_COLOR): ThemeTokens {
  const isDark = mode === 'dark';
  
  // Find matching preset for light contrast optimization if applicable
  const preset = PRIMARY_COLOR_PRESETS.find(p => p.hex.toLowerCase() === customPrimary.toLowerCase());
  const activeBrandColor = isDark ? customPrimary : (preset ? preset.hexLight : customPrimary);

  if (isDark) {
    return {
      background: '#09090B',
      foreground: '#FAFAFA',
      card: '#0C0C0F',
      cardForeground: '#FAFAFA',
      popover: '#09090B',
      muted: '#18181B',
      mutedForeground: '#A1A1AA',
      subtle: '#71717A',
      accent: '#27272A',
      accentForeground: '#FAFAFA',
      primary: '#FAFAFA',
      primaryForeground: '#18181B',
      secondary: '#27272A',
      secondaryForeground: '#FAFAFA',
      border: '#27272A',
      input: '#18181B',
      ring: '#D4D4D8',
      ringSoft: 'rgba(212, 212, 216, 0.18)',
      destructive: '#EF4444',
      destructiveForeground: '#FCA5A5',
      destructiveSoft: 'rgba(239, 68, 68, 0.12)',
      destructiveBorder: 'rgba(239, 68, 68, 0.45)',
      success: '#22C55E',
      successSoft: 'rgba(34, 197, 94, 0.12)',
      warning: '#F59E0B',
      brand: activeBrandColor,
      brandSoft: hexToRgba(activeBrandColor, 0.12),
    };
  } else {
    // High-contrast clean zinc/slate light mode
    return {
      background: '#F8FAFC',
      foreground: '#0F172A',
      card: '#FFFFFF',
      cardForeground: '#0F172A',
      popover: '#FFFFFF',
      muted: '#F1F5F9',
      mutedForeground: '#64748B',
      subtle: '#94A3B8',
      accent: '#E2E8F0',
      accentForeground: '#0F172A',
      primary: '#0F172A',
      primaryForeground: '#FFFFFF',
      secondary: '#F1F5F9',
      secondaryForeground: '#0F172A',
      border: '#E2E8F0',
      input: '#FFFFFF',
      ring: activeBrandColor,
      ringSoft: hexToRgba(activeBrandColor, 0.15),
      destructive: '#DC2626',
      destructiveForeground: '#FFFFFF',
      destructiveSoft: 'rgba(220, 38, 38, 0.10)',
      destructiveBorder: 'rgba(220, 38, 38, 0.35)',
      success: '#16A34A',
      successSoft: 'rgba(22, 163, 74, 0.12)',
      warning: '#D97706',
      brand: activeBrandColor,
      brandSoft: hexToRgba(activeBrandColor, 0.10),
    };
  }
}

interface ThemeContextType {
  themeMode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  primaryColor: string;
  ui: ThemeTokens;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  setPrimaryColor: (hex: string) => Promise<void>;
  toggleTheme: () => Promise<void>;
  setUserId: (id: string | null) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'dark',
  resolvedTheme: 'dark',
  primaryColor: DEFAULT_PRIMARY_COLOR,
  ui: getThemeTokens('dark', DEFAULT_PRIMARY_COLOR),
  setThemeMode: async () => {},
  setPrimaryColor: async () => {},
  toggleTheme: async () => {},
  setUserId: () => {},
});

// Singleton active tokens cache to keep static imports in sync
export const currentActiveTokens: ThemeTokens = getThemeTokens('dark', DEFAULT_PRIMARY_COLOR);

function syncSingleton(tokens: ThemeTokens) {
  Object.assign(currentActiveTokens, tokens);
}

interface ThemeProviderProps {
  children: ReactNode;
  userId?: string | null;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, userId }) => {
  const systemColorScheme = useColorScheme();
  const [activeUserId, setActiveUserId] = useState<string | null>(userId ?? null);
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');
  const [primaryColor, setPrimaryColorState] = useState<string>(DEFAULT_PRIMARY_COLOR);

  useEffect(() => {
    if (userId !== undefined) {
      setActiveUserId(userId);
    }
  }, [userId]);

  const storageKey = useMemo(() => {
    return activeUserId ? `THEME_PREF_USER_${activeUserId}` : 'THEME_PREF_GLOBAL';
  }, [activeUserId]);

  // Load user preference on mount or when userId changes
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const saved = await secureStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.mode) setThemeModeState(parsed.mode);
          if (parsed.primaryColor) setPrimaryColorState(parsed.primaryColor);
        } else {
          // If no user-specific pref, check global
          const globalSaved = await secureStorage.getItem('THEME_PREF_GLOBAL');
          if (globalSaved) {
            const parsed = JSON.parse(globalSaved);
            if (parsed.mode) setThemeModeState(parsed.mode);
            if (parsed.primaryColor) setPrimaryColorState(parsed.primaryColor);
          }
        }
      } catch (e) {
        console.warn('[ThemeContext] Error loading theme preferences:', e);
      }
    };

    loadPreferences();
  }, [storageKey]);

  // Resolve active theme based on mode and device system settings
  const resolvedTheme: ResolvedTheme = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'light' ? 'light' : 'dark';
    }
    return themeMode;
  }, [themeMode, systemColorScheme]);

  // Compute UI theme tokens
  const ui = useMemo(() => {
    const tokens = getThemeTokens(resolvedTheme, primaryColor);
    syncSingleton(tokens);
    return tokens;
  }, [resolvedTheme, primaryColor]);

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      const data = { mode, primaryColor };
      await secureStorage.setItem(storageKey, JSON.stringify(data));
      await secureStorage.setItem('THEME_PREF_GLOBAL', JSON.stringify(data));
    } catch (e) {
      console.warn('[ThemeContext] Error saving theme mode:', e);
    }
  };

  const setPrimaryColor = async (hex: string) => {
    setPrimaryColorState(hex);
    try {
      const data = { mode: themeMode, primaryColor: hex };
      await secureStorage.setItem(storageKey, JSON.stringify(data));
      await secureStorage.setItem('THEME_PREF_GLOBAL', JSON.stringify(data));
    } catch (e) {
      console.warn('[ThemeContext] Error saving primary color:', e);
    }
  };

  const toggleTheme = async () => {
    const nextMode: ThemeMode = resolvedTheme === 'dark' ? 'light' : 'dark';
    await setThemeMode(nextMode);
  };

  const contextValue = useMemo(() => ({
    themeMode,
    resolvedTheme,
    primaryColor,
    ui,
    setThemeMode,
    setPrimaryColor,
    toggleTheme,
    setUserId: setActiveUserId,
  }), [themeMode, resolvedTheme, primaryColor, ui]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
