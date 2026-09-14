import type { ThemeTokens } from './tokens';

export type ThemePreference = 'light' | 'dark' | 'system';

export type ResolvedTheme = 'light' | 'dark';

export interface ThemeContextValue {
  themePreference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  tokens: ThemeTokens;
  setThemePreference: (preference: ThemePreference) => void;
}
