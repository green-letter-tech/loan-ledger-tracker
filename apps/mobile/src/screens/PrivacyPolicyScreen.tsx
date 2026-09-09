import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  PRIVACY_POLICY_LAST_UPDATED,
  PRIVACY_POLICY_SECTIONS,
} from '../content/privacyPolicy';
import { useTheme } from '../hooks/useTheme';
import type { RootStackScreenProps } from '../navigation/types';

export function PrivacyPolicyScreen(_props: RootStackScreenProps<'PrivacyPolicy'>) {
  const { resolvedTheme, tokens } = useTheme();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: tokens.bg }]} edges={['bottom']}>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.updated, { color: tokens.textFaint }]}>
          Last updated {PRIVACY_POLICY_LAST_UPDATED}
        </Text>

        {PRIVACY_POLICY_SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: tokens.text }]}>{section.title}</Text>
            <Text style={[styles.sectionBody, { color: tokens.textSoft }]}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 20,
  },
  updated: {
    fontSize: 13,
    fontWeight: '500',
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  sectionBody: {
    fontSize: 14,
    lineHeight: 22,
  },
});
