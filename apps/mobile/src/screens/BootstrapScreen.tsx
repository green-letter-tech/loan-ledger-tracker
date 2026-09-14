import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Logo } from '../components/ui';
import { useTheme } from '../hooks/useTheme';

interface BootstrapScreenProps {
  error?: string | null;
}

export function BootstrapScreen({ error }: BootstrapScreenProps) {
  const { resolvedTheme, tokens } = useTheme();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: tokens.bg }]}>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
      <View style={styles.content}>
        <Logo size={52} />
        <Text style={[styles.title, { color: tokens.text }]}>LendLedger</Text>
        {error ? (
          <Text style={[styles.error, { color: tokens.red }]}>{error}</Text>
        ) : (
          <ActivityIndicator color={tokens.blue} style={styles.spinner} />
        )}
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
    gap: 12,
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  spinner: {
    marginTop: 8,
  },
  error: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
  },
});
