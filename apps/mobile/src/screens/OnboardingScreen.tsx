import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Logo } from '../components/ui';
import { useTheme } from '../hooks/useTheme';
import type { RootStackScreenProps } from '../navigation/types';

export function OnboardingScreen(_props: RootStackScreenProps<'Onboarding'>) {
  const { resolvedTheme, tokens } = useTheme();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: tokens.bg }]}>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
      <View style={styles.content}>
        <Logo size={56} />
        <Text style={[styles.title, { color: tokens.text }]}>Welcome to LendLedger</Text>
        <Text style={[styles.subtitle, { color: tokens.textSoft }]}>
          Track daily repayments, loanees, and collections in one place. Full onboarding flow
          ships in Task 10.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 300,
  },
});
