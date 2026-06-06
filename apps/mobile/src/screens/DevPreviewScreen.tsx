import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { initializeDatabase } from '../data/db/client';

import {
  Avatar,
  Card,
  Logo,
  PillButton,
  ProgressBar,
  StatusPill,
  type LoanStatusLabel,
} from '../components/ui';
import { useTheme } from '../hooks/useTheme';
import type { ThemePreference } from '../theme/types';

const PREFERENCES: ThemePreference[] = ['light', 'dark', 'system'];
const STATUSES: LoanStatusLabel[] = ['Paid', 'Unpaid', 'Partial', 'Active', 'Closed', 'Overdue'];

export function DevPreviewScreen() {
  const { themePreference, resolvedTheme, tokens, setThemePreference } = useTheme();
  const [dbStatus, setDbStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    initializeDatabase()
      .then(() => setDbStatus('ready'))
      .catch(() => setDbStatus('error'));
  }, []);

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: tokens.bg }]}
      contentContainerStyle={styles.content}
    >
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />

      <View style={styles.headerRow}>
        <Logo size={44} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: tokens.text }]}>LendLedger dev preview</Text>
          <Text style={[styles.subtitle, { color: tokens.textSoft }]}>
            Tasks 5–7 — theme, UI primitives, SQLite v1
          </Text>
          <Text style={[styles.meta, { color: tokens.textFaint }]}>
            Database: {dbStatus === 'loading' ? '…' : dbStatus === 'ready' ? 'ready' : 'error'}
          </Text>
        </View>
        <Avatar initials="RK" hue={254} />
      </View>

      <Card>
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
      </Card>

      <Card grad="blue" elev>
        <Text style={[styles.label, { color: tokens.textFaint }]}>Card · blue gradient</Text>
        <Text style={{ color: tokens.text, fontSize: 18, fontWeight: '800' }}>₹3.00/day</Text>
        <ProgressBar value={62} color="primary" />
      </Card>

      <Card grad="green">
        <Text style={[styles.label, { color: tokens.textFaint }]}>Status pills</Text>
        <View style={styles.wrapRow}>
          {STATUSES.map((status) => (
            <StatusPill key={status} status={status} />
          ))}
        </View>
      </Card>

      <Card>
        <Text style={[styles.label, { color: tokens.textFaint }]}>PillButton variants</Text>
        <PillButton full>Get started</PillButton>
        <View style={styles.gap8}>
          <PillButton variant="green" size="md">
            Confirm payment
          </PillButton>
          <PillButton variant="outline" size="md">
            Cancel
          </PillButton>
          <PillButton variant="danger" size="sm">
            Close loan
          </PillButton>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 20, paddingTop: 56, gap: 16, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 2 },
  meta: { fontSize: 12, marginTop: 4 },
  label: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  gap8: { gap: 8, marginTop: 10 },
});
