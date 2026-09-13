import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../hooks/useTheme';

interface StackPlaceholderScreenProps {
  title: string;
  detail?: string;
}

export function StackPlaceholderScreen({ title, detail }: StackPlaceholderScreenProps) {
  const { resolvedTheme, tokens } = useTheme();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: tokens.bg }]} edges={['bottom']}>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
      <View style={styles.content}>
        <Text style={[styles.title, { color: tokens.text }]}>{title}</Text>
        <Text style={[styles.detail, { color: tokens.textSoft }]}>
          {detail ?? 'Screen content ships in a later task.'}
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
    paddingHorizontal: 28,
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  detail: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    maxWidth: 280,
  },
});
