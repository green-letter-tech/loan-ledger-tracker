import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Logo } from './ui';
import { useTheme } from '../hooks/useTheme';

interface TabScreenLayoutProps {
  title: string;
  subtitle?: string;
  headerRight?: ReactNode;
  children: ReactNode;
}

export function TabScreenLayout({ title, subtitle, headerRight, children }: TabScreenLayoutProps) {
  const { resolvedTheme, tokens } = useTheme();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: tokens.bg }]} edges={['top']}>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
      <View style={styles.header}>
        <Logo size={40} />
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: tokens.text }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: tokens.textSoft }]}>{subtitle}</Text>
          ) : null}
        </View>
        {headerRight}
      </View>
      <View style={styles.body}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  body: {
    flex: 1,
  },
});
