import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { LoanRepository, OwnerSettings } from '@lendledger/core';

import { AppProvider } from './src/context/AppProvider';
import { createLocalLoanRepository } from './src/data/repositories/LoanRepository';
import { useTheme } from './src/hooks/useTheme';
import { RootNavigator } from './src/navigation/RootNavigator';
import { BootstrapScreen } from './src/screens/BootstrapScreen';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { darkTokens, lightTokens } from './src/theme/tokens';

const navigationLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: lightTokens.blue,
    background: lightTokens.bg,
    card: lightTokens.bgElev,
    text: lightTokens.text,
    border: lightTokens.border,
  },
};

const navigationDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: darkTokens.blue,
    background: darkTokens.bg,
    card: darkTokens.bgElev,
    text: darkTokens.text,
    border: darkTokens.border,
  },
};

type BootstrapState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; repository: LoanRepository; settings: OwnerSettings };

export default function App() {
  const [bootstrap, setBootstrap] = useState<BootstrapState>({ status: 'loading' });

  useEffect(() => {
    createLocalLoanRepository()
      .then(async (repository) => {
        const settings = await repository.getSettings();
        setBootstrap({ status: 'ready', repository, settings });
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        setBootstrap({ status: 'error', message });
      });
  }, []);

  if (bootstrap.status === 'loading' || bootstrap.status === 'error') {
    return (
      <SafeAreaProvider>
        <ThemeProvider initialPreference="system">
          <BootstrapScreen error={bootstrap.status === 'error' ? bootstrap.message : null} />
        </ThemeProvider>
      </SafeAreaProvider>
    );
  }

  const { repository, settings } = bootstrap;

  return (
    <SafeAreaProvider>
      <AppProvider repository={repository}>
        <ThemeProvider initialPreference={settings.theme}>
          <AppNavigation onboarded={settings.onboarded} />
        </ThemeProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}

function AppNavigation({ onboarded }: { onboarded: boolean }) {
  const { resolvedTheme } = useTheme();
  const navigationTheme = useMemo(
    () => (resolvedTheme === 'dark' ? navigationDarkTheme : navigationLightTheme),
    [resolvedTheme],
  );

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootNavigator onboarded={onboarded} />
    </NavigationContainer>
  );
}
