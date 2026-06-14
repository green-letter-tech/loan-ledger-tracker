import { Ionicons } from '@expo/vector-icons';
import type { ReminderFrequency } from '@lendledger/core';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BottomActionBar } from '../../components/BottomActionBar';
import { Card, PillButton, Toggle } from '../../components/ui';
import { REMINDER_FREQUENCY_OPTIONS } from '../../constants/reminders';
import { useTheme } from '../../hooks/useTheme';
import { formatReminderTime24To12 } from '../../utils/reminderTime';

interface OnboardingRemindersStepProps {
  remindersEnabled: boolean;
  frequency: ReminderFrequency;
  reminderTimes: string[];
  saving: boolean;
  error: string | null;
  onRemindersEnabledChange: (value: boolean) => void;
  onFrequencyChange: (value: ReminderFrequency) => void;
  onAddTime: () => void;
  onRemoveTime: (index: number) => void;
  onBack: () => void;
  onComplete: () => void;
}

export function OnboardingRemindersStep({
  remindersEnabled,
  frequency,
  reminderTimes,
  saving,
  error,
  onRemindersEnabledChange,
  onFrequencyChange,
  onAddTime,
  onRemoveTime,
  onBack,
  onComplete,
}: OnboardingRemindersStepProps) {
  const { tokens } = useTheme();

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable
          onPress={onBack}
          style={[
            styles.backButton,
            {
              backgroundColor: tokens.surface,
              borderColor: tokens.borderSoft,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Ionicons name="chevron-back" size={21} color={tokens.text} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[tokens.surface, tokens.blueTint]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.bellIcon, { borderColor: tokens.borderSoft }]}
        >
          <Ionicons name="notifications-outline" size={28} color={tokens.blue} />
        </LinearGradient>

        <Text style={[styles.title, { color: tokens.text }]}>Stay on top of collections</Text>
        <Text style={[styles.subtitle, { color: tokens.textSoft }]}>
          Get a daily nudge to log who paid. You can change this anytime in Settings.
        </Text>

        <Card pad={16}>
          <View style={styles.cardContent}>
          <View style={styles.toggleRow}>
            <View>
              <Text style={[styles.toggleTitle, { color: tokens.text }]}>Enable reminders</Text>
              <Text style={[styles.toggleHint, { color: tokens.textFaint }]}>Recommended</Text>
            </View>
            <Toggle on={remindersEnabled} onChange={onRemindersEnabledChange} />
          </View>

          <View
            style={[styles.reminderOptions, { opacity: remindersEnabled ? 1 : 0.4 }]}
            pointerEvents={remindersEnabled ? 'auto' : 'none'}
          >
            <View>
              <Text style={[styles.sectionLabel, { color: tokens.textSoft }]}>Frequency</Text>
              <View style={styles.frequencyGrid}>
                {REMINDER_FREQUENCY_OPTIONS.map((option) => {
                  const selected = frequency === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => onFrequencyChange(option.value)}
                      style={[
                        styles.frequencyButton,
                        {
                          borderColor: selected ? tokens.blue : tokens.border,
                          backgroundColor: selected ? tokens.blueTint : tokens.surface,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.frequencyLabel,
                          { color: selected ? tokens.blue : tokens.textSoft },
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View>
              <Text style={[styles.sectionLabel, { color: tokens.textSoft }]}>Reminder time</Text>
              <View style={styles.timeList}>
                {reminderTimes.map((time, index) => (
                  <View
                    key={`${time}-${index}`}
                    style={[styles.timeRow, { backgroundColor: tokens.surfaceSunken }]}
                  >
                    <Ionicons name="time-outline" size={18} color={tokens.blue} />
                    <Text style={[styles.timeText, { color: tokens.text }]}>
                      {formatReminderTime24To12(time)}
                    </Text>
                    {reminderTimes.length > 1 ? (
                      <Pressable
                        onPress={() => onRemoveTime(index)}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel="Remove reminder time"
                      >
                        <Ionicons name="close" size={16} color={tokens.textFaint} />
                      </Pressable>
                    ) : null}
                  </View>
                ))}
              </View>
              <Pressable onPress={onAddTime} style={styles.addTimeButton}>
                <Ionicons name="add" size={17} color={tokens.blue} />
                <Text style={[styles.addTimeLabel, { color: tokens.blue }]}>Add another time</Text>
              </Pressable>
            </View>
          </View>
          </View>
        </Card>

        {error ? <Text style={[styles.error, { color: tokens.red }]}>{error}</Text> : null}
      </ScrollView>

      <BottomActionBar>
        <PillButton variant="primary" full onPress={onComplete} disabled={saving}>
          {saving ? 'Saving…' : 'Continue to dashboard'}
        </PillButton>
      </BottomActionBar>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 14,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 8,
  },
  bellIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 14.5,
    lineHeight: 22,
    marginBottom: 14,
  },
  cardContent: {
    gap: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  toggleHint: {
    fontSize: 12.5,
    marginTop: 2,
  },
  reminderOptions: {
    gap: 14,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  frequencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  frequencyButton: {
    width: '48%',
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  frequencyLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  timeList: {
    gap: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  timeText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  addTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 10,
  },
  addTimeLabel: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  error: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
