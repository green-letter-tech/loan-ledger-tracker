import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme, type ColorSchemeName } from 'react-native';

import { getTokensForTheme } from './tokens';
import type { ResolvedTheme, ThemeContextValue, ThemePreference } from './types';

export const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
  /** Hydrated from `owner_settings.theme` once repository exists (Task 8+). */
  initialPreference?: ThemePreference;
}

function resolveTheme(
  preference: ThemePreference,
  systemScheme: ColorSchemeName,
): ResolvedTheme {
  if (preference === 'system') {
    return systemScheme === 'dark' ? 'dark' : 'light';
  }
  return preference;
}

export function ThemeProvider({
  children,
  initialPreference = 'system',
}: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const [themePreference, setThemePreferenceState] =
    useState<ThemePreference>(initialPreference);

  const resolvedTheme = resolveTheme(themePreference, systemScheme);
  const tokens = getTokensForTheme(resolvedTheme);

  const setThemePreference = useCallback((preference: ThemePreference) => {
    setThemePreferenceState(preference);
    // Persist via LoanRepository.updateSettings() in Task 11.
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      themePreference,
      resolvedTheme,
      tokens,
      setThemePreference,
    }),
    [themePreference, resolvedTheme, tokens, setThemePreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
