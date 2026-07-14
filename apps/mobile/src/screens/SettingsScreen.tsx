import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import type { ReminderFrequency, ThemeSetting } from '@lendledger/core';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SegmentedControl } from '../components/SegmentedControl';
import { ReminderTimeList } from '../components/reminders/ReminderTimeList';
import { TabScreenLayout } from '../components/TabScreenLayout';
import { Card, Logo, Toggle } from '../components/ui';
import { REMINDER_FREQUENCY_OPTIONS } from '../constants/reminders';
import { useRepository } from '../context/AppProvider';
import { useTheme } from '../hooks/useTheme';
import type { TabScreenProps } from '../navigation/types';
import { ensureNotificationPermissions, syncReminders } from '../services/reminders';
import { showAlert } from '../utils/confirmAction';
import type { ThemePreference } from '../theme/types';

const THEME_OPTIONS: ReadonlyArray<{ label: string; value: ThemePreference }> = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'system' },
];

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';
const SETTINGS_EXTRA_TIME = '09:00';

export function SettingsScreen({ navigation }: TabScreenProps<'Settings'>) {
  const { tokens, themePreference, setThemePreference } = useTheme();
  const repository = useRepository();

  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [frequency, setFrequency] = useState<ReminderFrequency>('once_daily');
  const [reminderTimes, setReminderTimes] = useState<string[]>(['19:00']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    repository
      .getSettings()
      .then((settings) => {
        setRemindersEnabled(settings.remindersEnabled);
        setFrequency(settings.reminderFrequency);
        setReminderTimes(settings.reminderTimes);
      })
      .finally(() => setLoading(false));
  }, [repository]);

  const persistSettings = useCallback(
    async (patch: Parameters<typeof repository.updateSettings>[0]) => {
      return repository.updateSettings(patch);
    },
    [repository],
  );

  const syncReminderSchedule = useCallback(
    async (settings: Awaited<ReturnType<typeof repository.updateSettings>>) => {
      const result = await syncReminders({
        remindersEnabled: settings.remindersEnabled,
        reminderFrequency: settings.reminderFrequency,
        reminderTimes: settings.reminderTimes,
      });

      if (result.permissionDenied) {
        const disabled = await repository.updateSettings({ remindersEnabled: false });
        setRemindersEnabled(false);
        showAlert(
          'Notifications blocked',
          'Enable notifications in system settings to use daily reminders.',
        );
        return disabled;
      }

      return settings;
    },
    [repository],
  );

  const persistAndSyncReminders = useCallback(
    async (patch: Parameters<typeof repository.updateSettings>[0]) => {
      const updated = await persistSettings(patch);
      setRemindersEnabled(updated.remindersEnabled);
      setFrequency(updated.reminderFrequency);
      setReminderTimes(updated.reminderTimes);
      await syncReminderSchedule(updated);
      return updated;
    },
    [persistSettings, syncReminderSchedule],
  );

  const handleThemeChange = useCallback(
    async (preference: ThemePreference) => {
      setThemePreference(preference);
      await persistSettings({ theme: preference as ThemeSetting });
    },
    [persistSettings, setThemePreference],
  );

  const handleRemindersEnabled = useCallback(
    async (enabled: boolean) => {
      if (enabled) {
        const granted = await ensureNotificationPermissions();
        if (!granted) {
          showAlert(
            'Notifications blocked',
            'Allow notifications to enable daily collection reminders.',
          );
          return;
        }
      }

      setRemindersEnabled(enabled);
      await persistAndSyncReminders({ remindersEnabled: enabled });
    },
    [persistAndSyncReminders],
  );

  const handleFrequencyChange = useCallback(
    async (value: ReminderFrequency) => {
      setFrequency(value);
      await persistAndSyncReminders({ reminderFrequency: value });
    },
    [persistAndSyncReminders],
  );

  const handleAddTime = useCallback(async () => {
    const next = [...reminderTimes, SETTINGS_EXTRA_TIME];
    setReminderTimes(next);
    await persistAndSyncReminders({ reminderTimes: next });
  }, [persistAndSyncReminders, reminderTimes]);

  const handleChangeTime = useCallback(
    async (index: number, time24: string) => {
      const next = reminderTimes.map((time, i) => (i === index ? time24 : time));
      setReminderTimes(next);
      await persistAndSyncReminders({ reminderTimes: next });
    },
    [persistAndSyncReminders, reminderTimes],
  );

  const handleRemoveTime = useCallback(
    async (index: number) => {
      if (reminderTimes.length <= 1) {
        return;
      }
      const next = reminderTimes.filter((_, i) => i !== index);
      setReminderTimes(next);
      await persistAndSyncReminders({ reminderTimes: next });
    },
    [persistAndSyncReminders, reminderTimes],
  );

  return (
    <TabScreenLayout title="Settings">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SettingsSection label="Appearance">
          <Card pad={16}>
            <SettingRow
              icon="sunny-outline"
              iconBg={tokens.amberTint}
              iconColor={tokens.amber}
              title="Theme"
              subtitle="Choose how LendLedger looks"
            />
            <SegmentedControl
              options={THEME_OPTIONS}
              value={themePreference}
              onChange={handleThemeChange}
            />
          </Card>
        </SettingsSection>

        <SettingsSection label="Reminders">
          <Card pad={0}>
            <View style={styles.cardInner}>
              <SettingRow
                icon="notifications-outline"
                iconBg={tokens.blueTint}
                iconColor={tokens.blue}
                title="Enable reminders"
                subtitle="Daily nudge to log collections"
                right={<Toggle on={remindersEnabled} onChange={handleRemindersEnabled} />}
                pad
              />

              <View
                style={[styles.reminderFields, { opacity: remindersEnabled ? 1 : 0.4 }]}
                pointerEvents={remindersEnabled ? 'auto' : 'none'}
              >
                <SettingRow
                  icon="time-outline"
                  iconBg={tokens.greenTint}
                  iconColor={tokens.green}
                  title="Frequency"
                  pad
                  right={
                    <Text style={[styles.frequencyValue, { color: tokens.textSoft }]}>
                      {REMINDER_FREQUENCY_OPTIONS.find((o) => o.value === frequency)?.label}
                    </Text>
                  }
                />
                <View style={[styles.frequencyGrid, { paddingHorizontal: 16 }]}>
                  {REMINDER_FREQUENCY_OPTIONS.map((option) => {
                    const selected = frequency === option.value;
                    return (
                      <Pressable
                        key={option.value}
                        onPress={() => handleFrequencyChange(option.value)}
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

                <View style={styles.timesBlock}>
                  <Text style={[styles.timesLabel, { color: tokens.textSoft }]}>
                    Notification times
                  </Text>
                  {loading ? null : (
                    <ReminderTimeList
                      times={reminderTimes}
                      onChangeTime={handleChangeTime}
                      onAddTime={handleAddTime}
                      onRemoveTime={handleRemoveTime}
                    />
                  )}
                </View>
              </View>
            </View>
          </Card>
        </SettingsSection>

        <SettingsSection label="About">
          <Card pad={0}>
            <SettingRow
              icon="information-circle-outline"
              title="App version"
              pad
              right={
                <Text style={[styles.version, { color: tokens.textFaint }]}>{APP_VERSION}</Text>
              }
            />
            <SettingRow
              icon="shield-checkmark-outline"
              title="Privacy policy"
              pad
              onPress={() => navigation.navigate('PrivacyPolicy')}
              right={<Ionicons name="chevron-forward" size={18} color={tokens.textFaint} />}
            />
            <View style={[styles.localDataRow, { borderTopColor: tokens.borderSoft }]}>
              <Ionicons name="phone-portrait-outline" size={15} color={tokens.green} />
              <Text style={[styles.localDataText, { color: tokens.textFaint }]}>
                All data is stored on this device.
              </Text>
            </View>
          </Card>
        </SettingsSection>

        <View style={styles.footer}>
          <Logo size={34} />
          <Text style={[styles.footerText, { color: tokens.textFaint }]}>
            LendLedger · Made for daily lenders
          </Text>
        </View>
      </ScrollView>
    </TabScreenLayout>
  );
}

function SettingsSection({ label, children }: { label: string; children: ReactNode }) {
  const { tokens } = useTheme();

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionLabel, { color: tokens.textFaint }]}>{label.toUpperCase()}</Text>
      {children}
    </View>
  );
}

