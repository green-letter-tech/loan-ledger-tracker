import type { ReminderFrequency } from '@lendledger/core';
import { CommonActions } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DEFAULT_REMINDER_TIMES } from '../constants/reminders';
import { useRepository } from '../context/AppProvider';
import { useTheme } from '../hooks/useTheme';
import type { RootStackScreenProps } from '../navigation/types';
import { OnboardingRemindersStep } from './onboarding/OnboardingRemindersStep';
import { OnboardingWelcomeStep } from './onboarding/OnboardingWelcomeStep';

const EXTRA_DEFAULT_TIME = '09:00';

export function OnboardingScreen({ navigation }: RootStackScreenProps<'Onboarding'>) {
  const { resolvedTheme, tokens } = useTheme();
  const repository = useRepository();

  const [step, setStep] = useState(0);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [frequency, setFrequency] = useState<ReminderFrequency>('once_daily');
  const [reminderTimes, setReminderTimes] = useState<string[]>([...DEFAULT_REMINDER_TIMES]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddTime = useCallback(() => {
    setReminderTimes((current) => {
      if (current.includes(EXTRA_DEFAULT_TIME)) {
        return current;
      }
      return [...current, EXTRA_DEFAULT_TIME];
    });
  }, []);

  const handleRemoveTime = useCallback((index: number) => {
    setReminderTimes((current) => current.filter((_, i) => i !== index));
  }, []);

  const handleComplete = useCallback(async () => {
    setSaving(true);
    setError(null);

    try {
      await repository.updateSettings({
        remindersEnabled,
        reminderFrequency: frequency,
        reminderTimes,
        onboarded: true,
      });

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        }),
      );
    } catch (caught: unknown) {
      const message =
        caught instanceof Error ? caught.message : 'Could not save onboarding settings';
      setError(message);
    } finally {
      setSaving(false);
    }
  }, [repository, remindersEnabled, frequency, reminderTimes, navigation]);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: tokens.bg }]} edges={['top', 'bottom']}>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
      {step === 0 ? (
        <OnboardingWelcomeStep onContinue={() => setStep(1)} />
      ) : (
        <OnboardingRemindersStep
          remindersEnabled={remindersEnabled}
          frequency={frequency}
          reminderTimes={reminderTimes}
          saving={saving}
          error={error}
          onRemindersEnabledChange={setRemindersEnabled}
          onFrequencyChange={setFrequency}
          onAddTime={handleAddTime}
          onRemoveTime={handleRemoveTime}
          onBack={() => setStep(0)}
          onComplete={handleComplete}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
