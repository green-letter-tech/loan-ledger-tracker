import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../hooks/useTheme';

interface EmptyStateProps {
  title: string;
  subtitle: string;
  children?: ReactNode;
}

export function EmptyState({ title, subtitle, children }: EmptyStateProps) {
  const { tokens } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: tokens.blueTint,
            borderColor: tokens.borderSoft,
          },
        ]}
      >
        <Text style={[styles.iconGlyph, { color: tokens.blue }]}>₹</Text>
      </View>
      <Text style={[styles.title, { color: tokens.text }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: tokens.textSoft }]}>{subtitle}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
    gap: 8,
  },
  iconWrap: {
    width: 110,
    height: 110,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
  },
  iconGlyph: {
    fontSize: 48,
    fontWeight: '600',
  },
  title: {
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14.5,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: 10,
  },
});
