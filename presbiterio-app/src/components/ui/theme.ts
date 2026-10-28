import { Platform } from 'react-native';
import {
  currentActiveTokens,
  ThemeTokens,
  getThemeTokens,
  PRIMARY_COLOR_PRESETS,
  DEFAULT_PRIMARY_COLOR,
  ThemeMode,
  ResolvedTheme,
  ThemeProvider,
  useTheme,
} from '../../context/ThemeContext';

export {
  ThemeTokens,
  getThemeTokens,
  PRIMARY_COLOR_PRESETS,
  DEFAULT_PRIMARY_COLOR,
  ThemeMode,
  ResolvedTheme,
  ThemeProvider,
  useTheme,
};

export { MdiIcon, Icon } from './Icon';

/**
 * Dynamic proxy token object so existing files importing `ui`
 * automatically reflect the active theme in real time.
 */
export const ui: ThemeTokens = new Proxy({} as ThemeTokens, {
  get: (_, prop: string) => (currentActiveTokens as any)[prop],
});

export const radius = {
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  full: 999,
};

export const fonts = {
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }) as string,
};

/** Removes the default browser focus outline on web (we render our own ring). */
export const noOutline: any = Platform.OS === 'web' ? { outlineStyle: 'none', outline: 'none' } : {};