interface SettingRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg?: string;
  iconColor?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  pad?: boolean;
  onPress?: () => void;
}

function SettingRow({
  icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  right,
  pad = false,
  onPress,
}: SettingRowProps) {
  const { tokens } = useTheme();
  const content = (
    <View style={[styles.settingRow, pad && styles.settingRowPad]}>
      {iconBg ? (
        <View style={[styles.settingIcon, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={18} color={iconColor ?? tokens.text} />
        </View>
      ) : (
        <Ionicons name={icon} size={18} color={tokens.textSoft} style={styles.settingIconPlain} />
      )}
      <View style={styles.settingText}>
        <Text style={[styles.settingTitle, { color: tokens.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.settingSubtitle, { color: tokens.textFaint }]}>{subtitle}</Text>
        ) : null}
      </View>
      {right}
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }
  return content;
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 22,
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.8,
    paddingHorizontal: 4,
  },
  cardInner: {
    gap: 0,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingRowPad: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingIconPlain: {
    width: 24,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  settingSubtitle: {
    fontSize: 12.5,
    marginTop: 2,
  },
  reminderFields: {
    gap: 4,
    paddingBottom: 12,
  },
  frequencyValue: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  frequencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 8,
  },
  frequencyButton: {
    width: '48%',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  frequencyLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  timesBlock: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  timesLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    marginBottom: 8,
  },
  version: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  localDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  localDataText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    gap: 9,
    paddingVertical: 6,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
