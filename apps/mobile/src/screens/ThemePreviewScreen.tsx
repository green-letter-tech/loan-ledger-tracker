import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../hooks/useTheme';
import type { ThemePreference } from '../theme/types';

const PREFERENCES: ThemePreference[] = ['light', 'dark', 'system'];

const SWATCHES = ['blue', 'green', 'amber', 'red'] as const;

export function ThemePreviewScreen() {
  const { themePreference, resolvedTheme, tokens, setThemePreference } = useTheme();

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: tokens.bg }]}
      contentContainerStyle={styles.content}
    >
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
      <Text style={[styles.title, { color: tokens.text }]}>LendLedger theme</Text>
      <Text style={[styles.subtitle, { color: tokens.textSoft }]}>
        Task 5 preview — full screens arrive in Tasks 6–12.
      </Text>

      <View style={[styles.card, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
        <Text style={[styles.label, { color: tokens.textFaint }]}>Appearance</Text>
        <View style={styles.row}>
          {PREFERENCES.map((preference) => {
            const active = themePreference === preference;
            return (
              <Pressable
                key={preference}
                onPress={() => setThemePreference(preference)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? tokens.blueTint : tokens.surface2,
                    borderColor: active ? tokens.blue : tokens.borderSoft,
                  },
                ]}
              >
                <Text style={{ color: active ? tokens.blue : tokens.textSoft, fontWeight: '600' }}>
                  {preference}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={[styles.meta, { color: tokens.textFaint }]}>
          Preference: {themePreference} · Resolved: {resolvedTheme}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
        <Text style={[styles.label, { color: tokens.textFaint }]}>Brand swatches</Text>
        <View style={styles.swatchRow}>
          {SWATCHES.map((name) => (
            <View key={name} style={styles.swatchItem}>
              <View style={[styles.swatch, { backgroundColor: tokens[name] }]} />
              <Text style={[styles.swatchLabel, { color: tokens.textSoft }]}>{name}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: tokens.greenTint, borderColor: tokens.border }]}>
        <Text style={[styles.sampleAmount, { color: tokens.green }]}>₹3.00/day</Text>
        <Text style={[styles.meta, { color: tokens.textSoft }]}>
          Calculator output styling uses theme tokens (not hardcoded hex).
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 20, paddingTop: 56, gap: 16 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, lineHeight: 22, marginBottom: 8 },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  label: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  meta: { fontSize: 13 },
  swatchRow: { flexDirection: 'row', gap: 16 },
  swatchItem: { alignItems: 'center', gap: 6 },
  swatch: { width: 40, height: 40, borderRadius: 12 },
  swatchLabel: { fontSize: 12, fontWeight: '600' },
  sampleAmount: { fontSize: 24, fontWeight: '800' },
});
